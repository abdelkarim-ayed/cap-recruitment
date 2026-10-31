# Combined extraction + Jev gateway handoff — 2026-10-31

## Merge/cleanup entry point

Skills starter implemented at `9e5f7c8` and merged locally into main after preserving wrong-session dirty docs in `74d4cf2`. Main's AGENTS conflict was reconciled; original edits remain in Git history. Main is now the cleanup starting point. Earlier branch distinctions/runtime statements below are historical. No live validation, pending-application processing, budget changes, reseed/reset, process restart, presentation change or remote push was performed. Current records are test/demo data per user. Read docs/README.md and docs/product-checkpoint.md before cleanup; preserve the unresolved workflow/changeability feedback rather than replacing it with the narrow skills implementation.

## Selected skills starter — supersedes excerpt-choice notes below

Implemented for the bounded MVP: one grouped Noul question per normalised configured skill (trim/lowercase/deduplicate), asking for claimed knowledge/use, positive at **>=0.8**. Model competence is not verified. Shared state contains CV text once. Missing/invalid answers fail the task, not false. Evidence/quotations deferred; legacy evidence flag is retained for old definitions but Noul emits none. Gateway/model/limits/namespace unchanged; defaults disabled, no live validation or paid/limit tests performed.

Persistence remains the compatible `{skills:[detected names]}` result in JSONB. Review additionally returns `skillResults:[{skill,original:boolean|null,effective:boolean|null}]`, computed from frozen configured skills. Corrections support optional `unavailableSkills` alongside detected `skills`; omitted configured skills are false, explicitly unavailable ones null. UI sends all configured flags so changing one skill never fabricates negatives for unknown siblings. Existing whole-list/null corrections remain supported. Actor/time/revision metadata remains task-level, not per-skill history.

CSV retains prior task/answer columns and appends `<outputKey>.skill.<URI-encoded-lowercase-skill>.original` and `.effective`: true/false, blank for unavailable. Labels in review are Detected / Not detected / Unavailable. “Not detected” means below provisional threshold, not proven absence. Form editor hides quotations and defaults new tasks to evidence=false; skills normalise on blur and server validation. Existing submitted definitions/files/results were not rewritten; no migration/reseed/reset needed.

User confirms current records are test/demo data; scoped re-fixturing can be acceptable, but no broad deletion or spending-counter reset is implied. Current checks: 42 API + 16 domain + 29 DOM tests (87 total), domain/API/web builds, and real PDF/PostgreSQL fixture integration including per-skill projections/corrections/CSV. Real Jev calls, gateway limits and manual browser appearance remain unvalidated. Earlier excerpt-choice tests are replaced by Noul business-port fixtures; no HTTP fallback exists.

Next session: cleanup/changeability review using docs/product-checkpoint.md. Broader workflow requests stay open. This starter does not implement years/proficiency extraction, richer tasks, cron, imports, panels or publication gates. No push to main.

For the latest product/changeability discussion before resuming technical work, read [product-checkpoint.md](product-checkpoint.md); overall reading map: [README.md](README.md). That docs-only checkpoint does not authorize broader feature work, merge, or any spending/limit change.

## Current reconciliation checkpoint — feature branch

This section supersedes the historical branch/transport/runtime statements below.

**Decision clarification:** JevGateway's guarded transport is approved. The excerpt-choice `JevTaskExecutor` is an **experimental, unselected candidate**; its algorithm/question design, production use and final model choice have not been approved or live-evaluated. Its existence in code is not a decision to use it. Defaults remain disabled. Do not promote it or its current character/excerpt/skill caps to product policy without approval.

- Active implementation: `/tmp/opencode/recruitment-extraction`, branch `feat/real-document-extraction`. Merged committed main checkpoint `330e3c9` without resetting, rebasing or moving main. Original extraction commits `2eb4a85`, `751205d` and documentation commit `8633e49` remain in history.
- Main `/home/ubuntu/code` remains one commit ahead of recorded origin/main, with its existing **uncommitted** `AGENTS.md` and `docs/jev-gateway-handoff.md` edits untouched. Both were read during reconciliation. Their combined extraction summary is covered by [extraction-handoff.md](extraction-handoff.md); no new implementation was present in those dirty docs. Preserve them when later merging back.
- Skill and guarded configuration from main are now present on this branch. Gateway limits, Redis namespace, endpoint and model are **unchanged** from `330e3c9`. No key read/printed by the agent, real provider call, Redis spending-counter operation, gateway-limit test, reset, reseed or process restart was performed.
- Extraction's `JevTaskExecutor` now accepts a narrow decision-client port; Nest injects **JevGateway**. There is no direct fetch/key/URL/model override in the executor. The only live HTTP implementation is the gateway, which owns `JEV_API_KEY` and the pinned model. Legacy `TYPESAFE_API_KEY` / `TYPESAFE_MODEL` references were removed from application source.
- Standalone `extraction:probe` is now **parse-only**, rejecting skill arguments before reading the input. It cannot execute provider calls. Any future live probe must be explicitly approved and use the same gateway.
- Gateway accepts an optional caller AbortSignal and passes it into its existing HTTP cancellation signal; it checks cancellation before/after admission. No admission rules changed. Cancellation/uncertain admitted calls still consume allowance; no refund/reset was introduced. Added `isConfigured()` for startup preflight without invoking Redis/provider.
- Every failure after entering a live executor is **non-retryable**, including HTTP/network/guard failures and the outer processing timeout. This intentionally supersedes the old extraction adapter's automatic retry classification. Storage/preparation/fixture recovery policies remain separate. A gateway block is a stop condition, not an instruction to drain/retry pending tasks.
- Offline business tests use a stub decision client, never `JevGateway.request`. They verify question construction, quote mapping, model ownership, signal forwarding, validation and terminal failure mapping. They do not verify spending guards or actual provider quality. Gateway limit/Redis concurrency tests remain explicitly unexecuted.
- Verified after integration: API build and 45 API + 14 domain + 28 web DOM tests (**87 total**); real PostgreSQL `extraction:check` with executor explicitly disabled and trusted interpretation fixtures. Existing fake-HTTP business tests were replaced by decision-port fixtures because HTTP now belongs exclusively to the protected gateway. No reduction in live verification claimed: it remains unperformed.
- Read-only listener inspection found **no listeners on 3000/5173** during this reconciliation. Other-session notes disagree about historical shutdown; do not terminate/restart anything based on those notes. Infrastructure was sufficient for the tagged PostgreSQL fixture check; no infrastructure command was needed here.

### Next safe step

Review integration differences, then request explicit consent for a small chosen synthetic live attempt through the guarded processing CLI. Do not run paid/limit tests merely because the account is funded or implementation is authorized. No automatic poller is registered. Review Redis command timeout/disconnection assumptions before unattended execution; no production guarantee is claimed.

### Token sizing discussion — estimates, not new limits

Official model docs checked 2026-10-31: https://docs.typesafe.ai/models — default 64000 tokens for shared state plus all questions, 32000 for state plus each individual question. No token minimum is specified there. State is ingested once; instructions/criteria still count. Current gateway cap is 60000 **bytes**, not tokens; experimental adapter also has character/excerpt/skill bounds, not tokenizer-based accounting. No limits changed and no provider/limit tests performed.

Planning estimate for a one/two-page French/English CV: roughly 800–3500 source tokens, sometimes 5000 with dense/noisy parsing. A compact batch of 10–20 fixed questions could put the full request around 2000–8000 tokens. Repeated excerpt-choice options can push it into roughly 8000–16000+; estimate is language/tokenizer/payload dependent and unmeasured. Prefer compact questions, not artificial minimum padding or truncation. A 12000–16000-token planning ceiling is a proposal only, not configured enforcement. Actual usage must be checked in a separately approved synthetic live attempt. At the published $0.042/M input-token rate, 8000 tokens cost $0.000336 and 16000 cost $0.000672, before any other charges; minimum account top-up differs from consumption.

Full extraction/UI/history and playground-only proposals: [extraction-handoff.md](extraction-handoff.md). Presentation unchanged. Nothing pushed.

## Imported main checkpoint — historical context

## Start here; no full-repo reread needed
- Current checkout: `/home/ubuntu/code`, branch `main`, latest observed `330e3c9` (gateway/skill/handoff checkpoint), one commit ahead of recorded origin/main. Not pushed. `AGENTS.md` and this handoff have subsequent uncommitted changes; preserve them.
- User now owns a funded Jev account. No credential was supplied/read here; no paid call made.
- Default remains discussion/read-only unless user authorizes implementation. This gateway/skill/handoff was explicitly authorized. No live/limit tests authorized.

## Implemented on main
- `apps/api/src/integrations/jev/jev.config.ts`: single frozen configuration for URL, pinned model `jev-1.14.0`, `JEV_API_KEY` environment reference, Redis URL, fixed namespace and limits. Top warning forbids future agents changing/bypassing limits without explicit user permission.
- `jev.gateway.ts`: Nest injectable, RxJS Subject/exhaustMap, one local in-flight request and no backlog queue. `request(payload)` returns parsed unknown JSON; caller owns business inputs/result validation. Model forced by configuration.
- Redis Lua atomically gates all processes sharing the namespace: **one active lease**, **3 attempts per rolling minute**, **20 attempts total**, no TTL on total. Failed/uncertain attempts consume allowance. No automatic HTTP retries. Redis unavailable blocks calls.
- 10-second HTTP timeout, 60-second Redis lease, 60 KB request and 1 MB response caps; redirects rejected, key/provider response contents not logged.
- Exported from existing `IntegrationsModule`. No controller, scheduler or processing integration. Existing main mock processing unchanged; adding the provider makes no API calls by itself.
- API typecheck/build passed. No gateway/limit tests, live calls, Redis budget writes or key access performed.

## Safety limitations / next integration
- This is a conservative **request allowance**, not token/currency accounting. No claim of a 25M-token budget. Redis data loss/namespace change would reset accounting; preserve its volume. The expiring lease is local admission control, not proof a timed-out provider operation stopped billing.
- Review Redis command timeout/disconnection handling and concurrency lease assumptions before unattended use; do not test spending guards or execute paid probes without authorization.
- Never use direct fetch/SDK/probe paths to circumvent this gateway. Do not reset total or change limits/namespace/model/endpoint without asking. Externally using the same key is outside this guard.
- API was already running from main before this build; **not restarted after gateway changes**. Frontend/backend logs: `/tmp/opencode/showcase-web.log`, `/tmp/opencode/showcase-api.log`. No RMUX session created. User's ambiguous “kill” request needs a target clarification before stopping anything. Do not restart/stop infrastructure or reseed unnecessarily.

## Other branch — do not lose this distinction
- Worktree `/tmp/opencode/recruitment-extraction`, branch `feat/real-document-extraction`, latest observed `751205d` (after `2eb4a85`). Not merged into main.
- Its `docs/extraction-handoff.md` summarizes PDF reader, registry, excerpt-based Jev executor, consent settings and checks. Read that handoff if continuing extraction work; avoid broad exploration.
- **Its Jev executor/probe still calls the provider directly and is NOT protected by the new gateway. Do not run its paid instructions as-is.** Migrate all live entrypoints to the guarded boundary first, while preserving cancellation/provenance/result validation.
- That branch uses `TYPESAFE_API_KEY`; main gateway uses `JEV_API_KEY`. Consolidation is pending, not silently implemented. Skills are currently excerpt-choice questions, not free-form generation.

## Extraction branch: combined summary of its previous handoff

This section incorporates the substantive checkpoint from that branch's `docs/extraction-handoff.md`; no need to read it all again for orientation. Its old paid-probe commands are **superseded by the mandatory gateway rule**, not authorized instructions to run.

### Existing product contract (unchanged by extraction branch)
- Configurable form inputs and private processing definition. Only `extractSkills` task is supported: sourceInputId identifies a document field; args contain configured skills/evidence. No CV semantic category, arbitrary user prompts or general task DAG.
- Application freezes the submitted definitions/answers/documents. HR corrections are separate; they do not alter originals. Review/export are not hiring approval and do not gate manual selection.
- Processing is explicitly invoked. Per-application leases, fenced writes, task retries/recovery and persisted results already exist. Document bytes/text reused within one invocation; no persistent parser cache.

### Implemented on feat/real-document-extraction only
- Commits `2eb4a85` (PDF preparation/opt-in Jev) and `751205d` (failure handling/review cleanup). No database migration or presentation changes; not merged/pushed.
- **PDF preparation**: PDF.js 6.4.299 in a killable child with no inherited credentials. Text-native PDFs only: signature/10 MiB, 20 pages, 60000 characters, eight-second timeout, 192 MiB V8 heap cap. Explicit corrupt/encrypted/no-text failures. Not an OS sandbox or complete native-memory quota. No OCR/DOCX/rectangles.
- **Task registry**: bounded `extractSkills` requirements and output validation; task type passed from frozen snapshot. Reader/executor accept AbortSignal. Fixtures may opt into real PDF parsing while retaining fixture-result provenance and expected-text validation.
- **Jev extraction**: source split into candidate excerpts; one Choice question per configured skill, excerpt IDs plus not_found, actual text included once. Selected IDs map to exact quotations. This preserves source presence but does not establish semantic accuracy, especially negations/prompt injection/ambiguity. No ranking or suitability decisions.
- Adapter bounds: 12000 source characters, 40 excerpts, 20 skills, serialized payload cap, 1 MB response, nine-second timeout; oversized inputs fail rather than silently truncate. Retains resolved model/usage even when answer validation fails. Auth/funding/schema versus retryable HTTP/network failures distinguished; errors redact payloads and keys.
- **Storage/provenance**: optional DOCUMENT_DIRECTORY setting, real reader/model metadata and text hash. Reader failure identifies attempted reader; executor failures retain attempted provenance. Existing lease/retry rules maintained. No page/per-skill evidence schema or persistent preparation artifact.
- **Review UI**: live/fixture labels per task; effective skills rendered as readable text rather than JSON. Reader/model/attempt metadata in collapsed original-result/evidence area. Original errors/evidence/JSON still accessible; saved HR corrections unchanged. Manual browser review pending.

### Previously verified on that branch (not rerun in this session)
- API/domain/web tests: **88 total** (46 API + 14 domain + 28 DOM), builds and frozen install.
- Real PostgreSQL processing:check and extraction:check: parsing with fixture interpretation, persistence/recovery, immutable deposits, corrections/export. Tests create/clean tagged data only. No auth bypass or modification of manual records.
- Synthetic PDF tests cover page order/blank boundaries, French WinAnsi accents, limits, cancellation/recovery. No general Unicode/layout accuracy claim, no two-column sample evaluation or Windows verification.
- Five synthetic one-page parse runs including child startup: 567/561/512/574/555 ms. This is parser overhead, **not AI accuracy/latency**. Zero paid requests.

### Remaining work and safe next checkpoint
1. Reconcile the feature branch with main's JevGateway; route **all** executor/probe live traffic through it. Preserve cancellation, bounded responses, model/usage metadata and errors. Resolve the two environment-key names explicitly; never bypass guards to make a probe run.
2. Obtain explicit consent for a small synthetic live batch. Verify actual provider acceptance, quotation selection, usage and failure cases. A funded account is not standing permission for automated paid experiments.
3. Run a fresh chosen synthetic application end to end, then inspect correction/export manually. Do not reset completed/fixture-bound tasks or use bulk pending draining as a shortcut.
4. Align OpenAPI/provenance docs after integration, then choose whether a bounded opt-in poller is necessary. No extraction worker/poller is registered at API startup today.
5. Defer general DAGs, persistent preparation cache, cross-task batching, page/rectangle highlights, alternative-provider compatibility, OCR/DOCX and broad production hardening unless approved. Provider prices quoted by the old handoff were researched, not measured account charges; recheck before estimating spend.

### Runtime and presentation checkpoint
- Main frontend/backend were launched for showcasing, infrastructure already running with host networking. Migrations up to date; seed rerun preserved accounts/submissions/passwords. No reset performed. Redis/PostgreSQL readiness and web/API proxy returned 200. No paid execution or extraction daemon launched.
- No confirmed process target for “kill”: stop nothing implicitly. Processes may have changed since launch; inspect before any management. User permits RMUX for visible logs, but no RMUX session was created here.
- Presentation sources in `presentation/`, shared tracked PDF `presentation/exports/status.pdf`; rebuild via pdf:build. Thirty content slides + six intercalaires; final presentation/demo and new real-extraction results still need reconciliation. Do not claim unverified IA results. Only rasterize selected low-resolution pages when necessary.

## Skill installed locally
`.opencode/skills/typesafe-ai/SKILL.md` is the project safety wrapper. Official raw vendor skill is preserved at `references/upstream-SKILL.md`; docs source, SHA and consent warning in wrapper. No npm package, plugins or global configuration added. New session can load `typesafe-ai`; otherwise read the wrapper directly.

## Small next-session instruction
“Read docs/jev-gateway-handoff.md and load the typesafe-ai skill. It combines both branch checkpoints. Preserve existing commits/uncommitted work. No paid requests, quota tests or safeguard changes. First reconcile the extraction branch's direct transport with JevGateway; propose the integration before editing unless I authorize it.”
