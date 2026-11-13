# Recruitment platform

A company recruitment prototype: configurable vacancies/application forms, private
CVs, structured extraction, independent HR corrections and CSV export, screening,
interviews and explicit human hiring decisions. React/Vite frontend, NestJS API,
shared TypeScript/Zod domain, PostgreSQL and Redis; pnpm workspaces, no extra queue
service. The five CV question families cover education, certification, experience,
skill coverage and skill evidence. Extraction never ranks or selects candidates.

**[Launch guide → LAUNCH.md](LAUNCH.md)** covers real Jev versus offline mode,
RAM-only key rotation, synthetic accounts/PDFs, worker/cache/recovery behavior and
the existing running session. This is a development demo, not production-ready or
live-quality-validated software. Historical seed results are labelled fixtures.

## Tools to install

| Tool | Version / installation | Needed for |
| --- | --- | --- |
| Git | [Official downloads](https://git-scm.com/downloads) | Clone/update the source |
| Node.js | **24.x**, [official download](https://nodejs.org/en/download) or your Node version manager | API, frontend, native PDF preparation |
| pnpm | **12.9.0**, [installation guide](https://pnpm.io/installation); with Node installed: `npm install --global pnpm@12.9.0` | Workspace dependencies/builds |
| Podman | [Installation guide](https://podman.io/docs/installation) | Local PostgreSQL 17, Redis 7 and optional Mailpit containers |
| Compose provider | [`podman-compose`](https://github.com/containers/podman-compose), e.g. `pipx install podman-compose` after [installing pipx](https://pipx.pypa.io/stable/installation/), or another provider supported by `podman compose` | `pnpm infra:up`; wrapper also discovers `~/.local/bin/podman-compose` |
| Typst (optional) | **0.15.1**, [official release](https://github.com/typst/typst/releases/tag/v0.15.1); put on PATH or set `TYPST_BIN` | Rebuild the presentation PDF only |
| GitHub CLI (optional) | [`gh` installation](https://cli.github.com/) | Repository authentication/publication, not app startup |

PostgreSQL/Redis need no separate host install when using Compose. The native
`@firecrawl/pdf-inspector` **1.25.2** dependency is installed by pnpm—no global
Firecrawl CLI, hosted parser, Python or RenderCV is needed to run the app or use
the checked-in synthetic PDFs. Mermaid/Graphviz WASM are presentation-local npm
dependencies, not global Java/Graphviz requirements. See [presentation tools](presentation/README.md).

Linux is the demonstrated environment. The included infrastructure uses **host
networking** and localhost ports: PostgreSQL 55437, Redis 56379, SMTP 51025,
Mailpit UI 58025. Read [networking](docs/current/guides/local-networking.md).
Windows/Podman VM forwarding and named-pipe behavior are **not verified**; see
[Windows notes](docs/current/guides/windows-compatibility.md), not a promise that
the Linux commands work unchanged there. RMUX is an environment-specific terminal
convenience; two ordinary terminals are sufficient on a new machine.

## Fresh checkout: build and prepare a safe demo

Run from the repository root. Existing users should not overwrite `.env`, reset
data, duplicate services or renew spending allowance just to follow this guide.

```sh
git clone https://github.com/abdelkarim-ayed/cap-recruitment.git
cd cap-recruitment
cp .env.example .env
```

Edit `.env` yourself: set a strong `BETTER_AUTH_SECRET` of at least 32 characters.
The included DB password is development-only. Keep `.env` out of Git. **Do not put
a Jev API key there**—keys are loaded into the running process's RAM only.

```sh
pnpm install --frozen-lockfile
pnpm infra:up
pnpm --dir packages/domain run build
pnpm --dir apps/api run build
pnpm --dir apps/web run build
NODE_ENV=development MAIL_DRIVER=file PROCESSING_READER=disabled PROCESSING_EXECUTOR=disabled PROCESSING_RUNNER=disabled node apps/api/dist/demo/setup.js seed
```

`demo:setup seed` applies auth/application migrations then initializes or preserves
the reserved synthetic dataset. `reset` is a separate, explicit destructive
operation on that dataset—not a normal startup step. Neither command resets
passwords, spending counters, volumes or the request-attempt ledger. Do not reset
against an active worker. A fresh auth schema/data setup is local to your machine;
the existing session's migration status is not proof your database is ready.

Start in **terminal 1**, with extraction disabled until deliberately enabled:

```sh
NODE_ENV=development MAIL_DRIVER=file EXTRACTION_DRIVER=disabled PROCESSING_READER=disabled PROCESSING_EXECUTOR=disabled PROCESSING_RUNNER=disabled node apps/api/dist/main.js
```

Start in **terminal 2**:

```sh
pnpm --dir apps/web exec vite --host 127.0.0.1
```

Open **http://localhost:5173**. `GET /api/health/ready` checks DB/Redis, not Jev.
Demo logins/sample PDFs, file-mail reading and explicit real/offline extraction
commands are in **[LAUNCH.md](LAUNCH.md)**. Real Jev requires synthetic-data scope,
a fixed submission boundary, unchanged spending guards and a user-loaded RAM key;
loading a key alone does not select an execution mode. No provider call is required
to browse forms. One backend/control socket is allowed per OS user.

## For another developer or AI

Read root **[AGENTS.md](AGENTS.md)**, then [docs/README.md](docs/README.md); load only
the relevant sections. `docs/current/` owns implemented behavior/contracts;
`docs/plan/` owns decisions/remainder. [Status](docs/current/status.md) records dated
evidence, not a guarantee that a process is currently running. Preserve private
files, immutable results/corrections, authorization/revision fences and all Jev
[safety controls](docs/current/jev-safety.md). Never read/print a real key or reset
spending state. Ask before major data/process changes or paid execution.

Builds/startup are not regression/privacy/race or provider-quality acceptance.
Tests were explicitly not run for this handoff; outstanding gates remain visible.
No automatic testing, browser automation, provider probes or backlog implementation
follows from cloning or reading this file. Leave existing demo services alive.

## More information

- [Launch guide](LAUNCH.md) · [Current status/limits](docs/current/status.md)
- [Product](docs/current/product.md) · [Workflows](docs/current/workflows.md)
- [API contracts](docs/current/contracts/api.md) · [CV processing/review](docs/current/contracts/processing-review-api.md)
- [Task board](docs/plan/tasks.md) · [Frontend baseline](docs/current/guides/frontend-design.md)
- [Presentation instructions](presentation/README.md) · [Shared PDF](presentation/exports/status.pdf)
