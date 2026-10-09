# Backend checkpoint: email-code auth

No frontend changes. Requires running host-network infrastructure.

Read [`api.md`](api.md) for payload/error shapes or import [`openapi.json`](openapi.json) into an API client. The specification is a repository file, not a hosted Swagger UI. Vacancy payloads are separate proposals in [`vacancy-api-draft.md`](vacancy-api-draft.md), not runnable endpoints.

```sh
pnpm build
pnpm --filter @recruitment/api auth:migrate
pnpm --filter @recruitment/api auth:check
```

The last command runs real HTTP/database/local-mail tests with a disposable account: incorrect code, successful sign-in, cookie session, role-injection prevention, candidate denied staff access, actual staff provisioning command/session revocation, new staff sign-in, code reuse rejection, unsupported OTP type, logout. It uses unique loopback peers to isolate persistent rate-limit buckets without disabling protections, then deletes only its own user/messages/buckets. Immediate reruns are supported on this Linux container. Wrong/used-code checks assert `INVALID_OTP`, not just any error status.

`pnpm test` runs 17 domain/API/adapter tests without needing running external services, including real bootstrap body caps, anonymous role guards, mail/extraction fixtures, transaction failure/release, and a stalled Redis-protocol fixture. An intentional unavailable-database case can emit a Better Auth schema-check error log; the expected readiness HTTP outcome is 503. CI runs these tests, not the PostgreSQL/Mailpit auth integration check.

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
