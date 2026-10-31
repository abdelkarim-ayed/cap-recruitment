# Extraction branch handoff — 2026-10-31

Latest starter decision: shared-CV batched Noul questions for normalised HR-supplied skills, claimed knowledge/use, provisional >=0.8 positive threshold, **one result per skill**, evidence deferred. Not implemented yet; current excerpt-choice/list executor is not the selected starter. See product-checkpoint.md, “Starter skills decisions clarified after this checkpoint”, before continuing code.

Latest docs-only continuation: [README.md](README.md) gives the reading order; [product-checkpoint.md](product-checkpoint.md) records user feedback and open decisions before further MVP/reorganisation work. It separates the predefined-skills AI branch target from wider inbox/preselection/import/panel/publication/runner requests. No merge to main, feature change or paid call in that docs pass. General docs were corrected/flagged for stale editor/interview/progression/auth/worker claims; historical evidence retained, not promoted into current requirements.

**Extraction decision remains open:** the implemented excerpt-choice Jev executor is experimental/unselected, not an approved extraction method or evidence of live quality. Guarded transport was approved separately. Local-model/provider alternatives and final question design remain undecided. Runtime defaults remain disabled; no safeguards or limits changed by this clarification.

## Continuation safety update — read before old commands

The main discussion continued independently and its committed gateway work was subsequently merged into this feature branch. Read this branch's [jev-gateway-handoff.md](jev-gateway-handoff.md) current reconciliation section and load `typesafe-ai` first. **The direct transport was removed: extraction now uses JevGateway and the standalone probe is parse-only.** Earlier commits' direct paid paths must not be run. Main's separate uncommitted documentation remains untouched.

All provider calls must use the gateway. Do not change/reset limits, Redis namespace, endpoint/model or introduce bypass keys/routes. Paid calls and limit tests need explicit scoped consent. Runtime uses `JEV_API_KEY` exclusively through gateway configuration; historical `TYPESAFE_API_KEY` transport was removed. Preserve main's commits and uncommitted changes. Merge/integration details and current checks are in the linked handoff; older sections below are historical where superseded.

Branch: `feat/real-document-extraction`. Worktree: `/tmp/opencode/recruitment-extraction`.
Initial checkpoint committed as `2eb4a85` using the user-supplied author identity via command-scoped Git options; global/repository configuration unchanged. Follow-up work continues on the same branch. No push performed.
The implementation in this discussion did not modify main. Main has since advanced in another discussion; do not interpret this historical checkpoint as current main/runtime status. No presentation files/exports, database migrations, global configuration, credentials or remote publishing changed here. Existing Podman containers were started, not recreated/reset; host networking and volumes preserved. Infrastructure health passed then. No extraction daemon was started here; no existing application was processed. Integration checks create and clean their own tagged records/files.

## Morning quick start

Run from the worktree, not the main checkout. Dependencies and builds already exist there.

```sh
pnpm --filter @recruitment/api build
pnpm --filter @recruitment/api extraction:bench
pnpm --filter @recruitment/api extraction:probe /absolute/path/to/synthetic-cv.pdf
```

With **only the PDF path**, the probe parses without a database, environment-file loading, model call or printing CV text. It prints character count, text hash and elapsed time. Additional skill arguments are now rejected; this command has no live mode. No key, model call, account access or actual extraction quality was verified here.

## Application processing

Live application processing is wired through `JevGateway` but has not been live-verified. Do not enable it or bulk pending draining without explicit scoped live-test consent. Failures of live tasks are terminal, not automatically retried.

Historical wiring to preserve during reconciliation: Nest configuration needs `BETTER_AUTH_SECRET` even for CLI processing; `DOCUMENT_DIRECTORY` allows explicit access to an existing private storage directory without copying files. Completed tasks are not rerun; fixture-bound tasks remain fixtures. Future approved live validation should use a newly chosen synthetic application, not reset prior results or consume manual submissions.

## Implemented

- PDF.js 6.4.299 reader, in a killable child process with no inherited credentials. PDF signature/10 MiB, 20 pages, 60000 characters, 8-second preparation timeout, V8 heap limit 192 MiB. Text layer only; corrupt/encrypted/no-text PDFs fail explicitly. Page boundaries become blank lines; no OCR/rectangles. Child isolation is not an OS security sandbox or a complete native-memory quota.
- Existing in-memory per-application byte/text reuse retained; no persistent parser cache.
- Trusted fixtures can add `reader:"pdf"`. Their exact expected text must match the real PDF reader; fixture result remains explicitly fixture provenance. Legacy fixtures still supply text. Configure `PROCESSING_READER=pdf` for mixed mode.
- Existing document-to-task linking unchanged. A small `taskRegistry` holds document/text requirements and allowed-result validation for `extractSkills`; task type is carried from the immutable snapshot, without a migration. No general dependency framework or semantic field additions.
- Jev adapter uses one Choice question per skill, with `not_found` and source-excerpt IDs. Actual text is sent once as `state.excerpts`; criteria refer to IDs. Selected IDs map back to exact source quotations. No invented evidence, candidate ranking, qualification thresholds or training. Exact-source presence does not prove semantic correctness: manually inspect negations, instructions and ambiguous passages.
- Demo Jev bounds: 12000 source characters, 40 excerpts, 20 skills, 60000-character serialized request, bounded response body and 9-second network timeout. Oversize fails instead of silently truncating. Model-reported usage and resolved model are persisted. 429/5xx/network/timeouts are retryable; schema/unknown excerpt failures are not. Source text/key/provider error bodies are not echoed on failures.
- Processing units now pass AbortSignal to reader/executor. Existing lease fencing/retry limits survive. Reader identity is persisted alongside executor fixture/live provenance; on failure it identifies the attempted reader, not successful parsing.
- `DOCUMENT_DIRECTORY` optional runtime setting; defaults unchanged. New live settings do not repurpose legacy `EXTRACTION_DRIVER`.

## Checks and limits

Verified after follow-up: API build; 46 API tests + 14 domain + 28 web DOM tests (88 total); web build; frozen install; real PostgreSQL `processing:check` and new `extraction:check` (real parsing + fixture interpretation, including persistence/recovery/immutability/corrections/export). The latter passed again after hardening. No browser automation or Windows test. Expected database-error log in the ordinary readiness test is its deliberately unreachable database scenario, not actual infrastructure failure.

Synthetic one-page PDF benchmark, five child-start-plus-parse runs: 567/561/512/574/555 ms. Zero paid requests. This is local parser overhead, not extraction quality/provider latency. The benchmark is repeatable with `extraction:bench`.

Database check commands need a CLI-only `BETTER_AUTH_SECRET`; tests override mail/storage and clean only tagged data:

```sh
pnpm --filter @recruitment/api processing:check
pnpm --filter @recruitment/api extraction:check
```

## Deliberately left for morning / next checkpoint

1. Gateway integration is now implemented; with explicit consent, next inspect actual provider acceptance, resolved model, usage and skill/evidence quality on bounded synthetic inputs. No live verification was performed here. Old price estimates are not spending permission or measured charges; use the current gateway handoff for account/budget context.
2. Exercise a fresh synthetic application UUID end to end with Jev, then manually inspect HR correction/export. Form/review mode labels were corrected in the follow-up below. Static OpenAPI provenance descriptions remain a post-merge documentation alignment item; no broad schema rewrite was made. No automatic fallback to another provider.
3. Cron deliberately deferred: after live verification, wrap the same service in an opt-in bounded poller with non-overlap and enabled-executor checks. No poller was registered in API startup, so a build/restart cannot unexpectedly consume the database backlog or spend money. Existing two-minute fencing and recovery support this later change; no queue service is needed.
4. Cross-task batching, persistent preparation artifacts, evidence-per-skill/page refs, Laya compatibility, DOCX and production upload hardening remain deferred. Jev transport is behind the existing TaskExecutor interface; Laya is not assumed protocol-compatible without a test.

Sources: https://docs.typesafe.ai/api ; https://docs.typesafe.ai/models ; https://docs.typesafe.ai/cookbooks/parallel_questions.md . No retraining or accuracy results claimed.

## Follow-up hardening and UI cleanup (same branch)

All details here are the merge-time documentation checklist; wider product/API docs intentionally not refreshed during this pass.

### Backend / local types
- Added `ProcessingFailure(message,retryable)` for timeout classification. The parser's own 8-second timeout/cancellation is now retryable, not accidentally permanent because its wording differed from the service timeout. Corrupt/unsupported PDFs remain non-retryable.
- Task executors optionally describe their configured provenance. The service preserves it if execution throws or result validation fails, rather than relabelling a live attempt as disabled. No executor invocation still stays disabled/fixture as appropriate; a parser failure is not claimed as a paid model call.
- Jev model/usage metadata survives parsed-response answer validation failures, so a paid but unusable response can still be traced. Provider response bodies/credentials are never copied into failure messages. 401/403 mention key/access, 402 funding, 429 later retry and 5xx temporary availability.
- `SkillExtractionArgs` is inferred from the existing domain processing definition and reused by execution context/task rows. This is a local compile-time deduplication only: no domain wire schema, database migration or persisted shape changed in this follow-up.
- Added service regressions for typed retry policy, preserved failure provenance and one preparation per shared source in an invocation; Jev regressions for request budgets (zero transport calls), >1 MB streamed response cancellation, stalled-body abort, failed-answer usage retention, empty success, evidence suppression, and redacted auth/funding errors.

### PDF verification
- Added accurate multipage synthetic PDF fixtures, including explicit WinAnsi French accents. Tests verify page ordering/blank-page boundaries, 20 versus 21 pages, 60000 versus 60001 characters, cumulative page text limits, blank input, >10 MiB input and cancellation followed by a successful new parse.
- Accent fixture is not arbitrary Unicode coverage. Cancellation test aborts after child launch; it does not deterministically prove PDF.js had started parsing or assert a PID-level cleanup result. Two-column reading order, encrypted PDFs and complex real-world font/layout cases still need manual/sample coverage; no accuracy claim.

### UI changes (not a redesign)
- Form editor no longer says every extraction is mock-only. It states private HR settings and the readable-PDF-text requirement; it does not claim the live provider is enabled or expose keys/operator commands.
- Removed global “Mock extraction” badge from extracted fields. Each task visibly identifies `Fixture result` or live/Jev mode from its stored provenance, including mixed real-reader/fixture-executor results. Actual fixture labels remain visible before expanding details.
- Latest effective skills render as readable comma-separated text instead of a JSON object, with a single empty/unavailable message. Separate HR correction inputs, explicit null, original extraction and export behavior are unchanged.
- Source field, attempts, reader version and model are in the existing collapsed original-result/evidence section rather than competing in the card header. Original JSON/evidence/failures and fixture ID remain accessible; no evidence or original error was removed.
- Added DOM checks for truthful live/fixture labels, readable values and collapsed technical details. Existing role/privacy, saved-correction and table distinctions remain tested. Visual appearance still needs user manual browser review.

### Scope / operational state
- No scheduler added/enabled, production policy claims, global configuration changes, extra services, reseed, manual-record mutations, presentation exports, browser sessions or paid requests.
- Initial checkpoint was committed with the supplied author identity using per-command Git options. This follow-up was committed separately on the same feature branch. No push to any branch was performed; main was clean at that checkpoint (not a claim about the later main discussion).

## Playground discussion transferred for the main session

These are **discussion/test suggestions only**, not implemented product fields, new task types, approved hiring policies or model evaluation results:

- User compared Jev, Luna and local Qwen-based decision models (Laya/Kev). At one point the user reported Jev's $5 minimum top-up and considered local inference on the host, outside this container. Main's later handoff records a funded account; preserve the chronology rather than assuming the earlier local-only idea remains the final decision.
- The proposed manual comparison uses **one generic HR questionnaire chosen before inspecting any CV**, reused unchanged for four realistic synthetic CVs. Avoid tailored answer choices, explicit contrived “I have never used X” statements and artificial parser annotations. Flattened two-column text may interleave left/right lines; plain page numbers may occur alone.
- Chat supplied four synthetic, at-most-two-page-style examples: English software engineer, French industrial maintenance engineer, English commercial-operations specialist, French infrastructure engineer. They are chat-only examples, not saved fixtures or an evaluated dataset in this branch.
- Fixed decision questions cover principal professional domain, dated experience bands (reference date 2026-10-31, no double-counting overlaps), current Germany location versus travel/relocation, explicit work authorisation, highest completed degree, stated English level and explicit people management. Skill questions cover SQL/Python/Excel evidence levels and Docker/Kubernetes/Terraform/Linux/Power BI/SAP/Salesforce/Lean-Six-Sigma presence.
- Evidence levels mean `not_found`, `listed_or_studied`, `applied`, `substantial_responsibility`; they describe what the CV supports, **not independently measured proficiency or candidate ranking**. HR retains interpretation and hiring decisions. Do not infer work authorisation from nationality/name/address.
- A separate suggested JSON Schema for generative structured extraction includes nullable name/email/phone/LinkedIn/address/current country/experience years, lowercase deduplicated `skills` and `infrastructure_skills` arrays, plus skill/evidence-level/verbatim-quote objects. This schema was not added to the application. Arbitrary strings/open-ended skill discovery are not supported merely by a decision endpoint accepting `choice`/`noul`/`score` questions; verify each actual model wrapper's capabilities.
- Same CV/configuration across models; inspect factual extraction, missing values, exact quotations, context truncation and latency. Do not compare raw confidence values as if calibrated identically. No playground test, local-model installation, provider benchmark or live accuracy finding was performed in this discussion.

### Minimal reconciliation reading list

1. Main `docs/jev-gateway-handoff.md` and `typesafe-ai` skill (safety and main progress).
2. This handoff (branch implementation, historical checks, UI details and chat-only ideas).
3. Feature commits `2eb4a85` and `751205d`; inspect only relevant processing/config/test/UI diffs against current main. Gateway integration may change retry/timeout assumptions; inspect before merging, not after paid execution.
4. The user subsequently authorized reconciliation: main's committed gateway was merged onto this feature branch, not the other way around. See the current gateway handoff for that integration. This does not authorize live/limit tests, process restarts or overwriting unrelated work.
