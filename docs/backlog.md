# Deferred scope

Not a commitment or schedule. Reorder as requirements become clearer.

## Highest relevance after the central workflow
- Latest feedback priority: candidate-safe published progress and notifications (decide visibility/content before exposing internal stages/notes); candidate home/navigation; whether owners should also receive booking/change notices, beyond existing request/feedback notifications. Not included in the rushed staff UX patch.
- CSV decision reimport, including partial selection: stable application IDs, strict allowed actions, preview/errors, duplicate/stale/foreign-ID handling, explicit confirmation and transaction policy; bulk preselection after that contract. Current selection remains manual and export remains one-way. Do not claim reimport is implemented.
- Broader UX consistency pass: task-oriented landing pages, actionable unread counts, table/bulk selection and filtering, clearer owner capabilities in shared HR views. No redesign/component-library migration for the current checkpoint.
- Presentation-preparation feedback: review role versus resource-capability definitions (owner/assigned interviewer/shared HR), document a clear action/resource matrix and check backend enforcement against frontend affordances. Simplify noisy/non-intuitive components and navigation; assess targeted refactoring after the usability review, not an unapproved rewrite. No implementation included in presentation preparation.
- Additional editor presets (phone, availability, portfolio, cover letter/supporting document) and richer preset/task combinations: TODO only. The vacancy schema currently supports bounded generic inputs and document extractSkills configuration; graphical editor/presets are not integrated yet.
- Export hired applicants as CSV; depends on reliable final outcome data.
- Review-data CSV export is part of the chosen workflow once applications/extraction exist. Decision reimport is a later option requiring stable application IDs, validated actions, preview/confirmation, and audit; not selected yet.
- Email templates and selected-recipient/bulk sending; depends on communication audit and safe confirmation.
- Extended interview scorecards/panels/materials remain deferred; basic notes/optional score/Pass-Fail and assignment-scoped access are implemented (interview-api.md).
- Processing health/retry screen; depends on async state model.
- Google sign-in; depends on chosen auth library and OAuth app configuration.

## Optional intelligence
- Jev or compatible typed classifier; depends on question schema and evaluation examples.
- Semantic matching/pgvector; deferred alongside in-platform ranking, not current scope.
- Contextual helper: summarize an application or draft interview questions from gaps.
- Explicit auto-screening policies; outside current extraction-only scope, require new approval.
- OCR for scanned CVs; depends on a real supported-document need.

## Later integrations and optimization
- Internal documents attached to a specific vacancy (e.g. reschedule-message template, instructions, role briefing), so HR can open/copy/download them while communicating outside the platform. Deferred; these are staff resources, not candidate form fields or an automated email-template engine.
- Google Forms import with identity linkage; native intake comes first.
- Slack/Trello/calendar integrations; add only when they serve a selected scenario.
- Ranking/API caching with invalidation; no speculative Redis caching.
- Guest interviewer invitations and configurable approval chains.

## Excluded unless explicitly reopened
Employee management, marketplace recommendations, multi-tenancy, event sourcing, arbitrary workflow/form builders, raw database editor UI, custom model training, Elasticsearch, Kubernetes, and broad HR chatbot.
