# Semantic batch 001: five newly parsed PDFs

Question snippets: [forms-v001](../../snippets/README.md). Native requests are
literal expansions of generic forms, with field-specific content only in
`state.question_args`. Fixed reference date: 2026-11-12. The user runs one request
at a time and supplies results; no automatic comparisons or sending loops.

## Parser provenance and queue

All five were newly extracted from PDFs using pdf-inspector 1.25.2 `process_pdf`,
native text only, no OCR/remote services. No source Markdown was read. Output:
`parser-evaluation/outputs/pdf-inspector/semantic-batch-001/`.
Each `.md` has a sibling `-summary.json` recording source path, PDF/Markdown
SHA-256, parser version and diagnostics. Repeatable local helper:
`parser-evaluation/scripts/parse_native.py` (refuses overwrite).

| Order | PDF stem | Parsed content / reason | Request/result |
| --- | --- | --- | --- |
| 1 | `precv-009-vantage-cv` | Electrical work, vocational training, apprenticeship, certifications and negative controls. | [01-electrical.json](01-electrical.json); user supplied result; six top choices match provisional readings, two uncertain. |
| 2 | `precv-041-vantage-cv` | French administration/reception; parser interleaves education and employment columns. | [02-administration-fr.json](02-administration-fr.json); result recorded: count disagreement, education unresolved. |
| 3 | `precv-012-moderner-cv` | French plumbing helper; CAP explicitly ongoing, supervised work and volunteering. | [03-plumbing-fr.json](03-plumbing-fr.json); result recorded, clear fields agree; experience ambiguous. |
| 4 | `precv-023-moderner-cv` | Retail/customer service; secondary education, year-only dates, no explicit credential. | [04-retail.json](04-retail.json); result recorded, top choices agree; dates/POS uncertain. |
| 5 | `precv-044-lavandula` | Administration/reporting; coursework without clear award; spreadsheet community project versus work context. | [05-administration-lavandula.json](05-administration-lavandula.json); result recorded, unsupported named-Excel application. |

All are one page; no OCR/encoding issue was flagged. That is **not proof of
correct parsing**: table interleaving, date grouping and stray glyphs are visible.
Keep parser problems separate from question-form problems. Source PDF visual
verification/ground-truth annotation remain unperformed.

## 01: hypotheses recorded before results

Input: this batch's `precv-009-vantage-cv.md`, not source Markdown or LiteParse.
Six questions, including two skill-evidence instances, sharing one CV.

| ID | Provisional reading | Basis / caveat |
| --- | --- | --- |
| `education_level` | `vocational_technical` | Level 3 Electrotechnical Apprenticeship, 2016–2020; completion inferred from closed education entry, not independently verified. No tailored NVQ example in this form. |
| `certification` | `not_mentioned` | IOSH Managing Safely deliberately absent; other electrical/safety credentials must not substitute. |
| `experience_years` | `8_plus` if apprenticeship counts as paid work | September 2016–April 2021 plus May 2021–present. Paid status is not explicit; employment placement suggests it. Inclusion is an experiment argument, not settled product policy. |
| `skill_coverage` | `2` | Fault diagnosis and electrical/circuit drawings evidenced; CMMS and welding not evidenced. Electronic job sheets alone do not establish CMMS. |
| `skill_evidence_fault_diagnosis` | `used_professionally` | Fault investigation/tracing wiring faults is described under employment. |
| `skill_evidence_cmms` | `not_mentioned` | Generic electronic job sheets/systems are not unambiguous CMMS evidence. |

These are provisional readings of parser output, not verified ground truth.
The summary claims 12+ years; dated roles evidence roughly ten years. Both fall
in 8+, so this question cannot establish whether the summary was ignored.

### Result record

- Status: user supplied JSON through `/tmp/buffer`; no Jev calls by the assistant.
- Cache SHA-256: `60d9ccfc10b894db6029a2b9dee15e1317b3a198997749972a16fa34816e69d6`.
- Response: `/home/ubuntu/.cache/cvextract/requests/60d9ccfc10b894db6029a2b9dee15e1317b3a198997749972a16fa34816e69d6/attempts/dc6dd94c8e66471cb140cbab30452f90/response.json`.
- Usage: **2451 input / 375 output tokens**; model `jev-1.14.0`.
- Six top choices match provisional readings, not independently verified ground
  truth. The pasted diagnostic says `Cached response`; repeated retrieval is not
  an independent model trial. `/tmp/buffer` is a mutable user handoff, not the
  durable result artifact; use the cached response path above.

| ID | Choice | Confidence | Nonzero probabilities |
| --- | --- | --- | --- |
| Education | `vocational_technical` | 0.95 | Vocational 0.96; secondary 0.02; not stated 0.02. |
| Certification | `not_mentioned` | 1.0 | Not mentioned 1.0. |
| Experience | `8_plus` | 0.99 | 8+ 0.99; 5–under 8 0.01. |
| Coverage | `2` | 0.57 | 2: 0.66; 3: 0.33; 4: 0.01. |
| Fault diagnosis evidence | `used_professionally` | 1.0 | Professional 1.0. |
| CMMS evidence | `not_mentioned` | 0.43 | Not mentioned 0.57; stated/studied 0.10; professional 0.33. |

Possible issue: generic electronic job sheets/systems may be overinterpreted as
CMMS, consistent with both the count-3 alternative and professional-CMMS
alternative. **Hypothesis only**: count answers do not identify matched items,
and no explanation was requested. No threshold/cap is selected. Retain v001
unchanged and contrast with a different field before revising wording. A future
targeted comparison may be justified, but no extra send is scheduled.

## 02: French administration, hypotheses before results

Input: batch `precv-041-vantage-cv.md`. Five questions, unchanged `forms-v001`;
only argument paths, scopes, names/lists and the coverage range are instantiated.

| ID | Provisional reading | Caveat |
| --- | --- | --- |
| `education_level` | `secondary_or_lower`, tentative | Parser splits “Certificat de culture générale” and its 2020–2022 school entry across a table/heading. Overall education scope; school name alone does not establish a vocational CFC. Completion/mapping is not verified against PDF. |
| `certification` | `not_mentioned` | Deliberately ask about a CFC commercial-employee credential, not the generic education certificate. Related school/trade wording is insufficient. |
| `experience_years` | `1_to_under_3`, tentative | Reception job is 2024–2025; retail work is excluded by scope. Missing months allow duration below one year; a single exact bin is not established. Do not call that alternative wrong merely because it differs from the tentative reading. |
| `skill_coverage` | `2` | Reception and appointment follow-up evidenced; generic “Tableur” does not establish Microsoft Excel; payroll not evidenced. |
| `skill_evidence_spreadsheets` | `stated_or_studied` | “Tableur” appears in Tools; no explicit applied spreadsheet example. Do not infer professional use from administrative duties. |

Primary probes: French synonyms, malformed reading order, generic software
versus a named product, a related-but-absent certification, and ambiguous year-only
dates. CV/parser ambiguity may make an answer genuinely unresolved. This run is
not a fair strict-accuracy benchmark without reviewed source-PDF labels.

### Result record

- Status: user supplied `/tmp/buffer`; independently matched its JSON against the
  exact local cached response without sending or reading credentials.
- Request SHA-256: `54e20db7c6d49f03a8ceaebee51d7227969c9a3ed626262aea9f9907e555f55c`.
- Response: `/home/ubuntu/.cache/cvextract/requests/54e20db7c6d49f03a8ceaebee51d7227969c9a3ed626262aea9f9907e555f55c/attempts/dae6a00b4a334e889a25250d381bf8da/response.json`.
- Usage: **2094 input / 315 output tokens**, `jev-1.14.0`.
- Form revision: unchanged v001, not a new phrasing experiment.

| ID | Choice | Confidence | Nonzero probabilities |
| --- | --- | --- | --- |
| Education | `vocational_technical` | 0.36 | Secondary 0.26; vocational 0.45; short-cycle 0.05; bachelor's 0.01; not stated 0.23. |
| Certification | `not_mentioned` | 0.84 | Present 0.08; not mentioned 0.92. |
| Experience | `1_to_under_3` | 0.68 | Under 1: 0.06; 1–under 3: 0.74; 3–under 5: 0.17; 5–under 8: 0.03. |
| Coverage | `3` | 0.55 | 2: 0.35; 3: 0.64; 4: 0.01. |
| Spreadsheet evidence | `stated_or_studied` | 0.65 | Not mentioned 0.08; stated/studied 0.74; applied 0.03; professional 0.15. |

Findings: count 3 conflicts with the two identifiable supplied items. Generic
`Tableur` may be mistaken for the named product Excel, but count-only output does
not establish which item was overcounted. Payroll inference or a tally error are
also possible. Spreadsheet evidence itself remains a plausible reading. Education
differs from the tentative reading but is unresolved due to broken table order,
completion assumptions and international mapping; do not score it as a confirmed
model error. Experience's winning bin is plausible, not established by exact dates.

User requested another wording. A small same-document diagnostic is prepared
below; no additional send has been performed by the assistant.

## 02b: coverage wording comparison (user result recorded)

Request: [02b-coverage-comparison.json](02b-coverage-comparison.json), same parsed
French administration CV and identical coverage item list as request 02.

- `coverage_original`: v001 instructions and unchanged criteria.
- `coverage_revised`: [coverage v002 candidate](../../snippets/skill-coverage-v002.json),
  unchanged criteria. Generic match-then-count instructions; no answer-specific hint.
- `skill_evidence_excel`: unchanged v001 skill-evidence form, with named Excel
  and its aliases. Generic `Tableur` alone does not evidence this named product;
  provisional expected reading is `not_mentioned`.

Both count readings are provisionally `2`. Record all distributions, not just
the winner. If both counts overcount despite absent Excel, Excel confusion is
not established; payroll inference or tally errors remain possible. If the
revised form improves, test it across other fields before adopting it. A changed
original-count result can reflect request context/model variability; this is not
an exact replay of request 02. No quality gain can be inferred before results.

Evaluation goals supplied by user: roughly 90% on clear, well-parsed/easy cases
and above 60% on harder cases. These are **targets**, not observed success rates;
they require reviewed labels, defined easy/hard categories and a larger sample.
An alias library may help semantic matching; generic categories must not be
declared equivalent to specific products just to improve a selected example.

- Status: supplied through `/tmp/buffer`, matched exactly against cached JSON.
- Request SHA-256: `49e9a59990e91c23c7899c507bae71c1705aa4f013232dc37fd925937f4bae1e`.
- Response: `/home/ubuntu/.cache/cvextract/requests/49e9a59990e91c23c7899c507bae71c1705aa4f013232dc37fd925937f4bae1e/attempts/2d753c7c0ab34ad1912a08b28743ddfb/response.json`.
- Usage: **1512 input / 168 output tokens**, `jev-1.14.0`.

| ID | Choice | Confidence | Nonzero probabilities |
| --- | --- | --- | --- |
| Original count | `2` | 0.84 | 1: 0.01; 2: 0.87; 3: 0.12. |
| Revised count | `2` | 0.92 | 1: 0.01; 2: 0.94; 3: 0.05. |
| Excel evidence | `not_mentioned` | 0.63 | Not mentioned 0.72; stated/studied 0.25; applied 0.01; professional 0.02. |

Both count winners agree with the provisional reading. The revised question has
more probability on count 2 in this one comparison. However, the original count
also changed substantially from request 02; no repeatability or accuracy gain is
established. Excel retains some probability of unsupported mention. Use v002 as
a candidate on the next CV, not as a validated fix or an excuse to widen aliases.

## 03: plumbing and ongoing education (user result recorded)

Request: [03-plumbing-fr.json](03-plumbing-fr.json). Input:
`precv-012-moderner-cv.md` from this batch. Forms v001 except coverage candidate
v002. Six questions; no new wording or role-specific answer hints.

| ID | Provisional reading | Caveat |
| --- | --- | --- |
| `education_level` | `not_stated` | Only scoped CAP is explicitly “en cours”; do not infer completion from time elapsed. This experiment is completed-only, not the future expected-award mode. |
| `certification` | `not_mentioned` | SST credential is not named. Following safety instructions alone is not certification. |
| `experience_years` | `3_to_under_5`, tentative | Plumbing helper starts in 2023; a late-2023 start could still be under three years at 2026-11-12. Earlier caretaker work includes minor repairs/leak reporting, not clearly whole-role plumbing duration. Exact bin unresolved. |
| `skill_coverage` | `2` | Site preparation and replacing plumbing joints/seals evidenced; Excel/welding not evidenced. |
| `skill_evidence_joint_replacement` | `used_professionally` | Explicit supervised joint replacement under employment. Professional context is not independence or proficiency. |
| `skill_evidence_tap_repair` | `applied` | Explicit tap repair is in volunteering. Generic small equipment replacement at work does not necessarily evidence this specific activity. |

The last two questions contrast supervised employment with supervised volunteering;
do not equate supervision with nonprofessional context. Year-only dates are a
hard/ambiguous case, not a strict accuracy label.

### Result

- Read `/tmp/cvextract-03-plumbing.json` with jq and matched against cached JSON.
- Request SHA-256: `05ffc8d1bc247625f7b3aba55240b241441f01026efd8ea42004ad31cee46bb7`.
- Response: `/home/ubuntu/.cache/cvextract/requests/05ffc8d1bc247625f7b3aba55240b241441f01026efd8ea42004ad31cee46bb7/attempts/21386dc2664a45ca977ae40551cc7deb/response.json`.
- Usage: **2430 input / 376 output tokens**, `jev-1.14.0`.

| ID | Choice | Confidence | Nonzero probabilities |
| --- | --- | --- | --- |
| Education | `not_stated` | 1.0 | Not stated 1.0. |
| Certification | `not_mentioned` | 1.0 | Not mentioned 1.0. |
| Experience | `3_to_under_5` | 0.54 | Under 1: 0.08; 1–under 3: 0.27; 3–under 5: 0.63; 5–under 8: 0.02. |
| Coverage | `2` | 1.0 | 2: 1.0. |
| Joint replacement evidence | `used_professionally` | 0.99 | Applied 0.01; professional 0.99. |
| Tap repair evidence | `applied` | 0.99 | Applied 0.99; professional 0.01. |

Five clearer fields agree with provisional readings, including ongoing-study
exclusion and employment/volunteering distinction despite supervision in both.
The experience winner is plausible, but low concentration does not resolve the
missing months. Coverage candidate v002 agrees on this CV; no general counting
reliability established. No form revision; next request keeps coverage v002 and
other forms v001.

## 04: retail and listed software (user result recorded)

Request: [04-retail.json](04-retail.json); input `precv-023-moderner-cv.md` from
this batch. Five questions; same forms as request 03, only arguments differ.

| ID | Provisional reading | Caveat |
| --- | --- | --- |
| `education_level` | `secondary_or_lower` | Secondary education explicitly completed in 2018; overall scope. |
| `certification` | `not_mentioned` | Emergency First Aid at Work/EFAW not evidenced. Other first-aid qualifications would not automatically be equivalent aliases. |
| `experience_years` | `5_to_under_8` | Customer-facing roles from 2019 to present; a short unspecified gap is acknowledged. Exact duration still not extractable, but broad bin is plausible. |
| `skill_coverage` | `3` | POS listed; stock checks and returns in work. Demand forecasting not evidenced; stock checking is not forecasting. |
| `skill_evidence_pos` | `stated_or_studied` | POS is a practical-skills-list entry, not explicitly linked to an application example. Handling payments alone must not establish POS-system use. |

Probe: whether retail occupation/payment duties lead to unsupported professional
software-use attribution, and whether related inventory tasks imply forecasting.

### Result

- Read `/tmp/cvextract-04-retail.json` with jq; matched cached JSON.
- Request SHA-256: `a61abb23c9276020d445c66229ff0c5ec2e39260f393a1dd4b6c93f544a56057`.
- Response: `/home/ubuntu/.cache/cvextract/requests/a61abb23c9276020d445c66229ff0c5ec2e39260f393a1dd4b6c93f544a56057/attempts/e25749436f0c44e6ab2fb7477b5ecf1e/response.json`.
- Usage: **2021 input / 309 output tokens**, `jev-1.14.0`.

| ID | Choice | Confidence | Nonzero probabilities |
| --- | --- | --- | --- |
| Education | `secondary_or_lower` | 1.0 | Secondary/lower 1.0. |
| Certification | `not_mentioned` | 1.0 | Not mentioned 1.0. |
| Experience | `5_to_under_8` | 0.59 | 3–under 5: 0.01; 5–under 8: 0.67; 8+: 0.32. |
| Coverage | `3` | 0.99 | 3: 0.99; 4: 0.01. |
| POS evidence | `stated_or_studied` | 0.56 | Not mentioned 0.04; stated/studied 0.67; professional 0.29. |

Top choices match provisional readings. However, 8+ receives 0.32 despite an
earliest documented start in 2019 and reference date November 2026 (under eight
years even without gaps); date probabilities are not a trustworthy calculation.
POS retains unsupported professional-use probability but its winner respects
the tools-list boundary. No wording revision; candidate coverage v002 continues.

## 05: Lavandula, generic spreadsheets versus named Excel (user result recorded)

Request: [05-administration-lavandula.json](05-administration-lavandula.json);
input `precv-044-lavandula.md` from this batch. Same forms: v001 except coverage
v002. Six questions, including two instances of the same skill-evidence form.

| ID | Provisional reading | Caveat |
| --- | --- | --- |
| `education_level` | `not_stated` | Office-administration coursework, 2008–2009, without a stated awarded qualification; dates alone don't establish an award. Completion/qualification wording remains somewhat ambiguous. |
| `certification` | `not_mentioned` | Listing Excel/Microsoft 365 is not a Microsoft Office Specialist credential. |
| `experience_years` | `8_plus` | Relevant roles from 2017 to present, no stated long gaps. |
| `skill_coverage` | `2` | Excel and scheduling evidenced; SQL and Power BI not evidenced. Generic reporting/charts are not proof of those tools. |
| `skill_evidence_spreadsheets` | `applied`, tentative | Concrete community repair-café spreadsheet project. Work mentions trackers/logs but not explicitly spreadsheets; the profile references spreadsheet care, leaving some professional-context ambiguity. |
| `skill_evidence_excel` | `stated_or_studied` | Excel is listed; the concrete spreadsheet project doesn't name its software. Do not silently equate every spreadsheet with Excel. |

The spreadsheet-context question is deliberately harder than a list-only case.
Preserve competing probabilities rather than count every disagreement as an
unambiguous failure. No source-PDF verification/strict ground truth or live call
by the assistant.

### Result

- Read `/tmp/cvextract-05-lavandula.json` with jq; matched cached JSON.
- Request SHA-256: `752a2897723f9903aa6f4f0f901779e0874903496c14b3895e782b296b88db6c`.
- Response: `/home/ubuntu/.cache/cvextract/requests/752a2897723f9903aa6f4f0f901779e0874903496c14b3895e782b296b88db6c/attempts/5be3e293bef84774b295074ccc4bb5c4/response.json`.
- Usage: **2258 input / 368 output tokens**, `jev-1.14.0`.

| ID | Choice | Confidence | Nonzero probabilities |
| --- | --- | --- | --- |
| Education | `not_stated` | 0.60 | Secondary 0.03; vocational 0.27; short-cycle 0.04; not stated 0.66. |
| Certification | `not_mentioned` | 1.0 | Not mentioned 1.0. |
| Experience | `8_plus` | 0.99 | 5–under 8: 0.01; 8+: 0.99. |
| Coverage | `2` | 1.0 | 2: 1.0. |
| Spreadsheet evidence | `applied` | 0.44 | Stated/studied 0.01; applied 0.58; professional 0.41. |
| Excel evidence | `applied` | 0.68 | Stated/studied 0.03; applied 0.76; professional 0.21. |

Excel application is unsupported under the selected strict explicit-linkage rule:
the concrete project names a spreadsheet, not Excel, and Excel appears separately
in a skill list. The generic spreadsheet winner is plausible, while its work
context remains ambiguous. An alias library must not declare spreadsheets and
Excel equivalent. The wrong named-tool winner has confidence 0.68: an arbitrary
confidence cutoff cannot substitute for sound semantics or establish accuracy.

New candidate [skill-evidence-v002](../../snippets/skill-evidence-v002.json) makes
the same-skill linkage requirement explicit, without naming Excel or this CV.
Criteria unchanged; **not evaluated**, no further request/call prepared.

## Batch checkpoint

Completed: five PDF-derived CV experiments, 28 main question instances, plus one
three-question wording comparison on the same French administration CV. No source
Markdown used; no API call made by the assistant; user manually ran requests.
Reported usage for the five main requests totals **11254 input / 1743 output
tokens**; including diagnostic 02b: **12766 input / 1911 output tokens**. These
are artifact usage totals, not verified account billing or a count of retries.

Working candidates, not production validation:

- v001 education handled explicit ongoing study, but international mapping,
  coursework/award ambiguity, scoped school qualifications and expected degrees
  remain unresolved. No bachelor's/master's/doctorate case in this batch.
- v001 certification avoided unrelated-skill inference. **All five configured
  credentials were absent**; positive generic-form extraction is untested. The
  earlier positive IOSH result used the original tailored maintenance question.
- v001 experience winners are broadly plausible, but dates/boundaries are weak;
  retail assigned substantial probability to a bin excluded by the documented
  date range. Do not present probabilities as verified date arithmetic.
- Coverage v001 disagreed with one provisional count; v002 matched the diagnostic,
  plumbing, retail and Lavandula readings. All lists had four items; these are
  selected comparisons, not proof of counting reliability or broad improvement.
- v001 skill evidence separated work from volunteering and resisted some list-only
  inferences, but incorrectly linked listed Excel to a generic spreadsheet project
  under our strict rule. v002 linkage wording is saved, not tested.

Do not report an accuracy percentage from provisional/ambiguous labels. The user's
90% easy / >60% harder goals require reviewed examples and a defined denominator.
Useful later checks: positive credentials with aliases, degree levels, absent
versus ongoing qualifications, varied list sizes, explicit-versus-generic product
usage, negated skills, and exact date-boundary controls. No more runs or wider
batch testing are authorized automatically by this checkpoint.
