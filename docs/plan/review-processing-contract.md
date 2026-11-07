# P0-S — optional review readiness and manual release

Checkpoint: 2026-11-07. User selected release of **any unfinished work**, including active processing, rather than a stall timer, then approved the bounded backend slice with fixture/disabled AI only. **B1-R backend is source-implemented; migration 008, B1-J UI/list/filter and real integration/manual verification remain pending.** Implemented rules now live in the [current contract](../current/contracts/processing-review-api.md#optional-shared-review); [status](../current/status.md) distinguishes checks from deployment. No live-provider smoke testing, API-key change or operational actions authorized.

## B1-J — proposed next checkpoint, needs approval

- Consume backend readiness/release/action availability in review detail. Keep answers/files viewable before readiness and screening actionable independently.
- Add concise explicit release confirmation: permanently stop further processing, retain unavailable values, no automatic human completion or screening decision; admitted external work may still cost money.
- Extend factual application list/filter/action projection. Distinguish pending, ordinary terminal failure, operationally blocked, released and screening-frozen review; do not relabel aggregate execution status as successful processing or “ready for preselection”.
- Preserve unsaved review input on conflict for explicit refresh/reapplication; no automatic merge/retry. Coordinate R3c/d semantic no-op work separately around the final review lock boundary.
- Keep staff-only readiness/release/failure fields out of candidate/interviewer projections. No workload counters, new notifications, provider batching or generic workflow/history engine.

## Attempt-boundary obstacle and checkpoint boundary

Current `ProcessingRepository.claim` changes interrupted processing tasks to retryable without durable knowledge of live admission. This contract must not treat that recovery or retry exhaustion as normal settlement. It does **not** fix safe paid retry or authorize unattended execution. [B4-S](tasks.md) still owns durable attempt-boundary/recovery correction before B4-R; no continuous runner or automatic bulk drain.

B1-R maps explicit unavailable-source/document failures to ordinary terminal; timeouts/storage/disabled execution and fixture setup errors to operational; unexpected/legacy failures remain unclassified and interrupted recovery uncertain. These do not open normal review. Any recovery-policy change beyond conservative classification remains a separately approved safety slice, not hidden in review UI work.

## Implementation and remaining verification gates

1. **B1-R backend — source implemented:** additive schema source, typed classifications/readiness/release projection, release endpoint, transactional processing/review guards, API contract. No operational migration execution.
2. **B1-J:** consume the same facts in detail/list/actions and matching filters; concise release confirmation. Coordinate R3c/d no-op/conflict UX separately around the final lock boundary, not a legacy review path.
3. **Scoped offline checks — passed:** 15 new readiness/service/repository/fixture tests plus 25 focused existing checks; details in status. Fake-transaction/model checks are not PostgreSQL concurrency evidence. B1-J needs its own projection/DOM checks, not a reused backend pass.
4. **Separately authorized integration/manual gate:** migration ordering, authenticated role/Origin/privacy checks, real PostgreSQL rollback/races/lease recovery and manual UX. No provider calls, browser automation or process operations implied.

Preserve Q-B1R, Q-SI, Q-B1P, Q-B1F and earlier Q-R* todos. This source checkpoint passes none of those integration/manual gates. No migration application, reset or re-fixturing is authorized.
