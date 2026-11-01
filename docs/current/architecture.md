# Current responsibility and persistence map

One pnpm workspace, one Nest application, one PostgreSQL database; React/Vite frontend and shared domain package. File length understates complexity because much TS/JSX is compressed into long lines. This map describes actual source, not a framework proposal.

## Responsibilities (paths relative to repository root)

| Owner | Current responsibilities |
| --- | --- |
| `packages/domain/src/vacancies.ts` | Strict form/task definitions, source constraints, normalized skills and tri-state skill projection |
| `packages/domain/src/applications.ts` | Shared intake validation and operational upload limits |
| `packages/domain/src/index.ts` | Stage vocabulary and legacy generic extraction types; vocabulary does not own transitions |
| `apps/api/src/auth/`, `bootstrap.ts` | Better Auth lifecycle, trusted actor/roles/origin and bounded HTTP protocol bridge |
| `apps/api/src/database/` | Shared pool/transaction helper, explicit checksummed migrations |
| `apps/api/src/vacancies/` | Service owns draft/owner/publication policy, repository SQL and projections |
| `apps/api/src/applications/application.service.ts` | Submit transaction, file compensation, authorization, snapshot/list/detail/download SQL and projections |
| `apps/api/src/documents/` | Storage port/local adapter, opaque references, integrity-checked bytes, bounded multipart collection |
| `apps/api/src/processing/` | Service orchestration; repository leases/task state/review invalidation; typed ports, trusted fixtures, PDF child and guarded skills adapter; CLI invocation |
| `apps/api/src/review/review.service.ts` | Shared review SQL, separate corrections, effective projection, CSV column naming/serialization and snapshot export |
| `apps/api/src/interviews/interview.service.ts` | Request schemas, policy, locks/SQL, scheduling, progression, recipient selection, inbox reads/writes and projections |
| `apps/api/src/integrations/` | Mail protocol adapters, mandatory JevGateway, legacy ExtractionProvider still wired but not the application executor |
| `apps/web/src/` | Hash routing, form authoring/rendering, review/export, interview/workflow/inbox UI; many response models use `any`, role/stage guards partly repeat backend rules |

## Persistence and guarantees

Relational: vacancy owner/status/revision, application candidate/vacancy uniqueness, document ownership/storage metadata, task/correction identity, pipeline steps, interview assignment/uniqueness/composite foreign keys, notification recipient/read time.

JSONB: frozen candidate identity and vacancy/form/task snapshot; dynamic answers; task args/result/provenance; correction values; workflow causes. Corrections are relational rows keyed by application/task, not one unstructured review document. Runtime validation constrains dynamic values; TypeScript alone does not validate JSON from clients or stored rows.

Current business stage transitions are centralized in InterviewService, but action visibility and string vocabularies are not. Role guards protect routes; resource checks live in services. ReviewService relies on controller role protection (internal callers are trusted). Assigned document access is resolved in ApplicationService, with an additional InterviewController lookup.

## Transactions and external work

- Vacancy edits/publish/close lock the vacancy row. Intake acquires a candidate/vacancy advisory lock and a vacancy share lock, then inserts frozen content/doc references. Storage compensation retains files on ambiguous commit.
- Processing runs outside submission HTTP. Claims and saves use application-row locking and token/expiry fencing. Results invalidate completed review markers while retaining corrections. Source bytes/text reused in-memory within an invocation.
- Interview commands lock vacancy → application → interview, plus interviewer advisory locks for overlapping appointments. State, cancellations and notifications commit together. Typed causes originate in commands; SQL updates do not infer events.
- CSV uses a repeatable-read transaction, caps at 1,000 applications/10 MiB. No batch export ledger/import exists.
- Retention CLI runs once or daily with `--watch`; no extraction poller, event bus, job queue, outbox or persistent parser cache exists.

## Existing seams worth retaining

DocumentStorage, MailSender, DocumentTextReader/TaskExecutor and JevGateway separate external protocols from workflow code. `RuntimeConfig`, processing settings and gateway configuration remain distinct. Legacy `EXTRACTION_DRIVER` configures only the old ExtractionProvider, not application processing.

Implementation gaps and proposed local boundaries are in [changeability review](../plan/changeability.md). Preserve transactional guarantees when extracting functions/repositories; file splitting by itself does not localize policy changes.
