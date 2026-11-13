# Semantic batch 002: eight-CV exploratory matrix

**User-run results recorded.** All eight responses were supplied under
`/tmp/opencode/cvextract-batch002.kd6KXr` and matched against their exact hydrated
cached requests/responses. See [results.json](results.json) for the complete
48-question matrix, original probabilities/confidence, pre-result readings,
parser flags, usage and durable cache paths. No assistant live calls or retries.

## Frozen baseline and construction

- Model `jev-1.14.0`; literal reference date 2026-11-12.
- Education, certification, experience and skill-evidence forms from
  `../../snippets/forms-v001.json`; coverage from `skill-coverage-v002.json`.
- **Untested skill-evidence v002 is not used**, nor Noul. These are additional
  observations of the last batch's baseline, not simultaneous wording/type changes.
- [matrix.json](matrix.json) records arguments and provisional expected readings
  before results. Expected readings/notes are NOT included in provider requests.
- Native request snapshots replace only `${args_path}` in frozen instructions;
  coverage options are expanded from the fixed count-criterion pattern `0..N`.
  The CLI alone hydrates `$cv` at invocation. No change to CLI `--questions`.
- Six questions per CV: education, one credential, relevant experience, coverage,
  and two specific-skill evidence questions. **48 main questions total.**

| Case | Format/language | Coverage N / tentative count | Evidence A / B | Main probe |
| --- | --- | --- | --- | --- |
| 01 Accounting | Calligraphics / English | 5 / 4 | SQL list-only / Power Query professional | Part-qualified ACCA versus full qualification; SQL basics; exact dated experience. |
| 02 Property support | Calligraphics / English | 4 / 3 | Bicycle personal project / CMMS absent | Detached employer/date table; personal application; reporting does not imply CMMS. |
| 03 Backend | Cobalt / English | 6 / 4 | Docker list-only / Python professional | Positive AWS credential; named-tool context; actual degree; longer count list. |
| 04 Laboratory | Cobalt / French | 5 / 3 | Excel list-only / PCR list-only | DEC mapping and contract gaps; molecular biology does not automatically prove PCR. |
| 05 Assembly | Metronic / English | 4 / 3 | Power tools professional / welding absent | Exact month-dated duration; pallet trucks versus a named forklift credential. |
| 06 Administration | JSume / Spanish | 5 / 4 | Python list-only / Excel professional | Encoding warning; incomplete degree; courses versus certification; database versus SQL. |
| 07 Building services | JSume / English | 3 / 2 | CMMS absent / height training only | Encoding warning; work orders not CMMS; positive internal training. |
| 08 Electrical | Vercanard / Spanish | 4 / 2 | Schematics list-only / circuit labels professional | Split words; study without stated award; short-contract duration; related-activity inference. |

This is a structured exploratory matrix, **not a full factorial experiment**.
Domain, language, format and content vary together. Selected failure-prone probes
are intentional, not random sampling. Eight distinct numeric CV identities; no
cross-layout duplicate is counted as a separate candidate here. All inputs come
from the native PDF-derived corpus snapshot, not source Markdown.

## Review policy

The manifest's provisional readings are not source-PDF-verified ground truth.
Explicitly mark education mapping/completion ambiguity, year-only dates, short
contracts and damaged reading order as unresolved where necessary. Do not force
them into a claimed error/success percentage. Six JSume corpus files have parser
encoding warnings; two are deliberately in this batch. Their failures cannot be
attributed solely to Jev or solely to layout without closer review.

Pay particular attention to probability assigned to absent tools, unjustified
links between list entries and generic activities, wrong counts, and impossible
experience bins even when the winning answer is plausible. Counts use varied
list sizes (3–6); skill mentions still count once even when present in multiple
sections. Alias coverage and evidence-context linkage are different problems.

## Results and interpretation

**42 answers agree with pre-recorded provisional readings; six remain unresolved.**
This is exploratory agreement, not 42/48 accuracy or a validated success rate.
The six were already marked tentative/mapping-ambiguous in `matrix.json`; they
are not exclusions invented after seeing results. Their unresolved status remains
even when the model winner matches the tentative reading.

| Case | Returned coverage | Clear provisional agreement | Unresolved fields |
| --- | --- | --- | --- |
| 01 Accounting | 4 of 5 | 6 | None. |
| 02 Property support | 3 of 4 | 5 | Experience: detached date, scope/months. |
| 03 Backend | 4 of 6 | 6 | None. |
| 04 Laboratory | 3 of 5 | 4 | DEC mapping; contract duration. |
| 05 Assembly | 3 of 4 | 6 | None. |
| 06 Administration | 4 of 5 | 5 | Técnico level/completion. |
| 07 Building services | 2 of 3 | 6 | None. |
| 08 Electrical | 2 of 4 | 4 | Technical study versus awarded qualification; contract duration. |

Observed by family:

- **Coverage: 8/8** winners match provisional counts across list sizes 3–6.
  No new count disagreement in this batch, including explicitly listed skills,
  synonyms, absent named tools and related-but-not-equivalent activities.
- **Skill evidence: 16/16** winners match provisional readings. Docker, SQL,
  PCR, Python basics, Excel list-only, schematics and height training were not
  promoted to unsupported professional application. Explicit Python/Excel work,
  Power Query automation, power tools and circuit labelling were professional;
  bicycle repair was personal application; CMMS/welding controls stayed absent.
- **Certification: 8/8** match (three present, five not mentioned). This adds
  positive generic-form checks: AWS, SIMDUT update and internal height training.
  Full ACCA was not inferred from part-qualified/completed exam-stage entries.
  Training/credential authenticity and validity were not tested.
- **Education:** five clearer winners agree. Three remain policy/text ambiguous.
  DEC selected vocational (0.59) versus short-cycle (0.41), not a confirmed error.
  Spanish Técnico selected vocational (0.83); incomplete degree was not promoted.
  Spanish technical study selected vocational (0.99), versus our tentative
  no-stated-award reading. That high concentration does not settle the rule:
  whether a dated technical course implies an achieved qualification needs an
  explicit international mapping/completion policy, not just prompt tuning.
- **Experience:** five clearer winners agree, including exact-month assembly
  duration. Three remain ambiguous; laboratory 5–under 8 (0.98) and electrical
  8+ (0.98) do not resolve missing contract lengths. Spanish administrative work
  selected 8+ (0.61) versus 5–under 8 (0.33) despite a dated span over eight years;
  probabilities still are not verified arithmetic.

Usage totals: **19372 input / 2997 output tokens**, eight response artifacts,
model `jev-1.14.0`; no account bill or retry count independently established.
Both encoding-warning JSume cases returned plausible clearer fields. That does
not mean their parser output is undamaged or that JSume has been validated.

### Research conclusion / next decision

This batch does **not** show a universal failure to classify skill contexts or
count short lists. The earlier count and named-Excel errors remain real under
their recorded readings; fresh successes do not erase them. Candidate coverage
v002 has more supporting examples, but selection, changing list contents and
lack of held-out labels prevent a general accuracy claim.

The direct listed-product plus generic-project linkage failure from Lavandula
was not exactly recreated here. The next informative variation would compare
skill-evidence v001/v002 on that original CV plus an explicit-product positive
control, not rewrite all eight successful requests. No comparison prepared or
sent automatically. Education mapping/completion should be resolved with the
user; aliases must not disguise an unresolved credential-level rule. Continue
separating schema ambiguity, parser damage, unsupported semantic inference and
numeric reasoning instead of collapsing every disagreement into model failure.

All original requests and distributions are preserved; no form revision or
confidence threshold/cap was selected from this batch. Await user direction.

## User-run commands

[run-eight.sh](run-eight.sh) has eight explicit calls and `set -euo pipefail`.
It creates a fresh response directory under `/tmp/opencode/`, prints its path,
and stops on first error. Each CLI invocation retains the global lock, cache,
closed persistent latch and no-retry behavior; `--allow-next-send` explicitly
permits that invocation's one uncached attempt. Cache hits still never resend.

With `JEV_API_KEY` already exported, the user may run from repository root:

```bash
bash parser-evaluation/cvextract/templates/semantic-batch-002/run-eight.sh
```

**Do not run this script as an assistant.** Eight paid attempts are authorized
only by the user's manual execution, not by preparing the files. If interrupted
or failed, inspect the recorded attempt first; do not automatically run the whole
script again. No price claim or account budget is inferred from token counts.
