# Extraction templates, review columns and evidence — design discussion

**Status:** typed-registry direction selected; schemas/templates/second task not finalized. Current implementation remains predefined skills Noul >=0.8, tri-state review and compatible JSONB storage. Read [Jev safety](../current/jev-safety.md) and load project `typesafe-ai` before implementation/research on the provider. No live calls/limit tests authorized.

## Desired authoring model

HR selects a bounded template and supplies arguments (skills, certification names, languages, domain-specific categories). Code deterministically builds typed questions; HR does not write arbitrary prompts. Provider batching groups questions over shared document text without forcing every HR task into a monolithic CV task. No open-ended skill generation or enormous universal skills dictionary is selected. Candidate name/contact/residency/relocation are better asked in the form; no extraction/fallback logic is promised for them.

Potential preset catalog (gradual, not all at once):

| Facet | Useful across domains | Honest output / obstacle |
| --- | --- | --- |
| Skill context | Welding, budgeting, laboratory methods, sales, SQL | Separate stated/learned/project/work/certification assertions; these can coexist, not a universal ordered proficiency ladder |
| Dated experience | Roles, responsibilities, relevant sectors | Claimed years/bands vs validated date intervals; overlap, gaps, ongoing roles and relevance need explicit rules |
| Certification/license | Configured safety, accounting, trade or technical credential | Mentioned vs completed/current/expired/unknown; CV claim is not registry verification |
| Education | Specified degree/program/field | Completed/in progress, level and equivalence unknown; local degree systems differ |
| Language | Configured language and claimed level | Explicitly stated level vs inferred ability; do not infer fluency from CV language |
| Management | Supervision, team/project/budget responsibility | Explicit claims and unknown scope, not a universal quality score |

All six were considered useful by the user; **no second-template priority was finally selected**. Earlier recommendation of a single ordered skill-proficiency scale was too simplistic: certification, study, projects and work are different evidence contexts, not monotonic competence levels. Recommend multiselect factual facets or independent typed flags with unavailable, while keeping the HR editor compact. Exact UI/result shape remains open.

## Proposed data path (not a migration spec)

1. Versioned task template + validated args produce stable output descriptors/keys and typed questions.
2. Extraction result keeps source/task identity, schema version, status, original typed values, evidence when supported and provenance.
3. Separate correction layer overrides selected output values; unset override differs from explicit unknown/null. Shared revision counter protects changes; full history is not required.
4. One effective projection feeds review controls and CSV; it does not duplicate candidate answers or mutate originals.

**Selected presentation/export direction:** each predefined task owns its output descriptors and CSV shape. Independent availability/answer flags get separate named columns when meaningful (e.g. skill availability per configured skill or workplace availability); an actual list-valued extraction stays one list column. Readable form-answer lists are not a reason to collapse independent extraction fields. Example prefixes such as `skill_availability_<x>` are illustrative, not a selected rename/migration of the current CSV. Exact template catalog, keys, list encoding and quotation behavior are deferred to their bounded implementation discussion; current effective predefined-skill columns remain unchanged, with no new provider work authorized.

Editing follows the [screening/review boundary](product-decisions.md#readiness-review-and-progression): whole-application review starts after normal task settlement or manual release, and corrections lock at review completion or either committed screening outcome. Extraction is optional screening support, not a decision prerequisite; decision import never writes extraction values.

Relational identities/foreign keys for application, document, task and correction; JSONB for genuinely dynamic values. Runtime schemas complement TypeScript types. Current per-task corrections/results can remain until a second template proves another structure necessary. A suggested `extraction(id,result)` or `review_revision(id,generation,...)` table was illustrative, not selected schema. Default values must not turn unavailable/errors into false/zero. Stable export keys need documented collision/normalization rules.

## Evidence: quotes first, geometry later

**[selected direction]** Start with small, subdued verbatim quotes in review, if feasible. Rectangles/overlays deferred; future typed evidence could distinguish quote from bounding-box-plus-quote. Do not introduce a geometry schema merely as placeholders.

Obstacle: current Noul output is a probability, not text; it cannot supply arbitrary quotations. A quote needs a separately designed, approved source-selection mechanism. Earlier excerpt-choice algorithm was explicitly superseded. Choosing quotes-first does **not** reapprove that algorithm or authorize additional paid calls.

Candidate proposal: persist quote with immutable document reference/hash and parser/text version; verify quote occurs in parsed text. Optional text offsets/page identify repeated occurrences and support later navigation. Source presence does not prove semantic support; label missing/unlocated evidence honestly. Candidate input remains untrusted. A corrected value should not automatically inherit machine evidence that contradicts it; decide whether evidence is original-only or separately annotated by HR.

Rectangles need text-item coordinates, page transforms/rotation, font/layout/reading order, PDF viewer support and ambiguity handling. Re-finding quotes at display time is not guaranteed to identify the right occurrence. DOCX lacks stable PDF page coordinates; conversion introduces a distinct artifact/provenance problem. Current upload acceptance of DOCX does not mean parsing support. Discuss restricting task-compatible inputs or clearly reporting unavailable before adding an overlay.

## Cost, limits and evaluation

The user clarified bounded HR questions, not generating skills from arbitrary text. Current 12k-character/20-skill adapter limits and gateway caps are development protections, not chosen production policy; all remain unchanged. Admin/env tuning and monitoring can be considered later under separate consent.

No verified basis for "100k CVs under $10": depends on request size, questions, provider pricing/usage, parsing and failure rates. Request allowance != currency budget. Estimates from old discussions were not account measurements.

Jev cannot freely extract date/name/quote strings just because the TypeScript result type permits them. Deterministic experience arithmetic requires trustworthy dated inputs, not invented intervals from an experience band. Decide representation first, then question templates, then offline fixtures and separately approved bounded live evaluation. Keep failure/unavailable distinctions and exact sources; no fabricated quality scores.

Optional synthetic evaluation ideas retained from earlier discussion: fixed questions across varied English/French CVs (software, industrial maintenance, commercial operations, infrastructure), two-column reading order, negations, unrelated mentions, adversarial instructions, credentials and overlapping dates. These were suggestions/chat examples, not a saved evaluated dataset. Local Qwen/Laya/Kev alternatives remain research, not installed integrations or protocol-compatible substitutes.
