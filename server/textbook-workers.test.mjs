import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {handleTextbookRequest,TEXTBOOK_IMPORT_MANIFEST,createTextbookLibrary} from './textbook-curriculum.mjs';
import {getAllGradingTasks,getGradingTask,getSectionGradingTasks,getTextbookGradingTasks} from './grading-task-catalog.mjs';

const origin='https://school.example',active={id:'s1',role:'student',status:'active'},admin={id:'a1',role:'admin',status:'active'};
const source=resolve(process.env.SLS_TEXTBOOK_SOURCE||'../project/sls-ielts/server/materials/textbooks');
const sourceExists=existsSync(resolve(source,'writing.json'));
class MemoryBucket{
  rows=new Map();puts=0;
  async head(key){const row=this.rows.get(key);return row?{size:row.bytes.length,customMetadata:row.customMetadata}:null;}
  async put(key,body,options){this.puts++;this.rows.set(key,{bytes:Buffer.from(body),...options});}
  async get(key,options){const row=this.rows.get(key);if(!row)return null;const range=options?.range;const bytes=range?row.bytes.subarray(range.offset,range.offset+range.length):row.bytes;return {...await this.head(key),body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array(bytes));controller.close();}}),arrayBuffer:async()=>new Uint8Array(bytes).buffer};}
}
const req=(path,options={})=>new Request(origin+path,options);
const call=(path,env,user=active,options={})=>handleTextbookRequest(req(path,options),env,user);

test('private task registry retains every reviewed task and source-specific IELTS rubric',async()=>{
  assert.equal(getAllGradingTasks().length,526);assert.equal(getTextbookGradingTasks().length,500);
  assert.equal(TEXTBOOK_IMPORT_MANIFEST.pageCount,629);
  assert.deepEqual(getSectionGradingTasks('writing-topic-001').map(task=>task.progression),['paragraph','reasoning','fulltask']);
  const task=getGradingTask('textbook:writing-topic-001-fulltask');
  assert.equal(task.rubric.taskType,'writing_task2');assert.equal(task.rubric.referenceScoreEligible,true);
  assert.equal(getGradingTask('textbook:speaking-topic-001').rubric.referenceScoreEligible,false);
  assert.equal(getGradingTask('textbook:invented'),null);
  if(sourceExists){const canonical=await import(pathToFileURL(resolve(source,'../../grading-task-catalog.mjs')));assert.deepEqual(getAllGradingTasks(),canonical.getAllGradingTasks());}
});

test('textbook endpoints reject unauthenticated, pending and non-admin access',async()=>{
  const env={BUCKET:new MemoryBucket()};
  assert.equal((await call('/api/textbooks',env,null)).status,401);
  assert.equal((await call('/api/textbooks/writing/pdf',env,{...active,status:'pending'})).status,403);
  assert.equal((await call('/api/admin/textbooks/import',env,active)).status,403);
  assert.equal((await call('/api/admin/textbooks/import/writing/pdf',env,admin,{method:'PUT'})).status,403);
  assert.equal((await call('/api/textbooks/writing/pdf',env)).status,404);
  assert.equal(await call('/public/writing.pdf',env),null);
  const catalog=await (await call('/api/textbooks',env)).json();assert.equal(catalog.books.length,0);assert.equal(catalog.missing.length,4);
});

test('exact original files import to private R2, every page remains available, and PDF ranges stream correctly',{skip:!sourceExists},async()=>{
  const bucket=new MemoryBucket(),env={BUCKET:bucket};
  for(const book of TEXTBOOK_IMPORT_MANIFEST.books)for(const kind of ['json','pdf']){
    const body=readFileSync(resolve(source,`${book.id}.${kind}`));
    const response=await call(`/api/admin/textbooks/import/${book.id}/${kind}`,env,admin,{method:'PUT',headers:{Origin:origin},body});
    assert.equal(response.status,200,JSON.stringify(await response.clone().json()));
  }
  assert.equal(bucket.rows.size,8);
  const status=await (await call('/api/admin/textbooks/import',env,admin)).json();assert.equal(status.books.length,4);assert.ok(status.books.every(book=>book.ready));
  const catalog=await (await call('/api/textbooks',env)).json();assert.equal(catalog.books.reduce((n,b)=>n+b.pageCount,0),629);assert.equal(catalog.books.reduce((n,b)=>n+b.taskCount,0),500);
  const library=createTextbookLibrary(env);
  for(const entry of TEXTBOOK_IMPORT_MANIFEST.books){const book=await library.load(entry.id),original=JSON.parse(readFileSync(resolve(source,entry.id+'.json'),'utf8'));assert.deepEqual(book.pages,original.pages);assert.deepEqual(book.sections,original.sections);}
  const taskResponse=await call('/api/textbooks/tasks/textbook%3Awriting-topic-001-fulltask',env);assert.equal(taskResponse.status,200);const task=await taskResponse.json();assert.equal(task.task.progression,'fulltask');assert.equal(task.section.id,'writing-topic-001');
  const page=await (await call('/api/textbooks/writing/pages/195',env)).json();assert.equal(page.page.page,195);
  const first=await call('/api/textbooks/writing/pdf',env,active,{headers:{Range:'bytes=0-4'}});assert.equal(first.status,206);assert.equal(await first.text(),'%PDF-');assert.equal(first.headers.get('Cache-Control'),'private, no-store');
  const bytes=readFileSync(resolve(source,'writing.pdf'));
  const full=await call('/api/textbooks/writing/pdf',env);assert.equal(full.status,200);assert.deepEqual(Buffer.from(await full.arrayBuffer()),bytes);
  const suffix=await call('/api/textbooks/writing/pdf',env,active,{headers:{Range:'bytes=-6'}});assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),bytes.subarray(-6));
  for(const range of ['bytes=-0','bytes=99999999-','bytes=4-2','bytes=0-2,4-6']){const response=await call('/api/textbooks/writing/pdf',env,active,{headers:{Range:range}});assert.equal(response.status,416);assert.equal(response.headers.get('Content-Range'),`bytes */${bytes.length}`);}
  const head=await call('/api/textbooks/writing/pdf',env,active,{method:'HEAD'});assert.equal(head.status,200);assert.equal(Number(head.headers.get('Content-Length')),bytes.length);assert.equal((await head.arrayBuffer()).byteLength,0);
  const puts=bucket.puts;
  const repeated=await call('/api/admin/textbooks/import/writing/pdf',env,admin,{method:'PUT',headers:{Origin:origin},body:bytes});assert.equal((await repeated.json()).alreadyImported,true);assert.equal(bucket.puts,puts);
  const corrupted=Buffer.from(bytes);corrupted[20]^=1;
  const invalid=await call('/api/admin/textbooks/import/writing/pdf',env,admin,{method:'PUT',headers:{Origin:origin},body:corrupted});assert.equal(invalid.status,400);assert.equal((await invalid.json()).code,'TEXTBOOK_CHECKSUM_MISMATCH');assert.equal(bucket.puts,puts);
});
