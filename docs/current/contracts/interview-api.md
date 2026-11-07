# Interview pipeline, scheduling and inbox — implemented contract

Migration 006; session cookies and trusted Origin on writes. Backend and integrated React UI, no interview calendar/email integration or event bus. [Current extraction](../jev-safety.md) does not alter these interview rules.
The [screening slice](screening-api.md) adds shared individual/import closure and candidate notices, requiring unapplied migration 007. B1-P freezes/validates the saved plan at publication; B1-F enables explicit owner Offer from preselected when no interviews are configured. Neither needs a new migration. Broader candidate progress/effects and hide remain planned; screening reversal is not planned.

R1 typed actions/compatibility fields remain. Plan actions reflect publication-time freeze; workflow Offer availability reflects zero/nonzero interview rules below. See [action policies](action-policies.md).

## Model and policy
- Owner edits a draft vacancy-level interview plan (0–10 interviews, name/instructions). Publication freezes it, even empty and before appointments. Appointment arrangements remain editable under separate rules; closing intake does not cancel interviews or reopen plan editing. No publish-time assignee requirement.
- Each application/step has at most one instance: one existing staff interviewer, start/duration/timezone, link or location, status, final notes/optional integer score 0–10, Pass/Fail. Cancelled/completed records remain; no deletes, retries, reopening, panels or historical revisions.
- All admin/recruiter staff can schedule/reschedule/cancel and preselect. Only assigned interviewer submits feedback or requests rescheduling; staff acting as interviewers follow the same assignment rule. Owner alone records Offer/Hired. Admin has no owner override.
- Preselect can proceed regardless of extraction/review. Scheduling requires Preselected/Interview. Pass does not automatically advance/accept. Explicit final Fail sets Not selected and cancels **all other unfinished instances**, including already-started scheduled instances; no further feedback or scheduling. Submitted feedback is final. No reopening: use a new posting/application.
- Manual Not selected is shared HR through preselected, owner afterwards. Initial screening uses shared closure, optional internal text and one candidate notice; later rejection still requires reason/cancels unfinished interviews. Owner Offer requires preselected with zero configured interviews, or interview stage with all configured interviews passed. Hired separately requires Offer; no automatic stage changes from extraction/preselection/Pass.
- Interviewer sees only their assigned interview records and application answers/documents for scheduled/completed assignments. Cancelled-only assignments grant no candidate document access. Reassignment removes prior interviewer access. Generic application/review/list endpoints remain interviewer-denied. No other interviewer notes exposed. Owner name/email visible for offline contact.
- Generic candidate application stage remains Received; only own screening notices now communicate preselection/rejection. Notes/schedules/assessments and other candidate updates remain unpublished.

## API
Base `/api`. GET/PUT success 200, POST success 201. All path IDs UUID. Bad request 400, no session 401, role/owner/Origin denial 403, missing/inaccessible resource 404, stale revision/terminal state/conflict 409. Read responses private/no-store. JSON bodies strict; unknown fields rejected. See [interview-openapi.json](interview-openapi.json), linked into [openapi.json](openapi.json).

| Route | Contract |
| --- | --- |
| GET/PUT `vacancies/:id/interview-pipeline` | HR reads; owner PUT `{expectedRevision,steps:[{name,instructions?}]}`. Response `{vacancyId,revision,owner,editable,frozen,steps}`; step includes id/position. Revision independent of vacancy intake revision. |
| GET `vacancies/:id/interview-results` | HR; limit/offset; pipeline metadata plus `{items:[{id,candidate,stage,interviews}],total,limit,offset}`. All vacancy candidates, including failed ones. |
| GET `interviewers` | HR; `{items:[{id,name,email}]}` existing admin/recruiter/interviewer accounts, capped at 200. |
| GET `applications/:id/interviews` | HR; `{applicationId,stage,revision,owner,isOwner,steps,interviews}`. Revision is application workflow counter, separate from extraction review. |
| POST `applications/:id/stage` | `{expectedRevision,stage:preselected\|not_selected\|offer\|hired,reason?}`; returns application workflow. |
| POST `applications/:id/interviews` | `{expectedRevision,stepId,interviewerId,startsAt,durationMinutes,timezone,meeting}`; expected application workflow revision; returns interview detail. |
| GET `interviews` | HR all, interviewer assigned only. Required ISO from/to (max 93 days), view=agenda\|feedback\|cancelled, limit<=100/offset. Feedback means scheduled/start passed, not a submitted result. `{items,total,limit,offset}`. |
| GET `interviews/:id` | HR or assignee. Detail adds canAssess/canSchedule; final feedback visible only to HR/assignee. |
| PUT `interviews/:id/schedule` | HR; `{expectedRevision,interviewerId,startsAt,durationMinutes,timezone,meeting}`. Clears scheduling request; not cancel/recreate. |
| POST `interviews/:id/cancel` | HR; `{expectedRevision,reason}`. Cancels appointment only, does not reject application. |
| POST `interviews/:id/scheduling-issue` | Assignee; `{expectedRevision,reason}`; flags request for creator+owner. |
| POST `interviews/:id/feedback` | Assignee; `{expectedRevision,notes,score?:0..10\|null,outcome:pass\|fail}`. Start time must have arrived. Explicit UI confirmation before submission. |
| GET `interviews/:id/application` | Scoped immutable application projection, no processing definitions/review metadata for interviewers. |
| GET `interviews/:id/documents/:documentId` | Scoped attachment bytes through existing integrity-checked storage. Document must belong to interview application. |
| GET `inbox` | Own messages; candidates only screening notices, staff also existing interview notices. read=unread\|all, limit/offset. Adds nullable applicationId for screening; interviewId remains null after revocation. |
| POST `inbox/:id/read` | Own only; first read timestamp retained on repeat; `{id,readAt}`. No shell/secret/business-data links. |

Interview detail includes application/vacancy/step IDs, names/instructions, candidate identity, applicationStage, interviewer/owner identity, revision/status, startsAt/durationMinutes/timezone/meeting, notes/score/outcome/submittedAt, cancellationCause/changeCause, schedulingIssue/issueAt and updatedAt.

## Interview-plan saves

R3b no-op semantics remain for editable drafts. Separate owner, expected interview_revision and editability checks precede comparison under the vacancy lock. B1-P editability now requires draft status and no appointments; even identical published/closed requests return 409. No admin override. Publication validates the same saved content with both vacancy/interview counters under the same lock; see [publication contract](vacancy-api.md#publishclose).

Compare the ordered saved names/instructions using the same schema normalization as the request: trim strings, default omitted instructions to empty, ignore object-key order and preserve interview order. Generated IDs/positions are not editable comparison fields. A current-identical plan, including an empty list, returns the existing projection with no DELETE/INSERT/UPDATE, preserving IDs, positions and revision. A real change retains the existing replace-all behavior/new IDs and increments `interview_revision` once; other counters, notifications and UI are unchanged. Regression is deferred as Q-R3B; see [status](../status.md).

## Owner Offer and separate Hired

B1-F uses the existing stage endpoint/payload/revision. Authenticated HR eligibility, fresh vacancy ownership and application revision are separate checks under vacancy-share/application-update locks. Other HR/admin cannot override the owner; candidates/interviewers cannot finalize. Closing intake does not prevent ongoing finalization.

- **Zero configured interviews:** only `preselected → offer`, explicitly confirmed by the owner. Received/review_ready/interview/terminal states do not qualify merely because the count is zero. No fabricated appointment or automatic offer after screening. Processing/review is not a new gate.
- **Nonempty plan:** `interview → offer` only when the query counts every configured interview as completed with Pass. Missing/scheduled/cancelled/failed interviews do not count. Preselected cannot bypass a nonempty plan, even with inconsistent imported counts.
- **Hired:** only `offer → hired`, a separate explicit owner confirmation. It never combines with preselection/Offer. Stale/duplicate confirmations return 409; a successful transition increments flow revision once. No reopening or automatic retry.

Workflow `actions.offer` shares these stage/count prerequisites with mutation enforcement. UI shows owner Offer for a preselected empty-plan application, explains no automatic offer, and hides the irrelevant empty scheduling section. Nonempty/incomplete plans keep Offer disabled. Confirmation distinguishes Offer from the later Hired action. This checkpoint does not add candidate Offer/Hired messages, owner availability alerts, email or new schema fields; those remain notification work, not implicit effects of enabling this path.

Verification: 7 backend fake-transaction/policy-matrix cases, 8 current pure action-policy cases and 4 new DOM cases. Real SQL/count/join/lock/auth/HTTP behavior and manual UX are pending Q-B1F; updated tagged smoke source was not executed. No migration/data/provider/process/browser operations.

## Scheduling and causal effects
Date picker + half-hour time select (00/30), duration 30/60/90/120 minutes. UI uses browser timezone, submits ISO instant + IANA zone; server validates zone, half-hour local time and future start. UI rejects nonexistent DST local times; ambiguous DST times use browser's default offset (no offset chooser). No availability/calendar sync/recurrences. Overlapping scheduled appointments blocked using interviewer advisory transaction lock + interval query; adjacent intervals allowed.

Explicit workflow methods carry typed causes: hr_scheduled, hr_rescheduled, hr_cancelled, hr_ended_application, interview_failed (trigger interview/step), feedback_submitted, reschedule_requested. Persistence helpers do not infer business events from update/delete. Appointment cancellation, ending an application and failing an interview have different authority/preconditions/effects despite sharing row updates. Composite FKs prevent cross-vacancy application/step associations. Lock order vacancy → application → instance/interviewer; application lock serializes concurrent assessments and termination. State + cancellations + notification writes commit together. Concurrency revisions are counters, not historical snapshots.

## Inbox and retention
UX refinement: separate Mark as read without opening an interview; Open interview still marks read. Read messages stay in All retained messages; unread default removes them after refresh. Topbar inbox shortcut plus role-scoped related links on interview/workflow/pipeline pages. Owner is a resource capability on recruiter/admin, not a new role; only pipeline editing/finalization differ. No extra booking notices added for owners: existing creator/owner recipients are scheduling requests and feedback.
Assigned/rescheduled/cancelled → interviewer (reassignment also informs previous assignee with no candidate payload/link). Scheduling request/feedback → creator + owner, deduplicated. No automatic email, chat, public candidate update or timed reminder. Unread default; retained read messages accessible through All.

Recipient/content rules live in the pure `apps/api/src/interviews/interview-notification.policy.ts`; command causes are defined separately in `interview-cause.ts`. InterviewService supplies loaded context and writes typed intents in its existing mutation transaction. R2 changes ownership, not API/schema/UI or notification behavior:

| Cause / command | Existing recipients / content |
| --- | --- |
| HR scheduled | Assignee; interview name and vacancy title |
| HR rescheduled, same assignee | Assignee once; updated-schedule prompt |
| HR reassigned | Old/new assignee, deduplicated; generic change message without candidate details; existing inbox projection removes revoked links |
| HR cancelled appointment | Assignee; supplied cancellation reason |
| HR ended application | Assignee of each cancelled appointment; application-ended reason |
| Interview failed | Assignee of each remaining cancelled appointment; failed interview name |
| Rescheduling requested / feedback submitted | Creator and owner, deduplicated; request reason / interview name and Pass/Fail title |
| Preselected / Offer / Hired | Staff interview policy still emits no intents. Shared screening command separately inserts the candidate preselection/rejection notice; other effects remain planned |

Deduplication is within an appointment/event, not across all cancelled appointments. Actors are not excluded when they are also a required recipient. A feedback Fail notice and remaining-appointment cancellations retain distinct causes/content. No results from rerunning policy/integration/DOM tests are claimed for this refactor; see [status](../status.md) and deferred Q-R2A/Q-R2U on the [board](../../plan/tasks.md).

`pnpm --filter @recruitment/api inbox:cleanup` deletes only notifications read more than seven days ago, measured from first read. `... inbox:cleanup --watch` runs immediately and daily until stopped. Separate local retention process, not OS cron/API-startup job; no extraction execution or business record changes. Unread survives indefinitely. Production scheduling/abuse limits remain future hardening.

## Verification / limits
`pnpm --filter @recruitment/api interviews:check`: real OTP sessions/PostgreSQL/HTTP, owner pipeline freeze, time/assignment validation, overlap and concurrent failure races, private documents/reassignment, explicit causes, intake closure independence, terminal stages/Offer/Hired, inbox ownership/retention, API restart persistence. Synthetic test clock adjustment only, no runtime clock bypass. Frontend DOM tests cover schedules, frozen results, confirmation/final feedback, cancelled document omission and inbox actions; native UI remains manually tested.

Screening CSV is a separate source-implemented slice with migration/integration pending. No automated ranking, interview attachments, full candidate progress, availability negotiation, retries or reopening. Scores are display values, not standardized evaluations or automatic hiring thresholds. Cancelled steps cannot be replaced; agenda/needs-feedback is query-derived, not cron.
