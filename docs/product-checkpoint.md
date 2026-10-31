# Product feedback / changeability checkpoint — 2026-10-31

Documentation/discussion checkpoint only. No new feature, migration, policy transition, merge or provider call is authorized by this file. Existing contracts stay in effect until deliberately changed. Reading map: [README.md](README.md).

## Two delivery scopes — do not conflate them

**Bounded AI feature-branch MVP:** HR configures a predefined skill set on a document task; text-native PDF preparation; guarded Jev-assisted skills extraction; source evidence; existing separate correction and CSV flow. No years-of-experience extraction, skill-proficiency estimation, arbitrary prompts or expanded CV subtask builder in this MVP. The current excerpt-choice executor is still experimental/unselected: desired capability does not approve its algorithm or establish provider quality. Usable skills/evidence output, failure behavior and HR authoring still need a bounded acceptance discussion and explicitly approved synthetic live validation. See [jev-gateway-handoff.md](jev-gateway-handoff.md).

**Wider final-product/demo target:** user wants coherent inbox behavior, preselection, bulk selection, CSV export/import of selected subsets over multiple occasions, publication prerequisites and continuous operational jobs. Multiple interviewers are desirable but less urgent. These are requested target capabilities, not all delivered, scheduled or approved implementation units. Presentation remains a high priority; no additional provider spend is implied.
User's total development/showcase spending ceiling is **$5**, not a spending target. Existing stricter gateway request allowances remain unchanged and are not currency accounting. No budget/limit tests or live calls are authorized by this checkpoint.

Branch strategy: do this small docs checkpoint first, continue toward the bounded AI MVP on the feature branch, then reconsider merge/reorganisation. No merge to main in this docs pass. Preserve main's separate uncommitted docs; reconcile rather than overwrite them when merging later.

## Why refactoring was raised

User concern is **cost of changing business decisions**, not only today's correctness: string coupling, duplicated rules, large services, configuration scattered outside clear boundaries and mixtures of old/new ideas make changes confusing. Code should localize policy changes even while rules remain unsettled; it should not require a generic workflow framework.

Desired review approach, not a completed architectural finding: trace concrete changes to notification recipients, interview participants, form/task presets, progression prerequisites and runner invocation. Identify unavoidable data/contract changes separately from accidental coupling. Prefer typed vocabulary, single rule ownership, orchestration consuming capabilities, and separate policy/mechanism boundaries. Preserve existing behavior in refactor commits; approve business changes separately. No blanket rewrite, class-per-field model, event bus or Nest configuration-library migration was selected.

## Current behavior versus requested direction

| Area | Current documented/implemented baseline | Latest feedback / next decision |
| --- | --- | --- |
| Preselection | HR changes an application manually; extraction/review completion does not gate it. | Make the process clear; define repeatable bulk actions and handling of already-processed applicants. Do not equate review completion with selection. |
| External selection | CSV export includes stable identities, answer/extraction/review columns; import absent. | Export columns should support external work; import selected subsets over multiple occasions. Define CSV shape, allowed actions, repeat/conflict/stale/foreign-ID handling, preview/confirmation and transaction scope. Missing rows must not silently imply rejection; confirm semantics before implementation. |
| Publication | Published intake is locked; interview pipeline is separate and may be empty at publish. | User wants pipeline prerequisites before publication. What counts as ready (at least one step, instructions, participant assignment), and existing published/no-pipeline records need a policy. No gate added yet. |
| Inbox | Explicit workflow causes and recipient/read-retention paths exist; prior tests passed. | User reports correctness/UX problems. Collect concrete failing recipient/link/read/action cases; distinguish bug fixes from changing recipients. Ownership of recipient policy should be easy to find. No new recipient matrix approved. |
| Interviews | One responsible assignee per application/step instance; that assignee owns final feedback. | Real-world panels can include HR plus CEO. Multiple participants versus one responsible assessor is unresolved. Rewording to “responsible interviewer” is an option, not proof panels exist or authorization to change feedback rules. Group candidates/bulk invitations were not what this feedback meant. |
| Processing | CLI, persisted leases/results/recovery; no extraction cron. Live attempts terminal; fixture/preparation retries separate. | Continuous task execution, notification cleanup and recovery of missed work are desired. Audit existing retention watch runner separately from extraction scheduling; define what may safely retry. Never turn this into automated repeated paid calls or bypass JevGateway. |
| Form/task authoring | Fixed typed inputs, source-linked `extractSkills`, private args and frozen submission definitions. | Near-term skills-only HR-friendly configuration. Dynamic question/task registry, semantic presets and richer CV tasks need feasibility/design discussion later. Provider batching is not a reason for a monolithic HR task. |
| UI and demo data | Existing enterprise-style UI and synthetic CV tooling; branch review denoising tested by DOM tests. | More coherent/less noisy UI and more representative CV samples wanted. Scope them around actual journeys; no browser automation, broad redesign or claimed extraction quality implied. |

## Documentation conflicts triaged in this pass

- Corrected workflow/decision claims of automatic Review-ready advancement and absence of terminal interview-Fail effects. “Review-ready” is conceptual; extraction state is not recruitment progression. Current terminal-Fail semantics remain in force, even if later reviewed.
- Corrected stale statements that generic editor, review/export, interviews and internal progression were not implemented. Labelled historical foundation maps rather than treating them as an exhaustive current architecture.
- Distinguished password UI from legacy OTP regression checks; corrected misleading “Redis connectivity only” and “BullMQ selected/implemented” readings. Redis guards spending too; no queue/worker exists just because Redis runs.
- Preserved historical check counts/runtime notes as dated evidence; no claims about current process state from old handoffs. Current gateway/extraction sections supersede their older direct-transport instructions.
- Still open: static OpenAPI provenance extensions; a code-based architecture/change-impact review; exact defect reproductions for inbox/preselection; all new policies in the table above. This pass is a docs consistency review, not a fresh implementation audit or proof of an architectural defect.

## Next discussion gates

1. Confirm bounded skills-only AI-MVP acceptance and clarify the selected extraction design; keep richer tasks separate.
2. Reproduce inbox/preselection failures and decide publication prerequisite semantics. Scope wider-product work independently of the AI checkpoint.
3. For panel interviews, decide participants, responsible assessor, feedback/result ownership, visibility and overlap rules before schema work.
4. Architecture review should produce a coupling/change-impact map and small foundation refactors versus deferred structural work. No assumption that changing a business rule always avoids a migration.
5. Merge only after reviewing branch readiness and reconciling main's dirty docs. Do not erase the concerns here in a later “current docs” rewrite.
