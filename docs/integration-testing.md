# Replaceable protocols and local fixtures

Implemented boundaries, not live AI functionality. API payloads remain in [`api.md`](api.md); component/data-flow details are in [`architecture.md`](architecture.md).

## What can be replaced now
| Boundary | Normal adapter | Mock/local alternative | What the alternative proves |
| --- | --- | --- | --- |
| `MailSender` | SMTP through Nodemailer, default local Mailpit | `MemoryMailSender` via Nest test override; `MAIL_DRIVER=file` private local capture | Business/auth code can request mail without SMTP credentials or any mailbox/provider account |
| `ExtractionProvider` | Disabled: explicit failure/null | `EXTRACTION_DRIVER=fixture`; recorded `FixtureExtractionProvider` | Typed result/provenance and failure handling; **not parsing quality or model accuracy** |
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
Default `EXTRACTION_DRIVER=disabled` returns a failed result with null and disabled provenance. Fixture mode records `provenance: {mode: "fixture", fixtureId: ...}` next to the existing extraction result union. The supplied `demo-skills` fixture is a fixed example; it **ignores source text**, is not a selected first extractor, and performs no model request. Unknown task keys fail instead of inventing values.

There is no extraction HTTP endpoint or document-processing workflow yet. Tests call the provider directly; future ProcessingService will depend on this port rather than a vendor SDK. A live adapter will need approved task/result contracts, operational timeout/retry/error mapping, provenance, and evaluation examples before it can replace the fixture honestly.

## Future protocol boundaries—not implemented
- Per-unit fixtures: trusted optional string `fixtureKey` follows processing/services to the selected unit. Defined means fixture lookup; absent means configured normal adapter (possibly disabled), not guaranteed live AI. Missing fixture fails; no automatic real-provider fallback. Do not accept candidate-controlled fixture instructions.
- The registry binds logical aliases to actual document/task identities and verifies source hashes and task arguments before returning recorded results. Record calls and assert that distinct applicants/documents/arguments are relayed correctly; preserve fixture provenance through persistence/export. Current task-key-only fixtures do not yet implement this relay validation.
- Reusable script helpers: seed logical entities/files, resolve aliases, read records, assert properties, and clean owned datasets. Optional reset is restricted to an explicitly verified dedicated test database and known tables, never the normal development database. HTTP/worker connections mean a single rollback transaction cannot isolate every scenario. Central loaders evolve with schema; scenarios should not require repeated bespoke SQL.
- Document storage: local/memory adapters once upload/ownership contract exists.
- PDF/DOCX parsing: text-reader port with small file fixtures; unsupported/OCR failures explicit.
- Processing: application-level execution with individual saved task progress first; no separate run/history table or independently queued work items required. Cron/polling can later retry eligible failures/reclaim interruptions; catch-and-ignore is not recovery. Original files persist; extracted-text caching can remain in-memory initially.

Do not implement or require accounts for these providers merely to test vacancy persistence. Keep fixture checks separate from optional real integration checks, and never infer real delivery/model quality from a mock passing.
