# Changeability review and implementation obstacles

Source audit baseline: `fd9fe9e`; planning implications updated 2026-11-02, with targeted rereads of `ProcessingService.processOne` and `InterviewService.stage`, then R2 staff policy extraction and R3a draft vacancy no-ops. References below are repository paths, with symbols to survive formatting. Findings are source-level evidence, not a fresh runtime test result. Selected behavior in [decisions](product-decisions.md) supersedes earlier mandatory review/minimum-interview proposals.

## Priorities and local boundaries

| Priority | Evidence | Proposed bounded change |
| --- | --- | --- |
| High | `interviews/interview.service.ts` owns pipeline, schedule SQL, stage rules, inbox and projections; `web/src/interviews.tsx` repeats stage/action checks | Separate typed command schemas, pure progression/availability policies, transactional orchestration and SQL helpers. Split UI by journey with typed responses; retain one transaction owner |
| R2 implemented; regression deferred | `interview-notification.policy.ts` owns existing typed staff recipients/content; InterviewService supplies loaded context and persists intents | Q-R2A/Q-R2U verify matrix/rollback/privacy later; new candidate/owner effects and channel decisions remain B2/P0-N, not part of this refactor |
| High | `InterviewService.stage`, domain `index.ts`, database constraints and UI lists include unused `review_ready`; ApplicationService masks candidate stage | Define independent processing/review/recruitment/public projections before changing enums; derive action capabilities from the same rule owners |
| High | Role checks distributed through decorators, service helpers, ApplicationService authorization and UI | Typed action policies for role/resource/state requirements and UI availability; preserve current 401/403/404 and no-owner-override semantics in a behavior-preserving first pass |
| High before runner | `ProcessingRepository.claim/start/save` and `ProcessingService.processOne` | Distinguish interrupted pre-call work from uncertain admitted live work; enforce no automatic paid reattempt, then discuss runner lifecycle |
| Medium | `ReviewService.read/patch/export` owns skill correction, original/effective projection and CSV expansion; `execution.ts` skill-specific port | Stable typed output descriptors and shared review/export projection, only after one additional template is designed |
| Medium | `integrations/extraction/*` only used by its adapter wiring/tests; current workflow uses context reader/executor | Retire legacy production wiring after dependency inventory; retain meaningful fixture ports and tests, not parallel demo implementations |
| Medium | RuntimeConfig vs `processing/settings.ts` vs `jev.config.ts`; retry/lease/durations/caps in SQL/UI | Typed configuration ownership; separate operational limits, business policy and immutable spending controls. No giant global constants file or admin settings feature |
| R3a implemented; remaining medium | Draft vacancy PATCH now skips normalized no-ops; interview-plan/review saves still increment on identical input | Q-R3A verifies vacancy regression later; R3b/c/d cover remaining resource comparisons/dirty guards; counters stay concurrency fences |

Paths under `apps/api/src/` unless specified. Current application/review services query DatabaseService directly; the earlier claim that controller→service→repository was consistently implemented was too broad. JSONB and repeated validation are not automatically defects. Backend/frontend validation both remain appropriate.

## Notification policy (clarified C1)

**R2 implemented:** pure staff-only function takes a typed cause/event plus loaded context and returns intents with recipient, interview subject, kind, content and cause. The context map covers every current cause; the switch is exhaustive, including explicit no-effects for current preselection/Offer/Hired. Persistence remains in the command transaction. Reassignment supplies old/new assignee, existing actor copies/deduplication remain unchanged, and the read-side access projection is untouched. See the [current matrix](../current/contracts/interview-api.md#inbox-and-retention); behavioral tests are deferred, not reported passed.

Future effects still need recipient/privacy/channel design; a typed mapping cannot decide importance automatically. Bulk actions need grouping context rather than inferring policy from generic SQL changes.

Separate a policy matrix by recipient relation (actor, candidate, owner, responsible interviewer, future participant) and channel (toast/tray/email/work counter). Return empty effects explicitly where expected. Do not default everyone or every actor to a notification. New candidate/public effects are later behavior changes, not part of a behavior-preserving C1 refactor.

Current inbox rows require an interview FK. Candidate receipt/preselection notifications cannot simply reuse this schema unchanged: use typed subject links/relational ownership appropriate to application or interview, with scoped projection and deduplication. Avoid unconstrained polymorphic IDs where foreign-key guarantees matter.

## Revisions and permissions

- R3a implements draft PATCH no-ops after owner/editability/stale checks under the existing vacancy lock. It normalizes only submitted stored fields using the same patch schema and deep-compares object content while preserving array order; invalid old selected data does not block a valid repair. The locked read also loads owner metadata so no-op and saved staff projections agree. No new generic revision framework or publish/close-policy change; application tests deferred as Q-R3A.
- Counters exist for distinct resources; history is not implemented or needed. Remove redundant counter increments only after mapping which commands invalidate which concurrent edits.
- Semantic equality should compare persisted editable fields after normalization, not IDs/timestamps or raw JSON key order. Pipeline replacement currently regenerates step IDs, so detect no-op before replacing rows.
- Check authorization and stale revisions inside the transaction before a no-op return. Selected rule: stale-identical still requires refresh; current-identical does not increment or emit notifications, refresh completion timestamps or discard corrections. Completed review locks corrections; late processing cannot invalidate it.
- Capability names may express `editOwnVacancy`/`readOwnApplication`; resource resolution still happens server-side. Action availability includes state/prerequisites in addition to permission. Shared policy is not a cache that bypasses fresh mutation checks.
- Shared review already uses row lock + expected revision. Improve refresh/reapply UX first; exclusive claims introduce expiry, reassignment and abandoned work and are not needed for the selected model.
- Most no-op semantics follow from existing business/schema rules: omitted correction leaves an override untouched, explicit null stores unknown, remove clears an existing override (already absent is a no-op); identical saves do not reattribute an editor. Split resource checks for verification, not unrelated constants cleanup. Plan terminology changes do not require renaming internal `stepId`/table/API identities first.

## Screening, publication and owner finalization

- Screening already ignores review readiness in `InterviewService.stage`; do not add the superseded reviewed-only gate. The missing guarantee is transactional extraction/review closure on either screening outcome, shared by individual and future bulk commands. Current `ReviewService.patch` permits later changes, and processing claims/saves lack the selected review/selection eligibility boundary.
- Review-readiness projection still matters for optional review: wait for all tasks to settle normally or explicit release; selection freezes unfinished review without completing it. Use factual filters rather than a new “preselection-ready” stage. Exclude frozen review from actionable workload counts.
- Publication currently validates intake via VacancyService/Repository, while interview-plan editing/freezing lives in InterviewService. Validate/freeze the configured list under the same vacancy serialization boundary; account for its separate revision and concurrent edits. Empty list is valid; only appointment logistics remain mutable.
- Existing smoke/demo setup publishes before configuring interviews. Update owned fixtures in the publication checkpoint; the user accepts scoped development re-fixturing rather than elaborate legacy migration. No fixture mutation follows from this audit.
- `InterviewService.stage` currently permits Offer only from `interview`, rejecting an empty configured list. Zero-interview finalization needs an explicit preselected → owner Offer path; nonempty plans still require all configured interviews passed. Interview results never substitute for the owner confirmation. Preserve owner-only Offer/Hired authority and final screening versus later recruitment distinction.
- Product/UI wording becomes Interviews / Interview plan, not generic steps/pipeline. Keep internal IDs stable unless a separately justified migration is needed; no generic activity engine or post-publication plan mutation.

## Processing and operations

- Current normal parse failures persist terminal/null, but timeouts/storage failures can persist retryable results. Aggregate `completed_with_errors` alone cannot prove a review-ready terminal workload. Stopped service leaves pending; interrupted processing stays processing until expired-lease recovery. Earlier discussion claiming all storage/infrastructure failures leave work open was incorrect.
- Expired-lease recovery currently makes all interrupted tasks retryable, without durable live-admission state. Need a conservative attempt boundary/uncertain outcome policy before continuous execution. Do not test/reset the real spending guard to investigate this.
- Force-release for HR must fence/cancel local work and specify handling of late results and review revision invalidation. It must not restart a paid attempt or label failed output false.
- Screening closure needs the same durable eligibility boundary: claim/start/save/finish must not publish late results or reopen review after selection. Checks between tasks/batches help avoid work but do not replace transactional save fencing. External cancellation is best-effort, not a billing guarantee.
- `ProcessingService.processOne` currently invokes executor once per task while reusing source bytes/text. Prefer minimal shared-document requests where feasible as a separate batching design; grouped skill questions within a task do not implement cross-task batching. Do not couple whole-application review readiness to this optimization or alter gateway safeguards.
- CLI can continue other tasks/applications after a returned failure. Terminal task failure does not itself prove a whole batch stops on a gateway block. Define run-level stop behavior separately; gateway blocking must remain a stop condition.
- Runner topology (standalone Nest context, backend child or other bounded process), recovery and shutdown remain open. No queue/BullMQ is required merely because Redis exists. Avoid duplicate runners and automatic draining when API starts.
- Work counts can use cache-aside with short TTL and browser polling; DB remains authoritative. Define stale count indication/error fallback, role/scope cache keys and logout/login reset. No Redis namespace interaction with spending counters.
- File quota accounting spans PostgreSQL and filesystem; a sum-before-write alone races. Retain existing upload caps/compensation; global reservations/reconciliation need an explicit later design, not decorative gateway wrappers.

## Export/import and schema impact

An additive action-policy map or recipient change among existing notification subjects need not change stored shape. Adding candidate notification subjects, hide flags, publication records, participant relations or new decision-cause persistence does.

A new task type does **not inherently require relational tables/columns**: current task type is recovered from frozen definitions and results are JSONB. It does require updated validated contracts, snapshot compatibility and dispatch. Arbitrary result JSON is not enough; validate at input/result boundaries and keep task/output IDs stable.

New enum values require SQL CHECK migration (unless a deliberately reviewed schema replacement is used). Removing `review_ready` need not require removing the stored accepted value immediately; compatibility and data inventory decide. CSV import always needs a contract; new tables depend on provenance/export-history design. Decision reversal has been dropped: editable preview precedes final confirmation. Preview and export tracking are independent; revalidate the included rows at commit, and emit notifications only for committed decisions.

Screening export/import must allow undecided applications with unfinished extraction/review. Export blank/null unavailable values with original status/provenance; import only identity assertions and outcomes, never extraction corrections. Choose diagnostic-versus-selection export contract explicitly. Common screening commands must apply closure/locks regardless of individual/import entry point; revalidate both relevant review/workflow changes, not only a cached preview. Define CSV shape, rejection reason, duplicate/repeat behavior, staleness boundary and atomicity before implementation. Bulk rejection cannot rely on reviewed-only export eligibility.

Tests/integration scripts import built `dist/`; rebuild affected packages before trusting a test run. No counted old tests are proof of current behavior after refactoring. Test contracts and invariants, not helper implementation details.

## Documentation consistency follow-ups

Current prose was reconciled to the merged skills code. OpenAPI remains a static reference with known missing per-skill/live-provenance extensions; align using sample validated responses in a later contract checkpoint. Prose vs OpenAPI duplication is acceptable. Retire chronological "latest" handoffs; retain dated evidence in journal/Git and decisions in plan until shipped.
