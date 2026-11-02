# Current implementation: selective reading

| Topic | Document / section |
| --- | --- |
| Inventory, verification provenance, known limits | [Status](status.md) |
| Product purpose and boundaries | [Product](product.md) |
| Responsibility map and persistence | [Architecture](architecture.md) |
| State dimensions, permissions, revisions | [Workflows](workflows.md) |
| Spending boundary and extraction wiring | [Jev safety](jev-safety.md) |
| Identity and API index | [API](contracts/api.md), [candidate access](contracts/candidate-access.md) |
| Authoring / publication | [Vacancy contract](contracts/vacancy-api.md) |
| Immutable answers / private files | [Application contract](contracts/application-api.md) |
| Processing, correction, CSV | [Processing/review contract](contracts/processing-review-api.md) |
| Interview authority, progression, inbox | [Interview contract](contracts/interview-api.md) |
| Machine-readable references | [OpenAPI](contracts/openapi.json), [interview OpenAPI](contracts/interview-openapi.json); see status for gaps |
| User demo journeys | [Demo guide](guides/demo-guide.md) |
| Automated/manual verification | [Backend checks](guides/backend-test.md), [integration testing](guides/integration-testing.md) |
| UI conventions | [Frontend design](guides/frontend-design.md) |
| Host networking / terminals / portability | [Networking](guides/local-networking.md), [RMUX](guides/rmux.md), [Windows notes](guides/windows-compatibility.md) |

These documents describe implemented code: the merged skills baseline `fd9fe9e` plus subsequent checkpoints recorded in [status](status.md). R2/R3a/b have static-check evidence only; behavioral tests are explicitly deferred there. New publication gates, candidate/owner notification effects, readiness behavior and import rules belong to [plan/](../plan/README.md), not to the implementation inventory.
