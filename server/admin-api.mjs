// Administrator routes for the Workers deployment. Authentication, CSRF checks,
// D1 adaptation and response formatting are supplied by the main API handler.
const PAGE_LIMIT = 100;
const RETRY_NOTICE = '自动批改服务尚未配置，作业已保存，请由老师批改。';

function pageParams(url) {
  return {
    page: Math.max(1, Math.min(100000, Math.floor(Number(url.searchParams.get('page')) || 1))),
    limit: Math.max(1, Math.min(PAGE_LIMIT, Math.floor(Number(url.searchParams.get('limit')) || 30))),
  };
}

const changes = result => Number(result?.changes ?? result?.result?.changes ?? result?.meta?.changes ?? 0);

/** Return null when the pathname/method belongs to a different API handler. */
export async function handleAdminAPI(request, url, ctx) {
  const p = url.pathname;
  if (!p.startsWith('/api/admin/')) return null;
  const m = request.method;
  const {
    db, authenticate, body, json, fail, str, object, publicUser, profileOf,
    readPlan, readAssessments, authoritativeState, listSubmissions, getUser,
    hashPassword, validPassword, hashGuard, audit, limited, nowISO, band,
    gradingTaskCatalog, submission, getSubmission,
  } = ctx;
  const admin = await authenticate({ active: true, admin: true });
  const auditStatement = (action, targetId, condition = '', args = []) => db.prepare(
    `INSERT INTO audit_log(actor_id,action,target_id,created_at) SELECT ?,?,?,? ${condition}`,
  ).bind(admin.id, action, targetId, nowISO(), ...args);
  const studentExists = 'EXISTS (SELECT 1 FROM users WHERE id=? AND role=\'student\')';
  const studentWork = async id => {
    const row = await db.prepare("SELECT s.id,s.user_id FROM submissions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND u.role='student'").get(id);
    if (!row) fail(404, '找不到这份学生作业。');
    return row;
  };
  const workResponse = async id => {
    const row = await getSubmission(id);
    if (!row) fail(404, '找不到这份作业。');
    return json(200, { submission: await submission(row) });
  };

  if (p === '/api/admin/summary' && m === 'GET') {
    const result = await db.prepare(`SELECT
      (SELECT COUNT(*) FROM users WHERE role='student') AS students,
      (SELECT COUNT(*) FROM users WHERE role='student' AND status='pending') AS pendingStudents,
      (SELECT COUNT(*) FROM users WHERE role='student' AND status='active') AS activeStudents,
      (SELECT COUNT(*) FROM submissions WHERE status='submitted') AS pendingSubmissions,
      (SELECT COUNT(*) FROM submissions WHERE status='reviewed') AS reviewedSubmissions`).get();
    return json(200, result);
  }

  if (p === '/api/admin/students' && m === 'GET') {
    const { page, limit } = pageParams(url);
    const query = (url.searchParams.get('query') || '').slice(0, 100);
    const status = url.searchParams.get('status');
    let where = "role='student'";
    const args = [];
    if (query) {
      where += ' AND (username LIKE ? OR name LIKE ? OR class_name LIKE ?)';
      args.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }
    if (['pending', 'active', 'suspended'].includes(status)) {
      where += ' AND status=?';
      args.push(status);
    }
    const [rows, count] = await Promise.all([
      db.prepare(`SELECT * FROM users WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...args, limit, (page - 1) * limit),
      db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ${where}`).get(...args),
    ]);
    return json(200, { students: await Promise.all(rows.map(row => publicUser(row))), total: count.n, page, limit });
  }

  const match = p.match(/^\/api\/admin\/students\/([^/]+)(?:\/(state|plan|reset-password|assessments)(?:\/([^/]+))?)?$/);
  if (match) {
    const u = await getUser(match[1]);
    if (!u || u.role !== 'student') fail(403, '这里仅管理学生账号。');
    const action = match[2], assessmentId = match[3];
    if (assessmentId && action !== 'assessments') return null;

    if (m === 'GET' && !action) {
      const [state, plan, assessments, works] = await Promise.all([
        authoritativeState(u.id), readPlan(u.id), readAssessments(u.id),
        listSubmissions('WHERE s.user_id=?', [u.id], url),
      ]);
      return json(200, { user: await publicUser(u), profile: await profileOf(u), state, plan, assessments, submissions: works.submissions });
    }
    if (m === 'GET' && action === 'state') return json(200, await authoritativeState(u.id));

    if (m === 'PATCH' && !action) {
      const b = await body(30000);
      if (b.status !== undefined && !['pending', 'active', 'suspended'].includes(b.status)) fail(400, '账号状态不正确。');
      const fields = ['updated_at=?'], args = [nowISO()];
      if (b.status !== undefined) { fields.push('status=?'); args.push(b.status); }
      if (b.name !== undefined) { fields.push('name=?'); args.push(str(b.name, 60, true)); }
      if (b.grade !== undefined) { fields.push('grade=?'); args.push(str(b.grade, 40)); }
      if (b.className !== undefined) { fields.push('class_name=?'); args.push(str(b.className, 40)); }
      if (b.goals !== undefined) { fields.push('goals=?'); args.push(object(b.goals, 15000)); }
      const statements = [db.prepare(`UPDATE users SET ${fields.join(',')} WHERE id=? AND role='student'`).bind(...args, u.id)];
      if (b.status === 'suspended') statements.push(db.prepare(`DELETE FROM sessions WHERE user_id=? AND ${studentExists}`).bind(u.id, u.id));
      statements.push(auditStatement('student.updated:' + (b.status || u.status), u.id, `WHERE ${studentExists}`, [u.id]));
      const results = await db.batch(statements);
      if (!changes(results[0])) fail(404, '未找到这个学生。');
      return json(200, { user: await publicUser(await getUser(u.id)) });
    }

    if (m === 'POST' && action === 'reset-password') {
      const b = await body(10000);
      if (!validPassword(b.password)) fail(400, '新密码需要 10–128 位。');
      const hash = await hashGuard(() => hashPassword(b.password));
      // Hashing can yield long enough for the administrator's session to change.
      await authenticate({ active: true, admin: true });
      const results = await db.batch([
        db.prepare("UPDATE users SET password_hash=?,updated_at=? WHERE id=? AND role='student'").bind(hash, nowISO(), u.id),
        db.prepare(`DELETE FROM sessions WHERE user_id=? AND ${studentExists}`).bind(u.id, u.id),
        auditStatement('student.password_reset', u.id, `WHERE ${studentExists}`, [u.id]),
      ]);
      if (!changes(results[0])) fail(404, '未找到这个学生。');
      return json(200, { ok: true });
    }

    if (m === 'PUT' && action === 'plan') {
      const b = await body(150000), raw = object(b.plan, 100000);
      if (!Number.isSafeInteger(b.version) || b.version < 0) fail(400, '请先读取当前学习计划，再提交计划版本。', { code: 'PLAN_VERSION_REQUIRED' });
      const time = nowISO();
      // Both insert and update compare the expected version inside the write.
      // A pre-read version check alone would allow two workers to overwrite it.
      const result = b.version === 0
        ? await db.prepare(`INSERT INTO learning_plans(user_id,version,plan,updated_by,updated_at)
            SELECT ?,1,?,?,? WHERE ${studentExists}
            ON CONFLICT(user_id) DO UPDATE SET version=learning_plans.version+1,
              plan=excluded.plan,updated_by=excluded.updated_by,updated_at=excluded.updated_at
            WHERE learning_plans.version=0`).run(u.id, raw, admin.id, time, u.id)
        : await db.prepare(`UPDATE learning_plans SET version=version+1,plan=?,updated_by=?,updated_at=?
            WHERE user_id=? AND version=? AND ${studentExists}`).run(raw, admin.id, time, u.id, b.version, u.id);
      if (!changes(result)) fail(409, '学习计划已经更新，请刷新后再编辑。', { code: 'PLAN_CONFLICT', ...await readPlan(u.id) });
      await audit(admin.id, 'student.plan_updated', u.id);
      return json(200, await readPlan(u.id));
    }

    if (m === 'GET' && action === 'assessments' && !assessmentId) return json(200, { assessments: await readAssessments(u.id) });
    if (m === 'POST' && action === 'assessments' && !assessmentId) {
      const b = await body(15000);
      if (!['teacher', 'official'].includes(b.source)) fail(400, '请选择成绩来源。');
      if (typeof b.assessedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(b.assessedAt) || !Number.isFinite(Date.parse(b.assessedAt)) || Date.parse(b.assessedAt) > Date.now() + 300000) fail(400, '请选择有效的考试日期，不能晚于今天。');
      const overall = band(b.overall);
      const bands = Object.fromEntries(['listening', 'reading', 'writing', 'speaking'].map(skill => [skill, band(b.skills?.[skill])]));
      if (overall === null && Object.values(bands).every(value => value === null)) fail(400, '请至少填写一项实际成绩。');
      const id = crypto.randomUUID();
      await db.batch([
        db.prepare('INSERT INTO band_assessments(id,user_id,kind,assessed_at,overall,bands,note,reviewed_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)')
          .bind(id, u.id, b.source === 'official' ? 'official' : 'teacher_mock', new Date(b.assessedAt).toISOString(), overall, JSON.stringify(bands), str(b.note || '', 500), admin.id, nowISO()),
        auditStatement('assessment.created', id),
      ]);
      return json(201, { assessment: (await readAssessments(u.id)).find(item => item.id === id) });
    }
    if (['PATCH', 'DELETE'].includes(m) && action === 'assessments' && assessmentId) {
      const b = m === 'PATCH' ? await body(1000) : { voided: true };
      if (b.voided !== true) fail(400, '成绩记录只支持作废，历史记录会保留。');
      const results = await db.batch([
        db.prepare('UPDATE band_assessments SET voided=1 WHERE id=? AND user_id=?').bind(assessmentId, u.id),
        auditStatement('assessment.voided', assessmentId, 'WHERE EXISTS (SELECT 1 FROM band_assessments WHERE id=? AND user_id=?)', [assessmentId, u.id]),
      ]);
      if (!changes(results[0])) fail(404, '找不到这条成绩记录。');
      return json(200, { ok: true });
    }
  }

  if (p === '/api/admin/submissions' && m === 'GET') {
    const status = url.searchParams.get('status'), filter = ['submitted', 'reviewed'].includes(status);
    return json(200, await listSubmissions(filter ? 'WHERE s.status=?' : '', filter ? [status] : [], url));
  }
  const regrade = p.match(/^\/api\/admin\/submissions\/([^/]+)\/regrade$/);
  if (regrade && m === 'POST') {
    await limited('regrade:' + admin.id, 30, 3600000);
    await studentWork(regrade[1]);
    const time = Date.now();
    await db.batch([
      db.prepare(`INSERT INTO grading_jobs(submission_id,status,attempts,result,error,next_attempt_at,created_at,updated_at)
        VALUES(?,'not_configured',0,NULL,?,0,?,?) ON CONFLICT(submission_id) DO UPDATE SET
        status='not_configured',attempts=0,result=NULL,error=excluded.error,next_attempt_at=0,updated_at=excluded.updated_at`)
        .bind(regrade[1], RETRY_NOTICE, time, time),
      auditStatement('submission.machine_retry', regrade[1]),
    ]);
    return workResponse(regrade[1]);
  }
  if (p === '/api/admin/grading/tasks' && m === 'GET') return json(200, await gradingTaskCatalog(false));
  if (p === '/api/admin/grading' && m === 'GET') return json(200, { configured: false, jobs: await db.prepare('SELECT status,COUNT(*) AS count FROM grading_jobs GROUP BY status').all() });

  const review = p.match(/^\/api\/admin\/submissions\/([^/]+)$/);
  if (review && m === 'PATCH') {
    await studentWork(review[1]);
    const b = await body(100000);
    const feedback = str(b.feedback ?? b.comment ?? '', 15000, true), rubric = object(b.rubric || {}, 30000);
    const results = await db.batch([
      db.prepare(`UPDATE submissions SET status='reviewed',feedback=?,rubric=?,reviewed_at=?,reviewed_by=?
        WHERE id=? AND user_id IN (SELECT id FROM users WHERE role='student')`).bind(feedback, rubric, nowISO(), admin.id, review[1]),
      auditStatement('submission.reviewed', review[1], "WHERE EXISTS (SELECT 1 FROM submissions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND u.role='student')", [review[1]]),
    ]);
    if (!changes(results[0])) fail(404, '找不到这份学生作业。');
    return workResponse(review[1]);
  }

  if (p === '/api/admin/announcements' && m === 'POST') {
    const b = await body(30000), id = crypto.randomUUID();
    const title = str(b.title, 160, true), text = str(b.body, 15000, true), createdAt = nowISO();
    await db.batch([
      db.prepare('INSERT INTO announcements(id,title,body,created_by,created_at) VALUES(?,?,?,?,?)').bind(id, title, text, admin.id, createdAt),
      auditStatement('announcement.created', id),
    ]);
    return json(201, { announcement: { id, title, body: text, createdAt } });
  }
  const announcement = p.match(/^\/api\/admin\/announcements\/([^/]+)$/);
  if (announcement && m === 'PATCH') {
    const b = await body(1000);
    if (typeof b.archived !== 'boolean') fail(400, '请选择是否归档。');
    const results = await db.batch([
      db.prepare('UPDATE announcements SET archived=? WHERE id=?').bind(b.archived ? 1 : 0, announcement[1]),
      auditStatement('announcement.archived', announcement[1], 'WHERE EXISTS (SELECT 1 FROM announcements WHERE id=?)', [announcement[1]]),
    ]);
    if (!changes(results[0])) fail(404, '找不到这条通知。');
    return json(200, { ok: true });
  }
  if (p === '/api/admin/settings' && m === 'GET') return json(200, { registrationOpen: (await db.prepare('SELECT value FROM settings WHERE key=?').get('registration_open'))?.value !== 'false' });
  if (p === '/api/admin/settings' && m === 'PATCH') {
    const b = await body(1000);
    if (typeof b.registrationOpen !== 'boolean') fail(400, '注册开关不正确。');
    await db.batch([
      db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('registration_open', String(b.registrationOpen)),
      auditStatement('registration.' + String(b.registrationOpen), null),
    ]);
    return json(200, { registrationOpen: b.registrationOpen });
  }
  if (p === '/api/admin/audit' && m === 'GET') return json(200, { events: await db.prepare('SELECT a.id,a.action,a.target_id AS targetId,a.created_at AS createdAt,u.name AS actor FROM audit_log a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.id DESC LIMIT 200').all() });
  return null;
}
