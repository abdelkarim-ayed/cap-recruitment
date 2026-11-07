# Lifecycle demo fixtures

T2a is source-implemented with offline catalog/transaction-model checks only. **Not seeded or DB-verified.** Migrations 007/008 remain unapplied; applying them, seeding/resetting data and managing services require a separately approved execution checkpoint. No launcher or service startup is included.

## Dataset

`demo:lifecycle` declares five vacancies and 25 applications. IDs are stable in the reserved `recruitment-lifecycle-v1` namespace; the older RenderCV demo remains separate. Event timestamps are relative to a single seed-time UTC half-hour boundary, with accounts/vacancies preceding submissions, processing/review/screening and historical interviews. Future appointments use distinct half-hour slots. Reset recalculates dates; ordinary seed preserves the existing dates and edits.

| Vacancy | Scenarios |
| --- | --- |
| `draft` | Untouched draft authoring; owned by `lifecycle.hr@example.test` |
| `review` | Pending, ready, successful empty, ordinary terminal failure, operational/uncertain blocked, explicitly released, separately corrected, completed review, preselected while pending, screening rejected |
| `interviews` | Preselected/unscheduled, upcoming, feedback due, rescheduling requested, cancelled-only, partial pass, all passed, failed with remaining cancellation, Offer, Hired |
| `no-tasks` | Received, zero-interview Offer, zero-interview Hired; owned by the second recruiter |
| `closed` | Preselected; closed intake still permits owner finalization |

Staff logins are `lifecycle.hr`, `lifecycle.hr2`, `lifecycle.admin`, `lifecycle.interviewer`, `lifecycle.interviewer2`, all at `example.test`. Each application has its own candidate login `lifecycle.<scenario-key>@example.test` (keys are listed by `plan` and the manifest). `lifecycle.candidate@example.test` is initially empty for manual intake. Initial password: **`DemoRecruitment!2026`**, synthetic/development only. Existing passwords, accounts and sessions are not reset. The admin has no owner override. The second interviewer handles the second configured interview.

Each application has an attached text-only synthetic PDF, using five varied fictional profile patterns. Results, notices and interview assessments are **declared synthetic snapshots**, not outputs from executed transitions, interviews, parsing or AI. Machine results retain `mode:fixture`, a fixture ID and `method:declared-lifecycle-snapshot`; HR corrections are separate. The existing trusted fixture schema validates results and document identity/hash. Neither the seeded skill lists nor simulated failures establish extraction quality or a paid attempt. No worker or genuine in-flight external request is simulated.

## Commands and prerequisites

After building domain/API, this prints the catalog without opening environment files, DB, storage or provider clients:

```sh
pnpm --filter @recruitment/api demo:lifecycle plan
```

The following commands **write DB/private files**. Do not execute until their operation is authorized and migrations 007/008 are applied. They never apply migrations, start/stop services, send mail, contact Redis/Jev or drain pending tasks. The CLI imports only database/document modules, not AppModule/ProcessingModule.

```sh
NODE_ENV=development PROCESSING_READER=disabled PROCESSING_EXECUTOR=disabled pnpm --filter @recruitment/api demo:lifecycle seed
NODE_ENV=development PROCESSING_READER=disabled PROCESSING_EXECUTOR=disabled pnpm --filter @recruitment/api demo:lifecycle reset
```

- `seed`: initialize only when absent. An existing complete dataset is preserved; a partial one requires explicit reset. It does not repair or update existing snapshots silently.
- `reset`: replace the exact reserved dataset, including its reviews, interview changes and associated notices. **Edits and new submissions using reserved lifecycle candidate accounts inside lifecycle vacancies are disposable.** Both candidate and vacancy must belong to this dataset. Unrelated vacancies, the older demo, accounts/passwords/sessions, provider keys/configuration and spending counters remain untouched.
- Reset refuses owner/account/identity/document collisions, submissions by unrelated candidates inside a demo vacancy, active/expired leases or processing state, and attempted non-fixture/unknown executor history. Move/preserve unrelated submissions through a separately agreed operation; do not widen reset filters.
- One transaction/advisory lock covers ownership checks and DB replacement. Vacancy/application row locks protect the reset boundary; do not use it as a concurrent business-workflow runner. No runtime clock or auth bypass is added.
- Canonical private PDFs are hash-checked and reused under exact IDs rather than reuploaded on every reset. Extra manual demo-submission objects are retired in the transaction, then unlinked only after a fresh lookup confirms committed removal. Other stored files are untouched. Newly uploaded bytes after a failed transaction are removed only when a fresh lookup proves they were not committed. Failed/uncertain cleanup or a lost reset COMMIT acknowledgement can retain a private orphan; no broad storage reconciliation is attempted.

After successful initialization/reset, `.local/demo/lifecycle/manifest.json` lists baseline, accounts, IDs, links, scenario purpose and initial stage. Adjacent PDFs are available for manual uploads. The manifest records **initial declared snapshots**, not current UI state. An ordinary preserving seed leaves it unchanged. If DB commit succeeds but manifest export fails, the command explicitly reports that distinction; do not assume rollback.

For new manual submissions, use the existing explicit fixture-only `demo:process` helper described in the [demo guide](demo-guide.md#fresh-vacancy--candidate--mock-processing). Nothing auto-processes newly submitted applications.

## Verification boundary

Q-T2A remains pending: real PostgreSQL/FK/transaction/file persistence and reset repeatability, unrelated-data preservation, authenticated projections/role isolation, then user-manual lifecycle/native UX. Seed snapshots are navigation aids, not DB/HTTP/security/race evidence or a substitute for Q-R*/Q-SI/Q-B1*. T2b (demo launcher/prerequisite orchestration) remains future work with separate process-operation approval.
