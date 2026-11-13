# CV extraction, shared HR review and export — source contract

2026-11-13: main includes `82698b8`; separately committed fixes on
`feat/cv-offline-demo` are built/running with the explicitly scoped real Jev worker,
merged on main through `e1f1d86`; Git owns remote publication state. Migrations
through 010 are applied locally; no further cache/
recovery migration. **No tests or agent live validation**; manual/privacy/race
acceptance remains pending. The user loads the key; startup is empty.
See [launch handoff](../../plan/cv-demo-launch.md) and [status](../status.md).

## Definition and publication

`processingDefinition:{version:2,tasks:[{id,sourceInputId,outputKey,
type:'cvExtractor',args:{questions:[...]}}]}`. Zero tasks is valid. A document
field may have at most one extractor; CV is currently the only registered type.
No per-question jobs, arbitrary provider prompts, ranking or recruitment effects.
Private extractor definitions remain outside the allowlisted candidate form.

Questions retain the transferred flat schema, wording, case-sensitive unique IDs,
aliases, repeated types and ordering. Families: education level (optional scope/
expected-completion window), one certification (no validity), experience bins,
coverage count and individual skill evidence. Strings or `{name,aliases}` are
accepted; aliases are directional. Optional clauses are omitted unless supplied.

First successful publication stamps `extraction_reference_date` once as a UTC
date inside the existing locked publication update, after both revision checks.
Draft edits, failed/no-op publication, close, processing and retries do not move
it. Submission snapshots store its ISO date string. Production never defaults
to today; draft previews visibly use today provisionally. Education windows are
publication-relative, with no separate awarded-status field. Review shows the
complete actual question/window, not a claim that a degree was already awarded.

Legacy recruitment records are not converted/backdated. Version-1 vacancy detail
and extraction review return an explicit recreation conflict; old vacancies
cannot accept new submissions without the new definition/publication context.
Development cleanup/reseed is a separate authorized operation, not a migration
side effect. Existing passwords, original files/results and spending state are
not rewritten by these schema migrations.

## Whole-extractor background processing

Submission commits pending work and adds a bounded memory wake hint; it never
awaits extraction. Native parsing/Jev never run inline in HTTP. Periodic DB scans
recover missed/overflowed wakes. The application lease/token, task rows, storage integrity checks
and separate review revision are reused. One configured extractor executes:
private PDF → native Markdown → one hydrated multi-question request → complete
validation → one immutable successful task result. Other extractor tasks can
settle independently. Successful tasks never rerun.

`pdf-inspector@1.25.2` runs native-only async bindings in a credential-free,
killable child. Bounds: 10 MiB PDF, 20 pages, 60,000 Markdown characters, eight
seconds, 192 MiB V8 heap and 64 KiB diagnostics. Native allocations are not an OS
memory sandbox. Empty/incomplete native text fails; no OCR/hosted fallback or
silent truncation. Encoding/layout/OCR warnings and CMap gaps remain diagnostic
data, not successful non-mention or calibrated quality flags.

Private file-backed caches under `.local/cv-cache`: parser by PDF hash/version/options; validated
response by full effective request bytes/hash, including actual Markdown,
publication date, model, question/choice ordering and accepted terms. Each store
uses atomic exclusive temporary writes/rename, 0700 directories/0600 files and a
2 MiB per-entry bound; fixture/live responses use separate directories. Only
complete validated successes cache; exact request bytes and full response shape
are rechecked on hits, parser identity/hash/diagnostics on Markdown hits.
Authorization/current task eligibility precede reuse. Restart retains files and
durable send knowledge. Corrupt entries miss; a missing response after durable
success cannot authorize another send. No automatic disk retention/quota yet.

JevGateway owns serialization/admission/transport; current pinned model/budgets/
namespace/HTTP bounds remain. No SDK retries, counter reset, direct transport or
payload logging. `cv_request_attempts` uniquely coordinates `(mode,request_hash)`
across workers. A confirmed durable `send_started` boundary precedes transport;
expired/ambiguous sends and unknown acknowledgements cannot automatically retry.
A cache miss after durable success also blocks a second send. The ledger contains
metadata, not Markdown/responses, and is not deleted by recruitment resets.

A complete validated response is file-cached before DB success settlement. If
settlement acknowledgement or task save fails, the task retains its processing
lease. After expiry, interrupted tasks with durable send history receive an
internal **cache-only** recovery flag. They may rebuild the same request and save
a validated cache hit without increasing paid-attempt counters or admitting a
provider send. A cache miss/invalid entry fails unavailable; no paid fallback.
Final successful task rows are skipped, including an unknown successful save
acknowledgement. Release/screening/completion fences still apply to local replay.

Provably unsent transient guard/busy failures and pre-send operational failures
can retry the whole extractor after 12 hours, maximum three task attempts/send
boundaries. Budget/config/content failures do not loop. Known provider 429 is
terminal under the initial conservative policy; ambiguous sends remain uncertain.
Release/completion/screening fence all late application-result writes. Existing
external execution may continue/cost money; logical closure is not billing
cancellation. [Jev safety](../jev-safety.md) remains mandatory.

Reader/executor/runner defaults stay disabled. `PROCESSING_RUNNER=fixture` uses
trusted bound tasks, a fixture file and disabled normal executor. The explicit
`offline-demo` mode requires development, native PDF reader and disabled provider
executor; it also handles new unbound submissions using declared profile answers.
The explicit `jev` runner requires development, the consent-gated real executor
and fixed `PROCESSING_LIVE_SINCE` UTC ISO boundary. Only submissions on/after that
boundary enter its cohort; reuse it on restart. Historical pending/failed records
remain untouched; successful tasks and closed applications remain ineligible.
Key-empty live mode performs no claims. All modes use post-commit wake + 5s scans, one non-overlapping application per API
process (each extractor request serial), with existing DB claims across processes.
Memory queue holds at most 128 IDs; scans recover overflow. Repository outages
defer to another scan, not a rapid loop; shutdown aborts its own parser/request.
Offline safe operational retries wait 30s, maximum three task attempts; normal
live delay/guards remain unchanged. Unscoped/historical live draining is refused;
the user explicitly approved the new-synthetic-submission cohort. CLI retains
its existing synthetic-consent/selection guards and separate paid authorization.

The API acquires its stable owner-only credential socket/pipe at root bootstrap,
before worker lifecycle hooks; a second backend/occupied/stale socket fails
startup without stealing/removing it. Rotation defaults to that single backend;
optional expected PID is checked, while separate CLI workers use `--worker-pid`.
The gateway starts with an empty RAM-only credential holder, ignoring old
environment keys. [Local key control](../guides/jev-key-control.md) can rotate it
without restarting the server. Missing keys do not claim unbound live work. An
explicit live CLI process waits for its own local credential preflight before
claims; credentials are not shared across processes or persisted. Rotation never
changes execution consent, limits or durable send knowledge.

<a id="mock-execution"></a>

## Trusted fixtures

No candidate request accepts fixture keys. A trusted fixture array contains
`fixtureKey,applicationId,documentId,sourceHash,taskId,args,referenceDate,markdown,
result`. Success is `{status:'completed',response:<raw Choice envelope>}`;
failure is `{status:'failed',value:null,reason,retryable,failureCategory?}`.
`reader:'pdf'` optionally verifies real native Markdown against the fixture.
All source/config/date identities and bytes must match; missing/invalid fixtures
never fall back to live execution. Complete responses validate before use.

Fixture-only text is labelled `fixture_only_not_parsed`; declared fixture results
remain separate from real model observations. Demo/lifecycle fixture sources now
cover all five families and independent corrections. Their zero usage metadata
is simulated, not a billing observation. The lifecycle dataset was recreated in
the authorized offline launch; this is not workflow/quality acceptance. Fixtures and
demo commands are forbidden in production; demo/explicit CLI commands require
the background runner disabled. Old fixture formats need recreation, not coercion.

The offline-demo executor recognizes four exact transferred synthetic PDF hashes.
Destination-authored declarations cover listed terms/scopes and Oct–Dec 2026
publication dates. Unknown PDFs/configuration return explicit ordinary-terminal
unavailable values, never first-choice fallback or live inference. Native parsing
is genuine; answers/probabilities/usage remain visibly fixture data. This catalog
does not import archived provider observations into runtime caches.

## Immutable results and independent correction fields

Successful `result.value` is `{version:1,fields:{questionId:scalar},rawResponse}`.
Scalars: education/experience/evidence category keys, certification boolean,
coverage integer. Raw answer choices/distributions/confidence/model/usage are
retained without thresholds, rounding, caps or automatic decision effects.
Incomplete/invalid responses fail the whole extractor and retain private raw
diagnostics, never fabricated false/zero/non-mention. Failures remain null.

`GET /api/applications/:id/review` is HR-only and includes immutable answers/form,
processing/readiness/release metadata and configured task placeholders. Each task
has ordered `fields` with question/configuration, stable column key, original/
effective scalar, source, independent correction/actor/time and hasCorrection.
Original batch status/provenance/attempts/failure stay separate from corrections.

`PATCH` requires trusted Origin/session and the separate `expectedRevision`:

```json
{"expectedRevision":1,"corrections":[{"taskId":"cv_extract","questionId":"Coverage","value":2}]}
```

<a id="review-no-op-saves"></a>

Optional status: pending/in_review/completed. Corrections are keyed by
`(application,task,question)`, not task alone. Null is reviewed unknown;
`remove:true,value:null` removes an override; absent fields preserve siblings.
Validate every field/type/count and the entire set before any write/no-op.
Authority/readiness/closure and revision checks precede equality. Stale-identical
requests conflict; current-identical saves/absent removals do not write or change
revision/time/attribution. Actual changes update only changed overrides and
increment the application review revision once. Completion separately locks
review, clears processing leases and does not approve the candidate.

<a id="optional-shared-review"></a>

## Readiness, release and UI fences

Readiness remains not_required/waiting/blocked/ready/released/locked. Normal
settlement requires every task successful or ordinary-terminal/non-retryable,
with no active processing invocation. Operational/uncertain/unclassified/retry-
exhausted work stays blocked, not inferred ready. Zero-task applications are
not-applicable/completed without a human reviewer or approval.

<a id="explicit-manual-release"></a>

Shared HR editing is allowed only ready/released and open. Completion or either
screening outcome locks it. `POST /applications/:id/review/release` retains its
existing expected-revision, explicit-confirmation/idempotent-current-duplicate
contract: permanent processing closure, attribution and token fencing under the
application lock; no result rewrite, review completion or recruitment effect.

<a id="review-navigation-guard"></a>

Review retains per-field source-PDF association, focused dialogs and separate
completion confirmation. Drafts are local to the mounted role/application, keyed
by task+question. Saving clears only that field's draft. Unknown/conflicting saves
disable mutations until explicit refresh; drafts are preserved for explicit
Reapply/Discard, never auto-merged/retried. Dirty/pending navigation, reload,
sign-out and completion guards remain as in [editor navigation](editor-navigation.md).
Candidate/interviewer projections omit results/corrections/readiness/HR metadata.

<a id="ungated-csv-export"></a>

## Exports

Diagnostic `GET /vacancies/:id/export` remains HR-only, export-all/no review gate,
private-no-store. It includes task status/reason/raw response/provenance and each
`<outputKey>.question.<questionId>` original/effective/source/correction actor/time.
Null is blank, false and zero remain explicit values. No public document links.

Compact [screening export](screening-api.md) uses the same effective fields and
readable processing/review/fixture summary, not raw diagnostics. Existing factual
filters and decision import identity/outcome handling remain; import never writes
extraction corrections. Quoted/formula-safe CSV, repeatable snapshot, 1,000-row/
10 MiB caps and private authorized links remain unchanged. No ranking or automatic
screening decisions. Builds/launch observations do not establish CSV round-trip or
authenticated/manual/regression acceptance; tests remain forbidden by instruction.
