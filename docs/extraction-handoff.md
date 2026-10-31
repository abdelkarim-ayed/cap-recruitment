# Extraction branch handoff — 2026-10-31

Branch: `feat/real-document-extraction`. Worktree: `/tmp/opencode/recruitment-extraction`.
Changes are staged but **not committed**: Git rejected the checkpoint because no author identity is configured. No global/repository identity was invented or changed. Set your preferred identity and commit from this worktree when ready; do not remove the worktree before committing.
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

Verified: API build; 32 API tests + 14 domain + 26 web DOM tests; web build; real PostgreSQL `processing:check` and new `extraction:check` (real parsing + fixture interpretation, including persistence/recovery/immutability/corrections/export). No browser automation or Windows test. Expected database-error log in the ordinary readiness test is its deliberately unreachable database scenario, not actual infrastructure failure.

Synthetic one-page PDF benchmark, five child-start-plus-parse runs: 567/561/512/574/555 ms. Zero paid requests. This is local parser overhead, not extraction quality/provider latency. The benchmark is repeatable with `extraction:bench`.

Database check commands need a CLI-only `BETTER_AUTH_SECRET`; tests override mail/storage and clean only tagged data:

```sh
pnpm --filter @recruitment/api processing:check
pnpm --filter @recruitment/api extraction:check
```

## Deliberately left for morning / next checkpoint

1. Fund Jev, run the standalone synthetic probe, inspect actual request acceptance, resolved model, usage and skill/evidence quality. No live verification claimed. Published rate checked 2026-10-31: $0.042/M input tokens, output free. Actual request usage—not earlier hypothetical token estimates—should drive the final estimate. Minimum top-up/account terms unverified.
2. Exercise a fresh synthetic application UUID end to end with Jev, then manually inspect HR correction/export. Current form editor still says “Mock only”; update that badge and static OpenAPI provenance descriptions after deciding how to expose the opt-in live mode. Runtime review renders the stored live mode already. No automatic fallback to another provider.
3. Cron deliberately deferred: after live verification, wrap the same service in an opt-in bounded poller with non-overlap and enabled-executor checks. No poller was registered in API startup, so a build/restart cannot unexpectedly consume the database backlog or spend money. Existing two-minute fencing and recovery support this later change; no queue service is needed.
4. Cross-task batching, persistent preparation artifacts, evidence-per-skill/page refs, Laya compatibility, DOCX and production upload hardening remain deferred. Jev transport is behind the existing TaskExecutor interface; Laya is not assumed protocol-compatible without a test.

Sources: https://docs.typesafe.ai/api ; https://docs.typesafe.ai/models ; https://docs.typesafe.ai/cookbooks/parallel_questions.md . No retraining or accuracy results claimed.
