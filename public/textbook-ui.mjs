import {textbookWorkRoute,gradeTextbookVocabulary,writingGuidanceText} from './textbook-task-unit.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const array = value => Array.isArray(value) ? value : [];
const string = value => typeof value === 'string' ? value : '';
const readable = value => typeof value === 'string' ? value : value && typeof value === 'object' ? [value.phrase || value.en || value.title || value.text || value.expression,value.meaning || value.zh || value.description].filter(Boolean).join(' — ') : '';
const list = values => `<ul>${array(values).map(readable).filter(Boolean).map(row=>`<li>${esc(row)}</li>`).join('')}</ul>`;
const prose = value => string(value).split(/\n\s*\n|\n/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
const uid = () => globalThis.crypto?.randomUUID?.() || `textbook-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const eligibleEntries = section => array(section?.entries).filter(entry=>entry&&string(entry.term||entry.word)&&entry.practiceEligible!==false);
const safeId = value => /^[a-z0-9][a-z0-9-]*$/i.test(String(value || ''));
const ids = new Set(['writing','speaking','listening-vocabulary','ideas']);
const pageRange = section => `PDF 第 ${section.pageStart}${section.pageEnd && section.pageEnd!==section.pageStart?'–'+section.pageEnd:''} 页`;
const stageLabels = {supported:'段落与展开回答',bridge:'推导与延伸',independent:'独立完成'};
const bookDescriptions = {writing:'从审题、观点和推导开始，写成段落，再完成全文。',speaking:'用高中生活中的经历回答问题，录音后按反馈修改。','listening-vocabulary':'按场景理解词义、核对搭配，再练习拼写。',ideas:'比较观点与推导，检查结论的条件与范围。'};
export const textbookRoutes = ['textbooks','textbook'];

export const isWritingTopicRoute = route => {
  const parts=String(route).replace(/^#/,'').split('/');
  return parts[0]==='writing'&&(!parts[1]||['topic','ideas'].includes(parts[1]))||
    ['textbook','textbooks'].includes(parts[0])&&['writing','ideas'].includes(parts[1]);
};

const writingProse = value => prose(writingGuidanceText(value));

export function renderWritingGuidance(section = {}) {
  const points=array(section.points),collocations=array(section.collocations),chains=array(section.logicChains);
  const ideas=String(section.id||'').startsWith('ideas-');
  const ideasExplanation=ideas?string(section.text).replace(/^话题\s*\d+\s*[：:].*\n/,''):'';
  const explanation=ideasExplanation?writingProse(ideasExplanation):ideas?list(array(section.keyPoints).map(readable).map(writingGuidanceText)):'';

  return `${section.analysis||section.stanceCn||section.stanceEn?`<section class="tb-card"><h2>审题与立场</h2>${writingProse(section.analysis)}${section.stanceCn||section.stanceEn?`<h3>参考立场</h3>${writingProse(section.stanceCn)}${writingProse(section.stanceEn)}`:''}</section>`:''}
    ${chains.length?`<section class="tb-card"><h2>逻辑链</h2>${chains.map(chain=>`<div class="tb-chain">${writingProse(readable(chain))}</div>`).join('')}</section>`:''}
    ${explanation?`<section class="tb-card"><h2>观点与讲解</h2>${explanation}</section>`:''}
    ${points.length?`<section class="tb-card"><h2>逻辑链与讲解</h2>${points.map(point=>`<article class="tb-point"><h3>${esc(writingGuidanceText(point.title)||'观点')}</h3>${writingProse(point.statementEn)}${point.chainCn||point.chainEn?`<div class="tb-chain">${writingProse(point.chainCn)}${writingProse(point.chainEn)}</div>`:''}${writingProse(point.explanationCn)}</article>`).join('')}</section>`:''}
    ${section.paragraphGuide?`<section class="tb-card"><h2>如何写成一段</h2>${writingProse(section.paragraphGuide)}</section>`:''}
    ${collocations.length?`<section class="tb-card"><h2>词块与搭配</h2>${list(collocations.map(readable).map(writingGuidanceText))}</section>`:''}
    ${section.modelParagraph||section.modelAnswer?`<section class="tb-card"><details><summary>查看参考段落与译文</summary>${writingProse(section.modelParagraph||section.modelAnswer)}${writingProse(section.modelTranslation)}</details></section>`:''}`;
}

function renderWritingSection(payload, selectedTaskId, inline=false) {
  const section=payload.section||{},tasks=array(payload.tasks).length?payload.tasks:[payload.task].filter(Boolean);
  const main=tasks.find(task=>task.id===selectedTaskId)||tasks[0];
  const ordered=main?[main,...tasks.filter(task=>task!==main)]:[];
  const title=esc(writingGuidanceText(section.title||main?.title));
  const heading=inline?'':`<header class="tb-heading"><div><p class="tb-kicker">SLS · 写作训练</p><h1 tabindex="-1">${title}</h1></div><a class="btn secondary" href="#writing">返回写作题库与观点库</a></header>`;
  return `${heading}<section class="tb-card"><h2>${inline?title:'写作题目'}</h2><div class="tb-prompt">${writingProse(section.prompt||main?.prompt)}</div></section>
    ${renderWritingGuidance(section)}
    <section class="tb-card"><h2>动笔练习</h2><div class="tb-actions">${ordered.map((task,index)=>{const route=textbookWorkRoute(task);return route?`<a class="btn ${index?'secondary':'primary'}" href="#${route}">${esc(({paragraph:'写一个段落',reasoning:'练习论证推导',fulltask:'写一篇完整文章'})[task.progression]||'开始写作')}</a>`:'';}).join('')}</div></section>`;
}

export function renderTextbookSection(payload = {}, {vocabularyPage=0,vocabularyResult=null,draft={},selectedTaskId=null,guest=false} = {}) {
  if(['writing','ideas'].includes(payload.book?.id))return renderWritingSection(payload,selectedTaskId);
  const book=payload.book||{},section=payload.section||{},tasks=array(payload.tasks).length?payload.tasks:[payload.task].filter(Boolean);
  const main=tasks.find(task=>task.id===selectedTaskId)||tasks[0],orderedTasks=main?[main,...tasks.filter(task=>task.id!==main.id)]:[],practice=section.practice||{},isSpeaking=main?.skill==='speaking'||book.id==='speaking';
  const bookId=ids.has(book.id)?book.id:'',sectionId=safeId(section.id)?section.id:'';
  const sourceUrl=bookId&&!guest?`/api/textbooks/${bookId}/pdf#page=${Math.max(1,Number(section.pageStart)||1)}`:'';
  const allEntries=array(section.entries).filter(entry=>entry&&string(entry.term||entry.word));
  const start=Math.max(0,vocabularyPage)*12,practiceEntries=eligibleEntries(section),entries=practiceEntries.slice(start,start+12);
  const points=array(section.points),collocations=array(section.collocations);
  const context=readable(section.studentGuidance||practice.studentGuidance||section.studentContext),adaptation=string(section.adaptationNote),displayTitle=main?.title||practice.title||section.title||'教材内容';
  return `<header class="tb-heading"><div><p class="tb-kicker">教材课程</p><h1 tabindex="-1">${esc(displayTitle)}</h1><p>${esc(book.title)} · ${displayTitle!==section.title?'原书主题：'+esc(section.title)+' · ':''}${esc(section.category||'')} · ${esc(pageRange(section))}</p></div><div class="tb-actions"><a class="btn secondary" href="#textbooks/${esc(bookId)}">返回章节</a>${sourceUrl?`<a class="btn secondary" href="${sourceUrl}" target="_blank" rel="noopener">打开教材页</a>`:''}</div></header>
    ${main?`<section class="tb-card tb-task-start"><div><p class="tb-kicker">${isSpeaking?'校园口语练习':'本节表达任务'}</p><h2>${esc(main.title||section.title)}</h2>${context?`<p>${esc(context)}</p>`:''}<div class="tb-prompt">${prose(main.prompt)}</div>${list(main.requirements?.instructions||practice.requirements)}${main.requirements?.wordTarget?`<p class="tb-muted">本次练习：${esc(main.requirements.wordTarget.min)}–${esc(main.requirements.wordTarget.max)} 词</p>`:main.requirements?.speakingSeconds?`<p class="tb-muted">建议作答：${esc(main.requirements.speakingSeconds)} 秒</p>`:''}<p class="tb-muted">${guest?(isSpeaking?'录下完整回答后，可以回听并下载录音。':'完成自己的段落或文章，并保存在当前浏览器。'):(isSpeaking?'录下完整回答并提交给老师，在作品记录中查看教师反馈。自动批改暂未开通。':'完成自己的段落或文章并提交给老师。自动批改暂未开通，草稿与每次修改都会保留。')}</p></div><div class="tb-actions">${orderedTasks.map((task,index)=>{const route=textbookWorkRoute(task);return route?`<a class="btn ${index?'secondary':'primary'}" href="#${route}">${index?esc(stageLabels[task.stage]||task.title):isSpeaking?'准备并录音':'开始写作'}</a>`:'';}).join('')}</div><ol class="tb-steps"><li>看问题与要求</li><li>读下方内容，选取有用表达</li><li>完成自己的回答${guest?'':'并提交'}</li><li>${guest?'自查后修改或重新录音':'按反馈修改或重新录音'}</li></ol></section>`:''}
    ${!isSpeaking&&section.prompt?`<section class="tb-card"><h2>教材讨论题</h2>${prose(section.prompt)}<p class="tb-muted">上方英文练习根据本题改编，可先完成段落，再写全文。</p></section>`:''}
    ${array(section.learningObjectives).length?`<section class="tb-card"><h2>本节练什么</h2>${list(section.learningObjectives)}</section>`:''}
    ${section.analysis||section.stanceCn?`<section class="tb-card"><h2>先读懂题目</h2>${prose(section.analysis)}${section.stanceCn?`<details><summary>教材中的一种立场</summary>${prose(section.stanceCn)}${prose(section.stanceEn)}<p class="tb-muted">可以采用不同立场，关键是回应题目并解释清楚。</p></details>`:''}</section>`:''}
    ${points.length?`<section class="tb-card"><h2>观点怎样展开</h2>${points.map(point=>`<details class="tb-point"><summary>${esc(point.title||'观点')}</summary>${prose(point.statementEn)}${point.chainCn?`<div class="tb-chain">${prose(point.chainCn)}${prose(point.chainEn)}</div>`:''}${prose(point.explanationCn)}</details>`).join('')}</section>`:array(section.logicChains).length?`<section class="tb-card"><h2>推导与条件</h2>${array(section.logicChains).map(chain=>`<details class="tb-point"><summary>${esc(readable(chain).slice(0,100)||'查看推导')}</summary>${prose(readable(chain))}</details>`).join('')}<p class="tb-muted">检查中间步骤、适用条件与反例；材料中的观点可以讨论。</p></section>`:''}
    ${!isSpeaking&&!points.length&&array(section.keyPoints).length?`<section class="tb-card"><h2>阅读要点</h2>${list(section.keyPoints)}${prose(section.readingNote)}</section>`:''}
    ${array(section.sourceExpressions).length?`<section class="tb-card"><details><summary>教材词块与搭配</summary>${list(section.sourceExpressions)}<p class="tb-muted">只选适合本题和自己经历的表达。</p></details></section>`:''}
    ${section.paragraphGuide?`<section class="tb-card"><h2>怎样连成一段</h2>${prose(section.paragraphGuide)}</section>`:''}
    ${array(section.languageSupport).length?`<section class="tb-card"><h2>${isSpeaking?'回答时可以这样表达':'可用表达'}</h2>${list(section.languageSupport)}<p class="tb-muted">选取适合自己意思的表达，换成自己的细节。</p></section>`:''}
    ${collocations.length?`<section class="tb-card"><h2>词块与搭配</h2><div class="tb-language-grid">${collocations.map(row=>`<article><strong>${esc(row.phrase)}</strong><p>${esc(row.meaning)}</p>${row.example?`<p class="tb-example">${esc(row.example)}</p>`:''}</article>`).join('')}</div></section>`:''}
    ${practiceEntries.length?`<section class="tb-card"><h2>场景词汇：词义与拼写</h2><p>看中文意思，写出本页教材中的英文词或词组。本项是文字练习，不计作听力听写成绩。</p><form data-tb-form="vocabulary"><div class="tb-vocab-grid">${entries.map((entry,index)=>`<label><span>${start+index+1}. ${esc(entry.meaning||entry.translation||'请对照教材核对词义')}</span><input name="word:${index}" autocomplete="off" spellcheck="false" value="${esc(vocabularyResult?.[index]?.response??draft.answers?.[start+index]??'')}" maxlength="180">${vocabularyResult?`<small class="${vocabularyResult[index]?.correct?'tb-correct':'tb-wrong'}">${vocabularyResult[index]?.correct?'正确':`本页写法：${esc(entry.term||entry.word)}`}</small>`:''}</label>`).join('')}</div><div class="tb-actions"><button class="btn primary" type="submit">核对并保存</button><span class="tb-muted">${start+1}–${start+entries.length} / ${practiceEntries.length} 个词条</span></div></form><div class="tb-actions tb-pagination"><button type="button" class="btn secondary" data-tb-action="vocab-page" data-page="${vocabularyPage-1}" ${vocabularyPage===0?'disabled':''}>上一组</button><button type="button" class="btn secondary" data-tb-action="vocab-page" data-page="${vocabularyPage+1}" ${start+12>=practiceEntries.length?'disabled':''}>下一组</button></div><details><summary>查看本场景词条</summary><div class="tb-table"><table><thead><tr><th>词或词组</th><th>意思</th><th>页码</th></tr></thead><tbody>${allEntries.map(entry=>`<tr><td>${esc(entry.term||entry.word)}</td><td>${esc(entry.meaning||entry.translation||'')}</td><td>${esc(entry.page||section.pageStart)}</td></tr>`).join('')}</tbody></table></div></details></section>`:''}
    ${section.modelParagraph||section.modelAnswer?`<section class="tb-card"><details><summary>完成自己的回答后，再看教材参考表达</summary>${prose(section.modelParagraph||section.modelAnswer)}${prose(section.modelTranslation)}<p class="tb-muted">参考内容用于比较思路；请保留自己的经历和表达。</p></details></section>`:''}
    ${guest?'':`<section class="tb-card"><details><summary>教材原文 · ${esc(pageRange(section))}</summary><p class="tb-muted">以下保留教材原文。${isSpeaking?'校园练习题与提示显示在本页上方，教材示例不代表你的真实经历。':''}</p>${adaptation?`<h3>练习来源说明</h3><p class="tb-muted">${esc(adaptation)}</p>`:''}${isSpeaking&&array(section.keyPoints).length?`<h3>原书讲解</h3>${list(section.keyPoints)}`:''}<div class="tb-source-text">${prose(section.text)}</div>${sourceUrl?`<a href="${sourceUrl}" target="_blank" rel="noopener">对照 PDF 原页</a>`:''}</details></section>`}
    <div class="tb-actions"><button class="btn secondary" data-tb-action="read">记录已读本节</button><a class="btn secondary" href="#${guest?'overview':'plan'}">${guest?'返回首页':'返回个人计划'}</a></div>`;
}

export function createTextbookUI(host) {
  let root=null,owner=null,generation=0,books=[],catalogs=new Map(),payload=null,writingPreviews=new Map(),writingDirectoryId='writing',query='',writingQuery='',selectedBook='',vocabularyPage=0,vocabularyResult=null,busy=false,draftTimer,selectedTaskId=null,savingDraft=Promise.resolve();
  const accountId=()=>String(host.getAccount?.()?.id||host.getProfile?.()?.id||'');
  const profile=()=>host.getProfile?.()||{};
  const heading=(title,subtitle)=>`<header class="tb-heading"><div><p class="tb-kicker">SLS · 教材课程</p><h1 tabindex="-1">${esc(title)}</h1><p>${esc(subtitle)}</p></div><a class="btn secondary" href="#plan">返回学习计划</a></header>`;
  const layout=html=>{host.shell(`<div class="textbook-app" id="textbook-root">${html}<div id="tb-message" aria-live="polite"></div></div>`);root=document.getElementById('textbook-root');root.addEventListener('click',onClick);root.addEventListener('submit',onSubmit);root.addEventListener('input',onInput);};
  const message=(value,error=false)=>{const slot=root?.querySelector('#tb-message');if(slot){slot.className=`tb-message ${error?'error':''}`;slot.textContent=value;}host.toast?.(value);};
  const draftKey=()=>`${payload?.book?.id}:${payload?.section?.id}`;
  const getDraft=()=>profile().ui?.textbookVocabularyDrafts?.[draftKey()]||{};
  async function saveUi(patch,expected=owner){if(expected!==accountId())throw Error('账号已切换。');await host.setProfile({...profile(),ui:{...profile().ui,...patch}});if(expected!==accountId())throw Error('账号已切换。');}
  function sectionPage(){layout(renderTextbookSection(payload,{vocabularyPage,vocabularyResult,draft:getDraft(),selectedTaskId,guest:host.guest}));}
  const writingHeading=(title,subtitle)=>`<header class="tb-heading"><div><p class="tb-kicker">SLS · 写作训练</p><h1 tabindex="-1">${esc(title)}</h1><p>${esc(subtitle)}</p></div><a class="btn secondary" href="#writing/practice">基础写作练习</a></header>`;
  function writingDirectory(){
    const needle=writingQuery.trim().toLocaleLowerCase(),preview=writingPreviews.get(writingDirectoryId);
    const sectionsByType=['writing','ideas'].map(type=>{
      const sections=array(catalogs.get(type)?.sections);
      const matches=sections.filter(section=>!needle||[section.title,section.category,...array(section.learningObjectives)].join(' ').toLocaleLowerCase().includes(needle));
      const prefix=type==='ideas'?'ideas':'topic';
      return `<details class="tb-card" ${needle?'open':''}><summary>${type==='ideas'?'浏览观点库':'浏览写作题'} · ${sections.length} ${type==='ideas'?'个话题':'道题'}</summary>
        ${needle?`<p class="tb-muted">${matches.length} 项匹配</p>`:''}
        ${matches.length?`<div class="tb-section-grid">${matches.map(section=>`<a class="tb-section" href="#writing/${prefix}/${esc(section.id)}"><small>${esc(writingGuidanceText(section.category))}</small><strong>${esc(writingGuidanceText(section.title))}</strong><span>${type==='ideas'?'查看观点与讲解':'查看题目与讲解'}</span></a>`).join('')}</div>`:'<p class="tb-muted">没有找到匹配的内容。</p>'}</details>`;
    });
    layout(`${writingHeading('写作题库与观点库','直接看题目、审题、逻辑链和讲解，再完成写作。')}
      <div class="tb-actions"><a class="btn ${writingDirectoryId==='writing'?'primary':'secondary'}" href="#writing">写作题库</a><a class="btn ${writingDirectoryId==='ideas'?'primary':'secondary'}" href="#writing/ideas">观点库</a></div>
      <form class="tb-search" data-tb-form="writing-search"><label>查找题目或观点<input name="query" type="search" value="${esc(writingQuery)}" placeholder="例如：教育、科技、环境" maxlength="120"></label><button class="btn primary">查找</button></form>
      ${host.guest&&preview&&!needle?renderWritingSection(preview,null,true):''}${sectionsByType.join('')}${!host.guest&&preview&&!needle?renderWritingSection(preview,null,true):''}`);
  }
  async function renderWritingRoute(parts,expected,ticket) {
    const [route,group,sectionId,taskId]=parts;
    const type=group==='ideas'?'ideas':'writing';
    if(sectionId||group==='topic'||route==='textbook'){
      if(!safeId(sectionId))throw Error('没有找到这道写作题。');
      const data=await host.request(`/api/textbooks/${type}/sections/${sectionId}`);
      if(expected!==accountId()||ticket!==generation)return;
      payload=data;
      selectedTaskId=taskId||null;
      sectionPage();
      return;
    }
    const missing=['writing','ideas'].filter(id=>!catalogs.has(id));
    const loaded=await Promise.allSettled(missing.map(id=>host.request(`/api/textbooks/${id}`)));
    if(expected!==accountId()||ticket!==generation)return;
    loaded.forEach((result,index)=>{if(result.status==='fulfilled')catalogs.set(missing[index],result.value);});
    if(!catalogs.has(type))throw Error('暂时无法打开写作内容。');
    const first=array(catalogs.get(type)?.sections)[0];
    if(!writingPreviews.has(type)&&safeId(first?.id)){
      try{
        const data=await host.request(`/api/textbooks/${type}/sections/${first.id}`);
        if(expected!==accountId()||ticket!==generation)return;
        writingPreviews.set(type,data);
      }catch{
        if(expected!==accountId()||ticket!==generation)return;
      }
    }
    writingDirectoryId=type;
    writingQuery='';
    writingDirectory();
  }
  function directory(){const rows=books.filter(book=>!selectedBook||book.id===selectedBook),needle=query.trim().toLocaleLowerCase();layout(`${heading(selectedBook?books.find(book=>book.id===selectedBook)?.title||'教材课程':'教材课程',host.guest?'按主题查找练习。读完后完成自己的表达任务。':'按学习计划进入对应章节，也可以按主题查找。读完后完成自己的表达任务。')}<nav class="tb-book-tabs" aria-label="教材分类"><a href="#textbooks" class="${!selectedBook?'active':''}">全部教材</a>${books.map(book=>`<a href="#textbooks/${esc(book.id)}" class="${selectedBook===book.id?'active':''}">${esc(book.title)}</a>`).join('')}</nav><form class="tb-search" data-tb-form="search"><label>查找主题<input name="query" type="search" value="${esc(query)}" placeholder="例如：团队、运动、科技、环境" maxlength="120"></label><button class="btn primary">查找</button></form>${rows.map(book=>{const sections=array(catalogs.get(book.id)?.sections||catalogs.get(book.id)?.book?.sections),matches=sections.filter(section=>!needle||[section.title,section.displayTitle,section.practice?.title,section.category,...array(section.keyPoints)].join(' ').toLocaleLowerCase().includes(needle));return `<section class="tb-card"><div class="tb-card-head"><div><h2>${esc(book.title)}</h2><p>${esc(bookDescriptions[book.id]||'按章节阅读并练习。')}</p><p class="tb-muted">${Number(book.pageCount)||0} 页 · ${Number(book.sectionCount)||sections.length} 个章节${Number.isInteger(book.taskCount)?' · '+book.taskCount+' 项表达任务':''}</p></div>${host.guest?'':`<a class="btn secondary small" href="/api/textbooks/${esc(book.id)}/pdf" target="_blank" rel="noopener">打开教材</a>`}</div>${matches.length?`<div class="tb-section-grid">${matches.map(section=>`<a class="tb-section" href="#textbook/${esc(book.id)}/${esc(section.id)}"><small>${esc(section.category||'')}</small><strong>${esc(section.displayTitle||section.practice?.title||section.title)}</strong>${section.displayTitle&&section.displayTitle!==section.title?`<small>原书主题：${esc(section.title)}</small>`:''}<span>${esc(pageRange(section))}${section.taskId?' · 含表达任务':''}</span></a>`).join('')}</div>`:`<p class="tb-muted">${sections.length?'没有找到匹配主题，试试其他关键词。':'章节目录暂未载入，请刷新后重试。'}</p>`}</section>`;}).join('')}`);}
  function destroy(){clearTimeout(draftTimer);const form=root?.querySelector('[data-tb-form="vocabulary"]');if(form&&owner===accountId())queueVocabularyDraft(form).catch(()=>{});generation++;root=null;busy=false;}
  function reset(){destroy();owner=null;books=[];catalogs.clear();payload=null;writingPreviews.clear();writingDirectoryId='writing';query='';writingQuery='';selectedBook='';selectedTaskId=null;vocabularyPage=0;vocabularyResult=null;}
  async function render(route='textbooks'){destroy();if(owner!==null&&owner!==accountId())reset();owner=accountId();const expected=owner,ticket=generation;const parts=String(route).replace(/^#/,'').split('/').map(part=>{try{return decodeURIComponent(part);}catch{return '';}});const writing=isWritingTopicRoute(route);layout(writing?writingHeading('写作题库','正在载入题目…'):heading('教材课程','正在载入章节…'));try{if(writing){await renderWritingRoute(parts,expected,ticket);}else if(parts[0]==='textbook'){if(!ids.has(parts[1])||!safeId(parts[2]))throw Error('没有找到这节教材。');payload=await host.request(`/api/textbooks/${parts[1]}/sections/${parts[2]}`);if(expected!==accountId()||ticket!==generation)return;selectedTaskId=parts[3]||null;if(selectedTaskId&&!array(payload.tasks).some(task=>task.id===selectedTaskId)&&payload.task?.id!==selectedTaskId)throw Error('没有找到计划中的教材练习，请重新打开该章节。');vocabularyPage=0;vocabularyResult=null;sectionPage();}else{selectedBook=ids.has(parts[1])?parts[1]:'';if(!books.length){const data=await host.request('/api/textbooks');if(expected!==accountId()||ticket!==generation)return;books=array(data.books).filter(book=>ids.has(book.id)&&!['writing','ideas'].includes(book.id)&&book.imported!==false);const fetched=await Promise.allSettled(books.map(book=>host.request(`/api/textbooks/${book.id}`)));if(expected!==accountId()||ticket!==generation)return;fetched.forEach((result,index)=>{if(result.status==='fulfilled')catalogs.set(books[index].id,result.value);});}if(!books.length)throw Error('教材目录暂时不可用，请稍后刷新。');directory();}root?.querySelector('h1')?.focus({preventScroll:true});}catch(error){if(expected!==accountId()||ticket!==generation)return;layout(writing?`${writingHeading('写作题库','暂时无法打开写作题目。')}<div class="tb-message error">请稍后重试，也可以先做基础写作练习。</div>`:`${heading('教材课程','本次未能打开材料。')}<div class="tb-message error">${esc(error.message||'请稍后重试。')}</div><a class="btn secondary" href="#textbooks">返回教材目录</a>`);}}
  function queueVocabularyDraft(form){
    const expected=owner,key=draftKey(),answers={},start=vocabularyPage*12;
    new FormData(form).forEach((value,name)=>{if(name.startsWith('word:'))answers[start+Number(name.slice(5))]=String(value);});
    const save=async()=>{if(expected!==accountId())return;const previous=profile().ui?.textbookVocabularyDrafts||{};await saveUi({textbookVocabularyDrafts:{...previous,[key]:{answers:{...previous[key]?.answers,...answers},updatedAt:Date.now()}}},expected);};
    savingDraft=savingDraft.catch(()=>{}).then(save);return savingDraft;
  }
  async function onSubmit(event){event.preventDefault();const form=event.target;if(form.dataset.tbForm==='writing-search'){writingQuery=String(new FormData(form).get('query')||'');writingDirectory();return;}if(form.dataset.tbForm==='search'){query=String(new FormData(form).get('query')||'');directory();return;}if(form.dataset.tbForm!=='vocabulary'||busy)return;busy=true;const expected=owner,ticket=generation;try{clearTimeout(draftTimer);await queueVocabularyDraft(form);if(expected!==accountId()||ticket!==generation)return;const entries=eligibleEntries(payload.section).slice(vocabularyPage*12,vocabularyPage*12+12),data=new FormData(form);vocabularyResult=gradeTextbookVocabulary(entries,entries.map((_,index)=>data.get(`word:${index}`)||''));const result={id:uid(),bookId:payload.book.id,sectionId:payload.section.id,page:vocabularyPage,finishedAt:Date.now(),mode:'text_spelling',correct:vocabularyResult.filter(row=>row.correct).length,total:entries.length,rows:vocabularyResult.map(row=>({term:row.entry.term||row.entry.word,response:row.response,correct:row.correct,sourcePage:row.entry.page||payload.section.pageStart}))};await saveUi({textbookVocabularyAttempts:[...array(profile().ui?.textbookVocabularyAttempts),result].slice(-200)},expected);if(expected!==accountId()||ticket!==generation)return;sectionPage();message(`已保存：${result.correct} / ${result.total} 个词条正确。对照本页词条订正后再练。`);}catch(error){if(expected===accountId()&&ticket===generation)message(error.message,true);}finally{busy=false;}}
  function onInput(event){const form=event.target.closest('[data-tb-form="vocabulary"]');if(!form)return;clearTimeout(draftTimer);const ticket=generation;draftTimer=setTimeout(()=>{if(ticket===generation)queueVocabularyDraft(form).catch(error=>message(error.message,true));},500);}
  async function onClick(event){const button=event.target.closest('[data-tb-action]');if(!button||busy)return;busy=true;const expected=owner,ticket=generation;try{if(button.dataset.tbAction==='read'){const key=draftKey();await saveUi({textbookReading:{...profile().ui?.textbookReading,[key]:{bookId:payload.book.id,sectionId:payload.section.id,pageStart:payload.section.pageStart,pageEnd:payload.section.pageEnd,readAt:Date.now()}}},expected);if(ticket===generation)message(host.guest?'阅读进度已保存在当前浏览器。':'已记录阅读进度。完成表达任务后，再查看批改。');}else if(button.dataset.tbAction==='vocab-page'){clearTimeout(draftTimer);const form=root.querySelector('[data-tb-form="vocabulary"]');if(form)await queueVocabularyDraft(form);if(ticket!==generation||expected!==accountId())return;vocabularyPage=Math.max(0,Number(button.dataset.page)||0);vocabularyResult=null;sectionPage();}}catch(error){if(ticket===generation&&expected===accountId())message(error.message,true);}finally{busy=false;}}
  return {handles:route=>isWritingTopicRoute(route)||textbookRoutes.includes(String(route).replace(/^#/,'').split('/')[0]),render,destroy,reset};
}
