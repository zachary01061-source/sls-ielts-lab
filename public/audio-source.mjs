export const LEGACY_LISTENING_ORIGIN = 'https://sls-reading-zac.b-cdn.net';

/** Existing bank recordings remain on the school's audio origin. */
export function resolveAudioSource(value, baseUrl) {
  if (typeof value !== 'string' || !value) return '';
  try {
    const legacy = /^\/media\/listening\/[A-Za-z0-9_-]+\.mp3$/.test(value);
    const url = new URL(value, legacy ? LEGACY_LISTENING_ORIGIN : baseUrl);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}
