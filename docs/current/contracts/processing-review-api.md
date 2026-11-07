# Processing, optional HR review and export — implemented contract

Current skills starter: guarded batched Noul for normalised HR skills, >=0.8 detection; per-task compatible skills-list storage with per-skill `skillResults` projection (original/effective boolean or null). Corrections may add `unavailableSkills` for partial unknowns. Review UI uses per-skill selects; CSV appends URI-encoded skill original/effective columns while keeping prior columns. No quotes in this version, no live validation. See [Jev safety](../jev-safety.md); older fixture contracts below remain supported.

Real PDF reader and guarded Noul skills executor are merged; defaults disabled, no automatic extraction polling/live verification. JevGateway mandatory. Returned live failures terminal; uncertain interrupted-live recovery remains a [known gap](../jev-safety.md#recovery-limitation). The [screening slice](screening-api.md) adds source-level closure and decision CSV; migration/integration pending. Whole-application readiness/manual release remain planned.

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

R1 action hints remain. SI now locks review after completion or screening and adds staff-only `processingClosed` to review/application detail; candidate/interviewer projections omit it and other HR metadata. Admin/recruiter share review while open; no exclusive claim/assignment/owner override. Review-start readiness/manual release is not delivered.

`GET /api/applications/:id/review` returns applicationId, immutable answers/formDefinition, processingState, review metadata and configured task columns. Pending tasks appear even before command initialization. Each task includes original result/evidence/failure, provenance, attempts/retryability, separate correction/hasCorrection/actor/time and effectiveValue.

`PATCH /api/applications/:id/review` requires trusted Origin and expectedRevision:
```json
{"expectedRevision":1,"status":"in_review","corrections":[{"taskId":"skills","value":{"skills":["SQL"]}}]}
```
Statuses: pending/in_review/completed. Any admin/recruiter can continue another's work; metadata reviewedBy is the latest review editor, reviewedAt is completion time or null. Revision conflicts return 409, so colleagues do not silently overwrite each other.

Corrections support extractSkills only. `value:null` is reviewed unknown; `remove:true,value:null` removes an override. Original extraction/answers/files unchanged. Corrections without status set in_review; completion can retain failed/unavailable fields and is not candidate approval. Completion or screening makes further PATCH read-only (409) and fences later extraction writes; original statuses/corrections remain. Actor/time is current metadata, not full history. Claim/start/pre-execution/save/finish/bind also check closure; external cancellation is not a cost guarantee.

Staff application list/detail include review metadata; candidate responses exclude review/results/corrections/task args.

## Ungated CSV export
`GET /api/vacancies/:id/export` remains admin/recruiter diagnostic export-all, attachment/private-no-store, no review gate. Separate [screening export/import](screening-api.md) provides undecided/date/evidence filters and explicit human decisions, not ranking or extraction updates.

Columns: candidate/application identity/time, review status/editor/time, answer columns by input name (answers read by stable ID), private business document UUIDs, and each task's original/effective value, status, failure reason, evidence, fixture/disabled provenance, hasCorrection and correction actor/time. Null/unavailable is a blank cell; successful empty skills is JSON `{"skills":[]}`. Status/provenance/correction flags prevent misleading equivalence. No public download links.

CSV uses quoted cells, escaped quotes/newlines and formula guarding. Export is repeatable-snapshot consistent; current caps 1000 applications and 10 MiB, explicit 400 if exceeded. No paginated export or large streaming job yet. Keep exported candidate data private.

## Verification
Recorded checks are in [status](../status.md). `processing:check`: real legacy-OTP/HTTP/PostgreSQL/private documents, interrupted lease reclamation/stale save rejection, concurrent claims, persisted fixture results/failures/retry cap, cross-HR edits/revision conflict, role checks, corrections, unchanged answers and export of incomplete reviews. `extraction:check` adds real PDF preparation with fixture interpretation. No provider quality or spending-limit validation implied.
