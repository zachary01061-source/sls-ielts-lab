/** Self-recorded dictation stays separate from assessed skill evidence. */
export function summarizeDictation(profile, {start, end} = {}) {
  const from=Date.parse(`${start}T00:00:00+08:00`),to=Date.parse(`${end}T23:59:59.999+08:00`);
  const rows=[];
  for(const [resourceId,track] of Object.entries(profile?.ui?.corpus||{})) {
    if(!track||typeof track!=='object')continue;
    for(const [field,kind] of [['first','首听'],['retests','复听']]) {
      for(const entry of Array.isArray(track[field])?track[field]:[]) {
        if(!entry||typeof entry!=='object')continue;
        const at=Number(entry.finishedAt||entry.createdAt||entry.updatedAt||entry.at);
        if(!Number.isFinite(at)||at<from||at>to)continue;
        const correct=Number(entry.correct),total=Number(entry.total);
        if(!Number.isInteger(correct)||!Number.isInteger(total)||correct<0||total<1||correct>total)continue;
        rows.push({resourceId,title:String(entry.title||track.title||resourceId),kind,at,correct,total});
      }
    }
  }
  rows.sort((a,b)=>b.at-a.at);
  return {selfRecorded:true,sessions:rows.length,tracks:new Set(rows.map(r=>r.resourceId)).size,rows};
}
