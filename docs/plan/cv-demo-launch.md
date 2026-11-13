# CV demo launch handoff

2026-11-13. **Not launch-ready or demonstrated yet.** The user requested a local
main merge first, then a later discussion/session for demo preparation. That is
source-integration permission, not permission to build/test, migrate/reset data,
start/restart services, read/set a real key or execute paid extraction. Source
`82698b8` and transfer checkpoint `a35a521` are locally merged; no push. The
implementation worktree is retained; no runtime activation follows from Git state.

## What exists versus what is still planned

| Area | Source state | Demo consequence |
| --- | --- | --- |
| CV feature | Five-family configuration/actual wording preview, native parser, one task per extractor, raw results, field corrections/effective CSV | Final source unbuilt/untested by instruction; no end-to-end acceptance claim |
| Fixture execution | Explicit `demo:process` and trusted fixture-only background runner, disabled by default | Needs current DB/schema and scoped source fixtures; not an independent fake backend |
| Lifecycle dataset | Five vacancies/25 scenarios; source definitions updated for CV schema | Existing local seed was version-1 skills data. Migration alone does not convert it; recreate only in an authorized bounded operation |
| RAM-only key control | Empty startup; hidden-input/stdin CLI, local Unix socket/Windows named pipe | Not required for a fixture demo. No key should be loaded for that path. Windows behavior unverified |
| Mail capture | `MAIL_DRIVER=file` stores the latest message per normalized recipient, with timestamp/purpose; `mail:latest` reads it | Works as an operator CLI design, not a mail-history web viewer. Do not paste codes into chat/docs |
| Mailpit | Existing SMTP-mode option, historically port 58025 | File-captured messages do **not** appear there; do not promise a running Mailpit UI |
| T1 mail history/viewer | Future work: address-directory history + small operator-local viewer | Not implemented by CV/key work or this handoff |
| T2b launcher | Future prerequisite/service orchestration | No one-command launcher yet; do not silently implement/start the rest of the backlog |

Read-only discovery on 2026-11-13 found RMUX `workspace` with one window and no
listeners on 3000/5173/58025. No process was started/stopped and no health/workflow
test was run. This does not inventory all services/ports or establish DB/Redis
health. Redis/PostgreSQL volumes and the retained UI worktree remain untouched.

## Smallest proposed next demo checkpoint — needs separate approval

1. Agree the actual demo: **one authenticated fixture-backed CV/review/export
   path**, not a live-provider evaluation or full regression. Respect the user's
   no-tests instruction; do not treat this proposal as permission to run tests.
2. Separately authorize a bounded domain/API/web build and any necessary source
   repairs. Compilation is still required before launching the new source; prior
   foundation passes predate the final integration. Older test/smoke/view fixtures
   and static OpenAPI lag; do not report them as current passes.
3. Separately authorize applying source migrations 009/010 and the exact lifecycle
   recreation scope. Keep existing ownership/reset fences. Development recruitment
   data is disposable, but do not silently broaden reset filters, clear the request
   ledger/spending Redis, reset volumes/passwords or touch private credentials.
4. Rediscover listeners/RMUX. Agree process ownership and commands before launching
   or replacing anything. Use host networking and named terminals; retain the UI
   preview worktree. A main merge is not a coordinated runtime upgrade.
5. Keep normal reader/executor/runner disabled and use explicit fixture processing
   for the smallest demo. No Jev key/provider call is needed. Seeded results are
   declared fixtures, not native parsing/model-quality evidence. If a real native
   parse is part of the demonstration, scope that independently; it still need not
   call Jev. Automatic fixture mode requires separately bound trusted records,
   not arbitrary new candidate submissions or a fabricated success.
6. User-manual route: create a draft, add a CV extractor and inspect generated
   wording/choices → publish → candidate submits a synthetic PDF → operator applies
   one explicit trusted fixture → HR changes one field/leaves siblings intact →
   effective CSV. Optional explicit review completion/screening remains a separate
   human action. No automatic ranking, decisions or fake interviews.
7. For signup/reset mail, use the existing exact-recipient `mail:latest` CLI in
   file mode. If a browser mail viewer is essential, approve a bounded T1 slice
   instead of claiming it exists. Do not switch mail drivers or add a viewer as an
   unannounced launch side effect.

No step above was executed by this handoff. Minimal manual demo success would
not close the earlier Q-* privacy/race/native/regression gates or validate Jev
accuracy, real spending, Windows IPC or production readiness.

## Resume here

Read root `AGENTS.md`, [documentation index](../README.md), this handoff,
[CV implementation notes](research/cv-extraction-implementation.md),
[current processing contract](../current/contracts/processing-review-api.md) and
[Jev safety](../current/jev-safety.md). Transfer is complete: do not repeat corpus
research or regenerate the PDFs. Preserve originals, fixture labels, the retained
UI worktree/services and every spending/credential restriction. No remote push.
