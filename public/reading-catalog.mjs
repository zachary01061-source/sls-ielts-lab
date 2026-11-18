// Supplemental passages extend the catalog without changing its original snapshot.
export const READING_ADDITIONS_VERSION='20261118-money';
export function mergeReadingCatalog(original={},supplement={}){
 const result=[],seen=new Set();
 for(const meta of Array.isArray(original.passages)?original.passages:[]){
  if(!meta||typeof meta.id!=='string'||seen.has(meta.id))continue;
  seen.add(meta.id);result.push({...meta,subject:'reading'});
 }
 for(const meta of Array.isArray(supplement.passages)?supplement.passages:[]){
  if(!meta||typeof meta!=='object')continue;
  const id=meta.id||meta.localId;
  if(typeof id!=='string'||!id||seen.has(id)||typeof meta.file!=='string'||!/^data\/reading-additions\/passages\/[a-zA-Z0-9_-]+\.json$/.test(meta.file))continue;
  seen.add(id);result.push({...meta,id,localId:meta.localId||id,subject:'reading',supplementary:true});
 }
 return result;
}
export function passageRequestUrl(meta){
 const path='./'+String(meta.file||'').replace(/^\.\//,'');
 return meta.supplementary||path.startsWith('./data/reading-additions/')?path+(path.includes('?')?'&':'?')+'v='+READING_ADDITIONS_VERSION:path;
}
export function readingSearchText(meta){
 return [meta.title,meta.titleCn,meta.sourceTitle,meta.recent?.title,...(Array.isArray(meta.aliases)?meta.aliases:[])].filter(v=>typeof v==='string').join(' ').toLocaleLowerCase();
}
export function withoutRepeatedQuestionPrefix(text,question,passage){
 const value=String(text||'');
 if(!passage.preserveSourceNumbers)return value;
 const slot=Number(question.sourceSlot??question.sourceNumber);
 return value.replace(/^\s*\*\*(\d+)\*\*\s*/, (prefix,number)=>Number(number)===slot?'':prefix);
}
