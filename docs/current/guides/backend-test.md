# Backend verification: password accounts and legacy OTP

Current manual login/signup/reset: [demo-guide.md](demo-guide.md). Password integration: auth:password-check. Older OTP examples below remain supported regression paths, not the current UI login.

No frontend changes. Requires running host-network infrastructure.

Read [API](../contracts/api.md) for payload/error shapes or import [OpenAPI](../contracts/openapi.json) into an API client. The specification is a repository file, not a hosted Swagger UI; known schema gaps are in [status](../status.md#contract-gaps). [Vacancy payloads](../contracts/vacancy-api.md) describe implemented endpoints.

```sh
pnpm build
pnpm --filter @recruitment/api auth:migrate
pnpm --filter @recruitment/api auth:check
```

The last command runs real HTTP/database/local-mail tests with a disposable account: incorrect code, successful sign-in, cookie session, role-injection prevention, candidate denied staff access, actual staff provisioning command/session revocation, new staff sign-in, code reuse rejection, unsupported OTP type, logout. It uses unique loopback peers to isolate persistent rate-limit buckets without disabling protections, then deletes only its own user/messages/buckets. Immediate reruns are supported on this Linux container. Wrong/used-code checks assert `INVALID_OTP`, not just any error status.

`pnpm test` runs ordinary domain/API/storage/fixture/CSV and frontend DOM tests without external services; recorded counts belong in [status](../status.md). No real browser automation. PostgreSQL checks remain separate; expected unavailable-database tests may log Better Auth errors. Password flow: `pnpm --filter @recruitment/api auth:password-check` (real PostgreSQL, memory mail, no auth bypass). Legacy auth regression: auth:mock-check. Processing/review: processing:check. Interviews: `pnpm --filter @recruitment/api interviews:check` verifies real sessions, pipeline/scheduling/scoped documents/terminal outcomes/concurrent conflicts/inbox/retention/persistence. Manual UI/passwords: [demo guide](demo-guide.md).

For credentials-free protocol tests and full real auth with in-memory mail, see [`integration-testing.md`](integration-testing.md): `integrations:check` needs no running services; `auth:mock-check` needs PostgreSQL only. Manual file capture also avoids any SMTP server/account; OTP/session checks remain real.

## Manual test
Start the API in one terminal:
```sh
pnpm --filter @recruitment/api start
```

Request a code in another:
```sh
curl -i http://localhost:3000/api/auth/email-otp/send-verification-otp \
  -H 'Content-Type: application/json' -H 'Origin: http://localhost:5173' \
  --data '{"email":"candidate@example.test","type":"sign-in"}'
```

Open Mailpit through your existing tunnel at port **58025**. Read that email's code; no screenshots needed. Then substitute it below:
```sh
curl -i -c /tmp/opencode/recruitment-cookies.txt \
  http://localhost:3000/api/auth/sign-in/email-otp \
  -H 'Content-Type: application/json' -H 'Origin: http://localhost:5173' \
  --data '{"email":"candidate@example.test","otp":"REPLACE_CODE","name":"Demo Candidate"}'
curl -i -b /tmp/opencode/recruitment-cookies.txt http://localhost:3000/api/me
curl -i -b /tmp/opencode/recruitment-cookies.txt http://localhost:3000/api/staff/access
```

Expect login/me 200, staff access **403**. Without cookies, me is **401**.

To create a local staff account:
```sh
pnpm --filter @recruitment/api staff:provision recruiter@example.test recruiter "Demo Recruiter"
```
Verify its email using the same flow; staff access should be 200. Provisioning does not mark email verified. Changing role revokes existing sessions, so sign in again.

Report endpoint, HTTP status, sanitized response/error, and relevant API console output. Do not paste OTPs, session cookies, .env contents, or credentials.

## Vacancy checkpoint
Application intake/storage is implemented too: see [application contract](../contracts/application-api.md) for multipart curl instructions and `pnpm --filter @recruitment/api applications:check`. This verifies real OTP/session, uploads, authorization, concurrent duplicates, rollback cleanup and API restart using disposable fixtures. No UI/AI testing implied.
```sh
pnpm build
pnpm --filter @recruitment/api auth:migrate
pnpm --filter @recruitment/api db:migrate
pnpm --filter @recruitment/api vacancies:check
```
Application migrations have a checksummed ledger/transaction lock, are repeatable, and never run on startup. Run auth migration first on a new database. The last command requires PostgreSQL only, injects in-memory mail, signs in disposable recruiter/admin/candidate/interviewer actors using real OTP, verifies validation/no partial writes, owner/origin checks, concurrent revision conflicts, publish/lock, public projections, persistence across API/pool recreation, and close. It deletes only its own vacancies/users/rate-limit buckets, never resets tables.

### Manual recruiter test
Provision/sign in as a recruiter using the auth instructions above; save its cookie jar. Copy the create body from [vacancy contract](../contracts/vacancy-api.md) into a local JSON file (no real candidate data). Example, using your file path:
```sh
curl -i -b /tmp/opencode/recruitment-cookies.txt http://localhost:3000/api/vacancies \
  -H 'Origin: http://localhost:5173' -H 'Content-Type: application/json' \
  --data-binary @/tmp/opencode/vacancy-request.json
```
Expect 201 and a UUID/revision 1. Draft public detail is 404. Substitute that UUID below:
```sh
curl -i -b /tmp/opencode/recruitment-cookies.txt http://localhost:3000/api/vacancies/REPLACE_UUID/publish \
  -H 'Origin: http://localhost:5173' -H 'Content-Type: application/json' --data '{"expectedRevision":1}'
curl -i http://localhost:3000/api/public/vacancies/REPLACE_UUID
curl -i -b /tmp/opencode/recruitment-cookies.txt http://localhost:3000/api/vacancies/REPLACE_UUID/close \
  -H 'Origin: http://localhost:5173' -H 'Content-Type: application/json' --data '{"expectedRevision":2}'
```
Publish: 200/revision 2, only public job/form fields visible. Closed public detail: 404. Published PATCH or stale revision: 409. Another admin/recruiter may read but cannot mutate (403). This does not submit an application or run extraction. Report sanitized results; keep backend-first/manual testing.
