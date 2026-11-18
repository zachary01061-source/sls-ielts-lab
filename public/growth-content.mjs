import {applyBankAdaptations} from './bank-adaptations.mjs';
// School practice content; formal assessment scores require server-side validation.
export const contentMetadata = {
  "version": 1,
  "updatedAt": "2026-11-03",
  "diagnosticNotice": "能力测评用于安排本轮练习重点；写作和口语提交后查看自动批改进度与具体修改意见，老师可以复核。",
  "readingNotice": "看过同主题提示版后，原题不作为全新独立任务的证明。",
  "textbookStatus": "本模块保留校内原创训练；四份已导入教材可在“教材课程”中按章节学习与练习。",
  "vocabularySourceMenu": "http://www.1kao.com.cn/qr/3064/menu.asp",
  "vocabularySourceTitle": "雅思王听力真题语料库",
  "vocabularyCoverage": "8组、96个校内基础词条；并非教材完整导入。",
  "dictationTarget": "本组听写90%以上；保留首次与订正后结果，不换算雅思成绩。"
};

export const diagnosticItems = [
  {
    "id": "d-f-1",
    "prompt": "The library is a _____ place to read.",
    "answers": [
      "B"
    ],
    "explanation": "quiet 表示安静。",
    "dimension": "vocabulary",
    "options": [
      {
        "value": "A",
        "label": "expensive"
      },
      {
        "value": "B",
        "label": "quiet"
      },
      {
        "value": "C",
        "label": "late"
      }
    ],
    "skill": "foundation",
    "stage": "foundation"
  },
  {
    "id": "d-f-2",
    "prompt": "Choose the correct sentence.",
    "answers": [
      "C"
    ],
    "explanation": "She 后的一般现在时动词用第三人称单数。",
    "dimension": "grammar",
    "options": [
      {
        "value": "A",
        "label": "She study every day."
      },
      {
        "value": "B",
        "label": "She studying every day."
      },
      {
        "value": "C",
        "label": "She studies every day."
      }
    ],
    "skill": "foundation",
    "stage": "foundation"
  },
  {
    "id": "d-f-3",
    "prompt": "There are three _____ (book) on the desk.",
    "answers": [
      "books"
    ],
    "explanation": "three 后用复数。",
    "dimension": "grammar",
    "skill": "foundation",
    "stage": "foundation"
  },
  {
    "id": "d-f-4",
    "prompt": "Please speak _____ so everyone can hear.",
    "answers": [
      "A"
    ],
    "explanation": "clearly 修饰动词 speak。",
    "dimension": "word_form",
    "options": [
      {
        "value": "A",
        "label": "clearly"
      },
      {
        "value": "B",
        "label": "clear"
      },
      {
        "value": "C",
        "label": "clearness"
      }
    ],
    "skill": "foundation",
    "stage": "supported"
  },
  {
    "id": "d-f-5",
    "prompt": "The task was difficult, _____ we finished it.",
    "answers": [
      "B"
    ],
    "explanation": "前后转折。",
    "dimension": "logic",
    "options": [
      {
        "value": "A",
        "label": "because"
      },
      {
        "value": "B",
        "label": "but"
      },
      {
        "value": "C",
        "label": "so"
      }
    ],
    "skill": "foundation",
    "stage": "supported"
  },
  {
    "id": "d-f-6",
    "prompt": "Choose the correct sentence.",
    "answers": [
      "C"
    ],
    "explanation": "yesterday 用过去时。",
    "dimension": "grammar",
    "options": [
      {
        "value": "A",
        "label": "Yesterday we go home."
      },
      {
        "value": "B",
        "label": "Yesterday we have go home."
      },
      {
        "value": "C",
        "label": "Yesterday we went home."
      }
    ],
    "skill": "foundation",
    "stage": "supported"
  },
  {
    "id": "d-f-7",
    "prompt": "“Students are not required to bring a laptop” means:",
    "answers": [
      "B"
    ],
    "explanation": "not required 不是禁止，而是不必。",
    "dimension": "paraphrase",
    "options": [
      {
        "value": "A",
        "label": "They must not bring one."
      },
      {
        "value": "B",
        "label": "They do not have to bring one."
      },
      {
        "value": "C",
        "label": "They must bring one."
      }
    ],
    "skill": "foundation",
    "stage": "bridge"
  },
  {
    "id": "d-f-8",
    "prompt": "“Lin borrowed a guidebook because she needed it for a trip.” What is “it”?",
    "answers": [
      "A"
    ],
    "explanation": "it 指 guidebook。",
    "dimension": "reference",
    "options": [
      {
        "value": "A",
        "label": "The guidebook"
      },
      {
        "value": "B",
        "label": "The trip"
      },
      {
        "value": "C",
        "label": "Lin"
      }
    ],
    "skill": "foundation",
    "stage": "bridge"
  },
  {
    "id": "d-f-9",
    "prompt": "If we leave now, we _____ the bus.",
    "answers": [
      "C"
    ],
    "explanation": "真实条件句可用 will + 动词。",
    "dimension": "grammar",
    "options": [
      {
        "value": "A",
        "label": "caught"
      },
      {
        "value": "B",
        "label": "would caught"
      },
      {
        "value": "C",
        "label": "will catch"
      }
    ],
    "skill": "foundation",
    "stage": "bridge"
  },
  {
    "id": "d-f-10",
    "prompt": "Which conclusion is cautious?",
    "answers": [
      "C"
    ],
    "explanation": "may indicate 保留不确定性。",
    "dimension": "logic",
    "options": [
      {
        "value": "A",
        "label": "This proves everyone learns the same way."
      },
      {
        "value": "B",
        "label": "This can never be questioned."
      },
      {
        "value": "C",
        "label": "This may indicate a benefit for some learners."
      }
    ],
    "skill": "foundation",
    "stage": "independent"
  },
  {
    "id": "d-f-11",
    "prompt": "“The plan was rejected not because it was costly, but because its benefits were uncertain.” Why was it rejected?",
    "answers": [
      "B"
    ],
    "explanation": "真正原因在 but because 后。",
    "dimension": "paraphrase",
    "options": [
      {
        "value": "A",
        "label": "High cost"
      },
      {
        "value": "B",
        "label": "Unclear benefits"
      },
      {
        "value": "C",
        "label": "Measured benefits"
      }
    ],
    "skill": "foundation",
    "stage": "independent"
  },
  {
    "id": "d-f-12",
    "prompt": "Choose the correct sentence.",
    "answers": [
      "A"
    ],
    "explanation": "despite 后接名词短语。",
    "dimension": "grammar",
    "options": [
      {
        "value": "A",
        "label": "Despite the rain, we continued."
      },
      {
        "value": "B",
        "label": "Despite it rained, we continued."
      },
      {
        "value": "C",
        "label": "Although the rain, we continued."
      }
    ],
    "skill": "foundation",
    "stage": "independent"
  },
  {
    "id": "d-r-foundation-0",
    "prompt": "What time does the library open on Saturday?",
    "answers": [
      "9:00",
      "9 am",
      "9am"
    ],
    "explanation": "原文区分工作日和星期六。",
    "dimension": "detail",
    "skill": "reading",
    "stage": "foundation",
    "passage": "The library opens at 8:00 on weekdays and at 9:00 on Saturdays. It is closed on Sundays. Students may borrow three books for two weeks. Bring your student card to renew a book before the return date."
  },
  {
    "id": "d-r-foundation-1",
    "prompt": "Students may borrow _____ books.",
    "answers": [
      "three",
      "3"
    ],
    "explanation": "原文给出 three。",
    "dimension": "detail",
    "skill": "reading",
    "stage": "foundation",
    "passage": "The library opens at 8:00 on weekdays and at 9:00 on Saturdays. It is closed on Sundays. Students may borrow three books for two weeks. Bring your student card to renew a book before the return date."
  },
  {
    "id": "d-r-foundation-2",
    "prompt": "The library is open every day.",
    "answers": [
      "FALSE"
    ],
    "explanation": "星期日关闭。",
    "dimension": "detail",
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
    "skill": "reading",
    "stage": "foundation",
    "passage": "The library opens at 8:00 on weekdays and at 9:00 on Saturdays. It is closed on Sundays. Students may borrow three books for two weeks. Bring your student card to renew a book before the return date."
  },
  {
    "id": "d-r-supported-0",
    "prompt": "Why did they begin indoors?",
    "answers": [
      "B"
    ],
    "explanation": "雨使室外计划推迟。",
    "dimension": "detail",
    "options": [
      {
        "value": "A",
        "label": "No pots"
      },
      {
        "value": "B",
        "label": "Heavy rain"
      },
      {
        "value": "C",
        "label": "Too many plants"
      }
    ],
    "skill": "reading",
    "stage": "supported",
    "passage": "A science club planned to grow herbs outside, but heavy rain delayed the work. Students began with pots in a classroom. After two weeks, they moved half the pots outside. They measured both groups each Friday and gave every pot the same amount of water."
  },
  {
    "id": "d-r-supported-1",
    "prompt": "They measured the plants each _____.",
    "answers": [
      "Friday"
    ],
    "explanation": "最后一句给出频率。",
    "dimension": "detail",
    "skill": "reading",
    "stage": "supported",
    "passage": "A science club planned to grow herbs outside, but heavy rain delayed the work. Students began with pots in a classroom. After two weeks, they moved half the pots outside. They measured both groups each Friday and gave every pot the same amount of water."
  },
  {
    "id": "d-r-supported-2",
    "prompt": "Outdoor plants grew taller than indoor plants.",
    "answers": [
      "NOT GIVEN"
    ],
    "explanation": "没有报告实验结果。",
    "dimension": "detail",
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
    "skill": "reading",
    "stage": "supported",
    "passage": "A science club planned to grow herbs outside, but heavy rain delayed the work. Students began with pots in a classroom. After two weeks, they moved half the pots outside. They measured both groups each Friday and gave every pot the same amount of water."
  },
  {
    "id": "d-r-bridge-0",
    "prompt": "Why avoid an immediate conclusion?",
    "answers": [
      "B"
    ],
    "explanation": "自愿参加者可能原本更积极，存在其他解释。",
    "dimension": "inference",
    "options": [
      {
        "value": "A",
        "label": "Scores fell"
      },
      {
        "value": "B",
        "label": "Other differences might explain the improvement"
      },
      {
        "value": "C",
        "label": "No one attended"
      }
    ],
    "skill": "reading",
    "stage": "bridge",
    "passage": "A teacher noticed that students attending an optional revision club often improved their scores. She did not immediately conclude that the club caused the improvement: volunteers might already be more motivated. She planned to compare groups with similar starting scores and record revision done outside school."
  },
  {
    "id": "d-r-bridge-1",
    "prompt": "Groups should have similar _____ scores.",
    "answers": [
      "starting"
    ],
    "explanation": "需要比较相近起点。",
    "dimension": "inference",
    "skill": "reading",
    "stage": "bridge",
    "passage": "A teacher noticed that students attending an optional revision club often improved their scores. She did not immediately conclude that the club caused the improvement: volunteers might already be more motivated. She planned to compare groups with similar starting scores and record revision done outside school."
  },
  {
    "id": "d-r-bridge-2",
    "prompt": "The teacher had already established that the club caused the improvement.",
    "answers": [
      "FALSE"
    ],
    "explanation": "教师并未立即确认因果，而是准备进一步比较。",
    "dimension": "inference",
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
    "skill": "reading",
    "stage": "bridge",
    "passage": "A teacher noticed that students attending an optional revision club often improved their scores. She did not immediately conclude that the club caused the improvement: volunteers might already be more motivated. She planned to compare groups with similar starting scores and record revision done outside school."
  },
  {
    "id": "d-r-independent-0",
    "prompt": "What is the main caution?",
    "answers": [
      "C"
    ],
    "explanation": "多个因素同时改变，不能单独归因。",
    "dimension": "inference",
    "options": [
      {
        "value": "A",
        "label": "Boards never work"
      },
      {
        "value": "B",
        "label": "Paper should be banned"
      },
      {
        "value": "C",
        "label": "Several changes happened together"
      }
    ],
    "skill": "reading",
    "stage": "independent",
    "passage": "When a school replaced printed notices with a digital board, fewer announcements were missed. Yet notices had also been shortened and posted at a regular time. The result supports a clearer communication system but does not establish which change caused the improvement. A follow-up could vary one feature while keeping the others stable."
  },
  {
    "id": "d-r-independent-1",
    "prompt": "Which follow-up matches the suggestion?",
    "answers": [
      "B"
    ],
    "explanation": "只改变一个因素便于比较。",
    "dimension": "inference",
    "options": [
      {
        "value": "A",
        "label": "Change everything again"
      },
      {
        "value": "B",
        "label": "Keep wording and schedule while comparing formats"
      },
      {
        "value": "C",
        "label": "Ask only board supporters"
      }
    ],
    "skill": "reading",
    "stage": "independent",
    "passage": "When a school replaced printed notices with a digital board, fewer announcements were missed. Yet notices had also been shortened and posted at a regular time. The result supports a clearer communication system but does not establish which change caused the improvement. A follow-up could vary one feature while keeping the others stable."
  },
  {
    "id": "d-r-independent-2",
    "prompt": "The school measured the cost of each format.",
    "answers": [
      "NOT GIVEN"
    ],
    "explanation": "没有成本信息。",
    "dimension": "inference",
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
    "skill": "reading",
    "stage": "independent",
    "passage": "When a school replaced printed notices with a digital board, fewer announcements were missed. Yet notices had also been shortened and posted at a regular time. The result supports a clearer communication system but does not establish which change caused the improvement. A follow-up could vary one feature while keeping the others stable."
  },
  {
    "id": "d-l-1",
    "prompt": "Mobile phone number: 021 636 7189\nEmail address: graceb @_____ co.nz",
    "answers": [
      "travel"
    ],
    "explanation": "邮箱中缺失的部分是 travel。",
    "dimension": "spelling",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-l-2",
    "prompt": "Qualification: a diploma in _____",
    "answers": [
      "teaching"
    ],
    "explanation": "文凭与 teaching 有关，不是过去的银行工作。",
    "dimension": "distractors",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-l-3",
    "prompt": "Agreed work hours: from _____ am to 2pm Monday to Friday",
    "answers": [
      "9:15",
      "9.15",
      "9:15 am",
      "9.15 am"
    ],
    "explanation": "双方最终约定 9:15；8:15 是最早可出门的时间。",
    "dimension": "distractors",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-l-4",
    "prompt": "Volunteer work experience: a volunteer city _____ at Rugby World Cup",
    "answers": [
      "guide"
    ],
    "explanation": "世界杯期间做 city guide。",
    "dimension": "spelling",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-l-5",
    "prompt": "a volunteer netball team _____",
    "answers": [
      "coach"
    ],
    "explanation": "manager 邀请她担任 coach。",
    "dimension": "distractors",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-l-6",
    "prompt": "Hobbies: like to work in her _____",
    "answers": [
      "garden"
    ],
    "explanation": "她喜欢在 garden 里种菜。",
    "dimension": "spelling",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-l-7",
    "prompt": "enjoy flower arranging plays the _____",
    "answers": [
      "guitar"
    ],
    "explanation": "会弹 guitar；flute 是将来想学的。",
    "dimension": "distractors",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-l-8",
    "prompt": "Type of work offered: working on a _____ for a month",
    "answers": [
      "farm"
    ],
    "explanation": "在 farm 的工作持续一个月。",
    "dimension": "spelling",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-l-9",
    "prompt": "working in a community centre with elderly people\nWhy is she interested in volunteering?\nwants to have more _____",
    "answers": [
      "friends"
    ],
    "explanation": "希望多交 friends，注意复数。",
    "dimension": "spelling",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-l-10",
    "prompt": "wants to help others\nWhere did she hear about the agency?\nsaw an advertisement at the _____",
    "answers": [
      "supermarket"
    ],
    "explanation": "在 supermarket 看见广告。",
    "dimension": "distractors",
    "skill": "listening",
    "stage": "supported",
    "audioGroup": "volunteer-interview",
    "audioUrl": "https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3",
    "audioTitle": "志愿者申请面试",
    "maxWords": 1,
    "originalId": "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01",
    "instructions": "每空填写一个单词和／或数字。"
  },
  {
    "id": "d-w-1",
    "skill": "writing",
    "stage": "supported",
    "dimension": "paragraph",
    "manual": true,
    "prompt": "Write 80–120 words: Describe one change that would make your school day better. Explain it and give a reason or example."
  },
  {
    "id": "d-s-1",
    "skill": "speaking",
    "stage": "supported",
    "dimension": "development",
    "manual": true,
    "prompt": "Talk for 60–90 seconds about an activity you enjoy after school. Say what it is, who you do it with and why you enjoy it."
  }
];

export const readingUnits = [
  {
    "id": "r-pencil",
    "title": "一支铅笔的门道",
    "titleCn": "一支铅笔的门道",
    "originalId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1",
    "topic": "日常物品与材料",
    "versions": [
      {
        "stage": "foundation",
        "title": "一支铅笔的门道",
        "passage": "A pencil has a wooden case and a dark centre. We often call the centre “lead”, but a modern pencil does not contain the metal lead. Its centre is a mixture of graphite and clay. Graphite makes a mark on paper. More clay makes the centre harder.\n\nPeople use different pencils for different jobs. A student may use an HB pencil for writing. An artist may choose a softer pencil for dark lines. The wooden case supports the soft material and helps keep fingers clean. Although people now write on screens, pencils are still useful in classrooms and art rooms.",
        "wordCount": 100,
        "glossary": [
          {
            "word": "graphite",
            "meaning": "石墨"
          },
          {
            "word": "clay",
            "meaning": "黏土"
          },
          {
            "word": "mixture",
            "meaning": "混合物"
          }
        ],
        "questions": [
          {
            "id": "pencil-0-0",
            "prompt": "What two materials form the centre?",
            "answers": [
              "A"
            ],
            "explanation": "第一段说明 graphite and clay。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "Graphite and clay"
              },
              {
                "value": "B",
                "label": "Lead and wood"
              },
              {
                "value": "C",
                "label": "Paper and clay"
              }
            ]
          },
          {
            "id": "pencil-0-1",
            "prompt": "More clay makes the centre _____.",
            "answers": [
              "harder"
            ],
            "explanation": "第一段最后一句。",
            "dimension": "detail"
          },
          {
            "id": "pencil-0-2",
            "prompt": "Artists may choose softer pencils for dark lines.",
            "answers": [
              "TRUE"
            ],
            "explanation": "第二段明确说明。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "pencil-0-3",
            "prompt": "The wooden case helps keep fingers clean.",
            "answers": [
              "TRUE"
            ],
            "explanation": "第二段说明木壳的作用。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "pencil-0-4",
            "prompt": "Pencils cost less than tablets.",
            "answers": [
              "NOT GIVEN"
            ],
            "explanation": "文章没有价格信息。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "pencil-0-5",
            "prompt": "What is the passage mainly about?",
            "answers": [
              "B"
            ],
            "explanation": "全文解释铅笔的结构与用途。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "A shop"
              },
              {
                "value": "B",
                "label": "A familiar object"
              },
              {
                "value": "C",
                "label": "A school rule"
              }
            ]
          }
        ],
        "supports": [
          "先读题干，圈出需要寻找的信息。",
          "定位后读完整句，留意范围词和转折。"
        ],
        "lessonSteps": [
          {
            "title": "先建立词句理解",
            "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
            "example": "More clay / makes / the core harder. 更多黏土使笔芯更硬。",
            "task": "选择文中一句较长的句子，划出主语和主要动词。",
            "checklist": [
              "我能说清谁做了什么。",
              "我没有逐词硬译。"
            ]
          },
          {
            "title": "从句子读到段落",
            "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
            "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
            "task": "给每段写一个不超过十个字的标题。",
            "checklist": [
              "标题覆盖全段。",
              "标题没有只复述一个例子。"
            ]
          },
          {
            "title": "用证据检查答案",
            "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
            "example": "may 不等于 always；not required 不等于 forbidden。",
            "task": "做题后为每个答案标出支持它的句子。",
            "checklist": [
              "我能指出证据。",
              "我检查了单复数和范围。"
            ]
          }
        ],
        "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1"
      },
      {
        "stage": "supported",
        "title": "一支铅笔的门道",
        "passage": "A. The dark core of a modern pencil is often called lead. This name can be misleading: the core contains graphite mixed with clay, rather than the metal lead. Graphite is soft and leaves a mark easily. Wood supports the core and makes it convenient to hold.\n\nB. Manufacturers change the proportions of graphite and clay to produce different grades. Increasing the clay content makes the core harder. In a common grading system, H means hard and B means black. An HB pencil is widely used for ordinary writing, while softer pencils can produce the dark marks an artist wants.\n\nC. Students use pencils to calculate, artists to sketch, and designers to plan. Digital devices have changed how people work, but older tools can still serve a purpose. A pencil needs neither a battery nor an internet connection, and its marks can usually be erased.",
        "wordCount": 145,
        "glossary": [
          {
            "word": "core",
            "meaning": "笔芯"
          },
          {
            "word": "proportion",
            "meaning": "比例"
          },
          {
            "word": "misleading",
            "meaning": "易误导的"
          }
        ],
        "questions": [
          {
            "id": "pencil-1-0",
            "prompt": "Which paragraph explains pencil grades?",
            "answers": [
              "B"
            ],
            "explanation": "B 段解释 H、B 和 HB。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "A"
              },
              {
                "value": "B",
                "label": "B"
              },
              {
                "value": "C",
                "label": "C"
              }
            ]
          },
          {
            "id": "pencil-1-1",
            "prompt": "The name “lead” can be _____.",
            "answers": [
              "misleading"
            ],
            "explanation": "A 段第二句。",
            "dimension": "detail"
          },
          {
            "id": "pencil-1-2",
            "prompt": "More clay produces a softer core.",
            "answers": [
              "FALSE"
            ],
            "explanation": "B 段说更硬，与题干相反。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "pencil-1-3",
            "prompt": "Complete: Artists use pencils to _____.",
            "answers": [
              "sketch"
            ],
            "explanation": "C 段用平行结构列举用途。",
            "dimension": "detail"
          },
          {
            "id": "pencil-1-4",
            "prompt": "All artists prefer HB pencils.",
            "answers": [
              "NOT GIVEN"
            ],
            "explanation": "文中没有说明所有艺术家的偏好。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "pencil-1-5",
            "prompt": "Which claim is supported?",
            "answers": [
              "C"
            ],
            "explanation": "C 段认为新工具出现后旧工具仍有用。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "All old tools disappear"
              },
              {
                "value": "B",
                "label": "Batteries improve every pencil"
              },
              {
                "value": "C",
                "label": "Older tools can remain useful"
              }
            ]
          }
        ],
        "supports": [
          "先读题干，圈出需要寻找的信息。",
          "定位后读完整句，留意范围词和转折。"
        ],
        "lessonSteps": [
          {
            "title": "先建立词句理解",
            "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
            "example": "More clay / makes / the core harder. 更多黏土使笔芯更硬。",
            "task": "选择文中一句较长的句子，划出主语和主要动词。",
            "checklist": [
              "我能说清谁做了什么。",
              "我没有逐词硬译。"
            ]
          },
          {
            "title": "从句子读到段落",
            "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
            "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
            "task": "给每段写一个不超过十个字的标题。",
            "checklist": [
              "标题覆盖全段。",
              "标题没有只复述一个例子。"
            ]
          },
          {
            "title": "用证据检查答案",
            "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
            "example": "may 不等于 always；not required 不等于 forbidden。",
            "task": "做题后为每个答案标出支持它的句子。",
            "checklist": [
              "我能指出证据。",
              "我检查了单复数和范围。"
            ]
          }
        ],
        "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1"
      },
      {
        "stage": "bridge",
        "title": "一支铅笔的门道",
        "passage": "A. Few classroom objects seem less remarkable than a pencil. Yet its familiar form solves several separate problems. Graphite makes a clear mark but is too soft to handle conveniently on its own. Surrounding it with wood gives the user a firm grip and protects the core. The design links a material’s weakness to the need for a supporting structure.\n\nB. A second decision concerns the mark itself. Modern pencil cores combine graphite with clay. Adjusting their proportions changes the hardness: a higher proportion of clay produces a harder core. H denotes hardness and B blackness, while HB is a familiar choice for everyday writing. A grade that suits a neat set of notes may not suit an artist seeking dark shading.\n\nC. These variations challenge the idea that there is one best pencil. A useful comparison begins with the intended task, not simply the label. A student, an artist and a designer can reasonably favour different tools. This need not be disagreement about quality; it can reflect different priorities.\n\nD. Digital technology has changed many tasks, but replacement is rarely complete. Pencils remain convenient where a quick, erasable mark is needed. Their continuing use does not show that technology has failed. It suggests that people often add new tools to an existing collection, choosing according to the work in front of them.",
        "wordCount": 223,
        "glossary": [
          {
            "word": "denote",
            "meaning": "表示"
          },
          {
            "word": "priority",
            "meaning": "优先考虑的事"
          }
        ],
        "questions": [
          {
            "id": "pencil-2-0",
            "prompt": "Which paragraph explains different priorities?",
            "answers": [
              "C"
            ],
            "explanation": "C 段区分任务需求与质量判断。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "A"
              },
              {
                "value": "B",
                "label": "B"
              },
              {
                "value": "C",
                "label": "C"
              },
              {
                "value": "D",
                "label": "D"
              }
            ]
          },
          {
            "id": "pencil-2-1",
            "prompt": "A structure addresses a material’s _____.",
            "answers": [
              "weakness"
            ],
            "explanation": "A 段最后一句。",
            "dimension": "detail"
          },
          {
            "id": "pencil-2-2",
            "prompt": "Tool choice should begin with the task.",
            "answers": [
              "TRUE"
            ],
            "explanation": "C 段明确给出选择依据。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "pencil-2-3",
            "prompt": "The text gives the percentage of clay in HB pencils.",
            "answers": [
              "NOT GIVEN"
            ],
            "explanation": "没有具体百分比。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "pencil-2-4",
            "prompt": "Why mention digital tools?",
            "answers": [
              "B"
            ],
            "explanation": "D 段讨论新旧工具并存。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "To compare prices"
              },
              {
                "value": "B",
                "label": "To show tools can coexist"
              },
              {
                "value": "C",
                "label": "To reject technology"
              }
            ]
          },
          {
            "id": "pencil-2-5",
            "prompt": "Best title?",
            "answers": [
              "C"
            ],
            "explanation": "全文强调结构与选择服务于用途。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "The cheapest pencil"
              },
              {
                "value": "B",
                "label": "A history of schools"
              },
              {
                "value": "C",
                "label": "Matching a tool to its purpose"
              }
            ]
          }
        ],
        "supports": [],
        "lessonSteps": [
          {
            "title": "先建立词句理解",
            "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
            "example": "More clay / makes / the core harder. 更多黏土使笔芯更硬。",
            "task": "选择文中一句较长的句子，划出主语和主要动词。",
            "checklist": [
              "我能说清谁做了什么。",
              "我没有逐词硬译。"
            ]
          },
          {
            "title": "从句子读到段落",
            "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
            "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
            "task": "给每段写一个不超过十个字的标题。",
            "checklist": [
              "标题覆盖全段。",
              "标题没有只复述一个例子。"
            ]
          },
          {
            "title": "用证据检查答案",
            "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
            "example": "may 不等于 always；not required 不等于 forbidden。",
            "task": "做题后为每个答案标出支持它的句子。",
            "checklist": [
              "我能指出证据。",
              "我检查了单复数和范围。"
            ]
          }
        ],
        "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1"
      }
    ],
    "progression": "paragraph",
    "prerequisites": [],
    "lessonSteps": [
      {
        "title": "先建立词句理解",
        "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
        "example": "More clay / makes / the core harder. 更多黏土使笔芯更硬。",
        "task": "选择文中一句较长的句子，划出主语和主要动词。",
        "checklist": [
          "我能说清谁做了什么。",
          "我没有逐词硬译。"
        ]
      },
      {
        "title": "从句子读到段落",
        "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
        "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
        "task": "给每段写一个不超过十个字的标题。",
        "checklist": [
          "标题覆盖全段。",
          "标题没有只复述一个例子。"
        ]
      },
      {
        "title": "用证据检查答案",
        "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
        "example": "may 不等于 always；not required 不等于 forbidden。",
        "task": "做题后为每个答案标出支持它的句子。",
        "checklist": [
          "我能指出证据。",
          "我检查了单复数和范围。"
        ]
      }
    ],
    "materialFamilyId": "a83ead2d-5ef0-4db2-924d-9f59ef98d5d1"
  },
  {
    "id": "r-plants",
    "title": "植物之间的信号",
    "titleCn": "植物之间的信号",
    "originalId": "1773485843662",
    "topic": "自然科学与实验",
    "versions": [
      {
        "stage": "foundation",
        "title": "植物之间的信号",
        "passage": "Plants do not talk with words. However, some plants release chemicals when insects damage their leaves. Nearby plants can respond to these chemicals. They may become better able to protect themselves.\n\nScientists compare plants that receive a signal with plants that do not. If the groups behave differently, scientists investigate further. One result alone does not explain everything. Researchers need to repeat experiments and check other possible causes.\n\nThis work may help people grow stronger crops in the future. There are still questions about how the signals work.",
        "wordCount": 88,
        "glossary": [
          {
            "word": "release",
            "meaning": "释放"
          },
          {
            "word": "chemical",
            "meaning": "化学物质"
          },
          {
            "word": "crop",
            "meaning": "庄稼"
          }
        ],
        "questions": [
          {
            "id": "plants-0-0",
            "prompt": "What can damage the leaves?",
            "answers": [
              "insects"
            ],
            "explanation": "第一段提到 insects。",
            "dimension": "detail"
          },
          {
            "id": "plants-0-1",
            "prompt": "Plants may release _____.",
            "answers": [
              "chemicals"
            ],
            "explanation": "第一段给出信号形式。",
            "dimension": "detail"
          },
          {
            "id": "plants-0-2",
            "prompt": "Scientists compare groups of plants.",
            "answers": [
              "TRUE"
            ],
            "explanation": "第二段描述对比。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "plants-0-3",
            "prompt": "One result explains everything.",
            "answers": [
              "FALSE"
            ],
            "explanation": "第二段明确否定。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "plants-0-4",
            "prompt": "The text gives the price of stronger crops.",
            "answers": [
              "NOT GIVEN"
            ],
            "explanation": "文中没有价格。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "plants-0-5",
            "prompt": "The main topic is _____.",
            "answers": [
              "A"
            ],
            "explanation": "全文讲植物信号研究。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "plant signals"
              },
              {
                "value": "B",
                "label": "garden shops"
              },
              {
                "value": "C",
                "label": "weather reports"
              }
            ]
          }
        ],
        "supports": [
          "先读题干，圈出需要寻找的信息。",
          "定位后读完整句，留意范围词和转折。"
        ],
        "lessonSteps": [
          {
            "title": "先建立词句理解",
            "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
            "example": "A signal / may change / another plant’s response.",
            "task": "选择文中一句较长的句子，划出主语和主要动词。",
            "checklist": [
              "我能说清谁做了什么。",
              "我没有逐词硬译。"
            ]
          },
          {
            "title": "从句子读到段落",
            "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
            "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
            "task": "给每段写一个不超过十个字的标题。",
            "checklist": [
              "标题覆盖全段。",
              "标题没有只复述一个例子。"
            ]
          },
          {
            "title": "用证据检查答案",
            "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
            "example": "may 不等于 always；not required 不等于 forbidden。",
            "task": "做题后为每个答案标出支持它的句子。",
            "checklist": [
              "我能指出证据。",
              "我检查了单复数和范围。"
            ]
          }
        ],
        "materialFamilyId": "1773485843662"
      },
      {
        "stage": "supported",
        "title": "植物之间的信号",
        "passage": "A. When insects attack a plant, it may release chemicals into the air. Some neighbouring plants respond by increasing their defences. Such findings suggest that information can pass between plants without words or voices.\n\nB. Early reports attracted criticism because some experiments were difficult to repeat. Later, more carefully designed studies provided stronger evidence for chemical responses in several species.\n\nC. There is more than one possible explanation. A signal may first help undamaged parts of the same plant prepare for an attack. Neighbours may then use that signal too. Alternatively, helping related plants could offer an indirect benefit. These ideas need testing.\n\nD. Plant signals may eventually help agriculture. However, an interesting laboratory result does not automatically become a method that works in a field. Changing weather, different soils and interacting species introduce complications. Further research is needed.",
        "wordCount": 139,
        "glossary": [
          {
            "word": "defence",
            "meaning": "防御"
          },
          {
            "word": "species",
            "meaning": "物种"
          },
          {
            "word": "indirect",
            "meaning": "间接的"
          }
        ],
        "questions": [
          {
            "id": "plants-1-0",
            "prompt": "Which paragraph explains early objections?",
            "answers": [
              "B"
            ],
            "explanation": "B 段说实验难以重复。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "A"
              },
              {
                "value": "B",
                "label": "B"
              },
              {
                "value": "C",
                "label": "C"
              },
              {
                "value": "D",
                "label": "D"
              }
            ]
          },
          {
            "id": "plants-1-1",
            "prompt": "Signals may help _____ parts of the same plant.",
            "answers": [
              "undamaged"
            ],
            "explanation": "C 段第二句。",
            "dimension": "detail"
          },
          {
            "id": "plants-1-2",
            "prompt": "Later studies provided stronger evidence.",
            "answers": [
              "TRUE"
            ],
            "explanation": "B 段后半句。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "plants-1-3",
            "prompt": "All species respond in exactly the same way.",
            "answers": [
              "NOT GIVEN"
            ],
            "explanation": "文中没有说明所有物种的比较。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "plants-1-4",
            "prompt": "Why mention soils and weather?",
            "answers": [
              "C"
            ],
            "explanation": "D 段用它们说明田间应用的复杂性。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "To list prices"
              },
              {
                "value": "B",
                "label": "To reject all experiments"
              },
              {
                "value": "C",
                "label": "To show real-world complications"
              }
            ]
          },
          {
            "id": "plants-1-5",
            "prompt": "The view of agricultural uses is _____.",
            "answers": [
              "B"
            ],
            "explanation": "may eventually 与 further research 表示谨慎期待。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "certain already"
              },
              {
                "value": "B",
                "label": "hopeful but cautious"
              },
              {
                "value": "C",
                "label": "entirely negative"
              }
            ]
          }
        ],
        "supports": [
          "先读题干，圈出需要寻找的信息。",
          "定位后读完整句，留意范围词和转折。"
        ],
        "lessonSteps": [
          {
            "title": "先建立词句理解",
            "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
            "example": "A signal / may change / another plant’s response.",
            "task": "选择文中一句较长的句子，划出主语和主要动词。",
            "checklist": [
              "我能说清谁做了什么。",
              "我没有逐词硬译。"
            ]
          },
          {
            "title": "从句子读到段落",
            "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
            "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
            "task": "给每段写一个不超过十个字的标题。",
            "checklist": [
              "标题覆盖全段。",
              "标题没有只复述一个例子。"
            ]
          },
          {
            "title": "用证据检查答案",
            "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
            "example": "may 不等于 always；not required 不等于 forbidden。",
            "task": "做题后为每个答案标出支持它的句子。",
            "checklist": [
              "我能指出证据。",
              "我检查了单复数和范围。"
            ]
          }
        ],
        "materialFamilyId": "1773485843662"
      },
      {
        "stage": "bridge",
        "title": "植物之间的信号",
        "passage": "A. Describing plants as “talking” creates a memorable image, but the scientific question is more precise: can a change in one plant alter another plant’s response? Studies of damaged leaves and airborne chemicals suggest that, in some cases, it can. Nearby plants may increase their resistance to herbivores after exposure to those chemicals.\n\nB. Early findings were hard to reproduce, making it difficult to exclude alternative explanations. Later experiments used more careful comparisons and reported similar responses in several species. The change in scientific opinion was therefore connected to the quality of evidence, not simply the attractiveness of the idea.\n\nC. Even a reliable response does not settle why the signal exists. A plant may release chemicals to coordinate protection among its own leaves, while neighbours gain information incidentally. Another possibility is that benefits to related plants offer an indirect advantage to the sender. Neither explanation requires assuming that plants deliberately intend to help every neighbour.\n\nD. Researchers have also investigated signals associated with roots and fungal connections. These studies broaden the questions, but do not establish every proposed mechanism equally strongly. An explanation must account for observations and survive comparison with alternatives.\n\nE. Agricultural applications are appealing, but moving from controlled conditions to a changing field introduces additional variables. Evidence may establish a phenomenon while leaving its mechanisms and practical uses open to further investigation.",
        "wordCount": 226,
        "glossary": [
          {
            "word": "herbivore",
            "meaning": "食草动物"
          },
          {
            "word": "incidentally",
            "meaning": "附带地"
          },
          {
            "word": "variable",
            "meaning": "变量"
          }
        ],
        "questions": [
          {
            "id": "plants-2-0",
            "prompt": "Why discuss early difficulties?",
            "answers": [
              "B"
            ],
            "explanation": "B 段说明需要更有说服力的证据。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "To reject every study"
              },
              {
                "value": "B",
                "label": "To explain the need for stronger evidence"
              },
              {
                "value": "C",
                "label": "To compare costs"
              }
            ]
          },
          {
            "id": "plants-2-1",
            "prompt": "Neighbours may gain information _____.",
            "answers": [
              "incidentally"
            ],
            "explanation": "C 段直接给出该词。",
            "dimension": "detail"
          },
          {
            "id": "plants-2-2",
            "prompt": "A response proves a deliberate intention to help.",
            "answers": [
              "FALSE"
            ],
            "explanation": "C 段区分结果与意图。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "plants-2-3",
            "prompt": "Every mechanism is equally well established.",
            "answers": [
              "FALSE"
            ],
            "explanation": "D 段明确否定。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "plants-2-4",
            "prompt": "The passage reports a percentage increase in crop yield.",
            "answers": [
              "NOT GIVEN"
            ],
            "explanation": "没有产量数据。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "plants-2-5",
            "prompt": "What is the final point?",
            "answers": [
              "C"
            ],
            "explanation": "E 段强调有证据支持现象，仍可能有未解问题。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "All questions are solved"
              },
              {
                "value": "B",
                "label": "Practical work is impossible"
              },
              {
                "value": "C",
                "label": "Evidence can support a phenomenon before all questions are answered"
              }
            ]
          }
        ],
        "supports": [],
        "lessonSteps": [
          {
            "title": "先建立词句理解",
            "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
            "example": "A signal / may change / another plant’s response.",
            "task": "选择文中一句较长的句子，划出主语和主要动词。",
            "checklist": [
              "我能说清谁做了什么。",
              "我没有逐词硬译。"
            ]
          },
          {
            "title": "从句子读到段落",
            "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
            "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
            "task": "给每段写一个不超过十个字的标题。",
            "checklist": [
              "标题覆盖全段。",
              "标题没有只复述一个例子。"
            ]
          },
          {
            "title": "用证据检查答案",
            "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
            "example": "may 不等于 always；not required 不等于 forbidden。",
            "task": "做题后为每个答案标出支持它的句子。",
            "checklist": [
              "我能指出证据。",
              "我检查了单复数和范围。"
            ]
          }
        ],
        "materialFamilyId": "1773485843662"
      }
    ],
    "progression": "paragraph",
    "prerequisites": [],
    "lessonSteps": [
      {
        "title": "先建立词句理解",
        "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
        "example": "A signal / may change / another plant’s response.",
        "task": "选择文中一句较长的句子，划出主语和主要动词。",
        "checklist": [
          "我能说清谁做了什么。",
          "我没有逐词硬译。"
        ]
      },
      {
        "title": "从句子读到段落",
        "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
        "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
        "task": "给每段写一个不超过十个字的标题。",
        "checklist": [
          "标题覆盖全段。",
          "标题没有只复述一个例子。"
        ]
      },
      {
        "title": "用证据检查答案",
        "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
        "example": "may 不等于 always；not required 不等于 forbidden。",
        "task": "做题后为每个答案标出支持它的句子。",
        "checklist": [
          "我能指出证据。",
          "我检查了单复数和范围。"
        ]
      }
    ],
    "materialFamilyId": "1773485843662"
  },
  {
    "id": "r-birds",
    "title": "候鸟为什么远行",
    "titleCn": "候鸟为什么远行",
    "originalId": "7cdb3231-9f38-4b69-90a5-36543cb99e3e",
    "topic": "动物与迁徙",
    "versions": [
      {
        "stage": "foundation",
        "title": "候鸟为什么远行",
        "passage": "Many birds move to another place when food becomes difficult to find. This journey is called migration. Some birds can live in cold places if there is enough food.\n\nBefore a long flight, birds may build up fat. The fat supplies energy. Their light bodies and feathers also help them fly.\n\nSome small birds travel at night. The air is cooler and fewer daytime hunters are active. Night flight can also reduce water loss. The journey is still risky, so suitable weather matters. Scientists continue to study how birds find their way.",
        "wordCount": 92,
        "glossary": [
          {
            "word": "migration",
            "meaning": "迁徙"
          },
          {
            "word": "energy",
            "meaning": "能量"
          },
          {
            "word": "route",
            "meaning": "路线"
          }
        ],
        "questions": [
          {
            "id": "birds-0-0",
            "prompt": "What is the journey called?",
            "answers": [
              "migration"
            ],
            "explanation": "第一段第二句。",
            "dimension": "detail"
          },
          {
            "id": "birds-0-1",
            "prompt": "Fat supplies _____.",
            "answers": [
              "energy"
            ],
            "explanation": "第二段说明作用。",
            "dimension": "detail"
          },
          {
            "id": "birds-0-2",
            "prompt": "Some birds tolerate cold if food is available.",
            "answers": [
              "TRUE"
            ],
            "explanation": "第一段明确条件。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "birds-0-3",
            "prompt": "Every bird migrates at night.",
            "answers": [
              "NOT GIVEN"
            ],
            "explanation": "只说明 some small birds，未说明全部鸟类。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "birds-0-4",
            "prompt": "One benefit of night flight is _____.",
            "answers": [
              "B"
            ],
            "explanation": "第三段说空气凉爽。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "no risk"
              },
              {
                "value": "B",
                "label": "cooler air"
              },
              {
                "value": "C",
                "label": "no need for energy"
              }
            ]
          },
          {
            "id": "birds-0-5",
            "prompt": "Scientists are studying _____.",
            "answers": [
              "C"
            ],
            "explanation": "末句提出寻路问题。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "shop prices"
              },
              {
                "value": "B",
                "label": "school rules"
              },
              {
                "value": "C",
                "label": "how birds find their way"
              }
            ]
          }
        ],
        "supports": [
          "先读题干，圈出需要寻找的信息。",
          "定位后读完整句，留意范围词和转折。"
        ],
        "lessonSteps": [
          {
            "title": "先建立词句理解",
            "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
            "example": "Stored fat / supplies / energy during flight.",
            "task": "选择文中一句较长的句子，划出主语和主要动词。",
            "checklist": [
              "我能说清谁做了什么。",
              "我没有逐词硬译。"
            ]
          },
          {
            "title": "从句子读到段落",
            "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
            "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
            "task": "给每段写一个不超过十个字的标题。",
            "checklist": [
              "标题覆盖全段。",
              "标题没有只复述一个例子。"
            ]
          },
          {
            "title": "用证据检查答案",
            "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
            "example": "may 不等于 always；not required 不等于 forbidden。",
            "task": "做题后为每个答案标出支持它的句子。",
            "checklist": [
              "我能指出证据。",
              "我检查了单复数和范围。"
            ]
          }
        ],
        "materialFamilyId": "7cdb3231-9f38-4b69-90a5-36543cb99e3e"
      },
      {
        "stage": "supported",
        "title": "候鸟为什么远行",
        "passage": "A. A shortage of food is a major reason for bird migration. Northern breeding areas can offer plenty of food during warmer months. When that supply decreases, moving elsewhere can improve survival. Low temperature alone does not explain every journey: many birds tolerate cold if enough food remains available.\n\nB. Long flights need fuel. Before migration, birds accumulate fat when food is plentiful. Stored energy supports them during the journey. Light bones reduce weight, while feathers provide lift and protection.\n\nC. Many small birds migrate at night. Cooler air reduces water loss, and travelling after dark helps avoid predators that hunt during the day. Night air may also be calmer.\n\nD. Questions remain. Some birds travel farther than seems necessary to find food. Young birds may reach seasonal destinations without their parents. Researchers study the cues birds use, but describing a route does not explain every part of navigation.",
        "wordCount": 149,
        "glossary": [
          {
            "word": "shortage",
            "meaning": "短缺"
          },
          {
            "word": "accumulate",
            "meaning": "积累"
          },
          {
            "word": "predator",
            "meaning": "捕食者"
          }
        ],
        "questions": [
          {
            "id": "birds-1-0",
            "prompt": "Which paragraph discusses stored fuel?",
            "answers": [
              "B"
            ],
            "explanation": "B 段讨论 fat 与 energy。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "A"
              },
              {
                "value": "B",
                "label": "B"
              },
              {
                "value": "C",
                "label": "C"
              },
              {
                "value": "D",
                "label": "D"
              }
            ]
          },
          {
            "id": "birds-1-1",
            "prompt": "Light bones reduce _____.",
            "answers": [
              "weight"
            ],
            "explanation": "B 段最后一句。",
            "dimension": "detail"
          },
          {
            "id": "birds-1-2",
            "prompt": "Cold is the only reason for migration.",
            "answers": [
              "FALSE"
            ],
            "explanation": "A 段否定 temperature alone。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "birds-1-3",
            "prompt": "Night flight can help avoid daytime hunters.",
            "answers": [
              "TRUE"
            ],
            "explanation": "C 段描述优势。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "birds-1-4",
            "prompt": "The text gives the age when young birds first migrate.",
            "answers": [
              "NOT GIVEN"
            ],
            "explanation": "没有具体年龄。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "birds-1-5",
            "prompt": "Why mention longer-than-necessary journeys?",
            "answers": [
              "A"
            ],
            "explanation": "D 段用它说明仍有问题。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "To identify an unresolved question"
              },
              {
                "value": "B",
                "label": "To prove migration is impossible"
              },
              {
                "value": "C",
                "label": "To give a cheaper route"
              }
            ]
          }
        ],
        "supports": [
          "先读题干，圈出需要寻找的信息。",
          "定位后读完整句，留意范围词和转折。"
        ],
        "lessonSteps": [
          {
            "title": "先建立词句理解",
            "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
            "example": "Stored fat / supplies / energy during flight.",
            "task": "选择文中一句较长的句子，划出主语和主要动词。",
            "checklist": [
              "我能说清谁做了什么。",
              "我没有逐词硬译。"
            ]
          },
          {
            "title": "从句子读到段落",
            "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
            "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
            "task": "给每段写一个不超过十个字的标题。",
            "checklist": [
              "标题覆盖全段。",
              "标题没有只复述一个例子。"
            ]
          },
          {
            "title": "用证据检查答案",
            "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
            "example": "may 不等于 always；not required 不等于 forbidden。",
            "task": "做题后为每个答案标出支持它的句子。",
            "checklist": [
              "我能指出证据。",
              "我检查了单复数和范围。"
            ]
          }
        ],
        "materialFamilyId": "7cdb3231-9f38-4b69-90a5-36543cb99e3e"
      },
      {
        "stage": "bridge",
        "title": "候鸟为什么远行",
        "passage": "A. Bird migration is often presented as a response to winter cold. That account is convenient but incomplete. Access to food is a central concern: some species endure low temperatures while adequate food remains available. Travel must therefore be considered in relation to resources, not temperature alone.\n\nB. Successful migration depends on preparation as well as direction. Birds can build reserves of fat before travelling. Stored energy supports sustained flight, while physical adaptations reduce the demands of the journey. A capacity for long-distance flight does not, however, explain why a particular destination is chosen.\n\nC. Timing introduces further decisions. Many small birds migrate at night, benefiting from cooler, often calmer air and reduced exposure to daytime predators. These advantages do not remove every hazard; they make certain risks smaller. Weather and suitable winds still influence departure.\n\nD. Navigation is equally complex. Researchers investigate celestial cues and the earth’s magnetic field. Identifying a cue is different from fully explaining how an animal combines information about direction, position and time. Young birds reaching destinations without parental guidance make this distinction especially interesting.\n\nE. Some routes appear longer than the minimum needed to reach suitable conditions. Such observations warn against treating one explanation as a complete account. Food, inherited tendencies, navigation and weather may all matter. Understanding grows when a general explanation is tested against details that it does not yet explain.",
        "wordCount": 229,
        "glossary": [
          {
            "word": "endure",
            "meaning": "承受"
          },
          {
            "word": "celestial",
            "meaning": "天体的"
          },
          {
            "word": "hazard",
            "meaning": "危险"
          }
        ],
        "questions": [
          {
            "id": "birds-2-0",
            "prompt": "What is the limitation of the common account?",
            "answers": [
              "B"
            ],
            "explanation": "A 段说只考虑温度不完整。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "It ignores every journey"
              },
              {
                "value": "B",
                "label": "It focuses too narrowly on temperature"
              },
              {
                "value": "C",
                "label": "It gives too much food"
              }
            ]
          },
          {
            "id": "birds-2-1",
            "prompt": "Birds build _____ of fat.",
            "answers": [
              "reserves"
            ],
            "explanation": "B 段第二句。",
            "dimension": "detail"
          },
          {
            "id": "birds-2-2",
            "prompt": "Flight ability fully explains destination choice.",
            "answers": [
              "FALSE"
            ],
            "explanation": "B 段最后一句否定。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "birds-2-3",
            "prompt": "Night flight eliminates all danger.",
            "answers": [
              "FALSE"
            ],
            "explanation": "C 段区分降低风险与消除风险。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "birds-2-4",
            "prompt": "Magnetic cues are ranked above celestial cues.",
            "answers": [
              "NOT GIVEN"
            ],
            "explanation": "D 段没有给两者排序。",
            "dimension": "detail",
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
            ]
          },
          {
            "id": "birds-2-5",
            "prompt": "The central argument is _____.",
            "answers": [
              "C"
            ],
            "explanation": "全文强调需要多个因素解释。",
            "dimension": "detail",
            "options": [
              {
                "value": "A",
                "label": "all routes follow one rule"
              },
              {
                "value": "B",
                "label": "research is complete"
              },
              {
                "value": "C",
                "label": "general explanations need testing against complex details"
              }
            ]
          }
        ],
        "supports": [],
        "lessonSteps": [
          {
            "title": "先建立词句理解",
            "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
            "example": "Stored fat / supplies / energy during flight.",
            "task": "选择文中一句较长的句子，划出主语和主要动词。",
            "checklist": [
              "我能说清谁做了什么。",
              "我没有逐词硬译。"
            ]
          },
          {
            "title": "从句子读到段落",
            "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
            "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
            "task": "给每段写一个不超过十个字的标题。",
            "checklist": [
              "标题覆盖全段。",
              "标题没有只复述一个例子。"
            ]
          },
          {
            "title": "用证据检查答案",
            "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
            "example": "may 不等于 always；not required 不等于 forbidden。",
            "task": "做题后为每个答案标出支持它的句子。",
            "checklist": [
              "我能指出证据。",
              "我检查了单复数和范围。"
            ]
          }
        ],
        "materialFamilyId": "7cdb3231-9f38-4b69-90a5-36543cb99e3e"
      }
    ],
    "progression": "paragraph",
    "prerequisites": [],
    "lessonSteps": [
      {
        "title": "先建立词句理解",
        "explanation": "先判断句子的主语、动作和对象，再处理修饰内容。",
        "example": "Stored fat / supplies / energy during flight.",
        "task": "选择文中一句较长的句子，划出主语和主要动词。",
        "checklist": [
          "我能说清谁做了什么。",
          "我没有逐词硬译。"
        ]
      },
      {
        "title": "从句子读到段落",
        "explanation": "段落中的例子通常服务于同一个中心。先给每段写短标题，再做题。",
        "example": "观点 → 解释 → 例子；看到 however 要检查重点是否转向。",
        "task": "给每段写一个不超过十个字的标题。",
        "checklist": [
          "标题覆盖全段。",
          "标题没有只复述一个例子。"
        ]
      },
      {
        "title": "用证据检查答案",
        "explanation": "正确答案应与原文信息一致；没有证据时不能凭常识补充。",
        "example": "may 不等于 always；not required 不等于 forbidden。",
        "task": "做题后为每个答案标出支持它的句子。",
        "checklist": [
          "我能指出证据。",
          "我检查了单复数和范围。"
        ]
      }
    ],
    "materialFamilyId": "7cdb3231-9f38-4b69-90a5-36543cb99e3e"
  }
];

export const writingUnits = [
  {
    "id": "w1",
    "title": "把一天写成完整句",
    "stage": "foundation",
    "progression": "sentence",
    "levelIndex": 1,
    "prerequisites": [],
    "minutes": 10,
    "wordTarget": {
      "min": 40,
      "max": 70
    },
    "prompt": "Write five to seven sentences about a normal school day. Include a time, a place and one activity you enjoy.",
    "promptCn": "用五至七个完整句子描述平常的一天，写出时间、地点和喜欢的活动。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [
      "a quiet place; concentrate on; after lunch",
      "每段只推进一个核心观点。"
    ],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "谁",
        "text": "先写明确的主语。"
      },
      {
        "label": "做什么",
        "text": "用正确的动词表达动作或状态。"
      },
      {
        "label": "补充信息",
        "text": "再补时间、地点或一个原因。"
      }
    ],
    "modelParagraph": "I usually read in the library after lunch. The room is quiet, so I can concentrate on a short chapter.",
    "modelTranslation": "我通常午饭后在图书馆阅读。那里很安静，所以我能专心读一个短章节。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "用五至七个完整句子描述平常的一天，写出时间、地点和喜欢的活动。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "a quiet place; concentrate on; after lunch",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "把一个意思写完整",
        "explanation": "每句先表达一个清楚的意思。检查主语和动词后，再加时间、地点或原因；这一阶段不要求套整篇论证结构。",
        "example": "I usually read in the library after lunch. The room is quiet, so I can concentrate on a short chapter.",
        "task": "把自己的两个短句各补充一个有用细节。",
        "checklist": [
          "句子有主语和动词。",
          "新增细节与原意相关。",
          "没有把两个完整句只用逗号连接。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "我通常午饭后在图书馆阅读。那里很安静，所以我能专心读一个短章节。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w2",
    "title": "给观点加上原因",
    "stage": "foundation",
    "progression": "sentence",
    "levelIndex": 2,
    "prerequisites": [
      "w1"
    ],
    "minutes": 12,
    "wordTarget": {
      "min": 50,
      "max": 90
    },
    "prompt": "Which school club would you recommend to a new student? Give two reasons.",
    "promptCn": "推荐一个社团并说明两个原因。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [
      "recommend a club; test an idea; compare results",
      "每段只推进一个核心观点。"
    ],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "谁",
        "text": "先写明确的主语。"
      },
      {
        "label": "做什么",
        "text": "用正确的动词表达动作或状态。"
      },
      {
        "label": "补充信息",
        "text": "再补时间、地点或一个原因。"
      }
    ],
    "modelParagraph": "I would recommend the science club because members can test their own ideas. Last week, we compared two simple water filters and discussed why their results differed.",
    "modelTranslation": "我会推荐科学社，因为成员可以检验自己的想法。上周我们比较了两种简易滤水器，并讨论结果不同的原因。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "推荐一个社团并说明两个原因。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "recommend a club; test an idea; compare results",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "把一个意思写完整",
        "explanation": "每句先表达一个清楚的意思。检查主语和动词后，再加时间、地点或原因；这一阶段不要求套整篇论证结构。",
        "example": "I would recommend the science club because members can test their own ideas. Last week, we compared two simple water filters and discussed why their results differed.",
        "task": "把自己的两个短句各补充一个有用细节。",
        "checklist": [
          "句子有主语和动词。",
          "新增细节与原意相关。",
          "没有把两个完整句只用逗号连接。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "我会推荐科学社，因为成员可以检验自己的想法。上周我们比较了两种简易滤水器，并讨论结果不同的原因。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w3",
    "title": "把两个选择写清楚",
    "stage": "foundation",
    "progression": "sentence",
    "levelIndex": 3,
    "prerequisites": [
      "w2"
    ],
    "minutes": 12,
    "wordTarget": {
      "min": 60,
      "max": 100
    },
    "prompt": "Compare studying alone with studying with a friend. Give one advantage of each and say which you prefer for a difficult task.",
    "promptCn": "比较独自学习与结伴学习，各写一个优点，并说明处理难题时的选择。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [
      "at my own pace; explain a step; by contrast",
      "每段只推进一个核心观点。"
    ],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "谁",
        "text": "先写明确的主语。"
      },
      {
        "label": "做什么",
        "text": "用正确的动词表达动作或状态。"
      },
      {
        "label": "补充信息",
        "text": "再补时间、地点或一个原因。"
      }
    ],
    "modelParagraph": "Studying alone allows me to work at my own pace. However, a friend can explain a difficult step in a different way, which is useful when I am stuck.",
    "modelTranslation": "独自学习让我按自己的速度推进。不过，朋友能用另一种方式解释难点，这在我卡住时很有帮助。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "比较独自学习与结伴学习，各写一个优点，并说明处理难题时的选择。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "at my own pace; explain a step; by contrast",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "把一个意思写完整",
        "explanation": "每句先表达一个清楚的意思。检查主语和动词后，再加时间、地点或原因；这一阶段不要求套整篇论证结构。",
        "example": "Studying alone allows me to work at my own pace. However, a friend can explain a difficult step in a different way, which is useful when I am stuck.",
        "task": "把自己的两个短句各补充一个有用细节。",
        "checklist": [
          "句子有主语和动词。",
          "新增细节与原意相关。",
          "没有把两个完整句只用逗号连接。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "独自学习让我按自己的速度推进。不过，朋友能用另一种方式解释难点，这在我卡住时很有帮助。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w4",
    "title": "围绕一个中心写段落",
    "stage": "supported",
    "progression": "paragraph",
    "levelIndex": 4,
    "prerequisites": [
      "w3"
    ],
    "minutes": 18,
    "wordTarget": {
      "min": 100,
      "max": 140
    },
    "prompt": "Should students have a short reading period every school day? Write one paragraph with a view, a reason and an example.",
    "promptCn": "学校是否应该每天安排短时阅读？围绕一个观点写段落，包含原因与例子。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [
      "build a habit; reserve time; regular practice",
      "每段只推进一个核心观点。"
    ],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "中心",
        "text": "用一句话说明这一段的观点。"
      },
      {
        "label": "理由",
        "text": "解释为什么这么说。"
      },
      {
        "label": "例子",
        "text": "给出一个能说明理由的具体场景。"
      }
    ],
    "modelParagraph": "A short daily reading period can help students build a stable reading habit. When time is reserved in the timetable, reading is less likely to be displaced by other tasks. For example, ten minutes after lunch gives students a predictable opportunity to continue a book. The main benefit is therefore regular practice, rather than the number of pages finished in one session.",
    "modelTranslation": "每日短时阅读能帮助学生形成稳定习惯。课表中有固定时间，阅读就不容易被其他任务挤掉。例如午饭后的十分钟让学生有规律地继续读书。因此，主要收益是持续练习，而非一次读完多少页。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "学校是否应该每天安排短时阅读？围绕一个观点写段落，包含原因与例子。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "build a habit; reserve time; regular practice",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "让三部分围绕同一个中心",
        "explanation": "先写观点，再解释原因，最后给具体例子；每句话都应帮助读者理解同一个意思。",
        "example": "A short daily reading period can help students build a stable reading habit. When time is reserved in the timetable, reading is less likely to be displaced by other tasks. For example, ten minutes after lunch gives students a predictable opportunity to continue a book. The main benefit is therefore regular practice, rather than the number of pages finished in one session.",
        "task": "把段落中的观点、理由、例子分别标出来。",
        "checklist": [
          "段落只有一个重点。",
          "例子确实说明前面的理由。",
          "没有反复改写同一句观点。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "每日短时阅读能帮助学生形成稳定习惯。课表中有固定时间，阅读就不容易被其他任务挤掉。例如午饭后的十分钟让学生有规律地继续读书。因此，主要收益是持续练习，而非一次读完多少页。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w5",
    "title": "把笼统例子变具体",
    "stage": "supported",
    "progression": "paragraph",
    "levelIndex": 5,
    "prerequisites": [
      "w4"
    ],
    "minutes": 18,
    "wordTarget": {
      "min": 100,
      "max": 150
    },
    "prompt": "Develop this idea into a paragraph: “Team projects help students communicate.” Explain one mechanism and give a specific school example.",
    "promptCn": "围绕“团队项目帮助学生沟通”写一段，解释过程并举具体例子。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [
      "explain a choice; support a suggestion; make reasoning clear",
      "每段只推进一个核心观点。"
    ],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "中心",
        "text": "用一句话说明这一段的观点。"
      },
      {
        "label": "理由",
        "text": "解释为什么这么说。"
      },
      {
        "label": "例子",
        "text": "给出一个能说明理由的具体场景。"
      }
    ],
    "modelParagraph": "Team projects create a reason for students to explain their choices clearly. When group members disagree, they have to describe the evidence behind a suggestion instead of simply stating a preference. For instance, a group preparing a science display may compare two layouts by considering which one visitors can follow more easily. This discussion gives students practice in making their reasoning understandable to others.",
    "modelTranslation": "团队项目让学生有必要把选择说清楚。意见不同时，他们需要说明建议背后的依据，而非只说个人喜好。例如制作科学展板的小组可根据观众是否容易看懂来比较两种布局。这样的讨论让学生练习向别人解释推理。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "围绕“团队项目帮助学生沟通”写一段，解释过程并举具体例子。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "explain a choice; support a suggestion; make reasoning clear",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "让三部分围绕同一个中心",
        "explanation": "先写观点，再解释原因，最后给具体例子；每句话都应帮助读者理解同一个意思。",
        "example": "Team projects create a reason for students to explain their choices clearly. When group members disagree, they have to describe the evidence behind a suggestion instead of simply stating a preference. For instance, a group preparing a science display may compare two layouts by considering which one visitors can follow more easily. This discussion gives students practice in making their reasoning understandable to others.",
        "task": "把段落中的观点、理由、例子分别标出来。",
        "checklist": [
          "段落只有一个重点。",
          "例子确实说明前面的理由。",
          "没有反复改写同一句观点。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "团队项目让学生有必要把选择说清楚。意见不同时，他们需要说明建议背后的依据，而非只说个人喜好。例如制作科学展板的小组可根据观众是否容易看懂来比较两种布局。这样的讨论让学生练习向别人解释推理。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w6",
    "title": "根据数据写概述",
    "stage": "supported",
    "progression": "paragraph",
    "levelIndex": 6,
    "prerequisites": [
      "w5"
    ],
    "minutes": 20,
    "wordTarget": {
      "min": 100,
      "max": 150
    },
    "prompt": "A class survey recorded travel to school. Walking: September 12, October 18, November 20. Cycling: 10, 12, 15. Bus: 18, 10, 5. Summarise the main changes and compare the figures.",
    "promptCn": "根据给定的虚构班级数据，概述步行、骑行、公交人数的变化，不猜测原因。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [
      "rose from … to …; in contrast; increased gradually",
      "每段只推进一个核心观点。"
    ],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "总体",
        "text": "先选最大变化、共同趋势与例外。"
      },
      {
        "label": "比较",
        "text": "选择有意义的组别作比较。"
      },
      {
        "label": "证据",
        "text": "用准确数字支持概述；不添加原因。"
      }
    ],
    "modelParagraph": "Overall, walking and cycling became more common, while bus use declined. Walking rose from 12 to 20 students, making it the most common option in November. In contrast, the number taking a bus fell from 18 to 5. Cycling increased more gradually, reaching 15 at the end of the period.",
    "modelTranslation": "总体上，步行和骑行更常见，公交使用减少。步行人数从12增至20，成为11月最常见的方式。相反，公交人数从18降至5。骑行增长更缓，期末达到15人。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "根据给定的虚构班级数据，概述步行、骑行、公交人数的变化，不猜测原因。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "rose from … to …; in contrast; increased gradually",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "推进一条逻辑链",
        "explanation": "先概述整体特征，再用关键数字比较。数据报告不编造原因。",
        "example": "Overall, walking and cycling became more common, while bus use declined. Walking rose from 12 to 20 students, making it the most common option in November. In contrast, the number taking a bus fell from 18 to 5. Cycling increased more gradually, reaching 15 at the end of the period.",
        "task": "先写一段并标出每句承担的作用。",
        "checklist": [
          "一段只有一个核心。",
          "相邻两句存在明确关系。",
          "例子或数字支持中心。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "总体上，步行和骑行更常见，公交使用减少。步行人数从12增至20，成为11月最常见的方式。相反，公交人数从18降至5。骑行增长更缓，期末达到15人。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w7",
    "title": "从原因推到结果",
    "stage": "bridge",
    "progression": "reasoning",
    "levelIndex": 7,
    "prerequisites": [
      "w6"
    ],
    "minutes": 25,
    "wordTarget": {
      "min": 180,
      "max": 230
    },
    "prompt": "Students sometimes lose concentration while studying at home. Explain two possible causes and suggest practical solutions.",
    "promptCn": "分析居家学习分心的两个可能原因，给出对应且可行的措施。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [
      "interrupt attention; recall a step; reduce a source of distraction",
      "每段只推进一个核心观点。"
    ],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "观点",
        "text": "用一句话直接回答任务中的问题。"
      },
      {
        "label": "机制",
        "text": "解释这件事怎样影响学习者或场景。"
      },
      {
        "label": "结果",
        "text": "指出由这个过程带来的具体变化。"
      },
      {
        "label": "例子",
        "text": "用一次可理解的校园场景说明过程。"
      },
      {
        "label": "回扣",
        "text": "说明这为什么支持本段观点，不引入新论点。"
      }
    ],
    "modelParagraph": "Frequent notifications can interrupt a student before a difficult idea is fully understood. Each interruption creates a need to recall the previous step, which can make a short task take much longer. Keeping the phone outside the study area for a planned period reduces this source of interruption. The purpose is to protect attention during the task, rather than to reject technology altogether.",
    "modelTranslation": "频繁通知可能打断学生理解难点。每次中断后都要回想前一步，使短任务耗时变长。按计划在一段时间内把手机放到学习区域外，可减少这种打断。目的在于保护做题时的注意力，而非全盘排斥技术。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "分析居家学习分心的两个可能原因，给出对应且可行的措施。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "interrupt attention; recall a step; reduce a source of distraction",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "推进一条逻辑链",
        "explanation": "观点之后回答“为什么、怎么发生、带来什么结果”。例子必须说明这一过程。",
        "example": "Frequent notifications can interrupt a student before a difficult idea is fully understood. Each interruption creates a need to recall the previous step, which can make a short task take much longer. Keeping the phone outside the study area for a planned period reduces this source of interruption. The purpose is to protect attention during the task, rather than to reject technology altogether.",
        "task": "先写一段并标出每句承担的作用。",
        "checklist": [
          "一段只有一个核心。",
          "相邻两句存在明确关系。",
          "例子或数字支持中心。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "频繁通知可能打断学生理解难点。每次中断后都要回想前一步，使短任务耗时变长。按计划在一段时间内把手机放到学习区域外，可减少这种打断。目的在于保护做题时的注意力，而非全盘排斥技术。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w8",
    "title": "回应不同意见",
    "stage": "bridge",
    "progression": "reasoning",
    "levelIndex": 8,
    "prerequisites": [
      "w7"
    ],
    "minutes": 25,
    "wordTarget": {
      "min": 180,
      "max": 230
    },
    "prompt": "Discuss one strength of digital textbooks and one strength of printed books. Explain which you would choose for daily study.",
    "promptCn": "讨论电子与纸质教材各一个优点，并说明日常学习的选择。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [
      "search for a term; stay focused; depend on the task",
      "每段只推进一个核心观点。"
    ],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "观点",
        "text": "用一句话直接回答任务中的问题。"
      },
      {
        "label": "机制",
        "text": "解释这件事怎样影响学习者或场景。"
      },
      {
        "label": "结果",
        "text": "指出由这个过程带来的具体变化。"
      },
      {
        "label": "例子",
        "text": "用一次可理解的校园场景说明过程。"
      },
      {
        "label": "回扣",
        "text": "说明这为什么支持本段观点，不引入新论点。"
      }
    ],
    "modelParagraph": "Digital textbooks make it easier to search for a term and carry several subjects on one device. This is useful when a student needs to check information quickly. Printed books, however, do not share a screen with messages and other applications. For a long reading task, that simpler environment may help a learner stay focused. The better choice depends partly on the task and the learner’s habits.",
    "modelTranslation": "电子教材便于搜索术语，也能在一台设备中携带多门教材，适合快速查找信息。但纸质书不会与消息和应用共用屏幕，较简单的环境可能有助于长时间阅读。因此选择部分取决于任务与学习习惯。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "讨论电子与纸质教材各一个优点，并说明日常学习的选择。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "search for a term; stay focused; depend on the task",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "推进一条逻辑链",
        "explanation": "观点之后回答“为什么、怎么发生、带来什么结果”。例子必须说明这一过程。",
        "example": "Digital textbooks make it easier to search for a term and carry several subjects on one device. This is useful when a student needs to check information quickly. Printed books, however, do not share a screen with messages and other applications. For a long reading task, that simpler environment may help a learner stay focused. The better choice depends partly on the task and the learner’s habits.",
        "task": "先写一段并标出每句承担的作用。",
        "checklist": [
          "一段只有一个核心。",
          "相邻两句存在明确关系。",
          "例子或数字支持中心。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "电子教材便于搜索术语，也能在一台设备中携带多门教材，适合快速查找信息。但纸质书不会与消息和应用共用屏幕，较简单的环境可能有助于长时间阅读。因此选择部分取决于任务与学习习惯。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w9",
    "title": "完成一篇数据报告",
    "stage": "bridge",
    "progression": "fulltask",
    "levelIndex": 9,
    "prerequisites": [
      "w8"
    ],
    "minutes": 25,
    "wordTarget": {
      "min": 150,
      "max": 190
    },
    "prompt": "A school recorded club membership in 2023 and 2025. Sports: 80 and 95; music: 60 and 70; science: 40 and 90; art: 50 and 45. Summarise the main features and make comparisons.",
    "promptCn": "概述虚构学校的社团人数数据。至少150词，选择主要特点并作比较。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [
      "the largest increase; more than double; narrow the gap",
      "每段只推进一个核心观点。"
    ],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "总体",
        "text": "先选最大变化、共同趋势与例外。"
      },
      {
        "label": "比较",
        "text": "选择有意义的组别作比较。"
      },
      {
        "label": "证据",
        "text": "用准确数字支持概述；不添加原因。"
      }
    ],
    "modelParagraph": "The science club showed the largest increase, more than doubling from 40 to 90 members. Although sports remained the largest club, its lead over science narrowed substantially. Art was the only category to decline, falling by five members.",
    "modelTranslation": "科学社增长最多，从40人增至90人，超过翻倍。体育社仍最大，但领先科学社的差距大幅缩小。艺术社是唯一下降的类别，减少5人。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "概述虚构学校的社团人数数据。至少150词，选择主要特点并作比较。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "the largest increase; more than double; narrow the gap",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "推进一条逻辑链",
        "explanation": "先概述整体特征，再用关键数字比较。数据报告不编造原因。",
        "example": "The science club showed the largest increase, more than doubling from 40 to 90 members. Although sports remained the largest club, its lead over science narrowed substantially. Art was the only category to decline, falling by five members.",
        "task": "先写一段并标出每句承担的作用。",
        "checklist": [
          "一段只有一个核心。",
          "相邻两句存在明确关系。",
          "例子或数字支持中心。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "科学社增长最多，从40人增至90人，超过翻倍。体育社仍最大，但领先科学社的差距大幅缩小。艺术社是唯一下降的类别，减少5人。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w10",
    "title": "独立完成双边讨论",
    "stage": "independent",
    "progression": "fulltask",
    "levelIndex": 10,
    "prerequisites": [
      "w9"
    ],
    "minutes": 40,
    "wordTarget": {
      "min": 250,
      "max": 330
    },
    "prompt": "Some people think secondary schools should devote more time to practical skills, while others believe academic subjects should remain the main focus. Discuss both views and give your own opinion.",
    "promptCn": "有人主张中学增加实用技能教学，有人主张以学术学科为主。讨论双方并表达立场，至少250词。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "观点",
        "text": "用一句话直接回答任务中的问题。"
      },
      {
        "label": "机制",
        "text": "解释这件事怎样影响学习者或场景。"
      },
      {
        "label": "结果",
        "text": "指出由这个过程带来的具体变化。"
      },
      {
        "label": "例子",
        "text": "用一次可理解的校园场景说明过程。"
      },
      {
        "label": "回扣",
        "text": "说明这为什么支持本段观点，不引入新论点。"
      }
    ],
    "modelParagraph": "Practical tasks can make academic ideas easier to apply. For example, planning a small school event requires students to use mathematics when estimating costs. However, the task becomes more valuable when students understand the principles behind their calculations. Practical activities should therefore complement systematic subject learning, rather than replace it entirely.",
    "modelTranslation": "实践任务能帮助应用学科知识。例如筹划小型校园活动时，学生要用数学估算成本。不过，理解计算原理能让任务更有学习价值。因此实践活动应补充系统的学科学习，而非完全取代。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "有人主张中学增加实用技能教学，有人主张以学术学科为主。讨论双方并表达立场，至少250词。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "apply an idea; estimate costs; complement learning",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "推进一条逻辑链",
        "explanation": "观点之后回答“为什么、怎么发生、带来什么结果”。例子必须说明这一过程。",
        "example": "Practical tasks can make academic ideas easier to apply. For example, planning a small school event requires students to use mathematics when estimating costs. However, the task becomes more valuable when students understand the principles behind their calculations. Practical activities should therefore complement systematic subject learning, rather than replace it entirely.",
        "task": "先写一段并标出每句承担的作用。",
        "checklist": [
          "一段只有一个核心。",
          "相邻两句存在明确关系。",
          "例子或数字支持中心。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "实践任务能帮助应用学科知识。例如筹划小型校园活动时，学生要用数学估算成本。不过，理解计算原理能让任务更有学习价值。因此实践活动应补充系统的学科学习，而非完全取代。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w11",
    "title": "论证学习计划的边界",
    "stage": "independent",
    "progression": "fulltask",
    "levelIndex": 11,
    "prerequisites": [
      "w10"
    ],
    "minutes": 40,
    "wordTarget": {
      "min": 250,
      "max": 330
    },
    "prompt": "Some people believe students should be fully responsible for planning their study, while others think schools should provide a fixed plan. Discuss both views and give your opinion.",
    "promptCn": "讨论学生自主规划与学校固定计划的作用，表达立场，至少250词。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "观点",
        "text": "用一句话直接回答任务中的问题。"
      },
      {
        "label": "机制",
        "text": "解释这件事怎样影响学习者或场景。"
      },
      {
        "label": "结果",
        "text": "指出由这个过程带来的具体变化。"
      },
      {
        "label": "例子",
        "text": "用一次可理解的校园场景说明过程。"
      },
      {
        "label": "回扣",
        "text": "说明这为什么支持本段观点，不引入新论点。"
      }
    ],
    "modelParagraph": "A fixed plan can provide a useful starting point for students who have little experience of organising their work. Clear priorities reduce the time spent deciding what to do next. As learners become more capable of evaluating their progress, however, some flexibility allows them to spend longer on genuine weaknesses. Support can therefore change with demonstrated skills rather than being removed at a particular age.",
    "modelTranslation": "固定计划可为缺乏安排学习经验的学生提供起点，明确优先事项减少反复决定下一步的时间。但学生逐渐能评估进度后，灵活性有助于把时间放到真实薄弱处。因此支持应随已表现出的能力调整，而不是到某个年龄就取消。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "讨论学生自主规划与学校固定计划的作用，表达立场，至少250词。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "set priorities; evaluate progress; demonstrated skills",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "推进一条逻辑链",
        "explanation": "观点之后回答“为什么、怎么发生、带来什么结果”。例子必须说明这一过程。",
        "example": "A fixed plan can provide a useful starting point for students who have little experience of organising their work. Clear priorities reduce the time spent deciding what to do next. As learners become more capable of evaluating their progress, however, some flexibility allows them to spend longer on genuine weaknesses. Support can therefore change with demonstrated skills rather than being removed at a particular age.",
        "task": "先写一段并标出每句承担的作用。",
        "checklist": [
          "一段只有一个核心。",
          "相邻两句存在明确关系。",
          "例子或数字支持中心。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "固定计划可为缺乏安排学习经验的学生提供起点，明确优先事项减少反复决定下一步的时间。但学生逐渐能评估进度后，灵活性有助于把时间放到真实薄弱处。因此支持应随已表现出的能力调整，而不是到某个年龄就取消。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  },
  {
    "id": "w12",
    "title": "判断利是否大于弊",
    "stage": "independent",
    "progression": "fulltask",
    "levelIndex": 12,
    "prerequisites": [
      "w11"
    ],
    "minutes": 40,
    "wordTarget": {
      "min": 250,
      "max": 330
    },
    "prompt": "Some schools encourage all students to take part in community service. Do the advantages of this approach outweigh the disadvantages?",
    "promptCn": "学校鼓励所有学生参与社区服务。利是否大于弊？至少250词。",
    "instructions": [
      "先审题，再列结构，完成初稿后修改。",
      "范例只展示一种写法，请写自己的内容。",
      "正式计时写作时收起提示。"
    ],
    "scaffold": [],
    "rubric": [
      {
        "name": "任务回应",
        "description": "回应全部问题，观点明确，用相关细节展开。"
      },
      {
        "name": "组织衔接",
        "description": "每段一个重点，因果和转折清楚。"
      },
      {
        "name": "词汇运用",
        "description": "搭配准确；能改述，不靠堆砌难词。"
      },
      {
        "name": "句子与语法",
        "description": "主谓、时态和标点准确，句式服务于表达。"
      }
    ],
    "logicChain": [
      {
        "label": "观点",
        "text": "用一句话直接回答任务中的问题。"
      },
      {
        "label": "机制",
        "text": "解释这件事怎样影响学习者或场景。"
      },
      {
        "label": "结果",
        "text": "指出由这个过程带来的具体变化。"
      },
      {
        "label": "例子",
        "text": "用一次可理解的校园场景说明过程。"
      },
      {
        "label": "回扣",
        "text": "说明这为什么支持本段观点，不引入新论点。"
      }
    ],
    "modelParagraph": "Community service can give students a clearer understanding of needs outside their usual routines. Its value depends, however, on the work being meaningful and manageable. A short, well-organised project with a clear purpose may teach more than a long activity completed only to record hours. Schools should therefore consider the quality of participation as well as its duration.",
    "modelTranslation": "社区服务能帮助学生了解日常生活以外的需求，但价值取决于任务是否有意义且可承担。目标明确、组织良好的短项目，可能比只为累计时数的长活动更有教育意义。因此学校应同时考虑参与质量与时长。",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "圈出话题、要求和限制。先决定要回答什么，不急着找难词。",
        "example": "学校鼓励所有学生参与社区服务。利是否大于弊？至少250词。",
        "task": "写下这道题必须回答的两至三个点。",
        "checklist": [
          "覆盖全部要求。",
          "没有写成相近但不同的话题。"
        ]
      },
      {
        "title": "从词块到完整句",
        "explanation": "先用准确的词块搭配，再写有主语和动词的完整句。",
        "example": "meet a need; meaningful participation; a clear purpose",
        "task": "选择两个词块，各写一句与题目相关的句子。",
        "checklist": [
          "搭配符合原意。",
          "主语、动词和时态完整。"
        ]
      },
      {
        "title": "推进一条逻辑链",
        "explanation": "观点之后回答“为什么、怎么发生、带来什么结果”。例子必须说明这一过程。",
        "example": "Community service can give students a clearer understanding of needs outside their usual routines. Its value depends, however, on the work being meaningful and manageable. A short, well-organised project with a clear purpose may teach more than a long activity completed only to record hours. Schools should therefore consider the quality of participation as well as its duration.",
        "task": "先写一段并标出每句承担的作用。",
        "checklist": [
          "一段只有一个核心。",
          "相邻两句存在明确关系。",
          "例子或数字支持中心。"
        ]
      },
      {
        "title": "修改后再提交",
        "explanation": "修改顺序：回应题目 → 逻辑 → 句子 → 拼写。不是只换几个高级词。",
        "example": "社区服务能帮助学生了解日常生活以外的需求，但价值取决于任务是否有意义且可承担。目标明确、组织良好的短项目，可能比只为累计时数的长活动更有教育意义。因此学校应同时考虑参与质量与时长。",
        "task": "完成整篇，再删掉一句重复或无法支持观点的话。",
        "checklist": [
          "观点或概述清楚。",
          "因果没有跳步。",
          "检查主谓、单复数和标点。"
        ]
      }
    ],
    "contentOrigin": "SLS 校内原创训练",
    "assessment": "教师反馈；字数检查不等于语言评分。"
  }
];

export const speakingUnits = [
  {
    "id": "s1",
    "title": "说说你的学校生活",
    "stage": "foundation",
    "progression": "sentence",
    "levelIndex": 1,
    "prerequisites": [],
    "minutes": 5,
    "prompt": "Answer questions about a normal school day.",
    "questions": [
      "When do you arrive at school?",
      "Which lesson do you enjoy? Why?",
      "What do you do at lunchtime?"
    ],
    "followUps": [
      "Is your weekend routine different?"
    ],
    "scaffold": [
      "先直接回答，再解释原因或给出例子。",
      "准备关键词，不写整篇逐字稿。"
    ],
    "preparationSeconds": 30,
    "speakingSeconds": 45,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "直接回答",
        "text": "先回答问题问的是什么。"
      },
      {
        "label": "补充细节",
        "text": "再说一个具体时间、地点或动作。"
      },
      {
        "label": "简短原因",
        "text": "用 because 解释自己的感受或选择。"
      }
    ],
    "modelAnswer": "I usually arrive before eight. I enjoy science because we sometimes test an idea ourselves. Last week we compared two simple circuits.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "When do you arrive at school?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "从一句回答扩展到两三句",
        "explanation": "先回答，再加一个具体细节和一个简短原因。起步阶段不用把每道题都讲成完整故事。",
        "example": "I usually arrive before eight. I enjoy science because we sometimes test an idea ourselves. Last week we compared two simple circuits.",
        "task": "选一道提示问题，不看整稿说两至三句。",
        "checklist": [
          "先回答了问题。",
          "细节具体。",
          "原因与答案相关。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s2",
    "title": "介绍一位朋友",
    "stage": "foundation",
    "progression": "sentence",
    "levelIndex": 2,
    "prerequisites": [
      "s1"
    ],
    "minutes": 5,
    "prompt": "Describe a friend you often spend time with.",
    "questions": [
      "Who is the person?",
      "What do you do together?",
      "Why do you enjoy their company?"
    ],
    "followUps": [
      "Do you prefer one friend or a group?"
    ],
    "scaffold": [
      "先直接回答，再解释原因或给出例子。",
      "准备关键词，不写整篇逐字稿。"
    ],
    "preparationSeconds": 30,
    "speakingSeconds": 45,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "直接回答",
        "text": "先回答问题问的是什么。"
      },
      {
        "label": "补充细节",
        "text": "再说一个具体时间、地点或动作。"
      },
      {
        "label": "简短原因",
        "text": "用 because 解释自己的感受或选择。"
      }
    ],
    "modelAnswer": "I often spend time with a classmate from the art club. We sketch during the lunch break. She notices small details that I usually miss, so I learn from working beside her.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "Who is the person?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "从一句回答扩展到两三句",
        "explanation": "先回答，再加一个具体细节和一个简短原因。起步阶段不用把每道题都讲成完整故事。",
        "example": "I often spend time with a classmate from the art club. We sketch during the lunch break. She notices small details that I usually miss, so I learn from working beside her.",
        "task": "选一道提示问题，不看整稿说两至三句。",
        "checklist": [
          "先回答了问题。",
          "细节具体。",
          "原因与答案相关。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s3",
    "title": "介绍校园里的地方",
    "stage": "foundation",
    "progression": "sentence",
    "levelIndex": 3,
    "prerequisites": [
      "s2"
    ],
    "minutes": 5,
    "prompt": "Describe a place at school that you like.",
    "questions": [
      "Where is it?",
      "What does it look like?",
      "What do you do there?"
    ],
    "followUps": [
      "When is it busiest?"
    ],
    "scaffold": [
      "先直接回答，再解释原因或给出例子。",
      "准备关键词，不写整篇逐字稿。"
    ],
    "preparationSeconds": 30,
    "speakingSeconds": 45,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "直接回答",
        "text": "先回答问题问的是什么。"
      },
      {
        "label": "补充细节",
        "text": "再说一个具体时间、地点或动作。"
      },
      {
        "label": "简短原因",
        "text": "用 because 解释自己的感受或选择。"
      }
    ],
    "modelAnswer": "My favourite place is a small reading corner near the library window. It has two chairs and a low shelf. I go there when I want to finish a few pages quietly.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "Where is it?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "从一句回答扩展到两三句",
        "explanation": "先回答，再加一个具体细节和一个简短原因。起步阶段不用把每道题都讲成完整故事。",
        "example": "My favourite place is a small reading corner near the library window. It has two chairs and a low shelf. I go there when I want to finish a few pages quietly.",
        "task": "选一道提示问题，不看整稿说两至三句。",
        "checklist": [
          "先回答了问题。",
          "细节具体。",
          "原因与答案相关。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s4",
    "title": "讲清一次社团活动",
    "stage": "supported",
    "progression": "paragraph",
    "levelIndex": 4,
    "prerequisites": [
      "s3"
    ],
    "minutes": 8,
    "prompt": "Describe a club activity you enjoyed.",
    "questions": [
      "What was it?",
      "Who was there?",
      "What did you do?",
      "Why did you enjoy it?"
    ],
    "followUps": [
      "Would you recommend it?",
      "What would you change?"
    ],
    "scaffold": [
      "先直接回答，再解释原因或给出例子。",
      "准备关键词，不写整篇逐字稿。"
    ],
    "preparationSeconds": 60,
    "speakingSeconds": 90,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "场景",
        "text": "说清人物、时间与当时要做的事。"
      },
      {
        "label": "动作",
        "text": "讲一个具体做法或遇到的困难。"
      },
      {
        "label": "结果",
        "text": "说明结果和自己的感受。"
      }
    ],
    "modelAnswer": "Our club made a short video about saving water. I helped write the questions and interviewed two students. At first I spoke too quickly, so we recorded the introduction again. Seeing the finished video made the extra work worthwhile.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "What was it?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "按顺序讲清过程",
        "explanation": "经历题可以按 A–E 展开；观点追问则用观点、原因、例子，不机械套故事。",
        "example": "Our club made a short video about saving water. I helped write the questions and interviewed two students. At first I spoke too quickly, so we recorded the introduction again. Seeing the finished video made the extra work worthwhile.",
        "task": "准备一分钟，然后连续回答。",
        "checklist": [
          "动作具体。",
          "前后顺序清楚。",
          "感受有原因。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s5",
    "title": "讲一次学会技能的经历",
    "stage": "supported",
    "progression": "paragraph",
    "levelIndex": 5,
    "prerequisites": [
      "s4"
    ],
    "minutes": 8,
    "prompt": "Describe a skill you learned outside regular lessons.",
    "questions": [
      "What was the skill?",
      "How did you learn it?",
      "What was difficult?",
      "How do you use it?"
    ],
    "followUps": [
      "Would you learn it alone next time?",
      "What advice would you give a beginner?"
    ],
    "scaffold": [
      "先直接回答，再解释原因或给出例子。",
      "准备关键词，不写整篇逐字稿。"
    ],
    "preparationSeconds": 60,
    "speakingSeconds": 90,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "场景",
        "text": "说清人物、时间与当时要做的事。"
      },
      {
        "label": "动作",
        "text": "讲一个具体做法或遇到的困难。"
      },
      {
        "label": "结果",
        "text": "说明结果和自己的感受。"
      }
    ],
    "modelAnswer": "I learned to edit simple videos for a school project. I began with short tutorials and practised on clips from my phone. Cutting out pauses was easy, but keeping the sound clear took longer. Now I can make a short report without asking someone to do every step.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "What was the skill?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "按顺序讲清过程",
        "explanation": "经历题可以按 A–E 展开；观点追问则用观点、原因、例子，不机械套故事。",
        "example": "I learned to edit simple videos for a school project. I began with short tutorials and practised on clips from my phone. Cutting out pauses was easy, but keeping the sound clear took longer. Now I can make a short report without asking someone to do every step.",
        "task": "准备一分钟，然后连续回答。",
        "checklist": [
          "动作具体。",
          "前后顺序清楚。",
          "感受有原因。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s6",
    "title": "讲一次帮助他人的经历",
    "stage": "supported",
    "progression": "paragraph",
    "levelIndex": 6,
    "prerequisites": [
      "s5"
    ],
    "minutes": 8,
    "prompt": "Describe a time you helped someone with a school task.",
    "questions": [
      "Who needed help?",
      "What was the task?",
      "What did you do?",
      "How did you feel?"
    ],
    "followUps": [
      "Did you learn anything?",
      "When should a student ask a teacher?"
    ],
    "scaffold": [
      "先直接回答，再解释原因或给出例子。",
      "准备关键词，不写整篇逐字稿。"
    ],
    "preparationSeconds": 60,
    "speakingSeconds": 90,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "场景",
        "text": "说清人物、时间与当时要做的事。"
      },
      {
        "label": "动作",
        "text": "讲一个具体做法或遇到的困难。"
      },
      {
        "label": "结果",
        "text": "说明结果和自己的感受。"
      }
    ],
    "modelAnswer": "A classmate missed a lesson and asked about a graph. I first showed how I had labelled the axes, then asked her to explain the next step. Her question revealed an error in my own notes. We corrected it together, so the conversation helped both of us.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "Who needed help?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "按顺序讲清过程",
        "explanation": "经历题可以按 A–E 展开；观点追问则用观点、原因、例子，不机械套故事。",
        "example": "A classmate missed a lesson and asked about a graph. I first showed how I had labelled the axes, then asked her to explain the next step. Her question revealed an error in my own notes. We corrected it together, so the conversation helped both of us.",
        "task": "准备一分钟，然后连续回答。",
        "checklist": [
          "动作具体。",
          "前后顺序清楚。",
          "感受有原因。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s7",
    "title": "讲述一次团队项目",
    "stage": "bridge",
    "progression": "reasoning",
    "levelIndex": 7,
    "prerequisites": [
      "s6"
    ],
    "minutes": 11,
    "prompt": "Describe a project you completed with other students.",
    "questions": [
      "What was the project?",
      "How were tasks divided?",
      "What problem arose?",
      "What did you learn?"
    ],
    "followUps": [
      "Why do some groups work better?",
      "How should groups handle unequal effort?"
    ],
    "scaffold": [
      "先直接回答，再解释原因或给出例子。",
      "准备关键词，不写整篇逐字稿。"
    ],
    "preparationSeconds": 60,
    "speakingSeconds": 120,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "A 场景",
        "text": "谁、什么时候、什么地方。"
      },
      {
        "label": "B 起因",
        "text": "当时要做什么，为什么。"
      },
      {
        "label": "C 经过",
        "text": "一个具体动作、困难或选择。"
      },
      {
        "label": "D 结果",
        "text": "发生了什么变化。"
      },
      {
        "label": "E 感受",
        "text": "为什么这件事对你有意义。"
      }
    ],
    "modelAnswer": "We prepared a display about local birds. I collected photographs while two classmates checked the descriptions. We initially had too much information, so we asked another group which details were easiest to follow. Their feedback helped us remove repeated points. I learned that finishing my own task was only part of teamwork.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "What was the project?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "按顺序讲清过程",
        "explanation": "经历题可以按 A–E 展开；观点追问则用观点、原因、例子，不机械套故事。",
        "example": "We prepared a display about local birds. I collected photographs while two classmates checked the descriptions. We initially had too much information, so we asked another group which details were easiest to follow. Their feedback helped us remove repeated points. I learned that finishing my own task was only part of teamwork.",
        "task": "准备一分钟，然后连续回答。",
        "checklist": [
          "动作具体。",
          "前后顺序清楚。",
          "感受有原因。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s8",
    "title": "谈一项校园改进",
    "stage": "bridge",
    "progression": "reasoning",
    "levelIndex": 8,
    "prerequisites": [
      "s7"
    ],
    "minutes": 11,
    "prompt": "Describe a change you would make to your school.",
    "questions": [
      "What would change?",
      "Who would benefit?",
      "How could it happen?",
      "Why does it matter?"
    ],
    "followUps": [
      "Should students join school decisions?",
      "How can a school test an idea?"
    ],
    "scaffold": [
      "先直接回答，再解释原因或给出例子。",
      "准备关键词，不写整篇逐字稿。"
    ],
    "preparationSeconds": 60,
    "speakingSeconds": 120,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "A 场景",
        "text": "谁、什么时候、什么地方。"
      },
      {
        "label": "B 起因",
        "text": "当时要做什么，为什么。"
      },
      {
        "label": "C 经过",
        "text": "一个具体动作、困难或选择。"
      },
      {
        "label": "D 结果",
        "text": "发生了什么变化。"
      },
      {
        "label": "E 感受",
        "text": "为什么这件事对你有意义。"
      }
    ],
    "modelAnswer": "I would add a quiet study area for students waiting after clubs. Some students share tables with noisy activities, which makes homework difficult. The school could start with one room on two afternoons and ask users for feedback. A small trial would show whether a larger arrangement was needed.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "What would change?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "按顺序讲清过程",
        "explanation": "经历题可以按 A–E 展开；观点追问则用观点、原因、例子，不机械套故事。",
        "example": "I would add a quiet study area for students waiting after clubs. Some students share tables with noisy activities, which makes homework difficult. The school could start with one room on two afternoons and ask users for feedback. A small trial would show whether a larger arrangement was needed.",
        "task": "准备一分钟，然后连续回答。",
        "checklist": [
          "动作具体。",
          "前后顺序清楚。",
          "感受有原因。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s9",
    "title": "谈一本影响你的读物",
    "stage": "bridge",
    "progression": "reasoning",
    "levelIndex": 9,
    "prerequisites": [
      "s8"
    ],
    "minutes": 11,
    "prompt": "Describe a book or article that made you think differently.",
    "questions": [
      "What was it about?",
      "When did you read it?",
      "Which idea mattered?",
      "How did it affect you?"
    ],
    "followUps": [
      "Why do people reread books?",
      "Can short articles encourage deeper reading?"
    ],
    "scaffold": [
      "先直接回答，再解释原因或给出例子。",
      "准备关键词，不写整篇逐字稿。"
    ],
    "preparationSeconds": 60,
    "speakingSeconds": 120,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "A 场景",
        "text": "谁、什么时候、什么地方。"
      },
      {
        "label": "B 起因",
        "text": "当时要做什么，为什么。"
      },
      {
        "label": "C 经过",
        "text": "一个具体动作、困难或选择。"
      },
      {
        "label": "D 结果",
        "text": "发生了什么变化。"
      },
      {
        "label": "E 感受",
        "text": "为什么这件事对你有意义。"
      }
    ],
    "modelAnswer": "I read an article about how people test an explanation. It showed that one encouraging result is not always enough. This changed how I approached our plant project: instead of deciding quickly, we compared the same conditions for longer. The article gave me a more patient way to investigate a question.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "What was it about?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "按顺序讲清过程",
        "explanation": "经历题可以按 A–E 展开；观点追问则用观点、原因、例子，不机械套故事。",
        "example": "I read an article about how people test an explanation. It showed that one encouraging result is not always enough. This changed how I approached our plant project: instead of deciding quickly, we compared the same conditions for longer. The article gave me a more patient way to investigate a question.",
        "task": "准备一分钟，然后连续回答。",
        "checklist": [
          "动作具体。",
          "前后顺序清楚。",
          "感受有原因。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s10",
    "title": "讨论技术与学习",
    "stage": "independent",
    "progression": "fulltask",
    "levelIndex": 10,
    "prerequisites": [
      "s9"
    ],
    "minutes": 11,
    "prompt": "Describe a piece of technology that helps you learn.",
    "questions": [
      "What is it?",
      "How do you use it?",
      "When is it useful?",
      "What are its limits?"
    ],
    "followUps": [
      "How can schools judge a learning tool?",
      "Can technology reduce independence?",
      "Should everyone use the same tools?"
    ],
    "scaffold": [],
    "preparationSeconds": 60,
    "speakingSeconds": 120,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "A 场景",
        "text": "谁、什么时候、什么地方。"
      },
      {
        "label": "B 起因",
        "text": "当时要做什么，为什么。"
      },
      {
        "label": "C 经过",
        "text": "一个具体动作、困难或选择。"
      },
      {
        "label": "D 结果",
        "text": "发生了什么变化。"
      },
      {
        "label": "E 感受",
        "text": "为什么这件事对你有意义。"
      }
    ],
    "modelAnswer": "I use an audio recorder to practise speaking. After answering a question, I listen for places where my meaning becomes unclear. This helps me notice repeated pauses, but it cannot tell me everything about the quality of an argument. I still need feedback from a listener.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "What is it?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "按顺序讲清过程",
        "explanation": "经历题可以按 A–E 展开；观点追问则用观点、原因、例子，不机械套故事。",
        "example": "I use an audio recorder to practise speaking. After answering a question, I listen for places where my meaning becomes unclear. This helps me notice repeated pauses, but it cannot tell me everything about the quality of an argument. I still need feedback from a listener.",
        "task": "准备一分钟，然后连续回答。",
        "checklist": [
          "动作具体。",
          "前后顺序清楚。",
          "感受有原因。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s11",
    "title": "讨论安排时间与选择",
    "stage": "independent",
    "progression": "fulltask",
    "levelIndex": 11,
    "prerequisites": [
      "s10"
    ],
    "minutes": 11,
    "prompt": "Describe a time you chose between two activities.",
    "questions": [
      "What were the choices?",
      "Why was it difficult?",
      "What did you choose?",
      "Would you choose the same again?"
    ],
    "followUps": [
      "Why is long-term planning difficult?",
      "How much freedom should teenagers have?",
      "Can strict schedules reduce motivation?"
    ],
    "scaffold": [],
    "preparationSeconds": 60,
    "speakingSeconds": 120,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "A 场景",
        "text": "谁、什么时候、什么地方。"
      },
      {
        "label": "B 起因",
        "text": "当时要做什么，为什么。"
      },
      {
        "label": "C 经过",
        "text": "一个具体动作、困难或选择。"
      },
      {
        "label": "D 结果",
        "text": "发生了什么变化。"
      },
      {
        "label": "E 感受",
        "text": "为什么这件事对你有意义。"
      }
    ],
    "modelAnswer": "I had to choose between a club trip and finishing a group presentation. I wanted to join the trip, but our slides still needed checking. After talking to the group, I stayed for the morning and joined the later activity. It was not a perfect solution, but discussing the real workload helped us find a workable compromise.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "What were the choices?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "按顺序讲清过程",
        "explanation": "经历题可以按 A–E 展开；观点追问则用观点、原因、例子，不机械套故事。",
        "example": "I had to choose between a club trip and finishing a group presentation. I wanted to join the trip, but our slides still needed checking. After talking to the group, I stayed for the morning and joined the later activity. It was not a perfect solution, but discussing the real workload helped us find a workable compromise.",
        "task": "准备一分钟，然后连续回答。",
        "checklist": [
          "动作具体。",
          "前后顺序清楚。",
          "感受有原因。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  },
  {
    "id": "s12",
    "title": "从活动谈公共参与",
    "stage": "independent",
    "progression": "fulltask",
    "levelIndex": 12,
    "prerequisites": [
      "s11"
    ],
    "minutes": 11,
    "prompt": "Describe an event that brought people together.",
    "questions": [
      "What was it?",
      "How was it organised?",
      "What did you do?",
      "Why was it memorable?"
    ],
    "followUps": [
      "What creates a sense of belonging?",
      "Should volunteering always be a choice?",
      "How can events include different interests?"
    ],
    "scaffold": [],
    "preparationSeconds": 60,
    "speakingSeconds": 120,
    "instructions": [
      "使用真实或合理的校园经历，不必追求大事件。",
      "录音后先自查，再提交老师反馈。",
      "文字提纲不能替代口语录音评估。"
    ],
    "rubric": [
      {
        "name": "流利与连贯",
        "description": "能持续表达，回答有展开。"
      },
      {
        "name": "词汇运用",
        "description": "用词适合话题，忘词时能解释意思。"
      },
      {
        "name": "语法",
        "description": "能表达时间、原因、比较和假设。"
      },
      {
        "name": "发音",
        "description": "词语可辨，重音与语调帮助理解。"
      }
    ],
    "narrationPlan": [
      {
        "label": "A 场景",
        "text": "谁、什么时候、什么地方。"
      },
      {
        "label": "B 起因",
        "text": "当时要做什么，为什么。"
      },
      {
        "label": "C 经过",
        "text": "一个具体动作、困难或选择。"
      },
      {
        "label": "D 结果",
        "text": "发生了什么变化。"
      },
      {
        "label": "E 感受",
        "text": "为什么这件事对你有意义。"
      }
    ],
    "modelAnswer": "Our school held a small exchange event for books and plants. I helped visitors label what they brought. People who did not usually talk began sharing advice about the items. What I remember most is not the number of exchanges, but a conversation between two students who discovered the same unusual interest.",
    "lessonSteps": [
      {
        "title": "审题与选材",
        "explanation": "选择一件自己能讲清动作和变化的小事。复杂经历不一定更好。",
        "example": "What was it?",
        "task": "选定一个人物或事件，写下三个细节。",
        "checklist": [
          "内容回应题目。",
          "不暴露他人的私人信息。"
        ]
      },
      {
        "title": "词块组成完整回答",
        "explanation": "先给直接答案，再用 because、for example 或 before/after 展开。",
        "example": "I enjoyed it because … / At first …, but later …",
        "task": "每个提示问题先说两句，再连成一段。",
        "checklist": [
          "第一句有明确答案。",
          "第二句增加具体信息。"
        ]
      },
      {
        "title": "按顺序讲清过程",
        "explanation": "经历题可以按 A–E 展开；观点追问则用观点、原因、例子，不机械套故事。",
        "example": "Our school held a small exchange event for books and plants. I helped visitors label what they brought. People who did not usually talk began sharing advice about the items. What I remember most is not the number of exchanges, but a conversation between two students who discovered the same unusual interest.",
        "task": "准备一分钟，然后连续回答。",
        "checklist": [
          "动作具体。",
          "前后顺序清楚。",
          "感受有原因。"
        ]
      },
      {
        "title": "听回放、改一处、重说",
        "explanation": "不必一次改完所有问题。先选最妨碍理解的一处，再重新表达。",
        "example": "把 “It was good, very good” 改为 “It helped me explain my idea without reading my notes.”",
        "task": "回听后写下一个做得清楚的地方和一个修改点，再录一次。",
        "checklist": [
          "我说明了修改的原因。",
          "重说时没有照读整稿。"
        ]
      }
    ],
    "contentOrigin": "SLS 高中生活话题原创训练"
  }
];

export const vocabularySets = [
  {
    "id": "v-spelling",
    "title": "易错拼写",
    "stage": "foundation",
    "chapter": "Chapter 2 / Chapter 7",
    "progression": "word",
    "levelIndex": 1,
    "prerequisites": [],
    "items": [
      {
        "word": "accommodation",
        "meaning": "住宿",
        "example": "We booked accommodation near the museum."
      },
      {
        "word": "Wednesday",
        "meaning": "星期三",
        "example": "The club meets on Wednesday."
      },
      {
        "word": "February",
        "meaning": "二月",
        "example": "The competition takes place in February."
      },
      {
        "word": "necessary",
        "meaning": "必要的",
        "example": "A student card is necessary to borrow equipment."
      },
      {
        "word": "separate",
        "meaning": "分开的；分开",
        "example": "Keep your notes in separate folders."
      },
      {
        "word": "environment",
        "meaning": "环境",
        "example": "The club studies the local environment."
      },
      {
        "word": "questionnaire",
        "meaning": "问卷",
        "example": "Complete the questionnaire after the visit."
      },
      {
        "word": "library",
        "meaning": "图书馆",
        "example": "The library closes at five today."
      },
      {
        "word": "restaurant",
        "meaning": "餐馆",
        "example": "The restaurant is opposite the station."
      },
      {
        "word": "receipt",
        "meaning": "收据",
        "example": "Keep the receipt until the trip is over."
      },
      {
        "word": "beginning",
        "meaning": "开始",
        "example": "Write your name at the beginning."
      },
      {
        "word": "successful",
        "meaning": "成功的",
        "example": "The group organised a successful event."
      }
    ],
    "instructions": "先按释义独立拼写，再订正并隔一段时间重做。若使用设备朗读，音频属于合成练习语音，不是教材原声。",
    "sourceNote": "主题分类参考所给语料库目录；本词表和例句为校内编写。",
    "audioMode": "text-practice",
    "targetAccuracy": 0.9,
    "lessonSteps": [
      {
        "title": "先弄懂含义与场景",
        "explanation": "看词义后，把单词放回一个完整句子。词汇识别只是起点，后面还要练听辨和应用。",
        "example": "We booked accommodation near the museum.",
        "task": "读懂三个例句，各说一个可能出现的校园场景。",
        "checklist": [
          "能说明基本意思。",
          "没有只背中文对应词。"
        ]
      },
      {
        "title": "拆开易错部分",
        "explanation": "标出双写、容易漏掉的元音、复数词尾或词组边界。不要因为读音弱就省略字母。",
        "example": "accommodation：留意 cc 和 mm。",
        "task": "先独立写一遍，再把错误归为漏字母、词形、词义或分词。",
        "checklist": [
          "错误有分类。",
          "订正到完整词形。"
        ]
      },
      {
        "title": "订正后再测",
        "explanation": "先核对并读懂错误原因，再遮住答案重做。目标是本组达到90%以上；同一组重做不代表新材料的水平。",
        "example": "12词一组至少答对11个，才能超过90%；仍要记录首次正确率。",
        "task": "隔一段时间重做错词，再换一组新词。",
        "checklist": [
          "保留首次结果。",
          "没有边看答案边作答。",
          "新词组单独记录。"
        ]
      },
      {
        "title": "从词放回句子",
        "explanation": "用正确词形组成自己的句子，再到真实听力中识别它。听到相似词时还要核对整个场景。",
        "example": "The competition takes place in February.",
        "task": "选三个词，写三句真实或合理的校园句子。",
        "checklist": [
          "主谓完整。",
          "单复数与句意一致。",
          "搭配自然。"
        ]
      }
    ]
  },
  {
    "id": "v-nouns",
    "title": "校园与公共服务名词",
    "stage": "foundation",
    "chapter": "Chapter 3",
    "progression": "word",
    "levelIndex": 2,
    "prerequisites": [
      "v-spelling"
    ],
    "items": [
      {
        "word": "reception",
        "meaning": "接待处",
        "example": "Ask at reception for a visitor pass."
      },
      {
        "word": "registration",
        "meaning": "登记；注册",
        "example": "Registration opens on Monday."
      },
      {
        "word": "certificate",
        "meaning": "证书",
        "example": "Each participant receives a certificate."
      },
      {
        "word": "equipment",
        "meaning": "设备；器材",
        "example": "Return the equipment after use."
      },
      {
        "word": "assignment",
        "meaning": "作业；任务",
        "example": "The assignment is due next Friday."
      },
      {
        "word": "schedule",
        "meaning": "时间表",
        "example": "Check the schedule before choosing a session."
      },
      {
        "word": "permission",
        "meaning": "许可",
        "example": "You need permission to use the laboratory."
      },
      {
        "word": "volunteer",
        "meaning": "志愿者",
        "example": "A volunteer will show visitors around."
      },
      {
        "word": "audience",
        "meaning": "观众；听众",
        "example": "The audience asked several questions."
      },
      {
        "word": "lecture",
        "meaning": "讲座",
        "example": "The lecture begins at two."
      },
      {
        "word": "department",
        "meaning": "部门；系",
        "example": "Contact the music department."
      },
      {
        "word": "deadline",
        "meaning": "截止时间",
        "example": "The deadline is next Thursday."
      }
    ],
    "instructions": "先按释义独立拼写，再订正并隔一段时间重做。若使用设备朗读，音频属于合成练习语音，不是教材原声。",
    "sourceNote": "主题分类参考所给语料库目录；本词表和例句为校内编写。",
    "audioMode": "text-practice",
    "targetAccuracy": 0.9,
    "lessonSteps": [
      {
        "title": "先弄懂含义与场景",
        "explanation": "看词义后，把单词放回一个完整句子。词汇识别只是起点，后面还要练听辨和应用。",
        "example": "Ask at reception for a visitor pass.",
        "task": "读懂三个例句，各说一个可能出现的校园场景。",
        "checklist": [
          "能说明基本意思。",
          "没有只背中文对应词。"
        ]
      },
      {
        "title": "拆开易错部分",
        "explanation": "标出双写、容易漏掉的元音、复数词尾或词组边界。不要因为读音弱就省略字母。",
        "example": "registration → Registration opens on Monday.",
        "task": "先独立写一遍，再把错误归为漏字母、词形、词义或分词。",
        "checklist": [
          "错误有分类。",
          "订正到完整词形。"
        ]
      },
      {
        "title": "订正后再测",
        "explanation": "先核对并读懂错误原因，再遮住答案重做。目标是本组达到90%以上；同一组重做不代表新材料的水平。",
        "example": "12词一组至少答对11个，才能超过90%；仍要记录首次正确率。",
        "task": "隔一段时间重做错词，再换一组新词。",
        "checklist": [
          "保留首次结果。",
          "没有边看答案边作答。",
          "新词组单独记录。"
        ]
      },
      {
        "title": "从词放回句子",
        "explanation": "用正确词形组成自己的句子，再到真实听力中识别它。听到相似词时还要核对整个场景。",
        "example": "Each participant receives a certificate.",
        "task": "选三个词，写三句真实或合理的校园句子。",
        "checklist": [
          "主谓完整。",
          "单复数与句意一致。",
          "搭配自然。"
        ]
      }
    ]
  },
  {
    "id": "v-adjectives",
    "title": "形容词与副词",
    "stage": "supported",
    "chapter": "Chapter 4",
    "progression": "word",
    "levelIndex": 3,
    "prerequisites": [
      "v-nouns"
    ],
    "items": [
      {
        "word": "available",
        "meaning": "可用的；有空的",
        "example": "The room is available after lunch."
      },
      {
        "word": "convenient",
        "meaning": "方便的",
        "example": "The bus stop is in a convenient location."
      },
      {
        "word": "temporary",
        "meaning": "临时的",
        "example": "We are using a temporary classroom."
      },
      {
        "word": "reliable",
        "meaning": "可靠的",
        "example": "The report needs reliable evidence."
      },
      {
        "word": "suitable",
        "meaning": "合适的",
        "example": "Choose a topic suitable for your audience."
      },
      {
        "word": "approximately",
        "meaning": "大约",
        "example": "The talk lasts approximately forty minutes."
      },
      {
        "word": "particularly",
        "meaning": "尤其",
        "example": "The last example was particularly helpful."
      },
      {
        "word": "regularly",
        "meaning": "定期地；经常",
        "example": "Review your vocabulary regularly."
      },
      {
        "word": "similar",
        "meaning": "相似的",
        "example": "The two designs look similar."
      },
      {
        "word": "familiar",
        "meaning": "熟悉的",
        "example": "Start with a familiar topic."
      },
      {
        "word": "accessible",
        "meaning": "可到达的；易用的",
        "example": "The entrance is accessible from the main road."
      },
      {
        "word": "efficient",
        "meaning": "高效的",
        "example": "We need a more efficient way to collect the forms."
      }
    ],
    "instructions": "先按释义独立拼写，再订正并隔一段时间重做。若使用设备朗读，音频属于合成练习语音，不是教材原声。",
    "sourceNote": "主题分类参考所给语料库目录；本词表和例句为校内编写。",
    "audioMode": "text-practice",
    "targetAccuracy": 0.9,
    "lessonSteps": [
      {
        "title": "先弄懂含义与场景",
        "explanation": "看词义后，把单词放回一个完整句子。词汇识别只是起点，后面还要练听辨和应用。",
        "example": "The room is available after lunch.",
        "task": "读懂三个例句，各说一个可能出现的校园场景。",
        "checklist": [
          "能说明基本意思。",
          "没有只背中文对应词。"
        ]
      },
      {
        "title": "拆开易错部分",
        "explanation": "标出双写、容易漏掉的元音、复数词尾或词组边界。不要因为读音弱就省略字母。",
        "example": "convenient → The bus stop is in a convenient location.",
        "task": "先独立写一遍，再把错误归为漏字母、词形、词义或分词。",
        "checklist": [
          "错误有分类。",
          "订正到完整词形。"
        ]
      },
      {
        "title": "订正后再测",
        "explanation": "先核对并读懂错误原因，再遮住答案重做。目标是本组达到90%以上；同一组重做不代表新材料的水平。",
        "example": "12词一组至少答对11个，才能超过90%；仍要记录首次正确率。",
        "task": "隔一段时间重做错词，再换一组新词。",
        "checklist": [
          "保留首次结果。",
          "没有边看答案边作答。",
          "新词组单独记录。"
        ]
      },
      {
        "title": "从词放回句子",
        "explanation": "用正确词形组成自己的句子，再到真实听力中识别它。听到相似词时还要核对整个场景。",
        "example": "We are using a temporary classroom.",
        "task": "选三个词，写三句真实或合理的校园句子。",
        "checklist": [
          "主谓完整。",
          "单复数与句意一致。",
          "搭配自然。"
        ]
      }
    ]
  },
  {
    "id": "v-linked",
    "title": "词组与连读识别",
    "stage": "supported",
    "chapter": "Chapter 5",
    "progression": "word",
    "levelIndex": 4,
    "prerequisites": [
      "v-adjectives"
    ],
    "items": [
      {
        "word": "at least",
        "meaning": "至少",
        "example": "Bring at least two examples."
      },
      {
        "word": "a couple of",
        "meaning": "两个；几个",
        "example": "The walk takes a couple of hours."
      },
      {
        "word": "in advance",
        "meaning": "提前",
        "example": "Please book your place in advance."
      },
      {
        "word": "as well as",
        "meaning": "也；除……之外",
        "example": "The club welcomes beginners as well as experienced players."
      },
      {
        "word": "look at",
        "meaning": "看；查看",
        "example": "Look at the map before you leave."
      },
      {
        "word": "pick up",
        "meaning": "领取；接人",
        "example": "Pick up your pass at reception."
      },
      {
        "word": "used to",
        "meaning": "过去常常",
        "example": "The old hall used to be a library."
      },
      {
        "word": "have to",
        "meaning": "不得不；必须",
        "example": "We have to submit the form by Friday."
      },
      {
        "word": "next to",
        "meaning": "在……旁边",
        "example": "The office is next to the library."
      },
      {
        "word": "a lot of",
        "meaning": "许多",
        "example": "A lot of students joined the activity."
      },
      {
        "word": "kind of",
        "meaning": "种类；有点",
        "example": "What kind of project would you enjoy?"
      },
      {
        "word": "find out",
        "meaning": "查明；了解",
        "example": "Find out when the next session starts."
      }
    ],
    "instructions": "先按释义独立拼写，再订正并隔一段时间重做。若使用设备朗读，音频属于合成练习语音，不是教材原声。",
    "sourceNote": "主题分类参考所给语料库目录；本词表和例句为校内编写。",
    "audioMode": "text-practice",
    "targetAccuracy": 0.9,
    "lessonSteps": [
      {
        "title": "先弄懂含义与场景",
        "explanation": "看词义后，把单词放回一个完整句子。词汇识别只是起点，后面还要练听辨和应用。",
        "example": "Bring at least two examples.",
        "task": "读懂三个例句，各说一个可能出现的校园场景。",
        "checklist": [
          "能说明基本意思。",
          "没有只背中文对应词。"
        ]
      },
      {
        "title": "拆开易错部分",
        "explanation": "标出双写、容易漏掉的元音、复数词尾或词组边界。不要因为读音弱就省略字母。",
        "example": "a couple of → The walk takes a couple of hours.",
        "task": "先独立写一遍，再把错误归为漏字母、词形、词义或分词。",
        "checklist": [
          "错误有分类。",
          "订正到完整词形。"
        ]
      },
      {
        "title": "订正后再测",
        "explanation": "先核对并读懂错误原因，再遮住答案重做。目标是本组达到90%以上；同一组重做不代表新材料的水平。",
        "example": "12词一组至少答对11个，才能超过90%；仍要记录首次正确率。",
        "task": "隔一段时间重做错词，再换一组新词。",
        "checklist": [
          "保留首次结果。",
          "没有边看答案边作答。",
          "新词组单独记录。"
        ]
      },
      {
        "title": "从词放回句子",
        "explanation": "用正确词形组成自己的句子，再到真实听力中识别它。听到相似词时还要核对整个场景。",
        "example": "Please book your place in advance.",
        "task": "选三个词，写三句真实或合理的校园句子。",
        "checklist": [
          "主谓完整。",
          "单复数与句意一致。",
          "搭配自然。"
        ]
      }
    ]
  },
  {
    "id": "v-plurals",
    "title": "复数词尾",
    "stage": "foundation",
    "chapter": "Chapter 6",
    "progression": "word",
    "levelIndex": 5,
    "prerequisites": [
      "v-linked"
    ],
    "items": [
      {
        "word": "activities",
        "meaning": "活动（复数）",
        "example": "The centre offers weekend activities."
      },
      {
        "word": "facilities",
        "meaning": "设施（复数）",
        "example": "Students can use the sports facilities."
      },
      {
        "word": "branches",
        "meaning": "分馆；分支（复数）",
        "example": "The library has three branches."
      },
      {
        "word": "addresses",
        "meaning": "地址（复数）",
        "example": "Check the addresses before sending invitations."
      },
      {
        "word": "children",
        "meaning": "孩子（复数）",
        "example": "The event is open to children and adults."
      },
      {
        "word": "people",
        "meaning": "人（复数）",
        "example": "Twenty people joined the workshop."
      },
      {
        "word": "leaves",
        "meaning": "叶子（复数）",
        "example": "Students collected leaves for the project."
      },
      {
        "word": "criteria",
        "meaning": "标准（复数）",
        "example": "Read the selection criteria carefully."
      },
      {
        "word": "opportunities",
        "meaning": "机会（复数）",
        "example": "The club offers opportunities to practise."
      },
      {
        "word": "batteries",
        "meaning": "电池（复数）",
        "example": "Bring spare batteries for the recorder."
      },
      {
        "word": "watches",
        "meaning": "手表（复数）",
        "example": "The display contains several old watches."
      },
      {
        "word": "shelves",
        "meaning": "架子（复数）",
        "example": "Put the books on the lower shelves."
      }
    ],
    "instructions": "先按释义独立拼写，再订正并隔一段时间重做。若使用设备朗读，音频属于合成练习语音，不是教材原声。",
    "sourceNote": "主题分类参考所给语料库目录；本词表和例句为校内编写。",
    "audioMode": "text-practice",
    "targetAccuracy": 0.9,
    "lessonSteps": [
      {
        "title": "先弄懂含义与场景",
        "explanation": "看词义后，把单词放回一个完整句子。词汇识别只是起点，后面还要练听辨和应用。",
        "example": "The centre offers weekend activities.",
        "task": "读懂三个例句，各说一个可能出现的校园场景。",
        "checklist": [
          "能说明基本意思。",
          "没有只背中文对应词。"
        ]
      },
      {
        "title": "拆开易错部分",
        "explanation": "标出双写、容易漏掉的元音、复数词尾或词组边界。不要因为读音弱就省略字母。",
        "example": "activities：先确认 activity，再把 y 改成 ies。",
        "task": "先独立写一遍，再把错误归为漏字母、词形、词义或分词。",
        "checklist": [
          "错误有分类。",
          "订正到完整词形。"
        ]
      },
      {
        "title": "订正后再测",
        "explanation": "先核对并读懂错误原因，再遮住答案重做。目标是本组达到90%以上；同一组重做不代表新材料的水平。",
        "example": "12词一组至少答对11个，才能超过90%；仍要记录首次正确率。",
        "task": "隔一段时间重做错词，再换一组新词。",
        "checklist": [
          "保留首次结果。",
          "没有边看答案边作答。",
          "新词组单独记录。"
        ]
      },
      {
        "title": "从词放回句子",
        "explanation": "用正确词形组成自己的句子，再到真实听力中识别它。听到相似词时还要核对整个场景。",
        "example": "The library has three branches.",
        "task": "选三个词，写三句真实或合理的校园句子。",
        "checklist": [
          "主谓完整。",
          "单复数与句意一致。",
          "搭配自然。"
        ]
      }
    ]
  },
  {
    "id": "v-survival",
    "title": "住宿、交通与预约",
    "stage": "supported",
    "chapter": "Chapter 8",
    "progression": "word",
    "levelIndex": 6,
    "prerequisites": [
      "v-plurals"
    ],
    "items": [
      {
        "word": "deposit",
        "meaning": "押金；定金",
        "example": "Pay a deposit to reserve the room."
      },
      {
        "word": "reservation",
        "meaning": "预订",
        "example": "I would like to change my reservation."
      },
      {
        "word": "departure",
        "meaning": "出发",
        "example": "The departure time is shown on the board."
      },
      {
        "word": "platform",
        "meaning": "站台",
        "example": "The train leaves from platform six."
      },
      {
        "word": "return ticket",
        "meaning": "往返票",
        "example": "A return ticket costs less than two single tickets."
      },
      {
        "word": "insurance",
        "meaning": "保险",
        "example": "Travel insurance is included in the price."
      },
      {
        "word": "appointment",
        "meaning": "预约",
        "example": "Arrive ten minutes before your appointment."
      },
      {
        "word": "luggage",
        "meaning": "行李",
        "example": "You can leave your luggage at reception."
      },
      {
        "word": "entrance",
        "meaning": "入口",
        "example": "Use the entrance beside the café."
      },
      {
        "word": "discount",
        "meaning": "折扣",
        "example": "Students receive a small discount."
      },
      {
        "word": "membership",
        "meaning": "会员资格",
        "example": "Membership lasts for one year."
      },
      {
        "word": "cancellation",
        "meaning": "取消",
        "example": "Ask about the cancellation policy before booking."
      }
    ],
    "instructions": "先按释义独立拼写，再订正并隔一段时间重做。若使用设备朗读，音频属于合成练习语音，不是教材原声。",
    "sourceNote": "主题分类参考所给语料库目录；本词表和例句为校内编写。",
    "audioMode": "text-practice",
    "targetAccuracy": 0.9,
    "lessonSteps": [
      {
        "title": "先弄懂含义与场景",
        "explanation": "看词义后，把单词放回一个完整句子。词汇识别只是起点，后面还要练听辨和应用。",
        "example": "Pay a deposit to reserve the room.",
        "task": "读懂三个例句，各说一个可能出现的校园场景。",
        "checklist": [
          "能说明基本意思。",
          "没有只背中文对应词。"
        ]
      },
      {
        "title": "拆开易错部分",
        "explanation": "标出双写、容易漏掉的元音、复数词尾或词组边界。不要因为读音弱就省略字母。",
        "example": "reservation → I would like to change my reservation.",
        "task": "先独立写一遍，再把错误归为漏字母、词形、词义或分词。",
        "checklist": [
          "错误有分类。",
          "订正到完整词形。"
        ]
      },
      {
        "title": "订正后再测",
        "explanation": "先核对并读懂错误原因，再遮住答案重做。目标是本组达到90%以上；同一组重做不代表新材料的水平。",
        "example": "12词一组至少答对11个，才能超过90%；仍要记录首次正确率。",
        "task": "隔一段时间重做错词，再换一组新词。",
        "checklist": [
          "保留首次结果。",
          "没有边看答案边作答。",
          "新词组单独记录。"
        ]
      },
      {
        "title": "从词放回句子",
        "explanation": "用正确词形组成自己的句子，再到真实听力中识别它。听到相似词时还要核对整个场景。",
        "example": "The departure time is shown on the board.",
        "task": "选三个词，写三句真实或合理的校园句子。",
        "checklist": [
          "主谓完整。",
          "单复数与句意一致。",
          "搭配自然。"
        ]
      }
    ]
  },
  {
    "id": "v-verbs",
    "title": "常用动词与词形",
    "stage": "supported",
    "chapter": "Chapter 9 / Chapter 10",
    "progression": "word",
    "levelIndex": 7,
    "prerequisites": [
      "v-survival"
    ],
    "items": [
      {
        "word": "confirm",
        "meaning": "确认",
        "example": "Confirm your attendance by email."
      },
      {
        "word": "postpone",
        "meaning": "推迟",
        "example": "The school decided to postpone the match."
      },
      {
        "word": "recommend",
        "meaning": "推荐；建议",
        "example": "Our teacher recommended a shorter article."
      },
      {
        "word": "register",
        "meaning": "登记；注册",
        "example": "Students can register for one workshop."
      },
      {
        "word": "compare",
        "meaning": "比较",
        "example": "Compare the results from both groups."
      },
      {
        "word": "replace",
        "meaning": "替换",
        "example": "The new timetable will replace the old one."
      },
      {
        "word": "reduce",
        "meaning": "减少",
        "example": "We hope to reduce paper waste."
      },
      {
        "word": "increase",
        "meaning": "增加",
        "example": "The club wants to increase participation."
      },
      {
        "word": "arrange",
        "meaning": "安排",
        "example": "We will arrange a second meeting."
      },
      {
        "word": "collect",
        "meaning": "收集；领取",
        "example": "Collect your ticket at the desk."
      },
      {
        "word": "submit",
        "meaning": "提交",
        "example": "Submit your work before the deadline."
      },
      {
        "word": "revise",
        "meaning": "修改；复习",
        "example": "Revise the paragraph after reading the feedback."
      }
    ],
    "instructions": "先按释义独立拼写，再订正并隔一段时间重做。若使用设备朗读，音频属于合成练习语音，不是教材原声。",
    "sourceNote": "主题分类参考所给语料库目录；本词表和例句为校内编写。",
    "audioMode": "text-practice",
    "targetAccuracy": 0.9,
    "lessonSteps": [
      {
        "title": "先弄懂含义与场景",
        "explanation": "看词义后，把单词放回一个完整句子。词汇识别只是起点，后面还要练听辨和应用。",
        "example": "Confirm your attendance by email.",
        "task": "读懂三个例句，各说一个可能出现的校园场景。",
        "checklist": [
          "能说明基本意思。",
          "没有只背中文对应词。"
        ]
      },
      {
        "title": "拆开易错部分",
        "explanation": "标出双写、容易漏掉的元音、复数词尾或词组边界。不要因为读音弱就省略字母。",
        "example": "postpone → The school decided to postpone the match.",
        "task": "先独立写一遍，再把错误归为漏字母、词形、词义或分词。",
        "checklist": [
          "错误有分类。",
          "订正到完整词形。"
        ]
      },
      {
        "title": "订正后再测",
        "explanation": "先核对并读懂错误原因，再遮住答案重做。目标是本组达到90%以上；同一组重做不代表新材料的水平。",
        "example": "12词一组至少答对11个，才能超过90%；仍要记录首次正确率。",
        "task": "隔一段时间重做错词，再换一组新词。",
        "checklist": [
          "保留首次结果。",
          "没有边看答案边作答。",
          "新词组单独记录。"
        ]
      },
      {
        "title": "从词放回句子",
        "explanation": "用正确词形组成自己的句子，再到真实听力中识别它。听到相似词时还要核对整个场景。",
        "example": "Our teacher recommended a shorter article.",
        "task": "选三个词，写三句真实或合理的校园句子。",
        "checklist": [
          "主谓完整。",
          "单复数与句意一致。",
          "搭配自然。"
        ]
      }
    ]
  },
  {
    "id": "v-academic",
    "title": "学术表达与论证",
    "stage": "bridge",
    "chapter": "Chapter 12",
    "progression": "word",
    "levelIndex": 8,
    "prerequisites": [
      "v-verbs"
    ],
    "items": [
      {
        "word": "evidence",
        "meaning": "证据",
        "example": "The claim is supported by evidence from two studies."
      },
      {
        "word": "interpretation",
        "meaning": "解释；理解",
        "example": "The result allows more than one interpretation."
      },
      {
        "word": "significant",
        "meaning": "显著的；重要的",
        "example": "There was a significant change in the final month."
      },
      {
        "word": "sustainable",
        "meaning": "可持续的",
        "example": "The project needs a sustainable source of funding."
      },
      {
        "word": "alternative",
        "meaning": "替代方案；另一种的",
        "example": "Consider an alternative explanation."
      },
      {
        "word": "consequence",
        "meaning": "结果；后果",
        "example": "Think about the possible consequence of each choice."
      },
      {
        "word": "participation",
        "meaning": "参与",
        "example": "Participation increased after the timetable changed."
      },
      {
        "word": "perspective",
        "meaning": "观点；角度",
        "example": "The discussion helped me understand another perspective."
      },
      {
        "word": "mechanism",
        "meaning": "机制；作用过程",
        "example": "The study investigates the mechanism behind the effect."
      },
      {
        "word": "assumption",
        "meaning": "假定",
        "example": "We should test that assumption."
      },
      {
        "word": "consistent",
        "meaning": "一致的",
        "example": "The result is consistent with the earlier observations."
      },
      {
        "word": "evaluate",
        "meaning": "评估",
        "example": "Evaluate the evidence before reaching a conclusion."
      }
    ],
    "instructions": "先按释义独立拼写，再订正并隔一段时间重做。若使用设备朗读，音频属于合成练习语音，不是教材原声。",
    "sourceNote": "主题分类参考所给语料库目录；本词表和例句为校内编写。",
    "audioMode": "text-practice",
    "targetAccuracy": 0.9,
    "lessonSteps": [
      {
        "title": "先弄懂含义与场景",
        "explanation": "看词义后，把单词放回一个完整句子。词汇识别只是起点，后面还要练听辨和应用。",
        "example": "The claim is supported by evidence from two studies.",
        "task": "读懂三个例句，各说一个可能出现的校园场景。",
        "checklist": [
          "能说明基本意思。",
          "没有只背中文对应词。"
        ]
      },
      {
        "title": "拆开易错部分",
        "explanation": "标出双写、容易漏掉的元音、复数词尾或词组边界。不要因为读音弱就省略字母。",
        "example": "interpretation → The result allows more than one interpretation.",
        "task": "先独立写一遍，再把错误归为漏字母、词形、词义或分词。",
        "checklist": [
          "错误有分类。",
          "订正到完整词形。"
        ]
      },
      {
        "title": "订正后再测",
        "explanation": "先核对并读懂错误原因，再遮住答案重做。目标是本组达到90%以上；同一组重做不代表新材料的水平。",
        "example": "12词一组至少答对11个，才能超过90%；仍要记录首次正确率。",
        "task": "隔一段时间重做错词，再换一组新词。",
        "checklist": [
          "保留首次结果。",
          "没有边看答案边作答。",
          "新词组单独记录。"
        ]
      },
      {
        "title": "从词放回句子",
        "explanation": "用正确词形组成自己的句子，再到真实听力中识别它。听到相似词时还要核对整个场景。",
        "example": "There was a significant change in the final month.",
        "task": "选三个词，写三句真实或合理的校园句子。",
        "checklist": [
          "主谓完整。",
          "单复数与句意一致。",
          "搭配自然。"
        ]
      }
    ]
  }
];

export const learningPaths = [
  {
    "skill": "writing",
    "title": "从词句到完整文章",
    "steps": [
      {
        "id": "writing-words",
        "title": "词义与搭配",
        "description": "词义准确后，用词块写出完整句。",
        "unitIds": [
          "v-academic"
        ],
        "route": "foundation"
      },
      {
        "id": "writing-sentence",
        "title": "词块与完整句",
        "description": "先把意思写准确，再连接句子。",
        "unitIds": [
          "w1",
          "w2",
          "w3"
        ]
      },
      {
        "id": "writing-paragraph",
        "title": "一个段落一个中心",
        "description": "用原因和例子展开。",
        "unitIds": [
          "w4",
          "w5",
          "w6"
        ]
      },
      {
        "id": "writing-reasoning",
        "title": "把逻辑推进清楚",
        "description": "观点、机制、结果、例子、回扣。",
        "unitIds": [
          "w7",
          "w8"
        ]
      },
      {
        "id": "writing-fulltask",
        "title": "独立完成与修改",
        "description": "审题、计划、写作、检查。",
        "unitIds": [
          "w9",
          "w10",
          "w11",
          "w12"
        ]
      }
    ]
  },
  {
    "skill": "speaking",
    "title": "从简短回答到自然展开",
    "steps": [
      {
        "id": "speaking-words",
        "title": "常用词块与替换表达",
        "description": "先能说出一个意思，再加原因、例子与变化。",
        "unitIds": [
          "v-linked"
        ],
        "route": "foundation"
      },
      {
        "id": "speaking-sentence",
        "title": "直接回答并加一句",
        "description": "用词块组成完整句。",
        "unitIds": [
          "s1",
          "s2",
          "s3"
        ]
      },
      {
        "id": "speaking-paragraph",
        "title": "讲清一件具体小事",
        "description": "场景、起因、经过、结果、感受。",
        "unitIds": [
          "s4",
          "s5",
          "s6"
        ]
      },
      {
        "id": "speaking-reasoning",
        "title": "解释原因与变化",
        "description": "不只叙述发生了什么。",
        "unitIds": [
          "s7",
          "s8",
          "s9"
        ]
      },
      {
        "id": "speaking-fulltask",
        "title": "连续表达与追问",
        "description": "独立回答，再用回放修改。",
        "unitIds": [
          "s10",
          "s11",
          "s12"
        ]
      }
    ]
  },
  {
    "skill": "reading",
    "title": "从理解句子到把握全文",
    "steps": [
      {
        "id": "reading-words",
        "title": "词义与句子结构",
        "description": "结合上下文理解词义，找出主语和主要动作。",
        "unitIds": [
          "r-pencil"
        ],
        "route": "foundation/r-pencil"
      },
      {
        "id": "reading-paragraph",
        "title": "段落中心与信息定位",
        "description": "为段落概括中心，再寻找题目证据。",
        "unitIds": [
          "r-plants"
        ],
        "route": "foundation/r-plants"
      },
      {
        "id": "reading-logic",
        "title": "同义替换与篇章逻辑",
        "description": "检查转折、范围、原因和作者意图。",
        "unitIds": [
          "r-birds"
        ],
        "route": "foundation/r-birds"
      }
    ]
  },
  {
    "skill": "listening",
    "title": "从词听写到整段理解",
    "steps": [
      {
        "id": "listening-words",
        "title": "辨音与拼写",
        "description": "听写后逐项订正，再听写同一组。订正后的熟练不等于新材料掌握。",
        "unitIds": [
          "v-spelling",
          "v-nouns",
          "v-plurals"
        ],
        "route": "corpus"
      },
      {
        "id": "listening-phrases",
        "title": "词组、连读与句听写",
        "description": "先听整意群，再核对词尾、弱读和连接处。",
        "unitIds": [
          "v-linked",
          "v-adjectives",
          "v-verbs"
        ],
        "route": "corpus"
      },
      {
        "id": "listening-sentence",
        "title": "句听写与信息更正",
        "description": "先辨认意群，再听清时间、数量和说话者最后的决定。",
        "unitIds": [
          "v-survival"
        ],
        "route": "corpus"
      },
      {
        "id": "listening-detail",
        "title": "预测与整段定位",
        "description": "读表格预测词性，听清更正和最终答案。",
        "unitIds": [
          "45b5ab5f-cdc7-45a6-9461-0e8bf048fb01"
        ],
        "route": "corpus"
      }
    ]
  }
];

applyBankAdaptations(readingUnits, diagnosticItems);
export default { contentMetadata, diagnosticItems, readingUnits, writingUnits, speakingUnits, vocabularySets, learningPaths };
