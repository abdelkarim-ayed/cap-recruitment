# Implementation status

Product source baseline includes the CV integration, R1/R2/R3a–d/SI/B1-P/F/R/J,
T2a and the prior UI overhaul/consistency commits `0fdc705` / `73bb014` preserved
through `cebce84`. The authorized local merge preserves CV source `82698b8` and
the separately checkpointed transfer/plans `a35a521`; no push. Local demo setup
applied 007/008 and seeded the old lifecycle fixtures on 2026-11-07. Dated evidence
below is not current runtime activation or complete functional QA.

## 2026-11-13 — CV demo launch and real-worker correction

Deadline follow-up: sentence-style CV authoring replaces argument forms/prominent
Jev debug previews, with optional keywords/ongoing qualifications and hidden
technical wording. New target-derived IDs/source-derived prefixes are generated
without renaming saved/imported identities. Web typecheck/build passed (same
dependency annotation warnings), no tests/browser inspection; user GUI review
pending. Vite serves the source update. Root
`LAUNCH.md` now documents build/setup/accounts/PDFs/rotation/modes and scheduling.
UI fix committed separately as `4e78d53`; no merge/push or presentation edit.

Health research only: public TypeSafe docs/OpenAPI list authenticated
`GET /v1/models`, no dedicated health endpoint. It returns accessible model
metadata, not inference/token usage; reviewed docs make no explicit billing
guarantee. No credential-bearing call, paid probe or `/health/jev` implementation.
This does not establish that the user's key can access Jev inference.

The assistant initially misread fixtures as canned answers; user clarified that
synthetic **PDFs**, not answers, were intended. The user then explicitly approved
real execution for new synthetic submissions only, unchanged hard controls, and a
backend restart/key reload; no tests or agent paid diagnostics. Current backend
**164375** runs `PROCESSING_RUNNER=jev`, real executor/native reader and fixed
`PROCESSING_LIVE_SINCE=2026-11-13T06:10:10.423Z`. It starts empty and leaves work
unclaimed until the user loads a key. Historical pending/failed records are not
drained, successful tasks/closed applications remain excluded.

The root now acquires the **same stable credential socket** used for rotation,
before workers initialize; a duplicate/occupied/stale socket refuses startup.
CLI defaults to the single backend, no PID required (`--pid` checks an expected
backend; `--worker-pid` selects a separate explicit CLI worker). Direct absolute
Node invocation avoids the absent main build/recursive targeting failure. The
earlier operational status check reached old PID 126651 empty; no agent key access.

Private hash-addressed caches remain at the shared runtime's `.local/cv-cache`.
Validated responses cache before DB settlement. Expired interrupted work with
durable send history can replay **locally only** to complete persistence; missing
cache never falls back to another paid send. No new migration/reseed was needed
for this correction. Safe unsent retries retain 12h/max-three policy; uncertainty/
budget/config/known provider failures stop. No live end-to-end/recovery/race pass.

Separate commits: `8737c2a` singleton/rotation, `ade7596` filesystem cache/receipt
ordering, `9030c8c` explicit setup/synthetic PDFs, `0586394` real worker/local replay.
Main remains `c77aebe`; changes stay on `feat/cv-offline-demo`, not merged/pushed.

Observed: offline frozen dependency install reused local store; domain/API/web
builds passed (web had harmless dependency annotation warnings). Existing
PostgreSQL/Redis host-network containers started with volumes intact. `demo:setup
reset` applied 009/010, recreated five reserved vacancies/25 scenarios, preserved
passwords/other records/spending/ledger. Auth tooling reported its existing
`rateLimit.lastRequest` int8/number warning, not a failed migration. Updated PDFs
are unchanged transferred bytes, with destination-authored declared responses.

API/web run in `workspace:backend` / `frontend` from the new worktree, reusing
`/home/ubuntu/code` private runtime data. Direct/proxy readiness returned ready.
The **initial offline boot's** seeded pending application completed one native parse/fixture
task; Markdown and fixture-response cache files were written. No authenticated
submission, UI/review/export walkthrough, replay/restart/race/privacy verification
or test suite was performed. Earlier Q-* remain pending; old smoke/view fixtures
and static OpenAPI still need alignment. This is not quality/live acceptance.

Backend key holder starts empty, control socket active; PID/rotation command are
printed at startup. No key was read/loaded by the agent, no provider/spending/reset
operation. Windows transport/ACL behavior and actual rotation remain unverified.
Mail stays file-captured; T1 viewer and full T2b launcher are not implemented.
`demo:setup` is a bounded prerequisite/data slice, not automatic destructive startup.
See [launch handoff](../plan/cv-demo-launch.md), [source contract](contracts/processing-review-api.md)
and [key control](guides/jev-key-control.md). Retained prior worktrees unchanged;
leave services alive. Fixes committed separately; no merge/push.

## Implemented

- React/Vite + NestJS + shared TypeScript/Zod domain package; PostgreSQL, local private file storage, Redis connectivity and Jev admission guard.
- Better Auth email/password, candidate signup and one-time verification, reset codes, provisioned staff. Legacy OTP endpoints remain regression paths, not the UI login.
- Owner-managed vacancy drafts, generic input/task editor, publish/close, frozen published intake and allowlisted public projections.
- Immutable candidate submissions, identity/definition snapshots, duplicate prevention, bounded uploads, authorized downloads and native PDF preview.
- Explicit processing CLI and disabled-by-default fixture/offline/scoped real Jev background modes, DB leases, bounded wake hints/5s scans, one request per extractor and private native Markdown preparation. Only the approved new synthetic cohort is enabled.
- CV extractor: transferred five-family wording, frozen publication UTC date, complete raw/typed results, private file caches/durable send guards and independent question correction/CSV fields. RAM-only local key control starts empty. Source builds/offline startup are observed; no full workflow/regression/live validation.
- Shared HR extraction review; no-task records automatically marked not applicable/completed. Diagnostic CSV exports all vacancy applications; compact undecided screening export has its own factual filters and effective-value projection.
- Vacancy interview steps, HR scheduling, one responsible assignee per application/step, final assessment, terminal Fail, owner Offer/Hired, internal inbox and read-retention command.
- R2: pure typed existing staff notification policy, separate command-cause types and unchanged transactional persistence. Recipient/content ownership moved out of InterviewService; no candidate effects, schema/API/UI changes or runtime acceptance claim.
- R3a: current-identical normalized draft vacancy PATCH returns unchanged revision/time and full staff owner metadata. Owner/draft/stale checks remain authoritative; real changes increment once. No UI/interview/review or publish/close-policy changes.
- R3b: current-identical normalized interview-plan PUT preserves IDs/positions and `interview_revision`, including empty plans. Separate owner/revision/freeze checks remain authoritative; B1-P now freezes all published/closed plans. Real draft edits still replace all rows/new IDs and increment the separate counter once.
- R1: shared static action-role map, feature-scoped ownership/assignment/state policies, additive typed action availability and UI consumption. Legacy fields/Origin/session/private projections remain; [inventory/contracts](contracts/action-policies.md) distinguish visibility from authority. Later focused policy/DOM checks do not complete the deferred guard/HTTP/DB/privacy regression.
- SI: one-CSV screening wizard/preview/atomic apply, mandatory ID/email, optional internal reason, ignored evidence columns, undecided evidence export/date filters. Shared individual/bulk command persists cause/actor/time, closes processing eligibility and locks review; candidate gets one transactional screening notice. First committed outcome wins; no reservations/assignment/debate states. [Current contract](contracts/screening-api.md) records scope; migration 007 applied locally, functional QA pending.
- B1-P: publication validates a possibly empty ordered interview plan and confirms both vacancy/interview counters under one vacancy lock. Published/closed plans freeze even without bookings; current-identical draft no-ops remain. UI shows saved plan before confirmation and uses Interview plan / Interviews wording; source fixtures configure interviews before publishing. No new migration, row rewrite or seed run.
- B1-F: explicit owner Offer from preselected with zero configured interviews; nonempty plans still require interview stage and every interview completed/Pass. Separate owner Hired requires Offer. API enforcement/action metadata agree; no automatic offers, artificial bookings, new migration or notification effects.
- B1-R backend: derived whole-application readiness and structured failure categories; shared-HR manual release of any unfinished work, including active, with actor/time and durable late-write fencing. Preserves evidence, corrections and unfinished review; no screening gate or new notification. Migration 008 applied in local demo setup; broader QA pending. Fixtures/disabled AI only.
- B1-J: confirmed release UI, separate factual readiness/processing/review presentation, matching HR list/count/screening-export filters and release-aware processing closure. Local drafts survive failed save and explicit refresh for manual comparison/reapplication; no automatic merge/retry or displayed review counter numbers. No new migration, counters/notifications, live work, semantic review no-op fix or general navigation dirty guard.
- R3c: review PATCH semantic no-ops after readiness/locks and separate revision checks; current-identical returns the unchanged projection without writes/revision/attribution/time changes. Normalized skill membership, absent/null/removal distinction and changed-only mixed saves; no new migration, UI change, notification or processing behavior. Real integration/manual evidence remains Q-R3C.
- R3d-a: review navigation guard at the hash-router boundary, extended to other editors by R3d-b/c below. Dirty/pending review drafts retain the page for Stay/Discard; sign-out, managed Back/Forward and client redirects are guarded, and standard `beforeunload` warns on reload/close. Returning to the exact saved value clears its local draft. No save-all, automatic merge/save/retry, request cancellation or persistent draft storage.
- R3d-b: same shared guard now covers unsaved vacancy drafts and interview-plan steps; untouched/unchanged editors do not warn, a successful create redirects only after clean, and plan pagination/Refresh preserve local steps. Successful vacancy/plan responses become the clean baseline; conflicts keep local edits without retry. Same no-save-all/backend/persistence limits as R3d-a; native/manual behavior remains Q-R3DB.
- R3d-c: shared guard also covers non-empty candidate answers/selected documents and staged screening-import rows. Preview mode is unguarded. Hide import and Close wizard require the same explicit choice when staged decisions exist; a successful apply clears rows before refresh, while conflicts/uncertain outcomes keep the guard. Successful submission redirects only after the form is clean. No automatic save/apply/retry, request cancellation, server draft storage or backend change; native/manual behavior remains Q-R3DC.
- T2a: [lifecycle catalog/seed/reset/setup](guides/lifecycle-demo.md), five vacancies/25 declared scenarios, scoped IDs/dates, transferred synthetic PDFs and fixture provenance. Reset includes manual submissions only when both candidate and vacancy are reserved identities; retires now-unreferenced dataset objects after verified commit. Passwords/unrelated data/spending/ledger preserved, active/leased/non-fixture history refuses reset. Observed setup is not full Q-T2A; service launcher remains pending.
- UI inspection/authoring: title-first vacancy lists, quiet ownership, staff owner/status shortcuts; readable vacancy/interview-plan inspection versus authorized draft editing; named vacancy scope; information-first application pages and human saved-choice labels. Fixed account email and secondary technical form settings preserve server identity/stable keys.
- Focused guarded dialogs for screening, later rejection, owner Offer/Hired, booking, appointment changes/feedback and human review. Review keeps source PDF beside per-field corrections, separate completion and release confirmations, conflict refresh/reapply and immutable originals/results. No new backend authority or automatic progression.
- Independent Work to do / Recruitment status with shared server-side list/count/undecided-export filtering; candidate allowlisted public outcomes; safe summary → checked `/apply` with existing-submission navigation and server-side Not applied yet filtering.
- Monday-first Upcoming/Past/Cancelled, movement at the start instant and Past-only Awaiting feedback; scoped agenda context plus account/role-scoped tab-session list filters/sort/page. No elaborate history restoration or persisted editor drafts.
- Compact effective-result decision CSV, diagnostic export separate; one grouped valid application proposal with source records/link/email/decision, agreement prefilled and conflicts explicitly resolved. Source outcome/reason stays paired, and only final wizard confirmation commits. Topbar-only Inbox has native notification links and normal read-before-open behavior. [Durable frontend baseline](guides/frontend-design.md) owns the design, not older proposals.

## Important current limits

- Candidate own application list/detail now have a source-implemented [coarse public-stage allowlist](contracts/application-api.md#candidate-public-status); internal review stages remain masked. Build/static checks only; authenticated/manual projection checks pending. Inbox supports own screening notices only. No submission/appointment/Pass/Offer/Hired notices, full progress timeline, owner-finalization alerts, hide UI or backfill. Screening notices have no expiry; old interview-retention command unchanged.
- `review_ready` is accepted vocabulary but has no workflow writer. Processing and review state are separate from recruitment stage.
- Publication freezes the current plan, including empty; explicit zero-interview owner Offer is enabled. Existing published data is not reconfigured/reset. Full notification/owner-availability effects remain separate work.
- CSV screening/readiness/release with UI/list/filter is source-implemented and included in the locally launched demo, not functionally DB/HTTP-verified by startup. No reversal, panels, interview retries or reopening. Closing a vacancy still stops intake, not ongoing interviews. Operational/uncertain/unclassified failures require explicit release, not inferred readiness after retry exhaustion. SQL/detail readiness parity, native release UX and authenticated isolation remain real integration/manual QA, not established by mocks/DOM tests or setup readiness.
- Draft vacancy/interview-plan and review no-op handling is source-implemented, not a general revision/history framework or real DB/HTTP verification claim. All current in-app entry surfaces with unsaved work are guarded; no server-side draft persistence exists. Counters remain concurrency controls, not history.
- Source recovery now consults durable request guards; uncertain sends cannot automatically retry. This replaces the old unsafe reclaim path but has no final PostgreSQL/HTTP/race verification. Unattended live mode remains refused. [Safety detail](jev-safety.md#recovery-limitation).
- PDF only for real parsing (DOCX may be accepted as an upload, but cannot be parsed). No OCR, guaranteed complex-layout reading order, rectangles or extraction-quality measurements.
- Private storage can retain orphans after crashes/cleanup failures. No global storage quota/reconciliation yet.

## Verification evidence

Entries record what passed at each checkpoint, not a current all-suite pass. Old statements about unapplied migrations, unguarded editors or UI gaps describe their dated snapshot; implemented behavior is above/in contracts, not those historical limitations.

2026-11-13 bounded `feat/cv-extractor-integration` worktree, checkpoints 1/2:
exact five-family TypeScript schema/wording port, typed field/correction/export
helpers, native Node parser, memory caches and durable request-attempt source
implemented but **not integrated into the active skills workflow**. Domain/API
builds and web typecheck passed; 12 new domain and 29 focused API offline checks
passed. All three rendered request contracts match; 20 historical pairs/102
answers validate against their original requests. Three PDF parses (two CV
identities) match transferred Python Markdown bytes and compared flags, including
the JSume encoding warning. Dependency pinned locally to pdf-inspector 1.25.2;
no global tooling changes. Fake-worker recovery/duplicate/closure tests are not
real PostgreSQL/Redis/HTTP race or live-quality evidence. Migration 009 is source
only/unapplied; publication/correction schema and runtime/UI wiring remain next.
Broader domain run found an existing screening duplicate-CSV test failure,
reproduced on unchanged main (`screening.test.ts:18`), left outside this scope.
No provider calls, data operations, service management, commits or push. See
[checkpoint notes](../plan/research/cv-extraction-implementation.md).

Reported at the 2026-10-31 skills checkpoint: 42 API + 16 domain + 29 DOM tests (87 total), domain/API/web builds and real PDF/PostgreSQL fixture integration including per-skill correction/export. Earlier checkpoints report vacancy/intake/interview concurrency, private-file authorization and password/OTP integration checks. These are historical check results, not a fresh test run or live-provider evaluation.

The docs-only reorganisation checks paths, links, JSON references and unchanged runtime sources. It does not rerun application integration scripts, start services or mutate fixture data. Native browser behavior, inbox reports and actual provider quality remain unverified in this pass.

2026-11-02 R2 checkpoint: API `typecheck` (`tsc --noEmit`), whitespace checks, 148 local Markdown links/anchors and 341 OpenAPI references passed. Application unit/integration/DOM tests were not run, at the user's request; automated matrix/rollback/privacy regression remains Q-R2A and later batched manual UX remains Q-R2U on the [board](../plan/tasks.md). Static checks are not evidence those behavioral checks pass. No browser automation, provider calls, data changes or process management performed.

2026-11-02 R3a checkpoint: API `tsc --noEmit -p apps/api/tsconfig.json`, whitespace checks, 150 local Markdown links/anchors and 341 OpenAPI references passed; the OpenAPI diff is limited to the vacancy PATCH description. Unit/repository/HTTP/DB regression was not run, as approved; Q-R3A remains outstanding on the board. Existing tests are historical evidence, not verification of the changed behavior. No application execution, UI/browser work, provider calls, database operations or process management performed.

2026-11-02 R3b checkpoint: API `tsc --noEmit -p apps/api/tsconfig.json`, whitespace checks, 152 local Markdown links/anchors and 341 OpenAPI references passed; the interview OpenAPI diff changes only the plan PUT description. Application/DB/DOM regression was not run; Q-R3B remains outstanding, not reported passed. No application execution, browser work, provider calls, database operations or process management performed.

2026-11-03 R1 checkpoint: domain build, API/web typechecks, whitespace/test-source syntax checks, 166 local links/anchors and 366 OpenAPI references passed. OpenAPI changes are additive action response schemas only; endpoints, request schemas and existing fields are unchanged. Pure policy specifications and existing DOM fixtures were drafted/updated, not executed; no unit/HTTP/DB/DOM test run. Q-R1A/Q-R1U retain automated/manual regression work. No application startup, browser automation, provider calls, seed/data operations, spending changes or process restart/stop. Static checks do not establish behavioral/security parity.

2026-11-07 SI: domain/API/web builds passed; 5 new CSV, 9 API fake-transaction/repository and 3 new DOM cases passed (17 isolated checks). Whitespace, 178 local links/anchors and 373 OpenAPI references passed. Web build reports non-fatal third-party Zod comment-annotation warnings. An initial DOM selector ambiguity was corrected before rerun. No real PostgreSQL concurrency/rollback, HTTP multipart/auth/privacy or manual/browser verification. No migration/seed/data/provider operations, startup or process management. Prior Q-R1/R2/R3 regression remains deferred; Q-SI tracks integration/deployment/UX work. No claim that a modelled transaction proves PostgreSQL behavior.

2026-11-07 B1-P: domain/API/web builds, whitespace, 182 local links/anchors and 374 OpenAPI references passed; 4 shared-schema, 9 backend fake-transaction/repository, 5 existing vacancy-unit and 5 new DOM cases passed (23 scoped checks). Web build retains non-fatal third-party Zod annotation warnings. The serialized transaction model is not PostgreSQL race evidence. HTTP/DB/manual UX and prior deferred suites remain pending. Smoke/demo source syntax checked, not executed; no migration, data, provider, browser or process operations. Publish now requires expectedInterviewRevision as well as expectedRevision; clients/fixtures/OpenAPI updated. No new migration.

2026-11-07 B1-F: domain/API/web builds, whitespace, 185 local links/anchors and 374 OpenAPI references passed; 7 new command/model/matrix, 8 current pure policy and 4 new DOM cases passed (19 scoped checks). Matrix checks are not real authenticated HTTP/privacy or PostgreSQL lock/count evidence. No new migration, data, provider, seed/browser or service operations. Tagged smoke source syntax checked, not executed. Q-B1F and earlier deployment/regression/manual gates remain pending; migration 007 remains unapplied.

2026-11-07 B1-R backend: domain/API/web builds, whitespace, 176 scoped local Markdown links/anchors and 379 OpenAPI references passed. 15 new readiness/service/repository/fixture tests plus 25 focused existing processing/screening/policy checks passed (40 offline checks). An initial test incorrectly used a promise-only assertion for synchronous role denial; the assertion was corrected before rerun. Fake serialized transactions and projection checks do not prove real SQL races/rollback or authenticated HTTP/Origin/privacy. Smoke source follows blocked → explicit release → corrections → completion and was syntax checked, not executed. Migration 008 authored, not applied; 007 still unapplied. Fixtures/disabled AI and fake ports only, including any test-labelled live provenance; no provider calls, key/config/spending changes, data/seed/browser or service operations. Web retains non-fatal third-party Zod annotation warnings. Q-B1R and every prior Q-* integration/manual gate remain pending; release UI/list/filter is B1-J, uncertain paid-attempt recovery remains B4-S.

2026-11-07 B1-J: domain/API/web builds and 63 scoped offline checks passed: 44 API/model checks (4 new projection/filter/export, 40 existing) and 19 DOM checks (8 new release/draft/list, 11 selected existing review/correction/PDF cases). Whitespace, 178 scoped local Markdown links/anchors and 390 OpenAPI references across all three files passed. Initial TypeScript boundary typing, query-fixture pagination types and an ambiguous date-text selector were corrected before the final checks. SQL-capture mocks establish source wiring/parameter/projection behavior, not real PostgreSQL filter/count/export parity or authenticated HTTP/security evidence. No new migration or DB/data/seed/provider/key/config/browser/service operations; no smoke execution. Web retains non-fatal third-party Zod annotation warnings. Q-B1J, Q-B1R and all earlier Q-* gates remain pending; migrations 007/008 remain unapplied. Review semantic no-ops and broader navigation dirty guards remain R3c/d.

2026-11-07 R3c: domain/API/web builds, whitespace, 181 scoped local Markdown links/anchors and 390 OpenAPI references passed. 66 scoped offline checks passed: 57 API/model (16 new equality/no-op/service cases plus 41 existing focused checks) and 9 DOM (1 new unchanged-response compatibility case plus 8 existing readiness/draft cases). Models cover zero writes/reattribution, override presence vs effective equality, validation/lock/stale ordering, mixed changes, both serialized no-op/real edit orders and rollback; these are not actual PostgreSQL/HTTP/security/concurrency evidence. Smoke source now checks normalized no-op attribution and races two real correction edits; syntax checked, not executed. No new migration, data/seed/provider/key/config/browser/service operations or UI runtime changes; 007/008 remain unapplied. Existing non-fatal third-party Zod build warnings remain. Q-R3C and every earlier Q-* gate stay pending; broader dirty/navigation guards remain R3d.

2026-11-07 R3d-a: domain/API/web builds, whitespace checks and 174 offline tests passed: 110 existing API tests and 64 DOM tests (14 new navigation cases plus 50 existing). A stale application-list URL assertion that already failed on main after B1-J's `undecided=true` default was corrected in the DOM fixture before the pass. The new cases cover dirty links/Stay/Escape/cleanup, exact-value reverts and explicit discard, sibling saves, conflict/refresh drafts, in-flight and uncertain saves, sign-out success/failure, managed Back/Forward restoration, programmatic redirects, unmanaged fragments and modified/external/same-route links. These are JSDOM fixtures: native browser history UI, tab-close/reload prompts, focus/inert behavior, authenticated HTTP/logout isolation and real delayed/uncertain responses remain Q-R3DA manual QA. No migration, data/seed/provider/key/config/browser-automation/service operation or runtime backend change; 007/008 remain unapplied. Existing non-fatal third-party Zod build warnings remain.

2026-11-07 R3d-b: domain/API/web builds, whitespace checks and 184 offline tests passed: 110 existing API tests and 74 DOM tests (10 new vacancy/plan navigation cases plus 64 existing). The new cases cover dirty/clean/untouched vacancy and plan editors, exact-value cleanup, explicit Stay/Discard, pending save blocking, failed/conflict local retention without retry, clean-baseline PUT responses, pagination preservation and clean self-redirect after create. The existing application-list case now waits for its request instead of relying on synchronous timing. Link checking found 253 local links across 45 files with the same 37 pre-existing anchor-resolution false positives as main. These are JSDOM fixtures: native browser history UI, reload/close prompts, focus/inert behavior, authenticated HTTP/logout isolation and real delayed/uncertain responses remain Q-R3DB manual QA. No migration, data/seed/provider/key/config/browser-automation/service operation or runtime backend/permission change; 007/008 remain unapplied. Q-R3DA/Q-R3DB and every earlier Q-* gate remain pending.

2026-11-07 R3d-c: domain/API/web builds, whitespace checks and 194 offline tests passed: 110 existing API tests and 84 DOM tests (10 new candidate/screening-import cases plus 74 existing). The new cases cover dirty/cleared candidate answers, a selected document, preview exclusion and preservation of a dirty vacancy guard, pending submission blocking then explicit leave, clean self-redirect after submission, staged-import dirty state through Hide import and Close wizard, route discard without apply, pending preview blocking, and clean apply success. Link checking found 257 local links across 46 files with the same 38 pre-existing anchor-resolution false positives as main. These are JSDOM fixtures: native browser history UI, reload/close prompts, focus/inert behavior, file-picker behavior, authenticated HTTP/logout isolation and real delayed/uncertain responses remain Q-R3DC manual QA. No migration, data/seed/provider/key/config/browser-automation/service operation or runtime backend/permission change; 007/008 remain unapplied. Q-R3DA/Q-R3DB/Q-R3DC and every earlier Q-* gate remain pending.

2026-11-07 T2a: domain/API builds, whitespace, 82 local Markdown target paths across eight edited documents (not anchors) and 33 scoped offline tests passed (13 new lifecycle catalog/CLI/transaction-model cases plus 5 existing processing and 15 readiness cases). Checks cover stable identity/relative chronology, validated submissions/trusted fixture schema, intended readiness, scoped reset/preserve, new demo-owned submissions, password/unrelated-data preservation, canonical byte reuse, corruption/lease/non-fixture refusal and rollback/ambiguous-commit cleanup. The plan-only CLI was exercised without runtime credentials or a valid DB URL. Models do not execute PostgreSQL SQL/FKs or prove file persistence, authenticated HTTP/projections, real concurrency or native UX. No seed/reset, migration, DB/data/provider/key/config/browser/service operation was performed. Migrations 007/008, Q-T2A and every previous Q-* gate remain pending; T2b is not implemented.

2026-11-07 local demo launch (after T2a): all workspace builds passed, with existing non-fatal Zod annotation warnings. Existing host-network PostgreSQL/Redis/Mailpit containers restarted with volumes preserved; no DB deletion/reset was needed. Better Auth migration tooling completed with a `rateLimit.lastRequest` expected-number/actual-int8 warning (not investigated here). Application migrations 007/008 applied successfully. First lifecycle seed committed five vacancies/25 applications/25 documents; all 25 stored object SHA-256 hashes verified through `LocalDocumentStorage`. Stage counts: received 10, preselected 3, interview 6, not_selected 2, offer 2, hired 2. API direct/proxied `/api/health/ready` returned ready with database/Redis ok; frontend `/` returned HTTP 200. API and Vite remain in `workspace:backend`/`workspace:frontend`; mail is local-file, reader/executor/extraction disabled, no processing or retention runner. No provider/key/spending/Redis-namespace change, browser work or functional QA gate execution. Q-T2A is only partially evidenced by initial seed/files, not passed; reset, authenticated workflow/privacy/race/manual checks and every other Q-* gate remain pending. The user accepts disposable development recruitment data including manual entries when useful for QA/migration; no deletion was necessary in this setup.

### UI overhaul and consistency checks — 2026-11-09

Recorded evidence from the implementation sessions (not rerun by this docs reconciliation):

| Slice | Checks reported passing at that checkpoint |
| --- | --- |
| Agenda context | 12 new state/DOM cases; 96 web tests, domain build and web typecheck/build. The 12 also passed in America/New_York |
| Vacancy list / inspection | Respectively 7 / 12 new DOM cases and 103 / 115 web tests, web typecheck/build and diff checks |
| Application inspection | 10 new DOM cases; 125 web tests, web typecheck/build and diff checks |
| Recruitment dialogs | 19 new DOM cases; 144 web tests, web typecheck/build and diff checks. The 19 also passed in America/New_York |
| Later filters/status/entry/agenda/form/review/export slices | Domain/API/web builds as recorded per slice on the board; static/diff and focused pure export/CSV/grouping checks where recorded. No new broad-suite or authenticated SQL/HTTP claim |
| Final consistency pass (`73bb014`) | Web typecheck/build and all 7 `tests/ui-consistency.test.mjs` checks; staged diff check. Covers readable published plan, draft-local refresh/latest separate revision on Save, empty vacancy scope, topbar-only interviewer Inbox/read-before-open, duplicate agreement/conflict/reason handling, one final-confirmed apply and human answer/status/validation labels |

The final proxied readiness probe at `127.0.0.1:5173/api/health/ready` returned ready (database/Redis ok). Commits `0fdc705` / `73bb014` were locally merged without squash as `cebce84`; main matched the branch content and was clean immediately afterwards, with no push. Preview worktree/services were retained. These are dated observations, not proof of backend work-filter activation or later service state.

Earlier suite counts are successive checkpoint totals, **not additive or a full-suite pass for the final code**. Later view/label fixtures need adaptation. JSDOM stubs native dialog lifecycle, not focus/inertness/history/new-tab behavior. Authenticated private projections, real plan/review/screening conflicts, SQL counts/filter/export parity and CSV round trips remain Q-UX/earlier Q-*; no live-provider evaluation or new data/browser/process operation accompanied the consistency pass.

## Manual QA report

User-reported checks from 2026-11-08 are retained below. They are positive/negative UI-path evidence, not independently observed per-step assertions, complete gates or a retest of every later overhaul change. Do not reset coverage to zero or require repetition of all successful paths by default.

| Area | Reported result | Remaining limits |
| --- | --- | --- |
| Release / review | Pending application through manual release, corrections, completion and frozen/read-only review: "all works I think" | Q-B1R/Q-B1J/Q-R3C SQL/rollback/race/privacy/native remainder; no automatic inference of every step |
| Empty-plan progression | Same application Preselect → explicit owner Offer → separate Hired worked | Not all role/Origin/stale/race cases; inboxes were not checked in this path |
| Configured-plan Offer | Partial-pass blocked Offer, second recruiter could not finalize all-passed, owner explicitly recorded Offer with results retained | Not direct HTTP denial or PostgreSQL count/lock proof; Q-B1F remainder |
| Ordinary-failure screening | Direct rejection, review lock and generic candidate notice procedure worked | Full Q-SI/privacy/late-write/race/rollback gates remain |
| Interview Fail / cancellation | Future HR appointment/Inbox visible to second assignee; after first-assignee Technical Fail, remaining appointment left ordinary view and remained in Cancelled | Not deletion; final-state/immutable-feedback/all-recipient/revoked-document assertions not individually confirmed |
| Rescheduling | User located the Demo 16 upcoming appointment; responsible staff request, related Inbox/navigation and HR rescheduling worked | Overlap rejection explicitly not checked; timing/assignment/recipient/race matrix incomplete |
| Candidate screening Inbox | Preselection notice visible; Mark as read hid it from Unread, All showed it again | Expected filtering, not deletion; not proof of cross-account isolation, staff matrix, deduplication or retention |
| Seeded-state / CSV inspection | Several declared states inspected (not transitions); user reported error detection but poor import/export/UI clarity | No successful real CSV apply or complete fixture/reset workflow established. Pure parser checks on the earlier synthetic sample were not DB/HTTP checks |

Feedback disposition: email/form clarity, visual/action hierarchy, candidate public outcome mismatch, duplicate-entry presentation, list/agenda memory and compact/grouped decision files are now implemented in merged source. Their original reports are not pending implementation. The candidate's only earlier preselection notice remains consistent with the still-unimplemented appointment/Fail/Offer/Hired notification effects. UX-NAV (missing sidebar item), the later correct-literal CSV/error report (exact pair not retained) and the lock-wait timing source risk remain open; do not explain away the later error using the older `refused` sample. [Feedback/source evidence](../plan/hr-export-import-ux.md).

## Contract gaps

The static OpenAPI files lag the version-2 CV definitions, first-publication
context, Choice result envelope and question-level correction/review/export
contract in the unmerged worktree (and previously lagged skills extensions).
Use the processing contract/source until aligned; no final schema check was
run after the user's stop instruction. Their earlier move into `contracts/`
did not fix schemas. `review_ready` remains accepted though no current command
writes it. Prose does not silently change wire behavior.

## Presentation

Separate workspace: [presentation](../../presentation/README.md), shared tracked [PDF](../../presentation/exports/status.pdf). 36 pages (30 content plus six intercalaires), proposed CAP name, six supplied images preserved without cropping, three coded diagrams. Content/name/framing await review. No invented methodology, history or live-AI results; no presentation build or visual changes in this documentation checkpoint.

Presentation documentation links now use the new paths. The existing reading-slide generator caption still names the historical `docs/status.md`; updating that caption and rebuilding the PDF belong to the later presentation checkpoint, not this docs-only move.
