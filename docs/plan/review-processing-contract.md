# P0-S — optional review readiness and manual release

Checkpoint: 2026-11-07. User selected release of **any unfinished work**, including active processing, rather than a stall timer, then approved bounded B1-R and B1-J checkpoints with fixture/disabled AI only. **Backend and UI/list/filter are source-implemented; migrations 007/008 and real integration/manual verification remain pending.** Implemented rules live in the [current contract](../current/contracts/processing-review-api.md#optional-shared-review); [status](../current/status.md) distinguishes checks from deployment. No live-provider smoke testing, API-key change or operational actions authorized.

## B1-J — source delivered; remainder separately scoped

- Current release/detail/list/filter and draft-conflict behavior is specified in the current contract, not duplicated as future work here.
- R3c source implements semantic review no-ops; R3d-a adds review-only Stay/discard navigation protection. Q-R3C/Q-R3DA retain real integration/native/manual evidence. Other editor dirty/navigation guards remain R3d-b.
- Workload counters, new notifications, provider batching and attempt recovery are separate checkpoints, not authorized by B1-J.

## Attempt-boundary obstacle and checkpoint boundary

Current `ProcessingRepository.claim` changes interrupted processing tasks to retryable without durable knowledge of live admission. This contract must not treat that recovery or retry exhaustion as normal settlement. It does **not** fix safe paid retry or authorize unattended execution. [B4-S](tasks.md) still owns durable attempt-boundary/recovery correction before B4-R; no continuous runner or automatic bulk drain.

B1-R maps explicit unavailable-source/document failures to ordinary terminal; timeouts/storage/disabled execution and fixture setup errors to operational; unexpected/legacy failures remain unclassified and interrupted recovery uncertain. These do not open normal review. Any recovery-policy change beyond conservative classification remains a separately approved safety slice, not hidden in review UI work.

## Implementation and remaining verification gates

1. **B1-R backend — source implemented:** additive schema source, typed classifications/readiness/release projection, release endpoint, transactional processing/review guards, API contract. No operational migration execution.
2. **B1-J — source implemented:** explicit confirmation, shared readiness list/export filtering, original-state-preserving presentation and local draft comparison/reapply. Real SQL/HTTP/manual checks remain Q-B1J.
3. **Scoped offline checks — passed:** B1-R's 40 offline checks plus B1-J's 4 new projection/filter/export and 8 new DOM cases, with 11 selected existing DOM cases; details in status. Fake-transaction/model/SQL-capture checks are not PostgreSQL concurrency/filter-parity evidence.
4. **Separately authorized integration/manual gate:** migration ordering, authenticated role/Origin/privacy checks, real PostgreSQL rollback/races/lease recovery and manual UX. No provider calls, browser automation or process operations implied.

Preserve Q-B1J, Q-B1R, Q-SI, Q-B1P, Q-B1F and earlier Q-R* todos. These source checkpoints pass none of those integration/manual gates. No migration application, reset or re-fixturing is authorized.
