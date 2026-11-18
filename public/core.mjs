export const TYPE_NAMES={tfng:'判断题',ynng:'观点判断',text:'填空题',choice:'选择题',matching:'匹配题',multi:'多选题'};
export function normalizeAnswer(value){return String(value??'').trim().replace(/[’‘]/g,"'").replace(/\s+/g,' ').toLocaleLowerCase();}
export function wordCount(value){return String(value??'').trim().split(/\s+/).filter(Boolean).length;}
const NUMBER_WORDS=new Set('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth twentieth thirtieth fortieth fiftieth sixtieth seventieth eightieth ninetieth hundredth thousandth'.split(' '));
export function exceedsWordLimit(value,q){if(!q.maxWords)return false;const tokens=String(value??'').trim().split(/\s+/).filter(Boolean);if(!q.allowNumber)return tokens.length>q.maxWords;const numeric=t=>/^[$£€]?[+-]?\d[\d,.:/–-]*(?:st|nd|rd|th|%|[ap]\.?m\.?|[a-z])?$/i.test(t)||NUMBER_WORDS.has(String(t).toLowerCase());let numbers=0,words=0;for(let i=0;i<tokens.length;i++){if(numeric(tokens[i])){numbers++;if(/^(?:to|[-–—])$/i.test(tokens[i+1]||'')&&numeric(tokens[i+2]||''))i+=2;}else words++;}return words>q.maxWords||numbers>1;}
export function questionsOf(passages){let n=0;return passages.flatMap(p=>p.groups.flatMap(g=>g.questions.map(q=>({passage:p,group:g,question:q,key:`${p.id}:${q.id}`,number:++n,displayNumber:(p.cambridge||p.preserveSourceNumbers)&&Number.isInteger(q.sourceSlot)&&q.sourceSlot>0&&q.sourceSlot<=200?q.sourceSlot:p.subject==='listening'?listeningNumber(q,p,n):n}))));}
export function grade(passages,answers){const seen=new Map();const details=questionsOf(passages).map(x=>{const actual=String(answers[x.key]??'').trim();const tooLong=exceedsWordLimit(actual,x.question);const setKey=x.passage.id+':'+x.question.setId;const duplicate=x.question.setId&&seen.get(setKey)?.has(normalizeAnswer(actual));if(x.question.setId&&actual){if(!seen.has(setKey))seen.set(setKey,new Set());seen.get(setKey).add(normalizeAnswer(actual));}const pending=!!x.question.unscorable||!x.question.answers?.length;const correct=!pending&&!!actual&&!tooLong&&!duplicate&&x.question.answers.some(a=>normalizeAnswer(a)===normalizeAnswer(actual));return {...x,actual,correct,pending,tooLong:!!tooLong,duplicate:!!duplicate};});return{correct:details.filter(d=>d.correct).length,total:details.length,scoredTotal:details.filter(d=>!d.pending).length,pending:details.filter(d=>d.pending).length,answered:details.filter(d=>d.actual).length,details};}
export function validateBank(data){
 const errors=[];const fail=m=>{if(errors.length<8)errors.push(m);};
 if(!data||!Array.isArray(data.passages)||!data.passages.length)return ['文件应包含非空 passages 数组。'];
 if(data.passages.length>100)return ['每次最多导入 100 篇文章。'];
 const ids=new Set();
 data.passages.forEach((p,i)=>{const at=`第 ${i+1} 篇`;
 if(!p||typeof p!=='object'){fail(`${at}：格式不正确。`);return;}
 if(typeof p.id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(p.id)||ids.has(p.id))fail(`${at}：id 须为不重复的英文、数字、横线或下划线。`);ids.add(p.id);
 if(typeof p.title!=='string'||!p.title.trim()||p.title.length>200)fail(`${at}：请填写有效标题。`);
 if(!validSubject(p.subject)||!validPart(p))fail(`${at}：阅读 part 须为 1–3，听力 part 须为 1–4。`);
 if(p.subject==='listening'&&!validAudio(p.audio))fail(`${at}：audio 格式或音频地址不正确。`);
 if(p.transcriptHtml!=null&&typeof p.transcriptHtml!=='string')fail(`${at}：transcriptHtml 必须为文字。`);
 if(p.duration!=null&&(!Number.isInteger(p.duration)||p.duration<60||p.duration>10800))fail(`${at}：duration 须为 60–10800 秒。`);
 if(!Array.isArray(p.paragraphs)||(p.subject!=='listening'&&!p.paragraphs.length)||p.paragraphs.length>(p.subject==='listening'?1000:40))fail(`${at}：paragraphs 段落数量不正确。`);
 else{const labels=new Set();p.paragraphs.forEach(s=>{if(!s||typeof s.label!=='string'||typeof s.text!=='string'||!s.text.trim()||s.text.length>20000||labels.has(s.label))fail(`${at}：段落内容或段落标号不正确。`);labels.add(s?.label);});}
 if(!Array.isArray(p.groups)||!p.groups.length){fail(`${at}：缺少题组 groups。`);return;}
 let count=0;const qids=new Set();
 p.groups.forEach((g,j)=>{if(!g||!Object.prototype.hasOwnProperty.call(TYPE_NAMES,g.type)||g.type==='multi'){fail(`${at} 题组 ${j+1}：不支持的 type。`);return;}
 if(typeof g.instruction!=='string'||!g.instruction.trim())fail(`${at} 题组 ${j+1}：缺少 instruction。`);
 if(!Array.isArray(g.questions)||!g.questions.length){fail(`${at}：题组不能为空。`);return;}
 if((g.type==='matching'||g.options!=null)&&!validOptions(g.options))fail(`${at}：匹配题缺少有效 options。`);
 g.questions.forEach(q=>{count++;if(!q||!Number.isInteger(q.id)||q.id<1||qids.has(q.id)){fail(`${at}：题号须为不重复的正整数。`);return;}qids.add(q.id);
 if(typeof q.prompt!=='string'||!q.prompt.trim())fail(`${at} 第${q.id}题：缺少题干。`);
 if(!Array.isArray(q.answers)||!q.answers.length||q.answers.some(a=>typeof a!=='string'||!a.trim())){fail(`${at} 第${q.id}题：缺少答案。`);return;}
 const allowed=g.type==='tfng'?['TRUE','FALSE','NOT GIVEN']:g.type==='ynng'?['YES','NO','NOT GIVEN']:g.type==='matching'?(Array.isArray(g.options)?g.options:[]).map(o=>o?.value):g.type==='choice'?(Array.isArray(q.options)?q.options:[]).map(o=>o?.value):null;
 if((g.type==='choice'||q.options!=null)&&!validOptions(q.options))fail(`${at} 第${q.id}题：选择题缺少有效选项。`);
 if(allowed&&q.answers.some(a=>!allowed.includes(a)))fail(`${at} 第${q.id}题：答案必须与选项值对应。`);
 if(q.maxWords!=null&&(!Number.isInteger(q.maxWords)||q.maxWords<1||q.maxWords>20))fail(`${at} 第${q.id}题：maxWords 应为 1–20。`);
 if(q.maxWords&&q.answers.some(a=>exceedsWordLimit(a,q)))fail(`${at} 第${q.id}题：答案超出字数限制。`);
 if(q.evidence!=null&&(!q.evidence||typeof q.evidence.quote!=='string'||!(Array.isArray(p.paragraphs)&&p.paragraphs.some(s=>s&&s.label===q.evidence.paragraph&&typeof s.text==='string'&&s.text.includes(q.evidence.quote)))))fail(`${at} 第${q.id}题：证据句必须与指定段落原文一致。`);
 if(q.keywordPairs!=null&&(!Array.isArray(q.keywordPairs)||q.keywordPairs.some(k=>!k||typeof k.question!=='string'||typeof k.article!=='string')))fail(`${at} 第${q.id}题：keywordPairs 格式不正确。`);
 if(q.allowNumber!=null&&typeof q.allowNumber!=='boolean')fail(`${at} 第${q.id}题：allowNumber 应为布尔值。`);
 if(q.explanation!=null&&typeof q.explanation!=='string')fail(`${at} 第${q.id}题：explanation 必须为文字。`);
 });});if(count>100)fail(`${at}：每篇最多 100 题。`);
 });return errors;
}
function validOptions(options){return Array.isArray(options)&&options.length>=2&&options.length<=30&&options.every(o=>o&&typeof o.value==='string'&&typeof o.text==='string'&&o.value.trim())&&new Set(options.map(o=>o.value)).size===options.length;}
export function csvCell(value){let v=String(value??'');if(/^[=+@\-\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';}
export function validateBackup(data){
 const fail=m=>['备份格式不正确：'+m];const str=x=>typeof x==='string';const safeId=x=>str(x)&&/^[-a-zA-Z0-9_]{1,100}$/.test(x);const num=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);const textMap=x=>object(x)&&Object.entries(x).every(([k,v])=>str(k)&&str(v));
 if(!object(data)||data.format!=='sls-reading-backup-v1'||!object(data.state))return fail('文件标识缺失。');const s=data.state;
 if(!object(s.profile)||Object.values(s.profile).some(v=>!str(v))||(s.profile.name||'').length>30||(s.profile.class||'').length>40)return fail('姓名或班级。');
 if(!Array.isArray(s.favorites)||!s.favorites.every(safeId)||!Array.isArray(s.custom)||!Array.isArray(s.records)||s.records.length>100)return fail('收藏、题库或记录。');
 if(s.custom.length){const e=validateBank({passages:s.custom});if(e.length)return e;}
 for(const r of s.records){if(!object(r)||!safeId(r.id)||!str(r.title)||!validSubject(r.subject)||!['mock','practice'].includes(r.mode)||!num(r.finishedAt)||!Number.isFinite(new Date(r.finishedAt).getTime())||!num(r.elapsed)||!num(r.correct)||!num(r.total)||(r.scoredTotal!=null&&!num(r.scoredTotal))||(r.pending!=null&&!num(r.pending))||!textMap(r.answers)||!Array.isArray(r.passageIds)||!r.passageIds.every(safeId)||!Array.isArray(r.passages)||!r.passages.length)return fail('练习记录字段。');
 if(r.profile&&(!object(r.profile)||Object.values(r.profile).some(v=>!str(v))))return fail('记录内姓名班级。');
 if(!Array.isArray(r.details)||r.details.some(d=>!object(d)||!safeId(d.type)||!str(d.key)||!num(d.number)||typeof d.correct!=='boolean'))return fail('逐题记录。');
 for(const p of r.passages){if(!object(p)||!safeId(p.id)||!str(p.title)||!validSubject(p.subject)||!validPart(p)||(p.subject==='listening'&&!validAudio(p.audio))||(p.transcriptHtml!=null&&!str(p.transcriptHtml))||(p.duration!=null&&(!Number.isInteger(p.duration)||p.duration<60||p.duration>10800))||!Array.isArray(p.paragraphs)||p.paragraphs.some(v=>!object(v)||!str(v.label)||!str(v.text))||!Array.isArray(p.groups)||(p.articleHtml!=null&&!str(p.articleHtml)))return fail('文章快照。');
 for(const g of p.groups){if(!object(g)||!Object.prototype.hasOwnProperty.call(TYPE_NAMES,g.type)||!str(g.instruction)||!Array.isArray(g.questions)||!g.questions.length||(g.options!=null&&!snapshotOptions(g.options)))return fail('题组快照。');
 for(const q of g.questions){if(!object(q)||!Number.isInteger(q.id)||q.id<1||!str(q.prompt)||!Array.isArray(q.answers)||!q.answers.every(str)||(q.maxWords!=null&&(!Number.isInteger(q.maxWords)||q.maxWords<1||q.maxWords>20))||(q.allowNumber!=null&&typeof q.allowNumber!=='boolean')||(q.options!=null&&!snapshotOptions(q.options))||(q.setId!=null&&!str(q.setId))||(q.evidence!=null&&(!object(q.evidence)||!str(q.evidence.quote)))||(q.keywordPairs!=null&&(!Array.isArray(q.keywordPairs)||q.keywordPairs.some(k=>!object(k)||!str(k.question)||!str(k.article)))))return fail('题目快照。');}
 }}}
 return [];
}

function snapshotOptions(options){return Array.isArray(options)&&options.length<=30&&options.every(o=>o&&typeof o.value==='string'&&typeof o.text==='string'&&o.value.trim())&&new Set(options.map(o=>o.value)).size===options.length;}

function validSubject(subject){return subject==null||subject==='reading'||subject==='listening';}
function validPart(p){return (p.subject==='listening'?[1,2,3,4]:[1,2,3]).includes(p.part);}
function validAudio(audio){
 if(!audio||typeof audio!=='object'||Array.isArray(audio)||!['ready','pending','missing'].includes(audio.status)||typeof audio.src!=='string')return false;
 if(audio.src){if(/[\\\u0000-\u001f]/.test(audio.src))return false;if(/^https?:\/\//i.test(audio.src)){try{const u=new URL(audio.src);if(u.username||u.password)return false;}catch{return false;}}else if(!/^(?:\/(?!\/)|\.\/|assets\/|media\/)/.test(audio.src))return false;}else if(audio.status==='ready')return false;
 if(audio.durationSeconds!=null&&(!Number.isFinite(audio.durationSeconds)||audio.durationSeconds<0||audio.durationSeconds>86400))return false;
 if(audio.mimeType!=null&&(typeof audio.mimeType!=='string'||!/^audio\/[a-z0-9.+-]+$/i.test(audio.mimeType)))return false;
 return true;
}

function listeningNumber(q,p,fallback){const source=q.sourceSlot??(/^\d+$/.test(String(q.sourceNumber??''))?Number(q.sourceNumber):null);if(Number.isInteger(source)&&source>0&&source<=200)return Number.isInteger(q.sourceSubSlot)&&q.sourceSubSlot>=1&&q.sourceSubSlot<=26?`${source}${String.fromCharCode(96+q.sourceSubSlot)}`:source;return (p.part-1)*10+q.id||fallback;}
