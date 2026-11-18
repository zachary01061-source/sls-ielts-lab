// Teaching sequence by question group; these labels are not official IELTS ratings.
export const LEVELS=[{value:'easy',label:'简单'},{value:'medium',label:'中'},{value:'hard',label:'难'}];
const rank={easy:1,medium:2,hard:3};
const names={sentence_fill:'句子填空题',table_fill:'图表流程填空题',summary_fill:'Summary填空题',short_answer:'简答题',summary_word:'Summary选词填空题',paragraph_main:'段落大意题',paragraph_info:'段落信息包含题',info_match:'段落信息包含题',name_match:'人名匹配题',sentence_match:'句子匹配题',article_title:'文章标题题',tfng:'判断题',choice_single_multi:'单/多选题',part1_fill:'Part1填空题',part4_fill:'Part4填空题',single_choice:'单选题',multiple_choice:'多选题',matching:'配对题',map:'地图题',flow_chart:'流程填图题'};
const generic={text:'填空题',tfng:'判断题',ynng:'观点判断',matching:'匹配题',choice:'选择题',multi:'多选题'};
let enrichment={groups:{},recent:{reading:[],listening:[]},windowStart:'2026-10-19',windowEnd:'2026-11-18'};
export function configurePractice(value){if(value&&typeof value==='object')enrichment={...enrichment,...value};}
export function practiceWindow(){return {start:enrichment.windowStart,end:enrichment.windowEnd};}
export function levelLabel(value){return LEVELS.find(x=>x.value===value)?.label||'中';}
export function groupProfile(g,p={}){
 const subject=p.subject||'reading',part=Number(p.part)||1,source=g.sourceType||'',label=g.label||(g.type==='ynng'?'观点判断':g.type==='multi'?'多选题':g.type==='choice'&&source==='choice_single_multi'?'单选题':names[source]||generic[g.type]||'综合题');
 let level='medium',reason='需要理解同义替换，并核对具体信息。';
 if(subject==='listening'){
  if(g.type==='multi'||source==='multiple_choice'||/多选/.test(label)){level='hard';reason='需连续跟踪多个选项，排除干扰与改口。';}
  else if(source==='part1_fill'||(/Part1|表格|填空/.test(label)&&part===1)){level='easy';reason='日常场景信息明确，重点听取姓名、数字与关键词。';}
  else if((g.type==='choice'||g.type==='matching'||/单选|配对|匹配/.test(label))&&part===3){level='hard';reason='多人讨论中需分辨观点、转折与最终决定。';}
  else if(source==='map'||/地图/.test(label)){reason='需跟随方位与路线，同时对应图中位置。';}
  else if(source==='part4_fill'||part===4){reason='需跟随讲座结构，识别改写并正确拼写。';}
  else{reason='需边听边对应选项，留意转折和同义替换。';}
 }else{
  if(g.type==='multi'||g.type==='ynng'||/paragraph_main|paragraph_info|info_match|article_title/.test(source)||/段落大意|段落信息|文章标题|观点判断|多选/.test(label)){level='hard';reason='需概括段落或辨别观点范围，常涉及跨句整合与干扰项。';}
  else if(['sentence_fill','table_fill','short_answer'].includes(source)||/句子填空|图表流程|简答/.test(label)){level='easy';reason='通常可按顺序定位，依照语法和字数要求提取原词。';}
  else if(g.type==='tfng'||/判断/.test(label)){reason='需区分相符、矛盾与未提及，核对范围和限定词。';}
  else if(source==='summary_fill'||source==='summary_word'||/Summary/.test(label)){reason='需理解概括与同义替换，再核对词性和语义。';}
  else if(g.type==='matching'||/匹配/.test(label)){reason='需跨句核对人物、句意与对应关系。';}
 }
 return {id:g.id,label,type:g.type||'',sourceType:source,level,reason,count:g.questions?.length||g.count||0};
}
export function practiceGroups(p){
 if(Array.isArray(p.groups))return p.groups.map(g=>groupProfile(g,p));
 if(Array.isArray(p.groupLevels))return p.groupLevels;
 if(enrichment.groups?.[p.id])return enrichment.groups[p.id];
 return (p.types||[]).map(label=>groupProfile({label},p));
}
export function entryProfile(p){const groups=practiceGroups(p);return {groups,level:groups.reduce((v,g)=>(rank[g.level]||0)>rank[v]?g.level:v,'easy')};}
export function matchesGroupFilters(p,{type='',level=''}={}){return (!type&&!level)||practiceGroups(p).some(g=>(!type||g.label===type)&&(!level||g.level===level));}
export function recentEntriesFor(subject,entries){
 const byId=new Map(),byTitle=new Map();
 for(const p of entries){
  for(const id of [p.id,p.localId,p.sourceUUID,p.sourceId])if(typeof id==='string'&&id)byId.set(id,p);
  for(const title of [p.title,p.sourceTitle,...(Array.isArray(p.aliases)?p.aliases:[])])if(typeof title==='string'&&title)byTitle.set(normalizeTitle(title),p);
 }
 return (enrichment.recent?.[subject]||[]).map(item=>{
  const own=byId.get(item.localId)||byId.get(item.id)||byId.get(item.sourceUUID)||byTitle.get(normalizeTitle(item.title));
  if(own)return {...own,recent:item};
  const part=Number(String(item.part||'').match(/\d/)?.[0])||1;
  return {id:'recent-'+item.id,title:item.title,subject,part,types:[...new Set(Object.values(item.questionTypes||{}).flat())],questionCount:item.questionCount||0,status:'unavailable',external:true,sourceUrl:item.sourceUrl,recent:item};
 });
}
export function normalizeTitle(value){return String(value||'').toLowerCase().replace(/（[^）]*）|\([^)]*机经[^)]*\)/g,'').replace(/[^a-z0-9\u4e00-\u9fff]/g,'');}
