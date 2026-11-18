// Private Worker-only registry. Generated from the verified school task catalogue.
// It contains task prompts and rubrics; source PDF/text pages stay in private R2.
import reviewedTasks from './materials/grading-tasks.json' with {type:'json'};

const STAGES=['foundation','supported','bridge','independent'];
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
const allTasks=freeze(reviewedTasks);
const byId=new Map(allTasks.map(task=>[task.id,task]));
if(byId.size!==allTasks.length)throw Error('批改任务编号重复。');
export const gradingTasks=Object.freeze(allTasks.filter(task=>task.source.type!=='book'));
const textbookTasks=Object.freeze(allTasks.filter(task=>task.source.type==='book'));
const bySection=new Map();
for(const task of textbookTasks){const id=task.source.sectionId;const tasks=bySection.get(id)||[];tasks.push(task);bySection.set(id,tasks);}
for(const tasks of bySection.values())Object.freeze(tasks);
export function getTextbookGradingTasks(){return textbookTasks;}
export function getSectionGradingTasks(sectionId){return bySection.get(sectionId)||[];}
export function getAllGradingTasks(){return [...allTasks];}
export function getGradingTask(id){return typeof id==='string'?byId.get(id)||null:null;}
export function gradingTaskCatalog(configured=false){return {schemaVersion:1,configured:configured===true,total:allTasks.length,tasks:allTasks.map(task=>({...task,gradingStatus:configured?'ready':'service_not_configured'}))};}

/** The same server policy is reapplied to stored feedback and client state. */
export function applyTaskPlacementPolicy(review,task){
  if(!review||typeof review!=='object')return review;
  const eligible=!!task?.placementEligible&&task.progression!=='word'&&review.placementEligible!==false;
  const sufficient=review.sampleSufficient===true&&review.placementSampleSufficient!==false;
  const claimed=review.stage??review.recommendedStage;
  const consistent=review.stage==null||review.recommendedStage==null||review.stage===review.recommendedStage;
  let stage=eligible&&sufficient&&consistent&&STAGES.includes(claimed)&&(task.skill!=='speaking'||review.audioAnalyzed===true)?claimed:null;
  if(stage&&STAGES.indexOf(stage)>STAGES.indexOf(task.maxPlacementStage))stage=task.maxPlacementStage||null;
  return {...review,taskId:task?.id||null,taskRevision:task?.revision||null,taskProgression:task?.progression||'unregistered',placementEligible:eligible,stage,recommendedStage:stage};
}
