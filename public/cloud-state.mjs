/** Serial, optimistic cloud saves. Conflicts never overwrite another device. */
export function createCloudState({client, read, onStatus = () => {}}) {
  let owner = null, version = 0, revision = 0, savedRevision = 0;
  let timer = null, running = null, stopped = false, generation = 0;
  const dirty = () => revision !== savedRevision;
  function status(value, error) { onStatus({value, dirty:dirty(), error}); }
  async function flush() {
    clearTimeout(timer);
    if (running) { await running; if (dirty()) return flush(); return; }
    if (!owner || !dirty()) return;
    if (stopped) throw new Error('云端记录已更新。请先导出当前作答，再重新载入。');
    const expectedOwner = owner;
    const expectedGeneration = generation;
    if (client.user?.id !== expectedOwner) throw new Error('登录状态已变化，请先保存当前作答副本。');
    running = (async () => {
      while (dirty() && owner === expectedOwner && generation === expectedGeneration) {
        if (client.user?.id !== expectedOwner) {
          const error = new Error('登录状态已变化，请先保存当前作答副本。');
          status('error', error);
          throw error;
        }
        const sending = revision;
        const snapshot = structuredClone(read());
        status('saving');
        try {
          const result = await client.saveState(snapshot, version);
          if (owner !== expectedOwner || generation !== expectedGeneration) return;
          version = result.version;
          savedRevision = sending;
          status(dirty() ? 'saving' : 'saved');
        } catch (error) {
          if (owner !== expectedOwner || generation !== expectedGeneration) return;
          if (error.status === 409) stopped = true;
          status(error.status === 409 ? 'conflict' : 'error', error);
          throw error;
        }
      }
    })();
    try { await running; } finally { running = null; }
  }
  return {
    attach(userId, cloudVersion = 0) {
      clearTimeout(timer); generation++; owner = userId; version = cloudVersion;
      revision = savedRevision = 0; stopped = false; status('saved');
    },
    detach() { clearTimeout(timer); generation++; owner = null; revision = savedRevision = 0; stopped = false; },
    mark() {
      if (!owner) return false;
      revision++; status('pending'); clearTimeout(timer);
      if (!stopped) timer = setTimeout(() => flush().catch(() => {}), 700);
      return true;
    },
    flush,
    get dirty() { return dirty(); },
    get version() { return version; },
    get blocked() { return stopped; },
  };
}
