# CV extractor — selected direction and bounded source implementation

Updated 2026-11-13 after the separate lab research and [authorized portable transfer](../../research/cv-extraction-lab/README.md). **Main still implements only the Noul `extractSkills` starter**, skill-list JSONB, per-skill tri-state corrections/export and explicit processing CLI. Transferred assets are not implementation of the five-family extractor, parse/request caches, publication reference date or background runner. [Current contract](../current/contracts/processing-review-api.md) and [Jev safeguards](../current/jev-safety.md) remain authoritative for existing behavior.

The separate `feat/cv-extractor-integration` worktree now contains the bounded
vertical **source implementation**, uncommitted/unmerged and untested/unbuilt
after the user's stop-testing instruction. Migrations 009/010 are unapplied;
main/services are untouched. [Checkpoint notes](research/cv-extraction-implementation.md)
and the worktree's current contract supersede unresolved mapping/implementation
suggestions below; no deployed or live-quality claim follows.

## Delivery boundary and sequence

Prioritize a reasonably finished presentation/demo feature: **private PDF → parsed Markdown → structured extraction → persisted machine results → HR correction → effective CSV**. No extraction-driven candidate ranking, filtering, rejection, hiring or competence score. Existing explicit human screening/recruitment commands remain unchanged; the lab's extraction-only scope does not remove them.

Two bounded phases:
1. **Portable transfer complete:** research/configuration/synthetic fixtures and 20 exact recorded request/response pairs copied to `research/cv-extraction-lab/`, with checksums/provenance/licenses and lab originals preserved. No environment, broad cache, spending latch, credentials or CLI source transplanted. The archive is uncommitted and outside application runtime.
2. **Platform integration:** first agree result/persistence/export and execution boundaries, then implement the document-field CV extractor through the existing domain, storage, processing, gateway, review and frontend seams. The intended interface is backend asynchronous task execution, not shelling out to the lab CLI. An unattended live runner remains blocked on durable attempt recovery and separate activation consent.

[Research/integration handoff](research/cv-extraction-lab.md) maps the lab files, assets, current code and acceptance checkpoints. It supersedes the earlier “choose a second template first” discussion. Do not restart open-ended research or execute the rest of the recruitment backlog.

## Selected authoring and question contract

One logical **CV extractor** attaches to an existing file/document input. Its configuration contains flat questions/tasks with unique IDs; any family may repeat. Outer platform source association/output identity still needs mapping—“flat” does not remove document authorization or require copying the lab schema unchanged into `processingDefinition`. Code owns the templates; HR supplies bounded arguments, not arbitrary provider JSON/prompts.

Portable authoritative lab references under `research/cv-extraction-lab/snapshot/`:
- `docs/cv-extraction-handoff.md` and `docs/cv-extraction-semantics.md`.
- `parser-evaluation/cvextract/examples/simple-tasks.schema.json`, `request.json.j2` and `review/README.md`.
The original lab remains `/home/ubuntu/cv-extraction-lab`; use the transferred copies for integration. Historical instructions in frozen files are research context, not permission to execute installs/send commands.

| Family | Selected field/semantics |
| --- | --- |
| `education_level` | Highest qualifying level: secondary/lower, vocational/technical, short-cycle higher, bachelor's, master's, doctorate, not stated. Optional scope; optional expected-completion window |
| `certification` | One named credential: Present / Not mentioned as held or completed. **No validity/expiry checking** |
| `experience_years` | Relevant documented duration bin: under 1 / 1–under 3 / 3–under 5 / 5–under 8 / 8+ years. Multiple scopes mean OR; count overlaps once. Not exact extracted date intervals or verified arithmetic |
| `skill_coverage` | One count 0…N over configured accepted items, not proficiency or a candidate score. Native Choice options map locally to integers |
| `skill_evidence` | One skill's strongest explicit context: Not mentioned / Stated or studied / Applied / Used professionally. Not a competence/proficiency ladder or proof of ability |

Skills/certifications accept a string or `{name, aliases:[]}`; handwritten or programmatic enrichment is allowed. Skill accepted terms are target-specific/directional (SQL may accept T-SQL, not automatically vice versa); credential aliases must identify that credential. No mandatory dictionary, similarity-derived equivalence, graph, explanations or multiple automatic questions per skill. Optional clauses disappear when not configured.

Jinja is the readable specification, not a required production runtime. Prefer a typed TypeScript request builder if straightforward; an alternative template engine must reproduce JSON escaping, omission rules and question/choice order rather than assume Jinja compatibility. The form builder previews the actual generated question and choices deterministically, without a provider call. Hydrate `$cv` with actual parsed Markdown, not a path or document ID; examples containing `$cv` are request specifications, not responses.

### Publication reference date

Persist the authoritative reference date at **first successful vacancy publication**, under the existing publication lock and separate vacancy/interview revision checks. Draft previews may use today visibly provisionally. Draft edits, processing time, retries and close must not move the frozen date. Production context requires that stored date even though the lab input schema permits omission before resolution.

Expected education windows are measured from publication; omitted/zero means completed-only, with **no implicit two-month window**. The selected answer is one window-qualified level, not a separate awarded/expected status; display the task/window so expected completion is not presented as an awarded degree. Rolling refresh/reopening/rounds remain deferred. The instant-to-date timezone convention, persistence/snapshot propagation and handling of already-published legacy vacancies need the integration plan; `updated_at` is not a reliable historical first-publication date.

## Proposed data path (not a migration spec)

1. Validate/snapshot source association, configured flat questions/accepted terms and publication date. Preserve stable question/output identity and repeated families.
2. Authorize/read original private bytes with existing size/hash checks. Native-text parse into Markdown plus parser version/options/warnings/source provenance; no implicit OCR/hosted fallback or source-authoring-Markdown substitution.
3. Look up/create the separate parser artifact, then construct the complete credential-free Jev request. Batch configured questions sharing that CV/date when within existing limits, preserving source/question identity; do not combine unrelated documents or silently truncate/split into extra paid calls.
4. Look up the exact-request cache or make one separately authorized gateway-backed attempt, with durable concurrent-send/uncertain-recovery protection.
5. Validate complete expected question IDs/types/choices/probability distributions/usage and preserve the raw response. Persist normalized original fields, raw probabilities/confidence and provenance separately from HR corrections.
6. Share one effective-value projection between per-field HR review and CSV. Keep no override, explicit unknown/null and removal distinct; never rewrite original evidence or overwrite HR corrections. Cache reuse still passes current application eligibility and late-write fencing.

**No confidence thresholds, margins, caps or automatic acceptance transformations are selected.** The old Noul >=0.8 rule is legacy starter behavior, not a conversion rule for new Choice answers. Non-mention/zero, uncertain substantive classification, parser/extraction failure and unavailable values stay distinguishable. `experience_years.under_1` includes no evidenced duration; it is not proof of zero actual experience. Do not invent additional automatic questions/categories or calibration from the exploratory results.

Runtime result/correction schemas, batch-to-field persistence, typed UI controls, per-field save/no-op attribution and export keys remain implementation contracts to design. Current task/correction rows are keyed by application/task, not question; JSONB alone does not solve field identity/validation. A question's machine answer and HR override must be inspectable independently. No major ER change is preapproved.

### Two caches and durable attempts

- **Parser cache:** bounded in-memory storage, keyed by PDF bytes hash and parser version/options (and material preprocessing choices). Retain Markdown/hash/warnings/provenance; same bytes with another parser/options must not silently reuse old output. The user's latest implementation instructions supersede the earlier persistent-cache proposal; memory loss on restart is expected.
- **Request cache:** bounded in-memory successful responses, keyed by SHA-256 of the exact **fully hydrated credential-free request bytes**, including effective pinned model, actual Markdown, frozen date, questions/accepted terms and choice order. Use deterministic serialization; verify saved bytes equal the lookup request. No random IDs, CV paths, arbitrary composite filename hashes or mandatory redundant builder-version key; provenance may record builder identity separately. Match the bytes the gateway actually serializes/sends, including its model override.
- Only complete validated responses are success hits; no refresh by default. Failure/partial/unknown completion is not a success hit and must not automatically cause another send. Preserve original usage/probabilities; replay is not a new billed usage observation or new quality evidence. Do not mix fixture successes with live-cache provenance.
- Durable DB/job coordination must serialize same-request concurrent work across processes, not just a process-local mutex or expiring cache lock. Persist a conservative attempt boundary **before send**; after crash/timeout/unknown commit, block automatic replay. Reusing a result after crash is different from repeating a paid call. Resolve both per-request coordination and existing per-application fencing.
- All cache/artifact reads remain private, authorized against the current source/application. A content hash is not a permission token. No credentials in keys/bodies/logs; no default CV/payload logging. Storage ownership, retention/bounds/cleanup and access scope need a bounded contract, not a generic cache platform.

Current `ProcessingRepository.claim()` marks interrupted processing retryable without durable live-admission knowledge. Classification as uncertain does not fix that gap. **B4-S must precede unattended live B4-R**, including cache-miss concurrency, crash recovery and gateway-block stop behavior. Do not transplant the CLI's latch/direct HTTP transport or assume gateway serialization is exactly-once job execution.

## Review, export and preserved workflow

Whole-application review starts after normal settlement or explicit manual release; readiness, recruitment and work queues remain independent. Release/completion/either committed screening outcome fence late processing writes. Answers/files/original results stay immutable; correction saves retain separate review revision, attribution, semantic no-ops and explicit conflict refresh/reapply. No claims/assignment/save-all/reopen or new candidate effects.

Each predefined family owns its output/CSV descriptor: independent fields get meaningful separate columns; a true list remains a list column. These five families normally return one field per configured question (coverage is a count, not a list of matched skills). Exact stable keys, null/status/source encoding and backward compatibility must be specified before implementation. Keep compact effective decision export separate from diagnostic original/provenance export; preserve formula-safe quoting, caps/private links and unchanged decision-import ID/email/outcome semantics. Import never writes extraction corrections.

Preserve the [merged frontend baseline](../current/guides/frontend-design.md): document-associated configuration, readable inspect/edit separation, per-field source-PDF review, focused guarded dialogs, truthful fixture labels and technical detail in secondary disclosures. Extend typed controls/results; do not resume the completed UI overhaul.

## Parser, evidence and cost boundaries

The lab verified official `@firecrawl/pdf-inspector` **1.25.2** availability/native async bindings, **not Node execution or Python/Node parity**. Prefer a bounded offline Node feasibility/parity checkpoint before choosing it. Keep native parsing off the API event loop with cancellation/time/resource isolation; an async native method alone is not a killable memory/time sandbox. Main currently uses a credential-free killable PDF.js child. An isolated Python wrapper is a fallback to discuss, not a requirement to port the lab CLI/environment.

The lab handoff records 20 request/response artifacts / 102 question answers / 14 identities: exploratory, not validated accuracy or destination live-provider evidence. Latest concise schema/Jinja wording has offline checks only and differs from evaluated prompt snapshots. Known tool-linkage over-inference, date/count reasoning and international qualification ambiguity remain human-review caveats; explicit negation policy is still open. Preserve original distributions/counterexamples, not invented accuracy or cost guarantees.

Evidence highlighting/quotes, searchable suggestions/skills graph, advanced segmentation/retrieval, OCR, validity checks, rolling dates, extra language/management families and further evaluation are later work, not delivery prerequisites. Exact regeneration of every historical PDF is not required.

Frugality is durable; the lab CLI's scheduling/cache/latch implementation is not. Future backend/provider/cache designs can evolve with explicit scoped approval. **For now preserve JevGateway, pinned model/endpoint, budgets/Redis namespace, disabled defaults and credential restrictions**; no paid smoke, SDK retry, limit/counter reset or bulk drain follows from research/implementation permission. Payload/question-count bounds must be reconciled without silently widening controls. Read [safety](../current/jev-safety.md) and load project `typesafe-ai` before Jev work.
