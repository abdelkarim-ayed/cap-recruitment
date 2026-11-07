# Product and current boundaries

Company-specific recruitment management, separately deployed/brandable per company. Not a marketplace, multi-tenant SaaS or employee-management system. The organizational range discussed (roughly 10–1,000 employees) is a target context, not verified scale.

## Purpose

Keep vacancy requirements, applications/documents, assisted extraction, human review, interview assessments and internal decisions together. Accelerate HR work; do not claim autonomous hiring or verified competence from CV assertions. Ranking, qualification formulas and complex selection rules are external/manual, not implemented in-platform.

## Actors and authority

- Candidate: lightweight account, at most one application per vacancy, application-specific documents, immutable submitted content.
- Recruiter/admin: shared application reads/review/preselection/scheduling; creates vacancies. The owning recruiter/admin alone edits/publishes/closes that vacancy and records Offer/Hired. Admin has no automatic owner override.
- Interviewer: assigned appointment/answers/files and own final assessment. Staff may also be assigned interviewers. One responsible assignee, not a panel.

Authentication uses password/cookie sessions and verified identity; ownership is resolved from stored records. R1 adds static action-role eligibility and feature-scoped policies with typed UI availability, not a new permission framework or JWT migration. The [current action inventory](contracts/action-policies.md) preserves the existing workflow; future product rules remain planned.

## Current invariants

- Candidate answers, original extracted suggestions and HR corrections are separate.
- Frozen submission definitions retain input/task/source identities; later processing cannot edit candidate answers/files.
- Processing completion is not candidate approval. Review completion is not preselection; current export is ungated.
- Internal decisions/notes and candidate information are distinct. Own screening notices communicate generic outcomes, never internal reasons; full business-stage publication remains absent.
- Closing intake does not end recruitment or archive applications.
- Upload business restrictions differ from backend operational caps; fixtures never imply live AI quality.

See [screening](contracts/screening-api.md) and [publication](contracts/vacancy-api.md#publishclose) for source-level behavior and verification limits. Publication freezes the possibly empty interview plan; zero-interview Offer, readiness/manual release and broader candidate progress/effects remain planned. No claims/assignment/debate states or hierarchy override; coordination can occur in approved tools before an authorized HR commit.
