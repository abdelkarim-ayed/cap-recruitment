# Implementation status

Product baseline: local main merge `fd9fe9e` (skills implementation `9e5f7c8`), plus documentation updates, R2 notification-policy extraction and R3a/b vacancy draft/interview-plan no-op saves on 2026-11-02. This is an inventory, not a process/listener report.

## Implemented

- React/Vite + NestJS + shared TypeScript/Zod domain package; PostgreSQL, local private file storage, Redis connectivity and Jev admission guard.
- Better Auth email/password, candidate signup and one-time verification, reset codes, provisioned staff. Legacy OTP endpoints remain regression paths, not the UI login.
- Owner-managed vacancy drafts, generic input/task editor, publish/close, frozen published intake and allowlisted public projections.
- Immutable candidate submissions, identity/definition snapshots, duplicate prevention, bounded uploads, authorized downloads and native PDF preview.
- Explicit processing CLI with per-application leases, task results and fixture dispatch. Real text-native PDF preparation. No automatic extraction runner.
- Selected guarded Noul skills starter: normalized predefined skills, >=0.8 positive, per-skill original/effective tri-state projection, corrections and CSV. No quotations from Noul; defaults disabled; no live validation.
- Shared HR extraction review; no-task records automatically marked not applicable/completed. CSV exports all vacancy applications regardless of review, filters or recruitment stage.
- Vacancy interview steps, HR scheduling, one responsible assignee per application/step, final assessment, terminal Fail, owner Offer/Hired, internal inbox and read-retention command.
- R2: pure typed existing staff notification policy, separate command-cause types and unchanged transactional persistence. Recipient/content ownership moved out of InterviewService; no candidate effects, schema/API/UI changes or runtime acceptance claim.
- R3a: current-identical normalized draft vacancy PATCH returns unchanged revision/time and full staff owner metadata. Owner/draft/stale checks remain authoritative; real changes increment once. No UI/interview/review or publish/close-policy changes.
- R3b: current-identical normalized interview-plan PUT preserves IDs/positions and `interview_revision`, including empty plans. Separate owner/revision/scheduling-freeze checks remain authoritative; real edits still replace all rows/new IDs and increment the counter once. No UI, notification or publication-rule changes.

## Important current limits

- Candidate view remains submission receipt (`received`); no candidate business notifications, published decisions or interview details.
- `review_ready` is accepted vocabulary but has no workflow writer. Processing and review state are separate from recruitment stage.
- Publication does not require interview steps. Steps freeze when the first interview instance exists, not when the vacancy publishes.
- No bulk selection/import/reversal; no panels, retries or reopening. Closing a vacancy stops intake, not ongoing interviews.
- Saving identical review data can still increase revision; draft vacancy/interview-plan no-op fixes are not a general revision framework. Counters remain concurrency controls, not history.
- Live failures returned by the executor persist non-retryable, but interrupted execution recovery marks processing tasks retryable without knowing whether a paid attempt occurred. [Safety detail](jev-safety.md#recovery-limitation).
- PDF only for real parsing (DOCX may be accepted as an upload, but cannot be parsed). No OCR, guaranteed complex-layout reading order, rectangles or extraction-quality measurements.
- Private storage can retain orphans after crashes/cleanup failures. No global storage quota/reconciliation yet.

## Verification evidence

Reported at the 2026-10-31 skills checkpoint: 42 API + 16 domain + 29 DOM tests (87 total), domain/API/web builds and real PDF/PostgreSQL fixture integration including per-skill correction/export. Earlier checkpoints report vacancy/intake/interview concurrency, private-file authorization and password/OTP integration checks. These are historical check results, not a fresh test run or live-provider evaluation.

The docs-only reorganisation checks paths, links, JSON references and unchanged runtime sources. It does not rerun application integration scripts, start services or mutate fixture data. Native browser behavior, inbox reports and actual provider quality remain unverified in this pass.

2026-11-02 R2 checkpoint: API `typecheck` (`tsc --noEmit`), whitespace checks, 148 local Markdown links/anchors and 341 OpenAPI references passed. Application unit/integration/DOM tests were not run, at the user's request; automated matrix/rollback/privacy regression remains Q-R2A and later batched manual UX remains Q-R2U on the [board](../plan/tasks.md). Static checks are not evidence those behavioral checks pass. No browser automation, provider calls, data changes or process management performed.

2026-11-02 R3a checkpoint: API `tsc --noEmit -p apps/api/tsconfig.json`, whitespace checks, 150 local Markdown links/anchors and 341 OpenAPI references passed; the OpenAPI diff is limited to the vacancy PATCH description. Unit/repository/HTTP/DB regression was not run, as approved; Q-R3A remains outstanding on the board. Existing tests are historical evidence, not verification of the changed behavior. No application execution, UI/browser work, provider calls, database operations or process management performed.

2026-11-02 R3b checkpoint: API `tsc --noEmit -p apps/api/tsconfig.json`, whitespace checks, 152 local Markdown links/anchors and 341 OpenAPI references passed; the interview OpenAPI diff changes only the plan PUT description. Application/DB/DOM regression was not run; Q-R3B remains outstanding, not reported passed. No application execution, browser work, provider calls, database operations or process management performed.

## Contract gaps

The static OpenAPI files lag live-provenance/per-skill response and correction extensions; use the processing contract and source until aligned. Their move into `contracts/` does not fix their schemas. `review_ready` remains in schemas because it remains an accepted value, despite being unreachable through current commands. Prose corrections do not silently change wire behavior.

## Presentation

Separate workspace: [presentation](../../presentation/README.md), shared tracked [PDF](../../presentation/exports/status.pdf). 36 pages (30 content plus six intercalaires), proposed CAP name, six supplied images preserved without cropping, three coded diagrams. Content/name/framing await review. No invented methodology, history or live-AI results; no presentation build or visual changes in this documentation checkpoint.

Presentation documentation links now use the new paths. The existing reading-slide generator caption still names the historical `docs/status.md`; updating that caption and rebuilding the PDF belong to the later presentation checkpoint, not this docs-only move.
