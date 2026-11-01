# Integration verification and local fixtures
Current reading map: [index](../../README.md). Real PDF preparation and selected guarded Noul executor are described in [Jev safety](../jev-safety.md); legacy extraction-provider examples below are not the current application executor. Paid/gateway-limit tests require explicit consent and were not run.
Application check: `pnpm --filter @recruitment/api applications:check` after build/db:migrate. Real PostgreSQL/OTP/multipart, mocked mail, isolated private local storage, rollback cleanup and byte-identical downloads; deletes only disposable data. No auth bypass/live extraction. See [application contract](../contracts/application-api.md). Explicitly choose disabled live executor/fixture ports for integration runs; do not rely on ambient live configuration.

API payloads: [contracts](../contracts/api.md); current components/data flow: [architecture](../architecture.md). Adapter implementation is not live model-quality validation.

## What can be replaced now
| Boundary | Normal adapter | Mock/local alternative | What the alternative proves |
| --- | --- | --- | --- |
| `MailSender` | SMTP through Nodemailer, default local Mailpit | `MemoryMailSender` via Nest test override; `MAIL_DRIVER=file` private local capture | Business/auth code can request mail without SMTP credentials or any mailbox/provider account |
| `DocumentTextReader` / `TaskExecutor` | Disabled by default; PDF / guarded Jev available through explicit config | Trusted per-unit FixtureRegistry; can combine real PDF with fixture interpretation | Identity/hash/args/text relay, result/review/export; **not model quality** |
| Legacy `ExtractionProvider` | Disabled: explicit failure/null | `EXTRACTION_DRIVER=fixture`; recorded `FixtureExtractionProvider` | Adapter example only, not the current application path |
| Database | Shared PostgreSQL pool | Fake query/transaction collaborators in unit tests | Transaction/control flow, not SQL constraints/migrations/session persistence |
| Redis readiness | Bounded connectivity probe | Fake `ConnectivityProbe` in tests | Readiness branching, not actual Redis health or queue behavior |

REST itself stays real in auth integration checks. Authentication is **not** mocked: no fixed OTP, skip-login header, public capture endpoint, fabricated session, or demo staff escalation. Full OTP/session checks still require local PostgreSQL. This is deliberately different from unit tests, which need no running services.

## Checks without external accounts
Build first:
```sh
pnpm build
pnpm --filter @recruitment/api integrations:check
```
The second command uses only local fixtures: memory/file mail, recorded extraction including false/empty/null, configuration safety, fake transactions/probes, and Nest provider selection/overrides. No PostgreSQL, Redis, SMTP, Mailpit, AI network request, or provider login is required.

For real OTP/session/role behavior with captured mail and **PostgreSQL only**:
```sh
pnpm --filter @recruitment/api auth:mock-check
```
This uses the production HTTP wiring and a test-only in-memory sender. It reads codes internally, tests candidate/staff access and operator session revocation, and cleans only its own disposable user/buckets. It does not print codes/cookies or send mail. Redis and Mailpit need not be running for this check.

The original real local protocol checks remain separate:
```sh
MAIL_DRIVER=smtp pnpm --filter @recruitment/api auth:check
pnpm infra:check
```
These verify actual local SMTP/PostgreSQL/Mailpit and actual database/Redis connectivity; no company mail credentials are needed. `pnpm test` includes ordinary adapter tests, not the optional auth integration scripts.

## Manual sign-in without any SMTP server
In one terminal:
```sh
MAIL_DRIVER=file pnpm --filter @recruitment/api start
```
Request a code using the curl in [`backend-test.md`](backend-test.md). In another terminal:
```sh
MAIL_DRIVER=file pnpm --filter @recruitment/api mail:latest candidate@example.test
```
This **operator-local command deliberately displays the captured message/code**. Use that code in the normal sign-in endpoint. Expiry, attempts, role rules, cookies, and logout remain real. It is not proof of email ownership outside this controlled development setup.

- Outbox: ignored `.local/mail-outbox/`, directory 0700 and new message files 0600; latest message per address replaces the previous capture atomically.
- Captures say `development-capture`, are not sent, and may contain sensitive codes/contact data. Do not paste them into reports or commit/upload the outbox. A stale captured code remains invalid once expired/consumed.
- No global mail configuration, OAuth flow, or real mailbox access is needed. File mode ignores unused SMTP settings.
- `NODE_ENV=production` rejects file mode and extraction fixtures at startup. Memory mail is only a programmatic test override, not an environment-selectable runtime driver.
- Default `MAIL_DRIVER=smtp` preserves the existing Mailpit setup. SMTP credentials are optional, must be paired if used, and are isolated in the adapter; real production delivery/TLS/provider setup is not verified here.

## Extraction fixtures: exact limits
Legacy provider examples below remain adapter tests only. Application workflow uses context-dispatched DocumentTextReader/TaskExecutor with trusted fixture keys and actual identity/hash/args/text checks; processing:check exercises persistence/recovery/review/export. Default normal ports remain disabled; real PDF and guarded execution are described in [Jev safety](../jev-safety.md). No live model-quality verification. Registry records calls; no candidate fixture controls.
Legacy `EXTRACTION_DRIVER=disabled` returns a failed result with null and disabled provenance. Fixture mode records `provenance: {mode: "fixture", fixtureId: ...}` next to the extraction result union. The supplied legacy `demo-skills` example **ignores source text**, is not a selected extractor, and performs no model request. Application-processing fixtures separately verify frozen identities/hash/args/text. Unknown task keys fail instead of inventing values.

There is no extraction-trigger HTTP endpoint. ProcessingService runs through the explicit CLI and context ports. Legacy provider tests remain separate. Jev executor tests use a narrow offline decision-client stub, not the protected gateway; spending guards and live provider behavior remain untested.

## Processing boundaries
- Per-unit fixtures: trusted optional string `fixtureKey` follows processing/services to the selected unit. Defined means fixture lookup; absent means configured normal adapter (possibly disabled), not guaranteed live AI. Missing fixture fails; no automatic real-provider fallback. Do not accept candidate-controlled fixture instructions.
- Implemented workflow registry binds fixture keys to actual application/document/task identities and verifies bytes/hash/args/text relay, recording calls and preserving fixture provenance through storage/export. Legacy task-key-only adapter fixtures remain separate examples.
- Current seed/fixture commands create synthetic records and preserve existing/manual data. Tests clean only their owned data; HTTP/worker connections mean a single rollback transaction cannot isolate every scenario. Broader fixture/demo orchestration and scoped schema regeneration are [planned](../../plan/tasks.md), not a current reset command.
- Document storage: implemented local adapter/memory test override, separately verified ownership and private download boundaries.
- PDF preparation: real bounded text-native PDF reader merged into main, with multipage/limit/French-accent fixtures. DOCX/OCR not implemented; model quality and complex layout handling unverified.
- Processing implemented via explicit local command, saved per-task progress and application lease fencing/retry recovery. No run/history or independently queued work items. Cron/polling can later wrap the same executor. Original files persist, local reuse is disposable.

Do not implement or require accounts for these providers merely to test vacancy persistence. Keep fixture checks separate from optional real integration checks, and never infer real delivery/model quality from a mock passing.
