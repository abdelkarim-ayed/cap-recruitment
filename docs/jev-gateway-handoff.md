# Combined extraction + Jev gateway handoff — 2026-10-31

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
