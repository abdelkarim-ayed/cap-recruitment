# Current responsibility and persistence map

One pnpm workspace, one Nest application, one PostgreSQL database; React/Vite frontend and shared domain package. File length understates complexity because much TS/JSX is compressed into long lines. This map describes actual source, not a framework proposal.

## Responsibilities (paths relative to repository root)

| Owner | Current responsibilities |
| --- | --- |
| `packages/domain/src/vacancies.ts`, `extractors.ts`, `cv-extractor.ts` | Strict form/task definitions, CV question families, request construction, typed normalization and field corrections |
| `packages/domain/src/applications.ts` | Shared intake validation and operational upload limits |
| `packages/domain/src/index.ts` | Stage vocabulary and legacy generic extraction types; vocabulary does not own transitions |
| `packages/domain/src/actions.ts`, `workflow-views.ts` | Static role eligibility, action-availability contracts and shared typed response views; no trusted resource grants |
| `apps/api/src/auth/`, `bootstrap.ts` | Better Auth lifecycle, trusted actor/role/Origin, action-role guard and small policy→existing-error adapter; bounded HTTP protocol bridge |
| `apps/api/src/database/` | Shared pool/transaction helper, explicit checksummed migrations |
| `apps/api/src/vacancies/` | Service owns draft/owner/publication policy, repository SQL and projections |
| `apps/api/src/applications/application.service.ts` | Submit transaction, file compensation, authorization, snapshot/list/detail/download SQL and projections |
| `apps/api/src/documents/` | Storage port/local adapter, opaque references, integrity-checked bytes, bounded multipart collection |
| `apps/api/src/processing/` | Background runner and CLI; repository leases/task state; native PDF child; private preparation/response caches; guarded Jev execution and durable send-attempt coordination |
| `apps/api/src/review/review.service.ts` | Shared review SQL, separate corrections, effective projection, CSV column naming/serialization and snapshot export |
| `apps/api/src/interviews/interview.service.ts` | Request schemas, authority, locks/SQL, scheduling, progression, transactional notification persistence, inbox reads/writes and projections |
| `apps/api/src/interviews/interview-cause.ts`, `interview-notification.policy.ts` | Command-cause types and pure typed staff notification intents: recipients, deduplication, content and deliberate no-effect decisions; no DB/network work |
| `packages/domain/src/screening.ts`, API `interviews/screening*`, web `screening-import.tsx` | Bounded CSV contract/parser; scoped preview and atomic apply; transaction-owned individual/bulk screening closure/notice; wizard with fresh confirmation and preserved conflicts |
| `apps/api/src/integrations/` | Mail protocol adapters, mandatory JevGateway, legacy ExtractionProvider still wired but not the application executor |
| Feature `*.policy.ts` files | Pure scoped ownership/assignment/state decisions, reused for transactional command checks and advisory availability; business rules remain with their feature |
| `apps/web/src/` | Hash routing, form authoring/rendering, review/export and interview/workflow/inbox UI; action-bearing detail views typed, UI consumes server availability and shared coarse role map. `navigation-guard.tsx` keeps review drafts, vacancy drafts, interview plans, candidate applications and staged screening imports mounted until leave consent, integrates existing hash links/client redirects/sign-out and standard unload warnings; history stores only positions. Some list/dynamic editor models still use `any` |

## Persistence and guarantees

Relational: vacancy owner/status/revision, application candidate/vacancy uniqueness, document ownership/storage metadata, task/correction identity, pipeline steps, interview assignment/uniqueness/composite foreign keys, notification recipient/read time.

JSONB: frozen candidate identity and vacancy/form/task snapshot; dynamic answers; task args/result/provenance; correction values; workflow causes. Current CV corrections are relational rows keyed by application/task/question, not one unstructured review document. Runtime validation constrains dynamic values; TypeScript alone does not validate JSON from clients or stored rows.

Current business stage orchestration remains in InterviewService; scoped policy functions own its extracted prerequisites. SessionGuard resolves static action-role eligibility; service policies resolve current records, with revision/input/overlap checks kept separate. ReviewService retains its controller role boundary for trusted internal callers. Assigned document access is still resolved in ApplicationService, with an additional InterviewController lookup. See the [action inventory](contracts/action-policies.md) for exact current-versus-planned boundaries.

## Transactions and external work

- Vacancy edits/publish/close and interview-plan saves lock the same vacancy row. Publish lazily reads/validates saved plan content and its independent revision through the repository on that transaction. Publication status freezes plan editing; no plan row replacement/revision bump at publication. Intake uses candidate/vacancy advisory + vacancy share locks; storage compensation retains files on ambiguous commit.
- Processing runs outside submission HTTP; row locks/token/expiry plus stage/review eligibility fence closed work. Review completion/screening prevents late saves, without changing original results or claiming cancellation avoids external cost. Private file caches survive restart; durable send history blocks blind paid resends, with cache-only recovery after a known send. Recovery/race acceptance remains pending; see the [processing contract](contracts/processing-review-api.md).
- Interview commands lock vacancy → application → interview, plus interviewer advisory locks for overlapping appointments. State, cancellations and notifications commit together. Commands supply typed causes and loaded context to the pure staff notification policy, then persist its intents through the same transaction client; SQL updates do not infer events. There is no event bus or automatic mail coupling.
- CSV export uses repeatable read, 1,000 applications/10 MiB. Import locks vacancy then included applications in deterministic order, validates all before writing, and commits shared screening decisions/notices atomically. No export ledger, reservation, vote or assignment store. Schema through migration 010 has been applied locally; migration application is not functional acceptance.
- Retention CLI can run once or daily with `--watch`; it is separate from extraction. The explicitly enabled CV runner uses post-submit wake hints and five-second PostgreSQL discovery scans, with sequential work. No separate message broker, event bus or outbox is used.

## Existing seams worth retaining

DocumentStorage, MailSender, DocumentTextReader/TaskExecutor and JevGateway separate external protocols from workflow code. `RuntimeConfig`, processing settings and gateway configuration remain distinct. Legacy `EXTRACTION_DRIVER` configures only the old ExtractionProvider, not application processing.

Implementation gaps and proposed local boundaries are in [changeability review](../plan/changeability.md). Preserve transactional guarantees when extracting functions/repositories; file splitting by itself does not localize policy changes.
