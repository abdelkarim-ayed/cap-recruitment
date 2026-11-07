# Screening import — selected direction and remaining work

Updated 2026-11-07 after user approved implementation with worktree/commit/local merge/removal. The original draft has been replaced by the [source-level implemented contract](../current/contracts/screening-api.md); Git retains its proposals. Implementation is not deployment: migration 007 and PostgreSQL/HTTP/manual validation remain outstanding.

## Selected and implemented slice

- One decision CSV first; JSON/two-outcome-file uploads deferred.
- Application ID **and email mandatory**; ID is the key, frozen email is an assertion. Other exported columns, including name/evidence, are ignored, never extraction corrections.
- Optional per-row internal rejection reason from CSV. No mandatory batch explanation, no automatic disclosure to candidates. Structured screening outcome/actor/time retained separately.
- Invalid rows excluded with reasons and no wizard repair. Already-decided rows have distinct disabled/crossed-out styling. Valid proposals can switch individually or in bulk and be excluded before confirmation.
- First committed screening outcome wins. Preview/open/export is not a reservation. Atomic confirmation of the included set; conflicts preserve unaffected choices and require explicit reconfirmation. No undo or silent partial success.
- Current scope/identity/eligibility/workflow revision is checked. New review/extraction evidence alone does not block screening; the earlier strict-evidence-baseline proposal is superseded.
- Shared screening operation closes processing/fences late writes and freezes review for both individual and imported decisions. No completed-review fabrication; no new provider work. One transactional candidate screening notice, not actor copies.
- No Redis holds, claims, assignment, persistent proposals, automatic debate state, voting, SSE or hierarchy override. No guaranteed export-time freshness or replayable receipt.

## Defensible coordination model

Examples are operating options, not field research: teams can divide vacancies/date ranges/explicit ID lists; a coordinator can consolidate specialist/committee recommendations in approved tools before upload. Unresolved candidates remain outside the included set. Handoffs revalidate actual outcomes rather than inherit abandoned holds. Manager-only final approval is **not enforced** by shared HR eligibility; if required, it needs a separate authority decision. Frequent duplicate work in a large undivided pool would justify revisiting assignment, not pretending concurrency checks prevent duplicate preparation.

## Remaining gates / scope boundaries

- Q-SI: real migration/SQL/FK/transaction race/rollback validation; authenticated HTTP role/Origin/multipart/candidate-privacy checks; updated regression for changed review locks; manual export/edit/import/conflict/role-switch walkthrough. Isolated model/DOM checks are not these results.
- P0-S/B1-R remainder: whole-application readiness, manual release, failure categorization. This checkpoint implements screening/completion closure only, not the full readiness/release journey.
- Notification remainder: submission/appointment/Pass/Offer/Hired and owner-finalization effects, broader candidate progress, explicit hide/lifetime, and historical-feed design. Screening notices alone are implemented; old interview retention unchanged.
- B1-P publication freeze and B1-F explicit zero-interview owner Offer are source-implemented. Import still uses undecided eligibility, never a review-ready gate. Broader readiness/notification changes are not implied delivered.
- Search/export tracking, regex, second file layout/JSON, causal receipts, claims/assignment and supervisor-only approval remain unimplemented. Further cards are not authorized by this checkpoint.
