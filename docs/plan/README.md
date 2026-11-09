# Planning index

Planning baseline: 2026-11-09. R1/R2/R3a–d/SI/B1-P/F/R/J, T2a and the recruitment UI overhaul/consistency pass are locally merged into main. The [current frontend baseline](../current/guides/frontend-design.md) records implemented interaction/product/style choices; [UI follow-ups](ui-ux-overhaul.md) contain only remaining work and verification. Local setup applied migrations 007/008; dated build/offline/manual evidence is in [status](../current/status.md). The [task board](tasks.md) distinguishes completed implementation from pending QA. No push, live-provider work or blanket next-card approval.

Screening may happen before extraction/review finishes; either outcome freezes extraction/review without inventing completion. The interview plan may be empty, freezes at publication, and never replaces explicit owner Offer/Hired actions. See [product decisions](product-decisions.md) for the selected rules and [task board](tasks.md) for proposed decomposition, dependencies and remaining gates. Earlier mandatory reviewed-only screening/minimum-one-interview directions are superseded, not implemented contracts.

| Question | Read |
| --- | --- |
| Which directions did the user choose, and what remains open? | [Product decisions](product-decisions.md) |
| What should happen next / later? | [Task board](tasks.md) |
| What UI behavior must be preserved, and what remains? | [Current frontend baseline](../current/guides/frontend-design.md), then [bounded follow-ups](ui-ux-overhaul.md) |
| Why refactor / what might break? | [Changeability and obstacles](changeability.md) |
| How might extraction/review/evidence evolve? | [Extraction design](extraction-design.md) |
| What is implemented for screening CSV and what remains? | [Current contract](../current/contracts/screening-api.md), [remaining work](screening-import-contract.md) |
| Optional background research | [AI options](research/ai-options.md), [form tooling](research/form-tooling.md) |

Tags: **[selected direction]** records a user preference, **[needs decision]** blocks exact behavior, **[proposal]** is an assistant recommendation, **[later]** defers scope. None means shipped. [Current](../current/README.md) stays the implementation source of truth; [journal](../journal.md) is only report-support context.

Keep the presentation/demo deadline in mind. Prefer bounded useful improvements over a generic workflow engine, event bus, new infrastructure or rewrite. The task board is a checkpoint sequence, not a fixed calendar or a promise to deliver all features.
