# Recruitment platform

Company-specific recruitment management with configurable applications, document extraction, HR review/export, interviews, and candidate updates.

## Current checkpoint
React/Vite placeholder and NestJS backend. Identity, vacancies/intake/private documents, mock processing and optional HR review/CSV implemented. No live AI/frontend/interviews yet. See [backend tests](docs/backend-test.md), [API](docs/api.md), and [processing/review](docs/processing-review-api.md).

## Development
Requires Node 24, pnpm 12, and Podman with podman-compose (or Docker Compose using `compose.yaml`). Before the first start, create `.env` from `.env.example` if missing and set a randomly generated BETTER_AUTH_SECRET of at least 32 characters. Do not overwrite an existing `.env`; this workspace already has a generated local secret.

```sh
pnpm install --frozen-lockfile
pnpm infra:up
pnpm build
pnpm --filter @recruitment/api auth:migrate
pnpm --filter @recruitment/api db:migrate
pnpm dev
```

Open `http://localhost:5173` through your container connection. Stop the earlier form-spike server first if it occupies 5173. The API binds to localhost port 3000; the web dev server proxies `/api`. Frontend remains a placeholder shell; use the backend testing guide for auth.

- `GET /api/health`: application liveness.
- `GET /api/health/ready`: PostgreSQL and Redis connectivity.
- Mailpit: `http://localhost:58025` (captured sign-in code emails).
- `pnpm build`, `pnpm typecheck`, `pnpm test`: verification.
- `pnpm infra:stop`: stop project infrastructure without deleting data.
- `pnpm infra:check`: after building/starting infrastructure, verify API readiness, PostgreSQL, Redis, SMTP, and Mailpit HTTP.

The scripts use `podman compose`, preferring the newer `.local/bin/podman-compose` provider when available. Every infrastructure service explicitly uses **host networking** and binds to localhost: PostgreSQL `55437`, Redis `56379`, SMTP `51025`, Mailpit HTTP `58025`. No `ports:` mappings or service-name DNS. The API uses localhost too. This is an LXC development workaround with reduced network isolation, not a complete production deployment.

See [networking decision and verification](docs/local-networking.md). Do not switch back to bridge/pasta as part of unrelated development.

Local settings: copy `.env.example` to `.env` and set a randomly generated BETTER_AUTH_SECRET of at least 32 characters. This workspace already has a generated ignored local secret. Default database/Redis values work with the development compose stack. Compose uses local-only service ports and disposable development credentials, not deployment credentials. No real candidate data belongs in this setup yet.

## Product documentation
- [Architecture and progress toward the workflow](docs/architecture.md) · [Mockable integration tests](docs/integration-testing.md)
- [API reference and payload examples](docs/api.md) · [OpenAPI specification](docs/openapi.json) · [Vacancy API](docs/vacancy-api.md)
- [Product](docs/product.md)
- [Decisions](docs/decisions.md)
- [Scenarios](docs/workflows.md)
- [Vacancy editor](docs/vacancy-form.md)
- [Open decisions](docs/open-questions.md)
- [Implementation status](docs/status.md)
