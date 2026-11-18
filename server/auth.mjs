import { publicUser } from './db.mjs';

const encoder = new TextEncoder();
const ITERATIONS = 100_000; // Workers Web Crypto's supported PBKDF2 maximum.
const PASSWORD_VERSION = 'pbkdf2-sha256-v1';
const BOOTSTRAP_KEY = 'admin_bootstrap_completed';
const hex = bytes => Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2,'0')).join('');
const unhex = value => Uint8Array.from(value.match(/../g) || [], pair => parseInt(pair,16));
function bytes(value) {
  if (typeof value === 'string') return encoder.encode(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer,value.byteOffset,value.byteLength);
  return encoder.encode(String(value));
}
export function token() {
  const random = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...random)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export async function digest(value) { return hex(await crypto.subtle.digest('SHA-256',bytes(value))); }
export function equal(a,b) {
  const left=bytes(String(a)),right=bytes(String(b));
  if(left.byteLength!==right.byteLength)return false;
  if(typeof crypto.subtle.timingSafeEqual==='function')return crypto.subtle.timingSafeEqual(left,right);
  // Node-based tests do not expose Workers' native timingSafeEqual extension.
  let difference=0;for(let i=0;i<left.length;i++)difference|=left[i]^right[i];return difference===0;
}
export function validPassword(value) { return typeof value==='string' && value.length>=10 && value.length<=128; }
async function derive(password,salt) {
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  return crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},key,256);
}
export async function hashPassword(password) {
  if(!validPassword(password))throw new Error('密码需要 10–128 位。');
  const salt=crypto.getRandomValues(new Uint8Array(16));
  return `${PASSWORD_VERSION}$${ITERATIONS}$${hex(salt)}$${hex(await derive(password,salt))}`;
}
export async function verifyPassword(password,encoded) {
  if(typeof password!=='string'||password.length>128)return false;
  const match=String(encoded).match(/^pbkdf2-sha256-v1\$100000\$([a-f0-9]{32})\$([a-f0-9]{64})$/);
  if(!match)return false;
  return equal(hex(await derive(password,unhex(match[1]))),match[2]);
}
export function cookieValue(request,name) {
  const value=typeof request?.headers?.get==='function'?request.headers.get('cookie'):request?.headers?.cookie;
  const candidates=String(value||'').split(';').map(piece=>piece.trim()).filter(piece=>piece.startsWith(name+'='));
  // Reject ambiguous duplicate session cookies rather than choosing an attacker-controlled one.
  return candidates.length===1?candidates[0].slice(name.length+1):'';
}
export function sessionCookie(value,secure=true,maxAge=7*24*60*60) {
  if(value!==''&&!/^[A-Za-z0-9_-]{43}$/.test(value))throw new Error('会话标识不正确。');
  if(!Number.isSafeInteger(maxAge)||maxAge<0||maxAge>7*24*60*60)throw new Error('会话期限不正确。');
  return `sls_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure?'; Secure':''}`;
}
export async function rateLimit(db,key,max,windowMs,now=Date.now()) {
  if(typeof key!=='string'||!key||key.length>300||!Number.isSafeInteger(max)||max<1||!Number.isSafeInteger(windowMs)||windowMs<1||!Number.isSafeInteger(now))throw new Error('限流参数不正确。');
  const row=await db.prepare(`INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?)
    ON CONFLICT(key) DO UPDATE SET
      count=CASE WHEN rate_limits.reset_at<=? THEN 1 ELSE MIN(rate_limits.count+1,2147483647) END,
      reset_at=CASE WHEN rate_limits.reset_at<=? THEN excluded.reset_at ELSE rate_limits.reset_at END
    RETURNING count,reset_at`).bind(key,now+windowMs,now,now).first();
  if(!row)throw new Error('限流状态暂时不可用。');
  return row.count<=max?{allowed:true}:{allowed:false,retryAfter:Math.max(1,Math.ceil((row.reset_at-now)/1000))};
}

function bootstrapError(status,message) { const error=new Error(message);error.status=status;return error; }
/** Call only from the same-origin, rate-limited bootstrap route. Never accept an environment token from a client body. */
export async function bootstrapAdmin(db,{username,password,name='学校管理员',providedToken,bootstrapToken}={}) {
  if(typeof bootstrapToken!=='string'||!/^[A-Za-z0-9_-]{43,128}$/.test(bootstrapToken))throw bootstrapError(404,'管理员初始化未开放。');
  if(typeof providedToken!=='string'||providedToken.length>128||!equal(providedToken,bootstrapToken))throw bootstrapError(403,'管理员初始化验证未通过。');
  const used=await db.prepare("SELECT 1 AS used FROM users WHERE role='admin' UNION ALL SELECT 1 FROM settings WHERE key=? LIMIT 1").bind(BOOTSTRAP_KEY).first();
  if(used)throw bootstrapError(409,'管理员已初始化，不能重复创建。');
  username=typeof username==='string'?username.trim().toLowerCase():'';
  if(!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username)||!validPassword(password))throw bootstrapError(400,'管理员用户名须为 3–40 位字母数字，密码须为 10–128 位。');
  if(typeof name!=='string'||!name.trim()||name.length>60)throw bootstrapError(400,'请填写 1–60 字的管理员姓名。');
  const id=crypto.randomUUID(),time=new Date().toISOString(),passwordHash=await hashPassword(password);
  let results;
  try {
    // D1 batch is a transaction. The conditions are checked inside that transaction, so racing requests cannot create two administrators.
    results=await db.batch([
      db.prepare(`INSERT INTO users(id,username,password_hash,name,role,status,created_at,updated_at)
        SELECT ?,?,?,?,'admin','active',?,?
        WHERE NOT EXISTS(SELECT 1 FROM users WHERE role='admin')
          AND NOT EXISTS(SELECT 1 FROM settings WHERE key=?)`).bind(id,username,passwordHash,name.trim(),time,time,BOOTSTRAP_KEY),
      db.prepare(`INSERT INTO settings(key,value) SELECT ?,? WHERE EXISTS(SELECT 1 FROM users WHERE id=? AND role='admin')
        ON CONFLICT(key) DO NOTHING`).bind(BOOTSTRAP_KEY,id,id),
      db.prepare(`INSERT INTO audit_log(actor_id,action,target_id,created_at)
        SELECT ?,'admin.bootstrap',?,? WHERE EXISTS(SELECT 1 FROM users WHERE id=? AND role='admin')`).bind(id,id,time,id),
      db.prepare("SELECT * FROM users WHERE id=? AND role='admin'").bind(id),
    ]);
  } catch(error) {
    if(String(error?.message||error).includes('UNIQUE constraint failed'))throw bootstrapError(409,'用户名已存在；请选择其他管理员用户名。');
    throw error;
  }
  const user=results[3]?.results?.[0];
  if(!user)throw bootstrapError(409,'管理员已初始化，不能重复创建。');
  return publicUser(user);
}
