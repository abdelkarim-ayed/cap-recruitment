# Project guidance

Implementation is authorized. Start with the agreed scenarios; do not expand into deferred features without approval.

## Read selectively
- `docs/product.md`: confirmed direction, actors, and workflows.
- `docs/status.md`: current implementation unit, verified checks, and next tasks.
- `docs/api.md`: implemented backend contract and planned modules; frontend comes after backend handoff.
- `docs/vacancy-api.md`: implemented vacancy catalog, private task/source args, owner policy, revisions and public projections. Additional presets are TODO only.
- `docs/application-api.md`: implemented locked intake, optional document constraints/caps, admin/recruiter read-all and candidate read-own, private storage limitations. Candidate answers/files immutable.
- `docs/processing-review-api.md`: implemented mock-only context/fixture dispatch, local command/recovery, optional admin/recruiter extraction corrections and ungated CSV. No live AI/parser or candidate answer/file editing.
- `docs/demo-guide.md`: seeded role accounts, generated synthetic CVs, frontend manual scenarios and local tagged mock commands. `docs/frontend-design.md`: ten approved enterprise-style UI rules.
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
- Latest feedback changes access to email/password, candidate-only signup/one-time email verification and code password reset. Legacy OTP API retained, not UI login. Review shows latest effective correction, not historical revisions. RenderCV text-only samples via scripts/render-demo-cvs.py; no image generation. Preserve manual submissions when seeding.
- No extraction tasks means no extraction-review workload: marker auto-completes, required=false, controls hidden; not candidate approval/stage change. Keep product UI concise; operator/demo instructions in docs, but actual fixture results must stay labelled.
- `docs/vacancy-form.md`: form and screening direction; bounded first model awaiting approval.
- `docs/form-tooling.md`: researched builder/renderer shortlist, not integration-tested.

Keep these documents current when the user approves or changes a decision. Do not treat assistant proposals as approvals. Keep documentation concise; link rather than duplicate.

## Working preferences
- Use checkpoints, not fixed day-by-day implementation schedules.
- Use pnpm workspaces; do not introduce Nx or extra services without a reason.
- No browser tabs or browser automation unless requested. Provide user test instructions.
- Backend contracts first; user now authorized the frontend for implemented intake/review/export scope. Do not delegate parallel frontend work or use screenshots/browser automation; user manually tests. DOM component tests are allowed. Interviews/live AI/progression remain deferred.
- No OpenCode plugins/MCP or changes to global configuration unless approved. Preserve existing secret-access restrictions.
- Put disposable drafts in `docs/.ignore/tmp/`; sensitive working context in `docs/.ignore/private/`. Neutral technical documentation belongs in tracked `docs/`.
- Mock AI results must be identifiable as fixtures, never presented as live model output. Do not invent evaluation results.
- Use the existing mail/extraction ports and shared DatabaseService rather than embedding SDK/protocol setup in feature services. Keep SMTP/provider tests separate from local fixtures; development capture/AI fixtures are forbidden in production mode.
- Local checkpoint commits on `main` are authorized. Do not backdate commits or create/push a remote. Presentation preparation remains deferred.

Application foundation is being implemented; see `docs/status.md` for verification. The disposable domain form spike remains in `docs/.ignore/tmp/form-spike/` and previously passed seven DOM/schema tests. Ginkgo was tested initially but removed. The root briefing remains unchanged and ignored because it contains sensitive context.
