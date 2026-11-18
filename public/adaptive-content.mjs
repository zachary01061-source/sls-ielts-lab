// Stage labels describe teaching tasks, not IELTS bands or validated difficulty.
// Every assessment family is independent of the short practice checks.
export const adaptiveContentVersion = '2026-11-03.2';
export const adaptiveContentNote = '本次测评用来安排第一周的学习任务，不换算雅思分数。阅读和听力交卷后核对答案；写作和口语提交后查看批改进度与具体修改意见，老师可以复核。';

const stages = {
  foundation: '读懂短句和明确写出的信息',
  supported: '在短文中查找信息，理解改写和原因',
  bridge: '连接段落信息，区分结论与证据',
  independent: '阅读完整原文，独立处理原题',
};
function choice(id, skill, stage, dimension, prompt, options, answer, explanation, extra = {}) {
  return { id, skill, stage, dimension, prompt, options: options.map((label, i) => ({ value: String.fromCharCode(65 + i), label })), answers: [answer], explanation, ...extra };
}
function readingBlock(id, stage, title, passage, rows) {
  const materialFamilyId = `assessment:${id}`;
  return {
    id, skill: 'reading', stage, materialFamilyId, title,
    instructions: '先阅读文章，再回答六个问题。所有答案都以文章为依据。',
    stageBasis: stages[stage], sourceKind: 'school-authored',
    items: rows.map(([dimension, prompt, options, answer, explanation], i) => choice(`${id}-q${i + 1}`, 'reading', stage, dimension, prompt, options, answer, explanation, { passage, materialFamilyId })),
  };
}

const foundationBlock = {
  id: 'ae-b1-context-meaning', skill: 'foundation', stage: 'foundation', materialFamilyId: 'assessment:b1-context-meaning-2',
  title: '语境、句意与逻辑', instructions: '阅读语境，选择能准确保留原意的一项。注意范围、条件和句间关系。', stageBasis: '在B1左右语境中检查词义、句意和逻辑，不单独考词尾规则。', sourceKind: 'school-authored',
  items: [
    ['vocabulary', 'The school will extend the trial for two weeks before deciding whether to keep the new timetable. Here, “extend” means:', ['continue it for longer', 'make it compulsory', 'replace it immediately'], 'A', 'for two weeks 与 before deciding 表明试行继续两周；句子没有说强制实行或立即更换。'],
    ['grammar', 'The science club may use the lab provided that a teacher is present. Which sentence preserves the condition?', ['The club may use it whenever students wish.', 'A teacher must be there when the club uses it.', 'A teacher should book it after the club leaves.'], 'B', 'provided that 引出使用实验室的必要条件：使用时必须有教师在场。'],
    ['vocabulary', 'Researchers need reliable evidence before recommending a change. Which use of “reliable” matches this sentence?', ['The evidence is easy to collect.', 'The evidence is surprising to readers.', 'The evidence can be trusted when making a decision.'], 'C', 'reliable 在这里描述证据的可信程度，不等于收集容易或令人惊讶。'],
    ['sentence_meaning', 'Although the new route is shorter, students often arrive later because buses run less frequently. Why can the shorter route take more time?', ['Students may wait longer for a bus.', 'The route has become longer.', 'Students are required to walk the whole way.'], 'A', '原因是 buses run less frequently，即班次较少，等待时间可能增加；距离较短不保证总时间更短。'],
    ['sentence_meaning', 'The survey suggests that some students find online revision useful, but it does not show that online lessons can replace classroom teaching. Which conclusion is supported?', ['Every student learns better online.', 'Online revision helps certain students; replacing classroom lessons is not established.', 'Classroom teaching is no longer useful.'], 'B', '保留 some 的范围，并区分“复习有帮助”和“可以替代课堂”这两个不同结论。'],
    ['sentence_meaning', 'The team checked the results with a second experiment. This made their conclusion more convincing. What does “This” refer to?', ['Changing the conclusion before the experiment.', 'Repeating only the final sentence of the report.', 'Using another experiment to check the results.'], 'C', 'This 指向前句整个核查行为，而不是只指 results 或 conclusion。'],
  ].map(([dimension, prompt, options, answer, explanation], i) => choice(`ae-b1-context-q${i + 1}`, 'foundation', 'foundation', dimension, prompt, options, answer, explanation, { materialFamilyId: 'assessment:b1-context-meaning-2' })),
};

const authoredReadingBlocks = [
  readingBlock('ae-r-f-library', 'foundation', 'The lunch-time library',
`Our school library opens at twelve on school days. Students can read there during lunch. On Tuesdays, Mei helps the librarian put books on the shelves. She enjoys the work because she discovers books she has not seen before. Students may borrow two books for one week. They must show their student cards. Food is not allowed, but they can bring water in a bottle. The library closes at one so that students have time to return to class.`, [
    ['detail', 'When does the library open?', ['At eleven.', 'At twelve.', 'At one.'], 'B', '第一句写着 opens at twelve。'],
    ['detail', 'On which day does Mei help?', ['Monday.', 'Tuesday.', 'Friday.'], 'B', '文章写着 On Tuesdays, Mei helps。'],
    ['logic', 'Why does Mei enjoy helping?', ['She finds new books.', 'She gets free lunch.', 'She leaves class early.'], 'A', 'because 后说明她能发现以前没见过的书。'],
    ['detail', 'How many books may a student borrow?', ['One.', 'Two.', 'Three.'], 'B', 'Students may borrow two books。'],
    ['paraphrase', 'What does a student need to borrow a book?', ['A bottle.', 'A notebook.', 'A student card.'], 'C', 'show their student cards 对应借书所需的学生证。'],
    ['detail', 'Which item is allowed in the library?', ['A sandwich.', 'A bowl of soup.', 'A bottle of water.'], 'C', 'Food is not allowed，但可以带瓶装水。'],
  ]),
  readingBlock('ae-r-f-bus', 'foundation', 'A visit to the museum',
`Class Two will visit the town museum on Friday. The bus leaves school at nine in the morning. Students should meet outside the main gate fifteen minutes earlier. They will first look at old photographs of the town. After that, they will draw one object in the history room. Everyone needs a pencil and a notebook. Lunch will be in the park beside the museum if the weather is dry. The class will return to school at three. Parents do not need to buy tickets because the school has paid.`, [
    ['detail', 'Where is Class Two going?', ['To a museum.', 'To a cinema.', 'To a farm.'], 'A', '第一句说明参观 town museum。'],
    ['detail', 'When should the students meet?', ['At 8:45.', 'At 9:00.', 'At 9:15.'], 'A', '九点发车，提前十五分钟集合，所以是 8:45。'],
    ['logic', 'What will they do first at the museum?', ['Eat lunch.', 'Draw an object.', 'Look at photographs.'], 'C', 'first 后说明先看老照片。'],
    ['detail', 'What should everyone bring?', ['Paint and paper.', 'A pencil and notebook.', 'A camera and ticket.'], 'B', 'Everyone needs a pencil and a notebook。'],
    ['sentence_meaning', 'When will the class eat lunch in the park?', ['If it is dry.', 'If it is raining.', 'If the bus is late.'], 'A', 'if the weather is dry 是在公园午餐的条件。'],
    ['logic', 'Why do parents not need to buy tickets?', ['The museum has no tickets.', 'The school has paid.', 'Students will stay outside.'], 'B', 'because the school has paid 明确给出原因。'],
  ]),
  readingBlock('ae-r-s-repair', 'supported', 'The repair table',
`A group of students started a repair table in the school hall last term. Their aim was to help classmates keep useful objects for longer. They accepted bags, pencil cases and simple wooden toys, but not electrical equipment: none of the students had training to repair it safely.

At first, people left broken objects on the table and returned when the repairs were finished. The group changed this arrangement after two weeks. Owners now stay for twenty minutes and help with the work. This means fewer objects can be repaired each afternoon, but more students learn a skill they can use again.

The organisers record both the number of repairs and the number of owners who take part. They have not measured how much money families save. Next term they plan to teach a short lesson on sewing before opening the table, because replacing a button has been the most frequent request.`, [
    ['main_idea', 'What is the main purpose of the repair table?', ['To sell new objects.', 'To help objects stay useful.', 'To prepare a school exhibition.'], 'B', '第一段说 keep useful objects for longer，说明延长物品使用时间。'],
    ['logic', 'Why are electrical items refused?', ['They take too much space.', 'Nobody brings them.', 'The students lack the necessary safety training.'], 'C', 'not electrical equipment 后的解释是没有安全维修训练。'],
    ['detail', 'What changed after the first two weeks?', ['Owners started helping with repairs.', 'Students stopped accepting bags.', 'The table moved outside.'], 'A', 'Owners now stay ... and help with the work 描述改变。'],
    ['detail', 'What is one result of the new arrangement?', ['More objects are repaired each afternoon.', 'Fewer owners learn a skill.', 'Fewer objects are repaired each afternoon.'], 'C', '第三句写着 fewer objects ... but more students learn。'],
    ['detail', 'Which information has NOT been measured?', ['The number of repairs.', 'The money families save.', 'The number of owners taking part.'], 'B', 'They have not measured how much money families save。'],
    ['logic', 'Why is a sewing lesson planned?', ['Buttons are often brought for repair.', 'The school has bought new machines.', 'Wooden toys are too difficult.'], 'A', 'because 后说明换纽扣是最常见的请求。'],
  ]),
  readingBlock('ae-r-s-breakfast', 'supported', 'Testing a breakfast service',
`The student council wanted to know whether opening a breakfast counter earlier would help students. For one week, the counter opened at 7:15 instead of 7:40. The food and prices stayed the same. Council members counted customers and asked them to complete a short form.

More students bought breakfast during the trial. However, the council noticed that a sports team was training before school that week. These students might have increased the total even without the earlier opening. It was also a rainy week, and some students said they preferred waiting inside to standing at the school gate.

The forms showed that students travelling on the earliest bus found the new time useful. Students arriving at 7:50 usually reported no change. The council therefore suggested a second trial during an ordinary week. It also asked the kitchen to record the amount of unsold food. A service can attract customers and still waste food if too much is prepared.`, [
    ['detail', 'What changed during the trial?', ['The opening time.', 'The prices.', 'The menu.'], 'A', '7:15 instead of 7:40；food and prices stayed the same。'],
    ['detail', 'How did the council collect information?', ['It checked exam results.', 'It counted customers and used forms.', 'It interviewed parents only.'], 'B', '第一段末句给出两种收集方法。'],
    ['logic', 'Why does the sports team matter?', ['It chose the food.', 'Its presence may explain some extra customers.', 'It asked for higher prices.'], 'B', '训练的队员可能增加客流，所以不能只把增长归于提早营业。'],
    ['detail', 'Which group reported a benefit from the earlier opening?', ['Students arriving at 7:50.', 'Students who never use the counter.', 'Students on the earliest bus.'], 'C', '第三段写着 earliest bus 的学生觉得新时间有用。'],
    ['inference', 'Why does the council want another trial?', ['The first week had unusual conditions.', 'No forms were returned.', 'The food was too expensive.'], 'A', '训练和下雨可能影响结果，故安排 ordinary week 再试。'],
    ['inference', 'Why record unsold food?', ['Customer numbers alone do not show waste.', 'Unsold food is always unsafe.', 'Students requested a smaller room.'], 'A', '末句说明客流增加与浪费食物可以同时发生。'],
  ]),
  readingBlock('ae-r-b-garden', 'bridge', 'What changed in the garden?',
`A. A biology class investigated whether a layer of dry leaves would help soil retain water. They filled twelve identical pots with the same soil and put a bean seedling in each. Six pots received a layer of leaves; six did not. All pots were placed in the same courtyard and given equal amounts of water. The class weighed them every afternoon to estimate water loss.

B. After a week, the covered pots had generally lost less weight. Several students concluded that leaves should be added to every plant in the school garden. Their teacher asked them to examine what the investigation had actually tested. The experiment involved one kind of soil, one species of plant and a single week of mild weather. It did not show whether the same treatment would work in heavy rain or on a different soil.

C. There was another complication. The class had placed the covered pots together at the shaded end of the courtyard. The uncovered pots received more afternoon sunshine. The leaves might have slowed water loss, but shade could also explain part of the difference. Because two conditions changed together, the class could not separate their effects from these results alone.

D. For a second investigation, the students alternated covered and uncovered pots along the courtyard and swapped their positions each day. They also weighed two empty pots to check that the scale was stable. They kept the original records rather than deleting them. Those records showed why the first conclusion needed caution and helped the class explain the purpose of the revised method.`, [
    ['detail', 'What was the main question in the first investigation?', ['Whether leaves could reduce water loss.', 'Which bean species grows tallest.', 'Whether pots should be made of clay.'], 'A', 'A 段首句是研究问题；retaining water 对应 reducing water loss。'],
    ['detail', 'What was kept equal in the first investigation?', ['Afternoon shade.', 'The amount of water supplied.', 'The presence of leaves.'], 'B', 'A 段说 given equal amounts of water；C 段说明光照并不相同。'],
    ['inference', 'Why was the proposal for every garden plant too broad?', ['Only a limited set of conditions had been tested.', 'No pots had lost weight.', 'The plants had all died.'], 'A', 'B 段限定一种土、一种植物和一周温和天气。'],
    ['logic', 'What prevented the class from separating the effects of leaves and shade?', ['The scale showed no readings.', 'The two conditions changed together.', 'The pots were different sizes.'], 'B', 'C 段末句直接说明两个条件同时改变。'],
    ['detail', 'What was the purpose of swapping pot positions?', ['To give every pot a different soil.', 'To make the leaves fall off.', 'To reduce the effect of position on the comparison.'], 'C', 'C 段指出位置和日照是混杂因素；D 段交替并换位用于减小这一影响。'],
    ['main_idea', 'Why did the students keep their first records?', ['To hide the weaker result.', 'To explain the limits and the revised method.', 'To prove that no second investigation was needed.'], 'B', 'D 段最后一句说明保留记录可以解释谨慎结论与修改方法的原因。'],
  ]),
  readingBlock('ae-r-b-archive', 'bridge', 'Whose town is in the archive?',
`A. A school history group began an online collection of photographs of its town. The first contributions came from a local camera club. The pictures were clear and carefully dated, and many showed public ceremonies. After uploading fifty images, the students noticed that ordinary working days were almost absent. A large collection, they realised, could still tell a narrow story.

B. To broaden the collection, the group invited residents to bring family photographs to an afternoon event. Volunteers scanned the pictures and returned the originals immediately. The invitation also welcomed photographs that were damaged or had no known date. Excluding such pictures would have made the catalogue easier to organise, but it would have removed evidence from families who had few records to offer.

C. Each image was accompanied by a short account from its owner. Two people sometimes remembered the same scene differently. The students recorded both accounts and labelled uncertain details as uncertain. They did not assume that the older speaker was necessarily more accurate. Memory could provide valuable context, but it was not the same as a record made at the time.

D. Before publishing a picture, the group obtained permission from its owner and checked whether any person shown had asked for it to remain private. Some images were therefore described in the catalogue without being displayed. This reduced the number of pictures available online, yet allowed the group to acknowledge gaps in its collection. The final introduction explained how images had been gathered, so visitors could judge what the archive represented and what it might leave out.`, [
    ['main_idea', 'What problem did the students notice in the first collection?', ['Its images were too old.', 'Its images represented a limited range of experiences.', 'None of its images had dates.'], 'B', 'A 段对比 public ceremonies 与 ordinary working days，说明代表范围窄。'],
    ['logic', 'Why were damaged or undated photographs accepted?', ['To avoid excluding families with few records.', 'To replace all camera-club photographs.', 'To make cataloguing quicker.'], 'A', 'B 段说明拒收虽便于整理，却会删去记录较少的家庭的证据。'],
    ['detail', 'How did the group deal with conflicting memories?', ['It always trusted the older person.', 'It removed both accounts.', 'It recorded both and marked uncertainty.'], 'C', 'C 段明确描述保留两份说法并标注不确定。'],
    ['inference', 'What distinction is made in paragraph C?', ['Context from memory and records made at the time.', 'Good photographs and expensive cameras.', 'Private events and public buildings.'], 'A', '末句区分回忆提供的背景与当时形成的记录。'],
    ['logic', 'Why were some pictures described but not displayed?', ['Their owners could not find a scanner.', 'Privacy requests limited publication.', 'The catalogue had no space for images.'], 'B', 'D 段说明检查隐私请求，故部分图片只作目录说明。'],
    ['main_idea', 'What did the final introduction help visitors do?', ['Order new family portraits.', 'Memorise every date.', 'Assess the collection’s coverage and limitations.'], 'C', '最后一句让访客判断档案代表了什么、遗漏了什么。'],
  ]),
];

// Original-bank blocks are embedded below, so this module also runs in a browser.
const originalReadingBlocks = [
  {
    "id": "ae-r-i-pencil",
    "skill": "reading",
    "stage": "independent",
    "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
    "title": "The history of pencil",
    "instructions": "阅读完整文章，完成本组选择的六道原题。填空题按各题字数要求作答；判断题选择 TRUE（符合）、FALSE（不符合）或 NOT GIVEN（文中未说明）。",
    "stageBasis": "完整原文中查找、比较和判断证据。阶段为课程安排，尚未作难度标定。",
    "sourceKind": "original-bank",
    "sourcePassageId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
    "items": [
      {
        "id": "ae-r-i-pencil-q1",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "Graphite was found under a 1_____ in Borrowdale,",
        "answers": [
          "tree"
        ],
        "explanation": "原文依据：Graphite,the main material for producing pencil,was discovered in 1564 in Borrowdale in England when a lightning struck a local tree during a thunder.Local people found out that the black substance spotted at the root of the unlucky tree was different from burning ash of wood",
        "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourcePassageId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourceQuestionId": "8cf161b8-da34-433f-b49e-7ba162e2b134",
        "sourceQuestionNumber": "1",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Question 1-7**\nComplete the sentences below.\nChoose **ONE WORD ONLY** from the passage for each answer.\nWrite your answers in boxes **1-7** on your answer sheet.",
        "instructions": "Question 1-7\nComplete the sentences below.\nChoose ONE WORD ONLY from the passage for each answer.\nWrite your answers in boxes 1-7 on your answer sheet.",
        "type": "text",
        "maxWords": 1,
        "passage": "A. The beginning of the story of pencils started with a lightning.Graphite,the main material for producing pencil,was discovered in 1564 in Borrowdale in England when a lightning struck a local tree during a thunder.Local people found out that the black substance spotted at the root of the unlucky tree was different from burning ash of wood.It was soft, thus left marks everywhere.Chemistry was barely out of its infancy at the time,so people mistook it for lead,equally black but much heavier.It was soon put to use by locals in marking their sheep for ownership and calculation.\n\nB. Britain turns out to be major country where mines of graphite can be detected and developed.Even so,the first pencil was invented elsewhere.As graphite is soft,it requires some form of encasement.In Italy,graphite sticks were initially wrapped in string or sheepskin for stability, becoming perhaps the very first pencil in the world. Then around 1560,an Italian couple made what are likely the first blueprints for the modern, wood- encased carpentry pencil.Their version was a flat, oval, more compact type of pencil. Their concept involved the hollowing out of a stick of juniper wood.Shortly thereafter in 1662,a superior technique was discovered by German people: two wooden halves were carved,a graphite stick inserted, and the halves then glued together-essentially the same method in use to this day.The news of the usefulness of these early pencils spread far and wide,attracting the attention of artists all over the known world.\n\nC. Although graphite core in pencils is still referred to as lead,modern pencils do not contain lead as the “lead” of the pencil is actually a mix of finely ground graphite and clay powders.This mixture is important because the amount of clay content added to the graphite depends on the intended pencil hardness,and the amount of time spent on grinding the mixture determines the quality of the lead.The more clay you put in,the higher hardness the core has.Many pencils across the world, and almost all in Europe, are graded on the European system.This system of naming used B for black and H for hard;a pencil’s grade was described by a sequence or successive Hs or Bs such as BB and BBB for successively softer leads,and HH and HHH for successively harder ones. Then the standard writing pencil is graded HB.\n\nD. In England, pencils continue to be made from whole sawn graphite. But with the mass production of pencils,they are getting drastically more popular in many countries with each passing decade.As demands rise,appetite for graphite soars.According to the United States Geological Survey (USGS),world production of natural graphite in 2012 was 1,100,000 tonnes,of which the following major exporters are: China,India,Brazil, North Korea and Canada. However, much in contrast with its intellectual application in producing pencils,graphite was also widely used in the military.During the reign of Elizabeth I,Borrowdale graphite was used as a refractory material to line moulds for cannonballs,resulting in rounder, smoother balls that could be fired farther, contributing to the strength of the English navy.This particular deposit of graphite was extremely pure and soft,and could easily be broken into sticks.Because of its military importance,this unique mine and its production were strictly controlled by the Crown.\n\nE. That the United States did not use pencils in the outer space till they spent $1000 to make a pencil to use in zero gravity conditions is in fact a fiction.It is widely known that astronauts in Russia used grease pencils,which don’t have breakage problem. But it is also a fact that their counterparts in the United States used pencils in the outer space before real zero gravity pencil was invented.They preferred mechanical pencils, which produced fine line,much clearer than the smudgy lines left by the grease pencils that Russians favored.But the lead tips of these mechanical pencils broke often.That bit of graphite floating around the space capsule could get into someone’s eye,or even find its way into machinery or electronics,causing an electrical short or other problems. But despite the fact that the Americans did invent zero gravity pencils later,they stuck to mechanical pencils for many years.\n\nF. Against the backcloth of a digitalized world, the prospect of pencils seems bleak. In reality,it does not.The application of pencils has by now become so widespread that they can be seen everywhere, such as classrooms, meeting rooms and art rooms,etc.A spectrum of users are likely to continue to use it into the future: students to do math works,artists to draw on sketch pads, waiters or waitresses to mark on order boards, make-up professionals to apply to faces,and architects to produce blue prints.The possibilities seem limitless."
      },
      {
        "id": "ae-r-i-pencil-q5",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "The first pencil was graphite wrapped in 5_____ or animal skin.",
        "answers": [
          "string"
        ],
        "explanation": "原文依据：In Italy, graphite sticks were initially wrapped in string or sheepskin for stability, becoming perhaps the very first pencil in the world",
        "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourcePassageId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourceQuestionId": "2f27563d-bfcd-4e87-b6bd-de373f0acb87",
        "sourceQuestionNumber": "5",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Question 1-7**\nComplete the sentences below.\nChoose **ONE WORD ONLY** from the passage for each answer.\nWrite your answers in boxes **1-7** on your answer sheet.",
        "instructions": "Question 1-7\nComplete the sentences below.\nChoose ONE WORD ONLY from the passage for each answer.\nWrite your answers in boxes 1-7 on your answer sheet.",
        "type": "text",
        "maxWords": 1,
        "passage": "A. The beginning of the story of pencils started with a lightning.Graphite,the main material for producing pencil,was discovered in 1564 in Borrowdale in England when a lightning struck a local tree during a thunder.Local people found out that the black substance spotted at the root of the unlucky tree was different from burning ash of wood.It was soft, thus left marks everywhere.Chemistry was barely out of its infancy at the time,so people mistook it for lead,equally black but much heavier.It was soon put to use by locals in marking their sheep for ownership and calculation.\n\nB. Britain turns out to be major country where mines of graphite can be detected and developed.Even so,the first pencil was invented elsewhere.As graphite is soft,it requires some form of encasement.In Italy,graphite sticks were initially wrapped in string or sheepskin for stability, becoming perhaps the very first pencil in the world. Then around 1560,an Italian couple made what are likely the first blueprints for the modern, wood- encased carpentry pencil.Their version was a flat, oval, more compact type of pencil. Their concept involved the hollowing out of a stick of juniper wood.Shortly thereafter in 1662,a superior technique was discovered by German people: two wooden halves were carved,a graphite stick inserted, and the halves then glued together-essentially the same method in use to this day.The news of the usefulness of these early pencils spread far and wide,attracting the attention of artists all over the known world.\n\nC. Although graphite core in pencils is still referred to as lead,modern pencils do not contain lead as the “lead” of the pencil is actually a mix of finely ground graphite and clay powders.This mixture is important because the amount of clay content added to the graphite depends on the intended pencil hardness,and the amount of time spent on grinding the mixture determines the quality of the lead.The more clay you put in,the higher hardness the core has.Many pencils across the world, and almost all in Europe, are graded on the European system.This system of naming used B for black and H for hard;a pencil’s grade was described by a sequence or successive Hs or Bs such as BB and BBB for successively softer leads,and HH and HHH for successively harder ones. Then the standard writing pencil is graded HB.\n\nD. In England, pencils continue to be made from whole sawn graphite. But with the mass production of pencils,they are getting drastically more popular in many countries with each passing decade.As demands rise,appetite for graphite soars.According to the United States Geological Survey (USGS),world production of natural graphite in 2012 was 1,100,000 tonnes,of which the following major exporters are: China,India,Brazil, North Korea and Canada. However, much in contrast with its intellectual application in producing pencils,graphite was also widely used in the military.During the reign of Elizabeth I,Borrowdale graphite was used as a refractory material to line moulds for cannonballs,resulting in rounder, smoother balls that could be fired farther, contributing to the strength of the English navy.This particular deposit of graphite was extremely pure and soft,and could easily be broken into sticks.Because of its military importance,this unique mine and its production were strictly controlled by the Crown.\n\nE. That the United States did not use pencils in the outer space till they spent $1000 to make a pencil to use in zero gravity conditions is in fact a fiction.It is widely known that astronauts in Russia used grease pencils,which don’t have breakage problem. But it is also a fact that their counterparts in the United States used pencils in the outer space before real zero gravity pencil was invented.They preferred mechanical pencils, which produced fine line,much clearer than the smudgy lines left by the grease pencils that Russians favored.But the lead tips of these mechanical pencils broke often.That bit of graphite floating around the space capsule could get into someone’s eye,or even find its way into machinery or electronics,causing an electrical short or other problems. But despite the fact that the Americans did invent zero gravity pencils later,they stuck to mechanical pencils for many years.\n\nF. Against the backcloth of a digitalized world, the prospect of pencils seems bleak. In reality,it does not.The application of pencils has by now become so widespread that they can be seen everywhere, such as classrooms, meeting rooms and art rooms,etc.A spectrum of users are likely to continue to use it into the future: students to do math works,artists to draw on sketch pads, waiters or waitresses to mark on order boards, make-up professionals to apply to faces,and architects to produce blue prints.The possibilities seem limitless."
      },
      {
        "id": "ae-r-i-pencil-q7",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "Russian astronauts preferred 7_____ pencils to write in the outer space.",
        "answers": [
          "grease"
        ],
        "explanation": "原文依据：It is widely known that astronauts in Russia used grease pencils,which don’t have breakage problem",
        "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourcePassageId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourceQuestionId": "6e2649d4-2b1a-44c6-bf88-2b7ae045311c",
        "sourceQuestionNumber": "7",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Question 1-7**\nComplete the sentences below.\nChoose **ONE WORD ONLY** from the passage for each answer.\nWrite your answers in boxes **1-7** on your answer sheet.",
        "instructions": "Question 1-7\nComplete the sentences below.\nChoose ONE WORD ONLY from the passage for each answer.\nWrite your answers in boxes 1-7 on your answer sheet.",
        "type": "text",
        "maxWords": 1,
        "passage": "A. The beginning of the story of pencils started with a lightning.Graphite,the main material for producing pencil,was discovered in 1564 in Borrowdale in England when a lightning struck a local tree during a thunder.Local people found out that the black substance spotted at the root of the unlucky tree was different from burning ash of wood.It was soft, thus left marks everywhere.Chemistry was barely out of its infancy at the time,so people mistook it for lead,equally black but much heavier.It was soon put to use by locals in marking their sheep for ownership and calculation.\n\nB. Britain turns out to be major country where mines of graphite can be detected and developed.Even so,the first pencil was invented elsewhere.As graphite is soft,it requires some form of encasement.In Italy,graphite sticks were initially wrapped in string or sheepskin for stability, becoming perhaps the very first pencil in the world. Then around 1560,an Italian couple made what are likely the first blueprints for the modern, wood- encased carpentry pencil.Their version was a flat, oval, more compact type of pencil. Their concept involved the hollowing out of a stick of juniper wood.Shortly thereafter in 1662,a superior technique was discovered by German people: two wooden halves were carved,a graphite stick inserted, and the halves then glued together-essentially the same method in use to this day.The news of the usefulness of these early pencils spread far and wide,attracting the attention of artists all over the known world.\n\nC. Although graphite core in pencils is still referred to as lead,modern pencils do not contain lead as the “lead” of the pencil is actually a mix of finely ground graphite and clay powders.This mixture is important because the amount of clay content added to the graphite depends on the intended pencil hardness,and the amount of time spent on grinding the mixture determines the quality of the lead.The more clay you put in,the higher hardness the core has.Many pencils across the world, and almost all in Europe, are graded on the European system.This system of naming used B for black and H for hard;a pencil’s grade was described by a sequence or successive Hs or Bs such as BB and BBB for successively softer leads,and HH and HHH for successively harder ones. Then the standard writing pencil is graded HB.\n\nD. In England, pencils continue to be made from whole sawn graphite. But with the mass production of pencils,they are getting drastically more popular in many countries with each passing decade.As demands rise,appetite for graphite soars.According to the United States Geological Survey (USGS),world production of natural graphite in 2012 was 1,100,000 tonnes,of which the following major exporters are: China,India,Brazil, North Korea and Canada. However, much in contrast with its intellectual application in producing pencils,graphite was also widely used in the military.During the reign of Elizabeth I,Borrowdale graphite was used as a refractory material to line moulds for cannonballs,resulting in rounder, smoother balls that could be fired farther, contributing to the strength of the English navy.This particular deposit of graphite was extremely pure and soft,and could easily be broken into sticks.Because of its military importance,this unique mine and its production were strictly controlled by the Crown.\n\nE. That the United States did not use pencils in the outer space till they spent $1000 to make a pencil to use in zero gravity conditions is in fact a fiction.It is widely known that astronauts in Russia used grease pencils,which don’t have breakage problem. But it is also a fact that their counterparts in the United States used pencils in the outer space before real zero gravity pencil was invented.They preferred mechanical pencils, which produced fine line,much clearer than the smudgy lines left by the grease pencils that Russians favored.But the lead tips of these mechanical pencils broke often.That bit of graphite floating around the space capsule could get into someone’s eye,or even find its way into machinery or electronics,causing an electrical short or other problems. But despite the fact that the Americans did invent zero gravity pencils later,they stuck to mechanical pencils for many years.\n\nF. Against the backcloth of a digitalized world, the prospect of pencils seems bleak. In reality,it does not.The application of pencils has by now become so widespread that they can be seen everywhere, such as classrooms, meeting rooms and art rooms,etc.A spectrum of users are likely to continue to use it into the future: students to do math works,artists to draw on sketch pads, waiters or waitresses to mark on order boards, make-up professionals to apply to faces,and architects to produce blue prints.The possibilities seem limitless."
      },
      {
        "id": "ae-r-i-pencil-q8",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "8 Italy is probably the first country of the whole world to make pencils.",
        "answers": [
          "TRUE"
        ],
        "explanation": "原文依据：In Italy,graphite sticks were initially wrapped in string or sheepskin for stability, becoming perhaps the very first pencil in the world. Then around 1560,an Italian couple made what are likely the first blueprints for the modern, wood- encased carpentry pencil",
        "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourcePassageId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourceQuestionId": "2e18b96e-a2af-42da-951b-e562e6df9fc5",
        "sourceQuestionNumber": "8",
        "sourceGroupId": "g2",
        "sourceInstruction": "**Question 8-13**\nDo the following statements agree with the information given in Reading Passage?\nIn boxes **8-13** on your answer sheet, write",
        "instructions": "Question 8-13\nDo the following statements agree with the information given in Reading Passage?\nIn boxes 8-13 on your answer sheet, write",
        "type": "tfng",
        "options": [
          {
            "value": "TRUE",
            "label": "TRUE"
          },
          {
            "value": "FALSE",
            "label": "FALSE"
          },
          {
            "value": "NOT GIVEN",
            "label": "NOT GIVEN"
          }
        ],
        "passage": "A. The beginning of the story of pencils started with a lightning.Graphite,the main material for producing pencil,was discovered in 1564 in Borrowdale in England when a lightning struck a local tree during a thunder.Local people found out that the black substance spotted at the root of the unlucky tree was different from burning ash of wood.It was soft, thus left marks everywhere.Chemistry was barely out of its infancy at the time,so people mistook it for lead,equally black but much heavier.It was soon put to use by locals in marking their sheep for ownership and calculation.\n\nB. Britain turns out to be major country where mines of graphite can be detected and developed.Even so,the first pencil was invented elsewhere.As graphite is soft,it requires some form of encasement.In Italy,graphite sticks were initially wrapped in string or sheepskin for stability, becoming perhaps the very first pencil in the world. Then around 1560,an Italian couple made what are likely the first blueprints for the modern, wood- encased carpentry pencil.Their version was a flat, oval, more compact type of pencil. Their concept involved the hollowing out of a stick of juniper wood.Shortly thereafter in 1662,a superior technique was discovered by German people: two wooden halves were carved,a graphite stick inserted, and the halves then glued together-essentially the same method in use to this day.The news of the usefulness of these early pencils spread far and wide,attracting the attention of artists all over the known world.\n\nC. Although graphite core in pencils is still referred to as lead,modern pencils do not contain lead as the “lead” of the pencil is actually a mix of finely ground graphite and clay powders.This mixture is important because the amount of clay content added to the graphite depends on the intended pencil hardness,and the amount of time spent on grinding the mixture determines the quality of the lead.The more clay you put in,the higher hardness the core has.Many pencils across the world, and almost all in Europe, are graded on the European system.This system of naming used B for black and H for hard;a pencil’s grade was described by a sequence or successive Hs or Bs such as BB and BBB for successively softer leads,and HH and HHH for successively harder ones. Then the standard writing pencil is graded HB.\n\nD. In England, pencils continue to be made from whole sawn graphite. But with the mass production of pencils,they are getting drastically more popular in many countries with each passing decade.As demands rise,appetite for graphite soars.According to the United States Geological Survey (USGS),world production of natural graphite in 2012 was 1,100,000 tonnes,of which the following major exporters are: China,India,Brazil, North Korea and Canada. However, much in contrast with its intellectual application in producing pencils,graphite was also widely used in the military.During the reign of Elizabeth I,Borrowdale graphite was used as a refractory material to line moulds for cannonballs,resulting in rounder, smoother balls that could be fired farther, contributing to the strength of the English navy.This particular deposit of graphite was extremely pure and soft,and could easily be broken into sticks.Because of its military importance,this unique mine and its production were strictly controlled by the Crown.\n\nE. That the United States did not use pencils in the outer space till they spent $1000 to make a pencil to use in zero gravity conditions is in fact a fiction.It is widely known that astronauts in Russia used grease pencils,which don’t have breakage problem. But it is also a fact that their counterparts in the United States used pencils in the outer space before real zero gravity pencil was invented.They preferred mechanical pencils, which produced fine line,much clearer than the smudgy lines left by the grease pencils that Russians favored.But the lead tips of these mechanical pencils broke often.That bit of graphite floating around the space capsule could get into someone’s eye,or even find its way into machinery or electronics,causing an electrical short or other problems. But despite the fact that the Americans did invent zero gravity pencils later,they stuck to mechanical pencils for many years.\n\nF. Against the backcloth of a digitalized world, the prospect of pencils seems bleak. In reality,it does not.The application of pencils has by now become so widespread that they can be seen everywhere, such as classrooms, meeting rooms and art rooms,etc.A spectrum of users are likely to continue to use it into the future: students to do math works,artists to draw on sketch pads, waiters or waitresses to mark on order boards, make-up professionals to apply to faces,and architects to produce blue prints.The possibilities seem limitless."
      },
      {
        "id": "ae-r-i-pencil-q9",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "9 Germany used various kinds of wood to make pencils.",
        "answers": [
          "NOT GIVEN"
        ],
        "explanation": "原文依据：Shortly thereafter in 1662,a superior technique was discovered by German people: two wooden halves were carved,a graphite stick inserted, and the halves then glued together-essentially the same method in use to this day",
        "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourcePassageId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourceQuestionId": "48cf1161-fb49-4387-9719-41ac4b78b79a",
        "sourceQuestionNumber": "9",
        "sourceGroupId": "g2",
        "sourceInstruction": "**Question 8-13**\nDo the following statements agree with the information given in Reading Passage?\nIn boxes **8-13** on your answer sheet, write",
        "instructions": "Question 8-13\nDo the following statements agree with the information given in Reading Passage?\nIn boxes 8-13 on your answer sheet, write",
        "type": "tfng",
        "options": [
          {
            "value": "TRUE",
            "label": "TRUE"
          },
          {
            "value": "FALSE",
            "label": "FALSE"
          },
          {
            "value": "NOT GIVEN",
            "label": "NOT GIVEN"
          }
        ],
        "passage": "A. The beginning of the story of pencils started with a lightning.Graphite,the main material for producing pencil,was discovered in 1564 in Borrowdale in England when a lightning struck a local tree during a thunder.Local people found out that the black substance spotted at the root of the unlucky tree was different from burning ash of wood.It was soft, thus left marks everywhere.Chemistry was barely out of its infancy at the time,so people mistook it for lead,equally black but much heavier.It was soon put to use by locals in marking their sheep for ownership and calculation.\n\nB. Britain turns out to be major country where mines of graphite can be detected and developed.Even so,the first pencil was invented elsewhere.As graphite is soft,it requires some form of encasement.In Italy,graphite sticks were initially wrapped in string or sheepskin for stability, becoming perhaps the very first pencil in the world. Then around 1560,an Italian couple made what are likely the first blueprints for the modern, wood- encased carpentry pencil.Their version was a flat, oval, more compact type of pencil. Their concept involved the hollowing out of a stick of juniper wood.Shortly thereafter in 1662,a superior technique was discovered by German people: two wooden halves were carved,a graphite stick inserted, and the halves then glued together-essentially the same method in use to this day.The news of the usefulness of these early pencils spread far and wide,attracting the attention of artists all over the known world.\n\nC. Although graphite core in pencils is still referred to as lead,modern pencils do not contain lead as the “lead” of the pencil is actually a mix of finely ground graphite and clay powders.This mixture is important because the amount of clay content added to the graphite depends on the intended pencil hardness,and the amount of time spent on grinding the mixture determines the quality of the lead.The more clay you put in,the higher hardness the core has.Many pencils across the world, and almost all in Europe, are graded on the European system.This system of naming used B for black and H for hard;a pencil’s grade was described by a sequence or successive Hs or Bs such as BB and BBB for successively softer leads,and HH and HHH for successively harder ones. Then the standard writing pencil is graded HB.\n\nD. In England, pencils continue to be made from whole sawn graphite. But with the mass production of pencils,they are getting drastically more popular in many countries with each passing decade.As demands rise,appetite for graphite soars.According to the United States Geological Survey (USGS),world production of natural graphite in 2012 was 1,100,000 tonnes,of which the following major exporters are: China,India,Brazil, North Korea and Canada. However, much in contrast with its intellectual application in producing pencils,graphite was also widely used in the military.During the reign of Elizabeth I,Borrowdale graphite was used as a refractory material to line moulds for cannonballs,resulting in rounder, smoother balls that could be fired farther, contributing to the strength of the English navy.This particular deposit of graphite was extremely pure and soft,and could easily be broken into sticks.Because of its military importance,this unique mine and its production were strictly controlled by the Crown.\n\nE. That the United States did not use pencils in the outer space till they spent $1000 to make a pencil to use in zero gravity conditions is in fact a fiction.It is widely known that astronauts in Russia used grease pencils,which don’t have breakage problem. But it is also a fact that their counterparts in the United States used pencils in the outer space before real zero gravity pencil was invented.They preferred mechanical pencils, which produced fine line,much clearer than the smudgy lines left by the grease pencils that Russians favored.But the lead tips of these mechanical pencils broke often.That bit of graphite floating around the space capsule could get into someone’s eye,or even find its way into machinery or electronics,causing an electrical short or other problems. But despite the fact that the Americans did invent zero gravity pencils later,they stuck to mechanical pencils for many years.\n\nF. Against the backcloth of a digitalized world, the prospect of pencils seems bleak. In reality,it does not.The application of pencils has by now become so widespread that they can be seen everywhere, such as classrooms, meeting rooms and art rooms,etc.A spectrum of users are likely to continue to use it into the future: students to do math works,artists to draw on sketch pads, waiters or waitresses to mark on order boards, make-up professionals to apply to faces,and architects to produce blue prints.The possibilities seem limitless."
      },
      {
        "id": "ae-r-i-pencil-q13",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "13 Pencils are unlikely to be used in the future.",
        "answers": [
          "FALSE"
        ],
        "explanation": "原文依据：Against the backcloth of a digitalized world, the prospect of pencils seems bleak. In reality,it does not. A spectrum of users are likely to continue to use it into the future;The possibilities seem limitless",
        "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourcePassageId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
        "sourceQuestionId": "6739aa3d-8946-4965-abd9-c0b03edeabdb",
        "sourceQuestionNumber": "13",
        "sourceGroupId": "g2",
        "sourceInstruction": "**Question 8-13**\nDo the following statements agree with the information given in Reading Passage?\nIn boxes **8-13** on your answer sheet, write",
        "instructions": "Question 8-13\nDo the following statements agree with the information given in Reading Passage?\nIn boxes 8-13 on your answer sheet, write",
        "type": "tfng",
        "options": [
          {
            "value": "TRUE",
            "label": "TRUE"
          },
          {
            "value": "FALSE",
            "label": "FALSE"
          },
          {
            "value": "NOT GIVEN",
            "label": "NOT GIVEN"
          }
        ],
        "passage": "A. The beginning of the story of pencils started with a lightning.Graphite,the main material for producing pencil,was discovered in 1564 in Borrowdale in England when a lightning struck a local tree during a thunder.Local people found out that the black substance spotted at the root of the unlucky tree was different from burning ash of wood.It was soft, thus left marks everywhere.Chemistry was barely out of its infancy at the time,so people mistook it for lead,equally black but much heavier.It was soon put to use by locals in marking their sheep for ownership and calculation.\n\nB. Britain turns out to be major country where mines of graphite can be detected and developed.Even so,the first pencil was invented elsewhere.As graphite is soft,it requires some form of encasement.In Italy,graphite sticks were initially wrapped in string or sheepskin for stability, becoming perhaps the very first pencil in the world. Then around 1560,an Italian couple made what are likely the first blueprints for the modern, wood- encased carpentry pencil.Their version was a flat, oval, more compact type of pencil. Their concept involved the hollowing out of a stick of juniper wood.Shortly thereafter in 1662,a superior technique was discovered by German people: two wooden halves were carved,a graphite stick inserted, and the halves then glued together-essentially the same method in use to this day.The news of the usefulness of these early pencils spread far and wide,attracting the attention of artists all over the known world.\n\nC. Although graphite core in pencils is still referred to as lead,modern pencils do not contain lead as the “lead” of the pencil is actually a mix of finely ground graphite and clay powders.This mixture is important because the amount of clay content added to the graphite depends on the intended pencil hardness,and the amount of time spent on grinding the mixture determines the quality of the lead.The more clay you put in,the higher hardness the core has.Many pencils across the world, and almost all in Europe, are graded on the European system.This system of naming used B for black and H for hard;a pencil’s grade was described by a sequence or successive Hs or Bs such as BB and BBB for successively softer leads,and HH and HHH for successively harder ones. Then the standard writing pencil is graded HB.\n\nD. In England, pencils continue to be made from whole sawn graphite. But with the mass production of pencils,they are getting drastically more popular in many countries with each passing decade.As demands rise,appetite for graphite soars.According to the United States Geological Survey (USGS),world production of natural graphite in 2012 was 1,100,000 tonnes,of which the following major exporters are: China,India,Brazil, North Korea and Canada. However, much in contrast with its intellectual application in producing pencils,graphite was also widely used in the military.During the reign of Elizabeth I,Borrowdale graphite was used as a refractory material to line moulds for cannonballs,resulting in rounder, smoother balls that could be fired farther, contributing to the strength of the English navy.This particular deposit of graphite was extremely pure and soft,and could easily be broken into sticks.Because of its military importance,this unique mine and its production were strictly controlled by the Crown.\n\nE. That the United States did not use pencils in the outer space till they spent $1000 to make a pencil to use in zero gravity conditions is in fact a fiction.It is widely known that astronauts in Russia used grease pencils,which don’t have breakage problem. But it is also a fact that their counterparts in the United States used pencils in the outer space before real zero gravity pencil was invented.They preferred mechanical pencils, which produced fine line,much clearer than the smudgy lines left by the grease pencils that Russians favored.But the lead tips of these mechanical pencils broke often.That bit of graphite floating around the space capsule could get into someone’s eye,or even find its way into machinery or electronics,causing an electrical short or other problems. But despite the fact that the Americans did invent zero gravity pencils later,they stuck to mechanical pencils for many years.\n\nF. Against the backcloth of a digitalized world, the prospect of pencils seems bleak. In reality,it does not.The application of pencils has by now become so widespread that they can be seen everywhere, such as classrooms, meeting rooms and art rooms,etc.A spectrum of users are likely to continue to use it into the future: students to do math works,artists to draw on sketch pads, waiters or waitresses to mark on order boards, make-up professionals to apply to faces,and architects to produce blue prints.The possibilities seem limitless."
      }
    ]
  },
  {
    "id": "ae-r-i-manuscript",
    "skill": "reading",
    "stage": "independent",
    "materialFamilyId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
    "title": "The voynich manuscript",
    "instructions": "阅读完整文章，完成本组选择的六道原题。填空题按各题字数要求作答；判断题选择 TRUE（符合）、FALSE（不符合）或 NOT GIVEN（文中未说明）。",
    "stageBasis": "完整原文中查找、比较和判断证据。阶段为课程安排，尚未作难度标定。",
    "sourceKind": "original-bank",
    "sourcePassageId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
    "items": [
      {
        "id": "ae-r-i-manuscript-q27",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "27 It is uncertain when the Voynich manuscript was written.",
        "answers": [
          "TRUE"
        ],
        "explanation": "原文依据：Yet the library’s most controversial possession is an unprepossessing vellum manuscript about the size of a hardback book, containing 240-odd pages of drawings and text of unknown age and authorship",
        "materialFamilyId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourcePassageId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourceQuestionId": "e9921a03-8976-4a02-87d6-3eb587957eb7",
        "sourceQuestionNumber": "27",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 27-30**\nDo the following statements agree with the claims of the writer in Reading Passage 3?\nIn boxes **27-30** on your answer sheet, write",
        "instructions": "Questions 27-30\nDo the following statements agree with the claims of the writer in Reading Passage 3?\nIn boxes 27-30 on your answer sheet, write",
        "type": "tfng",
        "options": [
          {
            "value": "TRUE",
            "label": "TRUE"
          },
          {
            "value": "FALSE",
            "label": "FALSE"
          },
          {
            "value": "NOT GIVEN",
            "label": "NOT GIVEN"
          }
        ],
        "passage": "A. The starkly modern Beinecke Library at Yale University is home to some of the most valuable books in the world: first folios of Shakespeare, Gutenberg Bibles and manuscripts from the early Middle Ages. Yet the library’s most controversial possession is an unprepossessing vellum manuscript about the size of a hardback book, containing 240-odd pages of drawings and text of unknown age and authorship. Catalogued as MS408, the manuscript would attract little attention were it not for the fact that the drawings hint at esoteric knowledge, while the text seems to be some sort of code – one that no-one has been able to break. It’s known to scholars as the Voynich manuscript, after the American book dealer Wilfrid Voynich, who bought the manuscript from a Jesuit college in Italy in 1912.\n\nB. Over the years, the manuscript has attracted the attention of everyone from amateur dabblers to top codebreakers, all determined to succeed where countless others have failed. Academic research papers, books and websites are devoted to making sense of the contents of the manuscript, which are freely available to all. ‘Most other mysteries involve secondhand reports,’ says Dr Gordon Rugg of Keele University, a leading Voynich expert. But this is one that you can see for yourself.\n\nC. It is certainly strange: page after page of drawings of weird plants, astrological symbolism and human figures, accompanied by a script that looks like some form of shorthand. What does it say and what are the drawings about? Voynich himself believed that the manuscript was the work of the 13th century English monk Roger Bacon, famed for his knowledge of alchemy, philosophy and science. In 1921 Voynich’s view that Bacon was the writer appeared to win support from the work of William Newbold, Professor of Philosophy at the University of Pennsylvania, who claimed to have found the key to the cipher system used by Bacon. According to Newbold, the manuscript proved that Bacon had access to a microscope centuries before they were supposedly first invented. They claim that this mediaeval monk had observed living cells created a sensation. It soon became clear, however, that Newbold had fallen victim to wishful thinking. Other scholars showed that his ‘decoding’ methods produced a host of possible interpretations.\n\nD. The Voynich manuscript has continued to defy the efforts of world-class experts. In 1944, a team was assembled to tackle the mystery, led by William Friedman, the renowned American codebreaker. They began with the most basic code breaking task: analysing the relative frequencies of the characters making up the text, looking for signs of an underlying structure. Yet Friedman’s team soon found themselves in deep water. The precise size of the ‘alphabet’ of the Voynich manuscript was unclear: it’s possible to make out more than 70 distinct symbols among the 170,000-character text. Furthermore, Friedman discovered that some words and phrases appeared more often than expected in a standard language, casting doubt on claims that the manuscript concealed a real language, as encryption typically reduces word frequencies.\n\nE. Friedman concluded that the most plausible resolution of this paradox was that ‘Voynichese’ is some sort of specially created artificial language, whose words are devised from concepts, rather than linguistics. So, could the Voynich manuscript be the earliest known example of an artificial language? Friedman’s hypothesis commands respect because of the lifetime of crypt analytical expertise he brought to bear,’ says Rob Churchill, co-author of the Voynich Manuscript, that still leaves a host of questions unanswered, however, such as the identity of the author and the meaning of the bizarre drawings. ‘It does little to advance our understanding of the manuscript as a whole,’ says Churchill. Even though Friedman was working more than 60 years ago, he suspected that major insights would come reality that the device that had already transformed code breaking: the computer. In this he was right – it is now the key tool for uncovering clues about the pleasure from manuscript’s language.\n\nF. The insights so far have been perplexing. For example, in 2001 another leading Voynich scholar, Dr Gabriel Landin of Birmingham University in the UK, published the results of his study of the manuscript using a pattern-detecting method called spectral analysis. This revealed evidence that the manuscript contains genuine words, rather than random nonsense, consistent with the existence of some underlying natural language. Yet the following year, Voynich expert Ren Zandbergen of the European Space Agency in Darmstadt, Germany showed that the entropy of the text (a measure of the rate of transfer of information) was consistent with Friedman’s suspicions that an artificial language had been used.\n\nG. Many are convinced that the Voynich manuscript isn’t a hoax. For how could a medieval hoaxer create so many telltale signs of a message from random nonsense? Yet even this has been challenged in new research by Rugg. Using a system, first published by the Italian mathematician Girolamo Cardano in 1150 in which a specially constructed grille issued to pick out symbols from a table, Rugg found he could rapidly generate text with many of the basic traits of the Voynich manuscript. Publishing his results in 2004 Rugg stresses that he hadn’t set out to prove the manuscript a hoax. ‘I simply demonstrated that it’s feasible to hoax something this complex in a few months, he says. Inevitably, others beg to differ. Some scholars, such as Zandbergen, still suspect the text has genuine meaning, though believe it may never be decipherable. Others, such as Churchill, have suggested that the sheer weirdness of the illustrations and text hint at an author who had lost touch with reality.\n\nH. What is clear is that the book-sized manuscript kept under lock and key at Yale University has lost none of its fascination. ‘Many derive great intellectual pleasure from solving puzzles,’ says Rugg. The Voynich manuscript is as challenging a puzzle as anyone could ask for."
      },
      {
        "id": "ae-r-i-manuscript-q28",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "28 Wilfrid Voynich donated the manuscript to the Beinecke Library.",
        "answers": [
          "NOT GIVEN"
        ],
        "explanation": "原文依据：It’s known to scholars as the Voynich manuscript, after the American book dealer Wilfrid Voynich, who bought the manuscript from a Jesuit college in Italy in 1912",
        "materialFamilyId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourcePassageId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourceQuestionId": "9a293118-7a96-4785-95f0-7cf39162f534",
        "sourceQuestionNumber": "28",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 27-30**\nDo the following statements agree with the claims of the writer in Reading Passage 3?\nIn boxes **27-30** on your answer sheet, write",
        "instructions": "Questions 27-30\nDo the following statements agree with the claims of the writer in Reading Passage 3?\nIn boxes 27-30 on your answer sheet, write",
        "type": "tfng",
        "options": [
          {
            "value": "TRUE",
            "label": "TRUE"
          },
          {
            "value": "FALSE",
            "label": "FALSE"
          },
          {
            "value": "NOT GIVEN",
            "label": "NOT GIVEN"
          }
        ],
        "passage": "A. The starkly modern Beinecke Library at Yale University is home to some of the most valuable books in the world: first folios of Shakespeare, Gutenberg Bibles and manuscripts from the early Middle Ages. Yet the library’s most controversial possession is an unprepossessing vellum manuscript about the size of a hardback book, containing 240-odd pages of drawings and text of unknown age and authorship. Catalogued as MS408, the manuscript would attract little attention were it not for the fact that the drawings hint at esoteric knowledge, while the text seems to be some sort of code – one that no-one has been able to break. It’s known to scholars as the Voynich manuscript, after the American book dealer Wilfrid Voynich, who bought the manuscript from a Jesuit college in Italy in 1912.\n\nB. Over the years, the manuscript has attracted the attention of everyone from amateur dabblers to top codebreakers, all determined to succeed where countless others have failed. Academic research papers, books and websites are devoted to making sense of the contents of the manuscript, which are freely available to all. ‘Most other mysteries involve secondhand reports,’ says Dr Gordon Rugg of Keele University, a leading Voynich expert. But this is one that you can see for yourself.\n\nC. It is certainly strange: page after page of drawings of weird plants, astrological symbolism and human figures, accompanied by a script that looks like some form of shorthand. What does it say and what are the drawings about? Voynich himself believed that the manuscript was the work of the 13th century English monk Roger Bacon, famed for his knowledge of alchemy, philosophy and science. In 1921 Voynich’s view that Bacon was the writer appeared to win support from the work of William Newbold, Professor of Philosophy at the University of Pennsylvania, who claimed to have found the key to the cipher system used by Bacon. According to Newbold, the manuscript proved that Bacon had access to a microscope centuries before they were supposedly first invented. They claim that this mediaeval monk had observed living cells created a sensation. It soon became clear, however, that Newbold had fallen victim to wishful thinking. Other scholars showed that his ‘decoding’ methods produced a host of possible interpretations.\n\nD. The Voynich manuscript has continued to defy the efforts of world-class experts. In 1944, a team was assembled to tackle the mystery, led by William Friedman, the renowned American codebreaker. They began with the most basic code breaking task: analysing the relative frequencies of the characters making up the text, looking for signs of an underlying structure. Yet Friedman’s team soon found themselves in deep water. The precise size of the ‘alphabet’ of the Voynich manuscript was unclear: it’s possible to make out more than 70 distinct symbols among the 170,000-character text. Furthermore, Friedman discovered that some words and phrases appeared more often than expected in a standard language, casting doubt on claims that the manuscript concealed a real language, as encryption typically reduces word frequencies.\n\nE. Friedman concluded that the most plausible resolution of this paradox was that ‘Voynichese’ is some sort of specially created artificial language, whose words are devised from concepts, rather than linguistics. So, could the Voynich manuscript be the earliest known example of an artificial language? Friedman’s hypothesis commands respect because of the lifetime of crypt analytical expertise he brought to bear,’ says Rob Churchill, co-author of the Voynich Manuscript, that still leaves a host of questions unanswered, however, such as the identity of the author and the meaning of the bizarre drawings. ‘It does little to advance our understanding of the manuscript as a whole,’ says Churchill. Even though Friedman was working more than 60 years ago, he suspected that major insights would come reality that the device that had already transformed code breaking: the computer. In this he was right – it is now the key tool for uncovering clues about the pleasure from manuscript’s language.\n\nF. The insights so far have been perplexing. For example, in 2001 another leading Voynich scholar, Dr Gabriel Landin of Birmingham University in the UK, published the results of his study of the manuscript using a pattern-detecting method called spectral analysis. This revealed evidence that the manuscript contains genuine words, rather than random nonsense, consistent with the existence of some underlying natural language. Yet the following year, Voynich expert Ren Zandbergen of the European Space Agency in Darmstadt, Germany showed that the entropy of the text (a measure of the rate of transfer of information) was consistent with Friedman’s suspicions that an artificial language had been used.\n\nG. Many are convinced that the Voynich manuscript isn’t a hoax. For how could a medieval hoaxer create so many telltale signs of a message from random nonsense? Yet even this has been challenged in new research by Rugg. Using a system, first published by the Italian mathematician Girolamo Cardano in 1150 in which a specially constructed grille issued to pick out symbols from a table, Rugg found he could rapidly generate text with many of the basic traits of the Voynich manuscript. Publishing his results in 2004 Rugg stresses that he hadn’t set out to prove the manuscript a hoax. ‘I simply demonstrated that it’s feasible to hoax something this complex in a few months, he says. Inevitably, others beg to differ. Some scholars, such as Zandbergen, still suspect the text has genuine meaning, though believe it may never be decipherable. Others, such as Churchill, have suggested that the sheer weirdness of the illustrations and text hint at an author who had lost touch with reality.\n\nH. What is clear is that the book-sized manuscript kept under lock and key at Yale University has lost none of its fascination. ‘Many derive great intellectual pleasure from solving puzzles,’ says Rugg. The Voynich manuscript is as challenging a puzzle as anyone could ask for."
      },
      {
        "id": "ae-r-i-manuscript-q29",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "29 Interest in the Voynich manuscript extends beyond that of academics and professional codebreakers.",
        "answers": [
          "TRUE"
        ],
        "explanation": "原文依据：Over the years, the manuscript has attracted the attention of everyone from amateur dabblers to top codebreakers, all determined to succeed where countless others have failed",
        "materialFamilyId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourcePassageId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourceQuestionId": "7e45907c-7711-453a-8976-e3855c6cd700",
        "sourceQuestionNumber": "29",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 27-30**\nDo the following statements agree with the claims of the writer in Reading Passage 3?\nIn boxes **27-30** on your answer sheet, write",
        "instructions": "Questions 27-30\nDo the following statements agree with the claims of the writer in Reading Passage 3?\nIn boxes 27-30 on your answer sheet, write",
        "type": "tfng",
        "options": [
          {
            "value": "TRUE",
            "label": "TRUE"
          },
          {
            "value": "FALSE",
            "label": "FALSE"
          },
          {
            "value": "NOT GIVEN",
            "label": "NOT GIVEN"
          }
        ],
        "passage": "A. The starkly modern Beinecke Library at Yale University is home to some of the most valuable books in the world: first folios of Shakespeare, Gutenberg Bibles and manuscripts from the early Middle Ages. Yet the library’s most controversial possession is an unprepossessing vellum manuscript about the size of a hardback book, containing 240-odd pages of drawings and text of unknown age and authorship. Catalogued as MS408, the manuscript would attract little attention were it not for the fact that the drawings hint at esoteric knowledge, while the text seems to be some sort of code – one that no-one has been able to break. It’s known to scholars as the Voynich manuscript, after the American book dealer Wilfrid Voynich, who bought the manuscript from a Jesuit college in Italy in 1912.\n\nB. Over the years, the manuscript has attracted the attention of everyone from amateur dabblers to top codebreakers, all determined to succeed where countless others have failed. Academic research papers, books and websites are devoted to making sense of the contents of the manuscript, which are freely available to all. ‘Most other mysteries involve secondhand reports,’ says Dr Gordon Rugg of Keele University, a leading Voynich expert. But this is one that you can see for yourself.\n\nC. It is certainly strange: page after page of drawings of weird plants, astrological symbolism and human figures, accompanied by a script that looks like some form of shorthand. What does it say and what are the drawings about? Voynich himself believed that the manuscript was the work of the 13th century English monk Roger Bacon, famed for his knowledge of alchemy, philosophy and science. In 1921 Voynich’s view that Bacon was the writer appeared to win support from the work of William Newbold, Professor of Philosophy at the University of Pennsylvania, who claimed to have found the key to the cipher system used by Bacon. According to Newbold, the manuscript proved that Bacon had access to a microscope centuries before they were supposedly first invented. They claim that this mediaeval monk had observed living cells created a sensation. It soon became clear, however, that Newbold had fallen victim to wishful thinking. Other scholars showed that his ‘decoding’ methods produced a host of possible interpretations.\n\nD. The Voynich manuscript has continued to defy the efforts of world-class experts. In 1944, a team was assembled to tackle the mystery, led by William Friedman, the renowned American codebreaker. They began with the most basic code breaking task: analysing the relative frequencies of the characters making up the text, looking for signs of an underlying structure. Yet Friedman’s team soon found themselves in deep water. The precise size of the ‘alphabet’ of the Voynich manuscript was unclear: it’s possible to make out more than 70 distinct symbols among the 170,000-character text. Furthermore, Friedman discovered that some words and phrases appeared more often than expected in a standard language, casting doubt on claims that the manuscript concealed a real language, as encryption typically reduces word frequencies.\n\nE. Friedman concluded that the most plausible resolution of this paradox was that ‘Voynichese’ is some sort of specially created artificial language, whose words are devised from concepts, rather than linguistics. So, could the Voynich manuscript be the earliest known example of an artificial language? Friedman’s hypothesis commands respect because of the lifetime of crypt analytical expertise he brought to bear,’ says Rob Churchill, co-author of the Voynich Manuscript, that still leaves a host of questions unanswered, however, such as the identity of the author and the meaning of the bizarre drawings. ‘It does little to advance our understanding of the manuscript as a whole,’ says Churchill. Even though Friedman was working more than 60 years ago, he suspected that major insights would come reality that the device that had already transformed code breaking: the computer. In this he was right – it is now the key tool for uncovering clues about the pleasure from manuscript’s language.\n\nF. The insights so far have been perplexing. For example, in 2001 another leading Voynich scholar, Dr Gabriel Landin of Birmingham University in the UK, published the results of his study of the manuscript using a pattern-detecting method called spectral analysis. This revealed evidence that the manuscript contains genuine words, rather than random nonsense, consistent with the existence of some underlying natural language. Yet the following year, Voynich expert Ren Zandbergen of the European Space Agency in Darmstadt, Germany showed that the entropy of the text (a measure of the rate of transfer of information) was consistent with Friedman’s suspicions that an artificial language had been used.\n\nG. Many are convinced that the Voynich manuscript isn’t a hoax. For how could a medieval hoaxer create so many telltale signs of a message from random nonsense? Yet even this has been challenged in new research by Rugg. Using a system, first published by the Italian mathematician Girolamo Cardano in 1150 in which a specially constructed grille issued to pick out symbols from a table, Rugg found he could rapidly generate text with many of the basic traits of the Voynich manuscript. Publishing his results in 2004 Rugg stresses that he hadn’t set out to prove the manuscript a hoax. ‘I simply demonstrated that it’s feasible to hoax something this complex in a few months, he says. Inevitably, others beg to differ. Some scholars, such as Zandbergen, still suspect the text has genuine meaning, though believe it may never be decipherable. Others, such as Churchill, have suggested that the sheer weirdness of the illustrations and text hint at an author who had lost touch with reality.\n\nH. What is clear is that the book-sized manuscript kept under lock and key at Yale University has lost none of its fascination. ‘Many derive great intellectual pleasure from solving puzzles,’ says Rugg. The Voynich manuscript is as challenging a puzzle as anyone could ask for."
      },
      {
        "id": "ae-r-i-manuscript-q30",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "30 The text of the Voynich manuscript contains just under 70 symbols.",
        "answers": [
          "FALSE"
        ],
        "explanation": "原文依据：The precise size of the ‘alphabet’ of the Voynich manuscript was unclear: it’s possible to make out more than 70 distinct symbols among the 170,000-character text",
        "materialFamilyId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourcePassageId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourceQuestionId": "a557e046-d9c7-46c8-b6c9-e18985c27070",
        "sourceQuestionNumber": "30",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 27-30**\nDo the following statements agree with the claims of the writer in Reading Passage 3?\nIn boxes **27-30** on your answer sheet, write",
        "instructions": "Questions 27-30\nDo the following statements agree with the claims of the writer in Reading Passage 3?\nIn boxes 27-30 on your answer sheet, write",
        "type": "tfng",
        "options": [
          {
            "value": "TRUE",
            "label": "TRUE"
          },
          {
            "value": "FALSE",
            "label": "FALSE"
          },
          {
            "value": "NOT GIVEN",
            "label": "NOT GIVEN"
          }
        ],
        "passage": "A. The starkly modern Beinecke Library at Yale University is home to some of the most valuable books in the world: first folios of Shakespeare, Gutenberg Bibles and manuscripts from the early Middle Ages. Yet the library’s most controversial possession is an unprepossessing vellum manuscript about the size of a hardback book, containing 240-odd pages of drawings and text of unknown age and authorship. Catalogued as MS408, the manuscript would attract little attention were it not for the fact that the drawings hint at esoteric knowledge, while the text seems to be some sort of code – one that no-one has been able to break. It’s known to scholars as the Voynich manuscript, after the American book dealer Wilfrid Voynich, who bought the manuscript from a Jesuit college in Italy in 1912.\n\nB. Over the years, the manuscript has attracted the attention of everyone from amateur dabblers to top codebreakers, all determined to succeed where countless others have failed. Academic research papers, books and websites are devoted to making sense of the contents of the manuscript, which are freely available to all. ‘Most other mysteries involve secondhand reports,’ says Dr Gordon Rugg of Keele University, a leading Voynich expert. But this is one that you can see for yourself.\n\nC. It is certainly strange: page after page of drawings of weird plants, astrological symbolism and human figures, accompanied by a script that looks like some form of shorthand. What does it say and what are the drawings about? Voynich himself believed that the manuscript was the work of the 13th century English monk Roger Bacon, famed for his knowledge of alchemy, philosophy and science. In 1921 Voynich’s view that Bacon was the writer appeared to win support from the work of William Newbold, Professor of Philosophy at the University of Pennsylvania, who claimed to have found the key to the cipher system used by Bacon. According to Newbold, the manuscript proved that Bacon had access to a microscope centuries before they were supposedly first invented. They claim that this mediaeval monk had observed living cells created a sensation. It soon became clear, however, that Newbold had fallen victim to wishful thinking. Other scholars showed that his ‘decoding’ methods produced a host of possible interpretations.\n\nD. The Voynich manuscript has continued to defy the efforts of world-class experts. In 1944, a team was assembled to tackle the mystery, led by William Friedman, the renowned American codebreaker. They began with the most basic code breaking task: analysing the relative frequencies of the characters making up the text, looking for signs of an underlying structure. Yet Friedman’s team soon found themselves in deep water. The precise size of the ‘alphabet’ of the Voynich manuscript was unclear: it’s possible to make out more than 70 distinct symbols among the 170,000-character text. Furthermore, Friedman discovered that some words and phrases appeared more often than expected in a standard language, casting doubt on claims that the manuscript concealed a real language, as encryption typically reduces word frequencies.\n\nE. Friedman concluded that the most plausible resolution of this paradox was that ‘Voynichese’ is some sort of specially created artificial language, whose words are devised from concepts, rather than linguistics. So, could the Voynich manuscript be the earliest known example of an artificial language? Friedman’s hypothesis commands respect because of the lifetime of crypt analytical expertise he brought to bear,’ says Rob Churchill, co-author of the Voynich Manuscript, that still leaves a host of questions unanswered, however, such as the identity of the author and the meaning of the bizarre drawings. ‘It does little to advance our understanding of the manuscript as a whole,’ says Churchill. Even though Friedman was working more than 60 years ago, he suspected that major insights would come reality that the device that had already transformed code breaking: the computer. In this he was right – it is now the key tool for uncovering clues about the pleasure from manuscript’s language.\n\nF. The insights so far have been perplexing. For example, in 2001 another leading Voynich scholar, Dr Gabriel Landin of Birmingham University in the UK, published the results of his study of the manuscript using a pattern-detecting method called spectral analysis. This revealed evidence that the manuscript contains genuine words, rather than random nonsense, consistent with the existence of some underlying natural language. Yet the following year, Voynich expert Ren Zandbergen of the European Space Agency in Darmstadt, Germany showed that the entropy of the text (a measure of the rate of transfer of information) was consistent with Friedman’s suspicions that an artificial language had been used.\n\nG. Many are convinced that the Voynich manuscript isn’t a hoax. For how could a medieval hoaxer create so many telltale signs of a message from random nonsense? Yet even this has been challenged in new research by Rugg. Using a system, first published by the Italian mathematician Girolamo Cardano in 1150 in which a specially constructed grille issued to pick out symbols from a table, Rugg found he could rapidly generate text with many of the basic traits of the Voynich manuscript. Publishing his results in 2004 Rugg stresses that he hadn’t set out to prove the manuscript a hoax. ‘I simply demonstrated that it’s feasible to hoax something this complex in a few months, he says. Inevitably, others beg to differ. Some scholars, such as Zandbergen, still suspect the text has genuine meaning, though believe it may never be decipherable. Others, such as Churchill, have suggested that the sheer weirdness of the illustrations and text hint at an author who had lost touch with reality.\n\nH. What is clear is that the book-sized manuscript kept under lock and key at Yale University has lost none of its fascination. ‘Many derive great intellectual pleasure from solving puzzles,’ says Rugg. The Voynich manuscript is as challenging a puzzle as anyone could ask for."
      },
      {
        "id": "ae-r-i-manuscript-q35",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "Voynich Researchers\n35 William Newbold believed that the author of the Voynich manuscript had been able to look at cells through a _____ , other researchers later demonstrated that there were flaws in his argument.",
        "answers": [
          "microscope"
        ],
        "explanation": "原文依据：According to Newbold, the manuscript proved that Bacon had access to a microscope centuries before they were supposedly first invented;They claim that this mediaeval monk had observed living cells created a sensation. It soon became clear, however, that Newbold had fallen victim to wishful thinking",
        "materialFamilyId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourcePassageId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourceQuestionId": "5226a3f3-7d5d-49f9-aeab-ff0a57f2104b",
        "sourceQuestionNumber": "35",
        "sourceGroupId": "g3",
        "sourceInstruction": "**Questions 35-39**\nComplete the summary. \nWrite **NO MORE THAN TWO WORDS** in each gap.",
        "instructions": "Questions 35-39\nComplete the summary. \nWrite NO MORE THAN TWO WORDS in each gap.",
        "type": "text",
        "maxWords": 2,
        "passage": "A. The starkly modern Beinecke Library at Yale University is home to some of the most valuable books in the world: first folios of Shakespeare, Gutenberg Bibles and manuscripts from the early Middle Ages. Yet the library’s most controversial possession is an unprepossessing vellum manuscript about the size of a hardback book, containing 240-odd pages of drawings and text of unknown age and authorship. Catalogued as MS408, the manuscript would attract little attention were it not for the fact that the drawings hint at esoteric knowledge, while the text seems to be some sort of code – one that no-one has been able to break. It’s known to scholars as the Voynich manuscript, after the American book dealer Wilfrid Voynich, who bought the manuscript from a Jesuit college in Italy in 1912.\n\nB. Over the years, the manuscript has attracted the attention of everyone from amateur dabblers to top codebreakers, all determined to succeed where countless others have failed. Academic research papers, books and websites are devoted to making sense of the contents of the manuscript, which are freely available to all. ‘Most other mysteries involve secondhand reports,’ says Dr Gordon Rugg of Keele University, a leading Voynich expert. But this is one that you can see for yourself.\n\nC. It is certainly strange: page after page of drawings of weird plants, astrological symbolism and human figures, accompanied by a script that looks like some form of shorthand. What does it say and what are the drawings about? Voynich himself believed that the manuscript was the work of the 13th century English monk Roger Bacon, famed for his knowledge of alchemy, philosophy and science. In 1921 Voynich’s view that Bacon was the writer appeared to win support from the work of William Newbold, Professor of Philosophy at the University of Pennsylvania, who claimed to have found the key to the cipher system used by Bacon. According to Newbold, the manuscript proved that Bacon had access to a microscope centuries before they were supposedly first invented. They claim that this mediaeval monk had observed living cells created a sensation. It soon became clear, however, that Newbold had fallen victim to wishful thinking. Other scholars showed that his ‘decoding’ methods produced a host of possible interpretations.\n\nD. The Voynich manuscript has continued to defy the efforts of world-class experts. In 1944, a team was assembled to tackle the mystery, led by William Friedman, the renowned American codebreaker. They began with the most basic code breaking task: analysing the relative frequencies of the characters making up the text, looking for signs of an underlying structure. Yet Friedman’s team soon found themselves in deep water. The precise size of the ‘alphabet’ of the Voynich manuscript was unclear: it’s possible to make out more than 70 distinct symbols among the 170,000-character text. Furthermore, Friedman discovered that some words and phrases appeared more often than expected in a standard language, casting doubt on claims that the manuscript concealed a real language, as encryption typically reduces word frequencies.\n\nE. Friedman concluded that the most plausible resolution of this paradox was that ‘Voynichese’ is some sort of specially created artificial language, whose words are devised from concepts, rather than linguistics. So, could the Voynich manuscript be the earliest known example of an artificial language? Friedman’s hypothesis commands respect because of the lifetime of crypt analytical expertise he brought to bear,’ says Rob Churchill, co-author of the Voynich Manuscript, that still leaves a host of questions unanswered, however, such as the identity of the author and the meaning of the bizarre drawings. ‘It does little to advance our understanding of the manuscript as a whole,’ says Churchill. Even though Friedman was working more than 60 years ago, he suspected that major insights would come reality that the device that had already transformed code breaking: the computer. In this he was right – it is now the key tool for uncovering clues about the pleasure from manuscript’s language.\n\nF. The insights so far have been perplexing. For example, in 2001 another leading Voynich scholar, Dr Gabriel Landin of Birmingham University in the UK, published the results of his study of the manuscript using a pattern-detecting method called spectral analysis. This revealed evidence that the manuscript contains genuine words, rather than random nonsense, consistent with the existence of some underlying natural language. Yet the following year, Voynich expert Ren Zandbergen of the European Space Agency in Darmstadt, Germany showed that the entropy of the text (a measure of the rate of transfer of information) was consistent with Friedman’s suspicions that an artificial language had been used.\n\nG. Many are convinced that the Voynich manuscript isn’t a hoax. For how could a medieval hoaxer create so many telltale signs of a message from random nonsense? Yet even this has been challenged in new research by Rugg. Using a system, first published by the Italian mathematician Girolamo Cardano in 1150 in which a specially constructed grille issued to pick out symbols from a table, Rugg found he could rapidly generate text with many of the basic traits of the Voynich manuscript. Publishing his results in 2004 Rugg stresses that he hadn’t set out to prove the manuscript a hoax. ‘I simply demonstrated that it’s feasible to hoax something this complex in a few months, he says. Inevitably, others beg to differ. Some scholars, such as Zandbergen, still suspect the text has genuine meaning, though believe it may never be decipherable. Others, such as Churchill, have suggested that the sheer weirdness of the illustrations and text hint at an author who had lost touch with reality.\n\nH. What is clear is that the book-sized manuscript kept under lock and key at Yale University has lost none of its fascination. ‘Many derive great intellectual pleasure from solving puzzles,’ says Rugg. The Voynich manuscript is as challenging a puzzle as anyone could ask for."
      },
      {
        "id": "ae-r-i-manuscript-q36",
        "skill": "reading",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "36 William Friedman concluded that the manuscript was written in an artificial language that was based on _____ .",
        "answers": [
          "concepts"
        ],
        "explanation": "原文依据：Friedman concluded that the most plausible resolution of this paradox was that ‘Voynichese’ is some sort of specially created artificial language, whose words are devised from concepts, rather than linguistics",
        "materialFamilyId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourcePassageId": "8285004d-ef04-4ba2-b886-718cd8582dfb",
        "sourceQuestionId": "0aaebc38-2b8e-43c0-bec7-2fdf22473210",
        "sourceQuestionNumber": "36",
        "sourceGroupId": "g3",
        "sourceInstruction": "**Questions 35-39**\nComplete the summary. \nWrite **NO MORE THAN TWO WORDS** in each gap.",
        "instructions": "Questions 35-39\nComplete the summary. \nWrite NO MORE THAN TWO WORDS in each gap.",
        "type": "text",
        "maxWords": 2,
        "passage": "A. The starkly modern Beinecke Library at Yale University is home to some of the most valuable books in the world: first folios of Shakespeare, Gutenberg Bibles and manuscripts from the early Middle Ages. Yet the library’s most controversial possession is an unprepossessing vellum manuscript about the size of a hardback book, containing 240-odd pages of drawings and text of unknown age and authorship. Catalogued as MS408, the manuscript would attract little attention were it not for the fact that the drawings hint at esoteric knowledge, while the text seems to be some sort of code – one that no-one has been able to break. It’s known to scholars as the Voynich manuscript, after the American book dealer Wilfrid Voynich, who bought the manuscript from a Jesuit college in Italy in 1912.\n\nB. Over the years, the manuscript has attracted the attention of everyone from amateur dabblers to top codebreakers, all determined to succeed where countless others have failed. Academic research papers, books and websites are devoted to making sense of the contents of the manuscript, which are freely available to all. ‘Most other mysteries involve secondhand reports,’ says Dr Gordon Rugg of Keele University, a leading Voynich expert. But this is one that you can see for yourself.\n\nC. It is certainly strange: page after page of drawings of weird plants, astrological symbolism and human figures, accompanied by a script that looks like some form of shorthand. What does it say and what are the drawings about? Voynich himself believed that the manuscript was the work of the 13th century English monk Roger Bacon, famed for his knowledge of alchemy, philosophy and science. In 1921 Voynich’s view that Bacon was the writer appeared to win support from the work of William Newbold, Professor of Philosophy at the University of Pennsylvania, who claimed to have found the key to the cipher system used by Bacon. According to Newbold, the manuscript proved that Bacon had access to a microscope centuries before they were supposedly first invented. They claim that this mediaeval monk had observed living cells created a sensation. It soon became clear, however, that Newbold had fallen victim to wishful thinking. Other scholars showed that his ‘decoding’ methods produced a host of possible interpretations.\n\nD. The Voynich manuscript has continued to defy the efforts of world-class experts. In 1944, a team was assembled to tackle the mystery, led by William Friedman, the renowned American codebreaker. They began with the most basic code breaking task: analysing the relative frequencies of the characters making up the text, looking for signs of an underlying structure. Yet Friedman’s team soon found themselves in deep water. The precise size of the ‘alphabet’ of the Voynich manuscript was unclear: it’s possible to make out more than 70 distinct symbols among the 170,000-character text. Furthermore, Friedman discovered that some words and phrases appeared more often than expected in a standard language, casting doubt on claims that the manuscript concealed a real language, as encryption typically reduces word frequencies.\n\nE. Friedman concluded that the most plausible resolution of this paradox was that ‘Voynichese’ is some sort of specially created artificial language, whose words are devised from concepts, rather than linguistics. So, could the Voynich manuscript be the earliest known example of an artificial language? Friedman’s hypothesis commands respect because of the lifetime of crypt analytical expertise he brought to bear,’ says Rob Churchill, co-author of the Voynich Manuscript, that still leaves a host of questions unanswered, however, such as the identity of the author and the meaning of the bizarre drawings. ‘It does little to advance our understanding of the manuscript as a whole,’ says Churchill. Even though Friedman was working more than 60 years ago, he suspected that major insights would come reality that the device that had already transformed code breaking: the computer. In this he was right – it is now the key tool for uncovering clues about the pleasure from manuscript’s language.\n\nF. The insights so far have been perplexing. For example, in 2001 another leading Voynich scholar, Dr Gabriel Landin of Birmingham University in the UK, published the results of his study of the manuscript using a pattern-detecting method called spectral analysis. This revealed evidence that the manuscript contains genuine words, rather than random nonsense, consistent with the existence of some underlying natural language. Yet the following year, Voynich expert Ren Zandbergen of the European Space Agency in Darmstadt, Germany showed that the entropy of the text (a measure of the rate of transfer of information) was consistent with Friedman’s suspicions that an artificial language had been used.\n\nG. Many are convinced that the Voynich manuscript isn’t a hoax. For how could a medieval hoaxer create so many telltale signs of a message from random nonsense? Yet even this has been challenged in new research by Rugg. Using a system, first published by the Italian mathematician Girolamo Cardano in 1150 in which a specially constructed grille issued to pick out symbols from a table, Rugg found he could rapidly generate text with many of the basic traits of the Voynich manuscript. Publishing his results in 2004 Rugg stresses that he hadn’t set out to prove the manuscript a hoax. ‘I simply demonstrated that it’s feasible to hoax something this complex in a few months, he says. Inevitably, others beg to differ. Some scholars, such as Zandbergen, still suspect the text has genuine meaning, though believe it may never be decipherable. Others, such as Churchill, have suggested that the sheer weirdness of the illustrations and text hint at an author who had lost touch with reality.\n\nH. What is clear is that the book-sized manuscript kept under lock and key at Yale University has lost none of its fascination. ‘Many derive great intellectual pleasure from solving puzzles,’ says Rugg. The Voynich manuscript is as challenging a puzzle as anyone could ask for."
      }
    ]
  }
];
const originalListeningBlocks = [
  {
    "id": "ae-l-foundation-balloon",
    "skill": "listening",
    "stage": "foundation",
    "materialFamilyId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
    "title": "Enquires on hot air ballon trip",
    "instructions": "本组作答原题 1、2、3、4、5、6。播放原题完整录音；录音中还会出现本组以外的题号，只需填写下列六题。\nQuestions 1-10\nComplete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.",
    "stageBasis": "记录价格、时间和活动安排等明确事实。阶段按本组任务安排，尚未作难度标定，不直接对应雅思分数。",
    "sourceKind": "original-bank",
    "sourcePassageId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
    "audioTitle": "Enquires on hot air ballon trip",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/10e5887b-1876-4e4a-9f81-5fdba72b08d3.mp3",
    "sourceAudioSrc": "/media/listening/10e5887b-1876-4e4a-9f81-5fdba72b08d3.mp3",
    "audioAvailable": true,
    "audioDurationSeconds": 400.117551,
    "items": [
      {
        "id": "ae-l-foundation-balloon-q1",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "The lowest price: £1_____ per person",
        "answers": [
          "125"
        ],
        "explanation": "录音依据：cheapest flight is 125 pounds each for a group booking of at least ten people",
        "materialFamilyId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourcePassageId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourceQuestionId": "f061a42b-5627-4588-999f-423e93337655",
        "sourceQuestionNumber": "1",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the notes below.\nWrite **ONE WORD AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 1,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-balloon-q2",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "Each participant will be given a free 2_____ at the end of the flight.",
        "answers": [
          "certificate"
        ],
        "explanation": "录音依据：Upon completing the trip, we will provide each participant with a certificate, and that is entirely free of charge",
        "materialFamilyId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourcePassageId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourceQuestionId": "2a17267a-c30e-48df-b5df-951372163966",
        "sourceQuestionNumber": "2",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the notes below.\nWrite **ONE WORD AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 1,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-balloon-q3",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "The exact date can only be booked 3_____ .",
        "answers": [
          "online"
        ],
        "explanation": "录音依据：But to pick a specific date, you must book online",
        "materialFamilyId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourcePassageId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourceQuestionId": "b1d7f531-3602-4ed6-a60c-84dc0955646e",
        "sourceQuestionNumber": "3",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the notes below.\nWrite **ONE WORD AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 1,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-balloon-q4",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "The balloon can fly a maximum height of 4_____ metres.",
        "answers": [
          "1800"
        ],
        "explanation": "录音依据：And the highest altitude ever recorded for a ride is 1800 meters, but most rides stay below three hundred meters",
        "materialFamilyId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourcePassageId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourceQuestionId": "3f0ce8b2-cf2a-4f89-8570-20f87261866f",
        "sourceQuestionNumber": "4",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the notes below.\nWrite **ONE WORD AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 1,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-balloon-q5",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "There are no flights at 5_____ .",
        "answers": [
          "night"
        ],
        "explanation": "录音依据：Night flights are avoided due to weather conditions",
        "materialFamilyId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourcePassageId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourceQuestionId": "eeebdbc8-4833-4522-b725-ed7095b78d78",
        "sourceQuestionNumber": "5",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the notes below.\nWrite **ONE WORD AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 1,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-balloon-q6",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "The best time of year to go is in 6_____ .",
        "answers": [
          "Autumn"
        ],
        "explanation": "录音依据：Autumn is the best time of year to take the trip",
        "materialFamilyId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourcePassageId": "10e5887b-1876-4e4a-9f81-5fdba72b08d3",
        "sourceQuestionId": "df29febd-0b45-4de5-b643-7708f9681bc0",
        "sourceQuestionNumber": "6",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the notes below.\nWrite **ONE WORD AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 1,
        "allowNumber": true
      }
    ]
  },
  {
    "id": "ae-l-foundation-travel",
    "skill": "listening",
    "stage": "foundation",
    "materialFamilyId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
    "title": "Wedding travel booking",
    "instructions": "本组作答原题 1、2、3、4、5、6。播放原题完整录音；录音中还会出现本组以外的题号，只需填写下列六题。\nQuestions 1-10\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
    "stageBasis": "记录电话、人数和日期，并听清说话人更正的信息。阶段按本组任务安排，尚未作难度标定，不直接对应雅思分数。",
    "sourceKind": "original-bank",
    "sourcePassageId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
    "audioTitle": "Wedding travel booking",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/21601a5f-7472-4c73-a18a-aede42b0aaec.mp3",
    "sourceAudioSrc": "/media/listening/21601a5f-7472-4c73-a18a-aede42b0aaec.mp3",
    "audioAvailable": true,
    "audioDurationSeconds": 332.832,
    "items": [
      {
        "id": "ae-l-foundation-travel-q1",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "Bakewell Travel: Customer Booking Request Form\nTravelling to: Dubai\nName: Sarah Carter\nContact phone number: 1_____",
        "answers": [
          "07958477222"
        ],
        "explanation": "录音依据：And can I take a contact phone number;Oh 07958477222",
        "materialFamilyId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourcePassageId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourceQuestionId": "ff291342-c523-444f-85f2-b9b4a054e98b",
        "sourceQuestionNumber": "1",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-travel-q2",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "Best day to call: 2_____ morning",
        "answers": [
          "Thursday"
        ],
        "explanation": "录音依据：Now, I'll probably need to get back to you on this. Shall I call you back tomorrow morning;Uh, I work on Wednesdays. Uh, can you call me back on Thursday before 12:00;Fine",
        "materialFamilyId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourcePassageId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourceQuestionId": "aa0acddd-698c-428a-af6b-7172fe2ea32a",
        "sourceQuestionNumber": "2",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-travel-q3",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "Number of people travelling: 3_____",
        "answers": [
          "7"
        ],
        "explanation": "录音依据：So, Mrs. Carter, how many tickets will you need;3 adults and 4 children;So 7 altogether",
        "materialFamilyId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourcePassageId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourceQuestionId": "d9ccb3cc-5797-420c-9b87-0d672ff8d60c",
        "sourceQuestionNumber": "3",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-travel-q4",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "Date of outward journey: 4_____",
        "answers": [
          "22nd November"
        ],
        "explanation": "录音依据：Which date do you wish to travel on;Well, uh, we definitely need to be there for the 24th. So if we leave the UK on the 22nd, we'll have time to recover on the 23rd;So the 22nd of October;Not this month. Next month, November",
        "materialFamilyId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourcePassageId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourceQuestionId": "92416120-f43d-43d1-9077-2269851e02cf",
        "sourceQuestionNumber": "4",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-travel-q5",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "Date of return journey: 25th, November\nPurpose of trip: 5_____",
        "answers": [
          "wedding"
        ],
        "explanation": "录音依据：It's going to be a short holiday;We're going to a wedding. We're not going for a holiday",
        "materialFamilyId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourcePassageId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourceQuestionId": "62327996-157c-486f-b090-867d73e8d341",
        "sourceQuestionNumber": "5",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-foundation-travel-q6",
        "skill": "listening",
        "stage": "foundation",
        "dimension": "detail",
        "prompt": "Special requirements: one passenger can`t eat 6_____",
        "answers": [
          "cheese"
        ],
        "explanation": "录音依据：Now, do any travelers have any special requirements? You know, special assistance with mobility and that sort of thing;Oh, uh, well, actually, yes, my son's allergic to cheese. It makes him really, really ill",
        "materialFamilyId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourcePassageId": "21601a5f-7472-4c73-a18a-aede42b0aaec",
        "sourceQuestionId": "4454813a-ce83-421a-8e7e-f072fae67d29",
        "sourceQuestionNumber": "6",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 1-10**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 1-10\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      }
    ]
  },
  {
    "id": "ae-l-supported-sports",
    "skill": "listening",
    "stage": "supported",
    "materialFamilyId": "65166e42-5e44-4776-805f-55bf9812f122",
    "title": "Baxter sports centre",
    "instructions": "本组作答原题 11、12、13、14、15、16。播放原题完整录音；录音中还会出现本组以外的题号，只需填写下列六题。\nQuestions 11-16\nChoose the correct letter, A, B or C.",
    "stageBasis": "根据公共场所介绍，区分活动、优惠和理由。阶段按本组任务安排，尚未作难度标定，不直接对应雅思分数。",
    "sourceKind": "original-bank",
    "sourcePassageId": "65166e42-5e44-4776-805f-55bf9812f122",
    "audioTitle": "Baxter sports centre",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/65166e42-5e44-4776-805f-55bf9812f122.mp3",
    "sourceAudioSrc": "/media/listening/65166e42-5e44-4776-805f-55bf9812f122.mp3",
    "audioAvailable": true,
    "audioDurationSeconds": 348.192,
    "items": [
      {
        "id": "ae-l-supported-sports-q11",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "11 The sport centre has just opened a new",
        "answers": [
          "A"
        ],
        "explanation": "录音依据：At the moment, we're also celebrating the completion of a purpose-built dance studio, where you'll see a lesson in progress",
        "materialFamilyId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourcePassageId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourceQuestionId": "a89ad32b-25d1-4bb9-90d3-eb2710225812",
        "sourceQuestionNumber": "11",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 11-16\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "dance studio"
          },
          {
            "value": "B",
            "label": "swimming pool"
          },
          {
            "value": "C",
            "label": "cafe"
          }
        ]
      },
      {
        "id": "ae-l-supported-sports-q12",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "12 The sports facilities are used most",
        "answers": [
          "B"
        ],
        "explanation": "录音依据：Weekday evenings, we have the highest throughput, as a lot of people come straight from work for an hour or two",
        "materialFamilyId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourcePassageId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourceQuestionId": "188518db-1244-4196-b029-166e7861e357",
        "sourceQuestionNumber": "12",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 11-16\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "at weekends"
          },
          {
            "value": "B",
            "label": "on weekday evenings"
          },
          {
            "value": "C",
            "label": "during the day from Monday to Friday"
          }
        ]
      },
      {
        "id": "ae-l-supported-sports-q13",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "13 Classes are cheaper if you pay",
        "answers": [
          "B"
        ],
        "explanation": "录音依据：We organize a wide range of classes from yoga to boxing, and classes are best booked for a term. That's ten classes;Or if you prefer, you can turn up and pay cash on the day, but you'll find you save money when you book for a term up front",
        "materialFamilyId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourcePassageId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourceQuestionId": "0dc1940a-e892-485c-885c-bf72f3e26c52",
        "sourceQuestionNumber": "13",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 11-16\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "in cash"
          },
          {
            "value": "B",
            "label": "for several in advance"
          },
          {
            "value": "C",
            "label": "by credit card"
          }
        ]
      },
      {
        "id": "ae-l-supported-sports-q14",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "14 The sports centre recently won an award for",
        "answers": [
          "C"
        ],
        "explanation": "录音依据：All the information about our classes is on our website. There are profiles of our instructors too, and you'll see we've recently won a sports award for the standard of the work they do. The guidance they give was highlighted in the award ceremony",
        "materialFamilyId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourcePassageId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourceQuestionId": "ec5df864-3418-4179-bbfd-e50cef741f69",
        "sourceQuestionNumber": "14",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 11-16\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "the range of training in different sports"
          },
          {
            "value": "B",
            "label": "the amount of information on its website"
          },
          {
            "value": "C",
            "label": "the quality of the advice offered by its instructors"
          }
        ]
      },
      {
        "id": "ae-l-supported-sports-q15",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "15 Today the sports department is offering",
        "answers": [
          "A"
        ],
        "explanation": "录音依据：But best of all, just today, we're able to offer to people who join completely free an hour with a personal trainer",
        "materialFamilyId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourcePassageId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourceQuestionId": "d6187342-91c1-4cdd-a278-538152fb70d8",
        "sourceQuestionNumber": "15",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 11-16\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "a free hour with a personal trainer"
          },
          {
            "value": "B",
            "label": "a free ticket to the cup final"
          },
          {
            "value": "C",
            "label": "free membership for 20 people"
          }
        ]
      },
      {
        "id": "ae-l-supported-sports-q16",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "16 According to the speaker, why do many people stop exercising?",
        "answers": [
          "A"
        ],
        "explanation": "录音依据：A lot of people who join gyms or sports centers give up after a couple of months;They start making excuses like they're too busy at work. But it's usually because they joined on their own, so outside the club, there's no one to compare notes with",
        "materialFamilyId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourcePassageId": "65166e42-5e44-4776-805f-55bf9812f122",
        "sourceQuestionId": "87631ec2-feb1-48b6-bd76-165769e65c7a",
        "sourceQuestionNumber": "16",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 11-16\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "Their friends do not share the experience with them."
          },
          {
            "value": "B",
            "label": "Their job or studies take up too much of their time."
          },
          {
            "value": "C",
            "label": "They cannot see any results."
          }
        ]
      }
    ]
  },
  {
    "id": "ae-l-supported-races",
    "skill": "listening",
    "stage": "supported",
    "materialFamilyId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
    "title": "The beach races",
    "instructions": "本组作答原题 11、12、13、14、15、16。播放原题完整录音；录音中还会出现本组以外的题号，只需填写下列六题。\nQuestions 11-16\nChoose the correct answer.",
    "stageBasis": "根据活动说明，辨别规则、对象和建议。阶段按本组任务安排，尚未作难度标定，不直接对应雅思分数。",
    "sourceKind": "original-bank",
    "sourcePassageId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
    "audioTitle": "The beach races",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/2cb69122-3024-4bab-8538-cb331a0cf12a.mp3",
    "sourceAudioSrc": "/media/listening/2cb69122-3024-4bab-8538-cb331a0cf12a.mp3",
    "audioAvailable": true,
    "audioDurationSeconds": 259.032,
    "items": [
      {
        "id": "ae-l-supported-races-q11",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "11 Which is the most popular race?",
        "answers": [
          "B"
        ],
        "explanation": "录音依据：The bicycle race doesn't get so many entries. It's hard work pedaling on sand. The only rule for the tractors is that they must be at least fifty years old. That one always gets the biggest crowd, so we'll need lots of volunteers. And this year, we've got motorbikes for the first time. Be interesting to see how they go",
        "materialFamilyId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourcePassageId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourceQuestionId": "f60b4658-0ca1-4f25-8d88-03daf079512c",
        "sourceQuestionNumber": "11",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct answer.",
        "instructions": "Questions 11-16\nChoose the correct answer.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "bicycles"
          },
          {
            "value": "B",
            "label": "old tractors"
          },
          {
            "value": "C",
            "label": "motorbikes"
          }
        ]
      },
      {
        "id": "ae-l-supported-races-q12",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "12 What does the official say about the horse race?",
        "answers": [
          "A"
        ],
        "explanation": "录音依据：And remember, the horses can't stop quickly, so make sure no one is anywhere near the finish, please",
        "materialFamilyId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourcePassageId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourceQuestionId": "1922fa8b-8fdf-44f1-b37a-ba3c38305e8b",
        "sourceQuestionNumber": "12",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct answer.",
        "instructions": "Questions 11-16\nChoose the correct answer.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "keep the finish line clear"
          },
          {
            "value": "B",
            "label": "keep spectators off the beach"
          },
          {
            "value": "C",
            "label": "keep boats away from the shore"
          }
        ]
      },
      {
        "id": "ae-l-supported-races-q13",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "13 The Beach Picnic is only for",
        "answers": [
          "C"
        ],
        "explanation": "录音依据：Oh, yes, the beach picnic. There was some confusion about this last time. So just to clarify, it's for the youngsters, those ten or under and no one else, please",
        "materialFamilyId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourcePassageId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourceQuestionId": "f229d19c-7412-47c6-a4e2-713a92020f52",
        "sourceQuestionNumber": "13",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct answer.",
        "instructions": "Questions 11-16\nChoose the correct answer.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "race competitors."
          },
          {
            "value": "B",
            "label": "ticket holders."
          },
          {
            "value": "C",
            "label": "children."
          }
        ]
      },
      {
        "id": "ae-l-supported-races-q14",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "14 The official says that parking",
        "answers": [
          "B"
        ],
        "explanation": "录音依据：The good news is we haven't put up the prices at all for three years now. It's a flat rate of ten dollars for all vehicles, regardless of size",
        "materialFamilyId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourcePassageId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourceQuestionId": "8025cc2d-95cd-4349-b193-a30e8d1c49c6",
        "sourceQuestionNumber": "14",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct answer.",
        "instructions": "Questions 11-16\nChoose the correct answer.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "is more expensive for trucks"
          },
          {
            "value": "B",
            "label": "costs the same as last year."
          },
          {
            "value": "C",
            "label": "is free for some vehicles."
          }
        ]
      },
      {
        "id": "ae-l-supported-races-q15",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "15 What do stall-holders need to display?",
        "answers": [
          "A"
        ],
        "explanation": "录音依据：But stallholders must have pinned up somewhere noticeable a license from the local council to run a business on public land",
        "materialFamilyId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourcePassageId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourceQuestionId": "7414fcc9-d8cc-444b-ac07-6e2dfb29524c",
        "sourceQuestionNumber": "15",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct answer.",
        "instructions": "Questions 11-16\nChoose the correct answer.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "a council licence"
          },
          {
            "value": "B",
            "label": "their registration form"
          },
          {
            "value": "C",
            "label": "an insurance certificate"
          }
        ]
      },
      {
        "id": "ae-l-supported-races-q16",
        "skill": "listening",
        "stage": "supported",
        "dimension": "paraphrase",
        "prompt": "16 What final advice does the official give the volunteers",
        "answers": [
          "C"
        ],
        "explanation": "录音依据：And then, uh, just some final advice. There's always unexpected delays at events like this, so we have to be flexible. Just remember to look after yourselves. It's going to be hot, so throughout the day, make use of the water bottles and snacks in your volunteer packs",
        "materialFamilyId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourcePassageId": "2cb69122-3024-4bab-8538-cb331a0cf12a",
        "sourceQuestionId": "193dfce5-b178-452b-a2b9-9c6c552abddd",
        "sourceQuestionNumber": "16",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 11-16**\nChoose the correct answer.",
        "instructions": "Questions 11-16\nChoose the correct answer.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "encourage visitors to donate money"
          },
          {
            "value": "B",
            "label": "keep strictly to the timetable"
          },
          {
            "value": "C",
            "label": "eat and drink regularly"
          }
        ]
      }
    ]
  },
  {
    "id": "ae-l-bridge-shampoo",
    "skill": "listening",
    "stage": "bridge",
    "materialFamilyId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
    "title": "Shampoo market project",
    "instructions": "本组作答原题 21、22、23、24、25、26。播放原题完整录音；录音中还会出现本组以外的题号，只需填写下列六题。\nQuestions 21-26\nChoose the correct letter, A, B or C.",
    "stageBasis": "跟随两人讨论，辨别比较、意见和研究决定。阶段按本组任务安排，尚未作难度标定，不直接对应雅思分数。",
    "sourceKind": "original-bank",
    "sourcePassageId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
    "audioTitle": "Shampoo market project",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/c5e66efb-7495-4f41-b0b8-42bcb396730a.mp3",
    "sourceAudioSrc": "/media/listening/c5e66efb-7495-4f41-b0b8-42bcb396730a.mp3",
    "audioAvailable": true,
    "audioDurationSeconds": 436.176,
    "items": [
      {
        "id": "ae-l-bridge-shampoo-q21",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "21 Janet says that over time, shampoo has become",
        "answers": [
          "C"
        ],
        "explanation": "录音依据：Basically, what was once sold as an economical way of getting your hair clean has evolved into a beauty product",
        "materialFamilyId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourcePassageId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourceQuestionId": "bbe6b429-9d94-46c2-8de1-12e4115fb565",
        "sourceQuestionNumber": "21",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 21-26\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "a cheaper product"
          },
          {
            "value": "B",
            "label": "more hygienic in its effects"
          },
          {
            "value": "C",
            "label": "a different kind of commodity"
          }
        ]
      },
      {
        "id": "ae-l-bridge-shampoo-q22",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "22 What does Janet say about “bad hair days”?",
        "answers": [
          "A"
        ],
        "explanation": "录音依据：Well, whatever you want to call them, that's not what research from Yale is suggesting. They're not just imagined, and both sexes are equally affected by them",
        "materialFamilyId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourcePassageId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourceQuestionId": "d5251771-56a7-49f9-a586-a270d1677376",
        "sourceQuestionNumber": "22",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 21-26\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "They really do exist"
          },
          {
            "value": "B",
            "label": "Women worry about them more than men"
          },
          {
            "value": "C",
            "label": "Their name is inaccurate"
          }
        ]
      },
      {
        "id": "ae-l-bridge-shampoo-q23",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "23 What do Janet and Michael say about chemicals used in shampoos?",
        "answers": [
          "C"
        ],
        "explanation": "录音依据：Many of the manufacturers tend to use these or others like them, though they keep it quiet. Right. When it comes to the product packaging, they're strangely silent about it",
        "materialFamilyId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourcePassageId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourceQuestionId": "2b2cce7a-99ef-4fe8-abf5-e9857b911c63",
        "sourceQuestionNumber": "23",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 21-26\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "All shampoos contain the same chemicals"
          },
          {
            "value": "B",
            "label": "The chemicals are believed to be dangerous"
          },
          {
            "value": "C",
            "label": "The presence of the chemicals is rarely publicised"
          }
        ]
      },
      {
        "id": "ae-l-bridge-shampoo-q24",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "24 According to Janet, printing directly onto shampoo bottles, rather than onto labels.",
        "answers": [
          "B"
        ],
        "explanation": "录音依据：Apparently, printing directly onto the bottles costs about fifty percent less than sticking a printed label on because it's a much quicker process;But manufacturers are lukewarm about this because it doesn't enhance the visual impact of the bottle. It comes across as a bit cheap",
        "materialFamilyId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourcePassageId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourceQuestionId": "d9bb89b0-90af-45db-aa05-fd70c6a30a6e",
        "sourceQuestionNumber": "24",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 21-26\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "costs more"
          },
          {
            "value": "B",
            "label": "looks less attractive"
          },
          {
            "value": "C",
            "label": "takes a lot longer"
          }
        ]
      },
      {
        "id": "ae-l-bridge-shampoo-q25",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "25 With regard to environmental issues, Michael and Janet want to investigate",
        "answers": [
          "B"
        ],
        "explanation": "录音依据：Yeah, but manufacturers can make their packaging more environmentally friendly just by making it less heavy. I'd like to find out whether some of them actually do when we do the research;Yes, that's worth looking into",
        "materialFamilyId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourcePassageId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourceQuestionId": "a2d504c3-5cec-4aac-8c58-24d4f337195a",
        "sourceQuestionNumber": "25",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 21-26\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "the appearance of shampoo bottles"
          },
          {
            "value": "B",
            "label": "variations in the weight of shampoo bottles"
          },
          {
            "value": "C",
            "label": "the source of recycled plastic in shampoo bottles"
          }
        ]
      },
      {
        "id": "ae-l-bridge-shampoo-q26",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "26 Michael bases his own shampoo purchase decisions on his",
        "answers": [
          "C"
        ],
        "explanation": "录音依据：But if there's a make I've never seen before, I'm usually up for giving it a go rather than sticking to one or two favorite brands all my life",
        "materialFamilyId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourcePassageId": "c5e66efb-7495-4f41-b0b8-42bcb396730a",
        "sourceQuestionId": "20e0d53a-d98a-459d-a4d4-13117279caff",
        "sourceQuestionNumber": "26",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChoose the correct letter, **A, B** or **C**.",
        "instructions": "Questions 21-26\nChoose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "loyalty to certain brands"
          },
          {
            "value": "B",
            "label": "desire to get value for money"
          },
          {
            "value": "C",
            "label": "willingness to try new products"
          }
        ]
      }
    ]
  },
  {
    "id": "ae-l-bridge-farmers",
    "skill": "listening",
    "stage": "bridge",
    "materialFamilyId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
    "title": "Farmers` attitudes to new developments in agriculture",
    "instructions": "本组作答原题 21、22、23、24、25、26。播放原题完整录音；录音中还会出现本组以外的题号，只需填写下列六题。\nQuestions 21-26\nChose the correct letter, A, B or C.",
    "stageBasis": "跟随导师与学生讨论，辨别研究方法、理由和结论。阶段按本组任务安排，尚未作难度标定，不直接对应雅思分数。",
    "sourceKind": "original-bank",
    "sourcePassageId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
    "audioTitle": "Farmers` attitudes to new developments in agriculture",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/b6813d30-a1b6-44d6-a501-7dbd532aced7.mp3",
    "sourceAudioSrc": "/media/listening/b6813d30-a1b6-44d6-a501-7dbd532aced7.mp3",
    "audioAvailable": true,
    "audioDurationSeconds": 478.224,
    "items": [
      {
        "id": "ae-l-bridge-farmers-q21",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "21 What does Dr. Owen advise Joel to include in the title of this project?",
        "answers": [
          "A"
        ],
        "explanation": "录音依据：But I want to speak to each of the ten farmers in my sample. So I've chosen farms which are all in the same region;Owen: Okay. Well, I'd specify where they are then;Right. I'll amend the title to do that",
        "materialFamilyId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourcePassageId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourceQuestionId": "050d4fd7-4004-4682-bf51-6ef732f35cfa",
        "sourceQuestionNumber": "21",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChose the correct letter,** A, B** or **C**.",
        "instructions": "Questions 21-26\nChose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "the location of the farms"
          },
          {
            "value": "B",
            "label": "the number of farmers"
          },
          {
            "value": "C",
            "label": "the types of farming"
          }
        ]
      },
      {
        "id": "ae-l-bridge-farmers-q22",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "22 What has Joel decided to do face-to-face interviews?",
        "answers": [
          "C"
        ],
        "explanation": "录音依据：It's just that in my experience, a lot of farmers don't like talking on the phone, so they'll be more likely to talk freely if I see them in person",
        "materialFamilyId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourcePassageId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourceQuestionId": "e1799204-bca7-492c-b08d-1a4e24027221",
        "sourceQuestionNumber": "22",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChose the correct letter,** A, B** or **C**.",
        "instructions": "Questions 21-26\nChose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "to see the farmers` workplaces"
          },
          {
            "value": "B",
            "label": "to limit the time he spends on the project"
          },
          {
            "value": "C",
            "label": "to get fuller answers"
          }
        ]
      },
      {
        "id": "ae-l-bridge-farmers-q23",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "23 Joel agrees to investigate how farmers get information on new developments",
        "answers": [
          "B"
        ],
        "explanation": "录音依据：It might be more useful to ask them rather than show them a list. A spontaneous response to one or two open questions might give you a more accurate picture",
        "materialFamilyId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourcePassageId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourceQuestionId": "335b04e0-aabe-42b6-9da0-8172ec0335ca",
        "sourceQuestionNumber": "23",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChose the correct letter,** A, B** or **C**.",
        "instructions": "Questions 21-26\nChose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "by showing them a series of pictures"
          },
          {
            "value": "B",
            "label": "by asking them open questions"
          },
          {
            "value": "C",
            "label": "by sending them a checklist in advance"
          }
        ]
      },
      {
        "id": "ae-l-bridge-farmers-q24",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "24 Concerning government communication with farmers, the speakers agree that",
        "answers": [
          "A"
        ],
        "explanation": "录音依据：Well, one thing is farmers complain that the government sends out the same information to all of them, whether they're poultry farmers or dairy farmers or arable farmers. So they get all this information, but half of it doesn't actually apply to them",
        "materialFamilyId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourcePassageId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourceQuestionId": "56325262-c9a4-44ab-826c-c1fa019c18f7",
        "sourceQuestionNumber": "24",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChose the correct letter,** A, B** or **C**.",
        "instructions": "Questions 21-26\nChose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "much of it is irrelevant"
          },
          {
            "value": "B",
            "label": "it is often insufficient for farmers` needs"
          },
          {
            "value": "C",
            "label": "the wording is sometimes unclear"
          }
        ]
      },
      {
        "id": "ae-l-bridge-farmers-q25",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "25 According to Joel`s reading about the cost of making changes, many British farmers",
        "answers": [
          "B"
        ],
        "explanation": "录音依据：According to articles I've read, farmers in Britain aren't in principle against investing money in new machinery and new practices;but they're actually just too busy to work out what the financial implications are",
        "materialFamilyId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourcePassageId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourceQuestionId": "aa2b0940-9046-4a7e-be92-597454c8a7d9",
        "sourceQuestionNumber": "25",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChose the correct letter,** A, B** or **C**.",
        "instructions": "Questions 21-26\nChose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "leave investment decisions to their accountants"
          },
          {
            "value": "B",
            "label": "have too little time to calculate the costs of new methods"
          },
          {
            "value": "C",
            "label": "are reluctant to spend money on improvements"
          }
        ]
      },
      {
        "id": "ae-l-bridge-farmers-q26",
        "skill": "listening",
        "stage": "bridge",
        "dimension": "paraphrase",
        "prompt": "26 Survey of Australian sheep farmers found that most of them",
        "answers": [
          "B"
        ],
        "explanation": "录音依据：There's also been some research in Australia on sheep rearing practices. I can give you the reference if you like. Uh, basically, it appears that the majority of Australian sheep farmers are willing to risk adopting new practices on the basis of just a few pieces of research. They don't usually wait until the evidence in favor of the changes is overwhelming",
        "materialFamilyId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourcePassageId": "b6813d30-a1b6-44d6-a501-7dbd532aced7",
        "sourceQuestionId": "0f5c90f3-c6b1-403b-ba78-6f9f7d5bd6c1",
        "sourceQuestionNumber": "26",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 21-26**\nChose the correct letter,** A, B** or **C**.",
        "instructions": "Questions 21-26\nChose the correct letter, A, B or C.",
        "type": "choice",
        "options": [
          {
            "value": "A",
            "label": "are usually reluctant to make changes"
          },
          {
            "value": "B",
            "label": "make changes based on limited research"
          },
          {
            "value": "C",
            "label": "want plenty of evidence before they make changes"
          }
        ]
      }
    ]
  },
  {
    "id": "ae-l-independent-rubber",
    "skill": "listening",
    "stage": "independent",
    "materialFamilyId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
    "title": "Natural rubber production",
    "instructions": "本组作答原题 31、32、33、34、35、36。播放原题完整录音；录音中还会出现本组以外的题号，只需填写下列六题。\nQuestions 31-40\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
    "stageBasis": "根据较长讲解记录生产步骤及其限制条件。阶段按本组任务安排，尚未作难度标定，不直接对应雅思分数。",
    "sourceKind": "original-bank",
    "sourcePassageId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
    "audioTitle": "Natural rubber production",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/80749937-ac49-4aa2-98be-996ff7f3fc32.mp3",
    "sourceAudioSrc": "/media/listening/80749937-ac49-4aa2-98be-996ff7f3fc32.mp3",
    "audioAvailable": true,
    "audioDurationSeconds": 245.112,
    "items": [
      {
        "id": "ae-l-independent-rubber-q31",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "“tapping” - tree is cut and a layer of back is removed\n↓\ncup (e.g. made of a 31_____ shell) is attached to collect latex",
        "answers": [
          "coconut"
        ],
        "explanation": "录音依据：Next, the tapper attaches a cup to the tree made out of something simple like a coconut shell to collect it",
        "materialFamilyId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourcePassageId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourceQuestionId": "dd2b2ee3-af04-48ea-b86c-e49a779fa30d",
        "sourceQuestionNumber": "31",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-independent-rubber-q32",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "↓\nlatex is transferred to the “factory”\n↓\nLatex is poured into a 32_____",
        "answers": [
          "mould"
        ],
        "explanation": "录音依据：Here, it is poured into a mould, and then formic acid is added to it, and the mixture is left for a few hours",
        "materialFamilyId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourcePassageId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourceQuestionId": "baa7ea7f-aaa0-422a-adcb-c318d7860e04",
        "sourceQuestionNumber": "32",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-independent-rubber-q33",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "↓\nFormic acid is added to thicken the latex\n↓\nRubber is 33_____ by hand, to make it into a thin sheet",
        "answers": [
          "pressed"
        ],
        "explanation": "录音依据：This block of rubber is then pressed manually to turn it into a thin sheet",
        "materialFamilyId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourcePassageId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourceQuestionId": "9968b0e9-2a3d-4b4a-86b9-07d6fb995f93",
        "sourceQuestionNumber": "33",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-independent-rubber-q34",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "↓\nRubber sheets is put through a mangle (N.B. the only 34_____ in the process",
        "answers": [
          "machinery"
        ],
        "explanation": "录音依据：And I should point out that apart from this, no other machinery is used in the process",
        "materialFamilyId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourcePassageId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourceQuestionId": "b9326756-fa24-4e65-99e0-6cce2ac53efe",
        "sourceQuestionNumber": "34",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-independent-rubber-q35",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "↓\nRubber sheets are taken to be 35_____ in a special room",
        "answers": [
          "dried"
        ],
        "explanation": "录音依据：And finally, these sheets are taken to a special smoke room where they are dried",
        "materialFamilyId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourcePassageId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourceQuestionId": "63d98585-2387-4abe-b899-fc0476d06fdb",
        "sourceQuestionNumber": "35",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      },
      {
        "id": "ae-l-independent-rubber-q36",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "↓\nRubber sheets are purchased by 36_____",
        "answers": [
          "traders"
        ],
        "explanation": "录音依据：These are then sold to traders who collect them from villages and sell them on in turn",
        "materialFamilyId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourcePassageId": "80749937-ac49-4aa2-98be-996ff7f3fc32",
        "sourceQuestionId": "5a64c29c-ec9f-4afa-9db9-341387d80ba0",
        "sourceQuestionNumber": "36",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **NO MORE THAN TWO WORDS AND/OR A NUMBER** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
        "type": "text",
        "maxWords": 2,
        "allowNumber": true
      }
    ]
  },
  {
    "id": "ae-l-independent-smell",
    "skill": "listening",
    "stage": "independent",
    "materialFamilyId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
    "title": "The sense of smell",
    "instructions": "本组作答原题 31、32、33、34、35、36。播放原题完整录音；录音中还会出现本组以外的题号，只需填写下列六题。\nQuestions 31-40\nComplete the form below.\nWrite ONE WORD ONLY for each answer.",
    "stageBasis": "根据较长讲解，区分研究实例、结果和解释。阶段按本组任务安排，尚未作难度标定，不直接对应雅思分数。",
    "sourceKind": "original-bank",
    "sourcePassageId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
    "audioTitle": "The sense of smell",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/3a290a7f-cfc6-414c-b5dc-74b561238ea7.mp3",
    "sourceAudioSrc": "/media/listening/3a290a7f-cfc6-414c-b5dc-74b561238ea7.mp3",
    "audioAvailable": true,
    "audioDurationSeconds": 384.072,
    "items": [
      {
        "id": "ae-l-independent-smell-q31",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "The animal with the best sense of smell is the 31_____ .",
        "answers": [
          "bear"
        ],
        "explanation": "录音依据：the creature which is believed to have the most acute sense of smell of all, the bear",
        "materialFamilyId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourcePassageId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourceQuestionId": "2d273e40-32e7-41dc-8a7c-fca9cfd2bfee",
        "sourceQuestionNumber": "31",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **ONE WORD ONLY** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite ONE WORD ONLY for each answer.",
        "type": "text",
        "maxWords": 1
      },
      {
        "id": "ae-l-independent-smell-q32",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "The human sense of smell may be stronger than we imagine.\nSmell can influence our mood and the choices we make.\nHowever, we are not usually aware of this, maybe because we can`t easily identify the 32_____ of smell.",
        "answers": [
          "source"
        ],
        "explanation": "录音依据：One possible reason is that our noses aren't well equipped to detect the source of an odor, and so we dismiss it",
        "materialFamilyId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourcePassageId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourceQuestionId": "4fda7f83-2df4-4de2-8695-febaccfd0fb1",
        "sourceQuestionNumber": "32",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **ONE WORD ONLY** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite ONE WORD ONLY for each answer.",
        "type": "text",
        "maxWords": 1
      },
      {
        "id": "ae-l-independent-smell-q33",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "Some examples of how smell influence people\nSelling houses: the smell of fresh 33_____ makes potential buyers find a house desirable.",
        "answers": [
          "bread"
        ],
        "explanation": "录音依据：They often suggest that people who want to sell a house arrange things so that there is a smell of newly baked bread on the property to encourage viewers to want to buy it",
        "materialFamilyId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourcePassageId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourceQuestionId": "9fd703e2-062d-4d1a-a2dc-110a5d34c6ee",
        "sourceQuestionNumber": "33",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **ONE WORD ONLY** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite ONE WORD ONLY for each answer.",
        "type": "text",
        "maxWords": 1
      },
      {
        "id": "ae-l-independent-smell-q34",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "A Dutch study found the smell of 34_____ made people enjoy a nightclub more.",
        "answers": [
          "oranges"
        ],
        "explanation": "录音依据：They discovered, rather to their surprise, that when the aroma of oranges was pumped into the venue, the guests partied harder;rated their night as more enjoyable",
        "materialFamilyId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourcePassageId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourceQuestionId": "08c6ae83-95f0-4203-a0a3-3f074c7a0f27",
        "sourceQuestionNumber": "34",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **ONE WORD ONLY** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite ONE WORD ONLY for each answer.",
        "type": "text",
        "maxWords": 1
      },
      {
        "id": "ae-l-independent-smell-q35",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "Another study found that specific smell encouraged students to 35_____ a shared room.",
        "answers": [
          "clean"
        ],
        "explanation": "录音依据：Another study found that the hint of a smell;was enough to persuade students to clean the communal kitchen after using it",
        "materialFamilyId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourcePassageId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourceQuestionId": "84a39802-d3b4-456a-8367-11e3fd06d4fa",
        "sourceQuestionNumber": "35",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **ONE WORD ONLY** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite ONE WORD ONLY for each answer.",
        "type": "text",
        "maxWords": 1
      },
      {
        "id": "ae-l-independent-smell-q36",
        "skill": "listening",
        "stage": "independent",
        "dimension": "detail",
        "prompt": "A new smell makes us less likely to base a decision on 36_____ .",
        "answers": [
          "logic"
        ],
        "explanation": "录音依据：It found that subjecting people to a new smell;let people relying on their emotions to make a decision rather than relying on logic",
        "materialFamilyId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourcePassageId": "3a290a7f-cfc6-414c-b5dc-74b561238ea7",
        "sourceQuestionId": "1f67c4e6-ea18-4b3c-ad8f-c0677ddbca39",
        "sourceQuestionNumber": "36",
        "sourceGroupId": "g1",
        "sourceInstruction": "**Questions 31-40**\nComplete the form below.\nWrite **ONE WORD ONLY** for each answer.",
        "instructions": "Questions 31-40\nComplete the form below.\nWrite ONE WORD ONLY for each answer.",
        "type": "text",
        "maxWords": 1
      }
    ]
  }
];

export const adaptiveManualItems = [
  { id: 'ae-writing-sample', skill: 'writing', stage: 'supported', dimension: 'paragraph', manual: true, materialFamilyId: 'assessment:writing-school-place', title: '写一段学校改进建议', sourceItemId: 'd-w-1', sourceKind: 'growth-content', prompt: 'Write 80–120 words: Describe one change that would make your school day better. Explain it and give a reason or example.', instructions: '用英文写 80–120 词。暂时写不成段落，可以先写几个完整句子。', answers: [], explanation: '教师查看句子是否完整、理由是否对应观点、例子是否具体，以及句子之间的联系。字数仅用于安排练习，不直接换算分数。', reviewDimensions: ['句子结构', '词语使用', '观点与理由', '例子与解释', '句间联系'] },
  { id: 'ae-speaking-sample', skill: 'speaking', stage: 'supported', dimension: 'development', manual: true, materialFamilyId: 'assessment:speaking-school-skill', title: '说一项课后活动', sourceItemId: 'd-s-1', sourceKind: 'growth-content', prompt: 'Talk for 60–90 seconds about an activity you enjoy after school. Say what it is, who you do it with and why you enjoy it.', instructions: '准备 30 秒，录音 60–90 秒。可以用自己熟悉的词；不必背答案。', answers: [], explanation: '教师听录音后查看能否说清经历、连接理由与例子、持续表达，以及语音是否影响理解。未录音时只保留待完成状态。', reviewDimensions: ['意思是否清楚', '回答展开', '持续表达', '词句使用', '语音可理解度'] },
];

export const adaptiveBlocks = [foundationBlock, ...authoredReadingBlocks, ...originalReadingBlocks, ...originalListeningBlocks];

// One common entry paper: six word/sentence items, twelve reading items and
// twelve concrete situational listening items. No follow-up assessment blocks.
const entryBlockIds = new Set(['ae-b1-context-meaning', 'ae-r-s-repair', 'ae-r-s-breakfast', 'ae-l-foundation-balloon', 'ae-l-foundation-travel']);
export const entryAssessmentBlocks = adaptiveBlocks.filter(block => entryBlockIds.has(block.id));
