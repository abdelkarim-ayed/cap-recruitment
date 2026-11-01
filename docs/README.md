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
| Extraction design discussion | [Tasks and evidence](plan/extraction-design.md) |
| Jev safety / opt-in execution | [Mandatory safeguards](current/jev-safety.md); load project `typesafe-ai` skill before Jev work |
| Report-support history | [Journal](journal.md): selective context, not the current specification |

## Meaning of the folders

- `current/`: implemented behavior and present operating constraints. Contracts live in `current/contracts/`; runnable instructions in `current/guides/`. Known gaps are explicit, not described as delivered features.
- `plan/`: requested changes, design proposals, unresolved decisions, tasks and deferred work. Selection of a direction does not mean implementation is finished or the whole backlog is authorized.
- `plan/research/`: optional research inputs, not requirements or verified integrations.
- `journal.md`: append significant decisions/checkpoints only. Git preserves superseded document versions; no duplicate archive tree.
- `docs/.ignore/private/`: ignored sensitive handoffs/context. `docs/.ignore/tmp/`: disposable work. Keep personal context out of tracked technical documentation.
- `demo-cvs.json`: synthetic source data consumed by `scripts/render-demo-cvs.py`; retained at its existing path because it is executable tooling input, not a prose document.

## Maintenance

Update the relevant current contract when behavior ships; keep unimplemented changes in the plan. Link instead of copying a policy across handoffs. Prose and OpenAPI may describe the same contract in different formats; differences must be flagged. [Static schema gaps](current/status.md#contract-gaps) are known, so OpenAPI is not assumed to fully describe the latest skills response.

Current task: documentation reorganisation only. Code refactoring, data changes, provider calls and running-process management await their own checkpoints. Presentation sources/review gates remain in [presentation/README.md](../presentation/README.md).
