# Agreed task configuration: integration reference

[Research/platform handoff](../../../docs/cv-extraction-handoff.md) is the current
entry point. The configuration shape and publication-date rule are agreed;
runtime builder/jobs are not implemented here, and the concise wording has only
offline rendering checks, not live quality validation.

## Current, simpler proposal

The user rejected the earlier nested `args`/extra policy fields as over-detailed.
The new draft follows the semantic families in `docs/cv-extraction-semantics.md`:

- [simple-tasks.json](simple-tasks.json): flat task entries, including two
  instances of the same skill-evidence type. No apprenticeship flag.
- [simple-tasks.schema.json](simple-tasks.schema.json): formal proposed schema.
- [request.json.j2](request.json.j2): one Jinja template, branching by family and
  injecting names/scopes/aliases directly into concise native Jev questions.
- [simple-request.json](simple-request.json): offline-rendered result with the
  inline accepted names injected. No CV contents or inference result.

Certification/individual skills and coverage items each accept either a string
or `{ "name": "...", "aliases": [...] }`. The backend/dictionary may enrich the
plain string into that object before rendering; handwritten objects also work.
There is no mandatory global alias map. `aliases.example.json` is an earlier
proposal, not an input to the current template.

Skill aliases now mean explicitly accepted evidence terms for that target. For
example SQL may accept T-SQL/Transact-SQL; that does not automatically mean a
T-SQL question accepts generic SQL. Merely related terms still do not imply a
match. For certifications, accepted names must identify the requested credential,
not merely related training or another credential. Removing an alias clause when
empty and a scope/window clause when absent is handled directly in Jinja.

These shorter instructions/direct argument placement are **a new draft**, not
the exact prompts evaluated earlier. No claim that the Excel-linkage failure is
fixed. Review and bounded regression should follow approval, not automatic calls.
No builder, dependency change or platform integration is implied by these files.

Offline rendering/schema checks covered all five families, duplicate types,
optional scopes/windows/aliases, string/object names and JSON string escaping. Choice entries are
rendered in their intended order, not sorted by Jinja's default object-to-JSON
policy, since option order can affect Jev. Jinja/jsonschema were used through an
isolated uv environment; project manifests/lockfiles were not changed.

Render only validated task data with Jinja StrictUndefined and an already
resolved `reference_date`: the vacancy's saved first-publication date in
production, today only for provisional draft previews. No processing-time or
draft-edit-time default for published vacancies. All task types are restricted by the schema; reject
unknown types/duplicate IDs/blank names before rendering. JSON Schema `default`
and `format` do not themselves resolve dates or provide all validation. Dates
and aliases are enriched before rendering; final request content is hashed after
CV hydration as before. The formal schema's 254-item count cap is only the API
option limit, not a recommended practical list size.

### Limits and deferred decisions

- Education's optional window uses months from the reference date, **no default
  two months**. The example uses six months, a caller choice. This draft returns
  the level qualifying within that window, without a separately selected
  awarded/expected answer field. Show the definition/window in human review;
  do not present expected qualifications as already awarded. Richer status
  annotation is a future direction, not a new requirement for the initial path.
- Certification validity checking was explicitly removed from this proposal.
  Schema rejects validity flags/rules/durations; template only generates
  Present / Not mentioned. The older semantic proposal is not implemented.
- No explanations, citations, ranking, extra per-skill questions or confidence
  thresholds/caps. All results remain for human review. Explicitly negated skill
  mentions still need a policy rather than an invented label.

The older drafts below are retained as history, **not the current proposal**.

**Draft examples only**, requested for user comment before request-builder work.
No CLI builder or platform integration implemented; no inference calls.

- [proposed-tasks-v001.json](proposed-tasks-v001.json): HR/form-builder task data.
- [proposed-request-v001.json](proposed-request-v001.json): literal native Jev
  request-template expansion, generated offline from the saved experiment forms.

The accounting example uses familiar arguments from batch 002. It isn't a new
evaluation result. The task IDs are distinct output field identifiers, not labels
or screening rules. Any family may appear multiple times, with unique IDs and
its own arguments; the two skill-evidence tasks demonstrate that.

## Proposed mapping

1. Load CV Markdown once into `state.cv`; `$cv` is a CLI hydration placeholder,
   not a string sent literally to Jev.
2. Resolve the reference date once; put it in `state.reference_date`.
3. Copy each task's `args` to `state.question_args[task.id]`.
4. Generate one question under `questions[task.id]` using the frozen form for its
   family. Substitute only the argument-path placeholder in instructions.
5. For skill coverage, generate Choice keys `0..N` from the supplied list size.
   This is a count of evidenced configured items, not proficiency or ranking.
6. Hydrate/serialize before hashing; use existing exact-request caching/latch.

Forms: v001 education, no-validity certification, experience and skill evidence;
coverage v002. All six questions use Choice. Do not silently switch certification
to Noul or skill evidence to the unsuccessful v002 rewrite. No expected answers,
provisional labels or evaluation notes enter provider state.

## Initial semantics / unresolved choices

- Explicit reference date in this example; proposed optional default is backend
  run date, resolved and persisted once for reproducibility, not reevaluated on
  cache lookup. Exact timezone/default policy still needs approval.
- Education currently completed-only. Optional expected-completion horizon and
  status distinction remain unresolved; do not silently implement the old
  two-month proposal. International qualification mapping is not settled.
- Certification currently presence only, with aliases for the same credential.
  Validity checking is not implemented by this example. Full ACCA is not the
  same credential as completed exam stages or part-qualification.
- Scope omitted/empty could mean any field/overall work; choose one canonical
  configuration representation when implementing. Example supplies scopes.
- Paid-apprenticeship inclusion is explicit here, not a universal decided rule.
- Aliases are equivalent names, not products/categories/related skills.
- No review threshold, confidence cap, acceptance rule, explanation or quote
  request is added. Preserve raw answers/distributions; transforms need a
  separately approved result contract. Count choices can map to local integers.

Unsupported/incomplete tasks should produce configuration errors, not disappear
from the request. IDs must be unique; coverage item duplication and maximum list
size need validation. Identical task types are allowed, not deduplicated by type.

These files are proposals, not supported input for CLI `--questions`, which
remains not implemented. The native request template is structurally compatible
with `--request`, but no live execution is requested by creating these examples.
