# Jev: mandatory safeguards and CV extraction

Read before Jev work and load project `typesafe-ai`. Source implementation,
funding or synthetic fixtures are not authorization for paid/limit tests.

## Red lines

- Every real call uses `apps/api/src/integrations/jev/jev.gateway.ts`; no direct
  fetch/SDK/key route or probe bypass. Standalone extraction probe is parse-only.
- Never read/print credentials, alter endpoint/model/limits/Redis namespace,
  refund/reset counters or renew allowance without explicit scoped consent.
  Exhausted allowance stops execution. The user explicitly authorized RAM-only
  local credential loading/rotation; the gateway no longer reads `JEV_API_KEY`.
  This is source permission, not authorization for an agent to read/set real keys.
- Reader/executor/runner defaults stay disabled. The user explicitly approved real
  execution for **new synthetic submissions** after the fixed launch boundary;
  only that cohort is enabled. No historical/bulk unscoped live drain, agent paid
  evaluation or quota test is authorized. Overall development/showcase
  ceiling is $5, not a target; request counts are not currency accounting.
- No SDK or hidden transport retries, OCR/hosted fallback, default payload logs
  or fixture execution in production. Keep candidate data private.

## Fixed gateway controls

`jev.config.ts`: `https://api.typesafe.ai/v1/systemone`, `jev-1.14.0`, shared
namespace `recruitment:jev:spending-guard:v1`; one active Redis lease, three
admissions/minute, twenty total without total TTL. Failed/uncertain admissions
consume allowance. Lease 60 seconds, HTTP timeout 10 seconds, request 60,000
bytes, response 1,000,000 bytes, no redirects/retries. No control values changed.
Redis operations now have a three-second deadline matching the prior connect
bound; timeout/disconnection fails closed and never refunds admission.

Effective hydrated request serialization/hash is shared with cache identity;
prepared bytes/model/hash are verified before transport. Structured gateway
failures distinguish provably unsent, known response and ambiguous send. Typed
errors, not message spelling, determine later retry policy.

## RAM-only credentials

Each process starts empty. A hidden-input/stdin CLI can set/replace/clear its key
over owner-restricted Unix IPC or a Windows named pipe. The single API socket is
acquired before worker hooks; duplicate/occupied/stale state refuses startup.
Rotation defaults to that backend, optional PID checks its identity; explicit
non-HTTP CLI workers use `--worker-pid` and separate process-local credentials.
No secret file, HTTP endpoint, key getter, environment fallback or automatic
provider validation. An in-flight request retains its captured key; later requests
use the replacement. Key updates cannot enable extraction or reset spending/send
guards. Missing credentials leave unbound live work unclaimed; explicitly bound
fixtures remain available. See [usage and security boundaries](guides/jev-key-control.md).
The scoped live backend is built/running with an empty-start control socket. The
user will reload the key after the explicitly approved restart. No real key was
accessed/loaded by the agent. Windows ACL/helper and
rotation behavior remain unverified; a running socket is not a paid-provider pass.

## Bounded source implementation — not activation evidence

Locally merged from `feat/cv-extractor-integration`, the thresholded Noul workflow is
replaced in source by one CV extractor task containing ordered Choice questions.
The exact transferred wording remains; raw choices/probabilities/confidence/
model/usage are retained. No confidence thresholds, competence inference or
extraction-driven recruitment decisions. Native pdf-inspector and private file caches
remain distinct from raw model responses and HR field corrections.

Durable `cv_request_attempts` (migration 009 now applied locally) stores send knowledge, not
response/Markdown cache data. The confirmed send boundary precedes gateway I/O;
cross-worker same-request sends are excluded. Interrupted/ambiguous sends,
unknown acknowledgements and cache loss after success do not authorize another
payment. Application-token/closure fences protect persistence, not cancellation
of externally admitted billing. Do not clear this ledger during demo/data resets.

## Recovery limitation

The earlier main implementation unconditionally retried expired processing tasks
without durable paid-send knowledge. The merged source changes claim recovery to
consult send guards and uses the new coordinator before live transport. **That
source change has not received PostgreSQL/HTTP/race or end-to-end verification.**
The earlier fake-worker tests predate final integration. The user stopped further
tests; later bounded builds/setup/RMUX startup were approved and completed in
`feat/cv-offline-demo`, with 009/010 applied. No fresh safety/quality pass may be
claimed from builds, runtime readiness or the earlier seeded fixture completion.

Validated responses now reach private atomic file cache **before** database
settlement. Unknown DB acknowledgements/task-save failures leave the task leased;
expired-lease recovery with durable send history permits **cache-only local
replay**, not another provider call or renewed attempt allowance. Missing/invalid
cache is unavailable/manual review. Original successful tasks are never rerun,
and all application closure fences apply to replay. This is source-implemented/
built, not a tested PostgreSQL/race or paid-recovery guarantee.

Only demonstrably unsent transient failures can schedule delayed whole-task
retry (12 hours/max three boundaries). Budget/config/content failures and known
provider 429 stop under the initial conservative policy; ambiguous sends never
qualify. A successful response cache hit retains original usage/attempt identity,
not a new billed observation. Private atomic file caches now retain validated
successes across restarts, separated by fixture/live mode. They are not a ledger
replacement: absent/corrupt cache after durable success still blocks another send.

Backend modes include explicitly selected offline fixtures (not real answers)
and the consent-gated `jev` runner. The latter is development-only, requires a
fixed `PROCESSING_LIVE_SINCE`, native reader and the real Jev executor, and leaves
work unclaimed while key-empty. Its post-submit wake/5s DB scans process one
application/request at a time. The user approved this bounded new-submission
scope, not old queue draining, counter renewal or agent provider diagnostics.
Existing explicit CLI selection/consent guards remain; other activation needs
separate scoped approval. See
[processing contract](contracts/processing-review-api.md) and
[checkpoint notes](../plan/research/cv-extraction-implementation.md).
