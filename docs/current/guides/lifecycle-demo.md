# Lifecycle demo fixtures

T2a is source-implemented. Authorized local setup on 2026-11-07 applied migrations 007/008 and successfully seeded five vacancies/25 applications; all 25 private document hashes were verified through storage. API/DB/Redis readiness and frontend/proxy HTTP checks passed. **This is setup evidence, not completion of Q-T2A or other QA gates:** reset/repeatability, authenticated workflows/privacy, races and manual UX remain pending. No launcher is implemented; services were launched explicitly in [RMUX](rmux.md).

**2026-11-13 offline cutover:** authorized `demo:setup reset` applied 009/010 and
recreated the reserved dataset with version-2 CV fixtures and unchanged transferred
PDFs. Source fixes in `feat/cv-offline-demo` are separately committed/built/running,
merged on main through `e1f1d86`. The current new-synthetic-submission cohort uses **real Jev**
after user key loading; historical seed snapshots remain declared fixtures.
No tests; authenticated/manual/privacy/race gates remain pending. See the
[launch handoff](../../plan/cv-demo-launch.md) for current worktree/process details.

## Dataset

`demo:lifecycle` declares five vacancies and 25 applications. IDs are stable in the reserved `recruitment-lifecycle-v1` namespace; the older RenderCV demo remains separate. Event timestamps are relative to a single seed-time UTC half-hour boundary, with accounts/vacancies preceding submissions, processing/review/screening and historical interviews. Future appointments use distinct half-hour slots. Reset recalculates dates; ordinary seed preserves the existing dates and edits.

| Vacancy | Scenarios |
| --- | --- |
| `draft` — Data Analyst | Untouched draft authoring; owned by `lifecycle.hr@example.test` |
| `review` — Backend Engineer | Pending, ready, zero programming coverage, ordinary terminal failure, operational/uncertain blocked, released, corrected, reviewed, screened-pending, rejected |
| `interviews` — Senior Software Engineer | Preselected/unscheduled, upcoming, feedback due, reschedule, cancelled, partial/all pass, failed with cancellation, Offer, Hired |
| `no-tasks` — Finance Operations Analyst | Received, zero-interview Offer/Hired; owned by the second recruiter |
| `closed` — Financial Accountant | Preselected; closed intake still permits owner finalization |

Staff logins are `lifecycle.hr`, `lifecycle.hr2`, `lifecycle.admin`, `lifecycle.interviewer`, `lifecycle.interviewer2`, all at `example.test`. Each application has its own candidate login `lifecycle.<scenario-key>@example.test` (keys are listed by `plan` and the manifest). `lifecycle.candidate@example.test` is initially empty for manual intake. Initial password: **`DemoRecruitment!2026`**, synthetic/development only. Existing passwords, accounts and sessions are not reset. The admin has no owner override. The second interviewer handles the second configured interview.

Each application has an unchanged transferred synthetic PDF from four profiles:
Daniel Mercer (backend), Amélie Hartmann (data), Grace Ellington (nursing), Ronan
Keating (accounting). Destination-authored declared answers reflect these source
claims; they are not archived Jev observations or validated ground truth. The
nursing zero-coverage scenario still has a bachelor's degree. Snapshot results,
notices and interview assessments are **declared**, not executed history.
Machine snapshots retain `mode:fixture`, fixture ID and
`method:declared-lifecycle-snapshot`; HR corrections stay separate. Zero usage and
confidence=1 are simulated metadata, not quality/billing evidence. Pending work
may subsequently run through the explicitly enabled offline native-reader worker.

## Commands and prerequisites

After building domain/API, this prints the catalog without opening environment files, DB, storage or provider clients:

```sh
pnpm --filter @recruitment/api demo:lifecycle plan
```

The following commands **write DB/private files**. Do not execute until their
operation is authorized and migrations through 010 are applied. They never apply
migrations, start/stop services, send mail, contact Redis/Jev or drain pending
tasks. Require `PROCESSING_RUNNER=disabled` as well as disabled reader/executor.
The CLI imports only database/document modules, not AppModule/ProcessingModule.

```sh
NODE_ENV=development PROCESSING_READER=disabled PROCESSING_EXECUTOR=disabled pnpm --filter @recruitment/api demo:lifecycle seed
NODE_ENV=development PROCESSING_READER=disabled PROCESSING_EXECUTOR=disabled pnpm --filter @recruitment/api demo:lifecycle reset
```

- `seed`: initialize only when absent. An existing complete compatible dataset is preserved; a partial/legacy dataset requires explicit reset. It does not repair or update existing snapshots silently.
- `reset`: replace the exact reserved dataset, including its reviews, interview changes and associated notices. **Edits and new submissions using reserved lifecycle candidate accounts inside lifecycle vacancies are disposable.** Both candidate and vacancy must belong to this dataset. Unrelated vacancies, the older demo, accounts/passwords/sessions, provider keys/configuration and spending counters remain untouched.
- Reset refuses owner/account/identity/document collisions, submissions by unrelated candidates inside a demo vacancy, active/expired leases or processing state, and attempted non-fixture/unknown executor history. Move/preserve unrelated submissions through a separately agreed operation; do not widen reset filters.
- Durable live request history also refuses fixture reset. The request-attempt ledger is never cleared with disposable recruitment data.
- One transaction/advisory lock covers ownership checks and DB replacement. Vacancy/application row locks protect the reset boundary; do not use it as a concurrent business-workflow runner. No runtime clock or auth bypass is added.
- Objects retired by reset are unlinked only after a fresh lookup confirms
  committed removal. Newly uploaded bytes after a failed transaction are removed
  only when a fresh lookup proves they were not committed. Failed/uncertain cleanup
  or a lost COMMIT acknowledgement can retain a private orphan; no broad storage
  reconciliation is attempted.
- In the updated reset, canonical and extra dataset objects are retired only when
  no longer referenced, then new immutable objects are inserted. This permits the
  authorized replacement of old generic PDFs with transferred profiles without
  overwriting stored bytes. Other objects remain outside the reset scope.

After successful initialization/reset, `.local/demo/lifecycle/manifest.json` lists baseline, accounts, IDs, links, scenario purpose and initial stage. Adjacent PDFs are available for manual uploads. The manifest records **initial declared snapshots**, not current UI state. An ordinary preserving seed leaves it unchanged. If DB commit succeeds but manifest export fails, the command explicitly reports that distinction; do not assume rollback.

## Setup command and optional offline processing

After building domain/API, `demo:setup seed|reset` applies auth/application
migrations and invokes the scoped seed/reset above; normal API restarts never do.
From the active worktree, using the existing private runtime directory:

```sh
RECRUITMENT_RUNTIME_ROOT=/home/ubuntu/code NODE_ENV=development MAIL_DRIVER=file PROCESSING_READER=disabled PROCESSING_EXECUTOR=disabled PROCESSING_RUNNER=disabled pnpm --filter @recruitment/api demo:setup seed
```

Use `reset` only with explicit disposable-data scope and no active worker. It
does not touch Redis, passwords, credentials, volumes or `cv_request_attempts`.
It can stop after an earlier migration commits; failure is not whole-command
rollback. Existing guards are not bypassed to satisfy a broad cleanup request.

The launch uses `PROCESSING_RUNNER=offline-demo PROCESSING_READER=pdf
PROCESSING_EXECUTOR=disabled` with `NODE_ENV=development`. New submissions return
without awaiting extraction; post-commit wake + 5s DB scan processes one application
at a time. Supplied files `.local/demo/lifecycle/precv-001.pdf`, `precv-002.pdf`,
`precv-004.pdf`, `precv-005.pdf` have declared profile answers for known terms/scopes
and Oct–Dec 2026 publication dates. Other files/configurations become explicitly
unavailable, not invented answers or live fallbacks. Refresh HR detail for results.
The earlier `demo:process` remains an explicit synthetic helper, not the automatic
profile mode, and requires the runner disabled.

## Verification boundary

Q-T2A remains pending beyond observed setup/reset and one seeded pending worker
completion: repeatability/rollback, unrelated-data preservation, authenticated
projections/isolation and manual UX. No tests were run. The setup command is a
bounded T2b prerequisite slice, not a service launcher or mail viewer; keep all
Q-R*/Q-SI/Q-B1* and live-recovery/privacy gates pending.

The offline configuration above is optional, **not the current live worker**.
User clarified that synthetic PDFs must pass through genuine Jev. Current
`PROCESSING_RUNNER=jev` is scoped to new synthetic submissions after the fixed
boundary in [LAUNCH.md](../../../LAUNCH.md), starts key-empty and uses native
parsing/real responses. Historical fixture snapshots are not reprocessed or
relabelled as live evidence. No further reseed was needed for that correction.
