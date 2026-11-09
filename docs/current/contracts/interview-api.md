# Interview pipeline, scheduling and inbox — implemented contract

Migration 006; session cookies and trusted Origin on writes. Backend and integrated React UI, no interview calendar/email integration or event bus. [Current extraction](../jev-safety.md) does not alter these interview rules.
The [screening slice](screening-api.md) adds shared individual/import closure and candidate notices, requiring migration 007 (applied in local demo setup 2026-11-07). B1-P freezes/validates the saved plan at publication; B1-F enables explicit owner Offer from preselected when no interviews are configured. Neither needs a new migration. Broader candidate progress/effects and hide remain planned; screening reversal is not planned.

R1 typed actions/compatibility fields remain. Plan actions reflect publication-time freeze; workflow Offer availability reflects zero/nonzero interview rules below. See [action policies](action-policies.md).

## Model and policy
- Owner edits a draft vacancy-level interview plan (0–10 interviews, name/instructions). Publication freezes it, even empty and before appointments. Appointment arrangements remain editable under separate rules; closing intake does not cancel interviews or reopen plan editing. No publish-time assignee requirement.
- Each application/step has at most one instance: one existing staff interviewer, start/duration/timezone, link or location, status, final notes/optional integer score 0–10, Pass/Fail. Cancelled/completed records remain; no deletes, retries, reopening, panels or historical revisions.
- All admin/recruiter staff can schedule/reschedule/cancel and preselect. Only assigned interviewer submits feedback or requests rescheduling; staff acting as interviewers follow the same assignment rule. Owner alone records Offer/Hired. Admin has no owner override.
- Preselect can proceed regardless of extraction/review. Scheduling requires Preselected/Interview. Pass does not automatically advance/accept. Explicit final Fail sets Not selected and cancels **all other unfinished instances**, including already-started scheduled instances; no further feedback or scheduling. Submitted feedback is final. No reopening: use a new posting/application.
- Manual Not selected is shared HR through preselected, owner afterwards. Initial screening uses shared closure, optional internal text and one candidate notice; later rejection still requires reason/cancels unfinished interviews. Owner Offer requires preselected with zero configured interviews, or interview stage with all configured interviews passed. Hired separately requires Offer; no automatic stage changes from extraction/preselection/Pass.
- Interviewer sees only their assigned interview records and application answers/documents for scheduled/completed assignments. Cancelled-only assignments grant no candidate document access. Reassignment removes prior interviewer access. Generic application/review/list endpoints remain interviewer-denied. No other interviewer notes exposed. Owner name/email visible for offline contact.
- Own candidate applications show [coarse public progression/outcomes](application-api.md#candidate-public-status); only screening notices communicate preselection/rejection through Inbox. Notes/schedules/assessments remain unpublished; no additional candidate notification effects or full timeline.

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
| GET `interviews` | HR all, interviewer assigned only. Required ISO from/to (max 93 days), view=upcoming\|past\|cancelled; optional awaitingFeedback=true\|false (true requires Past). limit<=100/offset<=100000. Legacy agenda/feedback and default agenda retained for existing callers. `{items,total,limit,offset}`. |
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

### Agenda views

Within the requested half-open from/to range, Upcoming requires scheduled + `starts_at > now()`; Past requires non-cancelled + `starts_at <= now()`. Past's optional awaitingFeedback=true further requires scheduled/unassessed; true on other views returns 400. Cancelled includes only cancelled appointments, regardless of time. Thus even the current week's Upcoming excludes already-started appointments; ongoing appointments enter Past at start, not end. Past sorts newest first, Upcoming/Cancelled earliest first, each with stable ID ties. All predicates and role/assignment scope apply before count/pagination in one SQL statement with one time/visibility snapshot. No status mutation, assessment inference or authorization change.

Legacy API `agenda` (all non-cancelled) and `feedback` (scheduled with start arrived) retain their old meanings and ascending order; omitted view still defaults to agenda for existing callers. The frontend uses only the new views, with [Monday-first week controls and scoped context](agenda-navigation.md). Latest evidence is API/web builds and static checks, not DB/HTTP/manual verification or an updated test-suite pass.

## Interview-plan saves

R3b no-op semantics remain for editable drafts. Separate owner, expected interview_revision and editability checks precede comparison under the vacancy lock. B1-P editability now requires draft status and no appointments; even identical published/closed requests return 409. No admin override. Publication validates the same saved content with both vacancy/interview counters under the same lock; see [publication contract](vacancy-api.md#publishclose).

Compare the ordered saved names/instructions using the same schema normalization as the request: trim strings, default omitted instructions to empty, ignore object-key order and preserve interview order. Generated IDs/positions are not editable comparison fields. A current-identical plan, including an empty list, returns the existing projection with no DELETE/INSERT/UPDATE, preserving IDs, positions and revision. A real change retains the existing replace-all behavior/new IDs and increments `interview_revision` once; other counters, notifications and UI are unchanged. Regression is deferred as Q-R3B; see [status](../status.md).

### Plan editor navigation

The plan editor registers unsaved steps with the shared [navigation guard](editor-navigation.md) and shows `Unsaved changes`. Leaving asks Stay or Discard and leave. Pagination/Refresh preserve local steps instead of silently resetting them; a successful PUT response becomes the clean baseline, while stale/conflict responses retain local edits without retry. Backend owner/revision/freeze and no-op rules above remain authoritative.

The route identifies the vacancy and renders editing controls only for an allowed draft owner; other HR and published/closed vacancies read plan names/instructions as text. Ordinary drafts omit candidate results, while published/closed vacancies show the results matrix and Applications navigation. Candidate names open submitted application information; View recruitment is a separate destination. Owner contact is secondary. Failed/unknown plan saves require explicit refresh; refreshed saved steps can be compared with retained local edits or explicitly discarded. If the plan becomes read-only, retained local steps remain inspectable, not writable. No plan/appointment authority or wire contract change.

## Owner Offer and separate Hired

B1-F uses the existing stage endpoint/payload/revision. Authenticated HR eligibility, fresh vacancy ownership and application revision are separate checks under vacancy-share/application-update locks. Other HR/admin cannot override the owner; candidates/interviewers cannot finalize. Closing intake does not prevent ongoing finalization.

- **Zero configured interviews:** only `preselected → offer`, explicitly confirmed by the owner. Received/review_ready/interview/terminal states do not qualify merely because the count is zero. No fabricated appointment or automatic offer after screening. Processing/review is not a new gate.
- **Nonempty plan:** `interview → offer` only when the query counts every configured interview as completed with Pass. Missing/scheduled/cancelled/failed interviews do not count. Preselected cannot bypass a nonempty plan, even with inconsistent imported counts.
- **Hired:** only `offer → hired`, a separate explicit owner confirmation. It never combines with preselection/Offer. Stale/duplicate confirmations return 409; a successful transition increments flow revision once. No reopening or automatic retry.

Workflow `actions.offer` shares these stage/count prerequisites with mutation enforcement. UI shows owner Offer for a preselected empty-plan application, explains no automatic offer, and hides the irrelevant empty scheduling section. Nonempty/incomplete plans keep Offer disabled. Confirmation distinguishes Offer from the later Hired action. This checkpoint does not add candidate Offer/Hired messages, owner availability alerts, email or new schema fields; those remain notification work, not implicit effects of enabling this path.

Verification: 7 backend fake-transaction/policy-matrix cases, 8 current pure action-policy cases and 4 new DOM cases. Real SQL/count/join/lock/auth/HTTP behavior and manual UX are pending Q-B1F; updated tagged smoke source was not executed. No migration/data/provider/process/browser operations.

## Scheduling and causal effects

### Focused workflow dialogs — UX-DENSITY-d

Source-implemented in the UI worktree, 2026-11-09; native/manual review pending. The existing staff application-workflow route inspects candidate/vacancy identity, current stage, compact owner metadata and existing interview records. The vacancy title and interview names are native entity links; duplicate vacancy/results navigation and owner-policy lectures are removed.

- Undecided applications show one Screening decision entry, not an empty future-interview console. Its native dialog starts with neither outcome selected, offers Preselect / Not selected according to server availability, and shows optional internal screening-rejection text only for Not selected. Visible consequences explain finality, extraction/review locks and the existing generic candidate notice. No POST occurs on opening, selecting, typing, cancelling or Escape; explicit confirmation sends the existing stage payload with **workflow** revision, not review revision.
- After preselection, actual appointments/results remain readable and missing configured interviews are marked Not scheduled, not fabricated appointments. Schedule interview opens the existing local-date/time/zone form in a native dialog only when scheduling is currently allowed and an unbooked configured interview exists. Directory lookup happens on demand. All existing records remain inspectable even if an inconsistent snapshot still has an undecided stage. This UI does not reinterpret cancelled/completed instances as available steps.
- Later Not selected opens its own confirmation and requires the existing nonblank internal reason. The same stage command owns authority and remaining-interview cancellation; the UI does not issue separate cancellation calls. Offer/Hired remain distinct explicit owner dialogs, only in relevant stages and only when server action visibility permits. Configured incomplete plans retain an actionable disabled Offer prerequisite; no automatic Offer, fake booking, owner override or new notification effect is added.
- Successful stage writes consume the returned workflow projection. A confirmed booking reloads workflow/application state before more writes. Failures/conflicts/uncertain responses retain the local proposal/arrangements, block further writes and require explicit Refresh current state (or page Refresh after Cancel). Refresh never resubmits; proposals require a separate confirmation with the freshly loaded revision. If current availability no longer permits the proposal, confirmation stays disabled and Cancel returns to inspection. Factual current state is not described as proof that the interrupted write committed.
- Local selected outcomes, reason text and edited scheduling fields register with the shared [navigation guard](editor-navigation.md). Stay retains them; external/in-app leaving asks before discard, pending writes block leave, and reload/close uses the existing browser warning. Explicit dialog Cancel/Escape while idle discards the local proposal without a write or an extra leave prompt. No draft is persisted to browser storage. A per-mounted-view write fence also prevents duplicate submissions while a request is pending.

The native dialog primitive is shared with vacancy publish/close: labelled consequences, cancel-first focus, background inertness/focus containment supplied by the browser, pending Cancel/Escape protection and trigger/header focus restoration. It temporarily yields its top layer to the shared leave warning and resumes on Stay without cancelling a request. JSDOM tests stub only native dialog lifecycle; actual keyboard/inertness/history/layout behavior remains manual.

The [appointment/review dialog baseline](../guides/frontend-design.md#review-and-appointment-dialogs) preserves time-gated assigned feedback, explicit final Pass/Fail confirmation, scoped attachments, rescheduling/cancellation authority, separate appointment revision and immutable results. Local drafts/pending requests use the shared leave guard; failed/uncertain writes require explicit refresh. Backend/session/Origin checks and notification effects are unchanged. Broader candidate appointment/timeline projection remains planned; own application public status is separately implemented. Native/manual verification remains pending.

### Existing scheduling contract

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
