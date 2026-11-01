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
