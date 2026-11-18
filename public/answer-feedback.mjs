// Render saved answers and supplied teaching notes without inferring why an error occurred.
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const text = value => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const asList = value => Array.isArray(value) ? value : value == null ? [] : [value];
const paragraphs = value => text(value).split(/\n+/).filter(Boolean).map(line => `<p>${escape(line)}</p>`).join('');

export function normalizeAnswerFeedback(row = {}, item = {}, index = 0) {
  const response = text(row.response ?? row.studentAnswer ?? row.answer);
  const expected = asList(row.expected ?? item.answers ?? item.answer ?? row.accepted).map(text).filter(Boolean);
  const options = asList(row.options ?? item.options).map((option, position) => typeof option === 'string' ? {value:String(position),label:option} : {value:text(option.value ?? String(position)),label:text(option.label ?? option.text)});
  const manual = !!(item.manual || row.needsReview);
  const scored = row.scored === undefined ? !manual && typeof row.correct === 'boolean' : row.scored === true;
  const answered = row.answered === undefined ? response.trim().length > 0 : row.answered === true;
  const status = !answered ? 'unanswered' : !scored ? 'unscored' : row.correct === true ? 'correct' : 'wrong';
  return {...row,id:text(row.id ?? item.id),number:row.number ?? item.number ?? item.sourceQuestionNumber ?? index + 1,
    prompt:text(row.prompt ?? item.prompt ?? item.question),response,expected,options,answered,scored,status,
    correct:scored && row.correct === true,skill:row.skill ?? item.skill,dimension:row.dimension ?? item.dimension,
    dimensionLabel:text(row.dimensionLabel ?? item.dimensionLabel),explanation:text(row.explanation ?? item.explanation),
    quote:text(row.quote ?? row.evidence?.quote ?? item.evidence?.quote ?? item.quote ?? item.evidenceQuote),evidenceParagraph:text(row.evidenceParagraph ?? row.evidence?.paragraph ?? item.evidence?.paragraph),source:row.source ?? item.source,transformation:row.transformation ?? item.transformation,passage:text(row.passage ?? item.passage),
    sourceTitle:text(row.sourceTitle ?? item.sourceTitle),instructions:text(row.instructions ?? item.instructions ?? item.sourceInstruction),audioUnavailable:row.audioUnavailable === true,
    maxWords:row.maxWords ?? item.maxWords};
}

export function summarizeAnswerFeedback(rows = []) {
  const normalized = rows.map((row,index) => normalizeAnswerFeedback(row,{},index));
  return {total:normalized.length,answered:normalized.filter(row=>row.answered).length,
    correct:normalized.filter(row=>row.status==='correct').length,wrong:normalized.filter(row=>row.status==='wrong').length,
    unanswered:normalized.filter(row=>row.status==='unanswered').length,unscored:normalized.filter(row=>row.status==='unscored').length};
}

export function renderAnswerFeedback(input, {open = false,nextTask = null,number,responseLabel = '我的答案'} = {}) {
  const row = normalizeAnswerFeedback(input);
  const label = {correct:'答对',wrong:'需要订正',unanswered:row.audioUnavailable?'录音未能播放':'未作答',unscored:'已提交，未判分'}[row.status];
  const optionText = value => {
    const option = row.options.find(option => option.value === value);
    return option && option.label !== value ? `${value} · ${option.label}` : value;
  };
  const route = typeof nextTask?.route === 'string' && /^[a-z][\w/-]*(?:[\w.:%-]*)$/.test(nextTask.route) ? nextTask.route : null;
  return `<details class="answer-feedback answer-feedback-${row.status}"${open?' open':''}><summary><span class="af-number">${escape(number??row.number)}</span><span class="af-prompt">${escape(row.prompt||'题目')}<small>${escape([row.sourceTitle,row.dimensionLabel].filter(Boolean).join(' · '))}</small></span><span class="af-status">${label}</span></summary><div class="af-body">${row.instructions?`<p class="af-instructions">${escape(row.instructions)}</p>`:''}<dl class="af-answers"><div><dt>${escape(responseLabel)}</dt><dd>${escape(row.answered?optionText(row.response):row.audioUnavailable?'录音未能播放，本题没有作答':'未填写')}</dd></div>${row.expected.length?`<div><dt>参考答案</dt><dd>${row.expected.map(value=>escape(optionText(value))).join(' / ')}</dd></div>`:''}</dl>${row.tooLong?'<p class="af-rule">本次答案超过题目规定的词数。</p>':''}${row.duplicate?'<p class="af-rule">这组多选题重复填写了同一选项，该答题位未重复计分。</p>':''}${row.quote?`<div class="af-evidence"><h4>原文依据${row.evidenceParagraph?` · ${escape(row.evidenceParagraph)}`:''}</h4><blockquote>${escape(row.quote)}</blockquote></div>`:''}${row.explanation?`<div class="af-explanation"><h4>订正说明</h4>${paragraphs(row.explanation)}</div>`:''}${row.transformation?`<details class="af-source"><summary>查看题型改编</summary><p>${escape(row.transformation.from||row.source?.originalType||'原题')} → ${escape(row.transformation.to||'本题')}</p>${row.transformation.purpose?`<p>${escape(row.transformation.purpose)}</p>`:''}${row.source?.quote?`<h4>原题材料节选${row.source.paragraph?` · ${escape(row.source.paragraph)}`:''}</h4><blockquote>${escape(row.source.quote)}</blockquote>`:''}</details>`:''}${row.options.length?`<details class="af-source"><summary>查看全部选项</summary><ul>${row.options.map(option=>`<li><strong>${escape(option.value)}</strong> ${escape(option.label)}</li>`).join('')}</ul></details>`:''}${row.passage?`<details class="af-source"><summary>查看本题阅读原文</summary><div class="af-passage">${paragraphs(row.passage)}</div></details>`:''}${route?`<a class="btn secondary small af-next" href="#${escape(route)}">接下来练：${escape(nextTask.title||'对应练习')}</a>`:nextTask?.title?`<p class="af-next-label">接下来练：${escape(nextTask.title)}</p>`:''}</div></details>`;
}
