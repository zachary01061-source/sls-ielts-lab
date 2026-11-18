import { sql } from "drizzle-orm";
import { check, index, integer, real, sqliteTable, text, uniqueIndex, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  grade: text("grade").notNull().default(""),
  className: text("class_name").notNull().default(""),
  goals: text("goals").notNull().default("{}"),
  role: text("role").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  lastLoginAt: text("last_login_at"),
}, table => [
  check("users_role", sql`${table.role} IN ('student','admin')`),
  check("users_status", sql`${table.status} IN ('pending','active','suspended')`),
]);

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  csrf: text("csrf").notNull(),
  expiresAt: integer("expires_at").notNull(),
  lastSeen: integer("last_seen").notNull(),
}, table => [index("sessions_user").on(table.userId), index("sessions_expiry").on(table.expiresAt)]);

export const learningState = sqliteTable("learning_state", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(0),
  state: text("state").notNull().default("{}"),
  updatedAt: text("updated_at").notNull(),
});

export const learningPlans = sqliteTable("learning_plans", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(0),
  plan: text("plan").notNull().default("{}"),
  updatedBy: text("updated_by").references(() => users.id),
  updatedAt: text("updated_at").notNull(),
});

// Audio bytes live only in the private R2 binding. DB rows retain ownership and quota metadata.
export const audio = sqliteTable("audio", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  mimeType: text("mime_type").notNull(),
  blobKey: text("blob_key").notNull(),
  size: integer("size").notNull(),
  createdAt: text("created_at").notNull(),
}, table => [
  uniqueIndex("audio_blob_key").on(table.blobKey),
  index("audio_owner").on(table.userId),
  check("audio_size", sql`${table.size} > 0 AND ${table.size} <= 5242880`),
]);

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  skill: text("skill").notNull(),
  title: text("title").notNull(),
  taskId: text("task_id").notNull().default(""),
  text: text("text").notNull().default(""),
  parentId: text("parent_id").references((): AnySQLiteColumn => submissions.id),
  stage: text("stage").notNull().default(""),
  selfCheck: text("self_check").notNull().default("{}"),
  audioId: text("audio_id").references(() => audio.id),
  status: text("status").notNull().default("submitted"),
  feedback: text("feedback").notNull().default(""),
  rubric: text("rubric").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  reviewedAt: text("reviewed_at"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  prompt: text("prompt").notNull().default(""),
  clientSubmissionId: text("client_submission_id"),
  payloadHash: text("payload_hash").notNull().default(""),
}, table => [
  index("submissions_owner").on(table.userId, table.createdAt),
  uniqueIndex("submissions_idempotency").on(table.userId, table.clientSubmissionId).where(sql`${table.clientSubmissionId} IS NOT NULL`),
]);

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(), title: text("title").notNull(), body: text("body").notNull(),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(), archived: integer("archived").notNull().default(0),
});

export const bandAssessments = sqliteTable("band_assessments", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id),
  kind: text("kind").notNull(), assessedAt: text("assessed_at").notNull(), overall: real("overall"),
  bands: text("bands").notNull().default("{}"), note: text("note").notNull().default(""),
  reviewedBy: text("reviewed_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(), voided: integer("voided").notNull().default(0),
}, table => [check("band_assessments_kind", sql`${table.kind} IN ('teacher_mock','official')`)]);

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: text("actor_id").references(() => users.id),
  action: text("action").notNull(), targetId: text("target_id"), createdAt: text("created_at").notNull(),
});

export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(), count: integer("count").notNull(), resetAt: integer("reset_at").notNull(),
}, table => [index("rate_limits_expiry").on(table.resetAt)]);

export const settings = sqliteTable("settings", { key: text("key").primaryKey(), value: text("value").notNull() });

export const gradingJobs = sqliteTable("grading_jobs", {
  submissionId: text("submission_id").primaryKey().references(() => submissions.id, { onDelete: "cascade" }),
  status: text("status").notNull(), attempts: integer("attempts").notNull().default(0),
  result: text("result"), error: text("error"), nextAttemptAt: integer("next_attempt_at").notNull().default(0),
  createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull(),
}, table => [index("grading_due").on(table.status, table.nextAttemptAt)]);

export const gradingAttempts = sqliteTable("grading_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submissionId: text("submission_id").notNull().references(() => submissions.id),
  userId: text("user_id").notNull().references(() => users.id), startedAt: integer("started_at").notNull(),
}, table => [index("grading_attempt_dates").on(table.startedAt, table.userId)]);
