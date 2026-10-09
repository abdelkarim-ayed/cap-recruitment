# API contract and module boundaries

Backend first. This document is the frontend handoff; distinguish implemented endpoints from planned ones. No browser/screenshot testing.

## Where to read
- **This file:** supported endpoints, exact payload examples, and HTTP behavior.
- **[`openapi.json`](openapi.json):** OpenAPI 3.1 for the implemented client-facing surface; import into an API client/viewer if desired. No Swagger server/UI is installed.
- **[`vacancy-api.md`](vacancy-api.md):** implemented vacancy payloads, supported field/task arguments, transitions, and permissions.
- **[`backend-test.md`](backend-test.md):** runnable curl/integration checks.
- **[`integration-testing.md`](integration-testing.md)** and **[`architecture.md`](architecture.md):** mockable protocols, current classes, data movement, and future consistency boundaries.

Examples below use fake IDs/tokens. Base URL: `http://localhost:3000/api`. Bodies are JSON; timestamps are ISO-8601 strings. Treat IDs as opaque strings. This is the supported handoff surface, not an exhaustive inventory of every inherited Better Auth endpoint.

## Implemented: identity and access
Better Auth owns codes, verification, session cookies, expiry, logout, and auth rate limiting. Nest's small guard asks Better Auth for a session and checks application roles. No custom JWT/signature implementation or third-party Nest auth adapter required.

Auth lives at `/api/auth`; application endpoints live at `/api`.

| Endpoint | Access | Behavior |
| --- | --- | --- |
| POST `/api/auth/email-otp/send-verification-otp` | Public | `{email, type: "sign-in"}` sends code; does not return it |
| POST `/api/auth/sign-in/email-otp` | Public | `{email, otp, name?}` verifies code and creates/reuses candidate account; sets session cookie |
| POST `/api/auth/sign-out` | Cookie if present | Send `{}`; clears cookie and invalidates session. Also succeeds without a session |
| GET `/api/auth/get-session` | Cookie if present | Library session/user object, or HTTP 200 with JSON `null` when signed out |
| GET `/api/auth/ok` | Public | Auth handler liveness: `{ok: true}` |
| GET `/api/me` | Session | `{user: {id, email, name, role}}`; no session token exposed |
| GET `/api/staff/access` | Admin/recruiter/interviewer | Confirms staff access; temporary handoff/smoke endpoint, not staff management |
| GET `/api/health` | Public | Liveness and agreed stage vocabulary |
| GET `/api/health/ready` | Public | Database/Redis readiness; 503 when unavailable, no credentials/errors exposed |

Roles: `admin`, `recruiter`, `interviewer`, `candidate`. Signup cannot set role. Staff accounts are currently provisioned only through a local operator command, not a public API. Per-vacancy/candidate/interview ownership checks belong in their modules and are not implemented yet.

## Implemented request and response shapes

### Request a code
`POST /auth/email-otp/send-verification-otp`
```json
{"email":"candidate@example.test","type":"sign-in"}
```
Both fields are required. Only `sign-in` is supported. Success **200**:
```json
{"success":true}
```
The code is never included in this response. SMTP mode sends mail (local Mailpit by default); development file mode only captures it privately. A 200 acknowledges the library request, not guaranteed delivery. Both use the same real code/session verification.

### Verify code / sign in
`POST /auth/sign-in/email-otp`
```json
{"email":"candidate@example.test","otp":"123456","name":"Demo Candidate"}
```
`email` and `otp` are required. `name` is optional and only initializes a new account; omitting it can create an empty name. The library also accepts an optional `image` string; our UI does not need it. Do not send `role`: it is not client-writable.

Success **200** sets the HTTP-only session cookie and returns:
```json
{
  "token":"EXAMPLE_ONLY_NOT_A_REAL_TOKEN",
  "user":{
    "id":"example-user-id",
    "email":"candidate@example.test",
    "name":"Demo Candidate",
    "emailVerified":true,
    "image":null,
    "createdAt":"2026-10-09T12:00:00.000Z",
    "updatedAt":"2026-10-09T12:00:00.000Z",
    "role":"candidate"
  }
}
```
`image` may be null/absent. The library's opaque `token` is sensitive, not a JWT for our frontend to manage. Use cookies; do not store/log the token or put it into URLs.

### Current application actor
`GET /me` has no body/query parameters. Success **200**:
```json
{"user":{"id":"example-user-id","email":"candidate@example.test","name":"Demo Candidate","role":"candidate"}}
```
This is the preferred small application identity response. Unlike the library login/session responses, it contains no token or timestamp metadata.

`GET /staff/access` returns the **same shape**, but only for admin/recruiter/interviewer. It is an access check, not a staff directory. Candidate gets 403; missing/invalid session gets 401.

### Library session lookup
`GET /auth/get-session` returns **200** with `null` when signed out. When signed in:
```json
{
  "session":{
    "id":"example-session-id",
    "userId":"example-user-id",
    "token":"EXAMPLE_ONLY_NOT_A_REAL_TOKEN",
    "expiresAt":"2026-10-16T12:00:00.000Z",
    "createdAt":"2026-10-09T12:00:00.000Z",
    "updatedAt":"2026-10-09T12:00:00.000Z",
    "ipAddress":"127.0.0.1",
    "userAgent":null
  },
  "user":{
    "id":"example-user-id",
    "email":"candidate@example.test",
    "name":"Demo Candidate",
    "emailVerified":true,
    "createdAt":"2026-10-09T12:00:00.000Z",
    "updatedAt":"2026-10-09T12:00:00.000Z",
    "role":"candidate"
  }
}
```
`ipAddress`/`userAgent` may be null/absent. Better Auth's client SDK uses this route; an ordinary application screen can use `/me` instead. These responses contain sensitive session material: do not log them.

### Sign out
`POST /auth/sign-out` with body `{}` and the current cookie. Success **200**:
```json
{"success":true}
```
Cookie-clearing headers are returned. It also succeeds without a valid session; it is not a route protected by our Nest role guard.

### Auth handler liveness
`GET /auth/ok`, no body/query, **200**:
```json
{"ok":true}
```
This checks the auth handler, not database/Redis readiness.

### Health
`GET /health`, no body/query, **200**:
```json
{"status":"ok","service":"recruitment-api","applicationStages":["received","review_ready","preselected","interview","offer","hired"]}
```
`GET /health/ready`, **200** when both dependencies respond:
```json
{"status":"ready","database":"ok","redis":"ok"}
```
Dependency failure is **503** with the actual dependency statuses (no `status` field):
```json
{"database":"unavailable","redis":"ok"}
```
These health routes do not create or change recruitment records.

## Errors and frontend handling

| Status | Scope | Meaning / example |
| --- | --- | --- |
| 400 | Auth | Invalid/used code: `{"code":"INVALID_OTP","message":"Invalid OTP"}`; expired code uses `OTP_EXPIRED` |
| 400 | Code request | Unsupported type: `{"code":"UNSUPPORTED_OTP_TYPE","message":"Only sign-in codes are supported."}` |
| 401 | `/me`, `/staff/access` | `{"message":"Sign in to continue.","error":"Unauthorized","statusCode":401}` |
| 403 | Staff access | `{"message":"This action requires a different role.","error":"Forbidden","statusCode":403}` |
| 403 | OTP verification | `TOO_MANY_ATTEMPTS` after the configured verification attempt limit; auth origin checks can also return 403 |
| 413 | Auth body >32 KiB | `{"code":"BODY_TOO_LARGE","message":"Request body is too large."}`; includes chunked requests |
| 429 | Auth | Library rate limit; body can contain only `message`. Current library sends `X-Retry-After` (seconds), not standard `Retry-After` |
| 500 | Unexpected failure | Do not interpret as bad code, rejection, or success; show retry/unavailable state |
| 503 | Readiness | Dependency-status object shown above |

Code verification attempts and HTTP rate limits are different controls. The email-OTP plugin allows three requests per socket peer/path in sixty seconds for both code-send and email-code sign-in; it overrides the library's generic sign-in rule. Other auth paths default to 100 per sixty seconds unless a more specific library rule applies. Frontend should handle actual 429 responses rather than maintaining a guessed independent counter. The retry header is readable through the same-origin proxy; direct cross-origin browser calls currently cannot read it because CORS does not expose it.

Auth errors usually include `{code, message}`; rate-limit errors may have only `message`. Inspect HTTP status first. Nest endpoints return standard Nest error responses with HTTP 401/403. Frontend must not assume both have identical envelopes.

## Session/origin contract
- Frontend uses `/api` through the Vite same-origin proxy, or sends cookies with `credentials: "include"` for direct cross-origin calls.
- Trusted web origin defaults to `http://localhost:5173`; configure WEB_ORIGIN for a different host/tunnel. Origin checks remain enabled.
- Codes expire after five minutes, have three verification attempts, and are hashed in storage. Used codes cannot sign in again.
- Sessions expire after seven days without rolling refresh; signing in again creates a fresh session. This avoids renewing database expiry without forwarding cookie updates through the role guard.
- Auth bodies are capped at 32 KiB; general JSON at 256 KiB. Multipart intake has a separate guarded path: 10 MiB/file, 25 MiB combined, 256 KiB answers. See [`application-api.md`](application-api.md).
- Code-send HTTP success means the library accepted the request, not proof of delivery: Better Auth logs callback failures without necessarily failing the HTTP response. Local smoke checks verify actual Mailpit delivery; production mail failure visibility is later work. Non-sign-in OTP types are rejected before the callback.
- MailSender isolates delivery: SMTP defaults to local Mailpit; optional file capture needs no SMTP. Tests can inject memory capture. Production rejects development file capture/AI fixtures, and no auth-bypass endpoint was added. See `integration-testing.md`. Production mail credentials/provider are not configured.
- Role cache is disabled so server-side changes are read from the database.
- Rate limiting takes the socket peer address, via an internal overwritten header. Behind Vite or an SSH proxy users may share a bucket; trusted reverse-proxy client-IP handling is deployment work. Never trust arbitrary forwarded headers.
- The API defaults to binding localhost; API_HOST can be explicitly changed for a deliberate deployment configuration.

## Vacancy handoff and remaining modules
Vacancy routes are now implemented: POST/GET `/api/vacancies`, GET/PATCH `/api/vacancies/:id`, POST publish/close actions, and GET public vacancy list/detail. See [`vacancy-api.md`](vacancy-api.md). Admin/recruiter read/create; owner alone mutates. Cookie-authenticated application writes require trusted Origin (WEB_ORIGIN or BETTER_AUTH_URL origin); missing/untrusted Origin returns 403. Public reads require no session. Definition configuration is not task execution.

Application submission/list/detail/private downloads are implemented in [`application-api.md`](application-api.md). All admin/recruiter staff read; candidates read own only; answers/files locked for everyone. No profile CV or public file URLs.

Remaining feature endpoints—not implemented:
3. **Processing/review/export:** per-document task plan, suggestions/errors, human corrections, CSV. Extraction failure is null plus explicit status; no automatic selection.
4. **Interviews/decisions:** dynamic interview CRUD/assignment/notes, schedule, preselection and owner decisions. No fixed interview-number pipeline stages.
5. **Communication/analytics:** selected-recipient sending, published candidate updates, SQL metrics. No automatic email for every interview edit.

Module names describe business boundaries, not microservices. Shared migrations/interfaces have one owner; independent work can follow a written endpoint contract.

See vacancy/application references and backend-modules.md for next checkpoints. Identity/access, health, vacancy and locked application/document routes are implemented; processing/interview routes are not.
