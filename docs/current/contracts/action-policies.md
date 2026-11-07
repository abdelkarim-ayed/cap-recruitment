# Action policies — existing workflow

R1 inventory, updated for the 2026-11-07 [screening slice](screening-api.md). Source rules below require migration 007 for screening operations (applied locally during demo setup); application integration/manual UX remains pending. Verification is in [status](../status.md).

## Ownership of checks

- `packages/domain/src/actions.ts`: role vocabulary, static action→eligible-role map and typed `{allowed,visible,reason}` contract. This map is not a resource grant or a new session/token claim.
- `auth/session.guard.ts` (`SessionGuard`): existing cookie/session/trusted-Origin sequence, then `@RequireAction` role eligibility. Legacy `@Roles` remains compatible. Missing sessions stay 401; role/Origin denials stay 403.
- Feature-owned `vacancy.policy.ts`, `application.policy.ts`, `review.policy.ts`, `interview.policy.ts`: ownership/assignment/state requirements, used at the existing service check points and to produce advisory UI availability. `auth/action-policy.ts` only adapts policy decisions to existing errors; it is not a workflow engine.
- Mutation services retain their lock/transaction owner and original check ordering. Revision comparisons, request validation and slot/overlap checks stay separate from action eligibility. Read methods with trusted internal callers retain their existing controller/route boundary; availability is not permission to call them without that boundary.
- `packages/domain/src/workflow-views.ts`: shared action-bearing response types. TypeScript does not runtime-validate stored/received JSON; existing request schemas remain authoritative.

API paths below are relative to `/api`; source paths without a package prefix are under `apps/api/src/`.

## Enumerated actions and current requirements

| Actions | Eligible actors and resource/state rules |
| --- | --- |
| `vacancy.read/create` | Admin/recruiter (shared HR); create makes the actor owner. Public vacancy routes remain separately allowlisted and published-only. |
| `vacancy.edit/publish/close` | HR plus stored owner; edit draft only. Publish validates intake/non-separator input and the optionally empty interview plan, checking both counters. Close stops intake only. Same-state owner publish/close stays idempotent even with an old revision. |
| `interviewPlan.read/edit` | HR reads; owner edits drafts only, defensively denied if appointments exist. Publication freezes even empty/unscheduled plans; close does not reopen. Publish checks both counters under the same vacancy lock. Separate interview revision/draft no-ops retained. |
| `application.submit/list/listVacancy/read/download` | Candidate submits; candidates list/read only their own applications. HR has shared access; vacancy-wide lists are HR-only. Direct generic application/document routes still deny interviewer role at the route guard. |
| `application.readAll`, `interview.application/document` | HR has shared application access. Through scoped interview routes, an interviewer needs current assignment to that interview plus at least one scheduled/completed assignment on the application for answers/files. Cancelled-only assignments grant no application access. Ownership/assignment is resolved from PostgreSQL, not UI flags. |
| `review.read/edit/release/export` | Shared HR; no owner restriction. Edit requires tasks, undecided/not-completed review and whole-application normal settlement or manual release. Release accepts any unfinished work, including active, and permanently fences processing; completion/screening locks corrections. Source UI confirms release explicitly, never automatically retries; requires migration 008, applied locally during demo setup. Diagnostic export-all unchanged; screening export excludes decided records with optional factual readiness filters. |
| `workflow.read/change` | Shared HR screening from received/compatible review_ready without readiness gate. Individual/import use one transaction-owned screening command with closure and candidate notice. Screening-rejection text optional; later recruitment rejection still requires reason, shared HR through preselected and owner afterwards. Hired/not_selected terminal; no screening undo. |
| Workflow Offer/Hired policies | HR owner only: empty plan requires preselected; nonempty requires interview stage and every configured interview completed/Pass. Owner explicitly records Offer; Hired separately requires Offer. No automatic offer, artificial appointment, screening/readiness gate or admin owner override. |
| `interview.list/read/readAll/directory` | HR reads all; interviewer only their assignments. Staff directory is HR-only. Metadata of an assigned cancelled interview remains readable, but does not itself grant documents. |
| `interview.schedule/reschedule/cancel` | HR shared; application preselected/interview, appointment scheduled where applicable. Existing time, assignee-role, overlap, uniqueness and revision checks remain. Cancellation/rejection/Fail retain their distinct transactional effects. |
| `interview.requestRescheduling/submitFeedback` | Only the assigned interviewer, including HR acting as interviewer. Scheduled/active application required. Feedback additionally requires appointment start reached; rescheduling requests do not. Submitted feedback remains final; Fail cancels remaining unfinished appointments. |
| `notification.list/read` | All signed-in roles; own recipient rows only. Candidates see only own screening notices, never staff interview rows even after role change. Staff interview link revocation/read retention unchanged. Screening messages retained; no hide/mail/full timeline changes. |
| `staff.access` / `/me` | Staff access is admin/recruiter/interviewer; `/me` still returns the trusted actor for any valid signed-in role. Identity/provisioning and public health routes were not redesigned. |

## Additive availability responses

| Response | Added `actions` keys |
| --- | --- |
| Full staff vacancy create/get/patch/publish/close | `edit`, `publish`, `close` |
| Interview-plan get/put and interview results metadata | `edit` |
| HR application detail | `review`, `workflow`, `export` (omitted for candidate/interviewer projections) |
| Extraction review get/patch/release | `edit`, `release` |
| Application interview/workflow view | `preselect`, `reject`, `offer`, `hire`, `schedule` |
| Interview detail/list/result projections | `reschedule`, `cancel`, `requestRescheduling`, `submitFeedback`, `readApplication` |

```json
{
  "allowed": false,
  "visible": true,
  "reason": "Feedback can be submitted once the interview starts."
}
```

`allowed` describes current record-level eligibility, not a guarantee that a future command's revision/input/overlap checks succeed. `visible` is presentation only: it retains current UI relevance, including hidden technical idempotent actions and omission of cancelled-appointment application panels even where HR retains read permission. Reasons are safe user-facing text; denied-resource responses remain errors without availability payloads.

Existing `canAssess`, `canSchedule`, `editable`, `isOwner` fields remain with their previous meaning. In particular, legacy `canAssess` is not start-time aware and is not used as authority. The UI now consumes distinct rescheduling-request/feedback actions; a visible Offer button is disabled until the already-enforced interview requirements pass. Feedback availability is a server snapshot; refresh when its start time arrives. No new timer/push infrastructure.

Candidate/public application projections do not gain HR action reasons, review metadata, processingClosed or raw business stage. Candidates receive only generic own screening outcomes through Inbox. Trusted cookie actors remain the only identity/role source; UI eligibility never caches ownership/assignment in a token.

## Explicitly not delivered

Readiness/release backend and UI/list/filter are source-implemented; broader candidate timeline/notification effects and hide/lifetime remain planned. SI implements screening/closure/import/notices; B1-P validates/freezes publication; B1-F enables explicit zero-interview owner Offer. Spending/provider controls unchanged. Migrations 007/008 and real integration/manual gates remain pending.

Q-R1A still covers broader guard/HTTP/privacy/concurrency regression; Q-R1U later manual UX. B1-F ran the 8 current pure policy specifications plus new finalization model/DOM cases; that is not completion of the deferred R1 security/HTTP/DB regression. See dated evidence in status.
