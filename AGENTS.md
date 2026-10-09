# Project guidance

Implementation is authorized. Start with the agreed scenarios; do not expand into deferred features without approval.

## Read selectively
- `docs/product.md`: confirmed direction, actors, and workflows.
- `docs/status.md`: current implementation unit, verified checks, and next tasks.
- `docs/api.md`: implemented backend contract and planned modules; frontend comes after backend handoff.
- `docs/vacancy-api.md`: implemented vacancy catalog, private task/source args, owner policy, revisions and public projections. Additional presets are TODO only.
- `docs/application-api.md`: implemented locked intake, optional document constraints/caps, admin/recruiter read-all and candidate read-own, private storage limitations. No executor/answer editing yet.
- `docs/backend-modules.md`: proposed feature boundaries and next vacancy checkpoint; not extra approved policies.
- `docs/architecture.md`: current foundation classes/data flow and proposed future fields, transactions, and events; not implemented feature schemas.
- `docs/integration-testing.md`: mail/extraction fixtures and protocol adapters. No auth bypass; full mocked-mail auth checks still use PostgreSQL.
- `docs/backend-test.md`: manual/automated auth checkpoint testing instructions.
- `docs/local-networking.md`: host-network development decision and verified Redis volume test. Always use host networking here; no bridge/pasta recovery unless explicitly reopened. Do not reset Podman again or modify global setup without approval.
- `docs/workflows.md`: main pipeline and short actor scenarios, with unresolved policies identified.
- `docs/decisions.md`: approved choices versus proposals.
- `docs/open-questions.md`: independent decisions still needing approval.
- `docs/backlog.md`: deferred scope and dependencies, not delivery promises.
- `docs/ai-options.md`: researched AI options and limitations.
- `docs/candidate-access.md`: approved candidate access flow and duplicate handling.
- `docs/vacancy-form.md`: form and screening direction; bounded first model awaiting approval.
- `docs/form-tooling.md`: researched builder/renderer shortlist, not integration-tested.

Keep these documents current when the user approves or changes a decision. Do not treat assistant proposals as approvals. Keep documentation concise; link rather than duplicate.

## Working preferences
- Use checkpoints, not fixed day-by-day implementation schedules.
- Use pnpm workspaces; do not introduce Nx or extra services without a reason.
- No browser tabs or browser automation unless requested. Provide user test instructions.
- Backend first. Do not delegate parallel frontend work or use screenshots/UI automation; user will manually test and report issues.
- No OpenCode plugins/MCP or changes to global configuration unless approved. Preserve existing secret-access restrictions.
- Put disposable drafts in `docs/.ignore/tmp/`; sensitive working context in `docs/.ignore/private/`. Neutral technical documentation belongs in tracked `docs/`.
- Mock AI results must be identifiable as fixtures, never presented as live model output. Do not invent evaluation results.
- Use the existing mail/extraction ports and shared DatabaseService rather than embedding SDK/protocol setup in feature services. Keep SMTP/provider tests separate from local fixtures; development capture/AI fixtures are forbidden in production mode.
- Local checkpoint commits on `main` are authorized. Do not backdate commits or create/push a remote. Presentation preparation remains deferred.

Application foundation is being implemented; see `docs/status.md` for verification. The disposable domain form spike remains in `docs/.ignore/tmp/form-spike/` and previously passed seven DOM/schema tests. Ginkgo was tested initially but removed. The root briefing remains unchanged and ignored because it contains sensitive context.
