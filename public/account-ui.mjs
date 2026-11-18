import {buildPersonalPath,createGrowthProfile,STAGES,SKILL_NAMES} from './growth-engine.mjs';
import {learningMaterials,confirmationChecks,dimensionNames} from './learning-path-catalog.mjs';
import {diagnosticItems} from './growth-content.mjs';
import {adaptiveBlocks,adaptiveManualItems} from './adaptive-content.mjs';
import {grade,TYPE_NAMES} from './core.mjs';
import {summarizeDictation} from './corpus-report.mjs';
import {normalizeAnswerFeedback,renderAnswerFeedback} from './answer-feedback.mjs';
import {criterionInfo,reviewReferenceScore} from './grading-rubric-ui.mjs';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=value=>value&&Number.isFinite(new Date(value).getTime())?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value)):'—';
const statusName={active:'已开通',pending:'待审核',suspended:'已停用',submitted:'已提交',reviewed:'教师已复核'};
const skillName=SKILL_NAMES;
const stageNames=Object.fromEntries(STAGES.map(stage=>[stage.id,stage.name]));
function rubricSummary(rubric={}){return Object.entries(rubric).filter(([key,value])=>!['stage','independent','unseen','readyForNextStage'].includes(key)&&value!=null).map(([key,value])=>`${esc(key)}：${esc(value)}`).concat(rubric.stage&&stageNames[rubric.stage]?[`训练阶段：${stageNames[rubric.stage]}`]:[],rubric.independent===true?['本次独立完成']:[],rubric.unseen===true?['使用新材料']:[],rubric.readyForNextStage===true?['老师确认已达到下一阶段要求']:[]).join(' · ');}
const badge=status=>`<span class="account-status ${esc(status)}">${esc(statusName[status]||status)}</span>`;
const field=(name,label,value='',options={})=>`<label class="account-field">${label}<input name="${name}" value="${esc(value)}" ${options.type?`type="${options.type}"`:''} ${options.required===false?'':'required'} ${options.extra||''}>${options.hint?`<small>${options.hint}</small>`:''}</label>`;
const gradeSelect=(value='')=>`<label class="account-field">年级<select name="grade"><option value="">请选择</option>${['高一','高二','高三','其他'].map(v=>`<option ${v===value?'selected':''}>${v}</option>`).join('')}</select><small>年级用于班级管理；练习安排参考测评结果和作答记录。</small></label>`;
const errorBox=()=>'<div class="account-error" role="alert" tabindex="-1"></div>';
const bandField=(name,label)=>`<label class="account-field">${label}<select name="${name}"><option value="">未登记</option>${Array.from({length:17},(_,i)=>1+i/2).map(n=>`<option value="${n}">${n.toFixed(1)}</option>`).join('')}</select></label>`;
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function assessmentHistory(rows=[],studentId=''){return rows.length?`<div class="account-table-wrap"><table class="account-table"><thead><tr><th>测评日期 / 来源</th><th>总分</th><th>听力</th><th>阅读</th><th>写作</th><th>口语</th><th>备注</th><th>状态</th></tr></thead><tbody>${[...rows].sort((a,b)=>new Date(b.assessedAt)-new Date(a.assessedAt)).map(a=>{const bands=a.skills||a.bands||{};return `<tr><td><strong>${date(a.assessedAt)}</strong><small>${a.source==='official'||a.kind==='official'?'已核实正式成绩':'教师确认模拟成绩'}${a.reviewerName?' · '+esc(a.reviewerName):''}</small></td><td>${esc(a.overall??'—')}</td>${['listening','reading','writing','speaking'].map(k=>`<td>${esc(bands[k]??'—')}</td>`).join('')}<td>${esc(a.note||'—')}</td><td>${a.voided?'<span class="account-status suspended">已作废</span>':`<button class="btn secondary small" data-account-action="assessment-void" data-id="${esc(a.id)}" data-student="${esc(studentId)}">作废误录成绩</button>`}</td></tr>`;}).join('')}</tbody></table></div>`:empty('尚未登记核实成绩','登记后，学生可在个人目标中查看是否达成。');}
function assessmentForm(studentId,rows=[]){return `<section class="wide account-assessment-panel"><h3>核实成绩与目标达成</h3><p class="account-footnote">完成模拟考试并由教师确认，或核对正式成绩单后，再登记成绩。单篇练习正确率不直接换算成雅思分数。</p><form class="account-form" data-account-form="assessment" data-id="${esc(studentId)}"><div class="account-pair"><label class="account-field">成绩来源<select name="source" required><option value="">请选择核实来源</option><option value="teacher">教师确认的模拟考试</option><option value="official">已核实的正式考试成绩</option></select></label>${field('assessedAt','考试 / 测评日期','',{type:'date',extra:`max="${today()}"`})}</div><div class="account-band-fields">${bandField('overall','总分')}${bandField('listening','听力')}${bandField('reading','阅读')}${bandField('writing','写作')}${bandField('speaking','口语')}</div><label class="account-field">核实说明<textarea name="note" maxlength="500" placeholder="例如：校内完整模考，听读已核对答案，写作和口语由任课教师评分。"></textarea></label><label class="account-check"><input type="checkbox" name="confirmed" required><span>我已核对成绩来源和分数，确认这不是学生自行估分或单篇练习换算的分数。</span></label>${errorBox()}<div class="account-actions"><button class="btn primary" type="submit">登记核实成绩</button><span class="account-footnote">没有核实的科目请留空。</span></div></form><h4>已登记成绩</h4>${assessmentHistory(rows,studentId)}<p class="account-footnote">作废成绩会保留登记历史，不再参与目标达成判定。</p></section>`;}

const empty=(title,message)=>`<div class="account-empty"><h2>${title}</h2><p>${message}</p></div>`;

const list=value=>Array.isArray(value)?value.filter(row=>row&&typeof row==='object'):[];
const plain=value=>String(value??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/\s+/g,' ').trim();
const responseText=value=>Array.isArray(value)?value.join(' / '):String(value??'');
const itemCatalog=new Map([...diagnosticItems,...confirmationChecks.flatMap(check=>check.items),...adaptiveBlocks.flatMap(block=>block.items),...adaptiveManualItems].map(item=>[item.id,item]));
const materialTitle=id=>learningMaterials.find(material=>material.id===id)?.title||id||'未命名任务';

/** Read-only view of one student's stored evidence. Missing data stays missing. */
export function buildAdminLearningView(detail={}, {now=Date.now()}={}) {
  const saved=detail.state?.state||{},raw=saved.growth||saved.growthProfile||{};
  const profile={...createGrowthProfile({...raw,id:detail.user?.id||raw.id}),ui:raw.ui||{}};
  profile.diagnostics=list(profile.diagnostics).map(d=>({...d,results:list(d.results)}));
  const path=buildPersonalPath(profile,{banks:{learningMaterials},now});
  const diagnostics=[...profile.diagnostics].sort((a,b)=>Number(b.finishedAt)-Number(a.finishedAt)).map(d=>{
    const snapshots=new Map(list(d.rawItems||d.items).map(item=>[item.id,item]));
    const rows=d.results.map((row,index)=>{
      const item=snapshots.get(row.id)||itemCatalog.get(row.id)||{};
      return {...row,number:index+1,prompt:plain(item.prompt)||String(row.id||'题目'),expected:(Array.isArray(item.answers)?item.answers:[]).map(responseText),explanation:plain(item.explanation),response:responseText(row.response),options:list(item.options),passage:plain(item.passage),dimensionLabel:dimensionNames[row.dimension]||row.dimension||'未标注小项'};
    });
    return {...d,rows,wrong:rows.filter(row=>row.scored&&row.answered&&!row.correct),unanswered:rows.filter(row=>row.scored&&!row.answered)};
  });
  const records=list(saved.app?.records||saved.records).sort((a,b)=>Number(b.finishedAt)-Number(a.finishedAt)).map(record=>{
    let questions=[];
    try{questions=grade(list(record.passages),record.answers||{}).details.map(row=>({number:row.displayNumber||row.number,title:row.passage?.title||'',type:TYPE_NAMES[row.group?.type]||row.group?.type||'',options:list(row.question?.options||row.group?.options),instructions:plain(row.group?.instruction),prompt:plain(row.question?.prompt),response:row.actual,expected:row.question?.answers||[],correct:row.correct,pending:row.pending,tooLong:row.tooLong,duplicate:row.duplicate,explanation:plain(row.question?.explanation),quote:plain(row.question?.evidence?.quote)}));}catch{}
    if(!questions.length)questions=list(record.details).map(row=>({...row,response:row.actual||'',prompt:'本条记录没有保留题目正文。',expected:[],type:TYPE_NAMES[row.type]||row.type||''}));
    return {...record,questions,wrong:questions.filter(row=>!row.pending&&!row.correct),completeSnapshot:questions.some(row=>row.expected.length)};
  });
  const knownIds=new Set([...diagnostics,...records].map(row=>row.id).filter(Boolean));
  const dailyPractice=list(profile.ui.practiceResults).sort((a,b)=>Number(b.finishedAt)-Number(a.finishedAt)).filter(entry=>{if(entry.id&&knownIds.has(entry.id))return false;if(entry.id)knownIds.add(entry.id);return true;}).map(entry=>{
    const items=new Map(list(entry.items).map(item=>[item.id,item]));
    const rows=list(entry.results).map((row,index)=>{
      const item=items.get(row.id)||{},response=responseText(row.response),answered=row.answered===false?false:response.trim()!=='';
      const scored=row.scored===true&&typeof row.correct==='boolean';
      return {...row,number:index+1,skill:row.skill||entry.skill,response,answered,scored,correct:scored?row.correct===true&&answered:null,
        prompt:plain(item.prompt)||'本条记录没有保留题目正文。',expected:(Array.isArray(item.answers)?item.answers:[]).map(responseText),
        explanation:plain(item.explanation),dimensionLabel:dimensionNames[row.dimension]||row.dimension||'',options:list(item.options),passage:plain(item.passage)};
    });
    const scored=rows.filter(row=>row.scored);
    return {...entry,rows,scoredTotal:scored.length,correct:scored.filter(row=>row.correct).length,
      wrong:rows.filter(row=>row.scored&&row.answered&&row.correct===false),unanswered:rows.filter(row=>row.scored&&!row.answered),unscored:rows.filter(row=>!row.scored)};
  });
  const nextTaskFor=skill=>{const task=path.steps.find(step=>step.skill===skill);return task?{title:task.title}:null;};
  for(const session of [...diagnostics,...dailyPractice])for(const row of session.rows)row.nextTask=nextTaskFor(row.skill||session.skill);
  for(const record of records)for(const row of record.questions){row.skill=record.subject||record.passages?.[0]?.subject||'reading';row.nextTask=nextTaskFor(row.skill);}
  return {profile,path,diagnostics,records,dailyPractice,submissions:list(detail.submissions),evidence:[...profile.evidence].sort((a,b)=>b.finishedAt-a.finishedAt),dictation:summarizeDictation(profile,{start:'2000-01-01',end:'2100-12-31'})};
}

const machineStatusNames={not_configured:'等待教师反馈',queued:'等待批改',processing:'正在批改',completed:'已完成自动批改',failed:'批改未完成',needs_audio:'需要口语录音'};
const machineTime=value=>Number.isFinite(value)&&value>=0?`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`:'';

export function machineCoverageNotes(submission={},review={}) {
  const notes=[],coverage=review.coverage||{},isSpeaking=submission.skill==='speaking';
  const count=Number.isInteger(coverage.wordCount)&&coverage.wordCount>=0?coverage.wordCount:typeof submission.text==='string'?submission.text.trim().split(/\s+/).filter(Boolean).length:null;
  if(count!==null)notes.push(`${isSpeaking?(review.audioAnalyzed===true?'本次录音转写':'本次文字稿'):'本次正文'}记录了 ${count} 词。`);
  if(isSpeaking&&review.audioAnalyzed===true&&Number.isFinite(coverage.audioSeconds))notes.push(`本次检查了 ${coverage.audioSeconds} 秒录音。`);
  if(isSpeaking&&review.audioAnalyzed!==true)notes.push(submission.audioId?'录音已保存，但本次批改没有分析录音；发音和停顿没有判分。':'本次未提交录音；文字稿不能用于判断发音和停顿。按本题要求录下完整回答后提交。');
  if(!isSpeaking&&Object.hasOwn(submission,'text')&&!String(submission.text||'').trim())notes.push('本次没有提交正文。请在本题输入框写下要求的词句或段落后提交。');
  for(const label of Array.isArray(coverage.unassessedCriteria)?coverage.unassessedCriteria.filter(value=>typeof value==='string'):[]){
    const dimension=list(review.dimensions).find(item=>item.label===label||item.id===label||item.code===label||criterionInfo(item,submission.skill).label===label);
    notes.push(`${label}：${dimension?.comment||'本次返回结果没有给出这一项的评分和原句依据。'}`);
  }
  return notes;
}

/** Render only the server-returned review; none of these values become verified scores. */
export function renderMachineReview(submission={}, {admin=false}={}) {
  const review=submission.machineReview&&typeof submission.machineReview==='object'?submission.machineReview:null,status=submission.machineStatus||'unknown';
  const statusMessage={not_configured:admin?'自动批改暂未开通。请查看作品或录音并填写教师反馈。':'自动批改暂未开通，作品已提交给老师。教师反馈会保存在作品记录中。',queued:'作品已保存，正在等待批改。可以先继续其他练习。',processing:'正在检查本次作品，完成后会显示修改建议。',failed:'本次批改未完成，作品和录音仍已保存。',needs_audio:typeof submission.text==='string'&&submission.text.trim()?'本次未提交录音，已保存表达稿。按题目要求录下完整回答后提交，才能检查发音与停顿。':'本次未提交录音。按题目要求录下完整回答后提交，才能检查发音与停顿。'}[status]||'尚未取得自动批改结果。';
  const allowRetry=false; // This deployment uses teacher feedback; automatic grading is not enabled.
  const actions=`<div class="account-actions account-machine-actions">${['queued','processing','failed','not_configured'].includes(status)?'<button type="button" class="btn secondary small" data-account-action="submission-refresh">刷新反馈</button>':''}${allowRetry?`<button type="button" class="btn secondary small" data-account-action="submission-regrade" data-id="${esc(submission.id)}">${status==='completed'?'重新批改':'重试批改'}</button>`:''}</div>`;
  if(!review||status!=='completed')return `<section class="account-machine-review"><header><h4>${status==='not_configured'?'教师反馈':'自动批改'}</h4><span class="account-status ${status==='failed'?'pending':''}">${esc(machineStatusNames[status]||'尚无结果')}</span></header><p>${statusMessage}</p>${submission.machineError?`<p class="account-footnote">${esc(submission.machineError)}</p>`:''}${actions}</section>`;
  const dimensions=list(review.dimensions),corrections=list(review.corrections),steps=Array.isArray(review.nextSteps)?review.nextSteps.filter(text=>typeof text==='string'):[],coverageNotes=machineCoverageNotes(submission,review);
  const coverage=submission.skill==='speaking'?(review.audioAnalyzed===true?'本次已检查提交的口语录音。':'本次未检查录音，不据此评价发音或语速。'):'';
  const reference=reviewReferenceScore(submission,review);
  const referenceHtml=reference?`<section class="account-reference-score"><h5>本题参考分 <strong>${reference.taskBand.toFixed(1)}</strong> · ${esc(reference.taskLabel)}</h5><p>非正式成绩，未经校准，仅供本题修改参考；不计入目标成绩。</p></section>`:'';
  const dimensionsHtml=dimensions.length?`<div class="account-machine-criteria">${dimensions.map(d=>{
    const item=criterionInfo(d,submission.skill),audioMissing=submission.skill==='speaking'&&review.audioAnalyzed!==true&&['FC','P'].includes(item.code);
    const band=reference?.criteria.find(criterion=>criterion.code===item.code)?.band;
    const result=audioMissing?'本次未评价':Number.isInteger(band)?`本题参考 ${band}`:Number.isInteger(d.level)&&d.level>=1&&d.level<=4?`本题观察 ${d.level} / 4`:'';
    const comment=audioMissing?'本次没有分析录音，无法评价这一项。按本题要求录下完整回答后提交。':d.comment||'';
    const evidence=audioMissing?[]:list(d.evidence);
    return `<article><h5><strong>${item.code?`<small class="account-criterion-code">${esc(item.code)}</small>`:''}${esc(item.label)}</strong>${result?`<span>${esc(result)}</span>`:''}</h5><p>${esc(comment)}</p>${evidence.length?`<ul>${evidence.map(e=>`<li>${e.quote?`“${esc(e.quote)}”`:''}${review.audioAnalyzed===true&&machineTime(e.atSeconds)?` <small>录音 ${machineTime(e.atSeconds)}</small>`:''}</li>`).join('')}</ul>`:''}</article>`;
  }).join('')}</div><p class="account-footnote">${reference?'四项参考分只用于本题反馈，不等于正式考试成绩。':'“本题观察”1–4 记录这次作答的表现，不是雅思分数。'}</p>`:'';
  return `<section class="account-machine-review"><header><h4>自动批改</h4><span class="account-status active">${esc(machineStatusNames.completed)}</span></header><p class="account-footnote">${date(review.reviewedAt)}${coverage?' · '+coverage:''}</p>${referenceHtml}<div class="account-machine-feedback">${esc(review.feedback||'本次批改已完成。').replace(/\n/g,'<br>')}</div>${coverageNotes.length?`<ul class="account-machine-coverage">${coverageNotes.map(note=>`<li>${esc(note)}</li>`).join('')}</ul>`:''}${review.recommendedStage&&stageNames[review.recommendedStage]?`<p>建议接着做：<strong>${stageNames[review.recommendedStage]}</strong>。训练阶段用于安排下一步材料。</p>`:''}${dimensionsHtml}${corrections.length?`<details class="account-machine-corrections" open><summary>逐处修改 · ${corrections.length} 项</summary><ol>${corrections.map(c=>`<li><div class="account-answer-pair"><p><strong>原句 / 原表达</strong><span>${esc(c.original||'—')}</span></p><p><strong>修改建议</strong><span>${esc(c.suggestion||'—')}</span></p></div><p>${esc(c.reason||'')}${review.audioAnalyzed===true&&machineTime(c.atSeconds)?` <small>录音 ${machineTime(c.atSeconds)}</small>`:''}</p></li>`).join('')}</ol></details>`:''}${steps.length?`<h5>接下来练什么</h5><ol class="account-machine-next">${steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`:''}${review.transcript?`<details><summary>本次录音转写</summary><div class="account-prose">${esc(review.transcript)}</div></details>`:''}<p class="account-footnote">${esc(review.notice||'自动批改用于修改和安排练习；不作为核实成绩或正式考试评分。')}${submission.status==='reviewed'?' 教师复核另行保留，可查看下方补充或修正。':''}</p>${actions}</section>`;
}

const textRows=value=>Array.isArray(value)?value.filter(row=>typeof row==='string'&&row.trim()):[];
const sourceLabel=source=>source?.type==='school_original'?'校内编写':source?.type==='book'?'教材任务':source?.type==='school_adaptation'?'校内改编':'目录登记来源';

export function renderGradingTaskCatalog(data={},filters={}) {
  const tasks=list(data.tasks),query=String(filters.query||'').trim().toLocaleLowerCase(),skill=filters.skill||'';
  const selected=tasks.filter(task=>(!skill||task.skill===skill)&&(!query||[task.id,task.title,task.prompt,task.source?.title].join(' ').toLocaleLowerCase().includes(query)));
  const imported=tasks.filter(task=>task.source?.imported===true&&task.source?.bookId&&task.source?.page!=null).length;
  return `<section class="account-panel account-task-catalog"><h2>批改任务目录</h2><p>学生提交后，服务端按这里登记的固定题目和要求批改。可以逐项核对题目、提交内容、检查标准和材料来源。</p><div class="account-metrics"><div class="account-metric"><span>写作任务</span><strong>${tasks.filter(task=>task.skill==='writing').length}</strong></div><div class="account-metric"><span>口语任务</span><strong>${tasks.filter(task=>task.skill==='speaking').length}</strong></div><div class="account-metric"><span>已标注书名、页码并导入的任务</span><strong>${imported}</strong></div></div><p class="account-note ${data.configured===false?'warning':''}">${data.configured===true?'批改服务已配置。目录中的可用任务在提交后进入批改队列；是否完成以每份作业的返回结果为准。':data.configured===false?'批改服务尚未配置。下面的任务和规则已登记，尚不能据此声称已完成在线批改。':'当前接口没有返回服务配置状态。'}${imported===0?' 当前目录没有标注书名、页码且确认导入的教材任务。':''}</p><form class="account-filter" data-account-form="grading-task-filter"><label class="account-field">查找任务<input name="query" value="${esc(filters.query||'')}" placeholder="题目、任务编号或来源" maxlength="100"></label><label class="account-field">项目<select name="skill"><option value="">全部</option><option value="writing" ${skill==='writing'?'selected':''}>写作</option><option value="speaking" ${skill==='speaking'?'selected':''}>口语</option></select></label><button class="btn primary" type="submit">查询目录</button></form><p class="account-footnote">显示 ${selected.length} / ${tasks.length} 项</p>${selected.length?selected.map(task=>{const requirements=task.requirements||{},source=task.source||{},instructions=textRows(requirements.instructions),questions=textRows(requirements.questions),followUps=textRows(requirements.followUps),objectives=textRows(task.learningObjectives),criteria=list(task.feedbackCriteria);return `<details class="account-review-block account-catalog-task"><summary>${esc(task.title||task.id)} <span class="account-status">${esc(skillName[task.skill]||task.skill)}</span></summary><dl class="account-catalog-meta"><dt>任务编号</dt><dd>${esc(task.id)}</dd><dt>使用位置</dt><dd>${task.kind==='diagnostic'?'首次能力测评':'日常课程'} · ${esc(stageNames[task.stage]||'按本题要求作答')}</dd><dt>来源</dt><dd>${esc(source.title||'目录未填写来源名称')} · ${sourceLabel(source)}${source.bookId?`<br>书目编号：${esc(source.bookId)}`:''}${source.page!=null?` · 页码：${esc(responseText(source.page))}`:''}${source.imported===true?' · 目录标记已导入':source.type==='school_original'?' · 校内编写，未标称来自教材':' · 目录未标记已导入'}</dd><dt>提交方式</dt><dd>${task.assignment?.input==='recording'?'提交录音':task.assignment?.input==='text'?'提交文字':'按任务要求提交'}${task.assignment?.autoEnqueue===true?'；提交后保存到作业记录':''}</dd><dt>批改状态</dt><dd>${task.gradingStatus==='ready'?'服务已配置，提交后按队列处理':task.gradingStatus==='service_not_configured'?'自动批改未开通，可由老师查看作品并填写反馈':'目录没有返回本任务的批改状态'}</dd></dl><h4>固定题目</h4><div class="account-catalog-prompt">${esc(task.prompt||'目录没有填写题目正文。')}</div>${requirements.promptCn?`<p>${esc(requirements.promptCn)}</p>`:''}${instructions.length?`<h4>作答要求</h4><ul>${instructions.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`:''}${requirements.wordTarget?`<p>题目篇幅要求：${Number.isFinite(requirements.wordTarget.min)?requirements.wordTarget.min:''}${Number.isFinite(requirements.wordTarget.max)?'–'+requirements.wordTarget.max:''} 词</p>`:''}${Number.isFinite(requirements.speakingSeconds)?`<p>录音任务时长：约 ${requirements.speakingSeconds} 秒</p>`:''}${questions.length?`<h4>本题问题</h4><ol>${questions.map(text=>`<li>${esc(text)}</li>`).join('')}</ol>`:''}${followUps.length?`<h4>追问</h4><ol>${followUps.map(text=>`<li>${esc(text)}</li>`).join('')}</ol>`:''}${criteria.length?`<h4>逐项检查什么</h4><dl class="account-catalog-criteria">${criteria.map(criterion=>{const supplied=list(task.rubric?.criteria).find(row=>row.id===criterion.id),item=criterionInfo(supplied||criterion,task.skill);return `<dt>${item.code?esc(item.code)+' · ':''}${esc(item.label)}</dt><dd>${esc(criterion.focus||'目录没有填写检查说明。')}</dd>`;}).join('')}</dl>`:''}${objectives.length?`<details><summary>本课练习目标</summary><ul>${objectives.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></details>`:''}</details>`;}).join(''):empty('没有匹配的任务','换一个任务名称，或选择“全部”查看目录。')}</section>`;
}

function answerReview(row,{diagnostic=false}={}) {return renderAnswerFeedback(normalizeAnswerFeedback(row),{responseLabel:'学生答案',nextTask:row.nextTask||null,number:diagnostic?`${skillName[row.skill]||row.skill||''} ${row.number||row.id||''}`:row.number});}

export function observableSkillNotes(view,skill) {
  const title=skillName[skill]||skill;
  if(['writing','speaking'].includes(skill)){
    const submission=view.submissions.find(row=>row.skill===skill);
    if(!submission)return [`当前返回的作业中没有${title}提交内容。完成计划中的${title}任务后，这里会显示原句和修改建议。`];
    const review=submission.machineReview,correction=list(review?.corrections)[0];
    if(correction)return [`《${submission.title||title+'任务'}》中的“${correction.original||''}”建议改为“${correction.suggestion||''}”。${correction.reason||''}`];
    if(submission.machineStatus==='needs_audio')return ['本次没有提交口语录音；表达稿已保存。按题目录下完整回答后提交，才能检查发音和停顿。'];
    if(review?.feedback)return [review.feedback];
    return [`《${submission.title||title+'任务'}》已提交；${machineStatusNames[submission.machineStatus]||'尚未返回自动批改结果'}。可以继续计划中的下一项练习。`];
  }
  const rows=[...view.diagnostics,...view.dailyPractice,...view.records.map(record=>({finishedAt:record.finishedAt,rows:record.questions}))].sort((a,b)=>Number(b.finishedAt)-Number(a.finishedAt)).flatMap(record=>record.rows).filter(row=>row.skill===skill);
  const wrong=rows.filter(row=>row.correct===false&&String(row.response||'').trim()&&row.scored!==false&&!row.pending).slice(0,2);
  const notes=wrong.map(row=>`“${row.prompt}”：学生填写“${row.response}”${row.expected?.length?`，参考答案为“${row.expected.join(' / ')}”`:''}。${row.tooLong?'本次答案还超过了题目规定的词数。':''}`);
  const blank=rows.find(row=>row.scored!==false&&!row.pending&&!String(row.response||'').trim());
  if(blank)notes.push(`“${blank.prompt}”没有填写答案。先查看下方该题的原文依据和订正说明。`);
  if(notes.length)return notes;
  if(rows.some(row=>row.correct))return ['当前逐题记录中的已计分作答均答对。下一步材料已列在下方，继续按题目要求完成。'];
  return [`本页没有保存${title}的逐题答案；请先完成计划中的对应任务。不能据此推断错误原因。`];
}

function learningOverview(view) {
  const placement=view.path.placement, latest=view.diagnostics[0], skills=[placement.foundation,...Object.values(placement.skills)];
  return `<section class="account-learning-section"><h3>测评与接下来的训练</h3><p class="account-footnote">${latest?`最近一次测评：${date(latest.finishedAt)}。`:'尚未完成能力测评。'}完成首次能力测评后直接安排学习任务。以下显示本次作答和后续练习记录；写作和口语取得批改建议后继续学习，老师可复核或调整安排。</p><div class="account-learning-grid">${skills.map(result=>`<article class="account-learning-card"><div><h4>${esc(result.name||skillName[result.skill])}</h4><span class="account-status">${esc(result.stageName||(['writing','speaking'].includes(result.skill)?'先做起步练习':'尚未保存逐题答案'))}</span></div><strong>${result.observed.total?`答对 ${result.observed.correct} / ${result.observed.total}`:result.reviewPending?`${result.reviewPending} 份待反馈`:'已保存的答题数量为 0'}</strong><ul>${observableSkillNotes(view,result.skill).map(reason=>`<li>${esc(reason)}</li>`).join('')}</ul>${result.dimensions?.length?`<details><summary>按小项查看</summary><ul>${result.dimensions.map(d=>`<li>${esc(d.label||dimensionNames[d.id]||d.id)}：${d.correct} / ${d.total}</li>`).join('')}</ul></details>`:''}</article>`).join('')}</div><h4>学生当前的具体任务</h4>${view.path.steps.length?`<ol class="account-task-list">${view.path.steps.map(step=>`<li><div><strong>${esc(step.title)}</strong><span>${esc(skillName[step.skill]||step.skill)}${step.minutes?` · 约 ${step.minutes} 分钟`:''}</span></div><p>${step.reasons.map(esc).join(' ')}</p><p class="account-footnote">完成要求：${esc(step.completionCriterion)}</p></li>`).join('')}</ol>`:'<p>当前没有可自动安排的新任务，请结合下面的记录安排练习。</p>'}${view.path.unresolved.length?`<details class="account-review-block"><summary>需要老师补充的安排 · ${view.path.unresolved.length} 项</summary><ul>${view.path.unresolved.map(row=>`<li>${esc(skillName[row.skill]||row.skill)}：${esc(row.reason)}</li>`).join('')}</ul></details>`:''}<p class="account-footnote">总分目标：${esc(view.profile.goals.overall??'未设置')}　每周学习时间：${view.profile.goals.weeklyMinutes} 分钟${view.profile.goals.targetDate?`　目标日期：${esc(view.profile.goals.targetDate)}`:''}。单项结果分别记录，练习正确率不换算雅思分数。</p></section>`;
}

function diagnosticHistory(view) {
  return `<section class="account-learning-section"><h3>能力测评：逐题查看</h3><p class="account-footnote">小题结果按保存的作答记录展示。展开题目可查看学生答案、参考答案和已有的原文依据。</p>${view.diagnostics.length?view.diagnostics.map((d,index)=>`<details class="account-review-block" ${index===0?'open':''}><summary>${date(d.finishedAt)} · ${d.kind==='confirmation_check'?'历史专项作答':d.adaptive?'分组能力测评':'能力测评'} · 答错 ${d.wrong.length} 题 / 未答 ${d.unanswered.length} 题</summary>${d.adaptive?.skills?`<div class="account-table-wrap"><table class="account-table"><thead><tr><th>项目 / 题组</th><th>作答</th><th>答对</th><th>记录</th></tr></thead><tbody>${Object.entries(d.adaptive.skills).flatMap(([skill,result])=>list(result.blocks).map(block=>`<tr><td>${esc(skillName[skill]||skill)} · ${esc(stageNames[block.stage]||block.stage)}</td><td>${block.answered} / ${block.total}</td><td>${block.audioUnavailable?'—':`${block.correct} / ${block.total}`}</td><td>${block.audioUnavailable?'音频未能播放，不分阶段':block.sufficient?'已完成本组':`本组有 ${Math.max(0,Number(block.total)-Number(block.answered))} 题未填写`}</td></tr>`)).join('')}</tbody></table></div>`:''}<h4>错题与未作答题</h4>${d.rows.filter(row=>row.scored&&!row.correct).map(row=>answerReview(row,{diagnostic:true})).join('')||'<p class="account-footnote">本次已计分题目没有错题或未作答题。</p>'}<details class="account-correct-answers"><summary>查看答对的题与表达任务</summary>${d.rows.filter(row=>row.correct||row.needsReview).map(row=>answerReview(row,{diagnostic:true})).join('')||'<p>尚无记录。</p>'}</details></details>`).join(''):empty('还没有测评结果','学生首次登录后完成能力测评，这里会显示题组和逐题作答。')}</section>`;
}

function dailyPracticeHistory(view) {
  return `<section class="account-learning-section"><h3>日常课程：作答与修改</h3><p class="account-footnote">显示最近 100 次保存的课程逐题结果，阅读和听力分别记录。小题结果按保存的作答记录展示。未作答、答错与未计分分开显示；相同记录不会重复计入测评。</p>${view.dailyPractice.length?view.dailyPractice.map(entry=>`<details class="account-review-block"><summary>${date(entry.finishedAt)} · ${esc(entry.title||materialTitle(entry.materialId))} · ${entry.scoredTotal?`${entry.correct} / ${entry.scoredTotal}`:'本次没有计分结果'}</summary><p class="account-footnote">${esc(skillName[entry.skill]||'课程练习')}${entry.supported===true?' · 使用过提示':entry.supported===false?' · 未使用提示':''}${entry.seenBefore===true?' · 复习材料':entry.seenBefore===false?' · 首次记录':''} · 答错 ${entry.wrong.length} 题 / 未答 ${entry.unanswered.length} 题${entry.unscored.length?` / 未计分 ${entry.unscored.length} 题`:''}</p>${entry.audioUnavailable===true?'<p class="account-note warning">本次录音未能播放，未据此判断听力表现。</p>':''}${entry.rows.length?`<h4>需要核对的答案</h4>${entry.rows.filter(row=>row.scored&&!row.correct).map(row=>answerReview(row)).join('')||`<p>${entry.scoredTotal?'本次已计分题目没有错题或未作答题。':'本次没有可核对的计分作答。'}</p>`}<details class="account-correct-answers"><summary>查看答对与未计分的题目</summary>${entry.rows.filter(row=>row.correct||!row.scored).map(row=>answerReview(row)).join('')||'<p>没有其他题目记录。</p>'}</details>`:'<p>本次没有保存可计分的作答，不据此推断学生掌握情况。</p>'}</details>`).join(''):empty('还没有课程逐题记录','学生完成词句、分层阅读或听力课程后，这里会显示已保存的作答与修改依据。')}</section>`;
}

function practiceHistory(view) {
  return `${dailyPracticeHistory(view)}<section class="account-learning-section"><h3>机考练习：结果与错题</h3><p class="account-footnote">保留最近 30 次完整机考复查记录；结果按保存的作答和题目快照展示。更早的训练摘要在下方查看。</p>${view.records.length?view.records.map(record=>`<details class="account-review-block"><summary>${date(record.finishedAt)} · ${esc(record.title||'机考练习')} · ${record.correct??0} / ${record.scoredTotal??record.total??0}</summary><p class="account-footnote">${esc(skillName[record.subject]||'阅读')} · 用时 ${Math.max(0,Math.round(Number(record.elapsed||0)/60))} 分钟${record.pending?` · ${record.pending} 题待核对`:''}</p><h4>错题与未作答题 · ${record.wrong.length} 题</h4>${record.wrong.map(row=>answerReview(row)).join('')||'<p>本次已计分题目全部答对。</p>'}<details class="account-correct-answers"><summary>查看其余题目</summary>${record.questions.filter(row=>row.correct||row.pending).map(row=>answerReview(row)).join('')||'<p>尚无记录。</p>'}</details></details>`).join(''):empty('还没有机考结果','学生完成原版阅读或听力练习后，这里会显示答案与逐题复查。')}<details class="account-review-block"><summary>课程训练摘要 · ${view.evidence.length} 次</summary>${view.evidence.length?`<div class="account-table-wrap account-history-scroll"><table class="account-table"><thead><tr><th>时间</th><th>项目 / 材料</th><th>完成方式</th><th>结果</th></tr></thead><tbody>${view.evidence.map(row=>`<tr><td>${date(row.finishedAt)}</td><td>${esc(skillName[row.skill])}<small>${esc(materialTitle(row.materialId))}</small></td><td>${row.supported?'使用提示':row.seenBefore?'复习材料':'独立新材料'}</td><td>${row.total?`${row.correct} / ${row.total}`:row.teacherReview?.reviewed?'教师已复核':'已提交，查看批改结果'}</td></tr>`).join('')}</tbody></table></div>`:'<p>尚无记录。</p>'}</details><details class="account-review-block"><summary>语料听写记录 · ${view.dictation.sessions} 次（学生自记）</summary>${view.dictation.sessions?`<div class="account-table-wrap account-history-scroll"><table class="account-table"><thead><tr><th>时间</th><th>材料</th><th>首听 / 复听</th><th>自记结果</th></tr></thead><tbody>${view.dictation.rows.map(row=>`<tr><td>${date(row.at)}</td><td>${esc(row.title)}</td><td>${esc(row.kind)}</td><td>${row.correct} / ${row.total}</td></tr>`).join('')}</tbody></table></div>`:'<p>尚无听写记录。</p>'}<p class="account-footnote">这里显示学生订正后填写的数量，不作为独立听力理解测评。</p></details></section>`;
}

/** UI facade. The host owns routing, shared navigation and hydrated learning state. */
export function createAccountUI(host) {
  const {client}=host;
  let controller=null, epoch=0, route='login', adminTab='students', page=1, filters={query:'',status:''}, selectedStudent=null, detail=null, studentRows=[], taskFilters={query:'',skill:''};
  const navigate=value=>host.navigate?host.navigate(value):(location.hash=value);
  function destroy(){controller?.abort();controller=null;epoch++;}
  function show(html){
    controller?.abort();controller=new AbortController();
    host.shell(`<section class="account-root" id="account-root">${html}</section>`);
    const root=document.getElementById('account-root');
    root?.addEventListener('submit',onSubmit,{signal:controller.signal});
    root?.addEventListener('click',onClick,{signal:controller.signal});
  }
  function notice(error){return `<div class="account-page-error">${empty('暂时无法载入',esc(error.message))}<div class="account-actions"><button class="btn primary" data-account-action="reload">重试</button><a class="btn secondary" href="#account">我的账号</a></div></div>`;}
  function heading(title,subtitle,actions=''){return `<div class="account-heading"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="account-actions">${actions}</div></div>`;}
  function authLayout(content){return `<div class="account-auth"><aside class="account-intro"><div class="eyebrow">SLS · IELTS LAB</div><h2>SLS 雅思学习平台<br>听力 · 阅读 · 写作 · 口语</h2><p>登录后完成测评，查看学习计划并提交练习。作答记录、写作与口语作业、老师反馈按账号保存。</p><ol><li>注册学校学习账号</li><li>完成平台内能力测评</li><li>查看学习计划，按顺序完成练习</li></ol></aside><div class="account-auth-body">${content}</div></div>`;}
  function login(){show(authLayout(`<h1>登录学习平台</h1><p>学生和管理员使用同一个登录入口。</p><form class="account-form" data-account-form="login">${field('username','学号 / 用户名','',{extra:'autocomplete="username" minlength="3" maxlength="40" autocapitalize="none" spellcheck="false"'})}${field('password','密码','',{type:'password',extra:'autocomplete="current-password" maxlength="128"'})}${errorBox()}<button class="btn primary" type="submit">登录</button></form><p class="account-auth-switch">还没有账号？<a class="account-link" href="#register">学生注册</a></p><p class="account-footnote">忘记密码请联系学校管理员。公共考试机使用后，请退出账号。</p>`));}
  function register(){show(authLayout(`<h1>学生注册</h1><p>使用学号或老师指定的用户名。注册后由学校管理员审核开通。</p><form class="account-form" data-account-form="register">${field('username','学号 / 用户名','',{extra:'autocomplete="username" minlength="3" maxlength="40" pattern="[A-Za-z0-9._-]{3,40}" autocapitalize="none" spellcheck="false"',hint:'3–40 位英文字母、数字、点、下划线或短横线。'})}${field('name','学生姓名','',{extra:'autocomplete="name" maxlength="60"'})}<div class="account-pair">${gradeSelect()}${field('className','班级','',{extra:'maxlength="40" placeholder="例如：高一（1）班"'})}</div>${field('password','设置密码','',{type:'password',extra:'autocomplete="new-password" minlength="10" maxlength="128"',hint:'至少 10 位，建议使用字母、数字和符号组合。'})}${field('confirmPassword','再次输入密码','',{type:'password',extra:'autocomplete="new-password" minlength="10" maxlength="128"'})}${errorBox()}<button class="btn primary" type="submit">提交注册</button></form><p class="account-auth-switch">已有账号？<a class="account-link" href="#login">返回登录</a></p>`));}
  function pending(user){show(heading(user.status==='suspended'?'账号已停用':'账号等待审核',`你好，${esc(user.name)}。${user.status==='suspended'?'请联系学校管理员核对账号状态。':'注册信息已经保存，学校管理员审核后即可开始学习。'}`)+`<div class="account-panel"><div class="account-note warning"><p>${user.status==='suspended'?'这个账号目前已停用，请联系学校管理员。':'账号尚未开通。你可以先核对姓名和班级，开通后在这里完成能力测评。'}</p></div><dl class="account-detail"><dt>用户名</dt><dd>${esc(user.username)}</dd><dt>年级 / 班级</dt><dd>${esc(user.grade||'未填写')} / ${esc(user.className||'未填写')}</dd></dl><div class="account-actions"><button class="btn primary" data-account-action="refresh-session">检查审核状态</button><button class="btn secondary" data-account-action="logout">退出账号</button></div>${errorBox()}</div>`);}
  async function account(ticket){
    const user=client.user;if(!user){login();return;}if(user.status!=='active'){pending(user);return;}
    const result=await client.getProfile();if(ticket!==epoch)return;
    const profile=result.profile||result.user||user;
    show(heading('我的账号','学习记录与账号关联。更换考试机后，登录同一个账号即可继续。',`<button class="btn secondary" data-account-action="logout">退出登录</button>`)+`<div class="account-grid"><section class="account-panel"><h2>个人资料</h2><p>用户名：${esc(user.username)}　${user.role==='admin'?'管理员':'学生'}　${badge(user.status)}</p><form class="account-form" data-account-form="profile">${field('name','姓名',profile.name,{extra:'maxlength="60"'})}<div class="account-pair">${gradeSelect(profile.grade)}${field('className','班级',profile.className,{required:false,extra:'maxlength="40"'})}</div>${errorBox()}<div class="account-actions"><button class="btn primary" type="submit">保存资料</button><a class="btn secondary" href="#plan">个人目标与计划</a></div></form></section><section class="account-panel"><h2>修改密码</h2><p>修改后会退出所有设备，请用新密码重新登录。</p><form class="account-form" data-account-form="password">${field('currentPassword','当前密码','',{type:'password',extra:'autocomplete="current-password" maxlength="128"'})}${field('newPassword','新密码','',{type:'password',extra:'autocomplete="new-password" minlength="10" maxlength="128"'})}${field('confirmPassword','再次输入新密码','',{type:'password',extra:'autocomplete="new-password" minlength="10" maxlength="128"'})}${errorBox()}<button class="btn secondary" type="submit">保存新密码</button></form></section><section class="account-panel wide"><h2>批改与修改</h2><p>查看写作与口语的逐句建议，以及老师补充的意见。</p><div id="account-my-submissions" class="account-loading">正在载入…</div></section></div>`);
    try{const data=await client.getSubmissions();if(ticket!==epoch)return;const rows=data.submissions||[];document.getElementById('account-my-submissions').outerHTML=`<div id="account-my-submissions">${rows.length?rows.map(s=>submissionCard(s,false)).join(''):empty('还没有提交记录','完成写作或口语任务后，在练习页面提交批改。')}</div>`;}catch(e){if(ticket===epoch)document.getElementById('account-my-submissions').textContent=e.message;}
  }
  function submissionCard(s,review){return `<article class="account-submission"><header><div><h3>${esc(s.title||skillName[s.skill]+'练习')}</h3><p>${esc(skillName[s.skill]||s.skill)} · ${date(s.createdAt)}${review?` · ${esc(s.studentName||s.username||'')}`:''}</p></div>${badge(s.status)}</header>${review?`<details><summary>查看提交内容</summary><div class="account-prose">${esc(s.text||'本次提交没有文字内容。')}</div>${s.audioId?`<audio controls preload="none" src="${esc(client.audioUrl(s.audioId))}" aria-label="学生口语录音"></audio>`:''}</details>`:''}${!review&&s.audioId?`<audio controls preload="none" src="${esc(client.audioUrl(s.audioId))}" aria-label="我的口语录音"></audio>`:''}${renderMachineReview(s,{admin:review})}${s.feedback?`<div class="account-note"><strong>教师复核</strong><p>${esc(s.feedback).replace(/\n/g,'<br>')}</p></div>`:!review&&s.machineStatus==='completed'?'<p>按上方建议修改后，可以重新提交；也可以继续下一项练习。</p>':''}${s.rubric&&rubricSummary(s.rubric)?`<p>${rubricSummary(s.rubric)}</p>`:''}${s.parentId?'<p class="account-footnote">本次为修改后重新提交，原来的提交和老师反馈仍保留在记录中。</p>':''}${review?`<details class="account-human-review" ${s.status==='reviewed'?'open':''}><summary>教师反馈与训练安排</summary><p class="account-footnote">根据本次作品填写具体反馈和下一项练习；需要调整训练阶段时，在下方注明依据。</p><form class="account-form" data-account-form="review" data-id="${esc(s.id)}"><label class="account-field">教师反馈<textarea name="feedback" required maxlength="6000" placeholder="写明具体错误、修改要求和下一次练习。">${esc(s.feedback||'')}</textarea></label><div class="account-rubric">${(s.skill==='speaking'?['表达连贯','词汇运用','语法运用','发音清晰']:['回应题目','段落衔接','词汇运用','语法运用']).map((label,i)=>`<label class="account-field">${label}<select name="rubric-${i}"><option value="">暂不评价</option>${[['1','1 · 需要更多支持'],['2','2 · 基本完成'],['3','3 · 独立完成'],['4','4 · 运用熟练']].map(([value,name])=>`<option value="${value}" ${String(s.rubric?.[label])===value?'selected':''}>${name}</option>`).join('')}</select></label>`).join('')}</div><p class="account-footnote">以上等级用于课堂反馈，不作为雅思成绩。</p><fieldset class="account-assessment"><legend>教师调整训练阶段（可选）</legend><label class="account-field">本次评估的训练阶段<select name="assessmentStage"><option value="">暂不确定，仅保存反馈</option>${Object.entries(stageNames).map(([value,label])=>`<option value="${value}" ${s.rubric?.stage===value?'selected':''}>${label}</option>`).join('')}</select><small>根据本次实际任务选择，不按学生年级或个人目标分数推定。</small></label><label class="account-check"><input type="checkbox" name="assessmentIndependent" ${s.rubric?.independent===true?'checked':''}><span>已确认：本次没有使用词汇、提纲等提示，由学生独立完成。</span></label><label class="account-check"><input type="checkbox" name="assessmentUnseen" ${s.rubric?.unseen===true?'checked':''}><span>已确认：本次使用的是学生未练过的新材料。</span></label><label class="account-check"><input type="checkbox" name="assessmentReady" ${s.rubric?.readyForNextStage===true?'checked':''}><span>已确认：本次表现已达到进入下一训练阶段的要求。</span></label><p class="account-footnote">无法确认的项目请保持不勾选。阶段调整会结合多次练习与老师反馈，不由单次评分直接决定。</p></fieldset>${errorBox()}<button type="submit" class="btn primary">${s.status==='reviewed'?'更新教师复核':'保存教师复核'}</button></form></details>`:''}</article>`;}
  async function admin(ticket){
    const user=client.user;if(!user){login();return;}if(user.role!=='admin'){show(empty('仅管理员可访问','请使用学校管理员账号登录。'));return;}
    show(heading('管理员工作台','管理学生账号，检查练习进度，安排任务并给出反馈。',`<a class="btn secondary" href="#account">我的账号</a>`)+`<div id="account-admin-summary"></div><div id="account-grading-status"></div><div class="account-admin-tabs" role="tablist" aria-label="管理栏目">${[['students','学生管理'],['submissions','批改与复核'],['grading-tasks','批改任务目录'],['announcements','学校通知'],['settings','注册设置']].map(([id,label])=>`<button role="tab" aria-selected="${id===adminTab}" data-account-action="admin-tab" data-tab="${id}">${label}</button>`).join('')}</div><div id="account-admin-content" class="account-loading">正在载入…</div><div id="account-admin-detail"></div>`);
    void client.adminSummary().then(data=>{if(ticket!==epoch)return;document.getElementById('account-admin-summary').innerHTML=`<div class="account-metrics">${[['已开通学生',data.activeStudents],['待审核注册',data.pendingStudents],['等待教师反馈',data.pendingSubmissions]].map(([label,n])=>`<div class="account-metric"><span>${label}</span><strong>${Number(n)||0}</strong></div>`).join('')}</div>`;}).catch(()=>{});
    void client.request('/api/admin/grading').then(data=>{if(ticket!==epoch)return;const slot=document.getElementById('account-grading-status');if(!slot)return;const counts=Object.fromEntries(list(data.jobs).map(row=>[row.status,Number(row.count)||0]));slot.innerHTML=`<div class="account-note account-grading-status ${data.configured===false?'warning':''}"><strong>自动批改：${data.configured===true?'服务已配置':data.configured===false?'服务待开通':'暂未取得服务状态'}</strong><p>${data.configured===false?'自动批改尚未开通。作品和录音会保存，老师可在作业记录中填写反馈。':`等待 ${counts.queued||0} 份 · 处理中 ${counts.processing||0} 份 · 未完成 ${counts.failed||0} 份。`}</p></div>`;}).catch(()=>{if(ticket===epoch){const slot=document.getElementById('account-grading-status');if(slot)slot.innerHTML='<p class="account-footnote">暂时无法读取自动批改服务状态。</p>';}});
    try{if(adminTab==='students')await students(ticket);else if(adminTab==='submissions')await submissions(ticket);else if(adminTab==='grading-tasks')await gradingTasks(ticket);else if(adminTab==='settings')await settings(ticket);else await announcements(ticket);}catch(e){if(ticket===epoch)document.getElementById('account-admin-content').innerHTML=notice(e);}
  }
  async function students(ticket){
    const data=await client.adminStudents({...filters,page,limit:30});if(ticket!==epoch)return;
    const rows=data.students||[];studentRows=rows;
    document.getElementById('account-admin-content').className='';
    document.getElementById('account-admin-content').innerHTML=`<form class="account-filter" data-account-form="student-filter"><label class="account-field">搜索学生<input name="query" value="${esc(filters.query)}" placeholder="姓名、用户名或班级" maxlength="80"></label><label class="account-field">账号状态<select name="status"><option value="">全部</option>${['pending','active','suspended'].map(s=>`<option value="${s}" ${filters.status===s?'selected':''}>${statusName[s]}</option>`).join('')}</select></label><button type="submit" class="btn primary">查询</button><button type="button" class="btn secondary" data-account-action="export-students" ${rows.length?'':'disabled'}>导出本页名单</button></form>${rows.length?`<div class="account-table-wrap"><table class="account-table"><thead><tr><th>学生</th><th>年级 / 班级</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows.map(u=>`<tr><td><strong>${esc(u.name)}</strong><small>${esc(u.username)}</small></td><td>${esc(u.grade||'—')} / ${esc(u.className||'—')}</td><td>${badge(u.status)}</td><td><button class="btn secondary small" data-account-action="student-detail" data-id="${esc(u.id)}">学习档案</button>${u.status==='pending'?`<button class="btn primary small" data-account-action="student-status" data-id="${esc(u.id)}" data-status="active">审核开通</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:empty('没有找到学生','试试其他姓名、班级或账号状态。')}<div class="account-actions account-footnote"><span>共 ${Number(data.total)||0} 人 · 第 ${page} 页</span><button class="btn secondary small" data-account-action="page-prev" ${page<=1?'disabled':''}>上一页</button><button class="btn secondary small" data-account-action="page-next" ${page*30>=(Number(data.total)||rows.length)?'disabled':''}>下一页</button></div>`;
  }
  async function submissions(ticket){
    const data=await client.adminSubmissions({page,limit:20,status:filters.reviewStatus||''});if(ticket!==epoch)return;
    document.getElementById('account-admin-content').className='';
    const rows=data.submissions||[];
    document.getElementById('account-admin-content').innerHTML=`<form class="account-filter" data-account-form="submission-filter"><label class="account-field">教师复核状态<select name="status"><option value="">全部</option><option value="submitted" ${filters.reviewStatus==='submitted'?'selected':''}>等待教师反馈</option><option value="reviewed" ${filters.reviewStatus==='reviewed'?'selected':''}>教师已复核</option></select></label><button class="btn primary" type="submit">查询</button></form>${rows.length?rows.map(s=>submissionCard(s,true)).join(''):empty('没有待显示的作业','学生提交写作和口语任务后，会出现在这里。')}<div class="account-actions account-footnote"><span>共 ${Number(data.total)||0} 份 · 第 ${page} 页</span><button class="btn secondary small" data-account-action="page-prev" ${page<=1?'disabled':''}>上一页</button><button class="btn secondary small" data-account-action="page-next" ${page*20>=(Number(data.total)||rows.length)?'disabled':''}>下一页</button></div>`;
  }
  async function gradingTasks(ticket){const data=await client.request('/api/admin/grading/tasks');if(ticket!==epoch)return;const target=document.getElementById('account-admin-content');target.className='';target.innerHTML=renderGradingTaskCatalog(data,taskFilters);}
  async function settings(ticket){
    const data=await client.adminSettings();if(ticket!==epoch)return;
    const settings=data.settings||data;
    document.getElementById('account-admin-content').className='';
    document.getElementById('account-admin-content').innerHTML=`<section class="account-panel"><h2>学生注册设置</h2><p>关闭自主注册后，不再接收新的学生注册申请；已有账号仍可正常登录。重新开放后，新注册学生仍需管理员审核。</p><form class="account-form" data-account-form="settings"><label class="account-check"><input type="checkbox" name="registrationOpen" ${settings.registrationOpen===true?'checked':''}><span>开放学生自主注册</span></label><p class="account-note" id="account-registration-status">当前状态：${settings.registrationOpen===true?'注册开放，新账号等待学校审核。':'注册已关闭，已有账号不受影响。'}</p>${errorBox()}<div class="account-actions"><button class="btn primary" type="submit">保存注册设置</button></div></form></section>`;
  }
  function exportStudents(){
    if(!studentRows.length)return;
    const cell=value=>{let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
    const rows=[['姓名','用户名','年级','班级','账号状态','注册时间'],...studentRows.map(u=>[u.name,u.username,u.grade,u.className,statusName[u.status]||u.status,u.createdAt?date(u.createdAt):''])];
    const blob=new Blob(['\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`SLS学生名单_${today()}_第${page}页.csv`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);host.toast(`已导出本页 ${studentRows.length} 名学生。`);
  }
  async function announcements(ticket){
    const data=await client.adminAnnouncements();if(ticket!==epoch)return;
    document.getElementById('account-admin-content').className='account-grid';
    document.getElementById('account-admin-content').innerHTML=`<section class="account-panel"><h2>发布学校通知</h2><p>通知会显示给已开通的学生账号。</p><form class="account-form" data-account-form="announcement">${field('title','通知标题','',{extra:'maxlength="160"'})}<label class="account-field">内容<textarea name="body" required maxlength="6000"></textarea></label>${errorBox()}<button class="btn primary" type="submit">发布通知</button></form></section><section class="account-panel"><h2>已发布通知</h2>${data.announcements?.length?data.announcements.map(a=>`<article class="account-announcement"><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><small>${date(a.createdAt)}</small></article>`).join(''):empty('还没有通知','可用于发布本周安排、测评时间或作业说明。')}</section>`;
  }
  async function studentDetail(studentId){
    selectedStudent=studentId;const target=document.getElementById('account-admin-detail');target.innerHTML='<div class="account-loading">正在载入学生档案…</div>';
    const ticket=epoch;
    try{
      const packet=await client.adminStudent(studentId);if(ticket!==epoch||selectedStudent!==studentId)return;detail=packet;
      const u=detail.user,p=detail.profile||u,saved=detail.state?.state||{},growth=saved.growth||saved.growthProfile||{},plan=detail.plan?.plan||{},view=buildAdminLearningView(detail);
      target.innerHTML=`<section class="account-panel account-detail"><div class="account-heading"><div><h2>${esc(u.name)}的学习档案</h2><p>${esc(u.username)}　${esc(u.grade||'未填写年级')} / ${esc(u.className||'未填写班级')}　${badge(u.status)}</p></div><button class="btn secondary small" data-account-action="close-detail">收起档案</button></div>
      <div class="account-actions account-detail-shortcuts">${[['assessment','测评与错题'],['practice','练习结果'],['plan','老师计划'],['work','写作与口语'],['settings','账号设置']].map(([id,label])=>`<button class="btn secondary small" data-account-action="detail-section" data-section="${id}">${label}</button>`).join('')}</div>
      <div class="account-metrics"><div class="account-metric"><span>课程训练记录</span><strong>${view.evidence.length}</strong></div><div class="account-metric"><span>能力测评记录</span><strong>${view.diagnostics.length}</strong></div><div class="account-metric"><span>写作 / 口语未复核</span><strong>${view.evidence.filter(row=>['writing','speaking'].includes(row.skill)&&!row.teacherReview?.reviewed).length}</strong></div></div>
      ${learningOverview(view)}<div id="account-student-assessment">${diagnosticHistory(view)}</div><div id="account-student-practice">${practiceHistory(view)}</div>
      <section class="account-learning-section" id="account-student-plan"><form class="account-form" data-account-form="student-plan" data-id="${esc(u.id)}"><h3>老师安排的学习计划</h3><p class="account-footnote">上方是根据作答安排的当前任务。老师可在这里补充、调整并写明复查时间，学生会在自己的计划中看到。</p>${field('title','阶段重点',plan.title||'',{extra:'maxlength="160" placeholder="例如：核对段落主旨，练习细节定位"'})}<label class="account-field">本周任务<textarea name="tasks" required maxlength="10000" placeholder="每行一个具体任务">${esc(Array.isArray(plan.tasks)?plan.tasks.map(t=>typeof t==='string'?t:t.title||'').join('\n'):plan.tasks||'')}</textarea><small>写清具体材料、完成数量和检查要求。</small></label><div class="account-pair">${field('dueDate','复查日期',plan.dueDate||'',{type:'date',required:false})}${field('weeklyMinutes','建议每周学习分钟数',plan.weeklyMinutes||'',{type:'number',required:false,extra:'min="30" max="1200" step="10"'})}</div><label class="account-field">给学生的话<textarea name="notes" maxlength="6000">${esc(plan.notes||'')}</textarea></label>${errorBox()}<button class="btn primary" type="submit">保存并发送到学生计划</button></form></section>
      <section class="account-learning-section" id="account-student-work"><h3>近期写作与口语作业</h3><p class="account-footnote">这里显示最近 ${detail.submissions?.length||0} 份提交。可查看自动批改、正文和录音，必要时补充教师复核；其他提交在“批改与复核”中分页查看。</p>${detail.submissions?.length?detail.submissions.map(s=>submissionCard(s,true)).join(''):empty('还没有作业提交','测评中的写作和口语，以及后续课程作业，提交后会出现在这里。')}<button class="btn secondary" data-account-action="admin-tab" data-tab="submissions">进入批改与复核</button></section>
      <details class="account-review-block" id="account-student-settings"><summary>账号与班级设置</summary><div class="account-grid"><form class="account-form" data-account-form="student-profile" data-id="${esc(u.id)}"><h3>账号与班级</h3><div class="account-pair">${gradeSelect(u.grade)}${field('className','班级',u.className,{required:false,extra:'maxlength="40"'})}</div><label class="account-field">账号状态<select name="status">${['pending','active','suspended'].map(s=>`<option value="${s}" ${u.status===s?'selected':''}>${statusName[s]}</option>`).join('')}</select><small>停用后学生不能继续使用账号，已有学习记录会保留。</small></label>${errorBox()}<button class="btn primary" type="submit">保存账号设置</button></form><form class="account-form" data-account-form="reset-password" data-id="${esc(u.id)}"><h3>重置学生密码</h3><p class="account-footnote">只在学生忘记密码时使用。重置后，该学生在其他设备上的登录会失效。</p>${field('password','新密码','',{type:'password',extra:'autocomplete="new-password" minlength="10" maxlength="128"'})}${field('confirmPassword','再次输入新密码','',{type:'password',extra:'autocomplete="new-password" minlength="10" maxlength="128"'})}${errorBox()}<button class="btn secondary" type="submit">重置密码</button></form></div></details>
      ${assessmentForm(u.id,detail.assessments||growth.bandAssessments||[])}</section>`;
      target.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(e){if(ticket===epoch&&selectedStudent===studentId)target.innerHTML=notice(e);}
  }
  async function render(nextRoute='account'){
    route=nextRoute;const ticket=++epoch;
    try{if(route==='register'){register();return;}if(route==='login'){login();return;}show('<div class="account-loading" role="status">正在载入账号信息…</div>');if(route==='admin')await admin(ticket);else await account(ticket);}
    catch(e){if(ticket===epoch)show(notice(e));}
  }
  function fail(form,error){let box=form.querySelector('.account-error');if(!box){box=document.createElement('div');box.className='account-error';box.setAttribute('role','alert');box.tabIndex=-1;form.append(box);}box.textContent=error.message||String(error);box.focus();}
  async function onSubmit(event){
    const form=event.target.closest('[data-account-form]');if(!form)return;event.preventDefault();
    const values=Object.fromEntries(new FormData(form)),kind=form.dataset.accountForm,button=form.querySelector('button[type="submit"]');
    if(button?.disabled)return;if(button)button.disabled=true;const box=form.querySelector('.account-error');if(box)box.textContent='';
    try{
      if(kind==='login'){
        const data=await client.login({username:values.username.trim().toLowerCase(),password:values.password});form.reset();await host.onSessionChange?.(data.user);navigate(data.user.role==='admin'?'admin':data.user.status==='active'?'growth':'account');
      }else if(kind==='register'){
        if(values.password!==values.confirmPassword)throw Error('两次输入的密码不一致。');
        await client.register({username:values.username.trim().toLowerCase(),password:values.password,name:values.name.trim(),grade:values.grade,className:values.className.trim()});
        form.reset();show(authLayout('<h1>注册已提交</h1><div class="account-success">你的账号已创建，等待学校管理员审核。现在可以登录查看审核状态。</div><p class="account-footnote">请记住自己的用户名和密码。</p><a class="btn primary" href="#login">前往登录</a>'));
      }else if(kind==='profile'){
        await client.updateProfile(values);await host.onSessionChange?.(client.user);host.toast('个人资料已保存。');
      }else if(kind==='password'){
        if(values.newPassword!==values.confirmPassword)throw Error('两次输入的新密码不一致。');
        await host.beforeLogout?.();
        await client.changePassword({currentPassword:values.currentPassword,newPassword:values.newPassword});form.reset();await host.onSessionChange?.(null);host.toast('密码已更新，请重新登录。');navigate('login');
      }else if(kind==='student-filter'){filters={...filters,query:values.query.trim(),status:values.status};page=1;await render('admin');}
      else if(kind==='submission-filter'){filters.reviewStatus=values.status;page=1;await render('admin');}
      else if(kind==='grading-task-filter'){taskFilters={query:values.query.trim(),skill:['writing','speaking'].includes(values.skill)?values.skill:''};await render('admin');}
      else if(kind==='student-profile'){await client.adminUpdateStudent(form.dataset.id,values);host.toast('学生账号设置已保存。');await studentDetail(form.dataset.id);}
      else if(kind==='reset-password'){if(values.password!==values.confirmPassword)throw Error('两次输入的新密码不一致。');await client.adminResetPassword(form.dataset.id,values.password);form.reset();host.toast('密码已重置，请通过学校认可的方式告知学生。');}
      else if(kind==='student-plan'){
        const plan={title:values.title.trim(),tasks:values.tasks.split('\n').map(t=>t.trim()).filter(Boolean),dueDate:values.dueDate||null,weeklyMinutes:values.weeklyMinutes?Number(values.weeklyMinutes):null,notes:values.notes.trim()};
        const data=await client.adminSavePlan(form.dataset.id,plan,detail?.plan?.version);if(detail)detail.plan=data;host.toast('学习计划已保存，学生登录后可以查看。');
      }else if(kind==='assessment'){
        if(!['teacher','official'].includes(values.source))throw Error('请选择已经核实的成绩来源。');
        if(values.confirmed!=='on')throw Error('请先核实成绩，再确认登记。');
        if(!/^\d{4}-\d{2}-\d{2}$/.test(values.assessedAt)||values.assessedAt>today())throw Error('请选择今天或之前的有效测评日期。');
        const assessment={source:values.source,assessedAt:values.assessedAt+'T00:00:00+08:00',skills:{},note:(values.note||'').trim()};
        for(const key of ['overall','listening','reading','writing','speaking'])if(values[key]){const value=Number(values[key]);if(!Number.isFinite(value)||value<1||value>9||!Number.isInteger(value*2))throw Error('成绩需为 1–9 分，间隔为 0.5 分。');if(key==='overall')assessment.overall=value;else assessment.skills[key]=value;}
        if(assessment.overall===undefined&&!Object.keys(assessment.skills).length)throw Error('请至少填写一项已核实的成绩。');
        await client.adminAddAssessment(form.dataset.id,assessment);host.toast('成绩已登记，将用于核对学生的个人目标。');await studentDetail(form.dataset.id);
      }else if(kind==='review'){
        const rubric={};for(const select of form.querySelectorAll('select[name^="rubric-"]'))if(select.value)rubric[select.closest('label').childNodes[0].textContent.trim()]=Number(select.value);
        const stage=values.assessmentStage,independent=values.assessmentIndependent==='on',unseen=values.assessmentUnseen==='on',readyForNextStage=values.assessmentReady==='on';
        if((independent||unseen||readyForNextStage)&&!stageNames[stage])throw Error('请先选择本次评估的训练阶段，或取消尚未确认的项目。');
        if(stageNames[stage])rubric.stage=stage;
        Object.assign(rubric,{independent,unseen,readyForNextStage});
        await client.adminReview(form.dataset.id,{feedback:values.feedback.trim(),rubric,reviewed:true});host.toast('反馈已保存。');form.closest('.account-submission').querySelector('.account-status').outerHTML=badge('reviewed');button.textContent='更新教师复核';if(selectedStudent&&document.getElementById('account-admin-detail')?.contains(form))await studentDetail(selectedStudent);
      }else if(kind==='settings'){
        const data=await client.adminUpdateSettings({registrationOpen:values.registrationOpen==='on'}),settings=data.settings||data;
        document.getElementById('account-registration-status').textContent='当前状态：'+(settings.registrationOpen===true?'注册开放，新账号等待学校审核。':'注册已关闭，已有账号不受影响。');host.toast('注册设置已保存。');
      }else if(kind==='announcement'){await client.adminCreateAnnouncement({title:values.title.trim(),body:values.body.trim()});host.toast('通知已发布。');await render('admin');}
    }catch(e){if(form.isConnected)fail(form,e);else host.toast(e.message);}
    finally{if(button?.isConnected)button.disabled=false;}
  }
  async function onClick(event){
    const button=event.target.closest('[data-account-action]');if(!button)return;event.preventDefault();if(button.disabled)return;
    const action=button.dataset.accountAction;
    try{
      if(action==='reload'){await render(route);}
      else if(action==='logout'){button.disabled=true;await host.beforeLogout?.();await client.logout();await host.onSessionChange?.(null);navigate('login');}
      else if(action==='refresh-session'){button.disabled=true;const data=await client.init();await host.onSessionChange?.(data.user);if(data.user?.status==='active')navigate(data.user.role==='admin'?'admin':'growth');else{await render('account');host.toast('状态已更新。');}}
      else if(action==='admin-tab'){adminTab=button.dataset.tab;page=1;selectedStudent=null;await render('admin');}
      else if(action==='page-prev'||action==='page-next'){page=Math.max(1,page+(action==='page-next'?1:-1));await render('admin');}
      else if(action==='export-students'){exportStudents();}
      else if(action==='student-detail'){await studentDetail(button.dataset.id);}
      else if(action==='submission-refresh'){button.disabled=true;if(selectedStudent&&document.getElementById('account-admin-detail')?.contains(button))await studentDetail(selectedStudent);else await render(route);}
      else if(action==='submission-regrade'){button.disabled=true;await client.request('/api/admin/submissions/'+encodeURIComponent(button.dataset.id)+'/regrade',{method:'POST',body:{}});host.toast('已提交重新批改。');if(selectedStudent&&document.getElementById('account-admin-detail')?.contains(button))await studentDetail(selectedStudent);else await render(route);}
      else if(action==='detail-section'){const section=document.getElementById('account-student-'+button.dataset.section);if(section?.tagName==='DETAILS')section.open=true;section?.scrollIntoView({behavior:'smooth',block:'start'});}
      else if(action==='close-detail'){selectedStudent=null;detail=null;document.getElementById('account-admin-detail').innerHTML='';}
      else if(action==='assessment-void'){if(button.dataset.confirmed!=='true'){button.dataset.confirmed='true';button.textContent='确认作废（保留记录）';return;}button.disabled=true;await client.adminVoidAssessment(button.dataset.student,button.dataset.id);host.toast('该条成绩已作废，登记历史会保留。');await studentDetail(button.dataset.student);}
      else if(action==='student-status'){button.disabled=true;await client.adminUpdateStudent(button.dataset.id,{status:button.dataset.status});host.toast('学生账号已开通。');await render('admin');}
    }catch(e){const container=button.closest('.account-panel')||document.getElementById('account-root');fail(container,e);}
    finally{if(button.isConnected)button.disabled=false;}
  }
  return{render,destroy};
}
