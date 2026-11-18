// Reviewed adaptations of the existing school-owned reading bank.
// B1 is a teaching target, not a calibrated examination level.
import {extendedPassages,extendedQuestions} from './bank-adaptations-extended.mjs';
const options = labels => labels.map((label, i) => ({value: String.fromCharCode(65 + i), label}));
const sources = {
  pencil: {id:'a83ead2d-5ef0-4db2-924d-9f59ef98d5d1',title:'The history of pencil'},
  plants: {id:'1773485843662',title:'How do plants talk to each other?'},
  birds: {id:'7cdb3231-9f38-4b69-90a5-36543cb99e3e',title:'Birds migration'},
};
const passages = {
  pencil: [
    'A. In 1564, people in Borrowdale, England, discovered graphite near the roots of a tree. The dark material was soft and left marks easily, so local people used it to mark their sheep. They thought it was lead, another dark material. The name has survived, although a modern pencil does not contain the metal lead.',
    'B. Soft graphite needed support. Early pencil makers in Italy wrapped it in string or animal skin. Later, wood was used to hold it. In Germany, makers developed a method using two wooden halves with graphite between them. The halves were then joined together. This basic method is still used today.',
    'C. Modern pencil centres contain graphite mixed with clay. Changing the amount of clay changes the hardness: more clay produces a harder centre. Letters on pencils describe these differences. H means hard, B means black, and HB is a standard writing grade. Choosing a pencil therefore involves more than looking at its colour.',
    'D. Digital tools have changed how people work, but pencils still serve different purposes. Students use them for maths, artists for drawing, and architects for plans. The article suggests that these varied uses will help pencils remain useful.',
  ],
  plants: [
    'A. In 1983, two scientists reported that healthy maple trees increased their protection after nearby trees were damaged by insects. They suggested that the damaged trees released chemicals into the air. Other researchers were doubtful because the results were difficult to repeat. They also asked why a tree would spend resources helping its neighbours.',
    'B. Later experiments provided stronger evidence. In one study, wild tobacco plants became better protected against insects when they grew near damaged sagebrush plants. The change appeared to be a response to chemicals released by the sagebrush. Similar responses were later found in several other kinds of plants.',
    'C. Researchers have also investigated signals below ground. In an experiment with pea plants, the first plant in a row experienced a shortage of water. It closed small holes on its leaves, and neighbouring plants then did the same. However, when contact between their roots was blocked, the neighbours kept these holes open. This comparison supported the idea that the signal travelled through the roots.',
    'D. Understanding these signals may help people grow stronger crops. Researchers see this as a future possibility, rather than a method that farmers can already use with certainty. More work is still needed.',
  ],
  birds: [
    'A. Birds mainly migrate because food becomes difficult to find during winter. Many species can survive low temperatures when food is available. This means that cold weather alone does not explain every journey. Before a long flight, birds can store fat, which supplies energy. Their light bones and special feathers also help them travel long distances.',
    'B. Some journeys are still difficult to explain. British swallows, for example, travel farther south than seems necessary to find food and suitable weather. Young cuckoos present another puzzle: they reach their winter homes without their parents showing them the route. Scientists suggest that some direction-finding ability is inherited, but they do not fully understand how it works.',
    'C. Many small birds travel at night. They avoid hunters that are active during the day and lose less water than they would in warm sunlight. The air is also usually cooler and more stable, which helps them continue flying.',
    'D. Night travel does not remove every danger. Birds still need to leave at a suitable time and use favourable winds. Some can react to changes in air pressure before a change in the weather becomes visible. Choosing when to travel is therefore as important as being able to fly.',
  ],
};
function question(topic,index,prompt,labels,answer,dimension,explanation,paragraph,quote,sourceQuestion,originalType,sourceParagraph,sourceQuote,to) {
  return {id:`${topic}-0-${index}`,prompt,options:options(labels),answers:[answer],dimension,explanation,
    evidence:{paragraph,quote},source:{passageId:sources[topic].id,questionId:sourceQuestion,originalType,paragraph:sourceParagraph,quote:sourceQuote},
    transformation:{from:originalType,to,purpose:dimension==='logic'?'核对原因与结果':dimension==='paraphrase'?'识别同义表达':dimension==='main_idea'?'区分主旨与细节':'用原文证据核对信息'}};
}
const questions = {
  pencil: [
    question('pencil',0,'Which description explains why graphite was useful for marking sheep?',['It left a visible mark easily.','It was as heavy as lead.','It was already surrounded by wood.'],'A','detail','A 段把 soft、left marks easily 与标记羊只相连；重量和木壳都不是这里给出的原因。','A','The dark material was soft and left marks easily, so local people used it to mark their sheep.',3,'text','A','It was soon put to use by locals in marking their sheep for ownership and calculation','cause_effect_choice'),
    question('pencil',1,'Match the manufacturing change to its effect: adding more clay →',['a softer centre','a harder centre','a wooden outside'],'B','logic','C 段说明 clay 的比例控制硬度；wood 是外壳材料，不能和笔芯硬度混为一谈。','C','more clay produces a harder centre',6,'text','C','The more clay you put in,the higher hardness the core has','cause_effect_matching'),
    question('pencil',2,'Which sentence is the best evidence that pencil making began early in Italy?',['HB is a standard writing grade.','Students use pencils for maths.','Early makers in Italy wrapped graphite in string or skin.'],'C','detail','证据应回答“哪里、怎样开始制作”，B 段的 Italy 与 wrapped 是关键；其他句子只讲等级和用途。','B','Early pencil makers in Italy wrapped it in string or animal skin.',8,'tfng','B','In Italy,graphite sticks were initially wrapped in string or sheepskin for stability','evidence_selection'),
    question('pencil',3,'“This basic method is still used today” means that makers _____.',['continue to join two wooden halves around graphite','now use the same tree discovered in 1564','have stopped using wood for pencils'],'A','paraphrase','This basic method 回指两片木头夹住石墨再粘合；不是说材料来自同一棵树。','B','The halves were then joined together. This basic method is still used today.',9,'tfng','B','the halves then glued together-essentially the same method in use to this day','paraphrase_choice'),
    question('pencil',4,'Which information is missing from the text?',['What H stands for','The exact amount of clay in an HB pencil','Why graphite needed support'],'B','inference','文中给出字母含义、硬度变化方向和包裹原因，但没有给 HB 的黏土比例，不能自己补出数字。','C','H means hard, B means black, and HB is a standard writing grade.',6,'text','C','Then the standard writing pencil is graded HB','evidence_boundary_choice'),
    question('pencil',5,'Which heading best summarises paragraph D?',['Why every digital tool will disappear','The cost of making a pencil','Different uses give pencils a continuing role'],'C','main_idea','D 段列举三个群体的用途来支持“继续有用”；没有比较价格，也没有否定数字工具。','D','The article suggests that these varied uses will help pencils remain useful.',13,'tfng','F','A spectrum of users are likely to continue to use it into the future','heading_choice'),
  ],
  plants: [
    question('plants',0,'Why did researchers question the early maple-tree findings?',['The insects were too small to see.','Other experiments did not easily produce the same result.','Maple trees could not grow near one another.'],'B','detail','A 段 difficult to repeat 对应选项“不能容易地得到同样结果”，不是植物不能相邻。','A','the results were difficult to repeat',1,'matching','A','The results were difficult to replicate','evidence_selection'),
    question('plants',1,'Which phrase means “became better protected against insects”?',['grew farther away from insects','stopped releasing all chemicals','became more resistant to insect damage'],'C','paraphrase','better protected 与 more resistant 都描述抵御虫害能力；原文没有说昆虫完全消失。','B','wild tobacco plants became better protected against insects',2,'matching','B','wild tobacco plants became resistant to herbivores','paraphrase_choice'),
    question('plants',2,'Match the condition to the response: root contact was blocked →',['neighbouring plants kept their leaf holes open','all neighbouring plants closed their leaf holes','the first plant received extra water'],'A','logic','C 段 However 后说明对照组的变化：根部接触被阻断后，邻株没有像前一组那样闭孔。','C','when contact between their roots was blocked, the neighbours kept these holes open',7,'text','D','in a control setup where root contact between neighboring plants was blocked, pores stayed open','cause_effect_matching'),
    question('plants',3,'Why is the blocked-root group important?',['It proves that all plant signals use air.','It makes the experiment shorter.','It lets researchers compare responses with and without root contact.'],'C','logic','实验把能否接触这一条件改变，再比较反应；这种比较支持根部通道解释，不证明所有植物只用一种通道。','C','This comparison supported the idea that the signal travelled through the roots.',4,'matching','D','Importantly, in a control setup where root contact between neighboring plants was blocked, pores stayed open','evidence_reason_choice'),
    question('plants',4,'Which conclusion keeps the limit in paragraph D?',['Farmers can already use these signals with certainty.','Plant signals may help crop production, but more research is needed.','Research has shown that all crops resist every insect.'],'B','inference','may、future possibility 和 More work is still needed 限定结论；不能改成已确定、所有、每种。','D','More work is still needed.',11,'matching','F','Applying our limited knowledge of plant-communication mechanisms to agriculture is a big jump','evidence_boundary_choice'),
    question('plants',5,'Which heading fits paragraph C?',['Testing an underground route for signals','The discovery of chemicals in the air','A farming method already used everywhere'],'A','main_idea','C 段的缺水、闭孔和阻断根部接触都围绕地下信号通道的实验，不是在介绍已普及的农业方法。','C','Researchers have also investigated signals below ground.',4,'matching','D','distress signals can be passed through the','heading_choice'),
  ],
  birds: [
    question('birds',0,'Which heading best fits paragraph A?',['A reason for migration and preparation for flight','Why every bird avoids cold temperatures','How young birds learn from their parents'],'A','main_idea','A 段先说迁徙原因是食物，再说脂肪、骨骼和羽毛如何支持飞行；只写怕冷不能概括。','A','Birds mainly migrate because food becomes difficult to find during winter.',2,'matching','B','The fundamental reason that birds migrate is to find adequate food','heading_choice'),
    question('birds',1,'Which statement preserves the meaning of “cold weather alone does not explain every journey”?',['Cold weather is never connected with migration.','Food supply must also be considered when explaining migration.','Every bird can stay in any cold place.'],'B','paraphrase','alone 与 every 限定了原句：低温不是唯一解释；不能扩成永不相关或所有鸟都能留下。','A','Many species can survive low temperatures when food is available.',2,'matching','B','Many species can tolerate cold temperatures if food is plentiful','paraphrase_choice'),
    question('birds',2,'Which example supports the claim that some birds travel farther than necessary?',['Young cuckoos have no parent showing the route.','Birds can store fat before a flight.','British swallows continue farther south than food and weather seem to require.'],'C','detail','B 段的 swallows 才提供“距离过远”的例子；cuckoos 说明没有父母带领仍能找到路线，是另一个问题。','B','British swallows, for example, travel farther south than seems necessary to find food and suitable weather.',8,'multi','C','many birds journey much further than would be necessary just to find food and good weather','claim_evidence_choice'),
    question('birds',3,'Match night flight to one benefit given in the passage →',['no need to store energy','less exposure to daytime hunters','no need to choose suitable weather'],'B','logic','C 段说明日间捕食者不活跃；夜飞降低某些风险，并不取消能量和天气要求。','C','They avoid hunters that are active during the day',12,'text','E','Daytime predators are avoided','cause_effect_matching'),
    question('birds',4,'What remains unexplained about young cuckoos?',['How inherited direction-finding ability works without parental guidance','Whether young cuckoos ever migrate','Whether parents always lead the whole journey'],'A','inference','B 段已说明它们会迁徙且没有父母引路，未完全解释的是如何继承并运用寻路能力。','B','Scientists suggest that some direction-finding ability is inherited, but they do not fully understand how it works.',10,'text','D','how young birds know how to find the traditional wintering areas without parental guidance','evidence_boundary_choice'),
    question('birds',5,'Why does paragraph D mention air pressure?',['To suggest that birds only fly indoors','To show that birds never meet bad weather','To explain how some birds may choose a suitable departure time'],'C','logic','D 段围绕起飞时机：气压变化可先于肉眼可见的天气变化，帮助判断何时出发。','D','Some can react to changes in air pressure before a change in the weather becomes visible.',13,'text','F','Often birds react to weather changes before there is any visible sign of them','evidence_reason_choice'),
  ],
};
const glossary = {
  pencil:[['graphite','石墨'],['clay','黏土'],['hardness','硬度'],['architect','建筑师']],
  plants:[['release','释放'],['resistant','有抵抗力的'],['root','根'],['crop','庄稼']],
  birds:[['migrate','迁徙'],['inherited','遗传而来的'],['pressure','压力；气压'],['favourable','有利的']],
};
const typeLabels={text:'填空',tfng:'判断',matching:'匹配',multi:'多选',cause_effect_choice:'因果选择',cause_effect_matching:'因果配对',evidence_selection:'证据选择',paraphrase_choice:'同义改写选择',evidence_boundary_choice:'信息范围判断',heading_choice:'主旨选择',claim_evidence_choice:'观点与证据配对',evidence_reason_choice:'依据与理由选择'};
function adaptationMetadata(topic,version) {
  return {sourceTitle:sources[topic].title,sourceParagraphs:[...new Set(version.questions.map(q=>q.source.paragraph))],originalQuestionIds:[...new Set(version.questions.map(q=>q.source.questionId))],difficultyIntent:version.stage==='foundation'?'B1_supported':version.stage==='supported'?'B1_with_reduced_support':'B1_to_B2_bridge',
    textChanges:version.stage==='foundation'?['保留原文主题、主要因果与结论限制。','缩短为约 200 词，拆分长句，提供关键词释义。']:version.stage==='supported'?['恢复更多原文细节和对照关系，约 240–320 词。','减少逐句线索，练习跨句核对与同义表达。']:['扩展到约 350–450 词，保留证据、解释与尚未确定的部分。','比较跨段信息，检查推断边界，提交后再看证据。'],
    taskChanges:version.questions.map(q=>({...q.transformation})),sourceNote:'从校内现有原题改编；原题与改编题属于同一材料，后续复习不计作全新材料。'};
}
export function applyBankAdaptations(readingUnits, diagnosticItems) {
  for(const unit of readingUnits) {
    const topic=unit.id.slice(2),version=unit.versions.find(v=>v.stage==='foundation');
    if(!version || !passages[topic])continue;
    version.passage=passages[topic].join('\n\n');version.wordCount=version.passage.split(/\s+/).length;
    version.questions=questions[topic];version.glossary=glossary[topic].map(([word,meaning])=>({word,meaning}));
    version.supports=['先根据题目判断要找的是原因、例子、主旨还是结论范围。','对照选项中的同义表达；只有需要时再打开词义和段落线索。'];
    version.lessonSteps=[
      {title:'先分清段落作用',explanation:'辨认每段是在给原因、举例、描述实验还是限制结论。',example:'观察 → 比较 → 解释；however 后需要重新核对范围。',task:'给每段写一个短标题，标出支持标题的两个信息点。',checklist:['标题覆盖本段主要信息。','我区分了例子和整段结论。']},
      {title:'核对同义表达',explanation:'题目经常换一种说法表达原文，先保留对象、条件和范围再比较。',example:'became resistant ↔ became better protected；may 不等于 will。',task:'找出一道题中与原文不同但意思相同的表达，并说明相同之处。',checklist:['对象与条件相同。','我没有把部分情况改成所有情况。']},
      {title:'从改型题回到原题',explanation:'先用证据选择和因果匹配理清关系，再尝试同主题原题的判断、填空或标题匹配。',example:'选出证据句 → 判断题目是否与证据一致 → 用一句话说明理由。',task:'订正后，用自己的话说明一个错误选项为何不符合文章。',checklist:['我引用了具体依据。','我能说清错误选项改动了哪项信息。']},
    ];
    for(const stage of ['supported','bridge']) {
      const other=unit.versions.find(v=>v.stage===stage),vi=stage==='supported'?1:2;
      other.passage=extendedPassages[topic][stage].join('\n\n');other.wordCount=other.passage.split(/\s+/).length;
      other.questions=extendedQuestions[topic][stage].map((row,i)=>{const [prompt,labels,answer,dimension,explanation,paragraph,quote,sourceQuestion,originalType,sourceParagraph,sourceQuote]=row;
        const item=question(topic,i,prompt,labels,answer,dimension,explanation,paragraph,quote,sourceQuestion,originalType,sourceParagraph,sourceQuote,dimension==='main_idea'?'heading_choice':dimension==='logic'?'evidence_reason_choice':dimension==='paraphrase'?'paraphrase_choice':dimension==='inference'?'evidence_boundary_choice':'evidence_selection');
        item.id=`${topic}-${vi}-${i}`;return item;
      });
      other.glossary=version.glossary;other.supports=stage==='supported'?['先独立判断段落作用；需要时再展开关键词。','提交后核对证据，说明错误选项改动了哪项信息。']:['独立完成全文与六题；提交后核对证据。'];
      other.lessonSteps=version.lessonSteps.map(step=>({...step,checklist:[...step.checklist]}));
    }
    for(const current of unit.versions){
      current.questions.forEach(q=>{q.transformation={...q.transformation,from:typeLabels[q.transformation.from]||q.transformation.from,to:typeLabels[q.transformation.to]||q.transformation.to};});
      current.adaptation=adaptationMetadata(topic,current);
    }
  }
  const replacements=[
    ['A school opened its library at lunchtime so that students who travel by bus could use it. Who was the change intended to help?',['Students who cannot easily stay after school','Only students who live beside the school','Students who prefer buying books'],'A','vocabulary','travel by bus 与午间开放形成语境：学校为不便课后留下的学生提供使用机会。'],
    ['The report that the science club submitted after the experiment describes a possible cause, not a proven fact. What does the report do?',['It proves every possible cause.','It offers an explanation that still needs checking.','It gives no explanation at all.'],'B','grammar','主句是 The report describes a possible cause；中间定语补充报告来源，possible 和 not a proven fact 保留限制。'],
    ['Only students who have completed the safety training may use the laboratory without a teacher. Which condition is required?',['Being in the final school year','Finishing any homework task','Completing the safety training'],'C','grammar','Only 与 who 从句限定学生范围，without a teacher 描述使用条件，年级不是文中的限制。'],
    ['The school made the study room more accessible by keeping it open after lessons. Here “accessible” means _____.',['easier for students to use','more difficult to find','more expensive to repair'],'A','word_form','by keeping it open 提供判断词义的行动依据，accessible 表示更容易使用。'],
    ['Although the first survey supported a longer lunch break, the school asked a second group before changing the timetable. Why?',['The first survey had no answers.','The school wanted to check whether other students agreed.','The timetable had already changed.'],'B','logic','Although 表示已有初步支持，但仍向第二组征询，用来进一步核对而非已做决定。'],
    ['The students had recorded the results before they discussed possible explanations. Which happened first?',['They discussed explanations.','Both events are said to happen together.','They recorded the results.'],'C','grammar','had recorded 与 before 共同明确先记录结果，再讨论解释；题目检查时间关系，不是孤立背时态。'],
  ];
  for(let i=0;i<replacements.length;i++){const item=diagnosticItems.find(q=>q.id===`d-f-${i+1}`);if(!item)continue;const [prompt,labels,answer,dimension,explanation]=replacements[i];Object.assign(item,{prompt,options:options(labels),answers:[answer],dimension,explanation});}
}
