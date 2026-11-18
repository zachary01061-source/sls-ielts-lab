import {openDatabase,publicUser,profileOf,readState,readPlan,audit} from './db.mjs';
import {token,digest,equal,validPassword,hashPassword,verifyPassword,cookieValue,sessionCookie,rateLimit,bootstrapAdmin} from './auth.mjs';
import {getGradingTask,gradingTaskCatalog} from './grading-task-catalog.mjs';
import {handleTextbookRequest} from './textbook-curriculum.mjs';
import {createCorpusProxy} from './corpus.mjs';
import {handleAdminAPI} from './admin-api.mjs';

const DAY=86400000,STATE_LIMIT=1500000,AUDIO_LIMIT=5*1024*1024,AUDIO_QUOTA=250*1024*1024;
const encoder=new TextEncoder(),nowISO=()=>new Date().toISOString();
const DUMMY_PASSWORD_HASH='pbkdf2-sha256-v1$100000$'+'0'.repeat(32)+'$'+'0'.repeat(64);
const corpusProxy=createCorpusProxy();
export const FREE_GRADING_MESSAGE='免费版暂未配置机器批改。作业已保存，老师可以在线批改。';
class HttpError extends Error{constructor(status,message,extra={}){super(message);this.status=status;this.extra=extra;}}
const fail=(status,message,extra)=>{throw new HttpError(status,message,extra);};
const parse=value=>JSON.parse(value||'{}');
const bytes=value=>encoder.encode(value).byteLength;
function str(value,max=200,required=false){if(typeof value!=='string'||value.length>max||required&&!value.trim())fail(400,'填写内容不完整或超过长度限制。');return value.trim();}
function object(value,max=100000){if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'提交的数据格式不正确。');const raw=JSON.stringify(value);if(bytes(raw)>max)fail(413,max===STATE_LIMIT?'学习记录超过本次可保存的大小，请联系管理员导出和整理记录。已有记录不会被覆盖。':'提交内容过大，请缩短后重试。');return raw;}
function json(status,data,headers={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});}
function pageParams(url){return {page:Math.max(1,Math.min(100000,Math.floor(Number(url.searchParams.get('page'))||1))),limit:Math.max(1,Math.min(100,Math.floor(Number(url.searchParams.get('limit'))||30)))};}
function band(value){if(value===undefined||value===null||value==='')return null;if(typeof value!=='number'||!Number.isFinite(value)||value<1||value>9||value*2%1!==0)fail(400,'雅思成绩须为 1–9 分，支持半分。');return value;}

/** Keep D1's native bind/batch API while giving route code explicit async row helpers. */
export function adaptDatabase(binding){
  const native=openDatabase(binding);
  const result=value=>({...value,...value.meta,changes:value.meta?.changes||0});
  let guard=null;
  async function batch(statements){const current=guard;try{const checks=current?[current.statement()]:[],results=await native.batch([...checks,...statements]);return results.slice(checks.length).map(result);}catch(error){if(current)await current.revalidate();throw error;}}
  return {setGuard(value){guard=value;},prepare(sql){const statement=native.prepare(sql);return {bind:(...args)=>statement.bind(...args),get:(...args)=>statement.bind(...args).first(),all:async(...args)=>(await statement.bind(...args).all()).results||[],run:async(...args)=>(await batch([statement.bind(...args)]))[0]};},batch,exec:sql=>native.exec(sql)};
}

export function cleanStudentState(value){
  if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'学习记录格式不正确。');
  const queue=[{node:value,depth:0}];let nodes=0;
  while(queue.length){const {node,depth}=queue.pop();if(depth>64||++nodes>500000)fail(400,'学习记录层级过多。');for(const key of Object.keys(node)){if(['teacherReview','bandAssessments','teacherVerified','serverVerified','machineReview','machineStatus','machineError'].includes(key)){delete node[key];continue;}if(node[key]&&typeof node[key]==='object')queue.push({node:node[key],depth:depth+1});}}
  return value;
}
const SUBMISSION_SELECT='SELECT s.*,u.name AS student_name,u.username,r.name AS reviewer_name,j.status AS machine_status,j.error AS machine_error FROM submissions s JOIN users u ON u.id=s.user_id LEFT JOIN users r ON r.id=s.reviewed_by LEFT JOIN grading_jobs j ON j.submission_id=s.id';
function submission(row){const task=getGradingTask(row.task_id);return {machineStatus:'not_configured',machineReview:null,machineError:FREE_GRADING_MESSAGE,id:row.id,userId:row.user_id,studentName:row.student_name,username:row.username,skill:row.skill,title:row.title,taskId:row.task_id,materialFamilyId:task?.assignment?.materialFamilyId||row.task_id||row.id,text:row.text,parentId:row.parent_id||null,stage:row.stage,selfCheck:parse(row.self_check),audioId:row.audio_id,audioUrl:row.audio_id?`/api/audio/${row.audio_id}`:null,status:row.status,feedback:row.feedback,rubric:parse(row.rubric),createdAt:row.created_at,reviewedAt:row.reviewed_at,reviewerName:row.reviewer_name||null};}
function assessment(row){return {id:row.id,source:row.kind==='official'?'official':'teacher',kind:row.kind,assessedAt:row.assessed_at,overall:row.overall,skills:parse(row.bands),bands:parse(row.bands),note:row.note,reviewerName:row.reviewer_name,createdAt:row.created_at,voided:!!row.voided};}

function audioRange(header,size){
  if(!header)return {start:0,end:size-1,status:200};const match=header.match(/^bytes=(\d*)-(\d*)$/);
  if(!match||!match[1]&&!match[2])fail(416,'不支持这个文件范围。',{size});
  const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2])),end=match[1]&&match[2]?Math.min(Number(match[2]),size-1):size-1;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=size)fail(416,'文件范围超出长度。',{size});return {start,end,status:206};
}

/** Standard Worker Request/Response boundary. Only /api/ routes are handled here. */
export async function handleAPI(request,env,options={}){
  const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return null;
  let secure=url.protocol==='https:';
  try{
    const db=adaptDatabase(env.DB),origin=options.origin||env.PUBLIC_ORIGIN||url.origin,originURL=new URL(origin);secure=originURL.protocol==='https:';
    if(originURL.origin!==origin)throw Error('PUBLIC_ORIGIN must be an origin without a path.');
    if(!secure&&!['localhost','127.0.0.1','[::1]','terminal.local'].includes(originURL.hostname))throw Error('HTTPS is required.');
    const p=url.pathname,m=request.method;
    if(!['GET','HEAD','OPTIONS'].includes(m)){
      const requestOrigin=request.headers.get('Origin'),secondaryOrigin=env.SLS_SECONDARY_ORIGIN;
      const isSecondary=secure&&typeof secondaryOrigin==='string'&&requestOrigin===secondaryOrigin&&
        secondaryOrigin.startsWith('https://')&&URL.canParse(secondaryOrigin)&&new URL(secondaryOrigin).origin===secondaryOrigin&&
        p!=='/api/auth/bootstrap'&&p!=='/api/auth/recover-admin';
      if(requestOrigin!==origin&&!isSecondary)fail(403,'请求来源不正确，请从学校平台打开。',{code:'ORIGIN_INVALID'});
      const site=request.headers.get('Sec-Fetch-Site');if(site&&site!=='same-origin'&&site!=='none')fail(403,'请从学校平台提交。');
    }
    if(m==='OPTIONS')return secured(json(405,{error:'不支持跨站请求。'}),secure);
    let revalidate=null;
    const ip=request.headers.get('CF-Connecting-IP')||'unknown';
    async function limited(key,max,windowMs){const result=await rateLimit(db,key,max,windowMs);if(!result.allowed)fail(429,'尝试次数较多，请稍后再试。',{retryAfter:result.retryAfter});}
    async function authenticate({active=false,admin=false}={}){
      const raw=cookieValue(request,'sls_session');if(!/^[A-Za-z0-9_-]{43}$/.test(raw))fail(401,'请先登录。');
      const hashed=await digest(raw),row=await db.prepare('SELECT s.csrf,s.expires_at,s.last_seen,u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?').get(hashed),now=Date.now();
      if(!row||row.expires_at<now||row.last_seen<now-DAY)fail(401,'登录已过期，请重新登录。');
      if(row.status==='suspended')fail(403,'账号已暂停，请联系管理员。');
      if(admin&&row.role!=='admin')fail(403,'此操作需要管理员账号。');
      if(active&&row.status!=='active')fail(403,'账号正在等待管理员审核。',{code:'ACCOUNT_PENDING'});
      if(!['GET','HEAD','OPTIONS'].includes(m)&&!equal(request.headers.get('X-CSRF-Token')||'',row.csrf))fail(403,'页面验证已过期，请刷新后重试。',{code:'CSRF_INVALID'});
      if(row.last_seen<now-60000)await db.prepare('UPDATE sessions SET last_seen=? WHERE token_hash=?').run(now,hashed);
      revalidate=()=>authenticate({active,admin});
      // D1 awaits can interleave with account suspension/password reset. The guard and
      // every mutation share one atomic batch; invalidated sessions abort the batch.
      db.setGuard({statement:()=>db.prepare("SELECT CASE WHEN EXISTS(SELECT 1 FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.csrf=? AND s.expires_at>=? AND s.last_seen>=? AND u.status!='suspended' AND (?=0 OR u.status='active') AND (?=0 OR u.role='admin')) THEN 1 ELSE json_extract('SLS_AUTH_GUARD_FAILED','$') END AS authorized").bind(hashed,row.csrf,Date.now(),Date.now()-DAY,active?1:0,admin?1:0),revalidate});return row;
    }
    async function body(max=9*1024*1024){
      if(!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type')||''))fail(415,'请使用 JSON 格式提交。');
      if(Number(request.headers.get('Content-Length'))>max)fail(413,'提交内容过大，请缩短后重试。');
      const reader=request.body?.getReader();let size=0;const chunks=[];
      if(reader)try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>max){await reader.cancel();fail(413,'提交内容过大，请缩短后重试。');}chunks.push(part.value);}}finally{reader.releaseLock();}
      let value;try{const joined=new Uint8Array(size);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.byteLength;}value=JSON.parse(new TextDecoder().decode(joined));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();}catch{fail(400,'提交的数据无法读取。');}
      if(revalidate)await revalidate();return value;
    }
    const hashGuard=fn=>fn();
    async function getUser(id){const row=await db.prepare('SELECT * FROM users WHERE id=?').get(id);if(!row)fail(404,'未找到这个学生。');return row;}
    async function getSubmissionRow(id){return db.prepare(SUBMISSION_SELECT+' WHERE s.id=?').get(id);}
    async function getSubmission(id){const row=await getSubmissionRow(id);return row?submission(row):null;}
    async function readAssessments(userId){return (await db.prepare('SELECT b.*,u.name AS reviewer_name FROM band_assessments b JOIN users u ON u.id=b.reviewed_by WHERE b.user_id=? ORDER BY b.assessed_at DESC').all(userId)).map(assessment);}
    async function authoritativeState(userId){
      const stored=await readState(db,userId),state=cleanStudentState(stored.state),works=await db.prepare('SELECT s.id,s.skill,s.task_id,s.stage,s.rubric,s.status,s.created_at,s.reviewed_at,s.feedback,r.name AS reviewer_name FROM submissions s LEFT JOIN users r ON r.id=s.reviewed_by WHERE s.user_id=? ORDER BY s.created_at').all(userId),assessments=(await readAssessments(userId)).filter(row=>!row.voided);
      if(state.growth||works.length||assessments.length){
        if(!state.growth||typeof state.growth!=='object'||Array.isArray(state.growth))state.growth={};
        state.growth.bandAssessments=assessments.map(({id,kind,assessedAt,overall,bands,note,reviewerName})=>({id,kind,assessedAt,overall,bands,note,reviewerName}));
        const prior=Array.isArray(state.growth.evidence)?state.growth.evidence:[],ids=new Set(works.map(row=>row.id));state.growth.evidence=prior.filter(row=>row&&typeof row==='object'&&!ids.has(row.id)&&!String(row.id||'').startsWith('server-submission:'));
        for(const row of works){const task=getGradingTask(row.task_id),rubric=parse(row.rubric),reviewed=row.status==='reviewed',placement=['foundation','supported','bridge','independent'].includes(rubric.stage)?rubric.stage:null,stage=placement||(['foundation','supported','bridge','independent'].includes(row.stage)?row.stage:'foundation'),client=prior.find(item=>item?.id===row.id),minutes=Number.isFinite(client?.minutes)?Math.max(0,Math.min(600,client.minutes)):0;
          state.growth.evidence.push({id:row.id,skill:row.skill,materialId:row.task_id||row.id,materialFamilyId:task?.assignment?.materialFamilyId||row.task_id||row.id,finishedAt:Date.parse(row.created_at),stage,minutes,supported:!reviewed||rubric.independent!==true,seenBefore:!reviewed||rubric.unseen!==true,total:0,correct:0,machineStatus:'not_configured',machineReview:null,machineError:FREE_GRADING_MESSAGE,teacherReview:reviewed?{reviewed:true,reviewerName:row.reviewer_name||'学校教师',reviewedAt:Date.parse(row.reviewed_at),stage:placement,comment:row.feedback,readyForNextStage:!!placement&&rubric.readyForNextStage===true}:null});}
      }return {...stored,state};
    }
    async function listSubmissions(where='',args=[],targetURL=url){const {page,limit}=pageParams(targetURL),rows=await db.prepare(`${SUBMISSION_SELECT} ${where} ORDER BY s.created_at DESC LIMIT ? OFFSET ?`).all(...args,limit,(page-1)*limit),count=await db.prepare(`SELECT COUNT(*) AS n FROM submissions s ${where}`).get(...args);return {submissions:rows.map(submission),total:count.n,page,limit};}

    async function route(){
      if(p==='/api/health'&&m==='GET')return json(200,{ok:true,service:'SLS Learning',machineGradingConfigured:false,registrationOpen:(await db.prepare('SELECT value FROM settings WHERE key=?').get('registration_open'))?.value!=='false'});
      if(p==='/api/auth/bootstrap'&&m==='POST'){
        await limited('bootstrap:'+ip,5,3600000);const b=await body(10000);
        const user=await bootstrapAdmin(db,{username:b.username,password:b.password,name:b.name,providedToken:request.headers.get('X-Bootstrap-Token')||'',bootstrapToken:env.SLS_BOOTSTRAP_TOKEN});
        return json(201,{user,message:'管理员账号已创建，请登录。'});
      }
      if(p==='/api/auth/recover-admin'&&m==='POST'){
        const [username,secret,expiresAt]=String(env.SLS_ADMIN_RECOVERY||'').split(':');
        if(!username||!secret||!Number.isSafeInteger(Number(expiresAt))||Number(expiresAt)<=Date.now())fail(404,'管理员恢复入口未开放。');
        await limited('recover-admin:'+ip,5,3600000);
        const supplied=request.headers.get('X-Bootstrap-Token')||'';
        if(!/^[A-Za-z0-9_-]{43,128}$/.test(secret)||supplied.length>128||!equal(supplied,secret))fail(403,'管理员恢复验证未通过。');
        const b=await body(10000);
        if(!validPassword(b.password))fail(400,'密码需要 10–128 位。');
        const target=await db.prepare("SELECT id FROM users WHERE username=? AND role='admin' AND status='active'").get(username);
        if(!target)fail(404,'找不到启用的管理员账号。');
        const marker='admin_recovery:'+await digest(secret),hash=await hashPassword(b.password),time=nowISO();
        try{
          await db.batch([
            db.prepare('INSERT INTO settings(key,value) VALUES(?,?)').bind(marker,target.id),
            db.prepare('UPDATE users SET password_hash=?,updated_at=? WHERE id=?').bind(hash,time,target.id),
            db.prepare('DELETE FROM sessions WHERE user_id=?').bind(target.id),
            db.prepare('DELETE FROM rate_limits WHERE key=?').bind('login-user:'+username),
            db.prepare("INSERT INTO audit_log(actor_id,action,target_id,created_at) VALUES(?,'admin.recovered',?,?)").bind(target.id,target.id,time)
          ]);
        }catch(error){
          if(await db.prepare('SELECT 1 FROM settings WHERE key=?').get(marker))fail(409,'此恢复密钥已使用。');
          throw error;
        }
        return json(200,{ok:true,username});
      }
      if(p==='/api/auth/register'&&m==='POST'){
        await limited('register:'+ip,300,3600000);if((await db.prepare('SELECT value FROM settings WHERE key=?').get('registration_open'))?.value==='false')fail(403,'目前暂未开放注册，请联系学校管理员。');
        const b=await body(10000),username=str(b.username,40,true).toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username))fail(400,'学号或用户名需为 3–40 位字母、数字、点、短横线或下划线。');if(!validPassword(b.password))fail(400,'密码需要 10–128 位。');
        const name=str(b.name,60,true),grade=str(b.grade||'',40),className=str(b.className||'',40),hash=await hashPassword(b.password),id=crypto.randomUUID(),time=nowISO();
        try{await db.prepare('INSERT INTO users(id,username,password_hash,name,grade,class_name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,username,hash,name,grade,className,'student','pending',time,time);}catch(error){if(/UNIQUE/i.test(String(error.message)))fail(409,'这个学号或用户名已经注册。');throw error;}
        return json(201,{user:publicUser(await getUser(id)),message:'注册成功。管理员审核后即可开始练习。'});
      }
      if(p==='/api/auth/login'&&m==='POST'){
        const b=await body(10000),username=typeof b.username==='string'?b.username.toLowerCase().trim().slice(0,40):'';await limited('login-ip:'+ip,600,600000);await limited('login-user:'+username,10,900000);
        const user=await db.prepare('SELECT * FROM users WHERE username=?').get(username);
        const valid=await verifyPassword(b.password,user?.password_hash||DUMMY_PASSWORD_HASH);if(!user||!valid)fail(401,'用户名或密码不正确。');
        const current=await getUser(user.id);if(current.password_hash!==user.password_hash)fail(401,'密码已更新，请重新登录。');if(current.status==='suspended')fail(403,'账号已暂停，请联系管理员。');
        const raw=token(),csrf=token(),time=Date.now();
        const results=await db.batch([
          db.prepare('INSERT INTO sessions(token_hash,user_id,csrf,expires_at,last_seen) SELECT ?,id,?,?,? FROM users WHERE id=? AND password_hash=? AND status!=?').bind(await digest(raw),csrf,time+7*DAY,time,user.id,user.password_hash,'suspended'),
          db.prepare('UPDATE users SET last_login_at=? WHERE id=?').bind(nowISO(),user.id),
          db.prepare('DELETE FROM rate_limits WHERE key=?').bind('login-user:'+username),
          db.prepare('DELETE FROM sessions WHERE expires_at<? OR last_seen<?').bind(time,time-DAY)
        ]);if(!results[0].changes)fail(401,'账号已更新，请重新登录。');
        return json(200,{user:publicUser(await getUser(user.id)),csrfToken:csrf},{'Set-Cookie':sessionCookie(raw,secure)});
      }
      if(p==='/api/auth/me'&&m==='GET'){const user=await authenticate();return json(200,{user:publicUser(user),csrfToken:user.csrf});}
      if(p==='/api/auth/logout'&&m==='POST'){await authenticate();await db.prepare('DELETE FROM sessions WHERE token_hash=?').run(await digest(cookieValue(request,'sls_session')));return json(200,{ok:true},{'Set-Cookie':sessionCookie('',secure,0)});}
      if(p==='/api/auth/change-password'&&m==='POST'){
        const user=await authenticate(),b=await body(10000);await limited('password:'+user.id,6,900000);if(!validPassword(b.newPassword))fail(400,'新密码需要 10–128 位。');if(!await verifyPassword(b.currentPassword,user.password_hash))fail(400,'当前密码不正确。');
        const hash=await hashPassword(b.newPassword);await revalidate();const result=await db.batch([db.prepare('UPDATE users SET password_hash=?,updated_at=? WHERE id=? AND password_hash=?').bind(hash,nowISO(),user.id,user.password_hash),db.prepare('DELETE FROM sessions WHERE user_id=?').bind(user.id)]);
        if(!result[0].changes)fail(409,'密码已更新，请重新登录后再修改。');await audit(db,user.id,'password.changed',user.id);return json(200,{ok:true},{'Set-Cookie':sessionCookie('',secure,0)});
      }
      if(p==='/api/me/profile'&&['GET','PATCH'].includes(m)){
        const user=await authenticate();if(m==='GET')return json(200,{user:publicUser(user),profile:profileOf(user)});const b=await body(30000),name=b.name===undefined?user.name:str(b.name,60,true),grade=b.grade===undefined?user.grade:str(b.grade,40),className=b.className===undefined?user.class_name:str(b.className,40),goals=b.goals===undefined?user.goals:object(b.goals,15000);
        await db.prepare('UPDATE users SET name=?,grade=?,class_name=?,goals=?,updated_at=? WHERE id=?').run(name,grade,className,goals,nowISO(),user.id);const updated=await getUser(user.id);return json(200,{user:publicUser(updated),profile:profileOf(updated)});
      }
      if(p==='/api/me/state'&&['GET','PUT'].includes(m)){
        const user=await authenticate({active:true});if(m==='GET')return json(200,await authoritativeState(user.id));await limited('state:'+user.id,180,60000);const b=await body(STATE_LIMIT+100000),raw=object(cleanStudentState(b.state),STATE_LIMIT);if(!Number.isSafeInteger(b.version)||b.version<0)fail(400,'记录版本不正确。');
        const result=b.version===0?await db.prepare('INSERT INTO learning_state(user_id,version,state,updated_at) VALUES(?,1,?,?) ON CONFLICT(user_id) DO UPDATE SET state=excluded.state,version=learning_state.version+1,updated_at=excluded.updated_at WHERE learning_state.version=0').run(user.id,raw,nowISO()):await db.prepare('UPDATE learning_state SET state=?,version=version+1,updated_at=? WHERE user_id=? AND version=?').run(raw,nowISO(),user.id,b.version);
        if(!result.changes)fail(409,'另一台设备更新了记录，请先同步。',{code:'STATE_CONFLICT',...await authoritativeState(user.id)});return json(200,await authoritativeState(user.id));
      }
      if(p==='/api/me/plan'&&m==='GET'){const user=await authenticate({active:true});return json(200,await readPlan(db,user.id));}
      if(p==='/api/grading/tasks/'||p.startsWith('/api/grading/tasks/')){await authenticate({active:true});if(m!=='GET')fail(405,'不支持此操作。');const task=getGradingTask(decodeURIComponent(p.slice('/api/grading/tasks/'.length)));if(!task)fail(404,'找不到这项练习。');return json(200,{task});}
      if(p==='/api/guest/textbooks'||p.startsWith('/api/guest/textbooks/')){
        if(m==='GET')await limited('guest-textbooks:'+ip,240,60000);
        return handleTextbookRequest(request,env);
      }
      if(p==='/api/guest/corpus/resources'&&m==='GET')return json(200,corpusProxy.list({guest:true}));
      if(p.startsWith('/api/guest/corpus/resources/')&&['GET','HEAD'].includes(m)){
        await limited('guest-corpus:'+ip,120,60000);
        return corpusProxy.stream(request,p.slice('/api/guest/corpus/resources/'.length));
      }
      if(p==='/api/textbooks'||p.startsWith('/api/textbooks/')||p.startsWith('/api/admin/textbooks/')){const user=await authenticate({active:true,admin:p.startsWith('/api/admin/')});await limited('textbooks:'+user.id,240,60000);return await handleTextbookRequest(request,env,user)||json(404,{error:'找不到教材接口。'});}
      if(p==='/api/corpus/resources'&&m==='GET'){await authenticate({active:true});return json(200,await corpusProxy.list());}
      if(p.startsWith('/api/corpus/resources/')&&['GET','HEAD'].includes(m)){const user=await authenticate({active:true});await limited('corpus:'+user.id,120,60000);return corpusProxy.stream(request,p.slice('/api/corpus/resources/'.length));}
      if(p==='/api/me/submissions'&&['GET','POST'].includes(m)){
        const user=await authenticate({active:true});if(m==='GET')return json(200,await listSubmissions('WHERE s.user_id=?',[user.id]));await limited('submission:'+user.id,40,3600000);const b=await body(),id=crypto.randomUUID();
        const clientSubmissionId=b.clientSubmissionId==null?null:str(b.clientSubmissionId,100,true);if(clientSubmissionId&&!/^[A-Za-z0-9_-]{16,100}$/.test(clientSubmissionId))fail(400,'提交编号不正确，请重新打开作业。');if(!['writing','speaking'].includes(b.skill))fail(400,'请选择写作或口语。');
        const taskId=str(b.taskId||b.materialId||'',150),task=getGradingTask(taskId);if(taskId.startsWith('textbook:')&&!task)fail(400,'这项教材任务尚未登记，请重新打开教材。',{code:'TEXTBOOK_TASK_NOT_FOUND'});if(task&&task.skill!==b.skill)fail(400,'作业类型与题目不一致，请重新打开练习。',{code:'TASK_SKILL_MISMATCH'});
        const prompt=task?.prompt??str(b.prompt||'',6000),title=task?.title??str(b.title||b.prompt||'课堂练习',1000,true),text=str(b.text??b.response??'',30000),stage=task?.stage??str(b.stage||'',40),selfCheck=object(b.selfCheck||{},20000),parentId=b.parentId?str(b.parentId,50):null;
        if(parentId&&!await db.prepare('SELECT id FROM submissions WHERE id=? AND user_id=? AND skill=?').get(parentId,user.id,b.skill))fail(400,'找不到需要修改的作业。');
        let audioId=null,audioBytes=null,audioMime=null,blobKey=null;
        if(b.audioBase64){if(typeof b.audioBase64!=='string'||b.audioBase64.length>7*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(b.audioBase64))fail(400,'录音文件格式不正确。');audioMime=String(b.mimeType||'audio/webm').split(';')[0];if(!['audio/webm','audio/ogg','audio/wav','audio/mpeg','audio/mp4'].includes(audioMime))fail(400,'录音格式暂不支持。');let decoded;try{decoded=atob(b.audioBase64);}catch{fail(400,'录音文件格式不正确。');}audioBytes=Uint8Array.from(decoded,character=>character.charCodeAt(0));if(!audioBytes.length||audioBytes.length>AUDIO_LIMIT)fail(413,'录音须小于 5 MB，请缩短后重试。');audioId=crypto.randomUUID();blobKey=`private/audio/${user.id}/${audioId}`;}
        else if(b.audioId){const row=await db.prepare('SELECT id FROM audio WHERE id=? AND user_id=?').get(str(b.audioId,50),user.id);if(!row)fail(400,'找不到这份录音。');audioId=row.id;}
        if(!text&&!audioId)fail(400,'请先完成文字作答或录音。');
        const payloadHash=await digest(JSON.stringify({skill:b.skill,prompt,title,text,taskId,stage,parentId,selfCheck,audio:audioBytes?{mime:audioMime,digest:await digest(audioBytes)}:audioId}));
        async function duplicate(){if(!clientSubmissionId)return null;const row=await db.prepare('SELECT id,payload_hash FROM submissions WHERE user_id=? AND client_submission_id=?').get(user.id,clientSubmissionId);if(row&&row.payload_hash!==payloadHash)fail(409,'这次提交的内容已变化，请保留作答并重新提交为新版本。',{code:'SUBMISSION_KEY_CONFLICT'});return row?getSubmission(row.id):null;}
        const prior=await duplicate();if(prior)return json(200,{submission:prior,deduplicated:true});
        if(audioBytes){if(!env.BUCKET)fail(503,'录音存储尚未配置。请先保留录音，稍后重试。');const used=(await db.prepare('SELECT COALESCE(SUM(size),0) AS n FROM audio WHERE user_id=?').get(user.id)).n;if(used+audioBytes.length>AUDIO_QUOTA)fail(413,'录音空间已满，请联系管理员。');await env.BUCKET.put(blobKey,audioBytes,{httpMetadata:{contentType:audioMime}});}
        try{
          await revalidate();const time=nowISO(),statements=[];
          if(audioBytes)statements.push(db.prepare('INSERT INTO audio(id,user_id,mime_type,blob_key,size,created_at) SELECT ?,?,?,?,?,? WHERE (SELECT COALESCE(SUM(size),0) FROM audio WHERE user_id=?)+?<=?').bind(audioId,user.id,audioMime,blobKey,audioBytes.length,time,user.id,audioBytes.length,AUDIO_QUOTA));
          statements.push(db.prepare('INSERT INTO submissions(id,user_id,skill,title,task_id,text,parent_id,stage,self_check,audio_id,created_at,prompt,client_submission_id,payload_hash) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE ? IS NULL OR EXISTS(SELECT 1 FROM audio WHERE id=? AND user_id=?)').bind(id,user.id,b.skill,title,taskId,text,parentId,stage,selfCheck,audioId,time,prompt,clientSubmissionId,payloadHash,audioId,audioId,user.id));
          statements.push(db.prepare('INSERT INTO grading_jobs(submission_id,status,attempts,result,error,next_attempt_at,created_at,updated_at) SELECT ?,?,0,NULL,?,0,?,? WHERE EXISTS(SELECT 1 FROM submissions WHERE id=?)').bind(id,'not_configured',FREE_GRADING_MESSAGE,Date.now(),Date.now(),id));
          const saved=await db.batch(statements);if(audioBytes&&!saved[0].changes)throw new HttpError(413,'录音空间已满，请联系管理员。');
        }catch(error){if(blobKey)await env.BUCKET.delete(blobKey).catch(()=>{});const repeated=await duplicate();if(repeated)return json(200,{submission:repeated,deduplicated:true});throw error;}
        return json(201,{submission:await getSubmission(id)});
      }
      if(p.startsWith('/api/audio/')&&['GET','HEAD'].includes(m)){
        const user=await authenticate({active:true}),row=await db.prepare('SELECT * FROM audio WHERE id=?').get(p.slice('/api/audio/'.length));if(!row||(user.role!=='admin'&&row.user_id!==user.id))fail(404,'找不到这份录音。');
        if(!env.BUCKET)fail(503,'录音存储暂时不可用。');const range=audioRange(request.headers.get('Range'),row.size),headers={'Content-Type':row.mime_type,'Content-Length':String(range.end-range.start+1),'Cache-Control':'private, no-store','Content-Disposition':'inline','Accept-Ranges':'bytes'};if(range.status===206)headers['Content-Range']=`bytes ${range.start}-${range.end}/${row.size}`;
        if(m==='HEAD')return new Response(null,{status:range.status,headers});const stored=await env.BUCKET.get(row.blob_key,range.status===206?{range:{offset:range.start,length:range.end-range.start+1}}:undefined);if(!stored)fail(404,'找不到这份录音文件。');return new Response(stored.body,{status:range.status,headers});
      }
      if(p==='/api/announcements'&&m==='GET'){await authenticate();return json(200,{announcements:await db.prepare('SELECT id,title,body,created_at AS createdAt FROM announcements WHERE archived=0 ORDER BY created_at DESC LIMIT 50').all()});}
      if(p.startsWith('/api/admin/'))return await handleAdminAPI(request,url,{db,authenticate,body,json,fail,str,object,publicUser,profileOf,readPlan:id=>readPlan(db,id),readAssessments,authoritativeState,listSubmissions,getUser,hashPassword,validPassword,hashGuard,audit:(actor,action,target)=>audit(db,actor,action,target),limited,nowISO,band,gradingTaskCatalog,submission,getSubmission:getSubmissionRow,pageParams,revalidate:()=>revalidate?.(),freeGradingMessage:FREE_GRADING_MESSAGE})||json(404,{error:'找不到这个接口。'});
      fail(404,'找不到这个接口。');
    }
    return secured(await route(),secure);
  }catch(error){const status=Number.isInteger(error.status)?error.status:500;if(status===500)console.error('SLS API failure:',error.name||'Error');const extra=error.extra||{},headers={};if(extra.retryAfter)headers['Retry-After']=String(extra.retryAfter);if(status===416&&extra.size)headers['Content-Range']=`bytes */${extra.size}`;return secured(json(status,{error:status===500?'服务暂时不可用，请稍后重试。':error.message,...extra},headers),secure);}
}
function secured(response,secure){const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');headers.set('X-Frame-Options','SAMEORIGIN');headers.set('Permissions-Policy','camera=(), geolocation=(), microphone=(self)');if(secure)headers.set('Strict-Transport-Security','max-age=31536000');return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
