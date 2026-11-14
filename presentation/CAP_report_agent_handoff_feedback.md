# CAP: report correction and limited stabilization brief

## Objective and constraints

Prepare a coherent, reasonably valorizing French engineering PFE report and a reliable presentation/demo. Approximately two weeks remain for the report, presentation, demonstration and presenter preparation. This is a software-platform project with an integrated AI assistance component, not a claim of a new NLP model or a production-certified ATS.

Preserve useful implementation and the broad six-chapter structure. Prioritize deletion, consolidation, accurate explanation, better figures and a small number of demonstrable fixes. Do not initiate a major architecture rewrite, new assignment subsystem, embeddings pipeline, monitoring product or broad research campaign.

The desired voice is the project author's account of requirements, choices, implementation and observations. It must not sound like an outside observer auditing repository notes or an agent addressing its operator. Internal documents were used partly as agent memory, instructions and task tracking; they are not a ready-made report narrative.

Present actual strengths confidently. Omit irrelevant development chronology and internal uncertainty discussions. Do not invent sprints, CI runs, stakeholder interviews, test outcomes, benchmarks, deployment status, business benefits, project duration or personal contributions. New work can be presented as final consolidation without claiming it existed throughout development. Contributions and acknowledgments must match the actual arrangement and applicable academic requirements.

## What went wrong in the generated report

1. Internal notes were paraphrased instead of synthesized for an academic reader.
2. Instructions to the report writer remained in the report, including figure instructions and references to captures to be supplied by "the user".
3. Development restrictions, tool-execution permissions and source-precedence rules leaked into the narrative.
4. Qualifications were repeated so often that they overwhelmed the delivered work.
5. Defensive titles discussed fabrication, uncertainty or things the project does not claim rather than naming the subject.
6. Historical checkpoints and unfinished task IDs were mistaken for an appropriate evaluation structure.
7. Multiple chapters repeated the same business distinctions and validation caveats.
8. Temporary demonstration limits were given disproportionate architectural prominence.
9. Existing exploratory AI work was buried under cautions, while future evaluation protocols occupied too much space.
10. The bibliography overrepresented internal source files and underexplained central external dependencies.

Do not solve this by deleting every limitation or turning uncertain statements into confident claims. Solve it by distinguishing the reader's information needs from the drafting process.

## Source hierarchy and evidence discipline

Inspect the actual current code, report source, runtime configuration, lab directory and available run artifacts. The reviewed PDF is a draft snapshot; it is not authoritative evidence that a behavior is implemented. Report author statements below are leads for inspection, not completed measurements.

Keep a private working matrix with: report claim; current implementation; evidence; proposed wording; disposition. Use statuses such as implemented / observed / exploratory / planned / unresolved. This matrix is a working aid, not another long chapter to paste into the report.

Do not put source-conflict resolution into the final text. Resolve obsolete documentation first, then describe the current system. Do not run paid calls or remove explicit execution/budget controls merely because this brief requests report correction. Inspect their provenance and applicable authorization.

## Proposed report structure

Keep approximately the existing structure, with consistent numbering and concise titles:

1. Contexte du projet et démarche de réalisation: verified host/project context, problem, objectives, scope, iterative workflow and deliverables.
2. Analyse des besoins et étude des solutions: actors, functional needs, non-functional needs, relevant ATS/parser alternatives and a requirements-based selection rationale.
3. Conception de la solution: business model, data, state transitions, authorization, snapshots and selected concurrency mechanisms.
4. Architecture et réalisation: stack, modules, persistence, representative implemented workflows, screenshots, CSV and actual deployment topology.
5. Assistance documentaire: Jev grounding, configured questions, PDF-to-text preparation, request construction, typed answers, review, exploratory development and representative errors.
6. Vérification et bilan: actual verification scope and results, demonstration setup, unresolved limitations and concise perspectives.

The abstract and conclusion should foreground delivered capability and selected results. State the overall prototype/evaluation boundary briefly. Do not repeat the detailed limitation inventory there.

Aim for the shortest complete report that meets school requirements, rather than a target page count. Around 60–70 pages could be reasonable if readable figures and required sections fit; do not pad or force that length. Do not add a long new chapter to repair a short paragraph.

## Immediate editorial removals

Page numbers refer to printed numbering in the reviewed PDF; find the corresponding source passages before editing.

| Location | Remove or transform |
|---|---|
| p. ii | Final-assembly instructions and statement that no English version is planned. Check actual school requirements independently. |
| pp. 1, 4 and glossary | Repeated concern that CAP's expansion is not historically attested. Introduce the chosen name once. |
| p. 4 | Commentary about lacking company information and avoiding artificial reconstruction. Replace with a concise verified host/project description. Do not invent one. |
| pp. 7–8 | Defensive discussion of not reconstructing Scrum, dates or duration from Git. Describe the actual iterative workflow directly. |
| pp. 3, 19, 33, 40, 62 | Internal source-precedence disputes, outdated-document corrections and report assembly paths. |
| Throughout | Figure instructions: Montrer, Faire apparaître, Utiliser, Ne pas afficher, Capture attendue. Replace with descriptions of the actual figure. |
| p. 59 | Capture à fournir par l'utilisateur. A screenshot is already present; check its currency and do not leave an author instruction. |
| pp. 61, 67, 69, 72 | Agent execution permissions and reminders that documents do not authorize execution. These are not report findings. |
| pp. 56, 64–65 | Unidentified utilisateur reports. Identify whether observations came from the author, developer, supervisor or actual target users. |
| p. 14 | Rejected third-party price figure and narrative about why it is excluded. Omit the rejected comparison. |
| pp. 62–63 | B1/R3/Q-* development codes and dated task-board detail from the main narrative. Retain only useful verified results, grouped by functionality. |

Delete rhetorical reassurance such as "Cette précision n'affaiblit pas le sujet" and "Cette conclusion ne réduit pas le travail à ses manques". They amplify doubt. Avoid repeated "aucun X n'est démontré" lists.

## Repetition policy

Assign each explanation a primary home:

- Overall scope and single-company deployment: Chapter 1.
- Actor responsibilities and requirements: Chapter 2, referenced rather than retold later.
- Distinct processing/review/recruitment dimensions and locking interactions: Chapter 3.
- Transactions/revisions: Chapter 3, with one implementation example in Chapter 4.
- Original/correction/effective value: full explanation once, preferably Chapter 5.
- Fixture versus real inference: one execution-mode table and a short demo label.
- Validation scope and missing verification: Chapter 6.
- Operational/legal scope: one concise applicable limitation paragraph; do not claim an exemption or audited compliance.

Tables 22 and 23 overlap; keep one detailed contribution/result synthesis. Remove repeated cost arithmetic. Use a cross-reference for the duplicated review screenshot unless it illustrates a materially different point.

## Titles and terminology

Use conventional subject labels rather than argumentative sentences. Suggested replacements:

| Current | Replacement direction |
|---|---|
| Démarche de réalisation et checkpoints | Démarche de réalisation |
| Des jalons documentés sans chronologie artificielle | Principaux jalons techniques |
| Des rôles nécessaires mais insuffisants | Rôles et autorisations contextuelles |
| Une coordination volontairement minimale | Organisation du travail partagé |
| Conception métier, données et garanties | Conception métier et modèle de données |
| Préparer une revue sans fabriquer un succès | Préparation de la revue et gestion des échecs |
| Une pile partagée, sans confondre typage et validation | Technologies et validation des données |
| Une frontière asynchrone interne, pas un second produit | Traitement asynchrone intégré |
| L'intégrité des octets ne dépend pas du nom du fichier | Stockage privé et intégrité documentaire |
| Ne pas inventer la facturation des sorties | Estimation du coût fournisseur |
| Les lacunes transversales conservées | Vérifications complémentaires |

Retain exact code identifiers only where they explain a mechanism. Explain French business meanings first. "Dimensions distinctes avec interactions contrôlées" is more accurate than suggesting the three state dimensions have no interactions.

## Business decisions: preserve scope, explain proportionately

### Interview failure

The developer deliberately made a final Fail outcome terminate the candidature and cancel outstanding interviews. Do not silently redesign it. State this as a current configured business rule: the assigned interviewer records a disqualifying assessment that terminates the process under the retained workflow. Do not simultaneously imply that only the vacancy owner can end any candidature. Distinguish this human-triggered rule from an automatic rejection by document extraction. Verify the actual transitions.

### Vacancy owner and no reassignment

Reassignment was omitted. Do not invent a transfer mechanism or administrative override. Do not propose sharing the owner's credentials as a workaround. Describe owner-scoped responsibilities without advertising every unimplemented administrative feature. If operational continuity is discussed, classify delegation/transfer as an extension.

### Shared screening and offline coordination

Defensible scope: CAP provides shared access and safely commits decisions; allocation of HR workload and discussion of criteria remain organizational processes. Filters and exports can support external coordination. Offline conventions are not enforced assignment or reservation. Describe first-committed-decision behavior as conflict resolution, not a claim that it determines the best HR decision. No new assignment subsystem is requested.

### Screening and optional review

Screening is an initial continuation/rejection decision, not a final assessment of professional competence. Questions provide selected documentary indicators; the human may consult the source and correct fields. Do not claim skipped review has no material cost, or that all competing ATS use crude keyword rejection. Review is an available control, not evidence that users actually use it.

### Reference date

Publication date is a defensible stable reference for all applications to the same vacancy, with a potential staleness trade-off for long-open vacancies. Submission date would instead represent each applicant's temporal context. Do not change the design casually. Explain the chosen stable reference briefly and consistently. Distinguish draft creation date from first publication date. Consider a small explanatory publication warning only if easy and consistent with the UI.

### Categories and missing information

Inspect actual schemas and normalization. Low confidence, not documented, negative, failed extraction and unknown after review are different concepts. Do not claim a confidence-to-null conversion unless implemented. For certification, a Boolean is acceptable for "document states certification obtained"; it is not a verified assertion about possession. Preserve the question semantics in review/export labels. For experience, explicitly identify whether unsupported duration is collapsed into the lowest band. For education, keep completed versus expected completion interpretable. Skill coverage is a selected-list count, not a general skill score or a ranking feature the platform does not implement.

## AI exploration: recover the actual development work

The developer describes the following exploratory process, partly outside Git in a lab directory:

- Synthetic CV construction with varied content, layouts, seniority, language, completed/incomplete qualifications and ambiguous descriptions.
- A staged generation process separating candidate content from template/layout selection, followed by plausibility checks.
- Exploratory question schemas tried on roughly twenty CVs; the exact count is not yet established.
- Positive and negative questions, including related concepts that should not satisfy the requested criterion.
- Examination of low-confidence and incorrect answers and revisions of phrasing/aliases.
- Persistent ambiguities, for example generic spreadsheet experience versus an explicitly named product.
- A Jinja template and CLI used during exploration, subsequently translated to TypeScript.
- Ideas for source quotations and alias assistance, not necessarily implemented.

Inspect the actual directory and preserve real artifacts. Do not convert this account into a formal benchmark. If exact counts or pairings cannot be established, omit precise counts instead of guessing. Do not confuse a historical saved request-response pair, current response cache, predetermined fixture, generated CV and independently checked expected answer.

Replace most future-protocol prose with a concise description of development method and observed examples. A useful table has: question; document excerpt; observed answer; expected interpretation; adjustment or remaining issue. Populate it only from recoverable observations or new recorded checks; never invent representative experimental results. New illustrative examples must be labelled as illustrations.

A development set used to choose prompts is not an independent evaluation set. A small final-version check can be added if practical, but no broad annotation campaign or two-annotator study is required by this brief. The qualitative findings can be valuable without an accuracy percentage.

### Jev grounding and confidence

Explain the actual service and endpoint used, model/version where available, state/questions/criteria contract, typed response, per-question distribution and how it is consumed. Distinguish vendor claims from project observations. Explain why this fits a handful of configured documentary questions without claiming universal superiority.

TypeSafe's confidence documentation states that Choice confidence is derived from the selected option's probability and option count. A 0.70 confidence value is not automatically 70% local CV accuracy. A low-confidence observation can motivate manual inspection; it does not prove an error or missing mention. Check whether code thresholds confidence, selected-option probability, neither, or another quantity.

Typed outputs restrict response shape, not semantic correctness. Do not claim prompt-injection immunity. Inspect the boundary between fixed questions and untrusted CV state; consider a few harmless adversarial CV-text cases using the existing authorized evaluation path if practical. No new security subsystem is requested.

### Diagram

The PDF already contains an extraction diagram, but its labels and adjacent explanation are insufficiently concrete. Improve the existing figure rather than adding duplicates: private PDF -> native reader -> Markdown -> request builder using schema/questions/reference date -> gateway/Jev -> validated typed answers -> stored original -> human correction/effective value. Place parser and response caches at the correct points. Keep detailed attempt-state machinery separate or in an appendix.

## Cost: retain a short, sourced estimate

Official sources checked on 13 November 2026:

- https://help.typesafe.ai/articles/5187202169-how-much-does-jev-cost
- https://docs.typesafe.ai/confidence
- https://api.typesafe.ai/docs
- https://typesafe.ai/blog/introducing-system-one-models-and-jev

The current direct TypeSafe price is USD 0.042 per million input tokens; output tokens are free. Confirm the application uses this provider/contract rather than a differently priced intermediary. Do not use unofficial similarly named sites as the authoritative source.

Conditional estimates for one request per document, including document plus complete questions/schema in the token count:

| Input tokens/request | Cost/request USD | Cost/1,000 requests USD | Cost/1,000,000 requests USD |
|---|---:|---:|---:|
| 2,000 | 0.000084 | 0.084 | 84 |
| 3,000 | 0.000126 | 0.126 | 126 |
| 5,000 | 0.000210 | 0.210 | 210 |
| 8,000 | 0.000336 | 0.336 | 336 |

These are scenarios, not measured averages or worst-case guarantees based on page count. Retain only a few rows if used. Hosting/storage/review are outside this supplier inference estimate; they need not become an invented total-cost model. Do not promise measured savings over full commercial ATS services. The existing lengthy section about unknowable output billing should be corrected, not merely made more confident.

## Small technical audit before changing limits

Return findings with exact files and current values. The report is not proof that the reported defaults still apply.

1. Locate 3/min, 20-total, concurrency, retry count, twelve-hour delay and timeout settings. Identify their source, environment, configuration and whether any applicable explicit restriction controls them.
2. Distinguish queue discovery, admission, actual transport, provider response, retry scheduling and persistence. One active request does not imply only one queued job.
3. Inspect whether polling finds multiple eligible applications and drains them sequentially; check starvation, lease expiry, manual closure and successful-task exclusion.
4. Do not change twelve hours into ten minutes without determining whether it is an HTTP timeout, retry backoff, lease or durable-uncertainty policy.
5. Keep the prohibition on blind resends after ambiguous paid transport unless the actual provider semantics and intended policy justify a reviewed change. Cache-only recovery is different from a retry.
6. Verify what closes on vacancy closure: stopping new submissions does not necessarily stop processing existing applications. Developer recollection and draft report differ here.
7. Verify when a task remains processing after closure and whether UI presents the effective stopped/locked status clearly. Prefer a derived display fix to a task-state migration if sufficient.
8. Verify cache identities and whether they survive restart. Caching cannot guarantee no repeated cost for different effective requests or uncached ambiguous sends.
9. SHA-256 checking is acceptable at the current bounded file size. Do not introduce global deduplication or redesign storage to address a speculative optimization concern.
10. Inspect actual mail, Docker, initial admin setup and deployment state. Planned features must remain perspectives until completed and verified.

If 3 requests/minute really limits throughput, one million calls need approximately 231.5 days before errors and other delays. This illustrates why a demonstration cap must not underpin a large-scale production claim. Low token price is not throughput evidence. No million-CV scale claim is requested.

## Methodology and verification

Describe an iterative workflow supported by tasks/subtasks and verification when available. Use "inspirée de Kanban" only if the observed workflow fits; a task board alone is not evidence of formal Scrum or full Kanban practice. A clean current example may explain decomposition without fabricated historical dates.

Inspect .github/workflows and actual available run evidence. If build CI exists, describe its actual scope. If a minimal build/typecheck workflow is added now, say it supports final consolidation; do not claim it ran throughout development. Do not call build-only CI a full test campaign.

For Chapter 6, group actual checks by workflow rather than checkpoint date. Suggested columns: scenario; expected behavior; observation/status; remaining scope. Use the final version where practical. Minimum useful checks: publication, candidate submission, basic private access denial, review/correction, screening, one interview/finalization path and one CSV export/import round trip. Where not performed, leave pending rather than claiming success. Tests should target meaningful risks, not mirror implementation for cosmetic test counts.

Clarify the old CSV report: was a valid file rejected, was an outdated example used, was an error message confusing, or was this only uncertainty? If the issue cannot be reconstructed, do not narrate a vague user complaint as an established current defect. Record the uncertainty privately and run one focused current check if practical.

## Fair comparison and bibliography

Use requirements that are genuinely relevant: question configurability, typed output, integration effort, supported input types, local/cloud boundary, reviewability and cost unit. Compare appropriate categories rather than pretending a narrow extractor replaces a complete ATS.

It is acceptable that the chosen priorities favor Jev/native text. It is not acceptable to invent missing competitor features, treat untested weaknesses as measured facts or claim an exhaustive benchmark. Phrase this as a comparative analysis supporting the retained design, not a retrospective proof that alternatives are inferior. Research performed now can strengthen the report without being claimed as historical selection evidence.

Add primary documentation for central dependencies, including Jev and the actual PDF reader. Consolidate duplicate internal references. Move detailed file mappings and migration references to an appendix. Do not prescribe extra references that were not consulted.

## Form and figure cleanup

- Consistent chapter/section numbering throughout.
- Limit the main contents to useful hierarchy depth; avoid four pages of sentence-like headings.
- Meaningful short table captions, not concatenated column headings.
- Remove DIA-02, CAP-12, RPT-PUBLISH and similar internal asset labels from captions and embedded image titles. Preserve normal Figure N numbering and source mappings privately.
- Replace instructions beneath figures with a description or interpretation of what is actually visible.
- Improve screenshot crops and legibility; do not regenerate all UI screens.
- Check duplicate review screenshot and caption currency.
- Fix crowded conceptual-model relationships/cardinalities.
- Make the relational-diagram caption match included tables; do not describe interview foreign keys the figure omits.
- Simplify oversized text-in-box procedure diagrams or move the detailed versions to an appendix.
- Improve whitespace where floating figures produce near-empty pages.
- Verify cover year, degree label and mandatory school elements rather than assuming the current draft is correct.
- Inspect report HTML/preview too: no operator-directed commentary or internal instructions should leak there.

## Priorities and deliverables

P0: factual baseline, remove drafting residue, coherent titles, consolidate repetition, clarify delivered scope, prepare a reliable representative demo.

P1: focused final-version checks, recover exploratory AI observations, correct price/source section, figure/caption consistency, minimal critical UI/configuration fixes.

P2 only if time remains: mail integration or deployment convenience already close to completion. Defer advanced monitoring, broad admin dashboards, embeddings, OCR and new workflow subsystems.

Deliver:

1. Updated report source and rendered PDF, checked visually.
2. Short change summary by chapter: removed, consolidated, corrected and retained.
3. Private factual questions list, limited to things that actually block accurate text.
4. Separate small-code-change list with rationale and checks, not an unbounded refactoring plan.
5. A short presenter guide to the architecture, actual AI exploration, key workflow decisions and remaining limitations. The presenter must be able to explain every major claim.
6. A repeatable demo script identifying synthetic/prepared states and any live transitions or real inference. A seeded state must not be presented as an action just executed.

Start with inspection and edits that do not depend on unresolved facts. Ask only targeted questions. Do not expand the project simply because the report mentions a possible extension.
