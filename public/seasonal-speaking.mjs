import { seasonalSpeakingData } from './seasonal-speaking-content.mjs';

export { seasonalSpeakingData };
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalizeTopic = value => String(value || '').replace(/\s*\(new\)\s*$/i,'').trim().replace(/[.。?？]+$/,'').replace(/\s+/g,' ').toLowerCase();
const topics = [...seasonalSpeakingData.part1,...seasonalSpeakingData.part2];
const topicIndex = new Map(topics.flatMap(topic => [topic.title_en,topic.title_zh,topic.source_title].map(title => [normalizeTopic(title),topic])));
const byId = new Map(topics.map(topic=>[topic.id,topic]));

export function findSeasonalTopic(unit) {
  if (!unit) return null;
  if (byId.has(unit.id)) return byId.get(unit.id);
  for (const title of [unit.title_en,unit.title,unit.prompt]) {
    const match=topicIndex.get(normalizeTopic(title));
    if(match) return match;
  }
  return null;
}

export function renderSeasonalSpeakingBadge(unit) {
  const topic=findSeasonalTopic(unit);
  if(!topic) return '';
  return `<span class="ss-badges"><span class="ss-badge">当季必考</span><span class="ss-season">2026年9–12月</span>${topic.new_this_season?'<span class="ss-new">本季新题</span>':''}</span>`;
}

const rubric = [
  {name:'流利与连贯',description:'回答切题，观点与细节衔接清楚。'},
  {name:'词汇运用',description:'词语适合语境，能用自己的话解释意思。'},
  {name:'语法',description:'时态与句子结构帮助准确表达。'},
  {name:'发音',description:'语音清楚，重音与停顿自然。'},
];
export const seasonalSpeakingUnits = topics.map(topic => ({
  id:topic.id,title:topic.title_zh,title_en:topic.title_en,stage:'independent',skill:'speaking',minutes:topic.part===1?10:15,
  prompt:topic.part===1?`Part 1 · ${topic.title_en}`:topic.title_en,
  promptCn:topic.part===1?'逐题回答，先给直接答案，再加原因或具体细节。':'准备1分钟，围绕提示连续表达1–2分钟，再回答Part 3延伸问题。',
  questions:topic.part===1?topic.questions:topic.cue_points,
  followUps:topic.part===2?topic.part3_questions:[],
  scaffold:topic.part===1?['每个回答选一至两个细节展开。','想不到单词时，用简单词解释意思。']:['先写人物、地点、时间等关键词。','围绕提示展开具体经历，最后说明感受或原因。'],
  instructions:topic.part===1?['可以逐题录音，也可以连答本组问题。']:['Part 2提示卡与下方Part 3问题均来自本季题库。'],
  preparationSeconds:topic.part===1?30:60,speakingSeconds:topic.part===1?90:120,
  rubric,season:topic.season,currentSeason:true,seasonalPart:topic.part,
  contentOrigin:seasonalSpeakingData.metadata.source_file,
}));

function topicCard(unit, index) {
  const topic=findSeasonalTopic(unit),seasonal=Boolean(topic),part=topic?.part || '',isNew=topic?.new_this_season || false;
  const title=topic?.title_zh || unit.title,english=topic?.title_en || unit.prompt || '';
  const qs=topic?(part===1?topic.questions:topic.cue_points):unit.questions || [];
  const follow=topic?.part3_questions || unit.followUps || [];
  return `<article class="ss-topic${unit.currentSeason?' ss-current-topic':''}" data-ss-topic data-ss-current="${seasonal?'yes':'no'}" data-ss-part="${part}" data-ss-category="${escapeHtml(topic?.category || '')}" data-ss-new="${isNew?'yes':'no'}" data-ss-search="${escapeHtml([title,english,...qs,...follow].join(' ').toLowerCase())}">
    <div class="ss-topic-top"><span class="ss-part">${part?`Part ${part}${part===2?' + Part 3':''}`:'原有训练'}</span>${renderSeasonalSpeakingBadge(unit)}</div>
    <h3>${escapeHtml(title)}</h3><p class="ss-english">${escapeHtml(english)}</p>
    <div class="ss-topic-meta">${topic?.category_zh?`<span>${escapeHtml(topic.category_zh)}</span>`:''}<span>${qs.length}${part===2?'个提示':'个问题'}${follow.length?` · ${follow.length}个延伸问题`:''}</span></div>
    <details class="ss-questions"><summary>查看${part===2?'提示卡与Part 3':'本组问题'}</summary>${part===2?'<p class="ss-instruction">You should say:</p>':''}<ol>${qs.map(q=>`<li>${escapeHtml(q)}</li>`).join('')}</ol>${follow.length?`<h4>${part===2?'Part 3':'延伸问题'}</h4><ol>${follow.map(q=>`<li>${escapeHtml(q)}</li>`).join('')}</ol>`:''}</details>
    <a class="btn secondary small ss-practice-link" href="#speaking/${encodeURIComponent(unit.id)}" data-ss-practice>打开练习与录音<span aria-hidden="true"> →</span></a>
  </article>`;
}

export function renderSeasonalSpeakingCatalog(existingUnits=[]) {
  const originals=existingUnits.filter(unit=>!byId.has(unit.id));
  return `<section class="ss-catalog g-card" data-seasonal-speaking aria-labelledby="ss-title">
    <header class="ss-heading"><div><p class="ss-eyebrow">2026 · SEPTEMBER—DECEMBER</p><h2 id="ss-title">当季口语话题</h2><p>Part 1 · 41个话题　Part 2 · 61个话题，附Part 3延伸问题</p></div><strong class="ss-total">102<span>个当季话题</span></strong></header>
    <p class="ss-legend"><span class="ss-badge">当季必考</span> 为本季重点复习标签；各场次实际题目会有不同。</p>
    <div class="ss-filters" role="search" aria-label="筛选口语话题">
      <label class="ss-search-label"><span>搜索话题或问题</span><input type="search" data-ss-search-input placeholder="如：朋友 / travel / decision" autocomplete="off"></label>
      <label><span>话题范围</span><select data-ss-scope><option value="seasonal">当季必考（102个）</option><option value="all">全部口语话题</option><option value="original">原有口语训练（${originals.length}个）</option></select></label>
      <label><span>考试部分</span><select data-ss-part-filter><option value="all">全部部分</option><option value="1">Part 1</option><option value="2">Part 2 + Part 3</option></select></label>
      <label><span>话题类别</span><select data-ss-category-filter><option value="all">全部类别</option><option value="People">人物</option><option value="Place">地点</option><option value="Object">事物</option><option value="Event">事件</option></select></label>
      <label class="ss-new-filter"><input type="checkbox" data-ss-new-filter><span>只看本季新题（51个）</span></label>
    </div>
    <div class="ss-results-line"><p data-ss-count role="status" aria-live="polite">共102个话题</p><button class="ss-reset" type="button" data-ss-reset>重置筛选</button></div>
    <div class="ss-topic-grid">${[...seasonalSpeakingUnits,...originals].map(topicCard).join('')}</div>
    <p class="ss-empty" data-ss-empty hidden>没有找到符合条件的话题。请调整关键词或筛选条件。</p>
    <button class="ss-show-more btn secondary" data-ss-show-more type="button">显示更多话题</button>
  </section>`;
}

export function bindSeasonalSpeakingCatalog(root) {
  const box=root?.querySelector('[data-seasonal-speaking]');
  if(!box || box.dataset.ssBound) return;
  box.dataset.ssBound='yes';
  if(!document.querySelector('link[data-seasonal-speaking-style]')){
    const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href=new URL('./seasonal-speaking.css',import.meta.url).href;stylesheet.dataset.seasonalSpeakingStyle='yes';document.head.append(stylesheet);
  }
  const search=box.querySelector('[data-ss-search-input]'),scope=box.querySelector('[data-ss-scope]'),part=box.querySelector('[data-ss-part-filter]'),category=box.querySelector('[data-ss-category-filter]'),fresh=box.querySelector('[data-ss-new-filter]'),more=box.querySelector('[data-ss-show-more]');
  const cards=Array.from(box.querySelectorAll('[data-ss-topic]'));let limit=12;
  function filter(resetLimit=true){
    if(resetLimit)limit=12;
    const query=search.value.trim().toLowerCase();
    const matches=cards.filter(card=>(scope.value!=='seasonal'||card.dataset.ssCurrent==='yes')&&(scope.value!=='original'||!card.classList.contains('ss-current-topic'))&&(part.value==='all'||card.dataset.ssPart===part.value)&&(category.value==='all'||card.dataset.ssCategory===category.value)&&(!fresh.checked||card.dataset.ssNew==='yes')&&(!query||card.dataset.ssSearch.includes(query)));
    const visible=new Set(matches.slice(0,limit));for(const card of cards)card.hidden=!visible.has(card);
    box.querySelector('[data-ss-count]').textContent=`共${matches.length}个话题${matches.length>limit?`，已显示${limit}个`:''}`;
    box.querySelector('[data-ss-empty]').hidden=matches.length>0;more.hidden=matches.length<=limit;
    if(!more.hidden)more.textContent=`显示更多话题（还有${matches.length-limit}个）`;
  }
  search.addEventListener('input',()=>filter());
  for(const control of [scope,part,category,fresh])control.addEventListener('change',()=>filter());
  more.addEventListener('click',()=>{limit+=12;filter(false);});
  box.querySelector('[data-ss-reset]').addEventListener('click',()=>{search.value='';scope.value='seasonal';part.value='all';category.value='all';fresh.checked=false;filter();});
  box.addEventListener('click',event=>{const link=event.target.closest('[data-ss-practice]');if(!link)return;sessionStorage.setItem('sls-seasonal-speaking-open','yes');});
  filter();
  if(sessionStorage.getItem('sls-seasonal-speaking-open')==='yes'){
    sessionStorage.removeItem('sls-seasonal-speaking-open');
    requestAnimationFrame(()=>root.querySelector('.g-work-layout')?.scrollIntoView({block:'start',behavior:'smooth'}));
  }
}
