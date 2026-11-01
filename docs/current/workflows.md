# Implemented workflows and vocabulary

## Submission, processing and review are separate state dimensions

| Dimension | Stored field / meaning |
| --- | --- |
| Recruitment | `applications.stage`: received, review_ready (unused), preselected, interview, offer, hired, not_selected |
| Processing | `processing_state`: not_requested, pending, processing, completed, completed_with_errors |
| Review coordination | `review_status`: pending, in_review, completed; independent corrections |

Submission with tasks starts `received + pending + pending`. Without tasks it starts `received + not_requested + completed`; `review.required=false`, no human reviewer/time is invented, controls are hidden. Processing persists task success/failure and aggregate status; it never changes recruitment stage. HR review can complete despite missing/failed values. Review completion never means a selection decision.

`review_ready` appears in the shared vocabulary, SQL CHECK constraint, health/OpenAPI responses and UI guards, but no current command writes it. A sent, unprocessed application is already represented by `received + pending`; adding another stored state requires a defined owner/invariant, not just another label. Future HR-facing readiness is planned separately.

## Journeys

1. Owner configures form + source-linked `extractSkills` tasks, saves, publishes. Intake becomes immutable. Empty tasks allowed; publication needs at least one answer/document input, not an interview pipeline.
2. Verified candidate submits once. Snapshot, answers and private file references persist transactionally; duplicate submission returns existing data. Close and submit serialize.
3. Operator explicitly runs processing. Normal ports default disabled; trusted fixtures or approved guarded execution selected separately. Real PDF parsing is available; fixture interpretation remains labelled.
4. Any HR can review/correct extraction. CSV includes all vacancy applications, original/effective values, errors and provenance; list filters do not constrain it.
5. Any HR can preselect regardless of processing/review. HR schedules owner-defined interview steps; steps freeze at the first instance. All current pipeline steps are schedulable interviews, not arbitrary activities. Multiple steps may be scheduled ahead; no strict next-step-only rule exists.
6. Assignee submits final notes, optional 0–10 score and Pass/Fail after the start. Fail sets Not selected and cancels every other unfinished instance. Pass does not accept or automatically advance the applicant. One instance per application/step; cancellation cannot be replaced.
7. Owner may record Offer after every configured step passes; Hired requires Offer. Manual Not selected needs a reason: shared HR before interviewing, owner afterwards. Hired/Not selected terminal, no reversal.
8. Candidate still sees a receipt and immutable submission, not internal progression. Staff/interviewers have an Inbox for interview events only.

## Current inbox behavior

Assignment/change/cancellation → assignee (reassignment also informs old assignee with restricted link). Scheduling request/feedback → creator + owner, deduplicated. No notifications on preselection, review completion or Offer/Hired. Thus a candidate expecting a preselection notification encounters a missing feature in today's contract, not evidence of a delivery failure.

Open or Mark as read sets first read time. Unread is default; read entries remain under All until cleanup deletes them seven days after first read. Desired explicit hide, candidate tray and workload counters are [planned](../plan/product-decisions.md#notifications-counters-and-email).

## Revision counters, not historical versions

| Counter | Protects |
| --- | --- |
| Vacancy `revision` | Draft metadata/definitions and publish/close concurrency |
| Vacancy `interview_revision` | Replacing ordered pipeline steps |
| Application `review_revision` | Shared HR status/corrections; processing writes invalidate prior review completion |
| Application `flow_revision` | Selection, scheduling and progression |
| Interview `revision` | Schedule, rescheduling issue and final feedback |

Shared review checks the expected revision under an application row lock. A stale save returns 409; frontend asks for refresh. Counters do not retain past versions. Most saves currently increment even for unchanged data; vacancy same-state publish/close already returns unchanged. UI dirty checks exist in some places (vacancy publish) but not uniformly. No-op saves and clearer conflict handling are planned, not a reason to remove concurrency protection.
