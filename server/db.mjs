/** D1 uses async prepared statements; migrations run before deployment, never per request. */
export function openDatabase(binding) {
  if (!binding || typeof binding.prepare !== 'function' || typeof binding.batch !== 'function') {
    throw new Error('学校数据库尚未连接。');
  }
  return binding;
}

export function publicUser(row) {
  if (!row) return null;
  return {id:row.id,username:row.username,name:row.name,grade:row.grade,className:row.class_name,
    role:row.role,status:row.status,createdAt:row.created_at,lastLoginAt:row.last_login_at};
}
function parseObject(value) {
  try { const parsed = JSON.parse(value || '{}'); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}; }
  catch { return {}; }
}
export function profileOf(row) {
  return {name:row.name,grade:row.grade,className:row.class_name,goals:parseObject(row.goals)};
}
export async function readState(db, userId) {
  const row = await db.prepare('SELECT version,state,updated_at FROM learning_state WHERE user_id=?').bind(userId).first();
  return {version:row?.version || 0,state:row ? parseObject(row.state) : {},updatedAt:row?.updated_at || null};
}
export async function readPlan(db, userId) {
  const row = await db.prepare('SELECT version,plan,updated_at FROM learning_plans WHERE user_id=?').bind(userId).first();
  return {version:row?.version || 0,plan:row ? parseObject(row.plan) : {},updatedAt:row?.updated_at || null};
}
export async function audit(db, actorId, action, targetId = null) {
  return db.prepare('INSERT INTO audit_log(actor_id,action,target_id,created_at) VALUES(?,?,?,?)')
    .bind(actorId,action,targetId,new Date().toISOString()).run();
}
