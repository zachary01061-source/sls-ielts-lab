/** Merge only server-owned feedback; never replace a student's unsaved drafts. */
export function mergeReviewState(local = {}, remote = {}) {
  const own = (row,key) => Object.prototype.hasOwnProperty.call(row,key);
  const reviews = (Array.isArray(remote.evidence) ? remote.evidence : []).filter(row => row?.id && (own(row,'teacherReview') || own(row,'machineReview')));
  const ids = new Set(reviews.map(row=>row.id));
  return {...local,
    evidence:[...(Array.isArray(local.evidence)?local.evidence:[]).filter(row=>!ids.has(row.id)),...structuredClone(reviews)],
    bandAssessments:Array.isArray(remote.bandAssessments)?structuredClone(remote.bandAssessments):local.bandAssessments,
  };
}
