# Extraction branch handoff — 2026-10-31

Branch: `feat/real-document-extraction`. Worktree: `/tmp/opencode/recruitment-extraction`.
Initial checkpoint committed as `2eb4a85` using the user-supplied author identity via command-scoped Git options; global/repository configuration unchanged. Follow-up work continues on the same branch. No push performed.
Main remains unchanged. No presentation files/exports, database migrations, global configuration, credentials or remote publishing changed. Existing Podman containers were started, not recreated/reset; host networking and volumes preserved. Infrastructure health passed. No extraction daemon was started; no existing application was processed. Integration checks create and clean their own tagged records/files.

## Morning quick start

Run from the worktree, not the main checkout. Dependencies and builds already exist there.

```sh
pnpm --filter @recruitment/api build
pnpm --filter @recruitment/api extraction:bench
pnpm --filter @recruitment/api extraction:probe /absolute/path/to/synthetic-cv.pdf
```

The probe parses without a database, environment-file loading, model call or printing CV text. It prints character count, text hash and elapsed time. For a **paid** standalone Jev call, supply a key privately in the shell environment (do not commit or paste it into chat), then:

```sh
EXTRACTION_LIVE_CONSENT=synthetic pnpm --filter @recruitment/api extraction:probe /absolute/path/to/synthetic-cv.pdf SQL TypeScript
```

Required environment: `TYPESAFE_API_KEY`. Optional: `TYPESAFE_MODEL` (default pinned `jev-1.14.0`). This probe prints extracted skills/evidence and token usage, so use synthetic data and keep output private. One request contains all configured skills. No key, model call, account access or actual extraction quality has been verified.

## Application processing

For a fresh synthetic submission with pending extraction, use the branch CLI with an **explicit application UUID**, without a fixture file:

```sh
PROCESSING_READER=pdf PROCESSING_EXECUTOR=jev EXTRACTION_LIVE_CONSENT=synthetic DOCUMENT_DIRECTORY=/home/ubuntu/code/.local/documents pnpm --filter @recruitment/api processing:run APPLICATION_UUID
```

This also needs `TYPESAFE_API_KEY` and a `BETTER_AUTH_SECRET` of at least 32 characters in this worktree's command environment. The latter is required by existing Nest configuration even though the processing CLI does not authenticate requests; a disposable CLI-only value suffices and does not reconfigure the running API. Database defaults use existing localhost development PostgreSQL; override `DATABASE_URL` if needed. `DOCUMENT_DIRECTORY` explicitly lets this worktree read the original checkout's private document storage, without copying/modifying files.

Only do this for synthetic records you deliberately choose. Do not use `pending`: live batch draining requires the separate `PROCESSING_ALLOW_ALL=true` opt-in. CLI refuses to claim work with disabled executor and no fixture file. Completed tasks are not rerun; previously bound fixture tasks stay fixture-backed. Use a new submission/vacancy for the first live attempt rather than editing database state or erasing fixture results.

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

1. Fund Jev, run the standalone synthetic probe, inspect actual request acceptance, resolved model, usage and skill/evidence quality. No live verification claimed. Published rate checked 2026-10-31: $0.042/M input tokens, output free. Actual request usage—not earlier hypothetical token estimates—should drive the final estimate. Minimum top-up/account terms unverified.
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
- Initial checkpoint was committed with the supplied author identity using per-command Git options. This follow-up is committed separately on the same feature branch. No push to any branch was performed; main checkout remains clean.
