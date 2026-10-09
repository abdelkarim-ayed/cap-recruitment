# Deferred scope

Not a commitment or schedule. Reorder as requirements become clearer.

## Highest relevance after the central workflow
- Additional editor presets (phone, availability, portfolio, cover letter/supporting document) and richer preset/task combinations: TODO only. The vacancy schema currently supports bounded generic inputs and document extractSkills configuration; graphical editor/presets are not integrated yet.
- Export hired applicants as CSV; depends on reliable final outcome data.
- Review-data CSV export is part of the chosen workflow once applications/extraction exist. Decision reimport is a later option requiring stable application IDs, validated actions, preview/confirmation, and audit; not selected yet.
- Email templates and selected-recipient/bulk sending; depends on communication audit and safe confirmation.
- Interview scorecards and assignment-scoped interviewer access; depends on authority model.
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
