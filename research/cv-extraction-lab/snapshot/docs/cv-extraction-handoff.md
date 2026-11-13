# CV extraction: research and platform integration handoff

Updated 2026-11-12. This is a bounded component of the HR platform, not a
standalone candidate-screening or ML-evaluation product. It records agreed
direction, lab evidence and migration guidance; it does **not** claim platform
integration is implemented. Read the destination repository's guidance before
implementing or transferring code/data.

## 1. Scope and delivery boundary

**Document parsing → structured extraction → human review/correction → CSV.**
No candidate ranking, filtering, rejection, hiring decisions or proficiency
scores. Non-mention means not evidenced in the supplied CV, not a missing human
capability. Failed parsing/extraction is not non-mention or a zero count.

The near-term deliverable is an end-to-end platform workflow: form-builder task
configuration, background parsing/extraction, persisted results, HR review and
export. Evidence highlighting, searchable skill suggestions and a comprehensive
dictionary are not prerequisites. The form builder should show a deterministic
preview of the actual question and answer choices without calling Jev.

Implemented **in this lab**: local native-text parsing helper and corpus outputs;
manual request runner with cache/latch; recorded experiments; JSON schema, Jinja
specification and offline-rendered examples. **Not implemented here**: reusable
high-level request builder (`--questions` still errors), platform jobs/database
integration, review UI, confidence transformations, dictionary or highlighting.

## 2. Agreed configuration and question semantics

Latest portable references:

- [Semantic rules](cv-extraction-semantics.md).
- [JSON Schema](../parser-evaluation/cvextract/examples/simple-tasks.schema.json).
- [Simple input](../parser-evaluation/cvextract/examples/simple-tasks.json).
- [Jinja specification](../parser-evaluation/cvextract/examples/request.json.j2).
- [Three input/rendered examples](../parser-evaluation/cvextract/examples/review/README.md).

Top level: `reference_date` and `questions`. Each task has unique `id`, `type`
and flat family-specific fields. Any family may repeat; do not deduplicate by
type. One configured task normally produces one Choice question and one field.

| Type | Task arguments | Returned categories |
| --- | --- | --- |
| `education_level` | Optional `scope`; optional `expected_within_months`. | Secondary/lower; vocational/technical; short-cycle higher; bachelor's; master's; doctorate; not stated. |
| `certification` | `certification`: named value. | Present / Not mentioned. **No validity checking.** |
| `experience_years` | Optional `scope`; multiple scopes mean OR, not separate summed questions. | Under 1 / 1–under 3 / 3–under 5 / 5–under 8 / 8+ years. Count overlap once. |
| `skill_coverage` | `skills`: named-value list. | Choice 0…N, normalized locally to an integer count; not proficiency. |
| `skill_evidence` | `skill`: named value. | Not mentioned / Stated or studied / Applied / Used professionally. Context, not competence. |

Named value: either `"SQL"` or `{"name":"SQL","aliases":["T-SQL","Transact-SQL"]}`.
Programmatic enrichment and handwritten values are both allowed. No mandatory
global graph or per-question `args` envelope. Optional scope/window/alias clauses
are absent from rendered text when not supplied. No mandatory explanations,
quotations, multiple automatic questions per skill, or extra apprenticeship flag.

Skill aliases are explicitly accepted evidence terms for the target, including
selected narrower terms: SQL may accept T-SQL, not automatically the reverse.
Do not create symmetric equivalence from mere similarity. Credential aliases
must identify that credential; related training/other credentials aren't proof.
Listing Excel and separately describing a spreadsheet does not establish that
the spreadsheet used Excel under the selected explicit-linkage rule.

Education with a positive look-ahead includes explicitly expected completion;
omitted/zero means completed-only. **No implicit two-month default.** The current
shape returns one level and does not separately encode expected versus awarded.
Do not present a window-qualified level as proof of an already awarded degree;
show the task/window in review. A separate status was discussed but not selected.
International mappings and explicit negated skill mentions remain policy gaps,
not reasons to invent success labels or silently broaden terms.

## 3. Reference date: freeze at vacancy publication

Current lifecycle is draft → further draft edits → published, without a
published-to-draft revision flow. **Set and persist the reference date at first
publication.** Use it for every applicant's extraction and reprocessing.

- Draft previews can use today's date, visibly provisional.
- Draft edits do not establish/change the published extraction date.
- Processing time, retry time and unrelated edits must not move it.
- “Within six months” means **within six months of publication**, not today.
- No rolling cutoff, reopening/round engine or automatic six-month refresh now.
- Production application supplies the authoritative stored date; the JSON field
  is the resolved request context, not a free HR override of publication state.
  Use the main platform's date/time convention; don't invent one in this lab.

This is reproducible and fair across applicants; a very long-open vacancy may
eventually need an explicit refresh policy, deferred by agreement.

## 4. Background pipeline and persistence direction

```text
private PDF + configured tasks + frozen publication date
  → native PDF parsing (text + diagnostic provenance)
  → validate nonempty/trustworthy input or record failure
  → normalize named values / inject configured accepted terms
  → construct complete native Jev request
  → exact-request cache lookup and authorized single attempt
  → validate complete response; preserve original probabilities/usage
  → normalize field values; optional separately configured review flags
  → persist machine results separately from HR corrections
  → HR review/correction → effective export
```

Use the application's existing storage, integration ports, job/task infrastructure
and provider spending gateway. Do **not** transplant the CLI's direct HTTP path
around destination safeguards. No new service/framework/workflow engine implied.
Keep native parsing off the API event loop and bound document size/time/resources.
Current corpus tests used no OCR; scanned/empty/garbled PDFs need a visible
unsupported/failed/review outcome, not fabricated fields or an automatic hosted
fallback. Real applicant documents remain private.

Persist enough to identify the task/configuration used, publication date, source
document/parser provenance, generated request/hash, attempt outcome, raw answer
distribution/confidence and usage, normalized machine field, and independent HR
correction. These are responsibility boundaries, not a new agreed SQL schema.
Validate exact question IDs/types/choices and complete probabilities before
publishing a cache success. Never overwrite HR corrections during reprocessing.

No confidence thresholds, margins, caps or automatic acceptance policy were
agreed. Preserve raw values; optional review flags must not silently manufacture
a different machine answer. Choice confidence/probabilities are not measured
correctness. Coverage keys can map to integers; failed answers stay unavailable.

### Caching / retries

- Extraction key: SHA-256 of the **fully hydrated credential-free request**,
  including model/date/questions/accepted terms and actual parsed text.
- Deterministic JSON serialization, preserving question/choice order; save exact
  request bytes and verify equality on lookup. Do not alphabetically reorder
  criteria or combine arbitrary CV/config/version hashes into filenames.
- Model currently pinned to `jev-1.14.0`. No builder-version metadata/key component
  is required in this agreed lab design; changed request content changes the key.
- Successful validated response is reusable; no refresh by default. Errors,
  incomplete bodies and interrupted/unknown completion are not successful hits.
- Concurrency must prevent duplicate paid sends. A process-local mutex alone
  isn't enough if the platform runs multiple workers; use existing durable job/
  database locking facilities rather than introducing an unapproved subsystem.
- **No automatic provider retry**, including a job queue's default retry of an
  interrupted send. Persist attempt-start before sending. Unknown completion
  remains blocked for deliberate recovery; there is no verified provider
  idempotency/recovery contract. The CLI latch is a research safety mechanism,
  not the platform's scheduling design.
- Authorize task/document access before exposing cached data. A hash or local
  artifact path is not authorization. Never cache or log credentials.

Parser caching, if added, has a different identity (PDF bytes, parser version and
options). Keep it separate from exact Jev-request caching. No parser cache or
distributed recovery system was implemented here.

## 5. TypeScript portability: Python is not architecturally required

Verified from official upstream docs and npm metadata on 2026-11-12:
[`@firecrawl/pdf-inspector`](https://github.com/firecrawl/pdf-inspector/blob/main/napi/README.md)
exists, npm version **1.25.2**, MIT, native Rust bindings with prebuilt Linux
x64/ARM64 (glibc/musl), macOS ARM64 and Windows x64 packages. `processPdfAsync`
and other async variants run parsing off the Node event loop. Native OCR runtime
assets are external; do not enable/download them or hosted fallbacks implicitly.
No Node package was installed or executed in this lab.

- JSON config/schema and question semantics transfer directly to TS.
- Prefer typed functions returning the native request object plus explicit JSON
  serialization. Jinja is a readable prompt specification, not a required runtime.
- Nunjucks is an option, **not drop-in compatibility**: Jinja `dict.get`, `.items`,
  filters and serialization policies need adaptation. Preserve choice order.
- Jev can be called from TS through the destination integration/gateway; no local
  inference model, GPU or Python SDK is required for extraction.
- Prefer the official Node parser in the existing worker if installation and a
  small offline parity check are straightforward. Pin the version and compare
  Markdown/warnings on representative PDFs; do not assume byte-identical Python/
  Node output or inherit extraction-quality claims without checking.
- Fallback: retain the existing Python parser wrapper under isolated uv and
  invoke it with bounded subprocess input/output/time. The Python wheel has no
  `pdf-inspector` console command; uv runs our wrapper. Upstream Rust CLI
  `pdf2md` is a separate install, not something already supplied by that wheel.

No port or installation is performed by this handoff. The native Node option
means there is **no hard Python dependency in the intended production design**.

## 6. Research evidence and limits

Synthetic CV corpus only. Full preprocessing:
[63 PDF-derived Markdown files](../parser-evaluation/outputs/pdf-inspector/corpus-native-001/README.md),
60 numbered identities plus two alternative layouts and one extra named CV;
64 pages. Python pdf-inspector 1.25.2, native text, no OCR. Six JSume outputs have
encoding warnings; clean flags do not guarantee correct layout/content. No
source Markdown was substituted for PDF extraction. Source-PDF label review is
not complete. The five-CV and full-corpus snapshots are separately preserved.

| Evidence set | Recorded requests / answers | What it establishes |
| --- | --- | --- |
| Original maintenance | 1 / 5 | All winners match provisional reading; original tailored wording. |
| [Batch 001](../parser-evaluation/cvextract/templates/semantic-batch-001/README.md) | 6 / 31 | Five CVs plus one count comparison; count disagreement, ambiguous education/dates, named-Excel over-inference. |
| [Batch 002](../parser-evaluation/cvextract/templates/semantic-batch-002/README.md) | 8 / 48 | 42 clearer provisional agreements, six pre-flagged unresolved fields. Count 8/8, skill evidence 16/16, certification 8/8 including three positives. Not a validated accuracy rate. |
| [Batch 003](../parser-evaluation/cvextract/templates/semantic-batch-003/README.md) | 5 / 18 | Four CV identities reused, including a formatting-only derivative. Stricter linkage wording still fails on Excel; positive controls retained; date clarification only partially helps. |

Total **20 recorded request/response artifacts, 102 question answers, 14 CV
identities**. These are not independent random trials or verified paid-attempt
counts. Selected examples, repeated conditions and unresolved labels prevent a
defensible general accuracy percentage. The user's goals (roughly 90% clear/easy,
above 60% harder) are targets, not results. Latest concise schema/Jinja examples
were checked offline only; they are **not exactly the evaluated prompts**.

Important findings to retain in report/demo:

- Listed Excel + generic community spreadsheet project → unsupported Excel
  `applied` classification under the strict explicit-linkage rule. Old/revised
  applied probabilities 0.85/0.58 on original text; 0.83/0.43 on flattened text.
  Revised flat result tied at reported 0.43 list-only / 0.43 applied, still returned
  applied. Wording reduced concentration but **did not fix the winner**.
- Formatting-only flattening did not fix that case; it did not restore missing
  facts or prove the parser correct. This is one persistent constellation, not
  four independent failures. Internal model reasoning wasn't observed.
- Explicit professional Excel / basic list-only Python controls stayed correct
  under both forms, probability 1.0 each. No universal skill-context failure shown.
- Count wording v002 has supporting selected examples; the earlier French count
  error was not consistently reproduced. Three/four/five/six-item examples do not
  establish general counting reliability.
- Retail's unsupported 8+ probability fell 0.28 → 0.19 after elapsed-time wording;
  still not verified date arithmetic. Qualification mappings, missing months and
  contract gaps are policy/source ambiguities, not necessarily model mistakes.
- Non-mention/near-miss tests were included (e.g. pallet trucks versus forklift
  credential, generic database versus SQL). Explicit negation policy remains open.

Full distributions/cache references are preserved in batch 002/003 `results.json`;
batch 001/original run have summary tables and local cache paths. Last checked
official price: USD 0.042/million input tokens, output free. 1200 requests at the
batch-002 average would be about 2.9M input tokens/USD 0.12, not one million;
actual account/trial limits and failure billing aren't established by that estimate.

## 7. Deferred directions, not implemented features

1. **Evidence highlighting:** deterministic heading/paragraph/list/job blocks,
   stable chunk IDs/source offsets and later browser highlights. Selection is a
   separate feature; do not strip employer/date context or split blindly on dots.
   `markdown-it-py` offers a syntax tree; a TS Markdown parser can replace it.
   pdf-inspector exposes positions/tagged structure, not a guaranteed correct CV
   semantic tree. Chromium rendering doesn't itself identify supporting evidence.
2. **Targeted linkage tests:** an atomic explicit-application proposition or
   schema data inside structured instructions, with positive/list-only controls.
   No automatic multi-question expansion for every skill and no live calls queued.
3. **Suggestions/dictionaries:** editable named values first; ESCO offers broad
   multilingual concepts/labels/hierarchy as a later source. Embedding/k-means
   similarity is not alias equivalence or directional entailment. No full graph,
   automatic synonym generation or taxonomy installation now.
4. **Better numeric handling:** separately represented dates/intervals and code
   arithmetic if evidence/date extraction can be made reliable. No claim that
   changing Choice to Noul makes duration arithmetic correct. Binary certification
   Noul comparison is optional future research; current selected type is Choice.
5. **Evaluation:** review reference labels, distinguish easy/hard/parser-damaged
   cases, group same-CV layouts and keep counterexamples. Do not exclude failures
   just to meet a target, or calibrate thresholds from a handful of selected cases.
6. **Broader scope:** OCR, certification validity, rolling reference dates,
   expected-award status, country-specific qualification rules, rich quote UX and
   comprehensive suggestions need separate design/authorization.

## 8. Transfer checklist

Move **references/fixtures**, not an entire environment:

- This handoff, semantic rules and [official API reference notes](jev-api-reference.md).
- Current `examples/` schema/Jinja/review pairs; older proposals are labeled
  historical. Keep experimental `snippets/`/batch request snapshots for provenance,
  not as automatically selected production prompts.
- `scripts/parse_native.py`, parser version/options, the full corpus Markdown and
  summary JSON, and corresponding synthetic PDFs under `template-based/outputs/`.
  Preserve synthetic/provenance/license notices and alternative-layout grouping.
- Batch 001–003 notes/results and selected failure/control fixtures. Absolute
  `/tmp` and `~/.cache` paths are local references, **not portable attachments**.
  Export needed credential-free request/response pairs with hash checks if exact
  replay matters; don't copy unrelated caches or assume re-calling reproduces them.
- Do not move `.venv`, credentials, broad home caches or corpus-generation setup
  into the main app. User will perform the transfer; nothing moved by this task.
- CLI is optional research tooling: retain here as a replay/reference utility if
  useful; production UI/jobs should not shell out to it merely to extract. Do not
  delete it as part of documentation or recreate its personal latch as platform UX.

Before integration: read destination AGENTS/current contracts/provider safety;
choose Node parser or isolated wrapper; implement pure request/result boundaries;
connect existing authorized jobs/storage; verify offline fixtures and one complete
review/export path. No paid smoke, provider/credential changes, deployment or
main-repository modifications are authorized by this document.
