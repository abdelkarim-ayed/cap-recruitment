# Project guidance

Jev continuation: read `docs/jev-gateway-handoff.md` first and load project skill `typesafe-ai` when working on Jev. Never bypass JevGateway, raise/reset limits or its Redis namespace, or execute paid/limit tests without explicit user consent. Feature branch now incorporates main's gateway checkpoint; extraction calls must use it and standalone probe is parse-only. Live failures are terminal, not automatically retried. Main has separate uncommitted handoff edits: preserve them. Read-only discussion remains default unless implementation is authorized. Never terminate processes from an ambiguous request; verify current listeners rather than trusting historical showcase notes.

Implementation is authorized. Start with the agreed scenarios; do not expand into deferred features without approval.
Selected starter: batched Noul for normalised predefined skills, >=0.8 positive, per-skill review/export, quotations deferred. Implemented and fixture-tested, NOT live-validated; old excerpt-choice notes are historical. Keep defaults disabled unless explicitly approved; broader extraction/task design remains open. Current records are test/demo data; scoped re-fixturing may be acceptable, not blanket reset/deletion or spending-counter-reset permission.
Latest docs checkpoint: read `docs/README.md` and `docs/product-checkpoint.md` for the skills-only branch MVP, wider final-demo requests and unresolved business rules/changeability concerns. Do not erase these in a later docs rewrite or treat target features as approved implementations. No merge to main in that documentation checkpoint.

## Read selectively
- `docs/product.md`: confirmed direction, actors, and workflows.
- `docs/status.md`: current implementation unit, verified checks, and next tasks.
- `docs/api.md`: implemented backend contract and planned modules; frontend comes after backend handoff.
- `docs/vacancy-api.md`: implemented vacancy catalog, private task/source args, owner policy, revisions and public projections. Additional presets are TODO only.
- `docs/application-api.md`: implemented locked intake, optional document constraints/caps, admin/recruiter read-all and candidate read-own, private storage limitations. Candidate answers/files immutable.
- `docs/processing-review-api.md`: implemented mock-only context/fixture dispatch, local command/recovery, optional admin/recruiter extraction corrections and ungated CSV. No live AI/parser or candidate answer/file editing.
- `docs/interview-api.md`: implemented owner-owned frozen interview steps, shared HR scheduling/agenda, assigned-interviewer final notes/optional 0–10 score/Pass-Fail, terminal failure cancellation, owner Offer/Hired and recipient inbox/read retention. Explicit typed workflow causes; no row-change notification hooks, reopening, candidate publication or interview retries.
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
- `presentation/README.md`, `presentation/brief.md`, `presentation/plan.md`: approved presentation workspace/review gates. French script `presentation/draft.md`, PDF `presentation/dist/status.pdf`: 30 contents + six intercalaires (36 pages), proposed CAP name, explicit requirements, one ODD slide and prose backlog. Three Mermaid/DOT diagrams rendered by Graphviz/WASM; all six user images integrated without cropping (pages 3/20/21/22/25/27), provenance in assets/manifest.json. Cover values provided except institution/program; metadata.json. Await content/name/framing review; no new screenshots/browser interaction authorized. Sources/earlier points in notes.md; obsolete visual archived in ignored docs/.ignore/tmp/presentation/. No invented methodology/history/results. Reveal/Mermaid/Viz are presentation-only dev deps; local Typst compiler, no available Typst skill. Keep assets identifiable and claims evidence-based.

Keep these documents current when the user approves or changes a decision. Do not treat assistant proposals as approvals. Keep documentation concise; link rather than duplicate.

Presentation export update: the shared, tracked PDF is now `presentation/exports/status.pdf`, rebuilt by `pdf:build`; prior `dist/status.pdf` references describe the earlier local-only workflow. Keep all intermediate SVG/JSON/PNG outputs in ignored `dist/`, never publish the whole directory. For token-efficient visual checks, rasterize only selected pages at low resolution (e.g. `--pages 20,21 --ppi 70`) when necessary; do not export/read every slide preview routinely.

## Working preferences
- Prefer normal shell execution for routine commands. Use RMUX mainly for persistent processes, later monitoring, or terminals the user should inspect; follow `docs/rmux.md`. Prefer named tabs/windows (no splits), identify target/action before input, and leave dev processes alive. No pane snapshots (token-heavy): use bounded plain-text capture/health checks or ask for pasted output. May clear unrelated RMUX tab scrollback when useful for focused debugging; never clear Bash/shell command history or discard relevant diagnostics. No Ctrl-C, termination, session reset or cleanup without approval, except managing agent-launched dev processes as authorized.
- Use checkpoints, not fixed day-by-day implementation schedules.
- Use pnpm workspaces; do not introduce Nx or extra services without a reason.
- No browser tabs or browser automation unless requested. Provide user test instructions.
- Backend contracts first; frontend authorized for intake/review/export and bounded interview/progression/inbox checkpoint. Do not delegate parallel frontend work or use screenshots/browser automation; user manually tests. DOM component tests are allowed. Live AI, chat, timed reminders, calendar sync, decision import and public business updates remain deferred.
- No OpenCode plugins/MCP or changes to global configuration unless approved. Preserve existing secret-access restrictions.
- Put disposable drafts in `docs/.ignore/tmp/`; sensitive working context in `docs/.ignore/private/`. Neutral technical documentation belongs in tracked `docs/`.
- Mock AI results must be identifiable as fixtures, never presented as live model output. Do not invent evaluation results.
- Use the existing mail/extraction ports and shared DatabaseService rather than embedding SDK/protocol setup in feature services. Keep SMTP/provider tests separate from local fixtures; development capture/AI fixtures are forbidden in production mode.
- Local checkpoint commits on `main` are authorized. Do not backdate commits or create/push a remote. Presentation preparation now authorized in `presentation/`, following its review gates; optional later report-support decision log only if time/user approval permits.

Application foundation is being implemented; see `docs/status.md` for verification. The disposable domain form spike remains in `docs/.ignore/tmp/form-spike/` and previously passed seven DOM/schema tests. Ginkgo was tested initially but removed. The root briefing remains unchanged and ignored because it contains sensitive context.
