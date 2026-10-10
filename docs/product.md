# Product direction

Status: backend foundation implemented; recruitment workflows remain to be built. Confirmed constraints are distinguished from proposed behavior. See [`status.md`](status.md) and [`architecture.md`](architecture.md) for evidence and gaps.

## Confirmed purpose
Company-branded recruitment management, with a separate deployment per company. Not a job marketplace and not multi-tenant SaaS. Target organizations can range from roughly 10 to 1,000 employees; do not claim this as a tested scale.

Central workflow: vacancy → application → screening → interviews → hiring decision. Keep contact details, CVs, documents, assessments, communications, and progress together. Position the product as workflow acceleration with assisted screening, not autonomous hiring.

- One lightweight candidate account/contact identity can have applications to multiple vacancies. CVs/documents belong to applications, not the account profile.
- At most one application per candidate per vacancy. Reposting creates a new vacancy.
- Current-employee management is excluded. Exporting hired applicants is deferred.
- A limited public candidate interface is preferred, linked from company careers pages or external job listings.
- HR configures requested documents, candidate questions, and extraction tasks. Exact supported types remain open. Job qualifications can be described, but automatic qualification/filtering is outside current scope.
- Candidate-declared data, machine suggestions, and HR-verified facts remain distinct.
- Public updates are separate from internal stages; exact labels/publication rules remain open.
- Automatic ranking/filtering is outside current platform scope; HR can use extracted/reviewed data in spreadsheets/scripts.

## Actors
Confirmed direction: HR administrator, recruiter, candidate, and assigned interviewers. Guest access remains open.

- Administrator: HR accounts, permissions, company configuration; can also recruit.
- Recruiter: owns or coordinates the recruitment process, candidates, stages, communications, and scheduling.
- Candidate: applies, supplies documents, and accesses their own published information.
- Interviewer: assigned assessment and feedback only, potentially an engineer or manager. Not necessarily HR. External invitations are deferred pending an access decision.

## Representative scenarios
Detailed bounded scenarios and stage meanings are in `workflows.md`.
1. HR publishes a vacancy with requirements, questions, and requested documents.
2. Candidate signs up with name/email/password and verifies email once, or signs into an existing account, then submits contact details, answers and documents. Internal staff use provisioned email/password accounts. See candidate-access.md.
3. Uploaded CV is processed asynchronously according to configured extraction tasks. HR reviews suggested facts and evidence alongside candidate answers.
4. HR reviews/exports a job's applications, optionally processes them externally, and records selection decisions manually in the platform.
5. HR schedules interviews of different types and records attributable feedback.
6. An authorized user records the hiring decision and publishes a candidate update.

## Authority
One accountable vacancy owner, collaborative recruiters, assigned interviewers, and owner finalization are agreed in principle. Recruiter batch allocation may be agreed outside the system. No separate recruitment-manager role is necessary by default.

Owner is the responsible recruiter coordinating the vacancy and recording the final business decision. Hiring-manager capability can be performed by the same person or supported by department interview feedback, without another role or approval chain initially. Whether admin may override is open.

## Vacancy and review direction
- Hybrid intake: contact fields, CV, and explicit questions where useful. Extract facts where feasible to reduce candidate effort; do not require CV-first behavior before reliable extraction exists.
- Document requests and separate extraction tasks define both candidate UI and backend work. Tasks may populate internal export columns rather than candidate-visible questions.
- Extraction may concern education, certifications, experience, GPA, or normalized skills. Exact automated support is not yet approved; unsupported facts remain explicit/manual.
- Backend processing suggests facts; HR can confirm, correct, or work fully manually. No automatic qualification, ranking, or rejection in current scope.
- Staff can add interview notes and supporting attachments outside the candidate form. Internal material is not automatically candidate-visible.
- Configurable scores/formulas are deferred. Extract facts for human review/export; no automatic qualification policy or arbitrary executable rules.

See `vacancy-form.md` for the proposed bounded first model.

## Proposed boundaries
- Interview type is a simple label; interviews record who assessed whom, when, notes, and recommendation.
- External spreadsheet/script filtering is possible using exported answers and extracted facts; automated decision reimport is deferred.
- Document/form configuration uses bounded types rather than an unrestricted form builder.

The boundaries in this section are recommendations, not approved requirements.
