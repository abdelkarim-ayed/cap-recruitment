# Recruitment platform

Company-specific recruitment application built with React/Vite, NestJS/TypeScript and PostgreSQL.

Configurable vacancies/forms, private CV documents, five-family structured CV
extraction, independent HR corrections/effective CSV, interview scheduling, human
recruitment decisions and a staff inbox. Native PDF preparation and guarded Jev
transport are implemented with disabled defaults. The explicitly enabled current
worker uses real Jev for new synthetic submissions once its RAM key is loaded;
seeded historical examples retain declared fixture provenance. No agent live
validation or quality claim; candidate screening
notices/public status exist, broader recruitment notifications remain planned.

**[Demo launch and key rotation → LAUNCH.md](LAUNCH.md)** — current worktree/RMUX,
accounts/PDFs, setup commands, worker architecture and real-provider boundaries.

## Local development

Requires Node **24**, pnpm **12.9.0**, and Podman with a Compose provider. The included infrastructure configuration uses Linux host networking; see the [networking notes](docs/current/guides/local-networking.md) and [Windows portability notes](docs/current/guides/windows-compatibility.md) before using another environment. This is a development setup, not a production deployment configuration.

Create `.env` from `.env.example` if it does not already exist, and set `BETTER_AUTH_SECRET` to a randomly generated secret of at least 32 characters. Do not commit `.env`.

```sh
pnpm install --frozen-lockfile
pnpm infra:up
pnpm build
pnpm --dir apps/api run auth:migrate
pnpm --dir apps/api run db:migrate
pnpm dev
```

Open **http://localhost:5173**. For synthetic accounts and sample documents, follow the [demo guide](docs/current/guides/demo-guide.md).

No tests are run for the current time-bounded handoff. Builds are not a regression
or live-provider pass; pending checks remain in the status/plan. Stop infrastructure
without deleting its volumes only when authorized: `pnpm infra:stop`.

## Documentation

- [Documentation index](docs/README.md): current behavior versus planned work
- [Implementation status and known limits](docs/current/status.md)
- [Product](docs/current/product.md) · [Workflows](docs/current/workflows.md)
- [Backend API](docs/current/contracts/api.md) · [Interview workflow](docs/current/contracts/interview-api.md)
- [Integration testing](docs/current/guides/integration-testing.md)
- [Planned checkpoints and backlog](docs/plan/tasks.md)
- [Presentation sources and PDF build](presentation/README.md)
- [Presentation PDF](presentation/exports/status.pdf)
