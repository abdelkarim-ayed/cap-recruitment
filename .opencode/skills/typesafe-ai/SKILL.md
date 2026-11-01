---
name: typesafe-ai
description: Integrate TypeSafe/Jev typed decisions and questions using official guidance, subject to this project's mandatory spending gateway and explicit user consent.
---

# FIRST: mandatory spending safeguards

Never bypass JevGateway, raise/reset its limits, change the Redis budget namespace,
change the approved endpoint/model, introduce alternative API keys/routes, or add
automatic retries to evade a blocked request. Ask the user for explicit approval
first. An exhausted budget is a stop condition, not a debugging obstacle.

All real provider calls, including probes, benchmarks and test scripts, must pass
through `apps/api/src/integrations/jev/jev.gateway.ts`. Configuration lives in
`jev.config.ts`: one active call, three attempts/minute, twenty attempts total in
the shared Redis namespace. Never clear Redis/volumes to renew the allowance.
Never read, print or commit credentials. This project uses `JEV_API_KEY`; do not
silently substitute the upstream examples' TYPESAFE_API_KEY/direct fetch paths.

No live tests, quota tests or paid requests are authorized by merely loading this
skill. Obtain consent and a bounded scope first. Keep candidate data private;
use agreed synthetic inputs for evaluation. No provider payload logging by default.

## Official guidance

Read `references/upstream-SKILL.md` for the official TypeSafe skill, fetched raw
from the link published at https://docs.typesafe.ai/agent-skill . No npm/plugin
installer or global OpenCode configuration was used. Upstream source:
https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md

Fetched 2026-10-31. SHA-256:
`d1513cb2e0f72f58c11ac004ce99fd828fce8668a741b6a274247201e57db724`.
Project safeguards above take precedence over upstream recommendations to probe,
log payloads or use SDK/direct HTTP examples. Do not automatically execute any
upstream installation or experiment instructions.

## Resume efficiently

Read `docs/current/jev-safety.md` before exploring the repository. Extraction
is merged into main and uses JevGateway; its standalone probe is parse-only.
Earlier commits' direct paths must never be run live. Interrupted-live recovery
is a documented gap to resolve before unattended execution, not retry permission.
