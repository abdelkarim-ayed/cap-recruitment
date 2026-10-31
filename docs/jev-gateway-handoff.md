# Jev spending gateway handoff — 2026-10-31

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
- Current checkout: `/home/ubuntu/code`, branch `main`, baseline `26f0b92`.
- Gateway/skill/handoff checkpoint committed locally on `main` at the end of this session; **not pushed**. Identify its hash with `git log -1`. Do not discard the separate extraction branch.
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
- **API and frontend now stopped**, explicitly authorized by user. SIGTERM sent only to the verified API/Vite listeners (ports 3000/5173). They were not restarted with the gateway. PostgreSQL/Redis/Mailpit left running; no data reset. Logs retained: `/tmp/opencode/showcase-web.log`, `/tmp/opencode/showcase-api.log`. No RMUX session created. User permits RMUX for visible logs in future; discover targets first.

## Other branch — do not lose this distinction
- Worktree `/tmp/opencode/recruitment-extraction`, branch `feat/real-document-extraction`, latest observed `751205d` (after `2eb4a85`). Not merged into main.
- Its `docs/extraction-handoff.md` summarizes PDF reader, registry, excerpt-based Jev executor, consent settings and checks. Read that handoff if continuing extraction work; avoid broad exploration.
- **Its Jev executor/probe still calls the provider directly and is NOT protected by the new gateway. Do not run its paid instructions as-is.** Migrate all live entrypoints to the guarded boundary first, while preserving cancellation/provenance/result validation.
- That branch uses `TYPESAFE_API_KEY`; main gateway uses `JEV_API_KEY`. Consolidation is pending, not silently implemented. Skills are currently excerpt-choice questions, not free-form generation.

## Skill installed locally
`.opencode/skills/typesafe-ai/SKILL.md` is the project safety wrapper. Official raw vendor skill is preserved at `references/upstream-SKILL.md`; docs source, SHA and consent warning in wrapper. No npm package, plugins or global configuration added. New session can load `typesafe-ai`; otherwise read the wrapper directly.

## Small next-session instruction
“Read docs/jev-gateway-handoff.md and load the typesafe-ai skill. Main gateway checkpoint is committed but unpushed; extraction work remains on its separate branch. No paid requests, quota tests or safeguard changes. First reconcile that branch's direct transport with JevGateway; propose the integration before editing unless I authorize it.”

## Conversation summary appended for continuation

### Delivery priorities and discussion decisions
- Student's university instructor now expects a **final presentation/demo ASAP**; progress meeting did not take place. User has about two focused working days, presentation completion weighted heavily. Recorded demo preferred. This is planning context, not a delivery guarantee.
- Proposed minimal core: real text-native PDF + configured-skills task + trustworthy source excerpts + existing correction/export flow. Avoid broad DAG/cache frameworks, OCR/DOCX, bulk import, ranking or production deployment scope. These remain proposals except work already implemented on the extraction branch.
- User asked about semantic CV/certificate presets, task preconditions, shared preparation, IDs/caching and evidence. Current main contract is document-source-linked `extractSkills` only; form types are a fixed Zod union, no semantic document category or arbitrary procedures. Reader/executor abstraction exists; no dependency graph. In-memory per-invocation byte/text reuse, persisted task outcomes, no persistent parsed-document cache.
- Existing evidence is persisted `string[]`, not new from scratch. Page/block references and parser-generated highlights discussed as extensions, not implemented on main. Rectangle coordinates should not be invented by the model. The feature branch maps chosen excerpt IDs to source quotes.
- A separate expensive-model session was given a selective reading prompt; use its actual branch handoff rather than reconstructing from old proposals. Both handoffs remain relevant; no merge authorized here.

### Showcase performed this session
- Started main after checking ports/worktrees; no branch process was occupying API/web. Existing infrastructure was healthy; feature branch has no migration changes relative to main.
- Built main, ran auth/application migrations and **preserving** `demo:seed`; existing accounts/passwords/submissions retained. Application schema was up to date. Auth migration logged a lastRequest int8/type warning but completed.
- Main API used `MAIL_DRIVER=file`; Vite loopback 5173. Readiness reported PostgreSQL/Redis OK; web/API proxy HTTP 200. No browser automation or extraction executed. Servers subsequently stopped at user request (above).
- Demo login reminders: candidate `demo.candidate@example.test`, alternate candidate2; initial public synthetic password `DemoRecruitment!2026`, unless changed. HR `demo.hr@example.test`. Credentials are demo-only, not production secrets.
- User asked about database viewing: pgAdmin/Adminer suggested, **not installed or launched**. Remote-PC localhost/tunnel caveat explained.

### Spending protection request and implementation boundary
- User bought Jev and is concerned about accidental spending from repeated tests/loops. Requested a server-side RxJS gateway with central hard-coded limits and a warning against other agents changing them.
- Gateway is a new isolated transport boundary on main, not completion of live extraction integration. No tests of limits or live calls performed, as explicitly requested. Only API compilation/typecheck and whitespace checks ran.
- Persistent request cap was chosen as a simple conservative safeguard; token-based reservation/reconciliation and currency accounting were only discussed, not implemented. All allowed attempts must use the same gateway/Redis namespace; provider key use outside it cannot be controlled locally.
- Official skill is installed project-locally from raw vendor Markdown, prefixed via a local safety wrapper. No npm installer/plugin/global config changes. Do not follow upstream live-probing/payload-logging advice without project consent/privacy checks.

### Presentation/repository context
- Current shared presentation: `presentation/exports/status.pdf`, 36 pages (30 content + six intercalaires), Typst renderer; Reveal.js installed but still a placeholder. French slides, English product UI/project docs mostly English. Metadata and six user images already integrated; no presentation changes in this gateway session.
- Repository: private `abdelkarim-ayed/cap-recruitment`; `origin/main` last observed at `26f0b92`. Prior CI passed after temp-path fix. No new push or CI run for this gateway work.
- Root AGENTS.md contains project constraints; read selectively. Do not rasterize every slide: targeted low-resolution previews only if needed.
