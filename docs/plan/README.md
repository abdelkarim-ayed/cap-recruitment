# Planning index

Latest discussion checkpoint: 2026-11-03. D0, decision-docs merge `9ecfebd`, R2 merge `0a41acb`, R3a/b merges `a3de11d` / `ae47c1f` and R1 merges `9501b20` / `18151df` are complete. User authorized the P0-I CSV contract/docs checkpoint directly on `main`, in continuity toward the selected target workflow; the draft does not authorize import implementation or select its open proposals. The [current inventory](../current/contracts/action-policies.md) distinguishes delivered refactoring from planned business-rule changes. Deferred application regression/manual UX stays on the [board](tasks.md); no push or provider/data/process work.

Screening may happen before extraction/review finishes; either outcome freezes extraction/review without inventing completion. The interview plan may be empty, freezes at publication, and never replaces explicit owner Offer/Hired actions. See [product decisions](product-decisions.md) for the selected rules and [task board](tasks.md) for proposed decomposition, dependencies and remaining gates. Earlier mandatory reviewed-only screening/minimum-one-interview directions are superseded, not implemented contracts.

| Question | Read |
| --- | --- |
| Which directions did the user choose, and what remains open? | [Product decisions](product-decisions.md) |
| What should happen next / later? | [Task board](tasks.md) |
| Why refactor / what might break? | [Changeability and obstacles](changeability.md) |
| How might extraction/review/evidence evolve? | [Extraction design](extraction-design.md) |
| What is the CSV screening contract and what still needs a choice? | [Import contract draft](screening-import-contract.md) |
| Optional background research | [AI options](research/ai-options.md), [form tooling](research/form-tooling.md) |

Tags: **[selected direction]** records a user preference, **[needs decision]** blocks exact behavior, **[proposal]** is an assistant recommendation, **[later]** defers scope. None means shipped. [Current](../current/README.md) stays the implementation source of truth; [journal](../journal.md) is only report-support context.

Keep the presentation/demo deadline in mind. Prefer bounded useful improvements over a generic workflow engine, event bus, new infrastructure or rewrite. The task board is a checkpoint sequence, not a fixed calendar or a promise to deliver all features.
