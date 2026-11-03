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
