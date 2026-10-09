# Backend modules and next checkpoint

Implementation proposal, not a new set of approved product policies. Keep one NestJS application and one database; modules are business boundaries, not independently deployed services.

## Boundaries
| Module | Owns | Does not own |
| --- | --- | --- |
| Database | Connection lifecycle and repeatable application migrations | Recruitment rules; Better Auth schema definitions |
| Identity | Better Auth integration, current actor, role guards, staff provisioning | Candidate CVs, application eligibility |
| Vacancies | Draft/publish/close, responsible recruiter, input/task definition, public projection | Submitted answers, extraction execution |
| Applications | One application per candidate/vacancy, submitted snapshot, documents, stage, review values, CSV | Authentication credentials, automatic ranking |
| Processing | Per-document task grouping, execution state, extractor adapters, results/failures, bounded recovery | Changing recruitment decisions or candidate answers |
| Interviews | Editable interview records, assignments, schedule, attributable feedback | Fixed interview-number pipeline stages or automatic rejection |
| Communications | Explicit recipients/send actions, delivery state, candidate-visible updates | Sending on every interview edit |

Analytics can start as a small SQL query service over these records. Branding/settings and staff administration are bounded later endpoints, not reasons to introduce more infrastructure. Vacancy reference documents/templates remain deferred.

IdentityModule, DatabaseModule, ConfigurationModule, IntegrationsModule, InfrastructureModule, and HealthModule now implement the foundation boundaries. Business repositories must not depend on AuthService's pool. See [`architecture.md`](architecture.md) for current classes, future consistency fields/data flow/events, and [`integration-testing.md`](integration-testing.md) for replaceable protocol adapters. The feature modules in the table remain proposals.

## Implemented checkpoint: vacancies
**Scenario:** a recruiter saves a configured draft, reloads it, publishes it, and an unauthenticated candidate retrieves the job/application form without seeing backend tasks or internal metadata.

### Implemented API surface
Request/response examples are in [`vacancy-api.md`](vacancy-api.md). Implemented routes are documented in [`api.md`](api.md) and [`openapi.json`](openapi.json).
- `POST /api/vacancies`: create draft; creator is responsible recruiter initially.
- `GET /api/vacancies`: staff list, including drafts; bounded pagination.
- `GET /api/vacancies/:id`: staff detail with full definition.
- `PATCH /api/vacancies/:id`: update draft only.
- `POST /api/vacancies/:id/publish`: validate and lock published intake definition.
- `POST /api/vacancies/:id/close`: stop further intake; preserve existing records.
- `GET /api/public/vacancies`: only published/open records.
- `GET /api/public/vacancies/:id`: explicit public job/form projection, never raw private configuration.

Approved/implemented: admin/recruiter create/read; owner alone edits/publishes/closes. Interviewer/candidate denied staff routes. Collaborator editing/admin override deferred; final hiring decisions unaffected.

### Definition and persistence
- Persist vacancy metadata plus separate versioned form/processing definitions, saved/published together. Editor tasks remain associated with their source input through sourceInputId; separators yield no answers/tasks. Scheduling/cache/provider settings stay outside vacancy configuration.
- Runtime-validate the payload and allowed discriminated variants, not just TypeScript types. Reject duplicate field names, unsupported tasks/type combinations, invalid ranges, and oversized definitions.
- Keep processing metadata private. Derive a candidate-facing definition by allowlisting fields; do not delete a few known private keys from an otherwise raw object.
- Published intake definitions are immutable. A closed vacancy remains stored; cloning/reposting is a later explicit action, not a mutation of historical applications.
- Preset/type catalog can be code-defined initially. Do not create a template marketplace, arbitrary executable rules, or admin UI for changing every limit.
- Use parameterized queries and one repository per feature. Application migrations and auth migrations remain explicit commands; no automatic schema mutation on server startup.

### Checkpoint tests
1. Recruiter creates/updates/reloads a draft; anonymous caller and candidate cannot manage it.
2. Bad definitions receive useful validation errors without partial writes.
3. Drafts are inaccessible publicly; publish exposes only safe job/form data.
4. Private tasks, staff notes, and account fields never appear in public responses.
5. Published intake cannot be patched; closed vacancy is not presented as accepting applications.
6. Record persists across API restart; provide curl examples and update `api.md` before frontend work.

## Following checkpoints
1. **Submission + documents (implemented):** locked JSON by input ID, snapshots, uniqueness/close locks, optional constraints and bounded private storage. Admin/recruiter read-all, candidate read-own. See application-api.md. No saved drafts/extraction. Intake service currently queries shared DatabaseService directly; separate repository can follow shared processing/review query needs.
2. **Mock processing + review/export:** decoupled application-level executor, text reuse per document, individual task results/status and safe retry eligibility; no ProcessingRun/independent WorkItem tables initially. Per-unit fixture context verifies source/arguments through the real relay. Review means extraction inspection/correction, combined columns, CSV for external preselection. In-memory text reuse is enough initially; no full cache framework.
3. **Interviews + decisions:** dynamic interviews and assignments, staff schedule, notes, preselection and owner decisions. Resolve negative outcome labels at this boundary.
4. **Optional updates + analytics:** scope reconsidered after usable review/export. HR may communicate outside the platform; only OTP mail is currently automated. No mail/calendar integration required for the first workflow slice.
5. **Frontend:** implement the accepted editor and application/recruiter views from the tested API handoff, not in parallel with undefined contracts.

## Delegation rules
Database schema, migration ordering, and shared definition contracts need one owner. Once a contract exists, bounded tests or a separate feature module can be delegated. Do not have two agents simultaneously edit auth/bootstrap/shared schemas or mutate the same test accounts. Each checkpoint needs user test instructions, current API docs, and accurate status—not exhaustive API scaffolding for all future modules.
