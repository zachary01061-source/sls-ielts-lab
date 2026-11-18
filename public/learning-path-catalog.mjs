import {readingUnits, writingUnits, speakingUnits, vocabularySets} from './growth-content.mjs';
import {progressionMaterials} from './progression-content.mjs';
import {listeningCheckpoints,listeningProgressionMaterials} from './listening-progression.mjs';
import {textbookLearningMaterials} from './textbook-learning-catalog.mjs';

// These are reviewed content-to-task mappings, not calibrated IELTS difficulty
// estimates. A stage describes the amount of material/support in a lesson.
// Never infer a learner's route from school year or an untagged original bank.
export const routingNotice = '完成一次能力测评后，按本次作答安排需要练习的项目；本周任务可以集中在一到两科。材料从 B1 左右的语境理解开始，阶段表示文本和提示安排，不代表年级或雅思分数。';
export const dimensionNames = Object.freeze({
  vocabulary:'词义与搭配', grammar:'句子结构', word_form:'词形变化', logic:'句间逻辑',
  paraphrase:'同义改述', reference:'指代关系', sentence_meaning:'句意理解', detail:'定位与核对信息', inference:'有依据的推断',main_idea:'段落与篇章主旨',
  spelling:'听力词语填写', distractors:'听力细节填写', paragraph:'书面表达与段落展开',
  development:'口头回答与展开', sentence:'完整句表达', cohesion:'衔接', argument:'论证链',
});
export const dimensionAliases = Object.freeze({spelling:'听力词语填写',distractors:'听力细节填写'});

const objectiveCheck = (id,skill,dimension,title,stage,rows) => ({
  id,skill,dimension,title,stage,minutes:skill==='reading'?10:7,
  instructions:'独立作答。提交后再看解析；本组只补充这一项任务表现，不换算雅思分数。',
  items:rows.map(([prompt,labels,answer,explanation,passage],index)=>({
    id:`${id}-${index+1}`,skill,dimension,stage,prompt,
    options:labels.map((label,i)=>({value:String.fromCharCode(65+i),label})),answers:[answer],
    explanation, ...(passage?{passage}:{}),materialFamilyId:id,
  })),
});

const foundationChecks = [
  objectiveCheck('check-vocabulary','foundation','vocabulary','词义与搭配：六题练习','foundation',[
    ['You must return the book before the _____.',['deadline','entrance','audience'],'A','deadline 是完成任务的截止时间。'],
    ['Please _____ your name on this form to join the club.',['repair','register','borrow'],'B','register 表示登记；表格和加入社团提供语境。'],
    ['This seat is _____; nobody is using it.',['available','crowded','private'],'A','available 表示可使用的。'],
    ['The broken lift is out of _____.',['order','season','shape'],'A','out of order 表示设备故障。'],
    ['We need permission before we use the room. What do we need?',['A written story','Someone’s approval','More furniture'],'B','permission 指许可或同意。'],
    ['Students compared the two plans. What did they do?',['Looked for similarities and differences','Chose the longer plan without reading','Copied both plans'],'A','compare 表示比较共同点和不同点。'],
  ]),
  objectiveCheck('check-grammar','foundation','grammar','完整句与时态：六题练习','foundation',[
    ['Choose the complete, correct sentence.',['The students ready.','The students are ready.','The students is ready.'],'B','复数主语 students 用 are；完整句需要谓语。'],
    ['Yesterday, our class _____ the museum.',['visits','visited','visiting'],'B','Yesterday 对应已完成的过去事件。'],
    ['If it rains tomorrow, we _____ indoors.',['will practise','practised','practising'],'A','条件从句用现在时，主句表达未来安排。'],
    ['There _____ two reasons for this choice.',['is','are','be'],'B','two reasons 是复数。'],
    ['Which sentence joins the ideas correctly?',['I was tired, I finished the task.','Although I was tired, I finished the task.','Although tired and the task.'],'B','Although 引导让步从句，主句仍然完整。'],
    ['The book _____ I borrowed is about birds.',['who','that','where'],'B','that 在这里指代 book，并作 borrowed 的宾语。'],
  ]),
  objectiveCheck('check-word-form','foundation','word_form','词形与单复数：六题练习','foundation',[
    ['She explained the rule _____.',['clear','clearly','clarity'],'B','修饰 explained 用副词 clearly。'],
    ['The club offers several outdoor _____.',['activity','activities','active'],'B','several 后用可数名词复数。'],
    ['We need more _____ before choosing a route.',['inform','informative','information'],'C','need 后需要名词 information。'],
    ['Their _____ was based on the timetable.',['decision','decide','decisive'],'A','Their 后接名词 decision。'],
    ['A _____ teacher checks the examples carefully.',['care','careful','carefully'],'B','teacher 前用形容词 careful。'],
    ['The library is _____ to all students.',['access','accessibly','accessible'],'C','be 后用形容词 accessible 表示可使用。'],
  ]),
  objectiveCheck('check-logic','foundation','logic','原因、转折与条件：六题练习','supported',[
    ['The match was cancelled _____ heavy rain made the field unsafe.',['because','although','unless'],'A','后半句解释取消的原因。'],
    ['The new room is small. _____, it is quieter than the old one.',['For example','However','Therefore'],'B','小与较安静构成对比。'],
    ['Take notes during the talk _____ you can review the main points later.',['so that','even though','whereas'],'A','so that 引出做笔记的目的。'],
    ['The bus was late. As a result, Mia missed the start. What caused her to miss it?',['The late bus','The start of the event','Her notes'],'A','As a result 引出结果，原因在前句。'],
    ['You may use the lab only if a teacher is present. Which is required?',['A teacher must be there','It must be morning','Every student must attend'],'A','only if 表示必要条件。'],
    ['Which sentence gives an example of saving water?',['Water is important.','For instance, we collect rainwater for the garden.','People disagree about water.'],'B','具体动作 collect rainwater 支持节水这一观点。'],
  ]),
  objectiveCheck('check-paraphrase','foundation','paraphrase','同义改述：六题练习','supported',[
    ['“The event was postponed until Friday.” Which means the same?',['The event was cancelled forever.','The event was moved to Friday.','The event finished on Friday.'],'B','postpone 表示推迟，并非取消。'],
    ['“Only club members may enter.” Which is accurate?',['Anyone may enter.','Members are required to leave.','Entry is limited to members.'],'C','only 保留进入者的范围限制。'],
    ['“The course is optional.” Which means the same?',['Students can choose whether to take it.','Every student must take it.','Nobody is allowed to take it.'],'A','optional 表示可选择。'],
    ['“Most students walked to school.” Which is accurate?',['All students walked.','More than half walked.','No student used a bus.'],'B','Most 不等于所有人，也未排除乘车者。'],
    ['“The new method reduced waiting time.” Which matches?',['People waited longer.','The waiting time stayed the same.','People spent less time waiting.'],'C','reduced 表示减少。'],
    ['“The room is used mainly for meetings.” Which preserves the meaning?',['Meetings are its main use.','Meetings are its only use.','It is never used for meetings.'],'A','mainly 表示主要，不能改成 only。'],
  ]),
  objectiveCheck('check-reference','foundation','reference','指代关系：六题练习','supported',[
    ['Mina borrowed a camera. She returned it on Monday. What does “it” refer to?',['Monday','The camera','Mina'],'B','it 指前句的 camera。'],
    ['The gardeners planted beans beside the fence. These grew quickly. What grew?',['The beans','The gardeners','The fence'],'A','These 回指复数名词 beans。'],
    ['Leo missed the bus, and this made him late. What does “this” refer to?',['Being late','Missing the bus','Meeting Leo'],'B','this 指前面的事件。'],
    ['The old room was noisy; the new one is quiet. What does “one” replace?',['Noise','Student','Room'],'C','one 替代前文单数名词 room。'],
    ['Sara and Ali tested their designs. Who do “their” designs belong to?',['Sara and Ali','Only Sara','Their teacher'],'A','their 回指并列主语 Sara and Ali。'],
    ['The team repeated the experiment. Doing so helped them check the result. What does “Doing so” mean?',['Checking the timetable','Repeating the experiment','Changing the result'],'B','Doing so 回指前一句的动作。'],
  ]),
];

const readingChecks = [
  objectiveCheck('check-reading-detail','reading','detail','通知与短文：定位信息练习','supported',[
    ['When does the room open on Wednesday?',['8:00','9:00','10:00'],'B','Wednesday 属于周二至周五。','The study room opens at 10:00 on Mondays and 9:00 from Tuesday to Friday. Weekend opening begins at 8:00.'],
    ['Which students need to bring gloves?',['Everyone in the club','Those moving the soil','Those drawing the plan'],'B','通知明确限定 moving soil 的学生。','The gardening club will meet at 3:30. Students moving soil should bring gloves. Students drawing the plan need only a pencil.'],
    ['How many books may a student borrow?',['Two','Three','Four'],'C','四本是学生的借阅数量；两周是时间。','Students may borrow four books for two weeks. Teachers may borrow six. The library renews loans by email.'],
    ['Where should completed forms be taken?',['The office','The sports hall','The classroom'],'A','提交地点是 office。','Collect a sports-day form from your classroom. Complete it and take it to the office before Thursday. The event is in the sports hall.'],
    ['What was measured each morning?',['The number of visitors','The height of the plants','The temperature of the room'],'C','height 是周五测量；each morning 对应 temperature。','The students recorded the room temperature each morning. On Friday, they measured the height of every plant.'],
    ['Which statement matches the notice?',['All rehearsals are cancelled','Friday’s rehearsal starts later','The concert has moved to Friday'],'B','只有周五排练时间由四点改为五点。','Rehearsals normally begin at four. This Friday only, rehearsal will begin at five because the room is in use. The concert date is unchanged.'],
  ]),
  objectiveCheck('check-reading-inference','reading','inference','短文证据与主旨：六题练习','supported',[
    ['Why is the second trial needed?',['To check whether the result happens again','To guarantee a better result','To avoid recording results'],'A','重复试验用于核查结果，不保证出现某种结果。','One group of plants grew faster near the window. Before deciding that light caused the difference, the class plans another trial using the same soil and water.'],
    ['What is the main point?',['Every student likes silence','Different tasks can need different study spaces','Group work should end'],'B','两种空间分别服务不同任务。','The quiet room helps students read alone. The discussion room allows groups to compare ideas. The school keeps both because the tasks are different.'],
    ['Which conclusion is supported?',['The new bus schedule may help some students','Every student now arrives early','The old schedule was unsafe'],'A','some 与原文范围一致；没有全体学生或安全证据。','After a bus arrived ten minutes earlier, some students said they could attend morning clubs. Others still walked and noticed no change.'],
    ['Why does the writer mention the repair?',['To show a drawback of sharing equipment','To prove borrowing always fails','To describe a new sport'],'A','sharing 有收益也有保养成本；具体维修说明后者。','Sharing cameras saved the club money. However, a camera used by many groups needed repair after a month. Shared equipment still needs care and a repair budget.'],
    ['What is the writer’s view of the idea?',['It is certain to work everywhere','It is worth trying with results checked','It should never be tried'],'B','trial 和 review 表明先试行再判断。','A lunchtime reading club could be useful. We suggest a four-week trial, followed by a review of attendance and students’ comments before making it permanent.'],
    ['Which conclusion goes beyond the evidence?',['A survey included twenty volunteers','Some volunteers liked the longer lunch','Every student prefers the longer lunch'],'C','20名志愿者不能代表所有学生的偏好。','Twenty volunteers answered the survey. Fifteen preferred the longer lunch. The school has not yet asked the other students.'],
  ]),
];

const listeningCheck = (id,dimension,title,originalId,rows,maxWords=1) => ({
  id,skill:'listening',dimension,title,stage:'supported',minutes:12,
  instructions:`先读题再听完整录音，每空不超过 ${maxWords} 个词和／或数字。只记录填写表现；错误原因需结合回听核查。`,
  materialFamilyId:originalId,
  items:rows.map(([number,prompt,answers,explanation])=>({
    id:`check-audio-${originalId}-${number}`,skill:'listening',dimension,stage:'supported',prompt,answers,explanation,maxWords,
    originalQuestionId:number,originalId,materialFamilyId:originalId,audioGroup:originalId,
    audioUrl:`https://sls-reading-zac.b-cdn.net/media/listening/${originalId}.mp3`,audioTitle:title,
  })),
});

const listeningChecks = [
  listeningCheck('check-listening-words','spelling','热气球咨询：词语填写练习','10e5887b-1876-4e4a-9f81-5fdba72b08d3',[
    [2,'Each participant receives a free _____ after the flight.',['certificate'],'录音说明免费提供 certificate；其他纪念品另收费。'],
    [3,'An exact flight date can only be booked _____.',['online'],'指定日期需要在线预订。'],
    [5,'There are no flights at _____.',['night'],'录音说明不在夜间飞行。'],
    [6,'The best season for a flight is _____.',['autumn'],'最佳季节为 autumn。'],
    [7,'A flight may be cancelled because of a _____.',['thunderstorm'],'录音举出的恶劣天气是 thunderstorm。'],
    [8,'Passengers should wear a jacket and a _____.',['helmet'],'建议佩戴 helmet。'],
  ]),
  listeningCheck('check-listening-details','distractors','登记表：细节填写练习','003d07ce-596c-4fc5-8279-b463dd8a6056',[
    [1,'Peter Smith’s street address: _____',['95 Cross Street'],'登记表地址为 95 Cross Street。'],
    [3,'Telephone number: _____',['46895324'],'逐位核对电话号码 46895324。'],
    [5,'Date of injury: _____',['18th June','18 June','June 18','June 18th'],'受伤日期为六月十八日。'],
    [6,'His own doctor advised treatment with an _____.',['ice pack'],'此前医生建议使用 ice pack。'],
    [7,'He is unable to _____.',['go upstairs'],'录音描述目前不能 go upstairs。'],
    [9,'He is advised to stop using the _____.',['stick'],'此次建议停止使用 stick。'],
  ],3),
];

const focusedChecks = [...foundationChecks,...readingChecks,...listeningChecks];
const listeningPracticeChecks = listeningCheckpoints.map(check=>({...check,
  title:check.title.replace('阶段检查','独立练习'),kind:'practice',purpose:'practice',checkpoint:false,reserved:false,
}));
const listeningPracticeMaterials = listeningProgressionMaterials.map(material=>({...material,
  title:material.title.replace('阶段检查','独立练习'),kind:'practice',purpose:'practice',checkpoint:false,reserved:false,
  selectionEligible:true,prerequisites:material.prerequisites||[],scoringMode:'answer_key',supportAllowed:[],
  selectionReason:material.selectionReason||'独立听一段录音，练习核对信息或理解同义表达；提交后查看答案。',
  completionCriterion:'完成六题并保存结果；初次独立作答与回听复习分别记录。',
  retestCriterion:'根据日常练习调整后续任务；不再安排额外的阶段考试。',
}));
export const confirmationChecks = [...focusedChecks,...listeningPracticeChecks];

// Question-level audit: a main-idea question is not silently labelled “detail”.
const readingTargets = {
  'r-pencil':[['detail','detail','detail','detail','detail','main_idea'],['detail','paraphrase','detail','detail','detail','inference'],['detail','detail','detail','detail','inference','main_idea']],
  'r-plants':[['detail','detail','detail','inference','detail','main_idea'],['detail','detail','detail','detail','logic','inference'],['logic','detail','inference','detail','detail','main_idea']],
  'r-birds':[['detail','detail','detail','detail','detail','detail'],['detail','detail','detail','detail','detail','inference'],['inference','detail','inference','detail','detail','main_idea']],
};
const reviewedReading = readingUnits.flatMap(unit=>unit.versions.map((version,vi)=>({
  id:`${unit.id}:${version.stage}`,skill:'reading',stage:version.stage,
  title:`${unit.titleCn || unit.title}：${vi===0?'信息定位与句意核对':vi===1?'段落定位与证据核对':'主旨、推断与证据边界'}`,
  route:`foundation/${unit.id}/${version.stage}`,minutes:vi===0?12:18,
  prerequisites:vi?[`${unit.id}:${unit.versions[vi-1].stage}`]:[],
  prerequisitePolicy:'已有相应日常练习记录时可以跳过；同篇其他版本用于继续学习。',
  materialFamilyId:unit.materialFamilyId||unit.originalId,
  skillTargets:[...new Set(version.questions.map((q,qi)=>q.dimension||readingTargets[unit.id][vi][qi]))],
  questionIds:version.questions.map(q=>q.id),questionCount:version.questions.length,
  questionTargets:version.questions.map((q,qi)=>({id:q.id,dimension:q.dimension||readingTargets[unit.id][vi][qi]})),
  sourceKind:'school_adaptation',selectionEligible:true,contentReview:'question_level',
  supportAllowed:vi===0?['关键词释义','段落作用提示','提交后查看证据']:vi===1?['关键词释义','提交后查看证据']:['作答后核对证据'],
  automaticEntry:true,minimumCefr:'B1',difficultyCalibration:'not_established',adaptation:version.adaptation,
  selectionReason:vi===0?'在原题改编短文中理解同义表达、因果与信息范围，再回到对应原题。':vi===1?'练习跨句定位与改述；每个答案都回到原文核对。':'区分作者表达、合理推断和文本没有说明的信息。',
  completionCriterion:'完成六题，并为错题标出原文证据；使用提示会记录为有提示训练。',
  retestCriterion:'换一篇未见材料独立完成，不用同篇另一版本证明掌握。',
})));

const vocabTargets = {
  'v-spelling':['vocabulary','word_form'],'v-nouns':['vocabulary'],'v-adjectives':['word_form','vocabulary'],
  'v-linked':['paraphrase','vocabulary'],'v-plurals':['word_form','grammar'],'v-survival':['vocabulary'],
  'v-verbs':['grammar','word_form'],'v-academic':['paraphrase','logic'],
};
const vocabularyPrerequisites = {
  'v-spelling':[],'v-nouns':[],'v-adjectives':['v-nouns'],'v-linked':['v-nouns'],
  'v-plurals':['v-nouns'],'v-survival':['v-nouns'],'v-verbs':['v-nouns'],'v-academic':['v-verbs'],
};
const reviewedVocabulary = vocabularySets.map(unit=>({
  id:unit.id,skill:'foundation',stage:unit.stage,title:unit.title,route:`foundation/vocabulary/${unit.id}`,
  minutes:10,prerequisites:vocabularyPrerequisites[unit.id],skillTargets:vocabTargets[unit.id],
  prerequisitePolicy:'已有相应词义或词形证据时可以跳过；不要求依次完成整本词库。',
  materialFamilyId:unit.id,questionCount:unit.items.length,questionIds:unit.items.map((_,i)=>`${unit.id}-${i}`),
  sourceKind:'school_original',selectionEligible:false,supportAllowed:['释义','例句','练习语音'],
  selectionReason:'先辨认词义和词形，再在例句中使用；练习语音不作为正式听力测评。',
  completionCriterion:'完成本组词汇练习，记录错词并各写一个相关例句。',
  retestCriterion:'用未练过的句子检查词义或词形；背熟本组不直接证明迁移。',
}));

const writingTargets = [['grammar','sentence'],['logic','sentence'],['paraphrase','sentence'],['paragraph','cohesion'],['paragraph','development'],['paraphrase','paragraph'],['logic','argument'],['argument','cohesion'],['paragraph','cohesion'],['argument','paragraph'],['logic','argument'],['argument','paragraph']];
const reviewedWriting = writingUnits.map((unit,i)=>({
  id:unit.id,skill:'writing',stage:unit.stage,title:unit.title,route:`writing/${unit.id}`,minutes:unit.minutes,
  prerequisites:unit.prerequisites||[],materialFamilyId:unit.id,skillTargets:[...new Set(['paragraph',...writingTargets[i]])],
  questionIds:[unit.id],questionCount:1,sourceKind:'school_original',selectionEligible:i>=3,scoringMode:'machine_review',automaticEntry:i>=3,minimumCefr:i>=3?'B1':null,
  supportAllowed:['词块','范例分析','结构提示'],selectionReason:i<3?'用具体校园生活练习完整句、原因和比较。':i<6?'把中心句、解释和具体例子连成一段。':'练习论点、原因、例子、限制条件之间的完整联系。',
  completionCriterion:'提交初稿、修改稿和修改说明，查看任务回应、组织、词汇与语法的批改结果。',
  retestCriterion:'在新话题下独立写作；字数和提交次数不等于能力评分。',
}));
const reviewedSpeaking = speakingUnits.map((unit,i)=>({
  id:unit.id,skill:'speaking',stage:unit.stage,title:unit.title,route:`speaking/${unit.id}`,minutes:unit.minutes,
  prerequisites:unit.prerequisites||[],materialFamilyId:unit.id,skillTargets:['development',...(i<3?['sentence']:i<6?['cohesion']:['argument'])],
  questionIds:[unit.id],questionCount:1,sourceKind:'school_original',selectionEligible:i>=3,scoringMode:'machine_review',automaticEntry:i>=3,minimumCefr:i>=3?'B1':null,
  supportAllowed:['关键词提纲','范例分析','分步提示'],selectionReason:i<3?'先直接回答，再补一个具体细节和原因。':i<6?'按顺序讲清经历、行动和变化。':'由校园经历过渡到解释原因、讨论不同选择和回应追问。',
  completionCriterion:'提交录音，结合反馈选择一处修改并重录。',
  retestCriterion:'换一个话题，不照读全文作答；文字提纲不能替代发音与流利度评估。',
}));

// A measured sentence gap can lead to an actual sentence-writing lesson.
// The work is still reviewed as writing; it does not create an automatic
// foundation score merely because the student submits a paragraph.
const sentenceRemediation = [
  {id:'foundation-sentence-w1',unitId:'w1',stage:'foundation',skillTargets:['grammar'],
    title:'把词组成完整句：学校生活',selectionReason:'先检查主语、动词和时态，再写五至七个有时间与地点的完整句。'},
  {id:'foundation-reason-w2',unitId:'w2',stage:'supported',skillTargets:['logic'],
    title:'把观点与原因连起来',selectionReason:'用 because 等连接原因，检查原因是否真的支持前面的观点。'},
].map(row=>({...row,skill:'foundation',route:`writing/${row.unitId}`,minutes:12,prerequisites:[],
  materialFamilyId:row.unitId,questionIds:[row.unitId],questionCount:1,
  sourceKind:'school_original',selectionEligible:false,scoringMode:'machine_review',
  supportAllowed:['词块','完整句范例','分步修改'],
  completionCriterion:'按任务写出自己的句子，提交后查看批改结果并修改；提交次数不等于能力评分。',
  retestCriterion:'在日常练习中换一组新句子，检查能否独立使用。',
}));

// Only verified, individually named tracks are routed. No invented item counts:
// a publisher track's self-recorded dictation result is not an objective score.
const corpusRows = [
  ['publisher-chapter2-1','foundation','通用拼写：第 1 组',['spelling'],[], '逐词听写后核对拼写；记录漏听与拼写差异，暂不判断其成因。'],
  ['publisher-chapter3-1','foundation','名词听写：Test 1 横向',['spelling'],['publisher-chapter2-1'],'核对校园与生活名词的听到形式和写出形式。'],
  ['publisher-chapter4-1','supported','形容词听写：Test 1 横向',['spelling'],['publisher-chapter3-1'],'听写形容词并核对词尾，再回到句子辨认其位置。'],
  ['publisher-chapter5-1','supported','词组与连读：Test 1 横向',['distractors','spelling'],['publisher-chapter3-1'],'按词组暂停、听写、回听核对；是否存在连读识别困难须由记录确认。'],
  ['publisher-chapter6-1','foundation','复数词尾：Cambridge 1 横向',['spelling'],['publisher-chapter2-1'],'集中核对复数词尾；原测试失分本身不能证明单复数是原因。'],
  ['publisher-chapter7-1','foundation','缩写：基本语料',['spelling'],[],'核对字母与缩写，再在未见登记表中练习填写。'],
  ['publisher-chapter7-3','supported','发音与拼写：基本语料',['spelling'],['publisher-chapter2-1'],'对照听到的词与写出的词，记录需要回听的位置。'],
  ['publisher-chapter8-2','supported','生活场景：Training 1 Test 1',['distractors'],['publisher-chapter3-1'],'按场景提取人物、时间、地点等信息，再与文本核对。'],
  ['publisher-chapter9-1','supported','动词听写：横向训练',['spelling','distractors'],['publisher-chapter3-1'],'核对动作与词形，结合短句检查信息是否完整。'],
  ['publisher-j19_chapter11-1','bridge','综合听写：Section 1 词语训练',['spelling','distractors'],['publisher-chapter3-1','publisher-chapter4-1'],'完成较长词语训练后回到新的整段录音核查填写表现。'],
  ['publisher-j19_chapter11-2','bridge','综合听写：Section 1 词组训练',['distractors'],['publisher-chapter5-1'],'连续听写词组并核对遗漏；自记正确率仅用于训练记录。'],
];
const reviewedCorpus = corpusRows.map(([id,stage,title,skillTargets,prerequisites,selectionReason])=>({
  id,skill:'listening',stage,title,skillTargets,prerequisites,selectionReason,route:`corpus/${id}`,minutes:15,
  materialFamilyId:id,questionCount:0,questionIds:[],questionCountSource:'not_available',
  sourceKind:'corpus_exercise',selectionEligible:true,scoringMode:'self_recorded',
  stageStarter:['publisher-chapter2-1','publisher-chapter8-2','publisher-j19_chapter11-1'].includes(id),
  supportAllowed:['分段暂停','回听','核对文本'],
  completionCriterion:'完成指定音频的一段听写，记录词数、错词和回听次数。',
  retestCriterion:'通过有答案键的日常听力练习记录独立表现；听写自记不作为自动进阶依据。',
}));

const checkMaterials = focusedChecks.map(check=>({
  id:check.id,kind:'confirm',skill:check.skill,stage:check.stage,title:check.title,route:`diagnostic/check/${check.id}`,
  minutes:check.minutes,prerequisites:[],skillTargets:[check.dimension],questionCount:check.items.length,
  questionIds:check.items.map(item=>item.id),materialFamilyId:check.materialFamilyId||check.id,
  sourceKind:check.skill==='listening'?'exam_excerpt':'school_original',selectionEligible:true,scoringMode:'answer_key',
  supportAllowed:[],selectionReason:'完成这组六题后核对答案与证据，将结果加入日常学习记录。',
  completionCriterion:'独立提交六题后查看解析；录音无法播放则不计入听力判断。',
  retestCriterion:'重复本组只算复习，不重复累计测评样本。',
}));

// Full original tasks are assigned only under an independent practice condition.
// “independent” here does not certify a band or rank the bank by difficulty.
// Existing answers and options remain in the original bank; these entries only
// audit the question targets and launch the real paper.
const originalRows = [
  ['reading','a83ead2d-5ef0-4db2-924d-9f59ef98d5d1','铅笔的历史：原文填空与判断',[
    ['detail',[1,2,3,4,5,6,7,8,9,10,11,12,13]],
  ],'完成第 1—7 题原文填空，再核对第 8—13 题的证据与范围。'],
  ['reading','1773485843662','植物交流：段落标题与研究者观点',[
    ['main_idea',[1,2,3,4,5,6]],['detail',[7,8,9,10,11,12,13]],
  ],'先概括第 1—6 题的段落主旨，再完成摘要与人物观点对应。'],
  ['reading','7cdb3231-9f38-4b69-90a5-36543cb99e3e','鸟类迁徙：标题、证据与句子填空',[
    ['main_idea',[1,2,3,4,5,6,7]],['detail',[8,9,10,11,12,13]],
  ],'完成七个段落的标题匹配，再核对多选与句子填空的原文证据。'],
  ['listening','00b32727-93ea-4a1c-a5fe-aa8a84ab8af6','光喷嚏反射：完整讲座笔记',[
    ['detail',[1,2,3,4,5,6,7,8,9,10]],
  ],'独立听完整讲座，按研究背景、机制、发现和应用填写十个空。'],
  ['listening','019d2ed8-270e-4329-ab13-9ad709b49c8a','鲸鱼调查：表格填写与种类匹配',[
    ['detail',[1,2,3,4,5,6,7]],['paraphrase',[8,9,10]],
  ],'先完成七项调查记录，再核对三种鲸鱼的特征匹配。'],
];
const reviewedOriginals = originalRows.map(([skill,id,title,targetGroups,selectionReason])=>({
  id,originalId:id,materialFamilyId:id,skill,title,stage:'independent',
  stageBasis:'full_material_without_support',difficultyCalibration:'not_established',
  route:`practice/${skill}/${id}`,minutes:skill==='reading'?25:15,prerequisites:[],
  prerequisitePolicy:'由当前独立作答证据选择；不按年级或目标分数直接分配。',
  skillTargets:targetGroups.map(([dimension])=>dimension),
  questionTargets:targetGroups.flatMap(([dimension,ids])=>ids.map(id=>({id,dimension}))),
  questionIds:targetGroups.flatMap(([,ids])=>ids),questionCount:targetGroups.reduce((n,[,ids])=>n+ids.length,0),
  sourceKind:'original_reviewed',contentReview:'question_targets_and_availability',selectionEligible:true,
  scoringMode:'answer_key',supportAllowed:[],selectionReason,
  ...(skill==='listening'?{audioAvailable:true,audioStatus:'ready'}:{}),
  completionCriterion:'独立完成所列全部题目，再核对答案与证据；用时和正确率分别记录。',
  retestCriterion:'下一次换未见材料；练过改编版的同源原文属于熟悉材料，不能证明新材料上的表现。',
}));

export const learningMaterials = [...reviewedReading,...reviewedVocabulary,...reviewedWriting,...reviewedSpeaking,...sentenceRemediation,...reviewedCorpus,...checkMaterials,...reviewedOriginals,...progressionMaterials,...listeningPracticeMaterials,...textbookLearningMaterials];
export const learningMaterialsById = Object.fromEntries(learningMaterials.map(material=>[material.id,material]));
