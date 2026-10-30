# Recruitment platform

Company-specific recruitment application built with React/Vite, NestJS/TypeScript and PostgreSQL.

Includes configurable vacancies and application forms, private documents, HR corrections and CSV export, interview scheduling, internal evaluations/decisions and a staff inbox. Document extraction currently uses labelled test fixtures; live AI and candidate-facing recruitment updates are not implemented.

## Local development

Requires Node **24**, pnpm **12.9.0**, and Podman with a Compose provider. The included infrastructure configuration uses Linux host networking; see the [networking notes](docs/local-networking.md) and [Windows portability notes](docs/windows-compatibility.md) before using another environment. This is a development setup, not a production deployment configuration.

Create `.env` from `.env.example` if it does not already exist, and set `BETTER_AUTH_SECRET` to a randomly generated secret of at least 32 characters. Do not commit `.env`.

```sh
pnpm install --frozen-lockfile
pnpm infra:up
pnpm build
pnpm --filter @recruitment/api auth:migrate
pnpm --filter @recruitment/api db:migrate
pnpm dev
```

Open **http://localhost:5173**. For synthetic accounts and sample documents, follow the [demo guide](docs/demo-guide.md).

Checks: `pnpm test` and `pnpm typecheck`. Infrastructure connectivity: `pnpm infra:check`. Stop infrastructure without deleting its volumes: `pnpm infra:stop`.

## Documentation

- [Implementation status and known limits](docs/status.md)
- [Product and workflows](docs/product.md)
- [Backend API](docs/api.md) · [Interview workflow](docs/interview-api.md)
- [Integration testing](docs/integration-testing.md)
- [Backlog](docs/backlog.md)
- [Presentation sources and PDF build](presentation/README.md)
- [Presentation PDF](presentation/exports/status.pdf)
