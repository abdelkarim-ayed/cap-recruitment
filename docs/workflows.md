# Workflow scenarios

Concise execution guide, not a full UML specification. Approved direction is marked separately from unresolved details.

## Application progression
Agreed main stages: Received → Review-ready → Preselected → Interview → Offer → Hired.

- Received: submitted application persisted; background tasks may be pending/running.
- Review-ready: conceptual processing milestone, not currently auto-advanced by the mock command. HR review is optional extraction cleanup; failed/unreviewed fields export with null/status/provenance. Review completion never gates export or means candidate approval.
- Preselected: HR chose to proceed after internal or external review.
- Interview: one or more editable interview records, not one pipeline stage per interview.
- Offer/Hired: owner records these business decisions.

Not-selected, candidate withdrawal, and offer decline need distinct outcome semantics. User prefers Withdrawn to Refused; clarify whose action the label describes before fixing outcome names. No automatic rejection based on extraction.

## Scenarios
1. **Prepare vacancy:** responsible recruiter describes the role, toggles premade fields, adds questions/separators, and configures document-owned extraction tasks. Preview shows only candidate-facing content. User prefers not to edit published vacancies; proposed policy is editable drafts, locked published intake schema, cloning for a new offer.
2. **Apply:** candidate verifies email, fills the generated form, attaches a vacancy-specific CV/documents, corrects data before submission, and submits once. Account is primarily login/contact identity, not a reusable CV profile.
3. **Process:** persisted application is Received; worker handles configured tasks and saves attributable suggestions/errors. Successful completion reaches Review-ready. Manual/failure path must not strand the application or invent results.
4. **Review/export:** HR sees candidate answers, extracted suggestions, and reviewed facts; corrects values and exports stable application IDs/columns. External Excel/scripts can help select candidates. HR records preselection/not-selection in the platform; automated decision import is deferred.
5. **Interview:** recruiter creates/edits/cancels/removes interview records, assigns interviewers, and sets date/time/type/link. Interviewers see their schedule and assigned candidate details, then add notes/recommendations/material. A failed interview does not automatically reject the application.
6. **Communicate:** HR selects applications, previews a message/recipients, and sends deliberately. Scheduling edits should not automatically send email. Automatic receipt confirmation is separate from discretionary HR messages; exact initial email scope remains open.
7. **Decide:** vacancy owner records Offer/Hired or a negative outcome. Candidate-facing updates remain distinct from internal status. Exact labels/publication and admin override remain open.
8. **Candidate access:** candidate signs in to see their own submitted applications and published updates. Other applications, internal tasks/notes, and interview evaluations are inaccessible. Withdrawal/correction policy remains to be finalized.

## Interface priority
Current application table, interview list/calendar or agenda, editable interview details, and selected-recipient communications matter more than a detailed history UI. A lightweight record of actor/time/important changes may support support/debugging; no event sourcing or obligatory audit timeline.
