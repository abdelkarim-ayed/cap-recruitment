# Checkpoint task board

Documentation-only work is the active authorized scope. Implementation checkpoints require renewed bounded approval after design review. Branch/worktree → focused verification → local merge → remove only that worktree. No fixed day-by-day schedule, no push. Presentation remains high priority.

## Board and acceptance gates

| ID / state | Work and dependency | Acceptance / meaningful checks |
| --- | --- | --- |
| D0 — docs checkpoint | Current/plan split, link index, minimal AGENTS, preserve feedback/safety, selective journal | Local Markdown paths + OpenAPI refs resolve; runtime sources and presentation exports unchanged; plans never described as implemented |
| P0 — next, design | Translate settled journey/review lock/publication/final selection decisions into state and effect contracts; resolve force-release fencing and remaining staff recipients | Small transition/permission/recipient matrix including no-task/error/stalled/concurrent cases; no code yet |
| R1 — proposed, behavior-preserving | Typed capability map/scoped policies, typed responses and UI action availability; retain transactional authority | Role/owner/assignee/candidate tests including HR acting as interviewer, revoked assignment and direct API denial; same current response/error/privacy behavior unless additive contract approved |
| R2 — proposed, behavior-preserving | Extract notification policy from orchestration; keep existing recipients/causes first | Matrix checks including reassignment/deduplication/actor overlap, atomic cancellation+notification rollback; relevant interview integration/DOM checks |
| R3 — proposed, no-op fix | Inventory revision counters; semantic comparison helper and UI dirty guards; scoped constants/UI deduplication | Same normalized save does not bump revision/time or notify; actual change increments once; concurrent/stale saves cannot overwrite; pipeline IDs stable on no-op; frontend refresh preserves latest correction |
| B1 — needs P0 | HR-ready state/projection and manual release; publish gate/freeze semantics | Success and ordinary terminal failures ready, stopped/interrupted work distinct; force-release/late-result fencing; no regression after preselection; publish invalid setup rejected atomically; no-task and existing published records explicit |
| B2 — needs P0, R2 | Candidate timeline + safe appointment details + tray; explicit hide; workload count endpoint/cache/poll | Multi-step timeline, candidate isolation, no internal notes, assignment changes, logout/login cache reset, always-visible icon, read != hide, no bulk ready-review tray spam; retention switch coordinated explicitly |
| B3 — contract first | Ready-for-preselection export (review complete or no tasks), filters; editable import/selection wizard and identity assertions; final decisions without undo | Remove invalid/valid rows, switch outcomes individually/in bulk, cancel preview without effects; invalid rows cannot bypass checks; already-decided exclusion, missing/excluded rows unchanged, duplicate/foreign/stale/mismatched cases, formula-safe export, commit atomicity and repeat import; no notifications before commit |
| R4 — proposed after inventory | Retire legacy extraction seam, clarify config/constant ownership; typed output registry boundary | Current skills result/correction/CSV compatibility and fixture provenance retained; no live calls; frozen old definitions still read; typecheck/build plus focused processing checks |
| B4 — blocked on recovery design | Continuous processing invocation, durable attempt/recovery boundary | No second paid attempt after uncertain interruption; disabled startup does not drain; fencing, stop-on-guard-block, non-overlap and shutdown tested via offline ports; paid/limit tests still require separate consent |
| B5 — gradual, design deferred | One additional extraction template, common review/CSV projection; quotes if viable | Runtime schema validation, original/effective/unknown semantics, source evidence verified, correction/export round trip, offline fixture interpretation; no model-quality claim without separately approved evaluation |
| T1 — later | Address-directory/timestamp.email UTF-8 capture history plus tiny operator-local viewer; metadata headers, separator and body; no read lifecycle | Safe address directory, collision-safe exclusive timestamp file creation without UUIDs, no overwrite/code leaks/public auth bypass; account for existing latest-only hashed captures |
| T2 — later | Reusable fixture service + broader demo orchestrator, new representative synthetic data | Standalone/backend invocation explicitly scoped, preserves unowned records, refuses production, no automatic reset/spend; data model/regeneration reviewed before changes |
| T3 — later | Storage global quota/accounting and possible admin monitoring | Backend-enforced limits under concurrent uploads; typed frontend errors, rollback/orphan accounting; quota values and reservation strategy approved first |

Grouping/order beyond docs and P0 is provisional. Do not execute the whole board because individual design directions were selected. Keep behavior-preserving commits separate from changed policies, bug fixes and schema changes.

## Verification strategy

After coherent code checkpoints: rebuild affected packages, typecheck and run meaningful ordinary tests; targeted `vacancies:check`, `applications:check`, `processing:check`, `extraction:check` or `interviews:check` only for affected contracts. They start local test applications and mutate/clean tagged PostgreSQL/file fixtures. Explicitly select disabled live executor/fixture ports, never rely on ambient live configuration. Ordinary fixtures are not Jev spending-limit tests.

Avoid repeating broad suites after every small edit. Defer provider quality testing as requested; don't defer all regression verification until the entire redesign is finished. User tests native UI manually; no browser automation. Record what was actually checked, including counts only when executed.

## Backlog / deferred decisions

- Export-tracking schema (batch ledger vs per-application markers vs other), reviewer assignment/claims, safe regex/search scope.
- Vacancy archive/fill/close semantics and handling pending work. Decision reversal/undo is explicitly dropped; retain flexible selection preview before final commit.
- Panels/other employees as participants, feedback ownership, overlap and visibility. Near-term wording **Responsible interviewer** selected; no participant field yet.
- Recruitment email vs external HR bulk-mail tooling/export; keep MailSender decoupled and identity mail functioning. Viewer T1 is later in the near-term todo list, not dropped indefinitely.
- Task presets/semantic form catalog: phone, portfolio, availability, supporting documents; singleton standard-field chips vs repeatable custom fields; selected-input panel/preview refinements. Generic editor already exists.
- Candidate withdrawal/resubmission/corrections, public communication copy, guest invitations, admin override, saved drafts, clone/repost, descriptive edits to published jobs.
- Richer experience/certification/education/language/management facets; bounding boxes, OCR/DOCX, persistent parser artifacts/cache, cross-task batching, provider alternatives; no arbitrary prompts/DAG.
- Production mail, OAuth (Google desired; LinkedIn optional), staff-management UI, quotas/scan/orphan reconciliation/backups, portability/hosting, availability/calendar sync, reminders/chat, SQL analytics, hired-person export, staff attachments/reference documents.
- Interview retries/reopening remain unimplemented; no selection undo feature planned. Prefer rescheduling to standalone cancellation in the bounded UI.
- Refine candidate landing/navigation, unread counts, filters, representative synthetic CVs; concise enterprise UI, fixture labels retained. Actual inbox reports still need user reproduction beyond the candidate missing-feature example.
- OpenAPI alignment to current skills/provenance, report-support journal and presentation review (CAP name/framing/institution/program); no invented results or slide changes in this pass.

Excluded without reopening scope: automatic qualification/ranking, employee management, marketplace/multi-tenancy, event sourcing, generic executable workflow/form engines, arbitrary raw DB admin, custom training, extra infrastructure without demonstrated need.
