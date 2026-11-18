import test from 'node:test';
import assert from 'node:assert/strict';
import { handleAPI } from '../server/api.mjs';
import { digest, hashPassword, token } from '../server/auth.mjs';
import { createD1Fixture, createMemoryBucket } from './helpers/d1-fixture.mjs';

const ORIGIN='https://school.example',DAY=86400000;
async function fixture() {
  const db=createD1Fixture(),bucket=createMemoryBucket();
  const env={DB:db,BUCKET:bucket,PUBLIC_ORIGIN:ORIGIN,SLS_BOOTSTRAP_TOKEN:token()};
  async function account(id,role='student',status='active',password='Strong school password 2026') {
    const hash=await hashPassword(password),raw=token(),csrf=token(),time=Date.now();
    db.sqlite.prepare('INSERT INTO users(id,username,password_hash,name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run(id,id,hash,id,role,status,'2026-11-03','2026-11-03');
    db.sqlite.prepare('INSERT INTO sessions(token_hash,user_id,csrf,expires_at,last_seen) VALUES(?,?,?,?,?)').run(await digest(raw),id,csrf,time+7*DAY,time);
    return {id,raw,csrf,password};
  }
  async function request(path,{actor,method='GET',data,headers={},origin=ORIGIN}={}) {
    const values=new Headers(headers);if(actor){values.set('Cookie',`sls_session=${actor.raw}`);if(!values.has('X-CSRF-Token'))values.set('X-CSRF-Token',actor.csrf);}
    if(!['GET','HEAD'].includes(method)&&origin!==null)values.set('Origin',origin);
    if(data!==undefined)values.set('Content-Type','application/json');
    const response=await handleAPI(new Request(ORIGIN+path,{method,headers:values,...(data===undefined?{}:{body:JSON.stringify(data)})}),env);
    return response;
  }
  return {db,bucket,env,account,request};
}
const writing=(key='writing-idempotency-01')=>({skill:'writing',title:'A school project',prompt:'Explain a useful school project.',text:'Our class planned a reading project and shared books after school.',clientSubmissionId:key});
const speaking=(key='speaking-idempotency-01')=>({skill:'speaking',title:'My school role',prompt:'Explain a responsibility at school.',audioBase64:btoa('abcd'),mimeType:'audio/webm',clientSubmissionId:key});
function barrier(bucket,total=2) {
  let arrived=0,release;const ready=new Promise(resolve=>{release=resolve;});
  bucket.onPut=async()=>{arrived++;if(arrived===total)release();await ready;};
}

test('student endpoints enforce origin, CSRF, status and administrator role',async()=>{
  const f=await fixture(),student=await f.account('student.one'),pending=await f.account('student.pending','student','pending');
  assert.equal((await f.request('/api/admin/students')).status,401);
  assert.equal((await f.request('/api/admin/students',{actor:student})).status,403);
  assert.equal((await f.request('/api/me/state',{actor:pending})).status,403);
  assert.equal((await f.request('/api/me/profile',{actor:student,method:'PATCH',data:{name:'Changed'},origin:'https://attacker.example'})).status,403);
  assert.equal((await f.request('/api/me/profile',{actor:student,method:'PATCH',data:{name:'Changed'},headers:{'X-CSRF-Token':'incorrect'}})).status,403);
  assert.equal(f.db.sqlite.prepare('SELECT name FROM users WHERE id=?').get(student.id).name,student.id);
});

test('guest catalogue routes expose practice but leave textbook originals and account data private',async()=>{
  const f=await fixture();
  delete f.env.BUCKET;
  const writing=await f.request('/api/guest/textbooks/writing');
  assert.equal(writing.status,200);
  const {book,sections}=await writing.json();
  assert.equal(book.id,'writing');
  assert.ok(sections.length>0&&sections[0].taskId);
  for(const key of ['originalFilename','importReport','pdfUrl','assets'])assert.equal(key in book,false);
  assert.equal('text' in sections[0],false);
  for(const path of ['/api/guest/textbooks/writing/sections/writing-topic-001','/api/guest/textbooks/tasks/textbook%3Awriting-topic-001']){
    const response=await f.request(path);
    assert.equal(response.status,200);
    const {section,task}=await response.json();
    assert.equal(section.id,'writing-topic-001');
    assert.ok(task.prompt);
    assert.equal('text' in section,false);
  }
  const corpus=await f.request('/api/guest/corpus/resources');
  assert.equal(corpus.status,200);
  const {resources}=await corpus.json();
  assert.equal(resources.length,175);
  assert.ok(resources.every(item=>item.url==='/api/guest/corpus/resources/'+item.id));
  assert.equal((await f.request('/api/guest/corpus/resources/unlisted')).status,404);
  for(const path of ['/api/guest/textbooks/writing/pdf','/api/guest/textbooks/writing/pages/1','/api/guest/admin/students']){
    assert.equal((await f.request(path)).status,404);
  }
  assert.equal((await f.request('/api/guest/textbooks/writing',{method:'PUT',data:{}})).status,405);
  for(const path of ['/api/textbooks/writing/pdf','/api/admin/students','/api/me/state','/api/me/submissions','/api/audio/example']){
    assert.equal((await f.request(path)).status,401);
  }
});

test('a configured secondary HTTPS origin retains same-site and CSRF checks',async()=>{
  const f=await fixture(),student=await f.account('student.one');
  const secondary='https://sls-reading-zac.b-cdn.net';
  const update={actor:student,method:'PATCH',data:{name:'Changed'},origin:secondary};
  assert.equal((await f.request('/api/me/profile',update)).status,403);
  f.env.SLS_SECONDARY_ORIGIN=secondary;
  assert.equal((await f.request('/api/me/profile',{...update,origin:secondary+'.attacker.example'})).status,403);
  assert.equal((await f.request('/api/me/profile',{...update,headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
  const csrfFailure=await f.request('/api/me/profile',{...update,headers:{'X-CSRF-Token':'invalid'}});
  assert.equal(csrfFailure.status,403);
  assert.equal((await csrfFailure.json()).code,'CSRF_INVALID');
  assert.equal((await f.request('/api/me/profile',{...update,headers:{'Sec-Fetch-Site':'same-origin'}})).status,200);
  for(const path of ['/api/auth/bootstrap','/api/auth/recover-admin']){
    const response=await f.request(path,{method:'POST',data:{},origin:secondary});
    assert.equal(response.status,403);
    assert.equal((await response.json()).code,'ORIGIN_INVALID');
  }
});

test('state versions advance 0 to 1 to 2 and same-version concurrent writes cannot overwrite each other',async()=>{
  const f=await fixture(),student=await f.account('student.one');
  for(let version=0;version<2;version++) {
    const response=await f.request('/api/me/state',{actor:student,method:'PUT',data:{version,state:{value:version+1,teacherReview:{stage:'independent'},growth:{evidence:[{id:'fake',machineReview:{stage:'independent'},teacherVerified:true}]}}}});
    assert.equal(response.status,200,await response.clone().text());assert.equal((await response.json()).version,version+1);
  }
  const responses=await Promise.all(['a','b'].map(value=>f.request('/api/me/state',{actor:student,method:'PUT',data:{version:2,state:{value}}})));
  assert.deepEqual(responses.map(response=>response.status).sort(),[200,409]);
  const stored=await (await f.request('/api/me/state',{actor:student})).json();assert.equal(stored.version,3);assert.ok(['a','b'].includes(stored.state.value));
  assert.equal('teacherReview' in stored.state,false);
});

test('administrator plans use version CAS and students cannot change another plan',async()=>{
  const f=await fixture(),admin=await f.account('school.admin','admin'),student=await f.account('student.one');
  const path=`/api/admin/students/${student.id}/plan`;
  assert.equal((await f.request(path,{actor:student,method:'PUT',data:{version:0,plan:{}}})).status,403);
  for(let version=0;version<2;version++) {
    const response=await f.request(path,{actor:admin,method:'PUT',data:{version,plan:{focus:'speaking',step:version}}});
    assert.equal(response.status,200,await response.clone().text());assert.equal((await response.json()).version,version+1);
  }
  const responses=await Promise.all([1,2].map(step=>f.request(path,{actor:admin,method:'PUT',data:{version:2,plan:{step}}})));
  assert.deepEqual(responses.map(response=>response.status).sort(),[200,409]);
  assert.equal((await (await f.request('/api/me/plan',{actor:student})).json()).version,3);
});

test('same submission key deduplicates while changed content receives a conflict',async()=>{
  const f=await fixture(),student=await f.account('student.one'),payload=writing();
  const created=await f.request('/api/me/submissions',{actor:student,method:'POST',data:payload});assert.equal(created.status,201,await created.clone().text());
  const duplicate=await f.request('/api/me/submissions',{actor:student,method:'POST',data:payload});assert.equal(duplicate.status,200);assert.equal((await duplicate.json()).deduplicated,true);
  const changed=await f.request('/api/me/submissions',{actor:student,method:'POST',data:{...payload,text:'Different response'}});assert.equal(changed.status,409);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM submissions').get().n,1);
});

test('simultaneous repeated audio submissions retain exactly one private object and enforce ownership',async()=>{
  const f=await fixture(),student=await f.account('student.one'),peer=await f.account('student.two');barrier(f.bucket);
  const responses=await Promise.all([1,2].map(()=>f.request('/api/me/submissions',{actor:student,method:'POST',data:speaking()})));
  assert.deepEqual(responses.map(response=>response.status).sort(),[200,201]);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM submissions').get().n,1);assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM audio').get().n,1);assert.equal(f.bucket.objects.size,1);
  const audio=f.db.sqlite.prepare('SELECT id FROM audio').get();
  assert.equal((await f.request('/api/audio/'+audio.id,{actor:peer})).status,404);
  const range=await f.request('/api/audio/'+audio.id,{actor:student,headers:{Range:'bytes=1-2'}});assert.equal(range.status,206);assert.equal(await range.text(),'bc');
  const foreign=await f.request('/api/me/submissions',{actor:peer,method:'POST',data:{skill:'speaking',title:'Peer',audioId:audio.id}});assert.equal(foreign.status,400);
});

test('competing audio quota writes atomically reject one request without orphan records or blobs',async()=>{
  const f=await fixture(),student=await f.account('student.one');
  const insert=f.db.sqlite.prepare('INSERT INTO audio(id,user_id,mime_type,blob_key,size,created_at) VALUES(?,?,?,?,?,?)');
  for(let i=0;i<50;i++)insert.run('seed-'+i,student.id,'audio/webm','seed/'+i,5*1024*1024-(i===49?6:0),'now');
  barrier(f.bucket);
  const responses=await Promise.all([1,2].map(n=>f.request('/api/me/submissions',{actor:student,method:'POST',data:speaking('distinct-speaking-key-'+n)})));
  assert.deepEqual(responses.map(response=>response.status).sort(),[201,413],await Promise.all(responses.map(response=>response.clone().text())));
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM submissions').get().n,1);assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM grading_jobs').get().n,1);
  assert.equal(f.db.sqlite.prepare('SELECT SUM(size) AS n FROM audio').get().n,250*1024*1024-2);assert.equal(f.bucket.objects.size,1);
});

test('revoking a session during R2 upload rejects the submission and removes the uploaded object',async()=>{
  const f=await fixture(),student=await f.account('student.one');
  f.bucket.onPut=async()=>{f.db.sqlite.prepare('DELETE FROM sessions WHERE user_id=?').run(student.id);};
  const response=await f.request('/api/me/submissions',{actor:student,method:'POST',data:speaking()});
  assert.equal(response.status,401,await response.clone().text());assert.equal(f.bucket.objects.size,0);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM audio').get().n,0);assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM submissions').get().n,0);
});

test('mutation guard rejects a session revoked immediately before the D1 write transaction',async()=>{
  const f=await fixture(),student=await f.account('student.one');let intercepted=false;
  f.db.beforeBatch=async statements=>{if(statements.some(statement=>statement.sql.startsWith('UPDATE users SET name='))){intercepted=true;f.db.sqlite.prepare('DELETE FROM sessions WHERE user_id=?').run(student.id);}};
  const response=await f.request('/api/me/profile',{actor:student,method:'PATCH',data:{name:'Should not save'}});
  assert.equal(intercepted,true,'authenticated mutations should use guarded D1 batches');assert.equal(response.status,401,await response.clone().text());
  assert.equal(f.db.sqlite.prepare('SELECT name FROM users WHERE id=?').get(student.id).name,student.id);
});

test('administrator review response preserves fields and authoritative state uses the real review',async()=>{
  const f=await fixture(),student=await f.account('student.one'),admin=await f.account('school.admin','admin');
  const submitted=await (await f.request('/api/me/submissions',{actor:student,method:'POST',data:writing()})).json();const id=submitted.submission.id;
  const response=await f.request('/api/admin/submissions/'+id,{actor:admin,method:'PATCH',data:{feedback:'Explain how the example supports your reason.',rubric:{stage:'bridge',independent:true,unseen:true,readyForNextStage:false}}});
  assert.equal(response.status,200,await response.clone().text());const review=(await response.json()).submission;
  assert.equal(review.id,id);assert.equal(review.userId,student.id);assert.ok(review.createdAt);assert.equal(review.status,'reviewed');
  const state=await (await f.request('/api/me/state',{actor:student})).json();assert.equal(state.state.growth.evidence[0].teacherReview.reviewed,true);
});

test('password change invalidates prior sessions and new credentials work',async()=>{
  const f=await fixture(),student=await f.account('student.one'),newPassword='A different school password 2026';
  const changed=await f.request('/api/auth/change-password',{actor:student,method:'POST',data:{currentPassword:student.password,newPassword}});assert.equal(changed.status,200,await changed.clone().text());
  assert.equal((await f.request('/api/auth/me',{actor:student})).status,401);
  assert.equal((await f.request('/api/auth/login',{method:'POST',data:{username:student.id,password:student.password}})).status,401);
  const login=await f.request('/api/auth/login',{method:'POST',data:{username:student.id,password:newPassword}});assert.equal(login.status,200);assert.match(login.headers.get('set-cookie'),/HttpOnly/);assert.match(login.headers.get('set-cookie'),/Secure/);
});

test('registration ignores requested administrator privileges and bootstrap is secret-bound and one-time',async()=>{
  const f=await fixture();
  const registration=await f.request('/api/auth/register',{method:'POST',data:{username:'new.student',name:'学生',password:'School registration password',role:'admin',status:'active'}});assert.equal(registration.status,201);
  const user=(await registration.json()).user;assert.equal(user.role,'student');assert.equal(user.status,'pending');
  const payload={username:'school.admin',name:'管理员',password:'Admin school password 2026'};
  assert.equal((await f.request('/api/auth/bootstrap',{method:'POST',data:payload,headers:{'X-Bootstrap-Token':token()}})).status,403);
  const created=await f.request('/api/auth/bootstrap',{method:'POST',data:payload,headers:{'X-Bootstrap-Token':f.env.SLS_BOOTSTRAP_TOKEN}});assert.equal(created.status,201,await created.clone().text());
  assert.equal((await f.request('/api/auth/bootstrap',{method:'POST',data:payload,headers:{'X-Bootstrap-Token':f.env.SLS_BOOTSTRAP_TOKEN}})).status,409);
});

test('one-time administrator recovery is secret-bound and revokes only the target sessions',async()=>{
  const f=await fixture(),admin=await f.account('existing-admin','admin'),other=await f.account('other-admin','admin');
  const secret=token(),path='/api/auth/recover-admin',password=token();
  const request=(value)=>f.request(path,{method:'POST',data:{username:other.id,password},headers:{'X-Bootstrap-Token':value}});
  assert.equal((await request(secret)).status,404);
  f.env.SLS_ADMIN_RECOVERY=`existing-admin:${secret}:${Date.now()-1}`;
  assert.equal((await request(secret)).status,404);
  f.env.SLS_ADMIN_RECOVERY=`existing-admin:${secret}:${Date.now()+60000}`;
  assert.equal((await request(token())).status,403);
  const restored=await request(secret);
  assert.equal(restored.status,200);
  assert.equal((await restored.json()).username,admin.id);
  assert.equal((await request(secret)).status,409);
  assert.equal((await f.request('/api/auth/me',{actor:admin})).status,401);
  assert.equal((await f.request('/api/auth/me',{actor:other})).status,200);
  assert.equal((await f.request('/api/auth/login',{method:'POST',data:{username:admin.id,password}})).status,200);
});
