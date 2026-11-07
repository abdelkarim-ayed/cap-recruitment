# Significant checkpoints (report-support notes)

Selective notes, not an exhaustive history or source of current behavior. [Current docs](current/README.md) and [plan](plan/README.md) take precedence. Add major decisions/results only; do not invent evaluation outcomes, methodology or chronology. Git contains superseded detail.

## 2026-10-31 — guarded skills starter merged

Implementation `9e5f7c8`, local main merge `fd9fe9e`; separately edited documentation preserved in `74d4cf2`. Selected grouped Noul questions for normalized predefined skills (>=0.8), per-skill review/export, no quotations. Compatible list JSONB storage retained; no record rewrite. Recorded verification: 42 API + 16 domain + 29 DOM tests and builds/real-PDF fixture integration. No live-provider validation or gateway-limit tests. Broader workflow/changeability requests remained open.

## 2026-11-01 — changeability discussion and documentation checkpoint

User prioritized policy ownership, typed capabilities, no-op revision handling and bounded refactors over formatting or a workflow framework. Selected future directions include shared review, HR-ready failures/manual release, publication prerequisites, candidate timeline/notifications, explicit notification hiding, independent mail, cache-backed workload counts, and reviewed-only external-selection flow with import preview/manual reversal. Exact state, recipient, reversal, export-tracking and task schemas remain unresolved; none was implemented in this discussion.

Documentation reorganised into current implementation/contracts/guides and planned decisions/tasks/research, with a short navigation-oriented AGENTS. Superseded handoff snapshots removed from the reading path; Git retains them. Source review identified uncertain-live-attempt recovery as an obstacle before continuous execution, not a live-tested incident. This checkpoint changes documentation only; verification scope is links/reference integrity and unchanged runtime sources.

Documentation verification: 172 local links/anchors and 341 OpenAPI references resolved; both OpenAPI JSON files moved byte-for-byte. Application sources/scripts/config, synthetic CV input and presentation exports unchanged. No application integration tests, provider calls, data changes or process management performed.

## 2026-11-01 — screening and selection simplification

User confirmed no-task applications go directly to Ready for preselection; zero extraction tasks allowed at publication. Shared HR review retains conflict counters, no history/exclusive assignment. Separate extraction corrections lock at review completion; processing must not rerun or invalidate completed review. Candidate submission remains immutable. Selected no-op policy: unchanged current saves have no effects, stale saves require refresh.

Earlier manual decision reversal request withdrawn. Selection wizard provides the thinking space before commitment: remove invalid/unwanted rows, switch proposed preselected/rejected outcomes individually or in bulk, then confirm final decisions. Exclusion/cancel does not reject or notify. Candidate-facing notifications/timeline and publication freeze remain future behavior; current code unchanged. Local mail direction: safe recognizable address directories, timestamp.email UTF-8 files with metadata/body separator, collision handling without UUID names; viewer later.

## 2026-11-02 — optional screening support and interview-plan decisions

D0 confirmed complete. User selected screening at any time, individual or bulk, regardless of unfinished extraction/review; this supersedes the mandatory reviewed-only screening/export path. Whole-application review starts after normal task settlement or manual release. Either committed screening outcome freezes extraction/review and closes processing without inventing completion; answers/results/corrections remain distinct. Export unavailable values blank/null with truthful status; decision import contains IDs/outcomes and possible identity assertions, not extraction updates. Screening remains final; subsequent interview rejection is not screening reversal.

Configured interviews may be empty and freeze at publication; use Interviews / Interview plan in product/UI wording, not generic pipeline steps. Appointment logistics remain editable. All required interviews passed, or preselection with none, only enables explicit owner Offer confirmation; Hired is separate. Development recruitment re-fixturing is acceptable at an agreed operation checkpoint. Action-policy naming/scope clarified; no-op work split by resource. Task decomposition/order remains proposed, not implementation approval. This checkpoint updates/commits planning documentation only; no runtime/UI/data/provider/process changes or live evidence.

Documentation verification: 141 local Markdown links/anchors across the 29 tracked Markdown files under `docs/` plus AGENTS resolved, and 341 OpenAPI references resolved. Only documentation changed; runtime sources/config, JSON schemas, data inputs and presentation unchanged. No application tests, data mutations, provider calls or process management performed. Commit only; local merge/worktree removal not included in this authorization.

## 2026-11-02 — R2 staff notification-policy extraction

User subsequently authorized local merge of decision-docs commit `9ecfebd`, removal of its clean worktree, then R2 in a fresh external worktree with commit/local merge/cleanup. Existing staff notification recipients/content/causes moved into a pure typed policy; InterviewService keeps transaction ownership and inbox access projection. Explicit current no-effect decisions, actor overlap and per-appointment deduplication remain; no new candidate notifications, email, schema/API/UI changes or other backlog implementation.

API `tsc --noEmit`, whitespace checks, 148 local Markdown links/anchors and 341 OpenAPI references passed. At the user's request application test execution is deferred: Q-R2A records automated policy/integration/DOM regression, including rollback/reassignment/privacy; Q-R2U records future batched manual UX/reproduction. No test results or runtime verification claimed, no browser automation/provider calls/data changes/process management. Documentation navigation clarifies current honored rules versus planned directions and permits moderate backlog maintenance without blanket implementation approval.

## 2026-11-02 — R3a vacancy draft no-op saves

User approved this bounded backend checkpoint with docs/commit/local merge/worktree cleanup and static checks only. Draft PATCH now compares only submitted fields using existing schema normalization under the vacancy lock, after owner/editability/stale-revision checks. Unchanged current content skips UPDATE/revision/time changes; stale-identical still conflicts. Locked reads include owner metadata for the full unchanged staff projection. Interview/review saves, UI guards and publish/close rules are unchanged; current prose/OpenAPI describe only the delivered slice.

API `tsc --noEmit -p apps/api/tsconfig.json`, whitespace checks, 150 local Markdown links/anchors and 341 OpenAPI references passed; the OpenAPI diff changes only the vacancy PATCH description. Application regression is deferred explicitly as Q-R3A, not reported passed. No application execution, DB operations, provider calls, browser work or process management.

## 2026-11-02 — R3b interview-plan no-op saves

User approved implementation/docs/commit/local merge/worktree cleanup. Under the existing vacancy lock, separate owner/revision/scheduling-freeze checks still precede ordered name/instruction comparison with existing schema normalization. Identical plans, including empty, skip row replacement/counter updates and preserve IDs; stale/frozen-identical requests still fail. Real edits retain replace-all/new-ID behavior. No UI, notification or publication-rule changes; no generic combined permission/concurrency helper.

API `tsc --noEmit -p apps/api/tsconfig.json`, whitespace checks, 152 local Markdown links/anchors and 341 OpenAPI references passed; interview OpenAPI changes only the plan PUT description. Application regression is deferred explicitly as Q-R3B, not reported passed. No application execution, DB operations, provider calls, browser work or process management.

## 2026-11-03 — R1 existing-workflow action policies

User approved enumeration followed by scoped backend/UI refactoring and local merge/worktree cleanup, explicitly preserving the old enforced workflow rather than implementing all wanted rules. Static role eligibility and a small RequireAction guard now complement feature-owned resource policies and shared typed availability/response views. Revision checks/lock ownership remain separate; existing compatibility flags/private projections/error semantics are retained. Visibility is distinct from authority: rescheduling requests and time-gated feedback are separate; current nonempty/all-passed Offer prerequisites are reflected by UI availability. Review locks, publication-time freeze, zero-interview offers and candidate effects remain planned.

Domain build, API/web typechecks, whitespace/test-source syntax checks, 166 local links/anchors and 366 OpenAPI references passed. OpenAPI changes are additive response metadata only; existing endpoints/request schemas/fields remain. Pure offline policy specifications and DOM fixtures are written/updated, not executed; HTTP/privacy/concurrency regression and batched manual UX remain Q-R1A/Q-R1U. No new runtime/security-test pass, browser work, provider calls, data operations or service management claimed. The current action contract records the enumeration and additive API shape.

## 2026-11-07 — first-commit screening CSV checkpoint

User selected one CSV with mandatory application ID/email, ignored extra evidence columns and optional internal rejection reason. Shared worklist/filtered exports, no reservations/assignment/debate states; first committed outcome wins, atomic included-set apply with distinct invalid/already-decided rows and preserved conflict choices. Implementation authorized in worktree with local merge/removal. Individual/import screening share one transaction-owned closure/notice operation, not legacy endpoint loops. Review completion/screening fences later processing writes without fabricating completed work; narrow candidate screening notifications are transactional. Broader review readiness/release, publication and notification scenarios remain planned.

Domain/API/web builds, whitespace, 178 local links/anchors and 373 OpenAPI references passed. New isolated cases: 5 CSV, 9 fake-transaction/repository and 3 DOM (17); no real PostgreSQL/HTTP/session/privacy regression or manual UX evidence. Migration 007 authored, not applied; no database/seed/provider/process/browser operations. Prior deferred regression remains and Q-SI records deployment/integration/UX gates. Team-coordination examples are design rationale, not field research or verified organizational outcomes.

## 2026-11-07 — publication-time interview-plan freeze

User authorized B1-P followed by B1-F, each with worktree/commit/local merge/removal. B1-P checks vacancy and interview revisions plus form/task/ordered-plan validity under one vacancy row lock; empty tasks/interviews allowed. Plan saves and publication serialize; published/closed and defensively scheduled plans reject even identical saves, while draft no-ops preserve IDs/revision. UI reviews saved plan before publish, uses Interview plan / Interviews wording, and does not silently retry a stale confirmation. Appointment logistics unchanged. Updated smoke/demo source is not execution or permission to reset records; existing published plans freeze as-is.

Scoped checks: 4 shared-schema, 9 backend fake-transaction/repository, 5 existing vacancy-unit and 5 new DOM cases (23). Builds/static checks recorded in status. No new migration or database/provider/seed/browser/process operations; real DB/HTTP/manual evidence remains Q-B1P and prior deferred gates remain. B1-F zero-interview owner finalization is the authorized next checkpoint, not part of this commit.

## 2026-11-07 — explicit zero-interview owner Offer

After local B1-P merge `81adf8e`, B1-F in a fresh worktree enables explicit preselected → owner Offer with zero configured interviews. Nonempty plans still require interview stage and all configured interviews completed/Pass. Shared action metadata/mutation predicates agree; no preselection/Pass auto-offer, fake booking, admin owner override or combined Offer/Hired action. Hired remains a separate owner command requiring Offer. No new notification effects or migration.

Domain/API/web builds; 7 new backend command/model/matrix, 8 current pure action policies and 4 new DOM cases passed (19 scoped checks), not real SQL/HTTP/privacy/concurrency or manual UX evidence. Smoke source extended for zero-interview flow and cleanup scoped to tagged screening notices, not executed. Migration 007 and earlier regression remain pending; no data/provider/seed/browser/process operations. Q-B1F retains integration/manual checks; no further card authorized.

## 2026-11-07 — optional review readiness and manual-release backend

User selected release of any unfinished work, including active processing, then approved the bounded backend scope with fixtures/disabled AI only to avoid spending. Normal whole-application readiness is derived from frozen task outcomes; infrastructure/retry exhaustion and uncertain/unclassified failures do not count as ordinary settlement. Explicit shared-HR release records actor/time, revokes processing eligibility and fences late writes without fabricating task success or review completion. Screening stays independently available; completion/screening locks review. No new candidate effects, live-provider smoke, API-key/config changes or attempt-recovery fix.

Domain/API/web builds and 40 focused offline checks (15 new, 25 existing) passed; static evidence in status. Migration 008 is source only, 007 also remains unapplied. Real DB/HTTP/Origin/race/manual evidence remains Q-B1R and all earlier Q-* gates; source-updated smoke was not executed. Release UI/list/filter is the proposed next B1-J scope, not delivered here. No data/provider/browser/service operations.

## 2026-11-07 — factual readiness and confirmed release UI

User approved B1-J with fixture-only/offline checks and local commit/merge/worktree cleanup. Source UI now confirms manual release explicitly and separates original processing, human review status and factual availability. One readiness SQL expression serves list filtering/count/pagination and undecided screening export; candidate projections omit it. Local unsaved corrections survive failed writes and explicit refresh as separate drafts for manual comparison/reapplication, not automatic merge/retry. Technical review counters are hidden. Semantic no-op saves and general navigation dirty guards remain separate R3c/d work.

Domain/API/web builds and 63 scoped offline checks passed (4 new API projection/filter/export plus 40 existing API/model; 8 new DOM plus 11 selected existing DOM). Real PostgreSQL parity, authenticated HTTP/isolation and manual release/layout/accessibility remain Q-B1J alongside all prior gates. No migrations, smoke execution, data/provider/key/config/browser/service operations; 007/008 remain unapplied and live defaults disabled. No further-card implementation authorized.

## 2026-11-07 — semantic review no-op saves

User approved bounded R3c with offline checks and local commit/merge/worktree cleanup. Review PATCH now compares normalized skill membership and override presence after readiness/locks and the separate expected-revision check. Identical current saves write nothing and preserve editor/time/revision; stale-identical conflicts and locked/no-task review still denies. Null/absent/removal remain distinct even when effective values match. Mixed saves update only changed corrections and increment review revision once; unchanged corrections cannot implicitly start pending review. No generic revision/history framework or UI runtime changes.

Domain/API/web builds and 66 offline checks passed (16 new API + 41 existing, 1 new DOM + 8 existing). Static evidence in status. Updated smoke source was syntax checked, not executed. Real persistence/attribution/role/Origin/race evidence remains Q-R3C and every prior Q-* gate; 007/008 remain unapplied. No migration/data/provider/key/config/browser/service operations. R3d broader dirty/navigation guards remain a proposed next checkpoint, not authorized by this one.

## 2026-11-07 — review navigation guard

User selected Stay or Discard and leave for unsaved review corrections, rejecting a save-all flow. R3d-a adds a review-only boundary around the existing hash router: dirty/pending drafts keep the page mounted, sign-out asks first, managed history and client redirects require confirmation, and standard unload warnings cover reload/close. Explicit discard navigates without saving or cancelling a pending request; failed sign-out retains the draft. Editing back to the saved value clears the local warning. Vacancy/interview-plan editor guards remain R3d-b.

Domain/API/web builds; 110 existing API and 64 DOM tests passed (14 new navigation cases, 50 existing). A stale DOM URL expectation from B1-J was corrected after confirming it failed on main. Static evidence in status. JSDOM does not establish native history UI, tab-close prompts, focus/inert behavior, authenticated logout isolation or real response timing: Q-R3DA remains manual, alongside every prior Q-* gate and unapplied migrations 007/008. No backend/API/schema/permission change, draft persistence, browser automation, data/provider/key/config/service operation or further-card approval.
