const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const catalogTitle=data=>{const volumes=data?.volumes?.map(book=>Number(book.volume)).filter(n=>Number.isInteger(n)&&n>=5&&n<=20)||[];return volumes.length?`剑桥雅思 ${Math.min(...volumes)}${volumes.length>1?'—'+Math.max(...volumes):''}`:'剑桥雅思 5—20';};
const subjectNames={reading:'阅读',listening:'听力'};
const expectedParts={reading:[1,2,3],listening:[1,2,3,4]};
const safeFile=value=>typeof value==='string'&&/^data\/cambridge\/[A-Za-z0-9_./-]+\.json$/.test(value)&&!value.split('/').includes('..');
const safeAudio=value=>typeof value==='string'&&!!value&&!value.split('/').includes('..')&&(/^(?:\/(?!\/)|\.\/|media\/|assets\/)/.test(value)||!!safeUrl(value));
const safeUrl=value=>{try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:'';}catch{return '';}};

export function normalizeCambridgeCatalog(data){
  if(!data||!Array.isArray(data.volumes))throw Error('剑桥题库目录格式不正确，请重新加载。');
  const seenVolumes=new Set(),seenIds=new Set();
  const volumes=data.volumes.filter(book=>Number.isInteger(Number(book?.volume))&&Number(book.volume)>=5&&Number(book.volume)<=20).map(book=>{
    const volume=Number(book.volume);
    if(seenVolumes.has(volume))throw Error('剑桥题库目录存在重复卷册。');
    seenVolumes.add(volume);
    const seenTests=new Set();
    const tests=(Array.isArray(book.tests)?book.tests:[]).map(test=>{
      const testNumber=Number(test.testNumber);
      if(!Number.isInteger(testNumber)||testNumber<1||seenTests.has(testNumber))throw Error('剑桥题库目录存在无效或重复的Test编号。');
      seenTests.add(testNumber);
      const result={...test,testNumber,title:test.title||`Test ${testNumber}`};
      for(const subject of ['reading','listening'])result[subject]=(Array.isArray(test[subject])?test[subject]:[]).map(meta=>{
        if(!meta||typeof meta.id!=='string'||!meta.id||seenIds.has(meta.id))throw Error('剑桥题库目录存在无效或重复的题目编号。');
        seenIds.add(meta.id);
        return {...meta,subject,part:Number(meta.part),questionCount:Number(meta.questionCount)||0,cambridge:{...meta.cambridge,volume,test:testNumber}};
      }).sort((a,b)=>a.part-b.part);
      return result;
    }).sort((a,b)=>a.testNumber-b.testNumber);
    return {...book,volume,title:book.title||`剑桥雅思 ${volume}`,tests};
  }).sort((a,b)=>a.volume-b.volume);
  return {...data,volumes};
}

export function canStartCambridgeSection(meta){
  if(!meta||!['ready','review'].includes(meta.status)||!safeFile(meta.file)||!expectedParts[meta.subject]?.includes(meta.part)||meta.questionCount<1)return false;
  if(meta.subject==='listening'){
    const audio=meta.audio;
    return !!audio&&audio.status==='ready'&&safeAudio(audio.src)&&!['missing','pending','failed'].includes(meta.audioStatus);
  }
  return true;
}

export function cambridgeSetState(sections,subject){
  const expected=expectedParts[subject]||[],items=Array.isArray(sections)?sections:[];
  if(items.length!==expected.length||expected.some(part=>items.filter(item=>Number(item.part)===part).length!==1))return {ready:false,reason:'题目尚未齐全'};
  if(items.some(item=>!canStartCambridgeSection({...item,subject})))return {ready:false,reason:subject==='listening'?'题目或音频待补齐':'题目待补齐'};
  if(items.some(item=>item.status==='review'||Number(item.unscorableCount)>0))return {ready:false,reason:'部分题目待核对'};
  if(items.reduce((count,item)=>count+(Number(item.questionCount)||0),0)!==40)return {ready:false,reason:'整套题量待核对'};
  return {ready:true,reason:''};
}

export function selectCambridgeTest(catalog,route='cambridge'){
  const parts=String(route).replace(/^#/,'').split('/'),volumes=catalog?.volumes||[];
  const book=volumes.find(item=>item.volume===Number(parts[1]))||volumes[0]||null;
  const test=book?.tests.find(item=>item.testNumber===Number(parts[2]))||book?.tests[0]||null;
  return {book,test};
}

export function selectCambridgePreview(catalog,route){
  const parts=String(route||'').replace(/^#/,'').split('/');
  if(parts.length!==5||parts[0]!=='cambridge'||parts[3]!=='view')return null;
  const book=catalog?.volumes?.find(item=>item.volume===Number(parts[1])),test=book?.tests.find(item=>item.testNumber===Number(parts[2]));
  if(!test)return null;
  let id;try{id=decodeURIComponent(parts[4]);}catch{return null;}
  return [...test.reading,...test.listening].find(meta=>meta.id===id&&safeFile(meta.file))||null;
}

function sectionStatus(meta){
  if(meta.status==='pending'&&!meta.file)return '待迁移';
  if(canStartCambridgeSection(meta))return meta.status==='review'?'可练习 · 含待核对题':'可练习';
  if(meta.subject==='listening'&&meta.file&&meta.audioStatus==='pending')return '题目已收录 · 音频待补齐';
  if(meta.subject==='listening'&&meta.file&&(!meta.audio?.src||meta.audio?.status!=='ready'))return '音频待补齐';
  return '材料待补齐';
}

function sectionCard(meta){
  const ready=canStartCambridgeSection(meta),source=safeUrl(meta.sourcePracticeUrl||meta.sourceUrl),preview=safeFile(meta.file),showSubtitle=meta.titleCn&&String(meta.titleCn).trim().toLocaleLowerCase()!==String(meta.title||'').trim().toLocaleLowerCase();
  return `<article class="cb-section-card"><div class="cb-section-top"><span class="cb-part">${meta.subject==='reading'?'Passage':'Part'} ${escapeHtml(meta.part)}</span><span class="cb-status${ready?' is-ready':''}">${sectionStatus(meta)}</span></div><h3>${escapeHtml(meta.title||`${subjectNames[meta.subject]} ${meta.part}`)}</h3>${showSubtitle?`<p class="cb-section-subtitle">${escapeHtml(meta.titleCn)}</p>`:''}<p class="cb-section-meta">${meta.questionCount?`${meta.questionCount} 道题`:'题量待核对'}${meta.types?.length?` · ${meta.types.map(escapeHtml).join(' / ')}`:''}</p><div class="cb-section-actions"><button class="btn secondary small" type="button" data-cb-action="section" data-cb-id="${escapeHtml(meta.id)}" ${ready?'':'disabled'}>${ready?'单独练习':meta.subject==='listening'&&preview?'音频待补齐':sectionStatus(meta)}</button>${preview?`<a class="btn secondary small" href="#cambridge/${meta.cambridge.volume}/${meta.cambridge.test}/view/${encodeURIComponent(meta.id)}">查看题目</a>`:!ready&&source?`<a class="cb-source-link" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">查看来源材料<span aria-hidden="true"> ↗</span></a>`:''}</div></article>`;
}

function subjectPanel(test,subject,query=''){
  const all=test?.[subject]||[],state=cambridgeSetState(all,subject),q=query.trim().toLocaleLowerCase(),filtered=all.filter(meta=>!q||`${meta.title||''} ${meta.titleCn||''} ${(meta.types||[]).join(' ')}`.toLocaleLowerCase().includes(q));
  const readyCount=all.filter(canStartCambridgeSection).length;
  return `<section class="cb-subject" aria-labelledby="cb-${subject}-title"><header class="cb-subject-header"><div><p class="cb-eyebrow">${subject==='reading'?'IELTS READING':'IELTS LISTENING'}</p><h2 id="cb-${subject}-title">${subjectNames[subject]}</h2><p>${subject==='reading'?'3篇文章 · 整套60分钟':'4个部分 · 按音频时长计时'}<span class="cb-ready-count">${readyCount} / ${expectedParts[subject].length} ${subject==='reading'?'篇可练':'节可练'}</span></p></div><button class="btn ${state.ready?'primary':'secondary'}" type="button" data-cb-action="set" data-cb-subject="${subject}" ${state.ready?'':'disabled'}>${state.ready?`开始整套${subjectNames[subject]}`:state.reason}</button></header><div class="cb-section-grid">${filtered.length?filtered.map(sectionCard).join(''):`<div class="cb-empty">${all.length?'没有找到符合关键词的题目。':'本套材料尚未载入。'}</div>`}</div></section>`;
}

export function renderCambridgePreview(passage,meta,{renderHtml}={}){
  const html=value=>renderHtml?renderHtml(String(value||'')):escapeHtml(value||''),plain=value=>escapeHtml(value||'').replace(/\r?\n/g,'<br>');
  const number=question=>question.sourceNumber??question.sourceSlot??question.id;
  const options=values=>`<ol class="cb-preview-options">${(values||[]).map(option=>`<li><strong>${escapeHtml(option.value)}</strong><span>${option.contentHtml?html(option.contentHtml):plain(option.text)}</span></li>`).join('')}</ol>`;
  const audioReady=meta.subject==='listening'&&passage.audio?.status==='ready'&&safeAudio(passage.audio.src);
  const back=`#cambridge/${meta.cambridge.volume}/${meta.cambridge.test}`;
  const groups=(passage.groups||[]).map((group,index)=>{
    const questions=group.questions||[],seenBlocks=new Set(),first=questions[0],last=questions.at(-1);
    const questionHtml=questions.filter(question=>{if(!question.blockId)return true;if(seenBlocks.has(question.blockId))return false;seenBlocks.add(question.blockId);return true;}).map(question=>{
      const block=question.blockId?questions.filter(item=>item.blockId===question.blockId):[question],label=block.length>1?`${number(block[0])}–${number(block.at(-1))}`:number(question);
      return `<article class="cb-preview-question"><div class="cb-preview-question-number">${escapeHtml(label)}</div><div class="cb-preview-question-content">${question.promptHtml?html(question.promptHtml):plain(question.prompt)}${question.image&&!question.promptHtml?html(`<img src="${escapeHtml(question.image)}" alt="第${escapeHtml(label)}题配图">`):''}${question.options?.length&&!group.options?.length?options(question.options):''}</div></article>`;
    }).join('');
    return `<section class="cb-preview-group"><header><span class="cb-eyebrow">QUESTION GROUP ${index+1}</span><h2>${first?`Questions ${escapeHtml(number(first))}${questions.length>1?`–${escapeHtml(number(last))}`:''}`:'题目'}</h2></header>${group.instruction?`<div class="cb-preview-instruction">${plain(group.instruction)}</div>`:''}${group.heading?`<h3>${plain(group.heading)}</h3>`:''}${group.contextHtml?`<div class="group-context">${html(group.contextHtml)}</div>`:''}${group.image?html(`<img src="${escapeHtml(group.image)}" alt="题组配图">`):''}${group.options?.length?options(group.options):''}<div class="cb-preview-questions">${questionHtml}</div></section>`;
  }).join('');
  const body=passage.articleHtml?html(passage.articleHtml):(passage.paragraphs||[]).map(paragraph=>`<p>${paragraph.label?`<strong>${escapeHtml(paragraph.label)}</strong> `:''}${plain(paragraph.text)}</p>`).join('');
  const answers=(passage.groups||[]).flatMap(group=>group.questions||[]).map(question=>`<li><strong>${escapeHtml(number(question))}</strong><span>${Array.isArray(question.answers)&&question.answers.length?question.answers.map(escapeHtml).join(' / '):'答案待核对'}</span></li>`).join('');
  return `<section class="cb-library cb-preview" data-cambridge><header class="cb-page-heading"><div><p class="cb-eyebrow">剑 ${meta.cambridge.volume} · TEST ${meta.cambridge.test} · ${subjectNames[meta.subject]} ${meta.part}</p><h1>${escapeHtml(passage.title||meta.title)}</h1><p>只读预览，可查看题目和参考答案。</p></div><div class="cb-preview-header-actions"><a class="btn secondary small" href="${back}">返回本套题目</a>${canStartCambridgeSection(meta)?`<button class="btn primary small" data-cb-action="section" data-cb-id="${escapeHtml(meta.id)}">开始练习</button>`:''}</div></header>${meta.subject==='listening'&&!audioReady?'<p class="cb-preview-audio-note" role="status">题目已收录，音频待补齐。</p>':''}${audioReady?`<section class="cb-preview-audio"><h2>听力音频</h2><audio controls preload="none" src="${escapeHtml(passage.audio.src)}"></audio></section>`:''}${body?`<section class="cb-preview-article"><h2>${meta.subject==='reading'?'阅读文章':'题目背景'}</h2><div class="article-body">${body}</div></section>`:''}${groups}${meta.subject==='listening'&&passage.transcriptHtml?`<details class="cb-preview-transcript"><summary>查看听力原文</summary><div>${html(passage.transcriptHtml)}</div></details>`:''}<details class="cb-preview-answers"><summary>查看参考答案</summary><ol>${answers}</ol></details><div class="cb-preview-footer"><a class="btn secondary" href="${back}">返回剑 ${meta.cambridge.volume} · Test ${meta.cambridge.test}</a></div><p class="cb-feedback" data-cb-feedback role="status" aria-live="polite"></p></section>`;
}

export function createCambridgeUI(host){
  let catalog=null,catalogPromise=null,renderToken=0,activeRoot=null,selected=null,busy=false;
  const passageCache=new Map();
  function stylesheet(){if(document.querySelector('link[data-cambridge-style]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./cambridge-ui.css?v=20261118-cambridge20',import.meta.url).href;link.dataset.cambridgeStyle='yes';document.head.append(link);}
  async function loadCatalog(){
    if(catalog)return catalog;
    if(!catalogPromise)catalogPromise=host.loadSiteJson('./data/cambridge/index.json?v=20261118-cambridge20','剑桥雅思题库').then(data=>catalog=normalizeCambridgeCatalog(data)).catch(error=>{catalogPromise=null;throw error;});
    return catalogPromise;
  }
  function totals(data){const tests=data.volumes.flatMap(book=>book.tests),reading=tests.flatMap(test=>test.reading),listening=tests.flatMap(test=>test.listening);return {books:data.volumes.length,tests:tests.length,reading:reading.length,listening:listening.length};}
  function renderContent(data,route){
    const counts=totals(data),entries=data.volumes.flatMap(volume=>volume.tests).flatMap(test=>[...test.reading,...test.listening]),imported=entries.filter(meta=>safeFile(meta.file)&&meta.questionCount>0).length,ready=entries.filter(canStartCambridgeSection).length,pendingAudio=entries.filter(meta=>meta.subject==='listening'&&safeFile(meta.file)&&meta.questionCount>0&&(!meta.audio||meta.audio.status!=='ready'||!safeAudio(meta.audio.src)||['missing','pending','failed'].includes(meta.audioStatus))).length;selected=selectCambridgeTest(data,route);const {book,test}=selected;
    host.shell(`${host.resumeBar?.()||''}<section class="cb-library" data-cambridge><header class="cb-page-heading"><div><p class="cb-eyebrow">CAMBRIDGE IELTS COLLECTION</p><h1>${escapeHtml(catalogTitle(data))}</h1><p>按卷册与Test选择听力、阅读，支持整套模考和单独练习。</p></div><a class="btn secondary small" href="#records">查看作答记录</a></header><section class="cb-summary" aria-label="剑桥题库目录"><div><span>卷册</span><strong>${counts.books}</strong></div><div><span>Test</span><strong>${counts.tests}</strong></div><div><span>阅读目录</span><strong>${counts.reading}</strong></div><div><span>听力目录</span><strong>${counts.listening}</strong></div></section><section class="cb-migration-status" aria-label="迁移进度"><div><strong>题目已导入 ${imported} / ${entries.length} 个部分</strong><span>当前可练 ${ready} 个部分</span></div><p>${imported<entries.length?'部分题目正在迁移。标记为“待迁移”的条目尚未导入题目正文，已收录的题目可查看或练习。':entries.length?`全部题目与答案已收录${pendingAudio?`；${pendingAudio}个听力部分音频待补齐。`:'，可按卷册选择练习。'}`:'题目目录正在准备。'}</p></section><section class="cb-select-panel"><div class="cb-filter-heading"><h2>选择卷册</h2><span>听力与阅读按同一Test分别列出</span></div><nav class="cb-volume-list" aria-label="剑桥雅思卷册">${data.volumes.map(item=>`<a href="#cambridge/${item.volume}/${item.tests[0]?.testNumber||1}" class="cb-volume${book?.volume===item.volume?' is-active':''}" ${book?.volume===item.volume?'aria-current="page"':''}>剑 ${item.volume}</a>`).join('')}</nav>${book?`<div class="cb-test-bar"><h2>${escapeHtml(book.title)}</h2><nav class="cb-test-list" aria-label="${escapeHtml(book.title)} Test">${book.tests.map(item=>`<a href="#cambridge/${book.volume}/${item.testNumber}" class="cb-test${test?.testNumber===item.testNumber?' is-active':''}" ${test?.testNumber===item.testNumber?'aria-current="page"':''}>Test ${item.testNumber}</a>`).join('')}</nav></div>`:''}</section>${test?`<section class="cb-current-test"><div><p class="cb-eyebrow">YOUR SELECTED TEST</p><h2>剑 ${book.volume} · Test ${test.testNumber}</h2></div><label class="cb-search"><span>搜索本套题目</span><input type="search" data-cb-query placeholder="输入文章标题、主题或题型" autocomplete="off"></label></section><p class="cb-search-result" data-cb-search-result role="status" aria-live="polite"></p><div data-cb-subjects>${subjectPanel(test,'listening')}${subjectPanel(test,'reading')}</div>`:`<div class="cb-empty cb-empty-main">${book?escapeHtml(book.note||'本卷材料尚未载入。'):'剑桥题库目录尚未载入。'}</div>`}<p class="cb-feedback" data-cb-feedback role="status" aria-live="polite"></p></section>`);
    activeRoot=document.querySelector('[data-cambridge]');
    const root=activeRoot;
    root?.addEventListener('input',event=>{if(!event.target.matches('[data-cb-query]'))return;const value=event.target.value;root.querySelector('[data-cb-subjects]').innerHTML=subjectPanel(test,'listening',value)+subjectPanel(test,'reading',value);root.querySelector('[data-cb-search-result]').textContent=value.trim()?`正在筛选：${value.trim()}`:'';});
    root?.addEventListener('click',event=>{const button=event.target.closest('[data-cb-action]');if(!button||button.disabled)return;void start(button);});
  }
  async function getSnapshot(meta,{preview=false}={}){
    if(passageCache.has(meta.id))return passageCache.get(meta.id);
    if(!safeFile(meta.file))throw Error('题目文件尚未准备完成。');
    const passage=await host.loadSiteJson('./'+meta.file,'剑桥题目');
    if(passage?.id!==meta.id||(passage.subject||'reading')!==meta.subject||!Array.isArray(passage.groups)||!passage.groups.length)throw Error('这份题目内容尚未完整，请选择其他练习。');
    if(!preview&&meta.subject==='listening'&&(!safeAudio(passage.audio?.src)||passage.audio?.status!=='ready'))throw Error('这份听力的音频暂不可用。');
    passageCache.set(meta.id,passage);return passage;
  }
  async function preview(data,route,token){
    selected=selectCambridgeTest(data,route);
    const meta=selectCambridgePreview(data,route),back=selected.book&&selected.test?`#cambridge/${selected.book.volume}/${selected.test.testNumber}`:'#cambridge';
    if(!meta){host.shell(`<section class="cb-library"><div class="cb-empty cb-empty-main"><h1>题目暂未收录</h1><p>请返回目录选择已收录的题目。</p><a class="btn secondary" href="${back}">返回题目目录</a></div></section>`);return;}
    host.shell('<section class="cb-library"><div class="cb-empty cb-empty-main" role="status">正在载入题目预览…</div></section>');
    try{
      const passage=await getSnapshot(meta,{preview:true});if(token!==renderToken)return;
      host.shell((host.resumeBar?.()||'')+renderCambridgePreview(passage,meta,{renderHtml:host.renderHtml}));activeRoot=document.querySelector('[data-cambridge]');
      activeRoot?.addEventListener('click',event=>{const button=event.target.closest('[data-cb-action]');if(button&&!button.disabled)void start(button);});
    }catch(error){if(token!==renderToken)return;host.shell(`<section class="cb-library"><div class="cb-empty cb-empty-main"><h1>暂时未能载入题目</h1><p>${escapeHtml(error.message||'请稍后重试。')}</p><a class="btn secondary" href="${back}">返回本套题目</a></div></section>`);}
  }
  async function start(button){
    if(busy||!selected?.test)return;
    const token=renderToken,root=activeRoot,test=selected.test,mode=button.dataset.cbAction==='set'?'mock':'practice';
    let metas;
    if(mode==='mock'){
      const subject=button.dataset.cbSubject;metas=test[subject]||[];
      const state=cambridgeSetState(metas,subject);if(!state.ready){host.toast(state.reason);return;}
    }else metas=[...test.reading,...test.listening].filter(meta=>meta.id===button.dataset.cbId);
    if(!metas.length||metas.some(meta=>!canStartCambridgeSection(meta))){host.toast('这份练习材料尚未准备完成。');return;}
    busy=true;button.disabled=true;const prior=button.textContent;button.textContent='正在准备…';
    try{const snapshots=await Promise.all(metas.map(getSnapshot));if(token!==renderToken||activeRoot!==root)return;await host.startExam(metas.map(meta=>meta.id),mode,snapshots);}
    catch(error){if(token===renderToken){host.toast(error.message||'题目加载失败，请稍后重试。');const message=root?.querySelector('[data-cb-feedback]');if(message)message.textContent=error.message||'题目加载失败，请稍后重试。';}}
    finally{busy=false;if(button.isConnected){button.disabled=false;button.textContent=prior;}}
  }
  async function render(route='cambridge'){
    const token=++renderToken;stylesheet();
    if(catalog){if(String(route).split('/')[3]==='view')await preview(catalog,route,token);else renderContent(catalog,route);return;}
    host.shell('<section class="cb-library"><div class="cb-empty cb-empty-main" role="status">正在载入剑桥雅思题库…</div></section>');
    try{const data=await loadCatalog();if(token!==renderToken)return;if(String(route).split('/')[3]==='view')await preview(data,route,token);else renderContent(data,route);}
    catch(error){if(token!==renderToken)return;host.shell(`<section class="cb-library"><div class="cb-page-heading"><div><p class="cb-eyebrow">CAMBRIDGE IELTS COLLECTION</p><h1>剑桥雅思 5—20</h1><p>听力与阅读题库</p></div></div><div class="cb-empty cb-empty-main"><h2>暂时未能载入目录</h2><p>${escapeHtml(error.message||'请稍后重试。')}</p><button type="button" class="btn secondary" data-cb-retry>重新加载</button></div></section>`);document.querySelector('[data-cb-retry]')?.addEventListener('click',()=>void render(route));}
  }
  return {render,destroy(){renderToken++;activeRoot=null;busy=false;}};
}
