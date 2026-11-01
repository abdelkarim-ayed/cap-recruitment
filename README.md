# Recruitment platform

Company-specific recruitment application built with React/Vite, NestJS/TypeScript and PostgreSQL.

Includes configurable vacancies and application forms, private documents, HR corrections and CSV export, interview scheduling, internal evaluations/decisions and a staff inbox. Real PDF preparation and guarded skills extraction are implemented with disabled defaults; extraction is fixture-tested, not live-validated. Candidate-facing recruitment updates remain planned.

## Local development

Requires Node **24**, pnpm **12.9.0**, and Podman with a Compose provider. The included infrastructure configuration uses Linux host networking; see the [networking notes](docs/current/guides/local-networking.md) and [Windows portability notes](docs/current/guides/windows-compatibility.md) before using another environment. This is a development setup, not a production deployment configuration.

Create `.env` from `.env.example` if it does not already exist, and set `BETTER_AUTH_SECRET` to a randomly generated secret of at least 32 characters. Do not commit `.env`.

```sh
pnpm install --frozen-lockfile
pnpm infra:up
pnpm build
pnpm --filter @recruitment/api auth:migrate
pnpm --filter @recruitment/api db:migrate
pnpm dev
```

Open **http://localhost:5173**. For synthetic accounts and sample documents, follow the [demo guide](docs/current/guides/demo-guide.md).

Checks: `pnpm test` and `pnpm typecheck`. Infrastructure connectivity: `pnpm infra:check`. Stop infrastructure without deleting its volumes: `pnpm infra:stop`.

## Documentation

- [Documentation index](docs/README.md): current behavior versus planned work
- [Implementation status and known limits](docs/current/status.md)
- [Product](docs/current/product.md) · [Workflows](docs/current/workflows.md)
- [Backend API](docs/current/contracts/api.md) · [Interview workflow](docs/current/contracts/interview-api.md)
- [Integration testing](docs/current/guides/integration-testing.md)
- [Planned checkpoints and backlog](docs/plan/tasks.md)
- [Presentation sources and PDF build](presentation/README.md)
- [Presentation PDF](presentation/exports/status.pdf)
