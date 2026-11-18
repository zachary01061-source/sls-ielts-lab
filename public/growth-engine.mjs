/**
 * SLS learning decisions. Pure functions: no storage, network, timers or DOM.
 * Stages describe a teaching route; practice accuracy is never converted to an IELTS band.
 */
export const SKILLS = Object.freeze(['listening', 'reading', 'writing', 'speaking']);
export const SKILL_NAMES = Object.freeze({listening: '听力', reading: '阅读', writing: '写作', speaking: '口语', foundation: '语境理解'});
export const STAGES = Object.freeze([
  Object.freeze({id: 'foundation', name: '线索辅助', description: '在完整语境中理解短文，借助关键词与选项核对信息。'}),
  Object.freeze({id: 'supported', name: '分段练习', description: '分段处理材料，练习同义表达、信息关系与答案依据。'}),
  Object.freeze({id: 'bridge', name: '完整材料', description: '减少提示，处理完整材料中的主旨、推断与逻辑关系。'}),
  Object.freeze({id: 'independent', name: '独立应用', description: '独立完成未练过的材料，记录结果、用时和老师反馈。'}),
]);
export const STAGE_POLICY = Object.freeze({minMaterials: 3, minDates: 2, minScoredItems: 18, accuracy: 0.8, evidenceDays: 42});
export const PRACTICE_NOTICE = '训练阶段用于安排材料，不等同于雅思分数。';
const STAGE_IDS = STAGES.map(stage => stage.id);
const PRODUCTIVE = new Set(['writing', 'speaking']);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const round = value => Math.round(value * 1000) / 1000;
const safeText = (value, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const copy = value => JSON.parse(JSON.stringify(value));
const isSkill = skill => SKILLS.includes(skill);
const stageIndex = stage => Math.max(0, STAGE_IDS.indexOf(stage));
const nowTime = now => finite(now) ? now : typeof now === 'string' && Number.isFinite(Date.parse(now)) ? Date.parse(now) : Date.now();
const time = value => finite(value) ? value : typeof value === 'string' && Number.isFinite(Date.parse(value)) ? Date.parse(value) : null;
const day = value => new Date(value + 8 * 3600000).toISOString().slice(0, 10);
const validBand = value => finite(value) && value >= 1 && value <= 9 && Number.isInteger(value * 2);
const percentage = (correct, total) => total > 0 ? round(correct / total) : null;
const normalizeText = value => String(value ?? '').normalize('NFKC').trim().toLocaleLowerCase('en').replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
const uniqueById = rows => [...new Map(rows.map(row => [row.id, row])).values()];
const dateOnly = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(Date.parse(value)).toISOString().slice(0, 10) === value;
const array = value => Array.isArray(value) ? value : [];
const familyId = (value, skill) => { const id = safeText(value, 160); return skill && id.startsWith(`${skill}:`) ? id.slice(skill.length + 1) : id; };
const materialKey = row => familyId(row.materialFamilyId || row.materialId, row.skill);
const b1StartingStage = (correct, total) => total ? STAGES[correct / total < .4 ? 0 : correct / total < .65 ? 1 : correct / total < .85 ? 2 : 3].id : null;
function verifiedAdaptiveBlocks(results, supplied, skill) {
  return array(supplied?.blocks).map(block => {
    const ids = new Set(array(block.itemIds));
    const rows = results.filter(row => row.skill === skill && row.scored && (row.blockId === block.blockId || ids.has(row.id)));
    return {id: block.blockId, stage: rows.every(row => row.stage === block.stage) ? block.stage : null, total: rows.length, expected: ids.size || rows.length, answered: rows.filter(row => row.answered).length, correct: rows.filter(row => row.correct).length};
  }).filter(block => STAGE_IDS.includes(block.stage) && block.total >= 6 && block.total === block.expected && block.answered === block.total);
}

export function normalizeGoals(input = {}) {
  if (!input || typeof input !== 'object') input = {};
  const skills = input.skills || input.targets || {};
  const targetDate = safeText(input.targetDate, 10);
  return {
    overall: validBand(input.overall) ? input.overall : null,
    skills: Object.fromEntries(SKILLS.map(skill => [skill, validBand(skills[skill]) ? skills[skill] : null])),
    targetDate: dateOnly(targetDate) ? targetDate : null,
    weeklyMinutes: finite(input.weeklyMinutes) ? Math.max(30, Math.min(1200, Math.round(input.weeklyMinutes))) : 150,
  };
}

export function createGrowthProfile(input = {}) {
  if (!input || typeof input !== 'object') input = {};
  return {
    version: 1,
    id: safeText(input.id, 100),
    name: safeText(input.name, 60),
    grade: safeText(input.grade, 30),
    className: safeText(input.className || input.class, 60),
    goals: normalizeGoals(input.goals),
    diagnostics: Array.isArray(input.diagnostics) ? copy(input.diagnostics) : [],
    evidence: Array.isArray(input.evidence) ? uniqueById(input.evidence.map(normalizeEvidence).filter(Boolean)) : [],
    bandAssessments: Array.isArray(input.bandAssessments) ? uniqueById(input.bandAssessments.map(normalizeBandAssessment).filter(Boolean)) : [],
  };
}

/** Objective items use accepted answers; productive tasks are retained for review. */
export function scoreDiagnostic(items = [], answers = {}, context = {}) {
  const seen = new Set();
  const results = [];
  for (const item of items) {
    if (!item || !safeText(item.id) || seen.has(item.id)) continue;
    seen.add(item.id);
    const skill = isSkill(item.skill) ? item.skill : 'foundation';
    const actual = Object.prototype.hasOwnProperty.call(answers, item.id) ? answers[item.id] : undefined;
    const manual = item.manual === true || PRODUCTIVE.has(skill);
    const accepted = Array.isArray(item.answers) ? item.answers : item.answer !== undefined ? [item.answer] : [];
    const scored = !manual && !item.unscorable && accepted.length > 0;
    const answered = Array.isArray(actual) ? actual.length > 0 : normalizeText(actual) !== '';
    let correct = false;
    if (scored && answered) {
      if (item.type === 'multi') {
        const actualSet = Array.isArray(actual) ? actual.map(normalizeText).sort() : [];
        const keySet = accepted.map(normalizeText).sort();
        correct = actualSet.length === keySet.length && actualSet.every((value, index) => value === keySet[index]);
      } else correct = accepted.some(answer => normalizeText(answer) === normalizeText(actual));
    }
    results.push({id: item.id, blockId: safeText(item.blockId, 160), skill, dimension: safeText(item.dimension || item.tag || 'general', 80), materialFamilyId: familyId(item.materialFamilyId || item.originalId, skill), stage: STAGE_IDS.includes(item.stage) ? item.stage : 'foundation', scored, answered, correct: scored ? correct : null, needsReview: manual, response: Array.isArray(actual) ? actual.map(v => safeText(String(v), 1000)) : safeText(String(actual ?? ''), 12000)});
  }
  const skillResults = Object.fromEntries(['foundation', ...SKILLS].map(skill => {
    const rows = results.filter(row => row.skill === skill);
    const scored = rows.filter(row => row.scored);
    const attempted = scored.filter(row => row.answered);
    const correct = scored.filter(row => row.correct).length;
    const dimensions = Object.fromEntries([...new Set(rows.map(row => row.dimension))].map(dimension => {
      const matching = scored.filter(row => row.dimension === dimension);
      const count = matching.filter(row => row.correct).length;
      return [dimension, {correct: count, total: matching.length, accuracy: percentage(count, matching.length)}];
    }));
    const accuracy = percentage(correct, scored.length);
    const testedStage = STAGES.reduce((highest, stage, index) => attempted.filter(row => row.stage === stage.id).length >= 3 ? index : highest, 0);
    const attemptedAccuracy = percentage(correct, attempted.length);
    const thresholdStage = attemptedAccuracy === null || attemptedAccuracy < .45 ? 0 : attemptedAccuracy < .65 ? 1 : attemptedAccuracy < .85 ? 2 : 3;
    const placed = attempted.length >= 6 && !PRODUCTIVE.has(skill);
    return [skill, {
      correct, total: scored.length, accuracy, dimensions,
      answered: rows.filter(row => row.answered).length,
      reviewCount: rows.filter(row => row.needsReview && row.answered).length,
      stage: STAGES[placed ? Math.min(testedStage, thresholdStage) : 0].id,
      provisional: true,
      status: PRODUCTIVE.has(skill) ? rows.some(row => row.answered) ? 'awaiting_review' : 'not_assessed' : attempted.length === 0 ? 'not_assessed' : attempted.length < 6 ? 'insufficient_evidence' : 'starting_point',
    }];
  }));
  const adaptive = context.adaptive?.skills ? copy(context.adaptive) : null;
  if (adaptive) for (const skill of ['foundation', 'reading', 'listening']) {
    const supplied = adaptive.skills[skill];
    if (!supplied) continue;
    const rows = results.filter(row => row.skill === skill && row.scored);
    if (adaptive.method === 'b1_entry') {
      const answered = rows.filter(row => row.answered).length, correct = rows.filter(row => row.correct).length;
      const stage = rows.length === (skill === 'foundation' ? 6 : 12) && answered >= 6 ? skill === 'foundation' ? 'foundation' : b1StartingStage(correct, rows.length) : null;
      const status = stage ? 'starting_point' : answered ? 'insufficient_evidence' : 'not_assessed';
      Object.assign(skillResults[skill], {stage, status, provisional: true});
      adaptive.skills[skill] = {...supplied, stage, status, provisional: true};
      continue;
    }
    const completeBlocks = verifiedAdaptiveBlocks(results, supplied, skill);
    const supported = completeBlocks.some(block => block.stage === supplied.stage && (stageIndex(block.stage) <= 1 || block.correct / block.total >= .8));
    const stage = STAGE_IDS.includes(supplied.stage) && supported ? supplied.stage : null;
    const status = stage ? 'starting_point' : rows.some(row => row.answered) ? 'insufficient_evidence' : 'not_assessed';
    Object.assign(skillResults[skill], {stage, status, provisional: true});
    adaptive.skills[skill] = {...supplied, stage, status, provisional: true};
  }
  return {id: safeText(context.id, 100) || 'diagnostic-' + nowTime(context.finishedAt), finishedAt: nowTime(context.finishedAt), kind: safeText(context.kind, 50) || (adaptive ? 'adaptive_diagnostic' : 'ability_diagnostic'), results, skills: skillResults, ...(adaptive ? {adaptive} : {}), notice: PRACTICE_NOTICE};
}

export function recordDiagnostic(profile, diagnostic) {
  const next = createGrowthProfile(profile);
  if (!diagnostic?.id || !diagnostic.skills || time(diagnostic.finishedAt) === null) return next;
  next.diagnostics = [...next.diagnostics.filter(item => item.id !== diagnostic.id), copy(diagnostic)].sort((a, b) => time(a.finishedAt) - time(b.finishedAt));
  return next;
}

export function normalizeEvidence(input) {
  if (!input || !isSkill(input.skill) || !safeText(input.id) || time(input.finishedAt) === null) return null;
  const scoringMode = input.scoringMode === 'self_recorded' ? 'self_recorded' : PRODUCTIVE.has(input.skill) ? 'teacher_review' : 'answer_key';
  const total = scoringMode === 'answer_key' && finite(input.total) && input.total >= 0 ? Math.floor(input.total) : 0;
  const correct = finite(input.correct) && input.correct >= 0 ? Math.min(total, Math.floor(input.correct)) : 0;
  const reviewed = input.teacherReview?.reviewed === true && safeText(input.teacherReview.reviewerName).length > 0;
  return {
    id: safeText(input.id, 160), skill: input.skill, materialId: safeText(input.materialId, 160), materialFamilyId: familyId(input.materialFamilyId, input.skill),
    finishedAt: time(input.finishedAt), stage: STAGE_IDS.includes(input.stage) ? input.stage : 'independent',
    correct, total, accuracy: percentage(correct, total),
    supported: input.supported !== false,
    seenBefore: input.seenBefore !== false,
    mode: safeText(input.mode || 'practice', 30),
    scoringMode,
    minutes: finite(input.minutes) ? Math.max(0, Math.min(600, input.minutes)) : 0,
    dimensions: input.dimensions && typeof input.dimensions === 'object' ? copy(input.dimensions) : {},
    machineStatus: safeText(input.machineStatus, 40),
    machineReview: normalizeMachineReview(input.machineReview, input.skill),
    teacherReview: reviewed ? {
      reviewed: true,
      reviewerName: safeText(input.teacherReview.reviewerName, 80),
      reviewedAt: time(input.teacherReview.reviewedAt) ?? time(input.finishedAt),
      readyForNextStage: STAGE_IDS.includes(input.teacherReview.stage) && input.teacherReview.readyForNextStage === true,
      stage: STAGE_IDS.includes(input.teacherReview.stage) ? input.teacherReview.stage : null,
      comment: safeText(input.teacherReview.comment, 2000),
    } : null,
  };
}

/** Server-owned practice feedback; it never creates a verified band assessment. */
export function normalizeMachineReview(input, skill) {
  if (!input || input.source !== 'machine' || time(input.reviewedAt) === null) return null;
  const audioAnalyzed = input.audioAnalyzed === true;
  const sampleSufficient = input.sampleSufficient === true;
  const claimed = input.stage ?? input.recommendedStage;
  const consistent = input.stage == null || input.recommendedStage == null || input.stage === input.recommendedStage;
  const placementEligible = input.placementEligible !== false && !['word', 'unregistered'].includes(input.taskProgression);
  const placementSampleSufficient = input.placementSampleSufficient !== false && sampleSufficient;
  const stage = placementEligible && placementSampleSufficient && consistent && STAGE_IDS.includes(claimed) && (skill !== 'speaking' || audioAnalyzed) ? claimed : null;
  return {source: 'machine', version: 1, reviewedAt: time(input.reviewedAt), stage, recommendedStage: stage,
    confidence: input.confidence === 'sufficient' ? 'sufficient' : 'limited', sampleSufficient, placementSampleSufficient, placementEligible, audioAnalyzed,
    taskId: safeText(input.taskId, 160) || null, taskRevision: finite(input.taskRevision) ? input.taskRevision : null, taskProgression: safeText(input.taskProgression, 40) || null,
    coverage: {wordCount: finite(input.coverage?.wordCount) ? Math.max(0, input.coverage.wordCount) : null, audioSeconds: finite(input.coverage?.audioSeconds) ? Math.max(0, input.coverage.audioSeconds) : null, unassessedCriteria: array(input.coverage?.unassessedCriteria).map(row => safeText(row, 100)).filter(Boolean)},
    feedback: safeText(input.feedback, 8000), estimatedBand: null,
    dimensions: array(input.dimensions).slice(0, 20).map(row => ({id: safeText(row.id, 80), label: safeText(row.label, 100), level: skill === 'speaking' && !audioAnalyzed && /fluency|pronunciation|发音|流利/i.test(`${row.id} ${row.label}`) ? null : finite(row.level) && row.level >= 1 && row.level <= 4 ? row.level : null, comment: safeText(row.comment, 2000), evidence: array(row.evidence).slice(0, 10).map(item => ({quote: safeText(item.quote, 1000), atSeconds: finite(item.atSeconds) && item.atSeconds >= 0 ? item.atSeconds : null}))})),
    corrections: array(input.corrections).slice(0, 30).map(row => ({original: safeText(row.original, 2000), suggestion: safeText(row.suggestion, 2000), reason: safeText(row.reason, 2000), atSeconds: finite(row.atSeconds) && row.atSeconds >= 0 ? row.atSeconds : null})),
    nextSteps: array(input.nextSteps).map(row => safeText(row, 1000)).filter(Boolean).slice(0, 10),
    transcript: typeof input.transcript === 'string' ? safeText(input.transcript, 30000) : null,
    notice: safeText(input.notice, 1000) || '自动批改用于安排练习，不作为正式考试成绩。'};
}

export function recordEvidence(profile, evidence) {
  const next = createGrowthProfile(profile);
  const normalized = normalizeEvidence(evidence);
  if (!normalized) return next;
  next.evidence = [...next.evidence.filter(item => item.id !== normalized.id), normalized].sort((a, b) => a.finishedAt - b.finishedAt);
  return next;
}

export function normalizeBandAssessment(input) {
  if (!input || !safeText(input.id) || !['official', 'teacher_mock'].includes(input.kind) || time(input.assessedAt) === null) return null;
  if (input.kind === 'teacher_mock' && !safeText(input.reviewerName)) return null;
  const bands = Object.fromEntries(SKILLS.map(skill => [skill, validBand(input.bands?.[skill]) ? input.bands[skill] : null]));
  return {id: safeText(input.id, 160), kind: input.kind, assessedAt: time(input.assessedAt), reviewerName: safeText(input.reviewerName, 80), overall: validBand(input.overall) ? input.overall : null, bands, note: safeText(input.note, 500)};
}

export function recordBandAssessment(profile, assessment) {
  const next = createGrowthProfile(profile), normalized = normalizeBandAssessment(assessment);
  if (!normalized) return next;
  next.bandAssessments = [...next.bandAssessments.filter(row => row.id !== normalized.id), normalized].sort((a, b) => a.assessedAt - b.assessedAt);
  return next;
}

function validDiagnosticRows(profile, now) {
  return (profile.diagnostics || []).filter(row => row?.skills && time(row.finishedAt) !== null && time(row.finishedAt) <= now).sort((a, b) => time(a.finishedAt) - time(b.finishedAt));
}

function eligibleEvidence(rows, stage, after, now, productive = false) {
  const firstSeen = new Map();
  for (const row of rows) if (materialKey(row) && !firstSeen.has(materialKey(row))) firstSeen.set(materialKey(row), row.id);
  return rows.filter(row => row.stage === stage && row.finishedAt > after && row.finishedAt <= now && row.finishedAt >= now - STAGE_POLICY.evidenceDays * 86400000 && row.supported === false && row.seenBefore === false && row.materialId && firstSeen.get(materialKey(row)) === row.id && (productive ? row.teacherReview?.readyForNextStage === true && row.teacherReview.reviewedAt <= now : row.total > 0 && row.accuracy >= STAGE_POLICY.accuracy));
}

function stageProgress(rows, stage, after, now, productive) {
  const eligible = eligibleEvidence(rows, stage, after, now, productive);
  const dates = new Set(eligible.map(row => day(row.finishedAt))).size;
  const items = eligible.reduce((total, row) => total + row.total, 0);
  const enough = eligible.length >= STAGE_POLICY.minMaterials && dates >= STAGE_POLICY.minDates && (productive || items >= STAGE_POLICY.minScoredItems);
  return {eligible, materials: eligible.length, dates, scoredItems: items, enough, after};
}

function historicalMastery(rows, stage, after, now, productive) {
  // Once a stage has been demonstrated, a quiet month must not erase it.
  // Each promotion still needs its evidence to fall inside one 42-day window.
  const candidates = rows.filter(row => row.stage === stage && row.finishedAt > after).map(row => productive ? Math.max(row.finishedAt, row.teacherReview?.reviewedAt || row.finishedAt) : row.finishedAt).filter(at => at <= now).sort((a, b) => a - b);
  for (const at of candidates) {
    const progress = stageProgress(rows, stage, after, at, productive);
    if (progress.enough) return {...progress, at};
  }
  return null;
}

function firstIndependent(rows) {
  const seen = new Set();
  return [...rows].sort((a, b) => a.finishedAt - b.finishedAt).filter(row => {
    if (!materialKey(row) || seen.has(materialKey(row))) return false;
    seen.add(materialKey(row));
    return !row.supported && !row.seenBefore;
  });
}

function summarizeDimensions(rows, diagnostic) {
  const totals = new Map();
  for (const [dimension, values] of Object.entries(diagnostic?.dimensions || {})) {
    if (finite(values?.total) && values.total > 0 && finite(values.correct)) totals.set(dimension, {correct: Math.max(0, Math.min(values.total, values.correct)), total: values.total});
  }
  for (const row of rows) for (const [dimension, values] of Object.entries(row.dimensions || {})) {
    if (!finite(values?.total) || values.total <= 0 || !finite(values.correct)) continue;
    const current = totals.get(dimension) || {correct: 0, total: 0};
    current.correct += Math.max(0, Math.min(values.total, values.correct)); current.total += values.total; totals.set(dimension, current);
  }
  return [...totals].map(([dimension, result]) => ({dimension, ...result, accuracy: percentage(result.correct, result.total)})).sort((a, b) => a.accuracy - b.accuracy || b.total - a.total || a.dimension.localeCompare(b.dimension));
}

/** All placements depend on observed work, never grade, age or class. */
export function buildSkillProfile(profile, {now} = {}) {
  const current = createGrowthProfile(profile), at = nowTime(now);
  const diagnostics = validDiagnosticRows(current, at);
  const diagnosticFamilies = new Map();
  for (const diagnostic of diagnostics) for (const item of array(diagnostic.results)) {
    if (!item.materialFamilyId || !item.answered) continue;
    const key = `${item.skill}:${familyId(item.materialFamilyId, item.skill)}`;
    if (!diagnosticFamilies.has(key)) diagnosticFamilies.set(key, time(diagnostic.finishedAt));
  }
  const evidence = current.evidence.filter(row => row.finishedAt <= at).map(row => {
    const seenAt = diagnosticFamilies.get(`${row.skill}:${materialKey(row)}`);
    return seenAt !== undefined && seenAt < row.finishedAt ? {...row, seenBefore: true} : row;
  });
  return Object.fromEntries(SKILLS.map(skill => {
    const productive = PRODUCTIVE.has(skill);
    const latest = [...diagnostics].reverse().find(row => productive ? row.skills?.[skill]?.reviewCount > 0 : row.skills?.[skill]?.status === 'starting_point');
    const diagnostic = latest?.skills?.[skill];
    const rows = evidence.filter(row => row.skill === skill).sort((a, b) => a.finishedAt - b.finishedAt);
    const reviews = rows.filter(row => row.teacherReview && row.teacherReview.reviewedAt <= at).sort((a, b) => a.teacherReview.reviewedAt - b.teacherReview.reviewedAt);
    const placementReviews = reviews.filter(row => STAGE_IDS.includes(row.teacherReview.stage));
    const machineReviews = rows.filter(row => row.machineReview && row.machineReview.reviewedAt <= at).sort((a, b) => a.machineReview.reviewedAt - b.machineReview.reviewedAt);
    const machinePlacements = machineReviews.filter(row => STAGE_IDS.includes(row.machineReview.stage));
    const diagnosticPending = productive && latest ? Array.isArray(latest.results)
      ? latest.results.filter(item => item.skill === skill && item.needsReview && item.answered && !rows.some(row => row.materialId === `diagnostic:${item.id}` && row.finishedAt >= time(latest.finishedAt))).length
      : diagnostic?.reviewCount || 0 : 0;
    let index = !productive && diagnostic?.status === 'starting_point' ? stageIndex(diagnostic.stage) : 0;
    let after = !productive && diagnostic?.status === 'starting_point' ? time(latest.finishedAt) : -Infinity;
    // A teacher's direct productive-skill review may set the starting stage.
    if (productive && placementReviews.length) {
      index = stageIndex(placementReviews.at(-1).teacherReview.stage);
      let first = placementReviews.length - 1;
      while (first > 0 && placementReviews[first - 1].teacherReview.stage === STAGES[index].id) first -= 1;
      after = placementReviews[first].finishedAt - 1;
    } else if (productive && machinePlacements.length) {
      index = stageIndex(machinePlacements.at(-1).machineReview.stage);
      after = machinePlacements.at(-1).finishedAt;
    }
    const promotions = [];
    let mastery = historicalMastery(rows, STAGES[index].id, after, at, productive);
    while (index < STAGES.length - 1 && mastery) {
      promotions.push({from: STAGES[index].id, to: STAGES[index + 1].id, at: mastery.at, materials: mastery.eligible.map(row => row.materialId)});
      after = mastery.at; index += 1; mastery = historicalMastery(rows, STAGES[index].id, after, at, productive);
    }
    const progress = stageProgress(rows, STAGES[index].id, after, at, productive);
    const recent = rows.filter(row => row.finishedAt >= at - STAGE_POLICY.evidenceDays * 86400000);
    const independent = firstIndependent(rows).filter(row => row.finishedAt >= at - STAGE_POLICY.evidenceDays * 86400000 && row.total > 0);
    const total = recent.reduce((sum, row) => sum + row.total, 0), correct = recent.reduce((sum, row) => sum + row.correct, 0);
    const independentTotal = independent.reduce((sum, row) => sum + row.total, 0), independentCorrect = independent.reduce((sum, row) => sum + row.correct, 0);
    const dimensions = summarizeDimensions(recent, diagnostic);
    return [skill, {
      skill, name: SKILL_NAMES[skill], stage: STAGES[index].id, stageIndex: index, stageName: STAGES[index].name,
      status: productive ? placementReviews.length ? 'teacher_reviewed' : machineReviews.length ? 'machine_reviewed' : reviews.length ? 'teacher_reviewed' : rows.length || diagnostic?.reviewCount ? 'awaiting_review' : 'not_assessed' : diagnostic?.status === 'starting_point' || promotions.length ? 'evidence_based' : rows.length ? 'practice_only' : 'not_assessed',
      placementSource: productive ? placementReviews.length ? 'teacher' : machinePlacements.length ? 'machine' : null : 'objective',
      provisional: productive ? !placementReviews.length : !promotions.length,
      accuracy: percentage(correct, total), correct, total,
      independentAccuracy: percentage(independentCorrect, independentTotal), independentTotal,
      independentMaterials: new Set(independent.map(row => row.materialId).filter(Boolean)).size,
      attempts: rows.length, recentAttempts: recent.length, supportAttempts: recent.filter(row => row.supported).length,
      reviewPending: productive ? rows.filter(row => !(row.teacherReview && row.teacherReview.reviewedAt <= at) && !(row.machineReview && row.machineReview.reviewedAt <= at)).length + diagnosticPending : 0,
      dimensions, priorities: dimensions.filter(row => row.total >= 2 && row.accuracy < .8).slice(0, 3),
      promotions,
      progress: {materials: progress.materials, dates: progress.dates, scoredItems: progress.scoredItems, requiredMaterials: STAGE_POLICY.minMaterials, requiredDates: STAGE_POLICY.minDates, requiredScoredItems: productive ? null : STAGE_POLICY.minScoredItems, remainingMaterials: Math.max(0, STAGE_POLICY.minMaterials - progress.materials)},
      teacherComment: reviews.at(-1)?.teacherReview.comment || '',
      machineComment: machineReviews.at(-1)?.machineReview.feedback || '',
      notice: productive && machinePlacements.length && !placementReviews.length ? '自动批改给出练习建议；教师确认后可以调整。' : productive && !reviews.length ? '作品与自我检查用于安排练习，批改完成后再调整。' : PRACTICE_NOTICE,
    }];
  }));
}

export function goalAttainment(profile, {now} = {}) {
  const current = createGrowthProfile(profile), at = nowTime(now);
  const assessments = current.bandAssessments.filter(row => row.assessedAt <= at).sort((a, b) => a.assessedAt - b.assessedAt);
  const values = {};
  for (const key of ['overall', ...SKILLS]) {
    const target = key === 'overall' ? current.goals.overall : current.goals.skills[key];
    const latest = [...assessments].reverse().find(row => validBand(key === 'overall' ? row.overall : row.bands[key]));
    const achieved = latest ? key === 'overall' ? latest.overall : latest.bands[key] : null;
    values[key] = {target, current: achieved, remaining: target !== null && achieved !== null ? Math.max(0, round(target - achieved)) : null, status: target === null ? 'unset' : achieved === null ? 'awaiting_assessment' : achieved >= target ? 'met' : 'in_progress', source: latest?.kind || null, assessedAt: latest?.assessedAt ?? null};
  }
  return values;
}

function bankFor(banks, skill) {
  if (Array.isArray(banks)) return banks.filter(row => (row.subject || row.skill) === skill);
  const bank = banks?.[skill]; return Array.isArray(bank) ? bank : Array.isArray(bank?.passages) ? bank.passages : [];
}

export function recommendMaterials(profile, {banks = {}, skill, limit = 3, now} = {}) {
  if (!isSkill(skill)) return [];
  const current = createGrowthProfile(profile), state = buildSkillProfile(current, {now})[skill];
  const seen = new Set(current.evidence.filter(row => row.skill === skill).map(materialKey));
  const target = current.goals.skills[skill] ?? current.goals.overall;
  return bankFor(banks, skill).filter(row => row && row.id && row.status !== 'unavailable' && row.status !== 'draft' && !(skill === 'listening' && (row.audioAvailable === false || ['missing', 'pending', 'failed'].includes(row.audioStatus || row.audio?.status)))).map(row => {
    const materialStage = STAGE_IDS.includes(row.stage || row.difficultyStage) ? row.stage || row.difficultyStage : 'independent';
    const distance = stageIndex(materialStage) - state.stageIndex;
    const tags = [...array(row.tags), ...array(row.skills), ...array(row.dimensions), ...array(row.types)];
    const matching = state.priorities.filter(priority => tags.includes(priority.dimension)).length;
    const extension = row.extension === true || row.challenge === true;
    const previouslySeen = seen.has(row.materialFamilyId || row.originalId || row.id);
    return {row, materialStage, seen: previouslySeen, distance, score: (distance === 0 ? 100 : distance === -1 ? 50 : distance > 0 ? -100 - distance * 10 : 10) + matching * 15 - (previouslySeen ? 30 : 0) + (target !== null && target >= 7.5 && extension && state.stage === 'independent' ? 15 : 0)};
  }).filter(row => row.distance <= 0).sort((a, b) => b.score - a.score || String(a.row.id).localeCompare(String(b.row.id))).slice(0, Math.max(0, Math.min(12, limit))).map(item => ({
    id: item.row.id, materialFamilyId: safeText(item.row.materialFamilyId || item.row.originalId || item.row.id, 160), title: safeText(item.row.title, 200), skill, stage: item.materialStage,
    file: safeText(item.row.file, 500), route: safeText(item.row.route, 500),
    minutes: finite(item.row.minutes) ? Math.max(5, Math.min(90, item.row.minutes)) : finite(item.row.duration) ? Math.max(5, Math.min(45, Math.ceil(item.row.duration / 60))) : 20,
    seenBefore: item.seen, reason: item.seen ? '用于复习；重复材料不计为独立完成的新材料。' : item.distance === 0 ? '完成当前阶段的一份新材料。' : '复习前一阶段的练习。',
    extension: item.row.extension === true || item.row.challenge === true,
  }));
}

/** Long-term target → current skill route → this week's manageable work. */
export function buildLearningPlan(profile, {banks = {}, now} = {}) {
  const current = createGrowthProfile(profile), at = nowTime(now), skills = buildSkillProfile(current, {now: at});
  const weekday = (new Date(at + 8 * 3600000).getUTCDay() + 6) % 7;
  const weekStartTime = Date.parse(day(at) + 'T00:00:00+08:00') - weekday * 86400000;
  const weekStart = day(weekStartTime), weekEnd = day(weekStartTime + 6 * 86400000);
  const goals = goalAttainment(current, {now: at});
  const path = buildPersonalPath(current, {banks, now: at});
  const tasks = path.weeklySteps.map(step => {
    const diagnostic = step.kind === 'diagnostic';
    return {id: `week-${weekStart}-${step.skill}-${step.kind}-${step.materialId}`, skill: step.skill, skillName: SKILL_NAMES[step.skill], stage: step.stage, minutes: step.minutes,
      type: diagnostic ? 'diagnostic' : 'material', title: step.title, materialId: diagnostic ? null : step.materialId,
      material: diagnostic ? null : {id: step.materialId, title: step.title, route: step.route, stage: step.stage}, launchable: !diagnostic && !!step.route,
      successCriterion: step.completionCriterion, completed: false, reasons: step.reasons};
  });
  return {generatedAt: at, weekStart, weekEnd, goals: current.goals, attainment: goals, skills,
    priorities: (path.focusSkills || []).map(skill => ({skill, name: SKILL_NAMES[skill], stage: path.placement.skills[skill].stage, stageName: path.placement.skills[skill].stageName, dimensions: path.placement.skills[skill].weakDimensions})),
    focusSkills: path.focusSkills || [], selectionReason: path.selectionReason || '', weeklyTasks: tasks, allocatedMinutes: path.allocatedMinutes, availableMinutes: current.goals.weeklyMinutes,
    nextReviewDate: day(weekStartTime + 7 * 86400000), milestones: SKILLS.map(skill => ({skill, title: `${SKILL_NAMES[skill]} · ${skills[skill].stageName}`, stage: skills[skill].stage, nextStage: STAGES[skills[skill].stageIndex + 1]?.id || null, progress: skills[skill].progress, description: PRODUCTIVE.has(skill) ? '根据作品中的具体反馈安排后续任务。' : '根据不同日期、不同新材料的独立表现安排后续任务。'})), notice: PRACTICE_NOTICE};
}

/** Old practice records remain usable evidence without claiming unseen/unsupported work. */
export function evidenceFromLegacyRecord(record) {
  if (!record?.id || !isSkill(record.subject || 'reading') || time(record.finishedAt) === null) return [];
  const skill = record.subject || 'reading';
  const passages = Array.isArray(record.passages) ? record.passages : [];
  const ids = [...new Set((record.passageIds || passages.map(p => p.id)).filter(Boolean))];
  if (!ids.length) return [];
  return ids.map(id => {
    const details = (record.details || []).filter(row => String(row.key || '').startsWith(id + ':') && !row.pending);
    const correct = details.filter(row => row.correct).length;
    const passage = passages.find(row => row.id === id);
    const growth = record.growthEvidence?.[id] || {};
    const dimensions = Object.create(null);
    for (const detail of details) {
      const dimension = detail.dimension || detail.type || 'general';
      dimensions[dimension] ||= {correct: 0, total: 0}; dimensions[dimension].total += 1; dimensions[dimension].correct += detail.correct ? 1 : 0;
    }
    const total = details.length || (ids.length === 1 ? Math.max(0, record.scoredTotal ?? ((record.total || 0) - (record.pending || 0))) : 0);
    return normalizeEvidence({id: `${record.id}:${id}`, skill, materialId: id, materialFamilyId: growth.materialFamilyId || passage?.materialFamilyId || passage?.originalId || id, finishedAt: record.finishedAt, stage: growth.stage || passage?.stage || 'independent', correct: details.length ? correct : ids.length === 1 ? record.correct || 0 : 0, total, supported: growth.supported, seenBefore: growth.seenBefore, mode: record.mode || 'practice', minutes: finite(record.elapsed) ? record.elapsed / 60 / ids.length : 0, dimensions});
  }).filter(Boolean);
}

function boundary(value, end = false) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (!dateOnly(value)) throw new RangeError('报告日期无效。');
    return Date.parse(value + (end ? 'T23:59:59.999+08:00' : 'T00:00:00+08:00'));
  }
  return time(value);
}

export function buildSemesterReport(profile, {start, end, now} = {}) {
  const current = createGrowthProfile(profile), at = nowTime(now);
  const from = boundary(start) ?? at - 120 * 86400000, to = Math.min(boundary(end, true) ?? at, at);
  if (from > to) throw new RangeError('报告开始日期不能晚于结束日期。');
  const entries = current.evidence.filter(row => row.finishedAt >= from && row.finishedAt <= to);
  const diagnostics = validDiagnosticRows(current, to).filter(row => time(row.finishedAt) >= from);
  const snapshots = buildSkillProfile(current, {now: to});
  const skills = Object.fromEntries(SKILLS.map(skill => {
    const rows = entries.filter(row => row.skill === skill), independent = firstIndependent(current.evidence.filter(row => row.skill === skill && row.finishedAt <= to)).filter(row => row.finishedAt >= from), reviewed = rows.filter(row => row.teacherReview && row.teacherReview.reviewedAt <= to);
    const machineReviewed = rows.filter(row => row.machineReview && row.machineReview.reviewedAt <= to);
    const reviewedIds = new Set([...reviewed, ...machineReviewed].map(row => row.id));
    const total = rows.reduce((sum, row) => sum + row.total, 0), correct = rows.reduce((sum, row) => sum + row.correct, 0);
    const independentTotal = independent.reduce((sum, row) => sum + row.total, 0), independentCorrect = independent.reduce((sum, row) => sum + row.correct, 0);
    return [skill, {name: SKILL_NAMES[skill], stage: snapshots[skill].stage, stageName: snapshots[skill].stageName, placementSource: snapshots[skill].placementSource, provisional: snapshots[skill].provisional,
      attempts: rows.length, materials: new Set(rows.map(row => row.materialId).filter(Boolean)).size, minutes: round(rows.reduce((sum, row) => sum + row.minutes, 0)), correct, total,
      accuracy: PRODUCTIVE.has(skill) ? null : percentage(correct, total), independentAccuracy: PRODUCTIVE.has(skill) ? null : percentage(independentCorrect, independentTotal), independentItems: independentTotal,
      independentMaterials: new Set(independent.map(row => row.materialId).filter(Boolean)).size, supportedAttempts: rows.filter(row => row.supported).length,
      teacherReviews: reviewed.length, machineReviews: machineReviewed.length, reviewPending: PRODUCTIVE.has(skill) ? rows.length - reviewedIds.size : 0, missingEvidence: rows.length === 0, dimensions: summarizeDimensions(rows, null),
      feedback: [...reviewed.map(row => ({source: 'teacher', date: day(row.teacherReview.reviewedAt), materialId: row.materialId, reviewerName: row.teacherReview.reviewerName, comment: row.teacherReview.comment})),
        ...machineReviewed.map(row => ({source: 'machine', date: day(row.machineReview.reviewedAt), materialId: row.materialId, reviewerName: '自动批改', comment: row.machineReview.feedback}))],
      timeline: rows.map(row => ({id: row.id, date: day(row.finishedAt), materialId: row.materialId, accuracy: PRODUCTIVE.has(skill) ? null : row.accuracy, correct: row.correct, total: row.total, supported: row.supported, seenBefore: row.seenBefore, stage: row.stage, reviewed: reviewedIds.has(row.id)}))}];
  }));
  return {version: 1, generatedAt: at, period: {start: day(from), end: day(to)}, student: {id: current.id, name: current.name, grade: current.grade, className: current.className}, goals: current.goals, attainment: goalAttainment(current, {now: to}), skills, diagnostics: diagnostics.map(row => ({id: row.id, finishedAt: row.finishedAt, skills: row.skills})), totals: {attempts: entries.length, materials: new Set(entries.filter(row => row.materialId).map(row => `${row.skill}:${row.materialId}`)).size, minutes: round(entries.reduce((sum, row) => sum + row.minutes, 0)), diagnostics: diagnostics.length, activeDays: new Set(entries.map(row => day(row.finishedAt))).size}, nextSteps: SKILLS.map(skill => ({skill, stage: snapshots[skill].stage, priorities: snapshots[skill].priorities, reviewPending: snapshots[skill].reviewPending})), missing: SKILLS.filter(skill => !entries.some(row => row.skill === skill)), notice: '仅汇总实际保存的练习与反馈；未测项目保留空白。练习正确率不换算为雅思分数。'};
}

/** Classroom routing rules, not a calibrated IELTS score or a label for a student. */
export const PLACEMENT_POLICY = Object.freeze({
  minSkillItems: 8, minDimensionItems: 6, minStageItems: 6,
  basicGapAccuracy: .65, understandingAccuracy: .7, secureAccuracy: .8,
  evidenceDays: 42, minMaterials: 3, minDates: 2,
});
const DIMENSION_NAMES = Object.freeze({
  vocabulary: '词义理解', grammar: '句子结构', word_form: '词形变化', sentence_meaning: '句意理解',
  detail: '信息定位', paraphrase: '同义改写', reference: '指代关系', logic: '句间关系',
  inference: '推断', main_idea: '段落大意', spelling: '听力词语填写', distractors: '听力细节填写',
  general: '本组题目',
});
const DIMENSION_ALIASES = Object.freeze({locating: 'detail', location: 'detail', information_location: 'detail', word_meaning: 'vocabulary', syntax: 'grammar', sentence: 'sentence_meaning', gist: 'main_idea', reason: 'logic'});
const dimensionId = (value, skill) => skill === 'listening' && value === 'distractors' ? 'detail' : DIMENSION_ALIASES[value] || value;
const ratio = value => value.total > 0 ? value.correct / value.total : null;
const basicDimensions = new Set(['vocabulary', 'grammar', 'word_form', 'sentence_meaning']);
const DIMENSION_ACTIONS = Object.freeze({
  vocabulary: '把题目中的词放回原句，比较各个词义，再选符合句意的一项。',
  grammar: '先找主语和谓语，再核对时态、单复数与句子连接。',
  word_form: '看空格在句中的位置，确定词性，再检查词尾变化。',
  sentence_meaning: '先划出句子的主要意思，再核对否定、时间和比较关系。',
  detail: '圈出题目关键词，找到原文对应句，逐项核对人物、时间和条件。',
  paraphrase: '把题目和原文中意思相同的表达配成一组，再判断答案。',
  reference: '找到代词前面的候选对象，代回原句检查是否通顺。',
  logic: '标出两句之间的原因、结果或转折，再检查连接词。',
  inference: '先列出原文明确给出的信息，再排除需要额外假设的选项。',
  main_idea: '用一句话概括整段，再比较选项是否覆盖整段内容。',
  spelling: '回听答案所在片段，核对每个字母、单复数和题目规定的字数。',
  general: '把本次答案和解析逐题对照，写出每题的答案依据。',
});
function dimensionAction(id, skill) {
  return skill === 'listening' && id === 'detail' ? '回听答案所在片段，核对前后信息；听到更正或转折时，以最后确认的内容为准。' : DIMENSION_ACTIONS[id] || DIMENSION_ACTIONS.general;
}
function dimensionObservation(row) {
  return `${row.label}答对${row.correct}/${row.total}${row.correct < row.total ? `，答错${row.total - row.correct}题` : ''}。${row.nextAction || ''}`;
}
function objectiveNextStep(result) {
  const missed = result.dimensions.filter(row => row.correct < row.total).sort((a, b) => ratio(a) - ratio(b) || b.total - a.total)[0];
  if (missed) return dimensionObservation(missed);
  if (result.observed.total) return result.observed.correct === result.observed.total ? `已记录的${result.observed.total}道作答全部正确。接着完成下面的新材料，继续核对每题依据。` : `已作答${result.observed.total}题，答对${result.observed.correct}题，答错${result.observed.total - result.observed.correct}题。先逐题对照答案与解析，再完成下面的练习。`;
  return result.reasons[0] || '可从选题页选择任务，提交后逐题查看答案。';
}
function productiveObservations(review, skill) {
  if (!review) return [];
  const correction = review.corrections.find(row => row.original && row.suggestion && row.reason);
  const reasons = correction ? [`你${skill === 'speaking' ? '说' : '写'}的“${safeText(correction.original, 240)}”可改为“${safeText(correction.suggestion, 240)}”：${safeText(correction.reason, 500)}`] : [];
  if (!correction) {
    const observed = review.dimensions.find(row => row.evidence.length && row.comment && !/样本|题量不足|记录待完善|尚无结论/.test(row.comment));
    if (observed) reasons.push(`“${safeText(observed.evidence[0].quote, 240)}”：${safeText(observed.comment, 500)}`);
  }
  const next = review.nextSteps.find(row => !/样本|题量不足|记录待完善|尚无结论/.test(row));
  if (next) reasons.push(`下一步：${next}`);
  return reasons;
}
const locatingDimensions = new Set(['detail', 'paraphrase', 'reference']);

function collectPlacementFacts(profile, skill, at) {
  const seenQuestions = new Set(), measurements = [], materials = new Set(), dates = new Set();
  const cutoff = at - PLACEMENT_POLICY.evidenceDays * 86400000;
  let diagnosticItems = 0, confirmationItems = 0, historicalItems = 0, completeBlockItems = 0, latestAdaptive = null, latestMeasurementAt = 0, latestResponses = null;
  for (const diagnostic of validDiagnosticRows(profile, at)) {
    const responseRows = array(diagnostic.results).filter(row => row.skill === skill);
    if (responseRows.length && time(diagnostic.finishedAt) >= cutoff) latestResponses = {answered: responseRows.filter(row => row.scored && row.answered).length, blank: responseRows.filter(row => row.scored && !row.answered).length, unscorable: responseRows.filter(row => !row.scored && !row.needsReview).length};
    const adaptiveSkill = diagnostic.adaptive?.skills?.[skill];
    const fullBlocks = verifiedAdaptiveBlocks(array(diagnostic.results), adaptiveSkill, skill);
    const fullIds = new Set(fullBlocks.map(row => row.id));
    const chosenBlock = fullBlocks.filter(row => row.stage === adaptiveSkill?.stage && (stageIndex(row.stage) <= 1 || row.correct / row.total >= .8)).at(-1);
    if (chosenBlock && time(diagnostic.finishedAt) >= cutoff) latestAdaptive = {...chosenBlock, at: time(diagnostic.finishedAt)};
    if (diagnostic.adaptive?.method === 'b1_entry' && time(diagnostic.finishedAt) >= cutoff) {
      const rows = array(diagnostic.results).filter(row => row.skill === skill && row.scored);
      const correct = rows.filter(row => row.correct).length, answered = rows.filter(row => row.answered).length;
      if (rows.length === (skill === 'foundation' ? 6 : 12) && answered >= 6) latestAdaptive = {stage: skill === 'foundation' ? 'foundation' : b1StartingStage(correct, rows.length), correct, total: rows.length, at: time(diagnostic.finishedAt), method: 'b1_entry'};
    }
    for (const item of array(diagnostic.results)) {
      if (item.skill !== skill || item.scored !== true || item.answered !== true || typeof item.correct !== 'boolean' || !item.id || seenQuestions.has(item.id)) continue;
      seenQuestions.add(item.id);
      if (time(diagnostic.finishedAt) < cutoff) { historicalItems++; continue; }
      const family = familyId(item.materialFamilyId, skill) || `diagnostic:${diagnostic.id}`;
      const observedStage = STAGE_IDS.includes(item.stage) && (!adaptiveSkill || diagnostic.adaptive?.method === 'b1_entry' || fullIds.has(item.blockId)) ? item.stage : null;
      measurements.push({dimension: dimensionId(item.dimension || 'general', skill), stage: observedStage, correct: item.correct ? 1 : 0, total: 1, material: family, at: time(diagnostic.finishedAt)});
      materials.add(family); dates.add(day(time(diagnostic.finishedAt))); diagnosticItems++;
      latestMeasurementAt = Math.max(latestMeasurementAt, time(diagnostic.finishedAt));
      if (fullIds.has(item.blockId)) completeBlockItems++;
      if (diagnostic.kind === 'confirmation_check') confirmationItems++;
    }
  }
  const practice = firstIndependent(profile.evidence.filter(row => row.skill === skill && row.finishedAt <= at));
  let practiceCorrect = 0, practiceTotal = 0;
  const stageMeasurements = [...measurements];
  for (const row of practice) {
    if (row.finishedAt < cutoff || row.total <= 0 || row.materialId.startsWith('diagnostic:') || materials.has(materialKey(row))) continue;
    practiceCorrect += row.correct; practiceTotal += row.total;
    latestMeasurementAt = Math.max(latestMeasurementAt, row.finishedAt);
    materials.add(materialKey(row)); dates.add(day(row.finishedAt));
    stageMeasurements.push({stage: row.stage, correct: row.correct, total: row.total});
    for (const [dimension, values] of Object.entries(row.dimensions || {})) {
      if (!finite(values?.total) || values.total <= 0 || values.total > row.total || !finite(values.correct) || values.correct < 0 || values.correct > values.total) continue;
      measurements.push({dimension: dimensionId(dimension, skill), stage: row.stage, correct: values.correct, total: values.total, material: materialKey(row), at: row.finishedAt});
    }
  }
  const dimensions = new Map();
  for (const row of measurements) {
    const item = dimensions.get(row.dimension) || {id: row.dimension, correct: 0, total: 0};
    item.correct += row.correct; item.total += row.total; dimensions.set(row.dimension, item);
  }
  const diagnosticCorrect = measurements.slice(0, diagnosticItems).reduce((sum, row) => sum + row.correct, 0);
  return {
    correct: diagnosticCorrect + practiceCorrect, total: diagnosticItems + practiceTotal,
    materials: materials.size, dates: dates.size, diagnosticItems, confirmationItems, historicalItems, completeBlockItems, latestResponses,
    latestAdaptive: latestAdaptive && latestAdaptive.at >= latestMeasurementAt ? latestAdaptive : null,
    dimensions: [...dimensions.values()].map(row => ({...row, label: skill === 'listening' && row.id === 'detail' ? '听力信息核对' : DIMENSION_NAMES[row.id] || row.id, accuracy: percentage(row.correct, row.total), nextAction: dimensionAction(row.id, skill), sampleStatus: row.total >= PLACEMENT_POLICY.minDimensionItems ? 'sufficient' : 'limited'})),
    stages: STAGES.map(stage => {
      const rows = stageMeasurements.filter(row => row.stage === stage.id);
      return {stage: stage.id, correct: rows.reduce((sum, row) => sum + row.correct, 0), total: rows.reduce((sum, row) => sum + row.total, 0)};
    }),
  };
}

function combineDimensions(facts, ids) {
  return facts.dimensions.filter(row => ids.has(row.id)).reduce((sum, row) => ({correct: sum.correct + row.correct, total: sum.total + row.total}), {correct: 0, total: 0});
}

function objectivePlacement(skill, facts, sharedBasics) {
  const name = SKILL_NAMES[skill], reasons = [];
  const basics = skill === 'foundation' ? combineDimensions(facts, basicDimensions) : sharedBasics;
  const ownBasics = combineDimensions(facts, basicDimensions);
  const basicGap = basics.total >= 6 && ratio(basics) < PLACEMENT_POLICY.basicGapAccuracy;
  const understandingReady = basics.total >= 6 && ratio(basics) >= PLACEMENT_POLICY.understandingAccuracy;
  const reliableGaps = facts.dimensions.filter(row => row.total >= 6 && ratio(row) < .8).sort((a, b) => ratio(a) - ratio(b) || b.total - a.total);
  const thin = facts.dimensions.filter(row => row.total < 6).sort((a, b) => ratio(a) - ratio(b) || b.total - a.total);
  let stage = null;
  const enough = facts.total >= PLACEMENT_POLICY.minSkillItems || facts.confirmationItems >= 6 || facts.completeBlockItems >= 6;
  if (!facts.total) reasons.push(facts.latestResponses?.blank || facts.latestResponses?.unscorable ? `${name}${facts.latestResponses.blank ? `有${facts.latestResponses.blank}题未填写答案` : ''}${facts.latestResponses.blank && facts.latestResponses.unscorable ? '，' : ''}${facts.latestResponses.unscorable ? `有${facts.latestResponses.unscorable}题未能计分` : ''}。可从选题页选择任务，提交后逐题查看答案。` : facts.historicalItems ? `${name}最近42天没有新的作答，先做一份练习。` : `${name}尚未提交答案。可从选题页选择任务，提交后逐题查看答案。`);
  else if (!enough) reasons.push(`${name}已作答${facts.total}题，答对${facts.correct}题${facts.correct < facts.total ? `，答错${facts.total - facts.correct}题` : ''}。继续用有语境的材料练习，逐题核对答案依据。`);
  else {
    if (skill === 'foundation') {
      if (basicGap) { stage = 'foundation'; reasons.push(`词义和句子题答对${basics.correct}/${basics.total}。接下来在短文中核对词义和句意。`); }
      else if (understandingReady) { stage = 'supported'; reasons.push(`词义和句子题答对${basics.correct}/${basics.total}。接着检查同义改写和句间关系。`); }
    } else if ((ownBasics.total >= 6 && ratio(ownBasics) < .65) || (basicGap && ratio(facts) < .65)) {
      const basis = ownBasics.total >= 6 ? ownBasics : basics;
      stage = 'foundation'; reasons.push(`词义和句子题答对${basis.correct}/${basis.total}，${name}答对${facts.correct}/${facts.total}。先用短文中的关键词和上下句核对信息。`);
    } else {
      const independent = facts.stages.find(row => row.stage === 'independent');
      const harder = facts.stages.filter(row => ['bridge', 'independent'].includes(row.stage)).reduce((sum, row) => ({correct: sum.correct + row.correct, total: sum.total + row.total}), {correct: 0, total: 0});
      const introductory = facts.stages.filter(row => ['foundation', 'supported'].includes(row.stage)).reduce((sum, row) => ({correct: sum.correct + row.correct, total: sum.total + row.total}), {correct: 0, total: 0});
      if (independent.total >= 6 && ratio(independent) >= .8) { stage = 'independent'; reasons.push(`独立应用题答对${independent.correct}/${independent.total}。接着独立完成不同主题的新材料。`); }
      else if (harder.total >= 6 && ratio(harder) >= .8) { stage = 'bridge'; reasons.push(`衔接及独立应用题答对${harder.correct}/${harder.total}。继续练完整材料，减少提示。`); }
      else if ((introductory.total >= 6 && ratio(introductory) >= .65) || (understandingReady && reliableGaps.some(row => locatingDimensions.has(row.id))) || (skill === 'listening' && introductory.total >= 8)) {
        stage = 'supported'; reasons.push(`${name}基础及有提示题答对${introductory.correct}/${introductory.total}。先按题目练定位、核对答案依据。`);
      }
    }
    if (!stage) reasons.push(`${name}答对${facts.correct}/${facts.total}。接着用有语境的材料核对答案依据，再按实际作答调整。`);
  }
  if (facts.latestAdaptive) {
    stage = facts.latestAdaptive.stage;
    reasons.splice(0, reasons.length, facts.latestAdaptive.method === 'b1_entry' ? `这轮${name}题答对${facts.latestAdaptive.correct}/${facts.latestAdaptive.total}。先从“${STAGES.find(row => row.id === stage).name}”练起，后面按每天的作答调整。` : `${name}本轮共答对${facts.correct}/${facts.total}；“${STAGES.find(row => row.id === stage).name}”题组答对${facts.latestAdaptive.correct}/${facts.latestAdaptive.total}。先按这一组的要求练习，再用新材料检查。`);
  }
  for (const gap of reliableGaps.slice(0, 2)) reasons.push(dimensionObservation(gap));
  for (const row of thin.filter(row => row.correct < row.total).slice(0, 1)) reasons.push(dimensionObservation(row));
  if (facts.total && facts.latestResponses?.blank) reasons.push(`另有${facts.latestResponses.blank}题未填写答案；可在本次答案记录中查看题目。`);
  const demonstrated = facts.materials >= 3 && facts.dates >= 2 && facts.total >= 18;
  return {
    skill, name, status: !facts.total ? 'not_assessed' : !stage ? 'insufficient_evidence' : 'provisional',
    stage, stageName: stage ? STAGES.find(row => row.id === stage).name : null,
    confidence: !facts.total ? 'none' : demonstrated && stage ? 'developing' : 'limited',
    observed: {correct: facts.correct, total: facts.total, blank: facts.latestResponses?.blank || 0, unscorable: facts.latestResponses?.unscorable || 0, materials: facts.materials, dates: facts.dates, diagnosticItems: facts.diagnosticItems, confirmationItems: facts.confirmationItems},
    dimensions: facts.dimensions, stages: facts.stages, reasons,
    needsConfirmation: false,
    needsMorePracticeEvidence: !stage || !demonstrated || thin.some(row => row.correct < row.total),
    weakDimensions: (facts.latestAdaptive?.method === 'b1_entry' ? facts.dimensions.filter(row => row.correct < row.total).sort((a, b) => ratio(a) - ratio(b) || b.total - a.total) : reliableGaps).map(row => row.id),
    confirmationTargets: [...thin.map(row => row.id), ...reliableGaps.map(row => row.id)],
    nextStage: stage ? STAGES[stageIndex(stage) + 1]?.id || null : null,
  };
}

/** First attempts are combined across the initial test and later checks, per question. */
export function buildPlacementReport(profile, {banks = {}, now} = {}) {
  const current = createGrowthProfile(profile), at = nowTime(now);
  const foundationFacts = collectPlacementFacts(current, 'foundation', at);
  const basics = combineDimensions(foundationFacts, basicDimensions);
  const foundation = objectivePlacement('foundation', foundationFacts, basics);
  const legacySkills = buildSkillProfile(current, {now: at});
  const skills = Object.fromEntries(SKILLS.map(skill => {
    if (!PRODUCTIVE.has(skill)) {
      const observed = objectivePlacement(skill, collectPlacementFacts(current, skill, at), basics);
      const demonstrated = legacySkills[skill];
      if (demonstrated.promotions.length && (!observed.stage || stageIndex(demonstrated.stage) > stageIndex(observed.stage))) {
        const latest = demonstrated.promotions.at(-1);
        observed.stage = demonstrated.stage; observed.stageName = demonstrated.stageName;
        observed.status = 'provisional'; observed.confidence = 'developing'; observed.needsMorePracticeEvidence = false;
        observed.nextStage = STAGES[stageIndex(demonstrated.stage) + 1]?.id || null;
        observed.reasons.unshift(`日常练习已在不同日期独立完成${latest.materials.length}份新材料，每份答对80%以上。接着练“${demonstrated.stageName}”。`);
      }
      return [skill, observed];
    }
    const reviews = current.evidence.filter(row => row.skill === skill && row.finishedAt <= at && row.teacherReview?.reviewedAt <= at).sort((a, b) => a.teacherReview.reviewedAt - b.teacherReview.reviewedAt);
    const placements = reviews.filter(row => STAGE_IDS.includes(row.teacherReview.stage));
    const machineReviews = current.evidence.filter(row => row.skill === skill && row.finishedAt <= at && row.machineReview?.reviewedAt <= at).sort((a, b) => a.machineReview.reviewedAt - b.machineReview.reviewedAt);
    const machinePlacements = machineReviews.filter(row => STAGE_IDS.includes(row.machineReview.stage));
    const pending = legacySkills[skill].reviewPending;
    const stage = placements.length || machinePlacements.length ? legacySkills[skill].stage : null;
    const source = placements.length ? 'teacher' : machinePlacements.length ? 'machine' : null;
    const machineReview = machineReviews.at(-1)?.machineReview || null;
    const latestWork = current.evidence.filter(row => row.skill === skill && row.finishedAt <= at).sort((a, b) => a.finishedAt - b.finishedAt).at(-1);
    const workLabel = skill === 'speaking' ? '录音' : '作文';
    const pendingReason = latestWork?.machineStatus === 'not_configured' ? `本次${workLabel}已保存，自动批改尚未开通。可以继续下面的练习，开通后由管理员发起批改。` : latestWork?.machineStatus === 'needs_audio' ? '本次保存了文字提纲，还没有提交录音。请按下面的题目录音，提交后查看口语批改。' : latestWork?.machineStatus === 'failed' ? `本次${workLabel}已保存，自动批改没有完成。可在作品记录中重试，先继续下面的练习。` : latestWork?.machineStatus === 'processing' ? `正在批改本次${workLabel}，完成后会显示具体修改意见。可以先继续下面的练习。` : latestWork?.machineStatus === 'queued' ? `本次${workLabel}已进入批改队列。可以先继续下面的练习。` : `有${pending}份作品尚未批改完成，可以先做下面的练习。`;
    const reason = stage ? source === 'teacher' ? `老师安排从“${STAGES.find(row => row.id === stage).name}”开始。按反馈修改后，再提交新作品。` : `自动批改建议先练“${STAGES.find(row => row.id === stage).name}”。后面按新作品调整。` : machineReview ? skill === 'speaking' && !machineReview.audioAnalyzed ? '本次批改只处理了文字，尚未评价发音和流利度。请提交下面任务的录音。' : '先按这份作业的修改建议练习，再完成下面的任务。' : pending ? pendingReason : `还没有提交${workLabel}。可从${SKILL_NAMES[skill]}页选择任务，提交后查看批改。`;
    const reasons = [reason, ...productiveObservations(machineReview, skill)];
    const teacherComment = reviews.at(-1)?.teacherReview.comment;
    if (source === 'teacher' && teacherComment) reasons.splice(1, 0, teacherComment);
    const reviewTargetMap = {task:['paragraph','argument'],coherence:['cohesion','argument'],vocabulary:['vocabulary'],grammar:['grammar','sentence'],fluency:['development','cohesion'],pronunciation:['pronunciation']};
    const reviewTargets = [...new Set((machineReview?.dimensions || []).filter(row => row.level !== null && row.level < 3 && row.evidence?.length).flatMap(row => reviewTargetMap[row.id] || []))];
    return [skill, {skill, name: SKILL_NAMES[skill], status: source === 'teacher' ? 'teacher_reviewed' : machineReviews.length ? 'machine_reviewed' : reviews.length || pending ? 'awaiting_review' : 'not_assessed', stage, stageName: stage ? STAGES.find(row => row.id === stage).name : null, placementSource: source, provisional: source !== 'teacher', confidence: source === 'teacher' ? 'developing' : source === 'machine' ? 'limited' : 'none', observed: {correct: null, total: 0, materials: current.evidence.filter(row => row.skill === skill && row.finishedAt <= at).length, dates: 0, diagnosticItems: 0, confirmationItems: 0}, dimensions: [], reviewDimensions: machineReview?.dimensions || [], reviewAudioAnalyzed: machineReview?.audioAnalyzed === true, reviewCorrections: machineReview?.corrections || [], reviewNextSteps: machineReview?.nextSteps || [], stages: [], reasons, needsConfirmation: false, weakDimensions: reviewTargets, confirmationTargets: [], nextStage: stage ? STAGES[stageIndex(stage) + 1]?.id || null : null, reviewPending: pending}];
  }));
  return {generatedAt: at, hasDiagnostic: validDiagnosticRows(current, at).some(row => row.adaptive?.method === 'b1_entry' && row.adaptive.complete === true || array(row.results).some(item => item.answered && (item.scored || item.needsReview))), foundation, skills, policy: {...PLACEMENT_POLICY, explanation: 'B1难度附近的一次测评用于安排第一轮练习；答对不足40%、40%至不足65%、65%至不足85%、85%以上分别安排四种练习。之后按日常作答调整，不换算雅思或CEFR成绩。'}, notice: PRACTICE_NOTICE};
}

function annotatedMaterials(banks) {
  const rows = Array.isArray(banks) ? banks : [...array(banks?.learningMaterials), ...['foundation', ...SKILLS].flatMap(skill => bankFor(banks, skill).map(row => ({...row, skill: row.skill || row.subject || skill})))];
  return uniqueById(rows.filter(row => row && row.id && (row.skill === 'foundation' || isSkill(row.skill || row.subject))).map(row => ({...row, skill: row.skill || row.subject}))).filter(row => {
    const route = safeText(row.route, 500).replace(/^#/, '');
    return row.selectionEligible !== false && STAGE_IDS.includes(row.stage) && array(row.skillTargets).length > 0 && safeText(row.sourceKind, 80) && /^[a-z][a-z0-9-]*(?:\/[\w.:%-]+)*$/i.test(route) && row.status !== 'draft' && row.status !== 'unavailable' && row.audioAvailable !== false && !['missing', 'pending', 'failed'].includes(row.audioStatus || row.audio?.status);
  }).map(row => ({...row, route: row.route.replace(/^#/, ''), skillTargets: [...new Set(row.skillTargets.map(value => dimensionId(value, row.skill)))]}));
}

function schedulePersonalPath(path, goals, at) {
  const daysRemaining = goals.targetDate ? Math.round((Date.parse(goals.targetDate) - Date.parse(day(at))) / 86400000) : null;
  const budgetMinutes = daysRemaining !== null && daysRemaining >= 0 && daysRemaining < 6 ? Math.floor(goals.weeklyMinutes * (daysRemaining + 1) / 7) : goals.weeklyMinutes;
  const weeklySteps = [], remainingSteps = [];
  let allocatedMinutes = 0, sequenceFull = false;
  for (const step of path.steps) {
    if (step.minutes === null) { if (!weeklySteps.length) weeklySteps.push(step); else remainingSteps.push(step); continue; }
    if (sequenceFull || allocatedMinutes + step.minutes > budgetMinutes) { sequenceFull = true; remainingSteps.push(step); }
    else { weeklySteps.push(step); allocatedMinutes += step.minutes; }
  }
  return {...path, weeklySteps, remainingSteps, allocatedMinutes, budgetMinutes, availableMinutes: goals.weeklyMinutes,
    deadline: {targetDate: goals.targetDate, daysRemaining, overdue: daysRemaining !== null && daysRemaining < 0},
    budgetNotice: '任务时间为预留时间，实际用时按作答记录；本周完成前面的任务，其余顺延。'};
}

/** Every assigned step points to a real, annotated task and explains its observed reason. */
export function buildPersonalPath(profile, {banks = {}, now, limit = 8} = {}) {
  const current = createGrowthProfile(profile), at = nowTime(now), placement = buildPlacementReport(current, {banks, now: at});
  const materials = annotatedMaterials(banks), steps = [], unresolved = [], chosen = new Set();
  const chosenRoutes = new Map();
  const familiar = new Set(current.evidence.filter(row => row.finishedAt <= at).map(row => `${row.skill}:${materialKey(row)}`));
  const isFamiliar = row => {
    const id = familyId(row.materialFamilyId || row.originalId || row.id, row.skill);
    const routeSkill = /^(writing|speaking)\//.exec(row.route || '')?.[1];
    return familiar.has(`${row.skill}:${id}`) || !!routeSkill && familiar.has(`${routeSkill}:${id}`);
  };
  const completedChecks = new Set();
  for (const diagnostic of validDiagnosticRows(current, at)) {
    if (array(diagnostic.results).some(row => row.scored)) { if (diagnostic.checkId) completedChecks.add(diagnostic.checkId); }
    for (const row of array(diagnostic.results)) if (row.materialFamilyId && row.answered) familiar.add(`${row.skill}:${familyId(row.materialFamilyId, row.skill)}`);
  }
  const nextCheck = {requiredMaterials: STAGE_POLICY.minMaterials, requiredDates: STAGE_POLICY.minDates, accuracy: STAGE_POLICY.accuracy, requiredScoredItems: STAGE_POLICY.minScoredItems, tasks: [], bySkill: {}, description: '日常练习中，在至少2天内独立完成3份新材料，每份答对80%，合计至少18题后安排下一阶段；不用另做一次测评。'};
  const selfSelect = SKILLS.map(skill => ({skill, route: skill === 'reading' ? 'library' : skill === 'listening' ? 'listening' : skill, reason: skill === 'reading' || skill === 'listening' ? '未标注训练阶段和小项的原题保留自选，不自动加入个人任务。' : '可以浏览其他任务；后续练习按作品批改结果调整。'}));
  if (!placement.hasDiagnostic) return schedulePersonalPath({placement, steps: [{id: 'initial-diagnostic', skill: 'foundation', kind: 'diagnostic', materialId: 'initial-diagnostic', title: '完成首次能力测评', route: 'diagnostic', stage: null, targets: [], questionIds: [], questionCount: null, minutes: null, reasons: ['完成这次作答后，按实际需要安排接下来的练习。'], evidence: [], completionCriterion: '按题目要求作答；音频无法播放时如实标记。'}], selfSelect, unresolved: [], nextCheck}, current.goals, at);
  // A plan follows observed needs, not a checklist of four subjects. Missing work
  // never counts as an error or as evidence for a low starting level.
  const allSkills = SKILLS.map(skill => placement.skills[skill]);
  const issueWeight = result => PRODUCTIVE.has(result.skill)
    ? result.reviewCorrections.length * 8 + result.reviewDimensions.filter(row => row.level !== null && row.level < 3 && row.evidence.length).length * 12
    : result.observed.total ? 100 * (result.observed.total - result.observed.correct) / result.observed.total + Math.min(12, result.observed.total - result.observed.correct) : 0;
  const hasIssue = result => PRODUCTIVE.has(result.skill)
    ? (result.skill !== 'speaking' || result.reviewAudioAnalyzed || result.placementSource === 'teacher') && (result.reviewCorrections.length > 0 || result.reviewDimensions.some(row => row.level !== null && row.level < 3 && row.evidence.length) || result.placementSource === 'teacher')
    : result.observed.total > result.observed.correct;
  let candidates = allSkills.filter(hasIssue).map(result => ({...result, selectedFor: PRODUCTIVE.has(result.skill) ? 'review_feedback' : 'observed_error'}));
  const contextualGaps = placement.foundation.dimensions.filter(row => row.correct < row.total);
  const readingIssue = candidates.find(row => row.skill === 'reading');
  if (contextualGaps.length && readingIssue) readingIssue.contextObservations = contextualGaps;
  if (contextualGaps.length && !readingIssue) {
    // Sentence observations guide support within a reading, never an isolated
    // plural-ending course or a forced writing assignment.
    const reading = placement.skills.reading;
    candidates.push({...reading, selectedFor: 'context_support', assignmentStage: reading.stage || 'supported', contextObservations: contextualGaps});
  }
  candidates.sort((a, b) => issueWeight(b) - issueWeight(a) || Number(a.selectedFor === 'context_support') - Number(b.selectedFor === 'context_support') || SKILLS.indexOf(a.skill) - SKILLS.indexOf(b.skill));
  let facts = candidates.slice(0, 2);
  if (!facts.length) {
    // A fully correct response leads to one new application/challenge. Completely
    // unanswered work leaves the subject chooser available without guessing level.
    const measured = allSkills.filter(result => result.stage && (result.observed.total > 0 || result.placementSource));
    measured.sort((a, b) => Number(current.goals.skills[b.skill] !== null) - Number(current.goals.skills[a.skill] !== null) || stageIndex(b.stage) - stageIndex(a.stage) || SKILLS.indexOf(a.skill) - SKILLS.indexOf(b.skill));
    facts = measured.slice(0, 1).map(result => ({...result, selectedFor: 'application'}));
  }
  const focusSkills = facts.map(result => result.skill);
  const selectionReason = candidates.length ? `这轮先处理${facts.map(result => result.name).join('、')}中已经出现的问题；其他科目保留选题入口。` : facts.length ? `这轮先做一份${facts[0].name}新材料，继续应用已经完成的内容。` : '当前没有可据以安排专项练习的作答。可以从下方选择一份感兴趣的任务；未提交的项目不作难度判断。';
  const pushStep = (material, result, kind, targets, reason, destination = steps) => {
    if (destination === steps) chosen.add(material.id);
    const observedDimensions = result.selectedFor === 'context_support' ? array(result.contextObservations) : result.dimensions.filter(row => targets.includes(row.id));
    const evidence = observedDimensions.map(row => ({dimension: row.id, label: row.label, correct: row.correct, total: row.total, ...(result.selectedFor === 'context_support' ? {sourceSkill: 'foundation'} : {})}));
    const reasons = evidence.map(row => dimensionObservation({...row, nextAction: dimensionAction(row.dimension, result.skill)}));
    if (result.contextObservations) reasons.push(...result.contextObservations.slice(0, 2).map(dimensionObservation), '把这些词句放进短文核对意思，再完成有上下文的题目。');
    reasons.push(reason);
    const seenBefore = isFamiliar(material);
    if (seenBefore) reasons.push('这个主题练过，作为复习；不计入独立完成的新材料。');
    const existing = destination === steps ? chosenRoutes.get(material.route) : null;
    if (existing) {
      existing.reasons = [...new Set([...existing.reasons, ...reasons])];
      existing.relatedSkills = [...new Set([...(existing.relatedSkills || [existing.skill]), result.skill])];
      if (material.route.startsWith(`${result.skill}/`)) existing.skill = result.skill;
      return existing;
    }
    const focusQuestionIds = array(material.questionTargets).filter(row => targets.includes(dimensionId(row.dimension, result.skill))).map(row => row.id);
    destination.push({id: `${kind}:${material.id}`, skill: result.skill, kind, purpose: material.purpose || null, assignmentBasis: result.selectedFor === 'context_support' ? 'context_support' : result.selectedFor === 'application' ? 'application' : kind === 'confirm' ? 'confirmation' : targets.length ? 'dimension_practice' : 'stage_practice', materialId: material.id, materialFamilyId: familyId(material.materialFamilyId || material.originalId || material.id, result.skill), title: safeText(material.title, 200), route: material.route, stage: material.stage, seenBefore, targets, questionIds: array(material.questionIds), focusQuestionIds, focusQuestionNumbers: focusQuestionIds.map(id => array(material.questionIds).indexOf(id) + 1).filter(n => n > 0), questionCount: finite(material.questionCount) ? material.questionCount : array(material.questionIds).length || null, minutes: finite(material.minutes) ? material.minutes : null, scoringMode: material.scoringMode || 'answer_key', sourceKind: material.sourceKind, stageBasis: material.stageBasis || null, reasons, evidence, completionCriterion: safeText(material.completionCriterion, 500) || (kind === 'confirm' ? '独立作答，不先看提示或答案；保存第一次结果。' : PRODUCTIVE.has(result.skill) ? '提交作品，按老师反馈修改。' : '先独立作答；再核对错题，写下每题的答案依据。')});
    const added = destination.at(-1);
    if (destination === steps) chosenRoutes.set(material.route, added);
    return added;
  };
  for (const result of facts) {
    if (steps.length >= limit) break;
    const available = materials.filter(row => row.skill === result.skill && !chosen.has(row.id));
    const unseen = available.filter(row => !isFamiliar(row) && !completedChecks.has(row.checkId || row.id));
    if (PRODUCTIVE.has(result.skill)) {
      if (result.reviewPending || (result.status === 'awaiting_review' && !result.stage)) {
        unresolved.push({skill: result.skill, dimensions: [], reason: result.reasons[0]});
      }
      const assignmentStage = STAGES[Math.max(stageIndex('supported'), stageIndex(result.stage || 'supported'))].id;
      const targetMatch = row => row.skillTargets.filter(target => result.weakDimensions.includes(target)).length;
      const task = available.filter(row => !['confirm', 'checkpoint'].includes(row.kind) && row.stage === assignmentStage).sort((a, b) => Number(isFamiliar(a)) - Number(isFamiliar(b)) || targetMatch(b) - targetMatch(a) || Number(b.sourceKind === 'book_adaptation') - Number(a.sourceKind === 'book_adaptation') || String(a.id).localeCompare(String(b.id)))[0];
      if (task) {
        const matchedTargets = result.weakDimensions.length ? task.skillTargets.filter(target => result.weakDimensions.includes(target)) : result.stage ? task.skillTargets : [];
        const appliesFeedback = result.weakDimensions.length > 0 && matchedTargets.length === 0;
        const reviewAction = result.reviewNextSteps?.[0];
        const reason = appliesFeedback ? `在一份新作品中应用上次的修改。${reviewAction ? `完成后重点检查：${reviewAction}` : '先查看上次批改中的具体修改，再检查这次是否仍有同样的问题。'}` : reviewAction ? `先练习：${reviewAction} 再完成这份作品。` : result.stage ? result.placementSource === 'machine' ? '按这次自动批改的建议完成下一份作品。' : '按老师指定的阶段完成这份作品。' : '先完成这项练习，提交后按具体修改建议练习。';
        const added = pushStep(task, result, isFamiliar(task) ? 'review' : 'train', matchedTargets, reason);
        if (appliesFeedback) added.assignmentBasis = 'feedback_application';
        if (!result.stage) { added.purpose = 'focused_practice'; if (result.selectedFor !== 'context_support') added.assignmentBasis = 'observed_practice'; }
      }
      else unresolved.push({skill: result.skill, dimensions: [], reason: result.stage ? '当前阶段还没有标注好的新任务，先按老师反馈修改已交作品。' : `还没有${result.name}阶段安排，先完成测评中的表达任务。`});
      continue;
    }
    if (result.skill === 'foundation' && result.observed.total >= 6 && ratio(result.observed) >= .8 && !result.weakDimensions.length) continue;
    const match = (row, ids) => row.skillTargets.filter(id => ids.includes(id)).length;
    if (steps.length >= limit) continue;
    const preferredStage = result.assignmentStage || result.stage || 'supported';
    const challengeStage = result.selectedFor === 'application' && result.nextStage && available.some(row => row.stage === result.nextStage) ? result.nextStage : null;
    const taskStage = challengeStage || preferredStage;
    const trainTargets = result.weakDimensions.length ? result.weakDimensions : result.dimensions.filter(row => row.correct < row.total || row.total >= 6).map(row => row.id);
    const stageMaterials = available.filter(row => !['confirm', 'checkpoint'].includes(row.kind) && row.stage === taskStage);
    const matching = stageMaterials.filter(row => trainTargets.length && match(row, trainTargets)).sort((a, b) => Number(isFamiliar(a)) - Number(isFamiliar(b)) || Number(b.sourceKind === 'school_adaptation') - Number(a.sourceKind === 'school_adaptation') || match(b, trainTargets) - match(a, trainTargets) || String(a.id).localeCompare(String(b.id)));
    const listeningStarter = result.skill === 'listening' && result.selectedFor === 'observed_error' && taskStage === 'foundation' ? stageMaterials.find(row => row.stageStarter && row.scoringMode === 'self_recorded') : null;
    const task = listeningStarter || matching[0] || stageMaterials.sort((a, b) => Number(b.stageStarter === true) - Number(a.stageStarter === true) || Number(isFamiliar(a)) - Number(isFamiliar(b)) || String(a.id).localeCompare(String(b.id)))[0];
    if (task) {
      const targets = matching.includes(task) ? task.skillTargets.filter(id => trainTargets.includes(id)) : [];
      const added = pushStep(task, result, isFamiliar(task) ? 'review' : 'train', targets, result.selectedFor === 'application' ? '本次已作答题目均已完成。用一份新材料继续应用；这项任务不表示已出现失分。' : result.selectedFor === 'context_support' ? '阅读短文后核对信息和句间关系，按需要查看线索。' : !result.stage ? objectiveNextStep(result) : !targets.length ? `已记录的${result.name}题答对${result.observed.correct}/${result.observed.total}。${objectiveNextStep(result)}` : taskStage === 'foundation' ? '先通读这篇有语境的材料，再借助线索完成题目；提交后核对依据。' : taskStage === 'supported' ? '先作答，再用提示找到原文或录音中的依据。' : taskStage === 'bridge' ? '完成整段材料；遇到困难再打开提示，并如实记录。' : '独立完成这份新材料，保存结果和用时。');
      if (!result.stage) { added.purpose = 'focused_practice'; if (result.selectedFor !== 'context_support') added.assignmentBasis = 'observed_practice'; }
      if (listeningStarter && steps.length < limit) {
        const daily = matching.find(row => row !== task && row.scoringMode !== 'self_recorded') || stageMaterials.find(row => row !== task && row.scoringMode !== 'self_recorded');
        if (daily) pushStep(daily, result, isFamiliar(daily) ? 'review' : 'train', daily.skillTargets.filter(id => trainTargets.includes(id)), '听写后做这段录音的题目，保存第一次作答结果。这是日常练习，不另设测评。');
      }
    } else unresolved.push({skill: result.skill, dimensions: trainTargets, reason: '当前目录没有合适的已标注练习，先继续其他项目。'});
  }
  for (const result of facts.filter(row => row.stage && !PRODUCTIVE.has(row.skill))) {
    const rows = current.evidence.filter(row => row.skill === result.skill && row.finishedAt <= at).sort((a, b) => a.finishedAt - b.finishedAt);
    const progress = stageProgress(rows, result.stage, -Infinity, at, false);
    nextCheck.bySkill[result.skill] = {stage: result.stage, materials: progress.materials, dates: progress.dates, scoredItems: progress.scoredItems};
  }
  return schedulePersonalPath({placement, steps, selfSelect, unresolved, nextCheck, focusSkills, selectionReason}, current.goals, at);
}
