# Reusable semantic forms

[forms-v001.json](forms-v001.json) contains reusable question forms, not
CV-specific answers/hints. Research drafts, not validated production rules.

## Procedural construction contract

1. Select a form from `forms` and a unique question ID.
2. Put instance arguments under `state.question_args.<question_id>`.
3. Substitute `${args_path}` in instructions with that literal argument path.
   Python `string.Template` suffices; no Jinja2/Mustache dependency is needed.
4. Copy type/criteria unchanged. For coverage, generate choices `0..N` using
   `coverage_criterion_pattern`, where N is the supplied item count.
5. Assemble native `model/state/questions`; the CLI substitutes `$cv` in state.

No reusable renderer/high-level CLI builder is implemented yet; `--questions`
remains not implemented. Request snapshots are literal form expansions.

| Form | Instance arguments |
| --- | --- |
| `education_level_completed` | `scope`: string; empty means any field. Completed-only; no expected-completion horizon yet. |
| `certification_no_validity` | `name`: string; `aliases`: equivalent-name strings. No validity check. |
| `experience_five_bins` | `scope`: string; empty means overall work; `include_paid_apprenticeships`: explicit boolean experiment policy, not a settled universal rule. |
| `skill_coverage_count` | `items`: list of `{name, aliases}`. One count Choice, not per-item questions. |
| `skill_evidence` | `name`: string; `aliases`: string list. Multiple instances allowed. |

All forms refer to `state.cv`; dated forms use literal `state.reference_date`.
Scope, names and lists are arguments, not new wording. Question IDs themselves
are not sent to the model; explicit paths in instructions connect to arguments.

## Revision discipline

- `maintenance-v001` predates these forms. Its user-reported 5/5 agreement does
  not validate these different, generalized instructions.
- `forms-v001`: electrical-CV top choices match provisional readings, but coverage
  and absent CMMS are uncertain. French administration run selects count 3 where
  only two supplied skills are identifiable; generic spreadsheet-to-Excel inference
  is a hypothesis, not a verified cause. Education is unresolved due to parser/
  mapping ambiguity. Not validated across fields. Forms remain frozen pending a
  documented diagnostic or continued cross-CV comparison; no revision made yet.
- Once used, freeze a form snapshot. If a mistake suggests a wording problem,
  add `forms-v002.json`; record the changed text, reason, counterexample and
  affected requests. Do not silently overwrite prior experimental forms.
- Changing arguments is not a form revision. Changing instruction, criterion,
  evidence definition or inclusion policy is.
- No confidence cap/threshold is inferred. Uncertainty, missing evidence and
  parser damage remain distinct.

Request queue and observations: [semantic batch 001](../templates/semantic-batch-001/README.md).

## Coverage candidate v002 (comparison plus plumbing, not validated)

[skill-coverage-v002.json](skill-coverage-v002.json) is an alternative **only** to
the v001 coverage form. Other forms and the coverage-criterion pattern stay v001.
The same `${args_path}` substitution and `0..N` criterion expansion apply. Two
comparison questions may deliberately share one argument path/list.

Reason: French administration count selected 3 with only two identifiable matches;
electrical count also placed substantial probability on an extra match. Neither
result identifies the extra item. Candidate wording makes separate item matching,
deduplication and generic-category versus specific-product distinctions explicit.
No CV-specific brand, credential or expected count is included in the form.

Changes from v001: replaces the general counting question with a match-then-count
instruction; explicitly excludes category-to-subtype/product/brand inference and
likely usage; distinguishes number of matched list items from CV mention count.
Criteria unchanged. This is a hypothesis, not a proven quality improvement.

Comparison request: `02b-coverage-comparison.json` in batch 001. Three independent
questions: original count, candidate count, unchanged v001 named-skill evidence.
The last question probes one suspected source of overcounting, not every item.
User-reported comparison: original count 2 with probability 0.87; revised count 2
with probability 0.94; Excel not mentioned with probability 0.72. The original
count also changed from its earlier request, so improvement is not established.
Plumbing request 03 selected count 2 with probability 1.0, agreeing with the two
identifiable supplied items. Other clear answers also agree, including ongoing
education exclusion and supervised work versus volunteering; dates remain
ambiguous. Retail request 04 selected count 3 with probability 0.99, agreeing
with the identifiable items. POS evidence's winner respected the list-only
boundary, though professional-use probability remained 0.29; dates remain weak.
Lavandula request 05 selected count 2 with probability 1.0, matching the reading.
This remains a few selected four-item lists, not validated general counting.
No automatic follow-up or live run has been performed by the assistant.

## Skill-evidence candidate v002 (tested, not a successful fix)

[skill-evidence-v002.json](skill-evidence-v002.json) replaces only that form's
instructions; v001 criteria stay identical. `${args_path}` points to the instance's
`{name, aliases}`. No builder or automatic follow-up is added.

Counterexample: Lavandula listed Excel but described a community project only as
a spreadsheet. v001 returned Excel `applied` (probability 0.76, confidence 0.68),
unsupported under our explicit-linkage rule. The generic spreadsheet question's
`applied` winner was plausible. New wording requires the concrete activity to
identify the same named skill/equivalent before assigning application context;
it explicitly bars linking a listed product to a generic activity by assumption.
No CV-specific product name or desired answer is embedded in the snippet.

Batch 003 tested v001/v002 on original and formatting-only Lavandula text. All
four returned named-Excel winners were `applied`, contrary to the strict list-only
reading; v002 reduced applied probability from 0.85 to 0.58 on the original,
and from 0.83 to a reported tie of 0.43 applied / 0.43 list-only on the flat input.
It did not fix the winner. Both forms preserved explicit professional Excel and
list-only Python on a Spanish JSume control (probability 1.0 each). Keep v002 as
an evaluated unsuccessful-fix candidate, not a validated replacement. Do not
widen aliases from category to product or cap probabilities to hide the failure.

## Next comparisons, not implemented or live-tested

- **Certification without validity:** compare binary Choice with one Noul on the
  same factual proposition. Official [Noul guidance](https://docs.typesafe.ai/primitives/noul.md)
  recommends it for yes/no questions. A Noul returns probability of yes, not a
  separate confidence field; near-zero means the proposition is unsupported,
  not that the person lacks the credential. Need positive, alias-only, absent and
  planned/related-training controls. Recent generic-form certification runs were
  all negative; type superiority is unmeasured. Multi-category validity is not
  reduced to a single Noul without redesigning its semantics.
- **Education level:** retain Choice for one highest-level category. A Noul is
  appropriate for one precisely defined factual proposition, not a level scale.
  Asking independent Nouls for every level increases question count and can
  produce inconsistent results. Expected completion and international mappings
  still need agreed rules; changing primitive does not resolve them.
- **Argument placement:** compare current state-path references with arguments
  directly embedded into structured question instructions. Both are procedural
  and supported by the API. Reduced indirection may help, but request-context
  effects and the model's actual cause of error are not known. Keep CV state,
  meanings and criteria fixed when comparing; never embed expected answers.
- **Evidence:** distinguish alias equivalence (same skill/product) from a broader
  category/subtype relation. An alias library cannot justify inventing a context
  link between a listed product and a generic activity elsewhere in the CV.
- **Experience:** documented counting/date limitations remain. More prompt text
  or swapping to Noul does not turn date reasoning into verified arithmetic.

Full corpus PDFs have been locally parsed to
`parser-evaluation/outputs/pdf-inspector/corpus-native-001/`, including six jsume
encoding-warning cases. Select reviewed clean and harder examples separately;
group alternative layouts of the same CV across any development/evaluation split.
Do not claim the user's success targets from the selected five provisional cases
or initiate further paid/bulk work from this note.

## Batch 002 baseline extension (user results recorded)

User requested eight more manually run CV requests before more wording changes.
Native snapshots and pre-result readings live in
[semantic-batch-002](../templates/semantic-batch-002/README.md). Forms stay v001
except coverage v002; **skill-evidence v002 and Noul are not used**. This extends
the earlier baseline across five formats, three languages, two encoding-warning
inputs, positive/negative credentials and coverage-list sizes 3–6. Requests were
materialized offline from the saved snippets and schema arguments, not rewritten
per CV. Six questions each, including two skill-evidence controls. No live calls
by the assistant. Results and pre-result uncertainty flags are preserved in
`templates/semantic-batch-002/results.json` (relative to the cvextract project).

Observed provisional agreement: eight coverage winners, sixteen skill-evidence
winners and eight certification winners (three positive/five negative). Of 48
questions, 42 match clearer provisional readings; six remain pre-flagged uncertain
education/experience cases, not a claimed accuracy denominator. No new clear
winner error appeared in this selected batch. Degree/credential policy ambiguity
and numeric uncertainty remain; earlier count/Excel counterexamples still stand.
Keep existing baseline forms frozen. Skill-evidence v002 remains untested; a
targeted old/new comparison on the original Lavandula linkage case would be more
informative than changing all eight successful requests. No follow-up scheduled.

## Batch 003: targeted comparisons (five user-run results recorded)

The user subsequently requested a maximum of five targeted requests. See
[semantic-batch-003](../templates/semantic-batch-003/README.md): original/flattened
Lavandula skill linkage, French count with suspected-extra-item diagnostics,
retail date wording, and Spanish JSume positive/list-only controls. Eighteen
questions across five explicit user-run calls; no assistant provider calls.
Complete results/cache references are in the batch's `results.json`. Skill-evidence
v002 did not fix named-tool linkage; coverage winners remained 2, with revised
probability 0.98 versus original 0.90. Formatting
derivative is labeled outside CV text and preserves words/order after removing
heading markers; it is not a new parser result or independent example.

[experience-years-v002.json](experience-years-v002.json) is a **tested but
unvalidated** candidate for the experience form, with identical criteria and generic added
instructions: elapsed duration rather than inclusive calendar-year counting,
no rounding partial years to whole years, subtract gaps, and total cannot exceed
elapsed time since earliest relevant start. Motivation is the retail answer's
0.32 probability on 8+ despite a 2019–November 2026 span. Inclusive year counting
is a hypothesis about the error, not observed internal reasoning. No dates or
correct bins from this CV are embedded in the form; `${args_path}` and
`state.reference_date` remain procedural. This does not replace arithmetic with
verified code or resolve unknown months/gaps. Both forms selected 5–under 8;
unsupported 8+ probability fell 0.28 to 0.19 but was not removed. Do not claim
date correctness from the rewritten distribution. Five-request cap reached;
no automatic follow-up, new form or field-threshold change is scheduled.
