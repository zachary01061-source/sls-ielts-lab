# SLS Workers API compatibility checklist

The browser files in `public/` retain the existing same-origin `/api/` contract. This checklist records the contract read from the previous `server/app.mjs` and the actual `account-client.mjs`, `textbook-ui.mjs`, `corpus-ui.mjs`, and `app.js` consumers. It is an implementation checklist, not a claim that a deployed endpoint has passed a live test.

## Authentication and responses

- Return JSON with `Content-Type: application/json` for every API error. Do not send the frontend HTML shell for `/api/*` errors.
- Preserve the HttpOnly session cookie, `credentials: include`, and response `{user, csrfToken}`. No credential is stored in browser storage or sent to the publisher.
- Mutations require the same origin and the session's `X-CSRF-Token`, except registration/login before a session exists. `OPTIONS` is not a public CORS route.
- Pending students may manage their profile but receive 403 for learning data, material files, submissions and recordings. Anonymous access receives 401. Student access to admin endpoints receives 403.
- Preserve JSON error `{error, code?, ...details}` and meaningful status codes. The browser specifically consumes `STATE_CONFLICT`, `PLAN_CONFLICT`, `SUBMISSION_KEY_CONFLICT`, and `TASK_SKILL_MISMATCH`.
- Suspension, password change and administrator password reset revoke affected sessions. Admin access must not be inferred from client state or submitted JSON.

## Route and payload contracts

| Method and route | Browser-facing payload or behavior | Access |
| --- | --- | --- |
| `GET /api/health` | `{ok, service, machineGradingConfigured, registrationOpen}` | Public |
| `POST /api/auth/register` | Input username/password/name/grade/className; 201 `{user,message}` with student pending | Public, limited |
| `POST /api/auth/login` | `{user,csrfToken}` plus session cookie | Public, limited |
| `GET /api/auth/me` | `{user,csrfToken}` or 401 | Session |
| `POST /api/auth/logout` | `{ok:true}`, revoke session and clear cookie | Session |
| `POST /api/auth/change-password` | Input currentPassword/newPassword; revoke sessions | Session |
| `GET/PATCH /api/me/profile` | `{user,profile}`; edit name/grade/className/goals | Session |
| `GET /api/me/state` | `{state,version,...}` with authoritative reviews and verified assessments | Active |
| `PUT /api/me/state` | Input `{state,version}`; atomic compare-and-swap; 409 includes current state/version | Active |
| `GET /api/me/plan` | Teacher plan with version and update metadata | Active |
| `GET /api/me/submissions` | `{submissions,total,page,limit}` | Active, own work |
| `POST /api/me/submissions` | JSON text/response, taskId/materialId, parentId, selfCheck, clientSubmissionId, optional audioBase64/mimeType; 201 `{submission}` or 200 deduplicated | Active |
| `GET /api/audio/:id` | Private inline audio; owner or admin only | Active |
| `GET /api/announcements` | `{announcements:[{id,title,body,createdAt}]}` | Session |
| `GET /api/textbooks` | `{schemaVersion,books,missing}`; four books | Active |
| `GET /api/textbooks/:book` | `{book:{...metadata,sections},sections}` | Active |
| `GET /api/textbooks/:book/sections/:section` | `{book,section,task,tasks}` including all variants | Active |
| `GET /api/textbooks/:book/pages/:page` | `{book,page:{page,text}}` | Active |
| `GET/HEAD /api/textbooks/:book/pdf` | PDF headers, single Range, 206/416; private no-store | Active |
| `GET /api/textbooks/tasks/:encodedTaskId` | `{task,book,section}`; `textbook:` task IDs are URL-encoded | Active |
| `GET /api/corpus/resources` | `{title,resources}` with same-origin url/proxyUrl only; 168 audio and seven PDFs | Active |
| `GET/HEAD /api/corpus/resources/:id` | Fixed publisher resource proxy, audio/PDF, Range support, private no-store | Active, user limit |
| `GET /api/admin/summary` | students/pendingStudents/activeStudents/pendingSubmissions/reviewedSubmissions counts | Admin |
| `GET /api/admin/students` | Filters query/status/page/limit; `{students,total,page,limit}` | Admin |
| `GET /api/admin/students/:id` | `{user,profile,state,plan,assessments,submissions}` | Admin |
| `GET /api/admin/students/:id/state` | Same authoritative state envelope | Admin |
| `PATCH /api/admin/students/:id` | Edit status/name/grade/className/goals; `{user}` | Admin |
| `POST /api/admin/students/:id/reset-password` | Input `{password}`; invalidate sessions | Admin |
| `PUT /api/admin/students/:id/plan` | Input `{plan,version?}`; plan CAS and `PLAN_CONFLICT` | Admin |
| `GET/POST /api/admin/students/:id/assessments` | Verified teacher/official assessment list or creation; never infer from machine reference | Admin |
| `PATCH/DELETE /api/admin/students/:id/assessments/:assessment` | Void record, preserve history; PATCH `{voided:true}` | Admin |
| `GET /api/admin/submissions` | Optional status/page/limit; `{submissions,total,page,limit}` | Admin |
| `PATCH /api/admin/submissions/:id` | `{feedback,rubric}`; preserve machine review separately | Admin |
| `POST /api/admin/submissions/:id/regrade` | Retry queue; `{submission}` | Admin |
| `GET /api/admin/grading/tasks` | `{schemaVersion,configured,total,tasks}` with trusted rubric and source metadata | Admin |
| `GET /api/admin/grading` | `{configured,jobs}` | Admin |
| `POST /api/admin/announcements` | Input title/body; `{announcement}` | Admin |
| `PATCH /api/admin/announcements/:id` | Input archived boolean; `{ok:true}` | Admin |
| `GET/PATCH /api/admin/settings` | `{registrationOpen}` | Admin |
| `GET /api/admin/audit` | `{events}` | Admin |

## Important compatibility details

1. Student state cannot forge machine reviews, teacher reviews, verified assessments, task requirements or ownership. Rebuild these values from authoritative records when reading state.
2. Submission IDs are idempotency keys scoped to the student. Repeating identical content returns the same work; changed content under the same key returns 409. Validate parent work belongs to the same student and skill.
3. A submission's canonical task controls title, prompt, skill, stage, rubric and material family. The family for all variants of a textbook section is `textbook:<sectionId>`.
4. Keep the original recording privately in object storage. The browser sends JSON/base64 and currently limits a recording to 5 MB. Return a same-origin `/api/audio/:id` URL, not a public bucket link.
5. `submission.rubric` remains the teacher's classroom review. Trusted task `task.rubric` describes IELTS criteria. Do not overwrite one with the other.
6. Machine `referenceScore` is practice feedback. It does not create a verified assessment, update a personal target, or become a full writing/overall score. The UI consumes the server-returned eligibility rather than deriving a band from level 1–4.
7. No configured grading service means `not_configured`, with saved work retained. Missing analyzed speech means `needs_audio` or explicit text-only feedback. It must not report pronunciation as assessed.
8. Textbook full text, original PDFs and student recordings must be served through authenticated API paths. They must not be copied into `public/`.
9. The corpus proxy uses `server/corpus-resources.json` as a fixed allowlist. Main API must authenticate and rate-limit before calling it. It streams without persistent caching, so publisher availability still affects playback.

## Regression checks provided

- `node --test tests/corpus.test.mjs`: 175 resource count, credential isolation, fixed URLs/redirects, GET/HEAD/Range, MIME checks, cancellation, timeouts and stream size limits.
- `node --test tests/account-transport-contract.test.mjs`: actual copied frontend route/method/body contracts, CSRF/cookie transport, audio encoding, CAS error details, session expiry and HTML fallthrough rejection.
- These unit checks do not replace authenticated D1/R2 integration tests or deployed playback tests. Run the full student registration/approval/login/state-save/submission/admin-review flow against the resulting Worker before claiming it works online.
