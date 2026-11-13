# CAP / recruitment demo — launch

## Running session

- UI: **http://localhost:5173**; API: localhost:3000.
- Checkout `/home/ubuntu/cv-offline-demo`, branch `feat/cv-offline-demo` (historical
  branch name). Fixes are separately committed; **not merged/pushed**.
- RMUX: `workspace:backend` / `workspace:frontend`. Attach:
  `rmux attach-session -t workspace`. Leave services alive.
- Backend PID at this launch: **164375**; credentials start empty after restart.
- **New synthetic submissions use real Jev**, not declared answers. Scope starts
  at **2026-11-13T06:10:10.423Z**. Historical pending/failed/completed records are
  not drained or rerun. Reuse this fixed boundary when restarting this cohort.
- The earlier seeded examples contain labelled declared snapshots for navigation;
  those are not real-provider observations. New live results retain `mode:live`.
- Private environment/documents/mail/cache reuse `/home/ubuntu/code` through
  `RECRUITMENT_RUNTIME_ROOT`; nothing secret is copied into Git.

### Load/rotate the running backend's key

From any directory, as the same OS user:

```sh
node /home/ubuntu/cv-offline-demo/apps/api/dist/integrations/jev/jev-key-cli.js set
```

The hidden prompt targets **the single backend**, no PID required. Replace `set`
with `status` or `clear` if needed. Optional `--pid 164375` verifies an expected
backend PID; a mismatch refuses the operation. Never put a key in arguments, chat,
files or an environment variable. The agent does not read/load keys.

Loading a key does not probe Jev or switch modes. **Here the live runner is already
explicitly enabled**, so the next 5s scan may process eligible new synthetic
submissions once the key is loaded. Submit only agreed synthetic documents.
Restarts clear the key. Separate non-HTTP CLI workers use `--worker-pid PID`, not
the default backend socket; they do not inherit the backend's credential.

## Manual demonstration

1. HR: `lifecycle.hr@example.test`; candidate: `lifecycle.candidate@example.test`.
   Seed-created password `DemoRecruitment!2026`; existing passwords preserved.
2. Inspect the Data Analyst draft's sentence-style form builder, or create a new
   draft. HR supplies target skills/credentials/scopes, not provider rubrics.
   Published forms/extractors/interview plans remain frozen.
3. Candidate submits to the published Backend Engineer vacancy. Synthetic sample:
   `/home/ubuntu/code/.local/demo/lifecycle/precv-001.pdf`; also `precv-002.pdf`,
   `precv-004.pdf`, `precv-005.pdf`. These are unchanged transferred synthetic PDFs,
   **not** canned answers for live execution. Different valid PDFs/questions can
   use the live executor within the same synthetic-data consent and fixed limits.
4. Submission returns without waiting for extraction. Refresh HR application
   detail after processing; inspect source/original values, make independent
   corrections and export effective CSV. Review completion/screening are explicit
   human actions, never extraction-driven decisions.

Mail stays file-captured. Read an exact recipient locally, from the API checkout:
`MAIL_DRIVER=file node apps/api/dist/integrations/mail/read-local-mail.js ADDRESS`
(set the runtime root above when needed). Do not put mail codes in chat/docs.
Mailpit does not display file captures. Mail-history viewer/full service launcher
remain deferred; this is not a claim they exist.

## Build / setup / restart

Requires Node 24, pnpm 12.9.0, PostgreSQL 17 and Redis 7. Use the existing Linux
host-network infrastructure (PostgreSQL 55437, Redis 56379). Discover containers/
listeners first; do not reset Podman, Redis, spending counters or volumes.
Create `.env` from `.env.example` only if absent; set the auth secret yourself.

From the checkout root:

```sh
pnpm install --frozen-lockfile
pnpm --dir packages/domain run build
pnpm --dir apps/api run build
pnpm --dir apps/web run build
```

Schema through 010 and the reserved five-vacancy/25-scenario recreation are already
applied. No new migration/reseed was needed for live wiring. Explicit future setup:

```sh
NODE_ENV=development MAIL_DRIVER=file PROCESSING_READER=disabled PROCESSING_EXECUTOR=disabled PROCESSING_RUNNER=disabled node apps/api/dist/demo/setup.js seed
```

Use `RECRUITMENT_RUNTIME_ROOT=/home/ubuntu/code` when reusing this session's private
runtime. `seed` preserves a complete compatible reserved dataset; `reset` explicitly
recreates only that dataset, with approved scope and no active worker. Passwords,
other records, request ledger, Redis spending state and volumes are preserved.
Normal API startup never migrates/deletes data. Failed setup may leave earlier
migrations committed.

Current real backend command, in named RMUX `backend`:

```sh
RECRUITMENT_RUNTIME_ROOT=/home/ubuntu/code NODE_ENV=development MAIL_DRIVER=file EXTRACTION_DRIVER=disabled PROCESSING_READER=pdf PROCESSING_EXECUTOR=jev PROCESSING_RUNNER=jev EXTRACTION_LIVE_CONSENT=synthetic PROCESSING_LIVE_SINCE=2026-11-13T06:10:10.423Z node apps/api/dist/main.js
```

Frontend: `pnpm --dir apps/web exec vite --host 127.0.0.1` in `frontend`.
The legacy `EXTRACTION_DRIVER` remains disabled; the real task executor is selected
by `PROCESSING_EXECUTOR=jev`. Defaults remain disabled, live mode requires explicit
development/synthetic consent and a fixed UTC submission boundary.

The root bootstrap acquires **the same stable credential socket/pipe** before
worker lifecycle hooks. A second backend across checkouts/ports, or an occupied/
stale socket, refuses startup. No automatic unlinking/PID stealing. Shutdown closes
only its own socket and clears its RAM key. Windows behavior remains unverified.

## Pipeline / caches / failures

Not OS cron and not a Redis/BullMQ task queue. Post-commit wake hints (bounded
memory set, 128 IDs) + 5s timer scans use PostgreSQL eligibility/leases/due retries.
One application/request runs at a time. Key-empty live mode leaves work unclaimed.
Flow: frozen HR questions → private PDF/native Markdown → one multi-question Jev
request per extractor → full response validation → typed fields/original raw data
→ PostgreSQL → independent HR review/CSV. No confidence cutoff or automatic ranking.

Private atomic caches remain at `/home/ubuntu/code/.local/cv-cache` for this runtime:
PDF **content** hash + parser version/options → Markdown; exact effective request
hash → complete validated response. No filename/application-ID keys. Fixture/live
responses are separate; complete hits are revalidated. No cache migration needed.
Durable send history is independent and never cleared with disposable data.

A validated response is file-cached **before** DB settlement. If acknowledgement/
task save fails, its expired processing lease (2 minutes) permits **local cache-only
replay**, not another provider request. Missing/invalid cache stays unavailable and
needs manual review. Unknown provider completion never authorizes a resend.
Safe known-unsent transient failures use the existing delayed/max-three policy;
budget/config/known provider failures/ambiguous sends stop rather than rapid-loop.
Screening/review completion/release fence late writes and never reopen.

Jev hard constants unchanged: `jev-1.14.0`, one active call, three admissions/minute,
twenty persistent total admissions (not renewed by restart), 60,000 request bytes,
1 MB response and 10s HTTP timeout. Redis guards rate/spending/concurrency only.

## Health / evidence / publication

`GET /api/health/ready` checks local DB/Redis, **not Jev**. Public
[OpenAPI](https://api.typesafe.ai/openapi.json) documents no dedicated provider
health endpoint. Authenticated [`GET /v1/models`](https://docs.typesafe.ai/api/list-models)
lists accessible model metadata without inference; reviewed docs give no explicit
billing guarantee. No `/health/jev` route or diagnostic provider call was added.

API/web builds and runtime readiness passed. **No tests, agent-paid requests or
credential loading**; live end-to-end/provider quality, race/privacy and Windows
acceptance are not claimed. User will load a key and inspect the real workflow.
Source fixes are separately committed; merge/push await the user's instruction.
See [status](docs/current/status.md), [safety](docs/current/jev-safety.md) and
[remaining work](docs/plan/tasks.md#non-qa-implementation-remainder).
