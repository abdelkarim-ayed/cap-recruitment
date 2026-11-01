# Changeability review and implementation obstacles

Source audit baseline: `fd9fe9e`. References below are repository paths, with symbols to survive formatting. Findings are source-level evidence, not a fresh runtime test result.

## Priorities and local boundaries

| Priority | Evidence | Proposed bounded change |
| --- | --- | --- |
| High | `interviews/interview.service.ts` owns pipeline, schedule SQL, stage rules, inbox and projections; `web/src/interviews.tsx` repeats stage/action checks | Separate typed command schemas, pure progression/availability policies, transactional orchestration and SQL helpers. Split UI by journey with typed responses; retain one transaction owner |
| High | `InterviewService.create/reschedule/cancel/issue/feedback/cancelRemaining` choose recipients inline; `notify` accepts untyped kind | Reviewable exhaustive cause→effect policy, explicit recipients/privacy/channel decisions, tested as a matrix; no event bus |
| High | `InterviewService.stage`, domain `index.ts`, database constraints and UI lists include unused `review_ready`; ApplicationService masks candidate stage | Define independent processing/review/recruitment/public projections before changing enums; derive action capabilities from the same rule owners |
| High | Role checks distributed through decorators, service helpers, ApplicationService authorization and UI | Static capabilities + scoped resolvers; preserve current 401/403/404 and no-owner-override semantics in a behavior-preserving first pass |
| High before runner | `ProcessingRepository.claim/start/save` and `ProcessingService.processOne` | Distinguish interrupted pre-call work from uncertain admitted live work; enforce no automatic paid reattempt, then discuss runner lifecycle |
| Medium | `ReviewService.read/patch/export` owns skill correction, original/effective projection and CSV expansion; `execution.ts` skill-specific port | Stable typed output descriptors and shared review/export projection, only after one additional template is designed |
| Medium | `integrations/extraction/*` only used by its adapter wiring/tests; current workflow uses context reader/executor | Retire legacy production wiring after dependency inventory; retain meaningful fixture ports and tests, not parallel demo implementations |
| Medium | RuntimeConfig vs `processing/settings.ts` vs `jev.config.ts`; retry/lease/durations/caps in SQL/UI | Typed configuration ownership; separate operational limits, business policy and immutable spending controls. No giant global constants file or admin settings feature |
| Medium | Vacancy/pipeline/review saves and workflow revision increments | No-op comparisons and frontend dirty guard, scoped revision helper; counters stay concurrency fences |

Paths under `apps/api/src/` unless specified. Current application/review services query DatabaseService directly; the earlier claim that controller→service→repository was consistently implemented was too broad. JSONB and repeated validation are not automatically defects. Backend/frontend validation both remain appropriate.

## Notification policy (clarified C1)

Behavior-preserving extraction first: function(s) take typed cause plus loaded context and return notification intents. Each intent identifies recipient, public/internal content and safe target; persistence writes in the existing transaction. Existing cause alone may be insufficient: reassignment needs old/new assignee, a bulk action needs grouping context. A typed exhaustive mapping forces explicit handling of new causes, including deliberate `none`; it cannot decide importance automatically.

Separate a policy matrix by recipient relation (actor, candidate, owner, responsible interviewer, future participant) and channel (toast/tray/email/work counter). Return empty effects explicitly where expected. Do not default everyone or every actor to a notification. New candidate/public effects are later behavior changes, not part of a behavior-preserving C1 refactor.

Current inbox rows require an interview FK. Candidate receipt/preselection notifications cannot simply reuse this schema unchanged: use typed subject links/relational ownership appropriate to application or interview, with scoped projection and deduplication. Avoid unconstrained polymorphic IDs where foreign-key guarantees matter.

## Revisions and permissions

- Counters exist for distinct resources; history is not implemented or needed. Remove redundant counter increments only after mapping which commands invalidate which concurrent edits.
- Semantic equality should compare persisted editable fields after normalization, not IDs/timestamps or raw JSON key order. Pipeline replacement currently regenerates step IDs, so detect no-op before replacing rows.
- Check authorization and stale revisions inside the transaction before a no-op return; decide stale-identical semantics explicitly. A no-op must not emit notifications, refresh completion timestamps or discard corrections.
- Capability names may express `editOwnVacancy`/`readOwnApplication`; resource resolution still happens server-side. Action availability includes state/prerequisites in addition to permission. Shared policy is not a cache that bypasses fresh mutation checks.
- Shared review already uses row lock + expected revision. Improve refresh/reapply UX first; exclusive claims introduce expiry, reassignment and abandoned work and are not needed for the selected model.

## Processing and operations

- Current normal parse failures persist terminal/null, but timeouts/storage failures can persist retryable results. Aggregate `completed_with_errors` alone cannot prove a review-ready terminal workload. Stopped service leaves pending; interrupted processing stays processing until expired-lease recovery. Earlier discussion claiming all storage/infrastructure failures leave work open was incorrect.
- Expired-lease recovery currently makes all interrupted tasks retryable, without durable live-admission state. Need a conservative attempt boundary/uncertain outcome policy before continuous execution. Do not test/reset the real spending guard to investigate this.
- Force-release for HR must fence/cancel local work and specify handling of late results and review revision invalidation. It must not restart a paid attempt or label failed output false.
- CLI can continue other tasks/applications after a returned failure. Terminal task failure does not itself prove a whole batch stops on a gateway block. Define run-level stop behavior separately; gateway blocking must remain a stop condition.
- Runner topology (standalone Nest context, backend child or other bounded process), recovery and shutdown remain open. No queue/BullMQ is required merely because Redis exists. Avoid duplicate runners and automatic draining when API starts.
- Work counts can use cache-aside with short TTL and browser polling; DB remains authoritative. Define stale count indication/error fallback, role/scope cache keys and logout/login reset. No Redis namespace interaction with spending counters.
- File quota accounting spans PostgreSQL and filesystem; a sum-before-write alone races. Retain existing upload caps/compensation; global reservations/reconciliation need an explicit later design, not decorative gateway wrappers.

## Export/import and schema impact

An additive role→capability map or recipient change among existing notification subjects need not change stored shape. Adding candidate notification subjects, hide flags, publication records, participant relations or new decision-cause persistence does.

A new task type does **not inherently require relational tables/columns**: current task type is recovered from frozen definitions and results are JSONB. It does require updated validated contracts, snapshot compatibility and dispatch. Arbitrary result JSON is not enough; validate at input/result boundaries and keep task/output IDs stable.

New enum values require SQL CHECK migration (unless a deliberately reviewed schema replacement is used). Removing `review_ready` need not require removing the stored accepted value immediately; compatibility and data inventory decide. CSV import always needs a contract; whether it needs new tables depends on chosen provenance/reversal/export-history design. Preview and export tracking are independent.

Tests/integration scripts import built `dist/`; rebuild affected packages before trusting a test run. No counted old tests are proof of current behavior after refactoring. Test contracts and invariants, not helper implementation details.

## Documentation consistency follow-ups

Current prose was reconciled to the merged skills code. OpenAPI remains a static reference with known missing per-skill/live-provenance extensions; align using sample validated responses in a later contract checkpoint. Prose vs OpenAPI duplication is acceptable. Retire chronological "latest" handoffs; retain dated evidence in journal/Git and decisions in plan until shipped.
