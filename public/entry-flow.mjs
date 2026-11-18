/** First-use navigation only. API authorization stays on the server. */
export function hasCompletedStartingAssessment(profile = {}) {
  return (Array.isArray(profile.diagnostics) ? profile.diagnostics : []).some(row => {
    if (!row || !Number.isFinite(Number(row.finishedAt)) || Number(row.finishedAt) <= 0) return false;
    if (row.kind === 'adaptive_diagnostic') return row.adaptive?.complete === true;
    return row.kind === 'ability_diagnostic' && Array.isArray(row.results) && row.results.some(item => item.answered === true) && !row.checkId;
  });
}

export function resolveEntryRoute(user, profile, requested = '') {
  const route = String(requested).replace(/^#/, '');
  if (!user) return route === 'register' ? 'register' : 'login';
  if (user.status !== 'active') return 'account';
  if (user.role === 'admin') return !route || route === 'login' || route === 'register' ? 'admin' : route;
  if (!hasCompletedStartingAssessment(profile)) return route === 'account' ? 'account' : 'diagnostic';
  return !route || route === 'login' || route === 'register' ? 'growth' : route;
}

const PRACTICE_ROUTES = new Set(['overview','library','listening','cambridge','speaking','writing','corpus','mock','records','manage','exam','result','practice','foundation','report','textbook','textbooks']);

export function resolvePracticeRoute(requested = '') {
  const route = String(requested).replace(/^#/, '');
  const [section, volume] = route.split('/');
  if (section === 'cambridge' && volume && (!/^\d+$/.test(volume) || Number(volume) < 5 || Number(volume) > 20)) return 'cambridge';
  return PRACTICE_ROUTES.has(section) ? route : 'overview';
}
