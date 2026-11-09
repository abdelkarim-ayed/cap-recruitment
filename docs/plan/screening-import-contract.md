# Screening import — selected direction and remaining work

SI and the compact export/grouped visual wizard are implemented and locally merged. The [current contract](../current/contracts/screening-api.md) owns exact behavior; [earlier feedback](hr-export-import-ux.md) is diagnostic context, not a competing unimplemented proposal. Migration 007 is applied locally. Builds/focused offline/DOM and partial manual-path evidence exist; real SQL/HTTP/round-trip/privacy/race verification remains incomplete.

## Selected and implemented slice

- One decision CSV first; JSON/two-outcome-file uploads deferred.
- Application ID **and email mandatory**; ID is the key, frozen email is an assertion. Other exported columns, including name/evidence, are ignored, never extraction corrections.
- Optional per-row internal rejection reason from CSV. No mandatory batch explanation, no automatic disclosure to candidates. Structured screening outcome/actor/time retained separately.
- Invalid/mismatched rows are separately barred with multiple issues/structural errors distinguished; already-decided/excluded entries are grey. Valid duplicates group into one application row with CSV record numbers, trusted application link, email and one decision. Agreement is prefilled, conflict requires selection and differing reasons require a source outcome/reason pair. Individual/bulk outcome switching and exclusion stay local until final confirmation; no identity repair, last-row-wins or general CSV editor. The old all-duplicates-invalid behavior is superseded.
- Compact undecided decision export includes identity/date/answers/review/authorized links and effective per-skill Yes/No/Unknown, preserving explicit HR unknown and fixture provenance. Diagnostic export-all remains separate; no current extraction-template/schema change.
- First committed screening outcome wins. Preview/open/export is not a reservation. Atomic confirmation of the included set; conflicts preserve unaffected choices and require explicit reconfirmation. No undo or silent partial success.
- Current scope/identity/eligibility/workflow revision is checked. New review/extraction evidence alone does not block screening; the earlier strict-evidence-baseline proposal is superseded.
- Shared screening operation closes processing/fences late writes and freezes review for both individual and imported decisions. No completed-review fabrication; no new provider work. One transactional candidate screening notice, not actor copies.
- No Redis holds, claims, assignment, persistent proposals, automatic debate state, voting, SSE or hierarchy override. No guaranteed export-time freshness or replayable receipt.

## Defensible coordination model

Examples are operating options, not field research: teams can divide vacancies/date ranges/explicit ID lists; a coordinator can consolidate specialist/committee recommendations in approved tools before upload. Unresolved candidates remain outside the included set. Handoffs revalidate actual outcomes rather than inherit abandoned holds. Manager-only final approval is **not enforced** by shared HR eligibility; if required, it needs a separate authority decision. Frequent duplicate work in a large undivided pool would justify revisiting assignment, not pretending concurrency checks prevent duplicate preparation.

## Remaining gates / scope boundaries

- Q-SI: real migration/SQL/FK/transaction race/rollback validation; authenticated HTTP role/Origin/multipart/candidate-privacy checks; updated regression for changed review locks; manual export/edit/import/conflict/role-switch walkthrough. Isolated model/DOM checks are not these results.
- P0-S/B1-R/J readiness, manual release, failure categorization and confirmation/list/export/draft UI are implemented. The user reported release/correction/completion/locked-review working; real integration/privacy/race remainder stays Q-B1R/J. Durable interrupted-live attempt recovery is B4-S, not solved by screening/release.
- Notification remainder: submission/appointment/Pass/Offer/Hired and owner-finalization effects, broader candidate progress, explicit hide/lifetime, and historical-feed design. Screening notices alone are implemented; old interview retention unchanged.
- B1-P publication freeze and B1-F explicit zero-interview owner Offer are implemented, with partial user-reported progression/owner-only evidence in status. Import uses undecided eligibility, never a review-ready gate. Broader notifications remain unimplemented.
- Search/export tracking, regex, second file layout/JSON, causal receipts, claims/assignment and supervisor-only approval remain unimplemented. Further cards are not authorized by this checkpoint.
