# Decisions

## Confirmed
- Product is recruitment management for a company, separately deployable and brandable; no multi-tenancy or employee tracking.
- Candidate has at most one application per vacancy; reposts are separate vacancies.
- Candidate access is email-code-first, automatically creating/reusing an account before completing the application; no password registration. Google sign-in is deferred. See `candidate-access.md`.
- React with Vite is acceptable; NestJS/TypeScript and PostgreSQL are the agreed direction.
- Redis/BullMQ is justified for asynchronous CV processing. General caching is deferred.
- Current AI/NLP scope is reviewable extraction of HR-selected facts. Automated filtering/ranking is moved outside the platform to spreadsheets/scripts; exact extraction providers remain open. This changes coverage of the original automated-ranking requirement and must be acknowledged before final presentation.
- Interview notes/assessments should be attributable and readable by the recruitment team.
- Neutral documentation stays public; sensitive context and disposable drafts are ignored under `docs/.ignore/`.
- Plain pnpm monorepo and small understandable CI are the direction, not complexity for appearance.
- One responsible-recruiter vacancy owner, collaborative recruiters, assigned interviewers, and owner finalization are approved in principle. Admin override remains to be settled.
- Recruiter allocation to batches/applicants can be agreed outside the platform; no assignment workflow is required initially.
- Local Git repository on `main`; checkpoint commits are authorized. Publishing remains deferred; no backdating or remote creation.
- Protocol dependencies are replaceable at module boundaries: SMTP/file/memory mail, disabled/explicit extraction fixtures, fake database/probe collaborators in unit tests. Keep real OTP/session verification; no mock-login endpoint or live-AI claims. Component/data consistency proposals: `architecture.md`; working fixture modes: `integration-testing.md`.
- Responsible recruiter owns the vacancy and records final decisions. Hiring-manager capability may be performed by the same person; a separate role/approval hierarchy is not required initially.
- Vacancy setup combines job description, reusable contact fields, typed application questions, document requests, and extraction tasks. Custom fields are desired; exact supported first types and extractors remain open.
- Manual review/correction is always available. Do not implement automatic qualification, filtering, or formula scoring in the current scope.
- Internal staff can add notes/supporting material beyond the candidate's application form. Access and publication boundaries must keep internal material private.
- Intake is hybrid: explicit candidate answers where useful, with extraction reducing repetition where practical. CV-first is not mandatory. Preserve answers and extracted values separately for review/export.
- Previously discussed meets/does not meet/unsure qualification outcomes are superseded for current scope by extraction-only results. Factual typed classification remains an extraction option; qualification policy is external.
- Prefer custom domain authoring over Ginkgo's generic builder: ordered inputs each own type arguments and compatible optional processing tasks with their own arguments. CV extraction belongs to the CV input; candidate form and backend plan derive from the definition. Groups can be deferred.
- Custom-editor spike is accepted as the real application's authoring direction, with singleton standard-field toggle chips, a richer premade catalog, properly labeled uploads, and display-only separators. See `vacancy-form.md`.
- Main application progression: Received → Review-ready (background tasks complete, export available) → Preselected → Interview → Offer → Hired. Multiple interviews are records within Interview, not fixed stages or automatic rejection triggers.
- Extraction failure returns null rather than inventing a fact. Processing status remains separate; successful false/empty is distinguishable from failure.
- Prefer TypeScript discriminated unions/exhaustive handling for well-defined variants. Business document limits may start with NO_LIMIT and extend later; transport/storage safeguards are independent.
- Tasks should be grouped per source CV/document to reuse text extraction and combine compatible operations. Provider batching is an execution optimization, not a candidate-form feature.
- Candidate account is lightweight identity/contact information. CVs and supporting documents belong to individual applications, allowing vacancy-specific submissions.
- Prioritize current tables/schedule and editable interview details over full history UI. Communications should be deliberate, including selected-recipient messaging, rather than email automatically triggered by every scheduling edit.

## Proposed, not locked
- Operational dashboard limited to processing/notification health; no raw database editing interface.
- Live extraction provider catalog (`rules` or external provider) remains unselected. Disabled/fixture adapter modes are implemented; persistence of result provenance follows the processing module.
- Bounded retries plus reconciliation of processing state; no event sourcing.
- User prefers no published-vacancy editing. Recommended policy: drafts editable, published intake schema locked, clone for a new vacancy; final metadata/closing rules remain open.
- BullMQ/Redis was previously agreed, but a database polling/cron alternative is now open for comparison. Redis compose service is available for evaluation; worker architecture is not locked by this scaffold.

## Verified local infrastructure choice
User selects explicit host networking after repeated bridge failures; replaces the earlier pasta workaround. Use `podman compose`, localhost service ports, no `ports:` mappings or DNS assumptions. User authorized reset of Podman state; completed. Named-volume Redis persistence was verified independently of Compose. See `local-networking.md`; do not silently revisit networking while building product features.

## Implemented technical choices
Review is optional extraction cleanup, not candidate approval/export gate. Admin/recruiter edit separate extraction corrections and shared pending/in_review/completed marker; candidate/interviewer denied. Unreviewed/failed fields export as unavailable with statuses/provenance. All answers/files immutable. Mock-only local command, global disabled normal ports plus trusted per-unit fixture context; no live AI. See processing-review-api.md.
Application checkpoint: one file per document input; accept/business limit optional, omission unrestricted subject to 10 MiB/file and 25 MiB combined caps. All admin/recruiter staff read all applications/documents; no allowed-HR registry yet. Candidate read-own, interviewer denied. Answers/files immutable for everyone. IDs key answers; names remain export labels. Private local storage behind DocumentStorage; no content safety guarantee. See application-api.md.
Vacancy checkpoint: admin/recruiter create/read staff records; creator alone edits/publishes/closes. No collaborator editing or admin override. Shared strict runtime catalog/args, separate atomically stored definitions, UUID records, revision/row-lock concurrency and safe public projection. extractSkills configuration is accepted, but no task execution/live model. Explicit application migrations with checksum ledger; no startup schema changes. Additional presets are backlog only. See `vacancy-api.md`.
First-slice direction now implemented: separated definitions, locked intake/storage ownership, mock application-level execution with individual results/recovery, optional extraction corrections and combined ungated CSV. No ProcessingRun/WorkItem queue or live AI. Trusted per-unit fixture dispatch exists; broader guarded seed/reset helpers remain planned. Messaging/calendar and interview progression deferred. See processing-review-api.md.
Better Auth with direct PostgreSQL and email-OTP plugin. Bounded raw auth bodies are passed to its Web Request handler; Better Call's official Node response bridge forwards cookies/responses. Nest guard handles roles through library-validated sessions. Avoids custom JWT and an extra community adapter. Seven-day sessions use absolute expiry (no rolling refresh). Staff role is non-user-writable; operator provisioning transactionally changes role and revokes sessions. Auth migration uses the library's schema tooling explicitly, not automatic schema changes on every server start.

## Change notes
- Redis/BullMQ moved from deferred to agreed because CV ingestion is explicitly asynchronous and requires retries/visibility.
- Product scope expanded from internal-only recommendation to limited public candidate intake/access.
- Fixed calendar build plans were rejected; use workflow checkpoints instead.
- Scope narrowed from automatic screening/ranking to extraction and human review/export; do not retain prior filtering proposals as current requirements.
