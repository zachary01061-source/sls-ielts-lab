// Describe visible answer differences; never infer effort, ability or a cause.
export function examFeedback(detail) {
  const q = detail.question || {}, type = detail.group?.type;
  const actual = String(detail.actual ?? '').trim();
  const answers = (q.answers || []).map(String);
  if (detail.pending) return {observation: '这道题的参考答案还在核对，本题未计分。', nextStep: '先复习已核对答案的错题，本题保留你的作答。'};
  if (detail.correct) return {observation: '你的答案符合本题参考答案和填写要求。', nextStep: q.keywordPairs?.length ? '对照下方题目表达与原文表达，记住这组改写。' : '对照答案依据，确认自己能说明选择或填写这个答案的理由。'};
  if (!actual) return {observation: '这道题没有填写答案。', nextStep: '先圈出题目要找的人物、时间或信息，再从原文或录音中找依据并作答。'};
  if (detail.tooLong) return {observation: `填写内容超过本题“最多 ${q.maxWords} 个词${q.allowNumber ? '及 1 个数字' : ''}”的要求。`, nextStep: '对照参考答案删去多余内容，再检查词数和数字数量。'};
  if (detail.duplicate) return {observation: '同一组多选题重复填写了相同选项，这个答题位不能重复得分。', nextStep: '核对本组要求选择的数量，每个答题位填写一个不同选项。'};
  if (type === 'tfng' || type === 'ynng') {
    const correct = answers[0]?.toUpperCase();
    const rule = correct === 'NOT GIVEN' ? '参考答案为 NOT GIVEN，需要区分“没有提供信息”和“明确相反”。' : correct === 'FALSE' || correct === 'NO' ? '参考答案表示题目陈述与原文内容或作者观点相反。' : '参考答案表示题目陈述与原文内容或作者观点一致。';
    return {observation: `你选了 ${actual}。${rule}`, nextStep: '逐项核对题目中的对象、范围和否定词；用下方解析或原文说明依据，不用常识补充文中没有的信息。'};
  }
  if (type === 'text') {
    const normalized = actual.toLowerCase(), expected = answers[0]?.toLowerCase();
    const ending = expected && (normalized + 's' === expected || expected + 's' === normalized);
    return {observation: ending ? '填写词与参考答案相差词尾 s；本题需要核对词形。' : '填写内容与本题接受的参考答案不一致。', nextStep: detail.passage?.subject === 'listening' ? '重听答案附近的录音，对照听力原文检查关键词、拼写和词尾，再听写一次。' : '回到空格所在句和对应原文，检查要填的信息、词形与字数，再完整读一遍句子。'};
  }
  return {observation: type === 'matching' ? '选择的匹配项与本题参考答案不同。' : '选择的选项与本题参考答案不同。', nextStep: '分别核对你的选项和参考选项，找出它们在对象、范围、原因或时间上的差别，再用原文或录音核对。'};
}
