# Screening export/import and shared decisions

Source checkpoint: 2026-11-07. Implemented in code; **migration 007 has not been applied and PostgreSQL/HTTP/manual UX validation has not been run**. Do not treat the running application as upgraded. [OpenAPI extension](screening-openapi.json); [verification](../status.md) distinguishes isolated tests from integration evidence.

## Eligibility and commitment

Shared admin/recruiter screening, one vacancy per wizard. Only undecided applications (`received` / compatible `review_ready`) can be screened; processing/review completion is never required. Candidate/interviewer requests are denied. Session/Origin guards and fresh database scope/state/revision checks remain authoritative.

**First committed decision wins**, not first export/upload/opened wizard. Individual stage changes and CSV apply use `interviews/screening-command.ts` under application locks. Either screening outcome records actor/time/cause, increments `flow_revision` once, clears processing token/lease/retry scheduling and makes extraction/review read-only. Original results, errors, processing aggregate status, corrections and unfinished review status remain unchanged. Preselection may later progress or be rejected through ordinary recruitment; import cannot reverse screening or perform Offer/Hired.

Review PATCH also rejects writes after review completion; completing review invalidates the processing lease. Processing claim/start/pre-execution-check/save/finish and fixture binding reject closed applications. External calls admitted before a concurrent closure may still run/cost money; late writes are fenced. No live recovery/guard/default/runner changes; the [uncertain-interruption gap](../jev-safety.md#recovery-limitation) remains.

Whole-application review readiness/manual release have a separate [B1-R/B1-J contract](processing-review-api.md#optional-shared-review), requiring unapplied migration 008. Source includes explicit release UI and factual list/filter presentation; these do not gate screening. Staff application/review detail and staff lists include `processingClosed` for release/completion/screening; candidate/interviewer projections do not gain this HR field or screening reasons. Retained task/aggregate states are original execution states, not proof a runner is still eligible.

## Export and input

- Existing `GET /api/vacancies/:id/export` stays diagnostic export-all with unchanged columns.
- New `GET /api/vacancies/:id/screening-export` always includes only undecided applications, with all existing evidence columns plus `processing_state`, blank `decision` and blank `reason`. Null/unknown values and original/effective/provenance distinctions remain truthful. No export reservation, history marker or automatic decision.
- Screening export and staff application lists accept optional `processing`, `review`, `from=YYYY-MM-DD`, `before=YYYY-MM-DD`; dates are inclusive-from/exclusive-before UTC midnight. `undecided=true|false` controls staff lists; screening export always forces undecided. Review filters select extraction-bearing records. Candidate requests cannot use these new screening/date filters. HR list defaults to undecided; uncheck to see later stages.
- B1-J adds optional HR-only `readiness=not_required|waiting|blocked|ready|released|locked`, using the same SQL expression for list/export and a `review_readiness` screening CSV column. This is a factual optional filter, not a reviewed-only selection gate; no filter is required to decide screening. Diagnostic CSV columns stay unchanged.
- Export is a repeatable snapshot, capped at 1,000 applications / 10 MiB. Formula-safe quoted CSV, private/no-store, no document download URLs. Coordinate batches by vacancy or explicit date/ID lists in approved tools; exported files do not claim work.

Import one UTF-8 comma CSV (optional BOM, LF/CRLF, quoted multiline/escaped quotes). Required unique headers: `application_id`, `candidate_email`, `decision`; optional `reason`. **All other columns, including name/evidence/corrections, are ignored.** ID selects the application inside the vacancy; email must match its frozen submission email after trim/lowercase. Email is an assertion, not an alternate lookup or update. Decision is exactly `preselected` or `rejected` after trimming. Names are not assertions in this version.

```csv
application_id,candidate_email,decision,reason
11111111-1111-4111-8111-111111111111,taylor@example.test,preselected,
22222222-2222-4222-8222-222222222222,riley@example.test,rejected,Optional internal explanation
```

Limits: 1,000 nonblank data records, 10 MiB file, 256 KiB decoded UTF-8 per cell and bounded columns. Upload uses multipart field `file`; invalid UTF-8/quoting/header/missing data is a file error. Bad row widths/IDs/emails/decisions, oversized reason (2,000 characters), duplicate IDs, missing/foreign application or email mismatch are excluded row errors. Every occurrence of a duplicate ID is invalid. Logical CSV record numbering is not physical line numbering for multiline cells. No expressions execute, no silent truncation and no identity/answer/extraction updates. Fix invalid input outside the wizard and re-upload; no row repair controls.

Written screening-rejection reasons are optional and may come from CSV. They are stored only for rejections and never copied into candidate notices. Later recruitment rejection retains its existing required reason/cancellation rules.

## Preview, confirmation and conflict UX

`POST /api/vacancies/:id/screening/preview`: authenticated multipart upload → `{rows:[{key,applicationId,email,decision,reason,state,issue,candidate,revision}]}`. State is `valid`, `invalid`, or `decided`. Candidate identity/revision is returned only after a vacancy-scoped record and matching email are resolved. Missing/foreign records share an unavailable result. Preview writes no application or notification data.

Valid rows default included; invalid rows are crossed out in red, already-decided rows separately grey/double-crossed, both disabled with textual explanations. HR can include/exclude valid rows and switch proposed outcomes individually or for all included rows. Missing/excluded rows are unchanged. Cancellation has no business effects.

“Review confirmation” fetches eligibility again while preserving proposals/exclusions. New committed decisions are excluded and trigger a warning rather than opening confirmation. Review/extraction updates alone do **not** block screening; only current scope/identity/screening eligibility/workflow revision is checked. No export-time freshness guarantee, reservations, assignment, SSE or Redis coordination.

`POST /api/vacancies/:id/screening/apply` accepts only:

```json
{"rows":[{"applicationId":"11111111-1111-4111-8111-111111111111","email":"taylor@example.test","decision":"preselected","expectedRevision":1}]}
```

Optional `reason` per row. JSON confirmation has a route-specific 10-MiB bound; other JSON routes retain 256 KiB. Empty/duplicate/invalid included sets fail. Server locks vacancy `FOR SHARE`, then applications in deterministic ID order `FOR UPDATE`, validates the entire set before writes, commits each through the shared screening operation, then commits once. Successful result: `{applied,preselected,rejected}`. There is no loop over independently committed HTTP stage calls.

Any stale/decided/invalid included row returns 409 with `{message,conflicts:[{applicationId,state,issue}]}`; **zero changes from this confirmation**. Previously committed decisions by other users stay. Wizard marks conflicts, preserves unaffected choices and requires explicit confirmation of the smaller remaining set. Notification persistence failure rolls back the entire transaction. No automatic partial success, undo or effect replay.

401/403 preserve session/role/Origin behavior; unavailable vacancy 404; input 400; upload/body limits 413. After a network/server failure the outcome may be unknown: wizard disables further confirmation until refresh, does not automatically retry, and never invents a causal receipt from current outcomes. Repeat-import decided records are excluded/conflicts, including repeated identical outcomes.

## Candidate effect and migration

Migration `007_screening_decisions` adds nullable `screening_decision`, `screening_reason`, `screening_by`, `screening_at` to applications and a relational `screening_notifications` table (unique application FK, recipient FK). No backfill invents historical decisions/notifications. No export ledger, votes, claims or assignment tables.

The same screening transaction inserts one generic candidate preselection/rejection notice naming the vacancy, never internal reason/assessments. Candidate Inbox now lists/marks read only own screening notices and links to own application; generic candidate application stage remains masked as before. Staff interview notifications/read-revocation policy remains; candidate roles cannot read old staff interview notifications. Screening rows are retained (no hide/expiry worker); existing seven-day cleanup still concerns old interview notifications only. No process change, email, backfill, submission/appointment/Pass/Offer/Hired notices, owner-finalization alert or full progress timeline is implemented here.

## Verification and operating boundary

New isolated checks: 5 domain CSV cases, 9 API command/repository **fake-transaction-model** cases, 3 DOM wizard cases. These are not PostgreSQL race/rollback, real HTTP multipart/session/privacy or deployment evidence. Prior deferred R1/R2/R3 checks remain outstanding. Apply the migration and perform tagged-fixture integration only after separately agreeing that data operation. No startup, migration, seeding, provider call, browser automation or service restart was performed for this checkpoint.
