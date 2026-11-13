# Documentation index

Read by question; do not reload the whole documentation tree.

| Need | Start here |
| --- | --- |
| What runs today? | [Current index](current/README.md), then [status](current/status.md) |
| How is it built / where is a rule owned? | [Architecture](current/architecture.md) |
| What happens to an application? | [Workflows and vocabulary](current/workflows.md) |
| What did the user request next? | [Planning index](plan/README.md), [product decisions](plan/product-decisions.md) |
| Next checkpoints / deferred work | [Task board](plan/tasks.md) |
| Refactor evidence and unresolved obstacles | [Changeability review](plan/changeability.md) |
| Selected CV-extractor direction versus current skills implementation | [Extraction design](plan/extraction-design.md), [integration map](plan/research/cv-extraction-lab.md), [portable lab assets/manifest](../research/cv-extraction-lab/README.md) |
| Implemented frontend product/interaction/style decisions to preserve | [Durable frontend baseline](current/guides/frontend-design.md) |
| Jev safety / opt-in execution | [Mandatory safeguards](current/jev-safety.md); load project `typesafe-ai` skill before Jev work |
| Locally load/rotate a running gateway's RAM-only key | [Local key control](current/guides/jev-key-control.md); no environment/file fallback or paid validation |
| Is the new CV feature ready to demonstrate? | [Demo launch handoff](plan/cv-demo-launch.md): unbuilt source/unapplied schema, fixture path, mail CLI versus planned viewer/launcher |
| Report-support history | [Journal](journal.md): selective context, not the current specification |

## Meaning of the folders

- `current/`: actual codebase behavior, business/authorization rules currently honored by it, architecture and present operating constraints. Contracts live in `current/contracts/`; runnable instructions in `current/guides/`. Known gaps and verification limits are explicit, not described as delivered features.
- `plan/`: forward directions, selected future business decisions, proposals, unresolved questions and kanban-style tasks/deferred work. Even an agreed decision stays here until implemented; selection does not authorize the whole backlog.
- `plan/research/`: optional research inputs, not requirements or verified integrations.
- `journal.md`: append significant decisions/checkpoints only. Git preserves superseded document versions; no duplicate archive tree.
- `docs/.ignore/private/`: ignored sensitive handoffs/context. `docs/.ignore/tmp/`: disposable work. Keep personal context out of tracked technical documentation.
- `demo-cvs.json`: synthetic source data consumed by `scripts/render-demo-cvs.py`; retained at its existing path because it is executable tooling input, not a prose document.

## Maintenance

Update the relevant current contract when behavior ships; keep unimplemented changes in the plan. Link instead of copying a policy across handoffs. Prose and OpenAPI may describe the same contract in different formats; differences must be flagged. [Static schema gaps](current/status.md#contract-gaps) are known, so OpenAPI is not assumed to fully describe the latest skills response.

Agents may moderately add, decompose, reorder or mark backlog items **maybe later / deferred** as obstacles become clear. Preserve user expectations and selected business decisions; label proposals, dependencies and incomplete work honestly. Board maintenance is not authorization to implement another card, drop requested behavior or invent verification. Deferred automated regression and later batched manual UX checks remain visible tasks, not implicit passes.

D0 is complete; bounded implementation scopes and outstanding verification are recorded on the [task board](plan/tasks.md). Do not treat implemented refactors or approved forward decisions as permission to execute the backlog. Record static checks separately from deferred application regression/manual UX; data operations, provider calls and process management need their own scope. Presentation sources/review gates remain in [presentation/README.md](../presentation/README.md).
