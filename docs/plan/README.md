# Planning index

Latest planning checkpoint: 2026-11-09. Earlier QA reports/UX requests are locally merged; the [intent-led UI/UX briefing](ui-ux-overhaul.md) consolidates the user's general principles and HR page examples for the next session. No UI implementation in this checkpoint. Source baseline includes R1/R2/R3a–d/SI/B1-P/F/R/J and T2a; local setup applied migrations 007/008 and launched API/frontend in RMUX on 2026-11-07. [Task board](tasks.md) separates reported manual paths from pending full gates. No push/live-provider/key/spending work or blanket next-card approval.

Screening may happen before extraction/review finishes; either outcome freezes extraction/review without inventing completion. The interview plan may be empty, freezes at publication, and never replaces explicit owner Offer/Hired actions. See [product decisions](product-decisions.md) for the selected rules and [task board](tasks.md) for proposed decomposition, dependencies and remaining gates. Earlier mandatory reviewed-only screening/minimum-one-interview directions are superseded, not implemented contracts.

| Question | Read |
| --- | --- |
| Which directions did the user choose, and what remains open? | [Product decisions](product-decisions.md) |
| What should happen next / later? | [Task board](tasks.md) |
| What UI/UX vision should the next session implement? | [Intent-led overhaul briefing](ui-ux-overhaul.md), then select a bounded slice on the board |
| Why refactor / what might break? | [Changeability and obstacles](changeability.md) |
| How might extraction/review/evidence evolve? | [Extraction design](extraction-design.md) |
| What is implemented for screening CSV and what remains? | [Current contract](../current/contracts/screening-api.md), [remaining work](screening-import-contract.md) |
| Optional background research | [AI options](research/ai-options.md), [form tooling](research/form-tooling.md) |

Tags: **[selected direction]** records a user preference, **[needs decision]** blocks exact behavior, **[proposal]** is an assistant recommendation, **[later]** defers scope. None means shipped. [Current](../current/README.md) stays the implementation source of truth; [journal](../journal.md) is only report-support context.

Keep the presentation/demo deadline in mind. Prefer bounded useful improvements over a generic workflow engine, event bus, new infrastructure or rewrite. The task board is a checkpoint sequence, not a fixed calendar or a promise to deliver all features.
