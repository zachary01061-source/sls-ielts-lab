/**
 * One B1-centred entry assessment. Every student receives the same short set;
 * answers select a starting lesson, never another assessment or an IELTS band.
 * The historical module/API names remain for saved links and UI integration.
 */
export const ADAPTIVE_POLICY = Object.freeze({
  version: 2, method: 'b1_entry', targetLevel: 'B1', minAnswered: 6,
  stageThresholds: Object.freeze({supported: 0.4, bridge: 0.65, independent: 0.85}),
});
const ORDER = ['foundation', 'reading', 'listening', 'writing', 'speaking'];
const STAGES = ['foundation', 'supported', 'bridge', 'independent'];
const NAMES = {foundation: '语境理解', reading: '阅读', listening: '听力', writing: '写作', speaking: '口语'};
const STAGE_NAMES = {foundation: '线索辅助', supported: '分段练习', bridge: '完整材料', independent: '独立应用'};
const MANUAL = new Set(['writing', 'speaking']);
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const text = value => typeof value === 'string' ? value.trim() : '';
const copy = value => JSON.parse(JSON.stringify(value));
const normalized = value => String(value ?? '').normalize('NFKC').trim().toLocaleLowerCase('en').replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
const timestamp = value => {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Date.parse(value) : Date.now();
  if (!Number.isFinite(parsed) || parsed < 0) throw new TypeError('测评时间无效。');
  return parsed;
};
const isAnswered = value => Array.isArray(value) ? value.some(item => normalized(item) !== '') : normalized(value) !== '';
const acceptedAnswers = item => Array.isArray(item.answers) ? item.answers : item.answer !== undefined ? [item.answer] : [];
const isScored = item => !MANUAL.has(item.skill) && !item.manual && !item.unscorable && acceptedAnswers(item).length > 0;

function checkSession(session) {
  if (!session || !text(session.id) || !text(session.userId) || !Array.isArray(session.history)) throw new TypeError('测评记录不完整，请重新开始。');
}

/** userId is required: a draft must never silently move between accounts. */
export function createAdaptiveSession({userId, id, now} = {}) {
  if (!text(userId)) throw new TypeError('请先登录，再开始测评。');
  const at = timestamp(now);
  return {version: 2, policyVersion: 2, method: 'b1_entry', id: text(id) || `entry-${encodeURIComponent(userId)}-${at}`, userId: text(userId), startedAt: at, updatedAt: at, finishedAt: null, status: 'in_progress', history: []};
}

/** Older branching drafts restart under the new policy; their work is retained. */
export function migrateAdaptiveSession(session, {userId, now} = {}) {
  checkSession(session);
  if (userId !== undefined && text(userId) !== session.userId) throw new Error('当前账号与测评记录不一致，请重新打开自己的测评。');
  if (session.version === 2 && session.policyVersion === 2 && session.method === 'b1_entry') return {session: copy(session), restarted: false, notice: ''};
  const next = createAdaptiveSession({userId: session.userId, id: `${session.id}-b1`, now: now ?? session.updatedAt ?? session.startedAt});
  next.previousDraft = copy(session);
  const notice = '题目已调整为一套约 B1 难度的测评，请从第一组开始。之前的作答已保留。';
  next.migrationNotice = notice;
  return {session: next, restarted: true, notice};
}
const currentSession = session => migrateAdaptiveSession(session).session;

function poolBlocks(pool) {
  const source = Array.isArray(pool) ? pool : pool?.entryBlocks || pool?.blocks;
  if (!Array.isArray(source)) throw new TypeError('缺少测评题组。');
  // Explicit entry selections also accept the old complete pool for compatibility.
  const selected = [
    ...source.filter(block => block.skill === 'foundation').slice(0, 1),
    ...source.filter(block => block.skill === 'reading' && block.stage === 'supported').slice(0, 2),
    ...source.filter(block => block.skill === 'listening' && block.stage === 'foundation').slice(0, 2),
    ...source.filter(block => MANUAL.has(block.skill)),
  ];
  const manualItems = Array.isArray(pool?.manualItems) ? pool.manualItems : [];
  for (const skill of ['writing', 'speaking']) {
    const items = manualItems.filter(item => item?.skill === skill);
    if (items.length && !selected.some(block => block.skill === skill)) selected.push({id: `adaptive-manual-${skill}`, skill, stage: 'supported', title: `${NAMES[skill]}起点任务`, instructions: '请按题目完成后提交批改。收到结果后，调整这部分的练习。', manual: true, items});
  }
  const ids = new Set(), itemIds = new Set();
  return selected.map(block => {
    if (!text(block.id) || ids.has(block.id) || !ORDER.includes(block.skill) || !STAGES.includes(block.stage)) throw new TypeError('测评题组编号或训练阶段有误。');
    ids.add(block.id);
    const items = (Array.isArray(block.items) ? block.items : []).map(item => {
      if (!item || !text(item.id) || itemIds.has(item.id)) throw new TypeError('题目编号缺失或重复。');
      itemIds.add(item.id);
      return {...item, blockId: block.id, skill: block.skill, stage: block.stage, materialFamilyId: item.materialFamilyId || block.materialFamilyId || block.id, ...(MANUAL.has(block.skill) ? {manual: true} : {})};
    });
    if (!items.length) throw new TypeError('测评题组没有题目。');
    return {...block, assessmentLevel: 'B1-centred', materialFamilyId: block.materialFamilyId || block.id, items};
  }).sort((a, b) => ORDER.indexOf(a.skill) - ORDER.indexOf(b.skill));
}

function blockOutcome(block, answers, audioUnavailable = false) {
  const rows = block.items.map(item => {
    const response = own(answers, item.id) ? answers[item.id] : undefined;
    const answered = isAnswered(response), scored = isScored(item) && !audioUnavailable;
    let correct = false;
    if (scored && answered) {
      if (item.type === 'multi') {
        const actual = Array.isArray(response) ? response.map(normalized).sort() : [];
        const expected = acceptedAnswers(item).map(normalized).sort();
        correct = actual.length === expected.length && actual.every((value, index) => value === expected[index]);
      } else correct = acceptedAnswers(item).some(answer => normalized(answer) === normalized(response));
    }
    return {id: item.id, dimension: item.dimension || item.tag || 'general', scored, answered, correct};
  });
  const scored = rows.filter(row => row.scored), answered = scored.filter(row => row.answered).length;
  const total = scored.length, correct = scored.filter(row => row.correct).length, dimensions = {};
  for (const row of scored) {
    dimensions[row.dimension] ||= {correct: 0, total: 0, answered: 0};
    dimensions[row.dimension].total++;
    dimensions[row.dimension].answered += Number(row.answered);
    dimensions[row.dimension].correct += Number(row.correct);
  }
  return {answered, correct, total, sufficient: total >= 6 && answered === total, dimensions, audioUnavailable,
    manualAnswered: rows.filter(row => !row.scored && row.answered).length,
    outcome: audioUnavailable ? 'audio_unavailable' : MANUAL.has(block.skill) ? 'awaiting_review' : answered ? 'recorded' : 'unanswered'};
}
function recordsFor(session, skill) {
  return session.history.filter(record => record.block.skill === skill).map(record => ({...record, ...blockOutcome(record.block, record.answers, record.audioUnavailable === true)}));
}

/** Always the same fixed order, regardless of grade, goals or previous answers. */
export function nextAdaptiveBlock(input, pool) {
  const migrated = migrateAdaptiveSession(input), session = migrated.session, blocks = poolBlocks(pool);
  const used = new Set(session.history.map(record => record.block.id));
  const block = blocks.find(candidate => !used.has(candidate.id));
  const progress = {completedBlocks: session.history.length, maxBlocks: blocks.length, skillBlockIndex: block ? recordsFor(session, block.skill).length + 1 : 0, maxSkillBlocks: block ? blocks.filter(candidate => candidate.skill === block.skill).length : 0};
  const reason = block ? MANUAL.has(block.skill) ? `完成${NAMES[block.skill]}任务，提交自动批改。` : `${NAMES[block.skill]}第 ${progress.skillBlockIndex} 组，共 ${progress.maxSkillBlocks} 组。按题目要求作答。` : '测评已完成。接下来按学习计划开始练习。';
  return {block: block ? copy(block) : null, reason, complete: !block, progress, ...(migrated.restarted ? {needsRestart: true, migrationNotice: migrated.notice, session} : {})};
}

/** An unavailable recording supplies no evidence about listening ability. */
export function submitAdaptiveBlock(input, blockId, answers, pool, {now, userId, audioUnavailable = false} = {}) {
  const migrated = migrateAdaptiveSession(input, {userId}), session = migrated.session;
  const selected = nextAdaptiveBlock(session, pool);
  if (!selected.block || selected.block.id !== blockId) throw new Error('当前题组已变化，请刷新后继续。');
  if (audioUnavailable && selected.block.skill !== 'listening') throw new Error('只有听力题组可以标记音频未能播放。');
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) throw new TypeError('作答记录格式有误。');
  const cleanAnswers = {};
  for (const item of selected.block.items) {
    if (!own(answers, item.id)) continue;
    const value = answers[item.id];
    if (Array.isArray(value)) {
      if (value.length > 30 || value.some(entry => !['string', 'number', 'boolean'].includes(typeof entry))) throw new TypeError('选项作答格式有误。');
      cleanAnswers[item.id] = value.map(entry => String(entry).slice(0, 1000)).filter(entry => normalized(entry) !== '');
    } else if (['string', 'number', 'boolean'].includes(typeof value)) cleanAnswers[item.id] = String(value).slice(0, 12000);
    else if (value !== undefined && value !== null) throw new TypeError('作答内容格式有误。');
  }
  const unavailable = selected.block.skill === 'listening' && (audioUnavailable || !text(selected.block.audioUrl));
  const next = copy(session), at = Math.max(session.updatedAt, timestamp(now));
  next.updatedAt = at;
  next.history.push({block: selected.block, answers: unavailable ? {} : cleanAnswers, audioUnavailable: unavailable, submittedAt: at, selectionReason: selected.reason});
  if (nextAdaptiveBlock(next, pool).complete) { next.status = 'completed'; next.finishedAt = at; }
  return next;
}

function skillSummary(session, blocks, skill) {
  const records = recordsFor(session, skill), required = blocks.filter(block => block.skill === skill);
  const expectedTotal = required.flatMap(block => block.items).filter(isScored).length;
  const answered = records.reduce((sum, row) => sum + row.answered, 0), correct = records.reduce((sum, row) => sum + row.correct, 0), total = records.reduce((sum, row) => sum + row.total, 0);
  const unavailable = records.some(row => row.audioUnavailable);
  const completed = required.length > 0 && required.every(block => records.some(record => record.block.id === block.id));
  let stage = null, status = answered ? 'insufficient_evidence' : 'not_assessed';
  if (MANUAL.has(skill)) status = records.some(row => row.manualAnswered > 0) ? 'awaiting_review' : 'not_assessed';
  else if (completed && !unavailable && expectedTotal >= 6 && total === expectedTotal && answered >= ADAPTIVE_POLICY.minAnswered) {
    const accuracy = correct / total;
    stage = skill === 'foundation' ? 'foundation' : accuracy < .4 ? 'foundation' : accuracy < .65 ? 'supported' : accuracy < .85 ? 'bridge' : 'independent';
    status = 'starting_point';
  }
  const dimensions = {};
  for (const record of records) for (const [dimension, counts] of Object.entries(record.dimensions)) {
    dimensions[dimension] ||= {correct: 0, total: 0, answered: 0};
    for (const key of ['correct', 'total', 'answered']) dimensions[dimension][key] += counts[key];
  }
  const reason = MANUAL.has(skill) ? status === 'awaiting_review' ? `${NAMES[skill]}已提交，批改完成后调整练习。` : `本次没有提交${NAMES[skill]}作品；完成任务后可以查看具体批改。` : stage ? `本次${NAMES[skill]}答对 ${correct}/${total}，先安排${STAGE_NAMES[stage]}。后续根据练习调整。` : unavailable ? '本次音频未能播放，听力未计分；本轮计划依据已完成的其他项目安排。' : `本次${NAMES[skill]}已答 ${answered}/${expectedTotal} 题；未答题单独记录，本轮按已提交的作答选择练习。`;
  return {status, stage, starterStage: stage || 'foundation', provisional: true, answered, correct, total, expectedTotal, completed, dimensions, needsConfirmation: false, reason,
    blocks: records.map(row => ({blockId: row.block.id, itemIds: row.block.items.map(item => item.id), skill, stage: row.block.stage, materialFamilyId: row.block.materialFamilyId, answered: row.answered, correct: row.correct, total: row.total, sufficient: row.sufficient, outcome: row.outcome, dimensions: row.dimensions, audioUnavailable: row.audioUnavailable, submittedAt: row.submittedAt}))};
}

/** Feed items/answers to scoreDiagnostic with this result as its context. */
export function adaptiveResult(input, pool) {
  const session = currentSession(input), blocks = poolBlocks(pool), complete = nextAdaptiveBlock(session, pool).complete;
  const items = [], answers = {};
  for (const record of session.history) {
    for (const item of record.block.items) items.push({...copy(item), ...(record.audioUnavailable ? {unscorable: true} : {})});
    if (!record.audioUnavailable) Object.assign(answers, copy(record.answers));
  }
  return {id: session.id, userId: session.userId, kind: 'adaptive_diagnostic', startedAt: session.startedAt, finishedAt: complete ? session.finishedAt ?? session.updatedAt : null, complete, items, answers,
    adaptive: {version: 2, method: 'b1_entry', complete, policy: copy(ADAPTIVE_POLICY), skills: Object.fromEntries(ORDER.map(skill => [skill, skillSummary(session, blocks, skill)])), notice: '本套题目以 B1 左右的难度安排，用于确定学习起点，不换算雅思分数。完成后直接进入学习计划。'}};
}
