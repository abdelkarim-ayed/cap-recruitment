# CV extractor implementation checkpoints

2026-11-13. Bounded worktree: `cv-extractor-integration`, based on local main
`8eb0d6d`. The existing uncommitted seven documentation files and complete
`research/cv-extraction-lab/` were copied from main; this is not another lab
transfer. Main, retained UI worktree and services are untouched. No commits,
database execution, deployment or provider calls are authorized/performed.

## 1 — Offline contract port

Foundation modules, subsequently wired into source by checkpoint 3 below:

- `packages/domain/src/cv-extractor.ts`: flat transferred schema, exact family
  wording/criteria, hydrated request builder, independent correction validation,
  shared review/export field descriptors and effective-value projection.
- `packages/domain/src/extractors.ts`: code-owned extractor capability registry;
  only `cvExtractor` exists. Version-2 processing definitions keep one task per
  configured document input: `{id,sourceInputId,outputKey,type,args:{questions}}`.
  Question IDs are case-sensitive and scoped to their extractor, not lowercased
  platform IDs. Field columns are `<outputKey>.question.<questionId>`.
- `apps/api/src/processing/cv-response.ts`: complete Choice wire validation and
  normalization. Raw probabilities/confidence/model/usage/extensions retained;
  only floating-point sum/winner consistency tolerance (`1e-6`), no quality
  threshold, renormalization, cap or inferred answer. A returned tie is retained.
- `integrations/jev/jev-request.ts`: one effective serializer/hash boundary,
  used by existing gateway transport without changing model/budgets/settings.
  Hash UTF-8 serialized hydrated bytes after the effective model override;
  preserve property/criteria order. Checkpoint 2 supplies the memory caches.

Original normalized values: education/experience/evidence category keys,
certification boolean, coverage integer. Pending/failed extractor fields are
unavailable (`null`), never synthetic false/zero/not-stated. Correction identity
is `(applicationId,taskId,questionId)`; explicit null is an override; absence
uses the original; removal requires `value:null`. Whole correction sets validate
before any later mutation. Actor/revision/no-op/fencing enforcement remains the
existing service's responsibility at checkpoint 3, not solved by pure helpers.

Offline fixtures: all three latest rendered requests must match compact JSON
exactly; all 20 archived responses validate against **their own** recorded
requests. These are different evidence sets, not current-prompt accuracy tests.

Verification on 2026-11-13: domain/API builds and web typecheck passed; all 12
new domain checks and 12 focused API checks passed (four new CV checks plus
eight existing parser/processing checks). The tests replay all 20 recorded
pairs/102 answers without provider execution. Existing dependencies installed
offline from the frozen lockfile, with scripts disabled and no downloads.
The broader domain suite exposed an unrelated existing duplicate-screening-CSV
test failure at `packages/domain/src/screening.test.ts:18`; reproduced unchanged
in `/home/ubuntu/code`. Left outside this scope, not described as a full pass.
Copied research/documentation bytes verified against main before intentional
destination planning updates. No database/HTTP/race/manual or live-quality
verification at this checkpoint; native Node evidence follows below.

## Source-only storage schema — do not execute

Reuse private documents, immutable application snapshots, `application_tasks`
and the application lease/review revision. No separate question jobs, event bus,
new service or durable Markdown/response cache. Old platform recruitment data
need not be migrated or reinterpreted; update source seed/demo fixtures when
runtime schema changes. Actual cleanup/reseed requires separate authorization.

Unapplied migration 010 adds:

```sql
ALTER TABLE vacancies ADD COLUMN extraction_reference_date date;

CREATE TABLE extraction_field_corrections (
  application_id uuid NOT NULL,
  task_id text NOT NULL,
  question_id text NOT NULL,
  value jsonb NOT NULL,
  corrected_by text REFERENCES "user"(id) ON DELETE SET NULL,
  corrected_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (application_id, task_id, question_id),
  FOREIGN KEY (application_id, task_id)
    REFERENCES application_tasks(application_id, task_id) ON DELETE CASCADE
);
```

`value` contains JSON null for an unknown override, not SQL NULL. Schema only
enforces storage shape/identity; validate family/category/count against the
immutable definition under the application lock. Extend staff correction flags
and queries, not candidate/interviewer projections. Do not add fields to the
public form definition that would disclose extractor configuration.

Stamp `extraction_reference_date` once in the locked successful draft→published
UPDATE, using `(statement_timestamp() AT TIME ZONE 'UTC')::date`. Existing dual
revision checks remain. Draft/no-op/failed publication/close do not establish or
move it. Copy its `YYYY-MM-DD` string into the submission's immutable vacancy
snapshot. Production extraction requires it; previews explicitly resolve today
as provisional. No backfill from creation/update timestamps.

Task `result` holds `{status:'completed',value:{version:1,fields,rawResponse}}`
for one complete validated batch. Failure retains the existing structured
failure categories and null value. Private task provenance holds source hash,
parser version/options/Markdown hash/warnings, reference date, exact request
bytes/hash, mode and cache-hit/source-attempt identity. Raw response usage is an
observation of the original attempt; reuse is not a second billed observation.
Original task results and per-field HR overrides are separate.

## 2 — Parser, memory caches, attempt safety (source implemented, not activated)

User approved this offline checkpoint, dependency/lockfile edits and source-only
SQL via the ask tool. No existing local/global installation found. Installed
`@firecrawl/pdf-inspector@1.25.2` as a project dependency with scripts disabled;
the backend imports its native API. It also ships a CLI, but no global install
or CLI-based production path was introduced.

`cv-pdf-reader/worker.ts` use a credential-free killable child, native async APIs
only, 10 MiB input/20 pages/60,000 Markdown characters/eight seconds/192 MiB V8
heap plus bounded diagnostic IPC. Native allocation is not bounded by the V8
heap: this is not an OS sandbox or total-memory guarantee. Timeout/cancellation
SIGKILLs only the parser child. Empty/incomplete-native/OCR-required input fails;
encoding warnings remain visible. No OCR, hosted fallback, silent truncation or
authoring-Markdown substitution. Diagnostics include original encoding/layout/
OCR flags, OCR reasons and CMap gaps.

`cv-memory-cache.ts`: LRU parser cache by PDF hash + parser version/options, and
validated-success response cache by effective request hash + exact-byte equality.
Each store is bounded to 32 entries/8 MiB, including request bytes; fixture/live
responses have separate stores. Values are copied, oversized entries skipped.
Private source access/integrity must precede the cached reader; coordinator cache
hits check active task/application fences. No filesystem cache, automatic loading
from research artifacts, durable response cache or recovery on restart.

`cv-attempts.ts`/`cv-attempt.repository.ts` and **unapplied migration 009** implement
a unique `(mode,request_hash)` guard with owning task/token/attempt, state/count
and retry timestamps. No raw Markdown/requests/responses in that table. No foreign
key to disposable recruitment rows: deleting applicants must not erase knowledge
of earlier sends. Never reset this ledger as part of demo cleanup. The owning
application lock and request row serialize send boundaries; stale prepared owners
cannot later send. `send_started` commits before transport; unknown acknowledgements
or expired sending remain blocked/uncertain. Cross-worker duplicates decline.
The guard records transport knowledge even after HR release, without writing
application evidence or reopening work. Cache loss after success/uncertain sends
never authorizes another payment. Real PostgreSQL race behavior is not verified.

Only demonstrably unsent operational failures are automatically retryable under
the initial safe policy; content/config/unsupported-input failures do not loop.
Whole-task retries may reuse either memory cache. The request guard uses a
12-hour unsent retry delay and maximum three send boundaries; checkpoint 3 must
replace the legacy task runner's 30-second schedule for this extractor.
Known provider rate-limit retries need an explicitly approved policy; ambiguous
sends never qualify. Successful/cancelled/released/review-completed/screened work
does not restart. No hidden SDK retries or expired-lease escape from send guards.

Gateway source now provides prepared exact-byte requests, typed unsent/known-
response/ambiguous failures, and three-second Redis operation deadlines (matching
its prior connect bound). Admission/transport have no retries/refunds. Existing
endpoint/model/namespace/budget/request/response/HTTP-timeout controls unchanged.
Checkpoint 3 wires the coordinator into Nest processing and changes interrupted
claim recovery. Running main/services remain unchanged; no executed safety pass
exists for that final integration.
Known provider 429 remains terminal under this conservative policy. Invalid
complete responses retain private raw diagnostic data, not fabricated fields.
No gateway/Redis/spending test or provider call was run. Propose sizing changes
if needed; do not raise limits, truncate CVs or split paid requests silently.

Offline evidence: three native Node parses (`precv-001-cobalt-cv`,
`precv-003-jsume`, `precv-003-vercanard`) exactly match recorded Python Markdown
bytes, source hashes and compared diagnostic flags. JSume's encoding warning
remains true. Three layouts/PDFs represent **two CV identities**, not independent
accuracy trials. This is a small feasibility comparison, not corpus/semantic QA.
The focused parser/cache and fake-worker tests cover kill/cancel/bounds, cache
identity/eviction/mode isolation, duplicate workers, lost acknowledgements,
restart refusal, unsent delay, malformed output and closure. No real DB/HTTP
concurrency, privacy/manual or live-provider acceptance claim.

## 3/4 — Vertical source integration (approved; untested/unbuilt)

The user approved the combined backend/minimal UI checkpoint via the ask tool,
then explicitly instructed **no further tests**. No test/build/typecheck or data
operation was run afterwards. Prior checkpoint passes are not a final-state pass.

- `vacancies.ts` now accepts version-2 CV processing definitions; capability
  registry entries own field IDs, projection and correction validation. Only CV
  exists; no speculative extractor or generic workflow engine was introduced.
- Vacancy publication atomically stamps the UTC date and submission snapshots
  carry it. SQL explicitly casts DATE to text, avoiding driver timezone coercion.
  Old records are not backdated/converted; recreation conflicts are explicit.
- Processing now reads Markdown/provenance, builds one request per extractor and
  uses the guarded coordinator. Successful task saves are final; interrupted
  recovery consults durable send knowledge. Whole-run guard failures stop further
  admissions; only safe transient/pre-send failures get delayed retries.
- Backend background runner is disabled by default and supports only explicitly
  bound trusted fixtures, with one non-overlapping claim per tick. No startup
  live drain. CLI/demo commands require it disabled; unattended live mode refused.
- Review persists separate `(application,task,question)` overrides, typed null/
  remove/value validation, unchanged-write no-ops and independent actor/time;
  existing application lock/revision/readiness/closure/release fences remain.
- Diagnostic and compact effective CSV share configured field identities and
  effective projection, with existing privacy/quoting/caps/import rules.
- `cv-extractor-editor.tsx` keeps the form-builder style: repeated ordered family
  controls, named values/accepted terms, OR scopes and optional education window.
  Exact generated question/choices update offline; a wording-pattern disclosure
  uses argument markers and optional clauses. Draft dates are visibly provisional.
- HR review uses per-question native controls and source-PDF association. Drafts
  are keyed by task+question; saving one preserves siblings. Existing focused
  dialogs, navigation/dirty/pending, explicit refresh/reapply and completion
  guards are retained, not replaced by save-all. Technical identities secondary.
- Demo/lifecycle source fixtures now declare all five families, zero simulated
  usage and independent category/null-count corrections. Fixture text is labelled
  not parsed; it does not pretend native parsing/model quality. Legacy Noul/
  PDF.js task executor/scaffolding is retired. No seed/reset was executed.

Remaining limitations are explicit: final source is not compiled/tested; real
SQL/HTTP/native/privacy/race acceptance is not established; old test/smoke/view
fixtures and static OpenAPI still need alignment with the new contract. These
are not permission to run tests against the user's instruction or execute data
operations. The current contract owns the new wire behavior; no full delivery,
quality result or live-readiness claim. No ranking/recruitment/backlog work.

Live execution stays disabled; runtime/database/manual verification is a separate
gate from source/static/fixture checks. Any paid/live or database execution,
service changes, commits/merge/push require separate scoped authorization.

## RAM-only key control follow-up — explicitly approved, source only

User selected local hidden-input/stdin → Unix socket / Windows named pipe →
in-memory gateway rotation, with empty startup and no environment/file fallback.
Implemented per-process private credentials and local control/CLI; prepared
requests capture one key, while status exposes no key material. Unix ownership/
mode checks and Windows current-user DACL/same-handle owner checks fail closed.
No new dependency/service/HTTP endpoint. Provider execution and spending controls
remain unchanged; empty credentials do not consume unbound pending work. An
explicit CLI run waits for its own credential preflight without bypassing consent.
No real key was read/set, no provider call or service operation performed, and
no test/build was run. [Guide](../../current/guides/jev-key-control.md) records
commands, Windows verification limits and same-user/RAM security boundaries.
