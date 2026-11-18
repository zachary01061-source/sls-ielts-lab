const strings = value => Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : [];
const text = value => typeof value === 'string' ? value : '';
const safeId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(value);

export const writingGuidanceText = value => text(value)
  .replace(/教材原题[：:]/g,'题目：')
  .replace(/教材之外/g,'参考思路之外')
  .replace(/教材中的/g,'示例中的')
  .replace(/教材观点/g,'参考观点')
  .replace(/教材范段/g,'参考段落')
  .replace(/与教材不同/g,'与参考立场不同');

export function textbookWorkRoute(task) {
  return ['writing','speaking'].includes(task?.skill) && /^textbook:[a-z0-9:-]+$/i.test(task?.id || '')
    ? `${task.skill}/${encodeURIComponent(task.id)}` : null;
}

/** Converts authenticated server task content to the existing secure work editor. */
export function textbookTaskToUnit(payload = {}) {
  const task = payload.task, section = payload.section || {}, book = payload.book || {};
  if (!textbookWorkRoute(task) || !text(task.prompt).trim()) throw Error('没有找到这项教材练习。');
  const requirements = task.requirements || {};
  const support = section.languageSupport || section.practice?.languageSupport || [];
  const languageSupport = Array.isArray(support) ? support.map(row => typeof row === 'string' ? row : [row.phrase || row.en || row.expression, row.meaning || row.zh].filter(Boolean).join(' — ')).filter(Boolean) : [];
  const sourceBookId = book.id || task.source?.bookId;
  const sourceSectionId = section.id || task.source?.sectionId;
  const bookRoute = safeId(sourceBookId) && safeId(sourceSectionId) ? `textbook/${sourceBookId}/${sourceSectionId}` : 'textbooks';
  const point = section.points?.[0];
  const display = task.skill==='writing' ? writingGuidanceText : text;
  const steps = task.skill === 'speaking' ? [
    {title:'先选一件能讲清的事',explanation:'从自己的课堂、社团、运动或家庭生活中选例子；需要假设时直接说明。',task:'写下人物、时间、发生的事和一个具体细节。',checklist:['例子与本题有关。','没有把别人的经历当成自己的经历。']},
    {title:'说明原因，再补充例子',explanation:'先回答问题，再说明为什么；用具体行为或结果解释你的想法。',task:'用关键词连接“回答 → 原因 → 例子或结果”。',checklist:['每个理由都有解释。','没有只罗列几个空泛观点。']}
  ] : [
    {title:'确定本段回答什么',explanation:section.analysis || '先核对题目中的对象、范围和要求，再选一个可以解释清楚的观点。',task:'用一句话写出本段观点，再标出题目中必须回应的内容。',checklist:['观点回应本题。','没有把部分情况扩大成所有情况。']},
    {title:'把原因到结果写清楚',explanation:section.paragraphGuide || '写清中间发生了什么，用例子说明，再检查结论是否需要条件。',example:point?.chainCn || '',task:'列出原因、中间步骤、结果和一个具体例子。',checklist:['原因与结果之间没有跳步。','例子确实支持本段观点。']}
  ];
  const {id,analysis,stanceCn,stanceEn,points,paragraphGuide,collocations,modelParagraph,modelAnswer,modelTranslation,logicChains,keyPoints}=section;
  return {
    id:task.id,materialFamilyId:safeId(sourceSectionId)?`textbook:${sourceSectionId}`:task.id,skill:task.skill,title:task.title || section.title || '教材练习',stage:task.stage || 'supported',
    progression:task.progression || 'paragraph',prompt:display(task.prompt),instructions:strings(requirements.instructions).map(display),
    questions:strings(requirements.questions),followUps:strings(requirements.followUps),
    wordTarget:requirements.wordTarget || null,speakingSeconds:requirements.speakingSeconds || 90,minutes:20,
    scaffold:languageSupport.length ? languageSupport : strings(section.learningObjectives),
    gradingRubric:task.rubric || null,
    rubric:(task.feedbackCriteria || []).map(row=>({name:row.label || row.id,description:display(row.focus || row.description)})),
    lessonSteps:steps,
    writingGuidance:task.skill==='writing'?{id,analysis,stanceCn,stanceEn,points,paragraphGuide,collocations,modelParagraph,modelAnswer,modelTranslation,logicChains,keyPoints,text:sourceBookId==='ideas'?section.text:undefined}:null,
    textbook:{bookId:sourceBookId,sectionId:sourceSectionId,title:book.title || task.source?.title || '教材',page:section.pageStart || task.source?.page,route:task.skill==='writing'&&safeId(sourceSectionId)?`writing/${sourceBookId==='ideas'?'ideas':'topic'}/${sourceSectionId}`:bookRoute,studentContext:text(section.studentContext),studentGuidance:text(section.studentGuidance||section.practice?.studentGuidance||section.studentContext),adaptationNote:text(section.adaptationNote)}
  };
}

export function normalizeVocabularyAnswer(value) {
  return String(value ?? '').normalize('NFKC').trim().toLowerCase().replace(/[‘’]/g,"'").replace(/\s+/g,' ');
}

export function vocabularyAcceptedAnswers(entry = {}) {
  const supplied = strings(entry.acceptedAnswers || entry.answers || entry.variants);
  const term = text(entry.term || entry.word).trim();
  const alternatives = supplied.length ? supplied : term.includes('/') ? [term,...term.split(/\s*\/\s*/)] : [term];
  return [...new Set(alternatives.map(normalizeVocabularyAnswer).filter(Boolean))];
}

export function gradeTextbookVocabulary(entries, answers) {
  return entries.map((entry,index)=>({entry,response:String(answers[index] ?? ''),correct:vocabularyAcceptedAnswers(entry).includes(normalizeVocabularyAnswer(answers[index]))}));
}
