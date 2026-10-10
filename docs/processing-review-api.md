# Mock processing, optional HR review and export

Implemented backend checkpoint; **no live AI, PDF/DOCX parser, frontend or interview management**. Recorded text/results prove data relay and persistence, not extraction quality. Existing legacy ExtractionProvider fixtures remain adapter examples; the workflow uses DocumentTextReader/TaskExecutor execution-context ports.

## Mock execution
ProcessingService executes one application outside submission HTTP. Global Nest providers inject normal reader/executor (disabled); context wrappers select a trusted fixture when fixtureKey is defined. Missing fixture fails without fallback. Candidate-facing requests never accept fixture keys.

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
CLI loads/validates the registry and binds keys to unattempted tasks; identical existing bindings can be reloaded for retries, but attempted tasks cannot be rebound. No active lease may be changed. With no fixture file it uses disabled normal adapters; there is no live fallback. Fixtures are forbidden in production. The explicit command processes at most 20 eligible applications per invocation; there is no polling daemon/BullMQ/startup executor.

Migration 003 stores per-task status/results/provenance/attempts plus one application lease, not ProcessingRun or independently queued WorkItem records. Two-minute leases, row-lock claims and token-fenced saves prevent stale executors from overwriting reclaimed work. Expired processing is reclaimed on the next command. Individual unit timeout 10s; persisted retryable failures wait 30s, max three attempts; completed tasks are not rerun. Missing source/fixture, identity mismatch, unsupported normal parsing and corrupt source fail explicitly. Other tasks continue. DB failure leaves reclaimable state rather than catch-and-ignore. Future live adapters will also need cancellation; timeout currently bounds waiting on local fixture/disabled ports only.

processingState: pending/not_requested/processing/completed/completed_with_errors. No automatic candidate-stage advancement yet: optional review is not preselection or a hiring decision. Optional missing documents can produce failed/null extraction, not a fabricated empty result.

## Optional shared review
Admin/recruiter, including owner, can read/change review on any application. Candidate/interviewer cannot. No assigned-HR registry, exclusive claim, permissions override or selection rules.

`GET /api/applications/:id/review` returns applicationId, immutable answers/formDefinition, processingState, review metadata and configured task columns. Pending tasks appear even before command initialization. Each task includes original result/evidence/failure, provenance, attempts/retryability, separate correction/hasCorrection/actor/time and effectiveValue.

`PATCH /api/applications/:id/review` requires trusted Origin and expectedRevision:
```json
{"expectedRevision":1,"status":"in_review","corrections":[{"taskId":"skills","value":{"skills":["SQL"]}}]}
```
Statuses: pending/in_review/completed. Any admin/recruiter can continue another's work; metadata reviewedBy is the latest review editor, reviewedAt is completion time or null. Revision conflicts return 409, so colleagues do not silently overwrite each other.

Corrections are supported for the current extractSkills task value only. `value:null` is an explicit reviewed null; `remove:true,value:null` removes the override. Original extraction/candidate answers/files stay unchanged. Correcting without an explicit status sets in_review; status completed records completion even with failed/unreviewed task fields. Later extraction writes invalidate completion and increment review revision; manual corrections survive. Status is a coordination marker, not evidence all values are correct. Current correction actor/time is retained, not full audit/version history.

Staff application list/detail include review metadata; candidate responses exclude review/results/corrections/task args.

## Ungated CSV export
`GET /api/vacancies/:id/export`, admin/recruiter only, attachment CSV/private-no-store. **Review completion is never required**: include pending, failed and unreviewed applications. No filtering/ranking/rejection, stage mutation or import.

Columns: candidate/application identity/time, review status/editor/time, answer columns by input name (answers read by stable ID), private business document UUIDs, and each task's original/effective value, status, failure reason, evidence, fixture/disabled provenance, hasCorrection and correction actor/time. Null/unavailable is a blank cell; successful empty skills is JSON `{"skills":[]}`. Status/provenance/correction flags prevent misleading equivalence. No public download links.

CSV uses quoted cells, escaped quotes/newlines and formula guarding. Export is repeatable-snapshot consistent; current caps 1000 applications and 10 MiB, explicit 400 if exceeded. No paginated export or large streaming job yet. Keep exported candidate data private.

## Verification
`pnpm test`: 40 ordinary tests, including strict fixture relay/absence/mismatch, disabled normal dispatch, result distinctions and CSV quoting/formula guards. `processing:check`: real OTP/HTTP/PostgreSQL/private documents, interrupted lease reclamation/stale save rejection, concurrent claims, persisted results/failures/retry cap, cross-HR edits/revision conflict, role checks, corrections, unchanged answers and export of incomplete reviews. No provider account/model call or invented live evaluation.
