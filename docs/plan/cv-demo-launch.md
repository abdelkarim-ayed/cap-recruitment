# CV demo — current launch handoff

**[Root launch README](../../LAUNCH.md)** owns copyable startup, key rotation,
accounts/PDFs, modes, cache/recovery policy and operating boundaries. Read it
before managing processes. Main remains `c77aebe`; source fixes are separately
committed on `feat/cv-offline-demo`, not merged/pushed.

## Corrected runtime, 2026-11-13

The assistant initially treated “fixtures” as canned answers; user clarified that
synthetic **PDFs** were intended, with genuine Jev extraction. The user explicitly
approved real execution for new synthetic submissions only, unchanged hard limits,
and a backend restart followed by user key reload. No agent provider probe/key
loading, tests, old queue drain, counter/volume reset, browser or push approval.

- `/home/ubuntu/cv-offline-demo`; RMUX `workspace:backend` / `frontend`.
- UI http://localhost:5173; current backend PID **164375**. Empty startup key.
- `PROCESSING_READER=pdf PROCESSING_EXECUTOR=jev PROCESSING_RUNNER=jev`,
  `EXTRACTION_LIVE_CONSENT=synthetic`, fixed cohort boundary
  `PROCESSING_LIVE_SINCE=2026-11-13T06:10:10.423Z`. Reuse it on restart.
- Root bootstrap acquires the stable credential control socket **before** worker
  lifecycle hooks. Duplicate/occupied/stale socket refuses startup. Rotation
  targets that one backend, no PID needed; optional expected PID and separate
  `--worker-pid` controls remain. Do not remove live/stale state automatically.
- Native parse → frozen multi-question request → real JevGateway → validated
  typed fields/raw data → DB. Post-submit wake + 5s DB scan, serial work, no inline
  processing wait. Key-empty live mode performs no claims. Historical pending/
  failed records, final tasks and closed applications remain excluded.
- Private atomic file caches stay in shared runtime `.local/cv-cache`: PDF bytes
  + parser identity, and full effective request hash. No cache migration needed.
  Response caches before DB settlement; interrupted saves get cache-only local
  replay after lease expiry, no paid fallback on missing/invalid cache.
- Existing hard gateway model/endpoint/limits/Redis namespace unchanged. The
  user, not the agent, will load a key and submit synthetic files for inspection.

## Evidence and separate commits

| Commit | Change |
| --- | --- |
| `4e78d53` | Sentence-style CV form authoring; generated new field names, existing IDs preserved |
| `8737c2a` | Single root credential socket/rotation target, before worker hooks |
| `ade7596` | Private file caches; validated response receipt before DB settlement |
| `9030c8c` | Explicit schema setup and unchanged transferred synthetic PDFs |
| `0586394` | Scoped real background worker and local cache-only DB recovery |

API/web builds and direct/proxy readiness passed. Earlier setup applied 009/010,
recreated five reserved vacancies/25 labelled navigation scenarios with passwords/
other records/ledger/spending preserved, and observed one initial **offline**
pending task completion. No further migration/reseed was needed for real wiring.
That fixture result is not Jev evidence. No tests or agent live/recovery/privacy/
race/Windows acceptance; all prior Q-* remain pending. Static OpenAPI/old fixtures
still need separate alignment. Keep original research bytes and prior worktrees.

Mail capture/latest CLI and setup exist; T1 history/viewer and full T2b launcher
remain deferred. No presentation edits. Health was research-only: published
authenticated `GET /v1/models`, no dedicated health endpoint/explicit billing
guarantee found; no `/health/jev` route or credential-bearing probe implemented.

Next: user reloads key, makes a **new synthetic submission**, inspects actual
live results in HR review/CSV, then explicitly instructs merge/push when ready.
No automatic backlog implementation or deployment follows from this handoff.
