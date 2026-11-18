const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rows = value => Array.isArray(value) ? value.filter(row => row && typeof row === 'object') : [];

export const IELTS_CRITERIA = Object.freeze({
  TR:{id:'task',label:'写作任务回应情况',description:'是否回应题目要求，观点是否清楚，理由和例子能否支持观点。'},
  TA:{id:'task',label:'写作任务完成情况',description:'是否准确概括给定信息，选择关键特点并进行比较。'},
  CC:{id:'coherence',label:'连贯与衔接',description:'意思之间是否连贯，信息顺序和连接方式是否清楚。'},
  LR:{id:'vocabulary',label:'词汇丰富程度',description:'用词是否准确，搭配是否自然，能否灵活表达意思。'},
  GRA:{id:'grammar',label:'语法多样性及准确性',description:'句式是否恰当，语法是否准确，能否清楚表达句子之间的关系。'},
  FC:{id:'fluency',label:'流利性与连贯性',description:'回答能否连续展开，停顿、重复和衔接是否影响理解。'},
  P:{id:'pronunciation',label:'发音',description:'发音、重音、节奏和语调是否影响理解。'}
});

export function criterionInfo(row = {}, skill = 'writing') {
  const inferred = {task:'TR',coherence:'CC',vocabulary:'LR',grammar:'GRA',fluency:'FC',pronunciation:'P'}[row.id];
  const code = Object.hasOwn(IELTS_CRITERIA,row.code) ? row.code : inferred;
  return {code:code || '',label:IELTS_CRITERIA[code]?.label || row.label || row.id || '本题观察',id:row.id || IELTS_CRITERIA[code]?.id || ''};
}

/** Display guidance only. Actual grading always uses the server's task rubric. */
export function rubricForWorkUnit(unit = {}, skill = unit.skill) {
  if(unit.gradingRubric?.framework==='ielts' && rows(unit.gradingRubric.criteria).length===4)return unit.gradingRubric;
  const codes=skill==='speaking'?['FC','LR','GRA','P']:['w6','w9'].includes(unit.id)?['TA','CC','LR','GRA']:['TR','CC','LR','GRA'];
  return {framework:'ielts',taskType:skill==='writing'&&unit.id==='w9'?'writing_task1_academic':skill==='writing'&&['w10','w11','w12'].includes(unit.id)?'writing_task2':'skill_practice',criteria:codes.map(code=>({code,id:IELTS_CRITERIA[code].id,label:IELTS_CRITERIA[code].label,weight:.25}))};
}

export function renderTaskRubric(unit = {}, skill = unit.skill, {selfCheck=false} = {}) {
  if(!['writing','speaking'].includes(skill))return '';
  const rubric=rubricForWorkUnit(unit,skill),criteria=rows(rubric.criteria);
  const scope=skill==='speaking'?'按本题要求检查回答；流利度与发音以录音为准。':({word:'按本题要求检查词义、搭配和拼写；不要求写成作文。',sentence:'检查本题要求的句子；不要求引言、主体段或结论。',paragraph:'检查本题要求的段落与展开；不要求写成完整作文。',reasoning:'检查观点、理由、例子之间的联系，按本题要求展开。',fulltask:'按本题要求检查全文结构、内容和表达。'}[unit.progression]||'按本题要求检查作答范围和表达。');
  return `<section class="g-rubric-overview"><h3>${selfCheck?'本次练习怎样自查':'本次批改看什么'}</h3><p>${esc(scope)}</p><div class="g-rubric-cards">${criteria.map(row=>{const item=criterionInfo(row,skill),description=IELTS_CRITERIA[item.code]?.description||row.description||'';return `<article><h4><span>${esc(item.code)}</span>${esc(item.label)}</h4><p>${esc(description)}</p></article>`;}).join('')}</div></section>`;
}

/** Never infer an IELTS band from the local 1–4 observations or legacy estimates. */
export function reviewReferenceScore(submission = {}, review = {}) {
  const reference=review.referenceScore;
  if(submission.skill!=='writing'||reference?.available!==true||reference.official!==false||reference.calibrated!==false)return null;
  const first=reference.taskType==='writing_task2'?'TR':reference.taskType==='writing_task1_academic'?'TA':null;
  if(!first||!Number.isFinite(reference.taskBand)||reference.taskBand<1||reference.taskBand>9||!Number.isInteger(reference.taskBand*2)||!Number.isFinite(reference.meanBand)||reference.meanBand<1||reference.meanBand>9)return null;
  const expected=[first,'CC','LR','GRA'],criteria=rows(reference.criteria),dimensions=rows(review.dimensions);
  if(criteria.length!==4||new Set(criteria.map(row=>row.code)).size!==4)return null;
  for(const code of expected){
    const criterion=criteria.find(row=>row.code===code),dimension=dimensions.find(row=>criterionInfo(row,'writing').code===code);
    if(!criterion||!Number.isInteger(criterion.band)||criterion.band<1||criterion.band>9||criterion.weight!==.25||!dimension||dimension.band!==criterion.band||typeof dimension.comment!=='string'||!dimension.comment.trim()||!rows(dimension.evidence).some(item=>typeof item.quote==='string'&&item.quote.trim()))return null;
  }
  return {...reference,criteria:expected.map(code=>({...criteria.find(row=>row.code===code),...criterionInfo({code},'writing')})),taskLabel:first==='TA'?'Task 1练习':'Task 2练习'};
}
