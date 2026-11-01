# Jev: mandatory safeguards and current extraction

Read this before Jev work and load project skill `typesafe-ai`. Implementation permission, a funded account, fake data or this document is not permission for paid calls or spending-limit tests.

## Red lines

- All real calls, including future probes/benchmarks/tests, must use `apps/api/src/integrations/jev/jev.gateway.ts`. Never add direct fetch/SDK/key routes to bypass it.
- Do not raise/reset limits, alter the Redis namespace/volume, endpoint/model or introduce automatic live retries without explicit scoped approval. An exhausted allowance is a stop condition.
- Never read/print/commit credentials. Key environment reference: `JEV_API_KEY`. Standalone `extraction:probe` is parse-only and rejects skill arguments.
- Keep reader/executor defaults disabled. No unattended/bulk live drain, paid validation or quota test is authorized. Only separately approved synthetic inputs for any live evaluation.
- User's overall development/showcase spending ceiling is $5, not a target. Request allowances are not currency accounting. No verified per-CV cost/throughput supports large-scale price claims.

## Fixed gateway configuration

Source: `apps/api/src/integrations/jev/jev.config.ts`. Endpoint `https://api.typesafe.ai/v1/systemone`, pinned model `jev-1.14.0`, namespace `recruitment:jev:spending-guard:v1`. One active Redis lease, three attempts per rolling minute, twenty attempts total (no total TTL). Failed/uncertain admissions consume allowance. Redis unavailable blocks calls; HTTP has no retry. Lease 60 seconds, HTTP timeout 10 seconds, request 60,000 bytes, response 1,000,000 bytes, redirects rejected. Preserve Redis storage; a timeout is not proof external billing stopped.

## Selected starter (merged, fixture-tested only)

- HR supplies predefined skills; trim/lowercase/deduplicate. One grouped Noul question per skill against shared CV text. Detect claimed knowledge/use (lists, coursework, projects/work); exclude negation, requirements and unrelated mentions. Positive >=0.8 is provisional, not verified competence.
- Persist compatible `{skills:[detected names]}` JSONB. Project `skillResults:[{skill,original:boolean|null,effective:boolean|null}]` from frozen configured skills.
- Corrections can include `unavailableSkills`; omitted skills false, explicit unavailable null. Whole-list/null corrections remain supported. UI sends sibling unknowns explicitly. Actor/time/revision remains task-level.
- CSV retains old columns and appends URI-encoded lower-case skill original/effective columns (blank for null). No migration/rewrite of old results was required for this slice.
- Noul emits no quotations. Legacy evidence flag remains accepted; new form tasks default false. Earlier excerpt-choice implementation is superseded, not a second active extractor.

Real reader: PDF.js 6.4.299 in a killable child without inherited credentials; text-native PDF, 10 MiB, 20 pages, 60,000 characters, eight-second timeout, 192 MiB V8 heap cap. Not an OS sandbox/complete native-memory quota. DOCX/OCR/rectangles absent. Executor separately bounds 12,000 characters and 20 skills and checks serialized payload length; gateway enforces bytes. These are current development bounds, not approved production sizing policy. Do not change them during documentation cleanup.

## Wiring and recovery limitation

`processing/settings.ts` selects reader/executor; `processing.module.ts` injects JevGateway through the narrow decision-client port. Fixtures dispatch through context ports; no missing-fixture live fallback. CLI requires explicit application selection for live mode unless a separate bulk override is set; that override is not consent.

### Recovery limitation

Returned live failures and the service timeout after entering a live executor are persisted non-retryable. However, `ProcessingRepository.claim()` unconditionally marks interrupted `status='processing'` tasks retryable on expired-lease recovery. Executor provenance is saved only with the result. A crash after admission/before persistence cannot therefore be safely distinguished from pre-call interruption. Fencing prevents stale database writes, not a second paid call. This contradicts the intended no-automatic-live-retry guarantee in this edge case. **Do not enable a continuous live runner until an explicit attempt-boundary/recovery design addresses it.** No spending tests were run to reproduce this source-level finding.

Redis command timeout/disconnection behavior also needs review before unattended operation. No guard changes or tests follow from this finding; see [processing obstacle](../plan/changeability.md#processing-and-operations).

## Evidence provenance

Skills commit `9e5f7c8`, main merge `fd9fe9e`; prior documentation preserved in `74d4cf2`. Historical checks in [status](status.md). No live acceptance/quality evaluation, gateway-limit tests, pending-record execution or production guarantees. Earlier direct-transport commands in Git history must never be run as live instructions.
