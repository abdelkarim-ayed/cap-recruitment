# Processing, optional HR review and export — implemented contract

Current skills starter: guarded batched Noul for normalised HR skills, >=0.8 detection; per-task compatible skills-list storage with per-skill `skillResults` projection (original/effective boolean or null). Corrections may add `unavailableSkills` for partial unknowns. Review UI uses per-skill selects; CSV appends URI-encoded skill original/effective columns while keeping prior columns. No quotes in this version, no live validation. See [Jev safety](../jev-safety.md); older fixture contracts below remain supported.

Real PDF reader and guarded Noul skills executor are merged; defaults disabled, no automatic extraction polling/live verification. JevGateway mandatory. Returned live failures terminal; uncertain interrupted-live recovery remains a [known gap](../jev-safety.md#recovery-limitation). The [screening slice](screening-api.md) adds source-level closure and decision CSV. B1-R/B1-J add whole-application readiness/manual release with UI/list/filter; migrations 007/008 remain unapplied and integration/manual verification remains pending. Current checkpoint uses fixtures/disabled ports only; no live-provider smoke testing.

HR corrections never rewrite original task/aggregate failure. Staff lists show `review.hasCorrections`; details separate saved corrections from original evidence. Explicit null is a correction, not successful extraction. CSV preserves original/effective/status; decision import never changes these fields.

No-task policy (approved after UI feedback): applications whose frozen processing definition has no tasks start with review status completed automatically and `review.required=false`. This means not applicable, **not candidate approval or a human review**; no reviewer/completion timestamp is invented. Migration 005 completes existing no-task records without changing answers/files/stage. Review PATCH returns 400 for no-task applications. Staff detail/list hide irrelevant review controls; mixed tables show a dash. Staff list adds `reviewRequired` for the entire vacancy/account scope (before filters/pagination); review-status filters match extraction-bearing records only. Export stays available/all records. UI operator/demo instructions moved to demo-guide.md; actual mock output remains labelled.

Manual-feedback refinements: review adds `review.updatedAt` (last HR save), `review.editor:{id,name,email}|null`, and task `corrector:{id,name,email}|null`. Migration 004 adds save time independently of completion time. Latest effectiveValue is prominent immediately after save/refresh, original extraction/evidence separately expandable. Revision is concurrency protection, not stored history; no revision browser/arrows. Candidate answers/files unchanged. List filters do not limit CSV export.

Backend/HR frontend implemented. Recorded fixture text/results prove relay/persistence, not model quality. Text-native PDF parsing is real; DOCX/OCR absent. Interview management has its own [contract](interview-api.md). Legacy ExtractionProvider fixtures remain examples; application workflow uses DocumentTextReader/TaskExecutor context ports. Manual fixture UI/seeds/command: [demo guide](../guides/demo-guide.md).

## Mock execution
ProcessingService executes one application outside submission HTTP. Global Nest providers inject configured reader/executor (disabled by default); context wrappers select a trusted fixture when fixtureKey is defined. Missing fixture fails without fallback. Candidate-facing requests never accept fixture keys.

ExecutionContext carries applicationId, documentId, sourceHash, taskId, configured args and optional fixtureKey. FixtureRegistry verifies these identities/args, actual document SHA-256 and text relay; records text/task calls. Original document bytes/text are reused locally within one application. Each source/task fixture is validated even when reusing text.

Trusted fixture JSON is an array of records:
```json
[
  {
    "fixtureKey":"app-one-cv-skills",
    "applicationId":"11111111-1111-4111-8111-111111111111",
    "documentId":"22222222-2222-4222-8222-222222222222",
    "sourceHash":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "taskId":"skills",
    "args":{"skills":["SQL"],"evidence":true},
    "text":"FIXTURE ONLY: recorded document text",
    "result":{"status":"completed","value":{"skills":["SQL"]},"evidence":["FIXTURE ONLY: recorded evidence"]}
  }
]
```
Illustrative IDs/hash must be replaced with the actual submitted application/document/bytes; this example does not match a real file. Failed records use `{status:"failed",value:null,reason:"Recorded fixture failure",retryable:false}`. Duplicate fixture keys/invalid outputs are rejected. Do not use real candidate data in tracked fixtures; local fixture files belong in ignored private/disposable paths.

```sh
pnpm build
pnpm --filter @recruitment/api db:migrate
pnpm --filter @recruitment/api processing:run pending /path/to/trusted-fixtures.json
pnpm --filter @recruitment/api processing:run APPLICATION_UUID /path/to/trusted-fixtures.json
pnpm --filter @recruitment/api processing:check
```
CLI loads/validates the registry and binds keys to unattempted tasks; identical existing bindings can be reloaded for eligible retries, but attempted tasks cannot be rebound. No active lease may be changed. Default adapters are disabled; with no fixture file and no executor the CLI refuses to claim work. Explicit opt-in gateway-backed execution needs scoped consent; no automatic live fallback. Fixtures are forbidden in production. At most 20 eligible applications per invocation; no extraction polling daemon/BullMQ/startup executor. Read the gateway handoff before any live configuration; bulk live draining is not authorized by these mock commands.

Migration 003 stores per-task status/results/provenance/attempts plus one application lease, not ProcessingRun or independently queued WorkItem records. Two-minute leases, row-lock claims and token-fenced saves prevent stale executors from overwriting reclaimed work. Expired processing is reclaimed on the next command. Individual unit timeout 10s with AbortSignal to reader/executor; persisted retryable failures wait 30s, max three attempts; completed tasks are not rerun. Missing source/fixture, identity mismatch, unsupported parsing and corrupt source fail explicitly. Other tasks continue. DB failure leaves reclaimable state. Fencing protects persistence, not exactly-once external execution; uncertain live recovery requires the correction documented in the safety page before a continuous runner.

processingState: pending/not_requested/processing/completed/completed_with_errors. No automatic candidate-stage advancement yet: optional review is not preselection or a hiring decision. Optional missing documents can produce failed/null extraction, not a fabricated empty result.

## Optional shared review

Admin/recruiter share review while ready/open; no exclusive claim/assignment/owner override. Completion or screening locks review. Staff-only `processingClosed` in review/application detail includes manual release as well as completion/screening; candidate/interviewer projections omit it and other HR metadata.

Normal readiness is derived across every frozen task definition, including pending placeholders for uninitialized rows. All tasks must be successful or failed with structured `failureCategory=ordinary_terminal` and `retryable=false`; the processing invocation must no longer be active (`processingState=processing` keeps review waiting, even with final results saved). Retry exhaustion is not ordinary settlement. `operational`, `uncertain`, `unclassified` and legacy null failure categories remain blocked until explicitly released. No message-text classification or historical failure rewrite.

`readiness` is staff-only `{state,reason}`: `not_required`, `waiting`, `blocked`, `ready`, `released`, `locked`. Completion/screening takes precedence over release; no-task review stays not applicable. Editing/status changes/completion require `ready` or `released`. Viewing original answers/files/results remains allowed before readiness. Screening/export remain independent of review readiness.

### Explicit manual release

`POST /api/applications/:id/review/release` requires shared HR, trusted Origin/session and `{expectedRevision}` (positive review revision; no extra fields). Returns 200 with the refreshed review view. Any unfinished processing can be released, including pending, active, operationally blocked or uncertain work; no stall timer. No-task, naturally ready and completed/screened records deny. A current-revision already-released request returns unchanged; stale duplicates return 409. Refresh after an unknown response; no automatic retry.

Under the application lock, release stores `processing_released_at/by`, increments review revision once and clears token/lease/next retry. It preserves review status/editor/save/completion attribution, original task statuses/results/provenance/attempts, corrections, answers and recruitment stage. Release does not complete review, decide screening or emit notifications. Response `release` is null or `{at,actor}` (actor may be null after deletion).

Bind/claim/start/pre-execution/save/finish reject released work, including expired-lease recovery. Claim/start/save/finish changes affecting evidence/readiness increment review revision under the application lock; heartbeats and skipped starts do not. Save-first makes an older release conflict; release-first fences late saves/finish. Screening-first denies release; release-first still permits screening, which freezes unfinished review without completing it. Existing external requests may continue/cost money; there is no billing cancellation guarantee.

Failure categories are separate from retryability: absent submitted source and supported document parsing failures are ordinary terminal; timeouts/storage/disabled execution and fixture setup problems are operational; unexpected failures default unclassified. Trusted deliberate terminal fixture failures default ordinary terminal; fixture provenance remains visible. Recovered interrupted tasks are marked uncertain, but existing unsafe live-retry recovery is **not fixed** by this classification; no continuous/live runner is authorized. Gateway/defaults/limits are unchanged.

The HR UI shows readiness separately from original processing and human review status. Explicit Release to review → confirmation → POST; cancel has no effect. Confirmation explains permanent closure, unavailable values and possible already-admitted cost. Release is absent for naturally ready, completed/screened and no-task records. Unknown/conflicting release responses close confirmation, disable mutations and require explicit refresh/reconfirmation, never automatic retry. Do not claim availability in running services before migrations/deployment and integration verification.

Application lists and screening export accept staff-only `readiness=not_required|waiting|blocked|ready|released|locked`. One shared SQL expression mirrors detail-policy precedence across frozen definitions/missing task rows; application filtering/count/pagination occurs in one statement. Candidate requests with any readiness filter return 403; candidate/interviewer projections omit readiness/release/processingClosed. Screening export remains undecided-only and adds a factual `review_readiness` column; diagnostic export columns are unchanged. `ready`/`released` exclude completed/screening-frozen review. No counters, polling or screening eligibility gate.

Correction drafts are local to the mounted application/role view, not stored in session/local storage. A failed save preserves input and disables further mutations until explicit refresh. Refresh displays latest saved values, retaining separate drafts for explicit Reapply/Discard; no automatic merge/save. Saving one task clears only its draft, preserving siblings. Review completion is disabled while local drafts remain. Locked review cannot reapply/save a retained draft. Confirmed navigation/role changes unmount drafts. Technical revision numbers are no longer shown in normal review UI.

`GET /api/applications/:id/review` returns applicationId, immutable answers/formDefinition, processingState, readiness/release, review metadata and configured task columns. Pending tasks appear even before command initialization. Each task includes original result/evidence/failure and nullable failureCategory, provenance, attempts/retryability, separate correction/hasCorrection/actor/time and effectiveValue. Actions include edit/release availability; hints never authorize stale mutations.

`PATCH /api/applications/:id/review` requires trusted Origin and expectedRevision:
```json
{"expectedRevision":1,"status":"in_review","corrections":[{"taskId":"skills","value":{"skills":["SQL"]}}]}
```
Statuses: pending/in_review/completed. Any admin/recruiter can continue another's work; metadata reviewedBy is the latest review editor, reviewedAt is completion time or null. Revision conflicts return 409, so colleagues do not silently overwrite each other.

Corrections support extractSkills only. `value:null` is reviewed unknown; `remove:true,value:null` removes an override. Original extraction/answers/files unchanged. Actual correction changes without explicit status set in_review; unchanged corrections/absent removal leave status unchanged. Completion can retain failed/unavailable fields and is not candidate approval. Completion or screening makes further PATCH read-only (409) and fences later extraction writes; original statuses/corrections remain. Actor/time is current metadata, not full history. Claim/start/pre-execution/save/finish/bind also check closure; external cancellation is not a cost guarantee.

### Review no-op saves

R3c source checks authority/readiness/completion/screening locks and expected review revision under the existing application lock **before** semantic equality. Stale-identical requests return 409; locked/no-task requests still deny, including same-status completion. Validate the entire correction set before returning unchanged or writing.

A current-identical request returns the full current review projection without any INSERT/UPDATE/DELETE: no revision, application editor/save/completion time, correction actor/time, task initialization, lease or original-data changes. An omitted correction preserves its override. Explicit null creates an unknown override if absent; repeated null is unchanged. Removing an existing override is a real change even if its effective value matches the original; removing an already-absent override is unchanged.

Skills compare using trimmed/lower-case/deduplicated unordered membership for detected/unavailable lists, matching existing skill semantics. Missing `unavailableSkills` equals an empty list; null remains distinct from an empty successful skills value. Comparison never rewrites stored spelling/order or original results. Real changes retain existing validation/storage; no broadened correction inputs or generic revision/history framework.

Explicit status changes remain real independently of correction equality. Mixed saves write only genuinely changed overrides, preserving attribution on unchanged siblings, and increment the application review revision once. Completion is still a real locking transition and clears the processing lease. Source model tests are not PostgreSQL/HTTP/race evidence; Q-R3C and prior gates remain pending.

### Review navigation guard

R3d-a source guards review correction drafts at the existing hash-router boundary. Shared mechanics for all guarded editors are in [unsaved-change navigation guards](editor-navigation.md). The user selected **Stay** or **Discard and leave**, not Save all and leave. Same-document links, client `go()` redirects, sign-out and managed Back/Forward attempts keep the current review mounted while confirmation is pending. Stay/Escape retains inputs; explicit discard permits navigation without any review save/cancellation/retry. Sign-out sends its existing API request only after consent; if sign-out fails, the original draft remains. This is a UX guard, not authorization or a processing hold.

In-flight review PATCH/release requests block in-app discard/leave until settled, then require an explicit choice; they are not cancelled. A failed/uncertain save still requires the existing explicit refresh/reapply flow. The last successful save or explicit local discard clears the warning; unsaved siblings and preserved inactive conflict drafts keep it active. Editing a control back to its exact saved UI value removes that local draft. This UI comparison is conservative and does not replace backend R3c semantic equality.

Reload/tab-close/cross-document exit uses the browser's standard `beforeunload` warning while drafts or a review request remain. Browsers control display/user-activation requirements and may still close: this does not establish cancellation or persistence. Managed history entries store only a numeric position, no identity/candidate/review content. Unknown/pre-existing/unmanaged fragment entries use conservative current-view/URL restoration and a fresh managed destination after consent; exact pre-existing history order is not guaranteed. Native history fidelity, reload/close prompts, keyboard/focus and logout isolation remain Q-R3DA/manual QA, not proven by DOM tests.

Only review registers review-specific draft semantics here. R3d-b source-implements the same shared boundary for the vacancy draft form and interview-plan steps; see [unsaved-change navigation guards](editor-navigation.md). No backend/API/schema/permission changes or persistent draft storage were added. Native/manual behavior for review, vacancy and plan editors remains Q-R3DA/Q-R3DB.

Staff application list/detail include review metadata; candidate responses exclude review/results/corrections/task args.

## Ungated CSV export
`GET /api/vacancies/:id/export` remains admin/recruiter diagnostic export-all, attachment/private-no-store, no review gate. Separate [screening export/import](screening-api.md) provides undecided/date/evidence filters and explicit human decisions, not ranking or extraction updates.

Columns: candidate/application identity/time, review status/editor/time, answer columns by input name (answers read by stable ID), private business document UUIDs, and each task's original/effective value, status, failure reason, evidence, fixture/disabled provenance, hasCorrection and correction actor/time. Null/unavailable is a blank cell; successful empty skills is JSON `{"skills":[]}`. Status/provenance/correction flags prevent misleading equivalence. No public download links.

CSV uses quoted cells, escaped quotes/newlines and formula guarding. Export is repeatable-snapshot consistent; current caps 1000 applications and 10 MiB, explicit 400 if exceeded. No paginated export or large streaming job yet. Keep exported candidate data private.

## Verification
Recorded checks are in [status](../status.md). `processing:check`: real legacy-OTP/HTTP/PostgreSQL/private documents, interrupted lease reclamation/stale save rejection, concurrent claims, persisted fixture results/failures/retry cap, cross-HR edits/revision conflict, role checks, corrections, unchanged answers and export of incomplete reviews. `extraction:check` adds real PDF preparation with fixture interpretation. No provider quality or spending-limit validation implied.
