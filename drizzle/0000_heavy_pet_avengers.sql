CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audio` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`mime_type` text NOT NULL,
	`blob_key` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "audio_size" CHECK("audio"."size" > 0 AND "audio"."size" <= 5242880)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `audio_blob_key` ON `audio` (`blob_key`);--> statement-breakpoint
CREATE INDEX `audio_owner` ON `audio` (`user_id`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`target_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `band_assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`assessed_at` text NOT NULL,
	`overall` real,
	`bands` text DEFAULT '{}' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`reviewed_by` text NOT NULL,
	`created_at` text NOT NULL,
	`voided` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "band_assessments_kind" CHECK("band_assessments"."kind" IN ('teacher_mock','official'))
);
--> statement-breakpoint
CREATE TABLE `grading_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`submission_id` text NOT NULL,
	`user_id` text NOT NULL,
	`started_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `grading_attempt_dates` ON `grading_attempts` (`started_at`,`user_id`);--> statement-breakpoint
CREATE TABLE `grading_jobs` (
	`submission_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`result` text,
	`error` text,
	`next_attempt_at` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `grading_due` ON `grading_jobs` (`status`,`next_attempt_at`);--> statement-breakpoint
CREATE TABLE `learning_plans` (
	`user_id` text PRIMARY KEY NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`plan` text DEFAULT '{}' NOT NULL,
	`updated_by` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `learning_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`state` text DEFAULT '{}' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_expiry` ON `rate_limits` (`reset_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`csrf` text NOT NULL,
	`expires_at` integer NOT NULL,
	`last_seen` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expiry` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`skill` text NOT NULL,
	`title` text NOT NULL,
	`task_id` text DEFAULT '' NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`parent_id` text,
	`stage` text DEFAULT '' NOT NULL,
	`self_check` text DEFAULT '{}' NOT NULL,
	`audio_id` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`feedback` text DEFAULT '' NOT NULL,
	`rubric` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`reviewed_at` text,
	`reviewed_by` text,
	`prompt` text DEFAULT '' NOT NULL,
	`client_submission_id` text,
	`payload_hash` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `submissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`audio_id`) REFERENCES `audio`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `submissions_owner` ON `submissions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_idempotency` ON `submissions` (`user_id`,`client_submission_id`) WHERE "submissions"."client_submission_id" IS NOT NULL;--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`grade` text DEFAULT '' NOT NULL,
	`class_name` text DEFAULT '' NOT NULL,
	`goals` text DEFAULT '{}' NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_login_at` text,
	CONSTRAINT "users_role" CHECK("users"."role" IN ('student','admin')),
	CONSTRAINT "users_status" CHECK("users"."status" IN ('pending','active','suspended'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);