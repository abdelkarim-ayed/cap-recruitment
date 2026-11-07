# Project guidance

Recruitment prototype: pnpm workspaces (`apps/api` NestJS, `apps/web` React/Vite, `packages/domain`), PostgreSQL and private documents. Read [docs/README.md](docs/README.md) first; choose only the relevant sections.

## Scope and documentation

- `docs/current/`: implemented behavior, architecture and operating constraints; `contracts/` and `guides/` are inside it. [Status](docs/current/status.md) records dated verification, not current process state.
- `docs/plan/`: requested changes, selected directions, unresolved decisions and deferred tasks. Start with [task board](docs/plan/tasks.md) and [product decisions](docs/plan/product-decisions.md); [changeability](docs/plan/changeability.md) holds code evidence/obstacles. Do not describe plans as delivered.
- `docs/journal.md`: sparse significant checkpoints for report support, not source of truth. Replace obsolete docs with current facts; Git preserves prior versions. Keep docs concise and linked.
- R1/R2/R3a/b and screening CSV are locally merged; prior regression/manual UX and migration 007 remain pending. User authorized B1-P publication validation/freeze, then B1-F explicit owner Offer with zero interviews, each via worktree/commits/local merge/removal. B1-P confirms vacancy and interview revisions under one vacancy lock; empty plans/tasks valid, configuration frozen after publication, appointment logistics separate. Preserve owner-only Offer/Hired, no automatic Offer or hiring shortcut. No other backlog implementation, migration/data/provider/process operations, claims/assignment/debate workflow or push. Current contracts live in `docs/current/contracts/`; preserve private projections and separate revision checks.
- May moderately add/decompose/reorder/defer planning cards while preserving user expectations and selected decisions. Keep implemented rules in current docs and future directions in plan; backlog maintenance is not blanket implementation authorization.
- Future work preference: branch/worktree outside `/tmp`, scoped changes/checks, local merge to main and remove that worktree when authorized. Preserve existing/unfamiliar changes; no remote creation/push or backdated commits.

## Spending and data red lines

- Before Jev work read [docs/current/jev-safety.md](docs/current/jev-safety.md) and load project `typesafe-ai` skill. All real calls go through JevGateway; standalone probe is parse-only. Never read/print credentials, bypass gateway, alter endpoint/model/limits/Redis namespace, reset counters/volumes or run paid/limit tests without explicit scoped consent.
- Defaults stay disabled. Intended live failures are terminal; **uncertain interrupted-live recovery is a known gap**, not permission to retry. Resolve the documented attempt-boundary obstacle before an unattended live runner. No automatic bulk draining.
- Current Noul skills starter is implemented and fixture-tested, not live-validated. Keep fixture provenance visible. Never invent extraction quality, evaluation results or live evidence. Original answers, machine results and HR corrections stay distinct.
- Current data is fake/demo. Future schema redesign and scoped re-fixturing may be acceptable; agree target and operation first, ask about major ER changes. Not blanket reset/deletion or spending-counter permission. Default seed behavior preserves manual submissions, passwords and reviews.

## Working preferences

- Backend contracts first. Use existing DatabaseService and mail/storage/extraction ports; don't embed protocol/SDK setup in business services. No generic workflow engine, event bus, Nx or extra service without demonstrated need/approval.
- Use checkpoints, not fixed day schedules. Verify meaningful invariants after coherent changes; avoid repeated broad runs during churn. Integration scripts mutate tagged DB/file fixtures; they are not read-only checks. No auth bypass; development capture/AI fixtures forbidden in production.
- No browser tabs, screenshots or browser automation unless requested. DOM tests allowed; user manually checks UI. Keep product wording concise, operator instructions in guides and fixture labels truthful.
- Normal shell for routine work; RMUX for persistent/user-visible terminals per [guide](docs/current/guides/rmux.md). Prefer named tabs, no splits/pane snapshots; bounded plain-text captures only. Discover current targets/listeners. No process stop/Ctrl-C/session reset without approval except authorized management of agent-launched dev processes. Leave dev services alive. May clear unrelated RMUX scrollback, never shell history or relevant diagnostics.
- Always host networking here: [networking](docs/current/guides/local-networking.md). No Podman reset, bridge/pasta recovery or global setup change without approval.
- No OpenCode plugins/MCP/global config changes without approval; preserve secret-access restrictions.
- Sensitive handoffs/context: ignored `docs/.ignore/private/`; disposable drafts: `docs/.ignore/tmp/`. Root briefing remains ignored/unchanged. Neutral technical docs tracked. RenderCV samples are text-only; no image generation.

## Presentation

Separate review gates in `presentation/README.md`, `brief.md`, `plan.md`. Shared tracked PDF `presentation/exports/status.pdf`, rebuilt by `pdf:build`; intermediate SVG/JSON/PNG outputs remain ignored in `dist/`. 36 pages, proposed CAP name, six user images without cropping, three diagrams; content/name/framing await review, institution/program unspecified. Preserve provenance and evidence-based claims; no invented methodology/history/results. No additional screenshot/browser work authorized. For necessary visual checks rasterize only selected low-resolution pages. Presentation-only tooling dependencies stay separate.
