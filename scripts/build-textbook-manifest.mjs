// Build-time only: export reviewed task definitions; never imported by the Worker.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';

const args=process.argv.slice(2),source=resolve(args[0]||'../project/sls-ielts');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const {textbookLibrary,TEXTBOOK_IDS}=await import(pathToFileURL(resolve(source,'server/textbook-curriculum.mjs')));
const {getAllGradingTasks}=await import(pathToFileURL(resolve(source,'server/grading-task-catalog.mjs')));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const books=TEXTBOOK_IDS.map(id=>{
  const book=textbookLibrary.load(id);if(!book)throw Error('Missing verified textbook '+id);
  const assets=Object.fromEntries(['json','pdf'].map(kind=>{
    const bytes=readFileSync(resolve(source,`server/materials/textbooks/${id}.${kind}`));
    const digest=sha(bytes);
    return [kind,{kind,bytes:bytes.length,sha256:digest,key:`textbooks/v1/${id}/${digest}.${kind}`,contentType:kind==='json'?'application/json; charset=utf-8':'application/pdf'}];
  }));
  return {...textbookLibrary.metadata(book),sections:textbookLibrary.sections(book),assets};
});
const tasks=getAllGradingTasks();
if(tasks.length!==526||tasks.filter(task=>task.source.type==='book').length!==500)throw Error('Unexpected task count');
const manifest={schemaVersion:1,bookCount:books.length,pageCount:books.reduce((n,b)=>n+b.pageCount,0),taskCount:500,totalTaskCount:tasks.length,books};
if(manifest.pageCount!==629)throw Error('Unexpected source page count');
mkdirSync(resolve(root,'server/materials/textbooks'),{recursive:true});
for(const [name,data] of [['textbooks/manifest.json',manifest],['grading-tasks.json',tasks]]){
  const bytes=Buffer.from(JSON.stringify(data));writeFileSync(resolve(root,'server/materials',name),bytes);
  console.log(JSON.stringify({file:name,bytes:bytes.length,gzipBytes:gzipSync(bytes).length}));
}
console.log(JSON.stringify({books:manifest.bookCount,pages:manifest.pageCount,tasks:tasks.length,textbookTasks:manifest.taskCount,sourceAssets:books.map(b=>({id:b.id,jsonBytes:b.assets.json.bytes,pdfBytes:b.assets.pdf.bytes}))}));
