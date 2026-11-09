# Current implementation: selective reading

| Topic | Document / section |
| --- | --- |
| Inventory, verification provenance, known limits | [Status](status.md) |
| Product purpose and boundaries | [Product](product.md) |
| Responsibility map and persistence | [Architecture](architecture.md) |
| State dimensions, permissions, revisions | [Workflows](workflows.md) |
| Existing action requirements and typed UI availability | [Action policies](contracts/action-policies.md) |
| Undecided export, decision CSV, conflict UX and shared screening closure | [Screening contract](contracts/screening-api.md) (migration applied locally; broader QA pending) |
| Spending boundary and extraction wiring | [Jev safety](jev-safety.md) |
| Identity and API index | [API](contracts/api.md), [candidate access](contracts/candidate-access.md) |
| Authoring / publication | [Vacancy contract](contracts/vacancy-api.md) |
| Unsaved-change navigation guards | [Editor navigation contract](contracts/editor-navigation.md) |
| Agenda list/detail context and tab-session precedence | [Agenda navigation](contracts/agenda-navigation.md) |
| Immutable answers / private files | [Application contract](contracts/application-api.md) |
| Processing, correction, CSV | [Processing/review contract](contracts/processing-review-api.md) |
| Interview authority, progression, inbox | [Interview contract](contracts/interview-api.md) |
| Machine-readable references | [OpenAPI](contracts/openapi.json), [interview OpenAPI](contracts/interview-openapi.json); see status for gaps |
| User demo journeys | [Demo guide](guides/demo-guide.md) |
| Repeatable lifecycle scenario dataset | [Lifecycle fixtures](guides/lifecycle-demo.md) (locally seeded; broader QA pending) |
| Automated/manual verification | [Backend checks](guides/backend-test.md), [integration testing](guides/integration-testing.md) |
| Manual transition coverage | [Transition map](guides/transition-map.md) (source expectations, not executed passes) |
| Implemented frontend product/interaction/style baseline (read before UI changes) | [Frontend design](guides/frontend-design.md) |
| Host networking / terminals / portability | [Networking](guides/local-networking.md), [RMUX](guides/rmux.md), [Windows notes](guides/windows-compatibility.md) |

These describe implemented source; dated operational checks/pending gates are in [status](status.md). Screening/closure/notices, publication/finalization, readiness/manual release, no-op saves/navigation guards, T2a and the selected UI overhaul/consistency pass are locally merged. Preserve the frontend baseline rather than old proposal layouts. Local demo setup applied migrations 007/008 and seeded lifecycle fixtures; builds/offline checks and partial manual paths do not complete broader integration/native/privacy/race QA. Future notification/extraction behavior remains in [plan/](../plan/README.md).
