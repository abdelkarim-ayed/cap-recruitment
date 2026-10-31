# Documentation reading map

## Resume without rereading the history

1. [Product checkpoint and open feedback](product-checkpoint.md): latest user concerns, branch MVP versus wider delivery target, unresolved rules and proposed changeability review. Desired behavior is not automatically implemented or authorized.
2. [Jev gateway handoff](jev-gateway-handoff.md): current feature-branch integration and mandatory spending restrictions. Load project skill `typesafe-ai` before Jev work. No paid/limit tests without explicit consent.
3. [Extraction handoff](extraction-handoff.md): implementation history, verified checks, UI changes, remaining limitations and playground-only discussion.
4. [Status](status.md): verification checkpoints; older batches are history, not a current feature inventory.

## Which document answers which question?

| Question | Source |
| --- | --- |
| Purpose, actors and scope | [product.md](product.md), [decisions.md](decisions.md) |
| Latest requested changes / not-yet-decided behavior | [product-checkpoint.md](product-checkpoint.md), [open-questions.md](open-questions.md) |
| Current intake, file, task and owner contracts | [vacancy-api.md](vacancy-api.md), [application-api.md](application-api.md) |
| Processing, separate corrections and export | [processing-review-api.md](processing-review-api.md), then branch handoffs for PDF/gateway extensions |
| Current preselection, interview authority, notifications and retention | [interview-api.md](interview-api.md) |
| Identity endpoints / generated API schema | [api.md](api.md), [openapi.json](openapi.json), [interview-openapi.json](interview-openapi.json) |
| Manual scenarios and synthetic data | [demo-guide.md](demo-guide.md); Windows is unverified: [windows-compatibility.md](windows-compatibility.md) |
| UI principles | [frontend-design.md](frontend-design.md) |
| Test modes and local infrastructure | [integration-testing.md](integration-testing.md), [backend-test.md](backend-test.md), [local-networking.md](local-networking.md) |
| Architectural history/proposals | [architecture.md](architecture.md), [backend-modules.md](backend-modules.md); not evidence that an old proposal is implemented |
| Deferred possibilities / research | [backlog.md](backlog.md), [ai-options.md](ai-options.md), [form-tooling.md](form-tooling.md) |

Read implemented contracts for current behavior; read the latest checkpoint for requested changes. When they differ, preserve the difference until explicitly resolved. A user-reported bug is a report to reproduce, not proof that every path is broken. Passing automated checks does not disprove a reported manual failure.

No broad schema/API rewrite is part of this documentation pass. Static OpenAPI live-provenance alignment and the architectural proposal review remain tracked follow-ups. Presentation content is separate; no slides/exports changed here.
