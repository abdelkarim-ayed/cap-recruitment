# CV extraction semantics

Agreed integration direction, not a claim that the platform builder/jobs are
implemented. [Research and migration handoff](cv-extraction-handoff.md) records
evidence, known failures, portable files and deferred work. The latest flat
[JSON schema](../parser-evaluation/cvextract/examples/simple-tasks.schema.json)
and [Jinja specification](../parser-evaluation/cvextract/examples/request.json.j2)
replace the earlier nested experimental task shapes.

## Purpose and boundary

Vacancy creators choose document extraction questions and supply arguments through the GUI. The document is parsed, questions are generated programmatically for Jev, answers populate fields, and a human verifies them before CSV export.

**The platform does not filter, reject, rank, or score candidates.** Any comparisons, combinations of exported columns, or preselection decisions happen outside the platform after export. The same boundary applies across job fields.

Keep extraction inexpensive and focused on document-supported facts useful for preliminary review. Avoid subjective competence judgments, information better collected directly in the application form, and questions that require an interview or practical assessment. Do not automatically attach several questions or explanations to every skill.

This document describes semantic question families, not a confirmed Jev API contract. Returned choice probabilities can support review flags; they are not assumed to be calibrated confidence scores.

## Reference date and task configuration

- Freeze `reference_date` at the vacancy's **first publication** and persist it.
  Draft previews may use today provisionally. Neither draft edits nor PDF
  processing/reprocessing times change the published reference date.
- The lifecycle is draft edits → published, without published-to-draft revision.
  A six-month window means six months from publication, not from processing.
  Rolling cutoffs/long-open-vacancy refresh are deferred.
- Tasks use unique IDs and may repeat any type. Optional clauses are omitted
  when not configured. The form builder can preview rendered questions/choices
  without an inference call; this preview is intended integration work.
- A skill/certification value can be a string or `{name, aliases}`. Aliases can
  be handwritten or injected programmatically. Skill accepted terms may be
  directional (SQL accepting T-SQL); do not automatically reverse the relation.
  Credential aliases still identify that credential, not merely related training.

## Question families

### Education level (`education_level`)

- Arguments: optional qualification scope; optional `expected_within_months`;
  the frozen publication reference date supplied to the question.
- Extract the highest relevant level completed or explicitly expected within
  the configured window after the reference date. Omitted/zero window means
  completed-only. **No default two-month window.**
- Optional scope restricts the relevant qualifications, for example to engineering.
- Levels: secondary or lower; vocational/technical; short-cycle higher education; bachelor's; master's; doctorate; no education stated.
- Use a consistent policy for mapping international qualifications. University identity is out of scope for the initial extractor.
- An expected graduation date is evidence of expected completion, not proof of an awarded qualification.
- The selected shape returns a level qualifying within the configured window,
  not a separate awarded/expected status. Show the task/window in review; never
  describe that level as proof of an already awarded qualification. Separate
  status/annotation was discussed but is not an implemented or selected field.

### Specific certification (`certification`)

- Ask about one certification per question.
- Argument: `certification` as a string or `{name, aliases}`. Dictionary
  enrichment/search suggestions are future conveniences, not prerequisites.
- Aliases represent the same credential, not unrelated alternative qualifications. To ask about multiple acceptable certifications, create separate questions. Any OR/count combination of their columns happens after CSV export, outside the platform.
- Choices: **Present / Not mentioned**.
- **Validity checking was explicitly removed** from the selected configuration.
  No checkbox, expiry rules/durations or current/expired categories in the latest
  schema/template. Those earlier proposals are deferred, not delivered behavior.
- Technology use, exam preparation or related training alone does not establish certification.

### Years of experience (`experience_years`)

- Arguments: optional scope and the frozen publication reference date.
- Scope may be a free-text description, overall work experience, or predefined relevant fields. Multiple selected fields mean OR; overlapping periods count only once.
- Extract documented relevant employment duration, rather than estimating proficiency.
- Thresholds: **under 1 / 1 to under 3 / 3 to under 5 / 5 to under 8 / 8+ years**.
- Use the reference date for current roles. Do not assume every skill listed under a long role was used throughout the entire role.
- Current five-bin shape includes zero evidenced duration in under one year;
  this is not proof of zero actual experience. A separate missing/zero category
  is not selected. Dates/gaps can still leave the bin unresolved for human review.

### Skill coverage (`skill_coverage`)

- Argument: `skills`, a list of strings or `{name, aliases}` entries for skills
  or knowledge areas. Accepted terms apply to that configured target only.
- Return a **coverage count**, an integer from zero to the number of supplied items.
- Count each item once when explicitly mentioned or unambiguously described; synonyms must not produce duplicate matches.
- This is a mention count, not proficiency, candidate quality or a screening score.
- Intended for breadth across secondary skills. Critical skills can receive individual evidence questions rather than being hidden inside a count.

### Specific skill evidence (`skill_evidence`)

- Argument: `skill`, one string or `{name, aliases}` for a skill, knowledge area
  or activity. Multiple individual tasks can coexist in the same extraction.
- Ask one choice question about the strongest explicit evidence in the CV.
- Choices:
  - **Not mentioned:** no identifiable reference.
  - **Stated or studied:** listed, claimed or learned, without a concrete application example.
  - **Applied:** used in a concrete personal project, coursework project, practical training, volunteering or other activity.
  - **Used professionally:** explicitly applied in professional work.
- These describe evidence context, not competence or proficiency. Do not infer professional use solely because a skill list appears near employment history.
- Do not add duration, independence, claimed proficiency or long-term-use questions automatically. Relevant skill-specific duration can be requested separately through the experience question when necessary.
- Cost-conscious vacancy configuration: one coverage question for secondary skills, plus individual evidence questions for a few important skills.

## Uncertainty, failures and review

- Prefer keeping the substantive answer categories separate from a generic `cannot determine` option, using Jev's returned choice probabilities to flag close or uncertain classifications programmatically where supported.
- This is a proposed review mechanism, not an automatic candidate decision. Thresholds and Jev API behavior remain to be verified.
- Keep three states distinct: a legitimate **not mentioned** answer; uncertain classification between substantive choices; and an unusable document or failed extraction.
- Never turn parse failure into not mentioned or a coverage count of zero. An answer may be withheld/failed for review when no trustworthy extraction was obtained.
- Non-mention means not evidenced in the supplied document, not that the candidate lacks the qualification or skill.
- Avoid mandatory explanations or examples for every answer; request additional evidence only where justified by review needs and cost.

## Parser experiment conventions

- Parser experiments live under `parser-evaluation/`, separate from corpus generation.
- Use native-text/no-OCR parsing by default for the text PDF corpus unless testing OCR explicitly.
- Preserve earlier results when comparing configurations or parsers.
- JSON outputs can be verbose: inspect them through `jq` filters and summaries rather than reading the entire payload.
- Synthetic CVs and expanded Markdown are not automatically extraction ground truth; reference answers need review before scoring parser/model performance.
