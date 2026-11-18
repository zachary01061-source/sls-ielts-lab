import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { audit, openDatabase, profileOf, publicUser, readPlan, readState } from './db.mjs';
import { bootstrapAdmin, cookieValue, digest, equal, hashPassword, rateLimit, sessionCookie, token, validPassword, verifyPassword } from './auth.mjs';

function fixture() {
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys=ON');
  sqlite.exec(readFileSync(new URL('../drizzle/0000_heavy_pet_avengers.sql',import.meta.url),'utf8'));
  class Statement {
    constructor(sql,args=[]) {this.sql=sql;this.args=args;}
    bind(...args) { return new Statement(this.sql,args); }
    async first() { return sqlite.prepare(this.sql).get(...this.args)||null; }
    async all() { return this.execute(); }
    async run() { return this.execute(); }
    execute() {
      const stmt=sqlite.prepare(this.sql);
      if(stmt.columns().length)return {success:true,results:stmt.all(...this.args),meta:{changes:0}};
      const result=stmt.run(...this.args);return {success:true,results:[],meta:{changes:Number(result.changes)}};
    }
  }
  return {sqlite,prepare:sql=>new Statement(sql),async batch(statements) {
    sqlite.exec('BEGIN IMMEDIATE');
    try {const results=statements.map(statement=>statement.execute());sqlite.exec('COMMIT');return results;}
    catch(error){sqlite.exec('ROLLBACK');throw error;}
  }};
}
function insertStudent(db,id='student-a',username='student.a') {
  db.sqlite.prepare(`INSERT INTO users(id,username,password_hash,name,role,status,created_at,updated_at) VALUES(?,?,?,'同学','student','active',?,?)`).run(id,username,'unused','2026-11-03','2026-11-03');
}

test('password hashes use independent salts and enforce a bounded Workers PBKDF2 format',async()=>{
  const password='school-'+token(),first=await hashPassword(password),second=await hashPassword(password);
  assert.match(first,/^pbkdf2-sha256-v1\$100000\$[a-f0-9]{32}\$[a-f0-9]{64}$/);
  assert.notEqual(first,second);
  assert.equal(await verifyPassword(password,first),true);
  assert.equal(await verifyPassword('a different password',first),false);
  assert.equal(await verifyPassword(password,first.replace('$100000$','$1000000000$')),false);
  assert.equal(await verifyPassword('x'.repeat(129),first),false);
  assert.equal(validPassword('x'.repeat(9)),false);
  await assert.rejects(hashPassword('short'));
});

test('sessions are random, are digested before lookup, and cookies reject header injection',async()=>{
  const raw=token();assert.match(raw,/^[A-Za-z0-9_-]{43}$/);assert.notEqual(raw,token());
  const hash=await digest(raw);assert.match(hash,/^[a-f0-9]{64}$/);assert.notEqual(raw,hash);
  assert.equal(await digest(new TextEncoder().encode(raw)),hash);
  assert.equal(equal(raw,raw),true);assert.equal(equal(raw,token()),false);
  const cookie=sessionCookie(raw);assert.match(cookie,/HttpOnly; SameSite=Strict/);assert.match(cookie,/; Secure$/);
  assert.equal(cookieValue(new Request('https://school.example',{headers:{cookie:`other=value; sls_session=${raw}`}}),'sls_session'),raw);
  assert.equal(cookieValue(new Request('https://school.example',{headers:{cookie:`sls_session=${raw}; sls_session=other`}}),'sls_session'),'');
  assert.throws(()=>sessionCookie('bad\r\nHeader: value'));
});

test('D1 migration retains all 13 tables and stores R2 keys instead of audio bytes',()=>{
  const db=fixture();const tables=db.sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name!='sqlite_sequence'").all().map(row=>row.name);
  assert.equal(tables.length,13);
  assert.deepEqual(db.sqlite.prepare('PRAGMA table_info(audio)').all().map(row=>row.name),['id','user_id','mime_type','blob_key','size','created_at']);
  const columns=db.sqlite.prepare('PRAGMA table_info(submissions)').all().map(row=>row.name);
  for(const name of ['prompt','client_submission_id','payload_hash','reviewed_by','parent_id'])assert.ok(columns.includes(name));
  assert.throws(()=>db.sqlite.prepare("INSERT INTO users(id,username,password_hash,name,role,status,created_at,updated_at) VALUES('bad','bad','h','n','superadmin','active','x','x')").run());
});

test('atomic rate limiter allows only the configured budget during simultaneous requests',async()=>{
  const db=fixture();const replies=await Promise.all(Array.from({length:20},()=>rateLimit(db,'login:user',3,60000,1000)));
  assert.equal(replies.filter(row=>row.allowed).length,3);
  assert.ok(replies.filter(row=>!row.allowed).every(row=>row.retryAfter===60));
  assert.deepEqual(await rateLimit(db,'login:user',3,60000,61000),{allowed:true});
});

test('bootstrap is disabled without an environment secret and refuses an incorrect secret',async()=>{
  const db=fixture(),secret=token(),input={username:'school.admin',password:token()};
  await assert.rejects(bootstrapAdmin(db,input),error=>error.status===404);
  await assert.rejects(bootstrapAdmin(db,{...input,bootstrapToken:secret,providedToken:token()}),error=>error.status===403);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM users').get().n,0);
});

test('racing bootstrap requests create exactly one admin, audit entry, and durable one-time marker',async()=>{
  const db=fixture(),secret=token(),input={password:token(),bootstrapToken:secret,providedToken:secret};
  const outcomes=await Promise.allSettled([
    bootstrapAdmin(db,{...input,username:'admin.one'}),bootstrapAdmin(db,{...input,username:'admin.two'})]);
  assert.equal(outcomes.filter(result=>result.status==='fulfilled').length,1);
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin'").get().n,1);
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='admin.bootstrap'").get().n,1);
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS n FROM settings WHERE key='admin_bootstrap_completed'").get().n,1);
  const user=outcomes.find(result=>result.status==='fulfilled').value;assert.equal(user.role,'admin');assert.equal('password_hash' in user,false);
  db.sqlite.exec('UPDATE audit_log SET actor_id=NULL; DELETE FROM users');
  await assert.rejects(bootstrapAdmin(db,{...input,username:'admin.recreate'}),error=>error.status===409);
});

test('bootstrap never promotes an existing student username or leaves a lock after rollback',async()=>{
  const db=fixture(),secret=token();insertStudent(db,'student','existing.name');
  await assert.rejects(bootstrapAdmin(db,{username:'existing.name',password:token(),bootstrapToken:secret,providedToken:secret}),error=>error.status===409);
  assert.equal(db.sqlite.prepare('SELECT role FROM users WHERE id=?').get('student').role,'student');
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM settings').get().n,0);
  const user=await bootstrapAdmin(db,{username:'real.admin',password:token(),bootstrapToken:secret,providedToken:secret});
  assert.equal(user.role,'admin');
});

test('learning helpers preserve plan/state versions while public profiles omit credentials',async()=>{
  const db=fixture();insertStudent(db);
  assert.equal(openDatabase(db),db);
  assert.deepEqual(await readState(db,'student-a'),{version:0,state:{},updatedAt:null});
  db.sqlite.prepare('INSERT INTO learning_state(user_id,version,state,updated_at) VALUES(?,?,?,?)').run('student-a',2,JSON.stringify({growth:{started:true}}),'now');
  db.sqlite.prepare('INSERT INTO learning_plans(user_id,version,plan,updated_at) VALUES(?,?,?,?)').run('student-a',3,JSON.stringify({skills:['speaking']}),'now');
  assert.equal((await readState(db,'student-a')).version,2);assert.deepEqual((await readPlan(db,'student-a')).plan,{skills:['speaking']});
  await audit(db,'student-a','plan.opened','student-a');
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM audit_log').get().n,1);
  const row=db.sqlite.prepare('SELECT * FROM users').get();assert.equal('password_hash' in publicUser(row),false);assert.deepEqual(profileOf(row).goals,{});
});
