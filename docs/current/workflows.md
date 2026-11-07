# Implemented workflows and vocabulary

R1 centralizes action requirements; the 2026-11-07 [screening slice](contracts/screening-api.md) adds shared closure, CSV and candidate screening notices. Migration 007/integration remain pending; this describes source, not a running deployment. Revision checks remain separate under locks.

## Submission, processing and review are separate state dimensions

| Dimension | Stored field / meaning |
| --- | --- |
| Recruitment | `applications.stage`: received, review_ready (unused), preselected, interview, offer, hired, not_selected |
| Processing | `processing_state`: not_requested, pending, processing, completed, completed_with_errors |
| Review coordination | `review_status`: pending, in_review, completed; independent corrections |

Submission with tasks starts `received + pending + pending`. Without tasks it starts `received + not_requested + completed`; `review.required=false`, no human reviewer/time is invented, controls are hidden. Processing persists task success/failure and aggregate status; it never changes recruitment stage. HR review can complete despite missing/failed values. Review completion never means a selection decision.

`review_ready` appears in the shared vocabulary, SQL CHECK constraint, health/OpenAPI responses and UI guards, but no current command writes it. B1-R/B1-J derive separate staff review readiness and store manual release attribution, without a new recruitment stage; UI/list/filter consume those facts. Migration 008/integration/manual UX remain pending.

## Journeys

1. Owner saves draft intake/tasks and an optionally empty interview plan, reviews both saved versions, then publishes. Publication requires at least one answer/document input and valid selected tasks/plan; freezes all configuration. Empty tasks/interviews allowed; no publish-time assignee requirement.
2. Verified candidate submits once. Snapshot, answers and private file references persist transactionally; duplicate submission returns existing data. Close and submit serialize.
3. Operator explicitly runs processing. Normal ports default disabled; trusted fixtures or approved guarded execution selected separately. Real PDF parsing is available; fixture interpretation remains labelled.
4. Any HR can view evidence immediately; edits/completion require all tasks normally settled or explicit confirmed release of any unfinished work, including active processing. Release permanently closes processing without fabricating success/completion; completion/screening locks corrections. Source UI preserves local drafts for explicit refresh/reapply on conflict. Migration 008/real integration/manual checks remain pending. Diagnostic CSV includes all vacancy applications; screening export includes undecided records with optional evidence/date/readiness filters.
5. Any HR can preselect/reject undecided applications regardless of processing/review, individually or through CSV. First committed screening outcome wins; either closes processing and freezes review without fabricating completion. HR schedules the owner-defined interviews frozen at publication; multiple appointments may be scheduled ahead. Appointment logistics remain separately editable.
6. Assignee submits final notes, optional 0–10 score and Pass/Fail after the start. Fail sets Not selected and cancels every other unfinished instance. Pass does not accept or automatically advance the applicant. One instance per application/step; cancellation cannot be replaced.
7. Owner explicitly records Offer after all configured interviews pass, or directly from preselected with zero configured interviews. Neither preselection nor Pass automatically offers; Hired separately requires Offer. Screening rejection text optional; later rejection still needs a reason (shared HR through preselected, owner afterwards). Hired/Not selected terminal, no reversal.
8. Candidate application stage remains masked, but own generic screening notices appear in Inbox. Staff interview-event policy is unchanged; no internal reason/review data enters candidate notices.

## Current inbox behavior

Staff assignment/change/cancellation → assignee (reassignment also informs old assignee with restricted link); requests/feedback → creator + owner. New screening decisions produce one candidate notice through a separate application FK, including preselection. No other new candidate/owner effects, review-completion or Offer/Hired notices.

Open or Mark as read sets first read time. Unread default; All shows retained entries. Existing cleanup deletes old read interview notices only; new screening notices have no expiry. Broader candidate progress/effects, explicit hide and workload counters remain [planned](../plan/product-decisions.md#notifications-counters-and-email).

## Revision counters, not historical versions

| Counter | Protects |
| --- | --- |
| Vacancy `revision` | Draft metadata/definitions and publish/close concurrency |
| Vacancy `interview_revision` | Replacing ordered pipeline steps |
| Application `review_revision` | Shared HR status/corrections and new extraction results while open; completion/screening fences further writes |
| Application `flow_revision` | Selection, scheduling and progression |
| Interview `revision` | Schedule, rescheduling issue and final feedback |

Shared review checks the expected revision under an application row lock. A stale save returns 409; frontend asks for refresh. Counters do not retain past versions. R3a draft vacancy PATCH checks owner/editability/revision before comparing normalized submitted fields: current-identical leaves revision/time unchanged; stale-identical conflicts. R3b interview-plan PUT keeps owner, revision and scheduling-freeze checks separate and before comparison: current-identical preserves IDs/positions and the independent `interview_revision`, while stale/frozen-identical conflicts. Real plan edits still replace all IDs and increment once. Review no-ops and clearer conflict UX remain planned. Vacancy same-state publish/close retains its existing separate rule: unchanged even with an old revision. UI dirty checks exist in some places (vacancy publish) but not uniformly; concurrency protection remains authoritative.
