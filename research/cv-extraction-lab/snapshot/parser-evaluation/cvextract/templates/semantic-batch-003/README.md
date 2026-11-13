# Semantic batch 003: five targeted comparisons

**Five user-run responses recorded.** Source directory:
`/tmp/opencode/cvextract-batch003.tz7szT`. All matched against exact hydrated
cached requests and checksum-verified cached responses. Full per-question
distributions, provisional assessments and cache paths: [results.json](results.json).
No assistant live calls, credential access, retries or follow-up calls.

| Request | Input | Questions | Main comparison |
| --- | --- | --- | --- |
| 01 | Original PDF-derived Lavandula 044 | 4 | Skill evidence v001/v002 for named Excel and generic spreadsheets. |
| 02 | Formatting-only derivative of 044 | 4 | Identical template to 01; only hydrated CV formatting changes. |
| 03 | French Vantage 041 | 4 | Coverage v001/v002; direct v001 Excel/payroll evidence diagnostics. |
| 04 | Retail Moderner 023 | 2 | Experience v001/v002, focusing on impossible 8+ probability. |
| 05 | Spanish JSume 003 | 4 | Skill v001/v002; explicit professional Excel and list-only Python controls. |

**Five HTTP attempts maximum, 18 questions total**, assuming no failures/cache
hits; no automatic extra requests. Model `jev-1.14.0`; reference date 2026-11-12.
No education/certification questions; unresolved qualification policy isn't a
clean model-error label. The JSume positive control has a parser encoding warning.

## Procedural construction / controls

[matrix.json](matrix.json) records shared comparison definitions, argument paths,
per-CV arguments and provisional readings. Native snapshots contain only model,
CV placeholder, reference date, arguments and questions. No expected answers,
diagnostic notes, source labels or comparison names enter provider state.

Question IDs and args keys are deterministic; substitute only `${args_path}`
in frozen forms, copy criteria, expand coverage choices `0..N`. Comparison
questions deliberately share the same arguments. v001 forms, coverage v002 and
skill-evidence v002 are unchanged; **experience-years-v002** adds only generic
elapsed-time, partial-year, gap and upper-duration instructions. No CV-specific
year, correct bin, product example or exception is embedded in that form.

All wording remains usable for procedural request generation from schema
arguments. This is offline experiment snapshot materialization, not implementation
of the deferred CLI `--questions` builder. No new dependency or CLI behavior.

Question context differs from earlier full-extraction requests. An original-form
answer changing here is not itself proof that a rewrite helped. Simultaneous
questions are documented independent, but context/model variability can matter.
No repeatability claim can be made from one observation per condition.

## Parsed-text variation

`inputs/precv-044-lavandula-flat.md` is a **controlled derivative**, not a new
parser output or independent CV. Starting from the corpus's PDF-inspector output:
remove line-start Markdown heading markers, then collapse whitespace to spaces.
Preserve all words, other punctuation and their order. No facts, expected answers,
tool names, corrected roles or dates added. Sibling provenance JSON records hashes
and the exact transformation. The original parsed Markdown is untouched.

Request templates 01/02 must be byte-identical before hydration. Differences in
answers can suggest formatting sensitivity but cannot establish that original
PDF parsing was correct, fix missing facts, or isolate a cause from stochastic
variation. No source Markdown, screenshots, OCR or PDF rerendering used.

## Review criteria recorded before results

- Lavandula: strict named-Excel result should stay list-only; generic spreadsheet
  project is applied, with professional-context ambiguity retained. Compare full
  distributions and ensure v002 doesn't merely suppress all application evidence.
- French count: tentative count 2, Excel/payroll not mentioned. If count is wrong
  but both queried extras absent, a tally error is plausible; if a subquestion
  falsely finds an extra item, semantic over-inference is plausible. Different
  independent questions still do not expose the model's internal reasoning.
- Retail: monitor probability on 8+, which exceeds even the maximum elapsed span
  of documented roles. Winning 5–under 8 is plausible; missing gap length remains.
  v002 remains model date reasoning, not verified arithmetic or a code validator.
- JSume: explicit professional Excel must remain professional, basic Python stays
  stated/studied. A stricter rewrite failing this control should not be adopted.

## Results

Usage: **8072 input / 1124 output tokens**, five response artifacts,
`jev-1.14.0`. Published-price estimate is USD **0.000339024**, not verified
account billing. No conclusion about trial quota consumption follows.

### 01/02: named Excel linkage persists

| Input | Form | Excel winner / probability | List-only probability | Confidence |
| --- | --- | --- | --- | --- |
| Original parser Markdown | v001 | Applied / 0.85 | 0.04 | 0.80 |
| Original parser Markdown | v002 | Applied / 0.58 | 0.32 | 0.44 |
| Formatting-only flattened | v001 | Applied / 0.83 | 0.03 | 0.77 |
| Formatting-only flattened | v002 | Applied / 0.43 | 0.43 | 0.24 |

Under the strict same-named-skill linkage rule, all four returned Excel winners
conflict with the provisional list-only reading. This is **one underlying CV
failure across four conditions**, not four independent candidate failures. The
flat v002 distribution is tied at reported precision; its `applied` winner is
not a decisive preference over list-only. Preserve that distinction.

The rewrite shifts probability toward the desired strict reading but does not
fix the returned classification. Formatting-only change does not repair it
either. These observations do not prove formatting never matters or that parser
output matches the PDF; the derivative cannot restore omitted facts. Generic
spreadsheet evidence stays `applied` for both forms/inputs (probabilities
0.77/0.63 original, 0.81/0.66 flat), with professional-context uncertainty.

### 03: count diagnostic

- Original coverage: **2**, probability **0.90**, confidence 0.87.
- Revised coverage: **2**, probability **0.98**, confidence 0.98.
- Named Excel evidence: **not mentioned**, probability **0.77**; list-only 0.21,
  professional 0.02. Payroll: **not mentioned**, probability **1.0**.

All four winners match provisional readings. Earlier count-3 error is not
reproduced in this changed request context. Candidate count wording has more
concentrated agreement here, not established general superiority. Subquestions
do not reveal which item the earlier request counted; no causal claim follows.

### 04: date clarification improves the distribution, not arithmetic

Both forms select **5–under 8** (original probability 0.71; revised 0.78).
Probability on unsupported **8+** falls from **0.28 to 0.19**, but remains
substantial. Confidence rises 0.64 to 0.73; that is not proof of correctness.
Unknown gap duration remains unresolved. v002 is a wording candidate, not a
verified duration calculator; date arithmetic remains a documented model weakness.

### 05: positive/list-only control retained

Both forms return **professional Excel** and **stated/studied Python**, each
with probability/confidence **1.0**. The stricter form does not erase this
explicit professional example. This is one positive control in an
encoding-warning JSume output, not global validation.

## Interpretation / decision

The machine-readable matrix records eight provisional agreements, four
disagreements and six pre-flagged unresolved answers (four generic-spreadsheet
contexts plus two gap-ambiguous duration answers). Repeated questions and the
formatting derivative are not independent evaluation cases. No accuracy
percentage, confidence cutoff or automatic field cap is selected.

- Keep coverage v002 as a supported experimental candidate, preserving the
  earlier counterexample and all distributions. No evidence requires making
  every skill a separate question in ordinary extraction.
- **Do not promote skill-evidence v002 as a fix.** It softens the specific
  unsupported named-tool inference while preserving a positive example, but
  its winning answer remains wrong under the strict explicit-linkage policy.
- A plausible explanation is association between the listed product and its
  generic category/activity. These requests do not expose internal reasoning;
  neither a parser-only diagnosis nor a universal skill-classification failure
  is supported. Aliases must not equate Excel with every spreadsheet.
- A later hypothesis is to test a direct, atomic linkage proposition such as
  “Does this CV explicitly identify ${skill} as used in a concrete activity?”
  before considering context, or place the schema-supplied skill/aliases directly
  in structured instructions to remove argument-path indirection. Those would
  be new experiments, not an implemented solution. Do not add mandatory multiple
  questions to every skill or live-call a follow-up without user direction.
- Experience v002 still cannot establish exact duration. A robust later design
  needs explicitly represented dates/intervals and code arithmetic, or preserves
  unresolved fields for review. That pipeline is not implemented here.

All five planned requests are accounted for. **Stop: no additional requests or
variants prepared/sent automatically.** Keep original forms/snapshots for replay.

## Cost planning, not account authorization

Official [models/pricing](https://docs.typesafe.ai/models.md) checked 2026-11-12:
USD **0.042/million input tokens**, output free. Last batch averaged 2421.5 input
tokens/request. 20 × 60 = 1200 such requests, approximately **2,905,800 input
tokens / USD 0.122** at that rate. Not one million. Actual token use changes with
CV/question sizes; account-specific trial limits, remaining allowance, billing
and failed-attempt charges aren't established by “5% used.” No remaining-budget
guarantee or authorization to run 1200 calls follows from this estimate.

## User-run only

With `JEV_API_KEY` exported, from repository root:

```bash
bash parser-evaluation/cvextract/templates/semantic-batch-003/run-five.sh
```

Five explicit calls, no send loop, no retries; exits on first failure and prints a
fresh response directory. Each invocation keeps exact-request caching, global
lock and explicit next-send permission. Do not run this as an assistant. On
uncertain interruption, inspect the attempt before manually choosing any retry.
