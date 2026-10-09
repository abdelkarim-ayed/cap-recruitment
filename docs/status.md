# Implementation status

## Current unit: persisted vacancy checkpoint
Implementation and local checkpoint commits are authorized. Remote creation/publishing remain deferred.

- Created plain pnpm workspace with `apps/web`, `apps/api`, `packages/domain`.
- Shared discriminated unions express document limits and extraction status/results. Failure value is null, separately distinguishable from successful false/empty.
- React shell connects to NestJS health API. No fabricated recruitment functionality.
- PostgreSQL/Redis/Mailpit are running and verified. `pnpm infra:check` passes against the actual stack: API readiness, database query, Redis ping, SMTP greeting, and Mailpit HTTP 200.
- Networking now explicitly uses host mode in `compose.yaml`, through `podman compose`, with localhost ports 55437/56379/51025/58025. Pasta override removed. User authorized Podman reset; old volumes were deleted. Standalone Redis persistence passed across fresh container recreation on the same named volume. All three actual service containers report network=host; `pnpm infra:check`, build, five tests, and typecheck pass after the change.
- Networking investigation is closed for current development; historical details are in `local-networking.md`. Do not reopen bridge/pasta while implementing features.
- `pnpm install`, `pnpm build`, `pnpm typecheck`, and `pnpm test` pass. Three domain tests, four API HTTP tests, and ten adapter/consistency tests cover the foundation; readiness failures return 503 without connection credentials. Bootstrap tests enforce auth body caps for content-length and chunked requests.
- Added minimal GitHub Actions install/build/test/typecheck workflow. It has not run on GitHub; no remote exists.
- API reference now includes concrete payloads/errors in [`api.md`](api.md), implemented-only [`openapi.json`](openapi.json), and separate [`vacancy-api-draft.md`](vacancy-api-draft.md) proposals. OpenAPI structure/references/examples validated; a one-off local check matched 21 real HTTP responses to the schemas, including session lookup, 429, 413, and readiness 503. This check is not an added CI test or proof of unimplemented vacancy behavior.
- Foundation now has explicit Identity/Database/Configuration/Integrations/Infrastructure/Health modules. MailSender supports SMTP, private file capture, and memory test override; disabled/fixture extraction carries provenance and does not process candidate documents. Production rejects capture/fixture modes. `auth:mock-check` verifies real PostgreSQL/OTP/sessions without SMTP/Mailpit; real SMTP `auth:check` and `infra:check` remain separate.
- Real auth also passed a one-off private-file capture check and a memory check with deliberately invalid unused SMTP settings; own captured messages were removed without touching other mail. Repeated `auth:migrate` succeeds; Better Auth reports a numeric/int8 introspection warning for `rateLimit.lastRequest`. No custom schema workaround was applied; auth/rate-limit checks remain functional.
- Workflow coverage and current/future classes, stable identifiers, transaction boundaries, and possible events are in [`architecture.md`](architecture.md); fixture setup is in [`integration-testing.md`](integration-testing.md). Application/interview workflows remain unimplemented; no worker/event bus was added. Vacancy backend is verified below, not graphical authoring UI.

## Vacancy implementation
- Implemented VacanciesModule/controller/service/repository, explicit checksummed application migrations, PostgreSQL persistence and separate form/task definitions. Owner-only edit/publish/close; admin/recruiter staff reads/creates, candidate/interviewer denied. Published/closed records locked; expected revisions and row locks prevent lost updates. Public list/detail expose only published job/form allowlists.
- Shared runtime schema lives at `packages/domain/src/vacancies.ts` (separate package subpath, no web-shell bundle increase). Supported inputs: text, long_text, number, yes_no, single_choice, multiple_choice, document, separator; extractSkills args/source association validated as configuration only. No live extraction, application uploads/submission, editor UI, templates or extra presets added.
- Cookie-authenticated Nest writes now require trusted Origin; no auth bypass. `pnpm test` passes 30 tests (11 domain, 19 API/adapter/service); build/typecheck pass. Real PostgreSQL `vacancies:check` verifies role/resource checks, invalid payload atomicity, concurrent edits, public privacy, publish/close and persistence across API/pool recreation. Repeated db:migrate and auth:mock-check pass. No remote CI or browser automation.
- Implemented handoff: [`vacancy-api.md`](vacancy-api.md), updated OpenAPI, manual/automated instructions in [`backend-test.md`](backend-test.md). Next: authenticated application submission and owned documents, then per-unit fixture processing; not the graphical editor yet.

## Next independent units, in dependency order
Latest discussion narrows the first feature slice: vacancies with separate form/task definitions, locked application submissions and storage references, then application-level per-unit mocked processing and extraction review/export. Separate ProcessingRun/queued WorkItem tables, persistent artifact caches, messaging/calendar integrations, and server-saved application drafts are not initial requirements. This is documented direction only; no feature code was added. See `architecture.md` and `integration-testing.md`.
The concrete proposed module/checkpoint boundaries are in `backend-modules.md`.
1. Identity/session/role foundation completed; resource ownership checks follow their vacancy/application modules.
2. Vacancy persistence/public contract completed; next authenticated application submission and application-specific documents. Graphical editor follows backend handoff.
3. Document-owned extraction tasks, per-document grouping, worker/recovery, review/export. Provider-independent task plan; no arbitrary filtering.
4. Application progression, editable interviews, assignments/notes, owner decisions.
5. Published updates, deliberate messaging, dashboard, repeatable demo and presentation.

A user-requested subagent verified rootless networking with isolated services and cleaned its temporary resources. Main session applied the result to the actual stack. Further delegation should use bounded independent units; shared interfaces and migrations need one owner.

## Open, not blockers for foundation
- Candidate-visible labels/withdrawal/correction policy remains proposed.
- Exact extraction methods are not selected; use fixtures only where clearly identified.
- BullMQ remains the prior direction, but user raised a simpler polling alternative. Do not claim a scheduler/worker exists yet. Group tasks per document and separate execution from provider batching.
- NO_LIMIT is a business configuration variant, not permission for unbounded HTTP bodies or storage use. Operational upload caps need safe defaults when uploads are implemented.

## Auth research
Better Auth documents direct PostgreSQL integration and email OTP automatic signup/reuse. The implementation uses its Web Request handler with bounded raw request bytes and the official Better Call Node response bridge, plus a small Nest role guard. No handcrafted JWT or community integration package is needed.

Sources:
- https://www.better-auth.com/docs/plugins/email-otp
- https://www.better-auth.com/docs/adapters/postgresql
- https://www.better-auth.com/docs/integrations/nestjs

## Auth implementation checkpoint
Better Auth PostgreSQL/email-OTP integration, explicit auth migration command, role-protected `/api/me` and `/api/staff/access`, and transactional operator staff provisioning are implemented. Real HTTP/PostgreSQL/Mailpit smoke test passes (precise wrong/used-code errors, safe signup role, actual provisioning/session revocation, fresh staff sign-in, staff authorization, unsupported OTP type, logout). Unique loopback peers isolate persistent test rate-limit buckets. Generated auth secret exists only in ignored `.env`; never print it. Backend API/handoff: `api.md`; user tests: `backend-test.md`. No frontend changes or screenshot/browser automation.
