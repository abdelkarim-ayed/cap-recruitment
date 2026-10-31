# Workflow scenarios

Concise execution guide, not a full UML specification. Approved direction is marked separately from unresolved details.
Latest requested changes are tracked separately in [product-checkpoint.md](product-checkpoint.md); they do not silently replace current workflow contracts.

## Application progression
Current internal recruitment path: Received → Preselected → Interview → Offer → Hired, with terminal Not selected where permitted. “Review-ready” is a conceptual processing milestone, not a separately implemented automatic recruitment stage.

- Received: submitted application persisted; background tasks may be pending/running.
- Review-ready: conceptual processing milestone, not currently auto-advanced by the mock command. HR review is optional extraction cleanup; failed/unreviewed fields export with null/status/provenance. Review completion never gates export or means candidate approval.
- Preselected: HR chose to proceed after internal or external review.
- Interview: scheduled instances of owner-defined steps, not one numbered recruitment stage per interview. Schedules may change under policy; final feedback is immutable.
- Offer/Hired: owner records these business decisions.

HR Not selected is implemented with authority/reason/cancellation rules in interview-api.md. Candidate withdrawal and offer decline remain distinct, deferred decisions; do not relabel HR rejection as candidate withdrawal. No automatic rejection based on extraction.

## Scenarios
1. **Prepare vacancy:** responsible recruiter configures generic questions/separators, document inputs and linked skills tasks. Preview is candidate-facing. Draft editing and published intake locking are implemented; richer premade catalog/cloning remain deferred. Pipeline is currently separate; a publish-time pipeline prerequisite is requested but not implemented (product-checkpoint.md).
2. **Apply:** candidate verifies email, fills the generated form, attaches a vacancy-specific CV/documents, corrects data before submission, and submits once. Account is primarily login/contact identity, not a reusable CV profile.
3. **Process:** persisted application remains Received; explicit CLI processes frozen tasks and saves attributable results/errors. No extraction daemon is registered and completion does not advance recruitment stage. This branch has real PDF preparation and guarded experimental/unselected Jev execution; defaults disabled, no live verification. See jev-gateway-handoff.md. Manual/failure paths must not invent results or bypass spending controls.
4. **Review/export:** HR sees candidate answers, extraction and separate corrections; exports stable IDs/columns without a completion gate. External Excel/scripts can help select candidates. HR records preselection/not-selection manually. Bulk UI selection and repeated subset import are requested targets, not implemented (product-checkpoint.md).
5. **Interview (implemented bounded checkpoint):** owner defines vacancy-level steps before scheduling. HR schedules/reschedules/cancels one instance per application/step, assigns an existing staff interviewer, date/time/duration/link or location. Interviewer sees agenda and assigned candidate answers/CV, requests rescheduling or submits final notes/optional score/Pass-Fail. Fail now **ends the application and cancels every other unfinished interview**; Pass is not acceptance. No reopening/removal/retries or supporting interview attachments. See interview-api.md.
6. **Communicate:** internal inbox now records assignment/schedule/cancellation, reschedule requests and submitted feedback for relevant staff only. Seven-day-after-read retention; unread retained. No automatic email on scheduling edits. Selected-recipient email, candidate updates, chat and timed reminders remain deferred.
7. **Decide:** vacancy owner records Offer/Hired or a negative outcome. Candidate-facing updates remain distinct from internal status. Exact labels/publication and admin override remain open.
8. **Candidate access:** candidate signs in to see their own submitted applications and receipt. Business-stage publication is not implemented; internal tasks/notes/evaluations remain inaccessible. Withdrawal/later-answer-correction policy remains deferred.

## Interface priority
Current application table, interview list/calendar or agenda, editable interview details, and selected-recipient communications matter more than a detailed history UI. A lightweight record of actor/time/important changes may support support/debugging; no event sourcing or obligatory audit timeline.
