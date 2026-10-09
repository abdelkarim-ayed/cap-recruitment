# Open decisions

Answer each cluster independently; detailed API/database design comes later.

## 1. Authority and collaboration
- Owner, collaborative recruiters, assigned interviewers, and owner finalization are accepted in principle.
- Responsible recruiter ownership is approved; hiring-manager capability need not be a separate role. Decide whether admin can override finalization.
- Existing company users only, or guest interviewers? Guest invitations add auth and scoping work.

## 2. Candidate identity and access
- Implemented: Better Auth email codes and cookie sessions, automatic candidate account create/reuse, Mailpit development delivery. Production email setup remains open. See `candidate-access.md` and `api.md`.
- Google OAuth is desired but deferred pending provider configuration; LinkedIn is optional.
- Verified email identifies the lightweight account; same-email signup reuses it. Different-email/imported-profile linking remains a later policy; phone is contact data, not the default identity key.
- First slice: submitted answers/files locked; editing before send does not require saved server drafts. Withdrawal/resubmission, explicit later corrections, and account-profile changes remain later decisions.

## 3. Vacancy form and screening policy
- See `vacancy-form.md` for hybrid intake/extraction; `form-tooling.md` for researched library candidates.
- Editor interaction model is accepted. First generic field/argument catalog and extractSkills document-task configuration are implemented in `vacancy-api.md`; richer premade inputs are TODO. Upload operational caps/file-count rules remain to finalize with applications.
- Which additional extraction tasks/providers should be supported beyond the initial skills definition? No task execution is implemented yet.
- Automated qualification/filtering is outside current scope; reconcile original automated-ranking requirement before claiming coverage.
- Define uncertain/missing/conflicting evidence handling and bulk confirmation.

## 4. Public communication
- Internal main pipeline is settled; see `workflows.md`. Clarify negative outcomes: HR not-selection versus candidate withdrawal versus offer decline.
- Internal stage labels versus candidate-visible status labels.
- Publication manual, automatic for selected events, or mixed?
- Email/in-app basics; bulk messages and external integrations remain separate scope.
- Prefer deliberate selected-recipient emails; scheduling changes must not automatically send. Define the initial message/template scope.

## 5. AI contract and providers
- Extraction-only scope: choose practical methods for selected facts; no automatic qualification policy.
- Evidence representation, confidence interpretation, fixture cases, and fallback behavior.
- Jev/API access or alternative; embeddings only if justified by the ranking approach.

## 6. Presentation and runtime
- Visual direction and the concrete demo scenario.
- Local container deployment versus hosting; exact hosting target is unidentified.
- Operational status screen scope and visibility.
- Production email delivery and optional future OAuth setup; current library/session integration is implemented and tested.

## Next product checkpoint — proposals, not approvals
- Main pipeline and lightweight candidate identity are agreed. Finalize candidate-visible updates and review-ready failure/manual-bypass behavior.
- No automatic receipt/business emails required initially; only login codes are automated. HR can use external communication. Revisit messaging/publication/calendar integration after review/export is usable.
- Recommend submitted snapshots; account holds only contact identity, not a CV profile. Define withdrawal and explicit correction policy.
- User prefers noneditable published vacancies. Recommend editable drafts, locked published intake definition, and cloning; decide whether closing/unpublishing or descriptive corrections remain allowed.
- Recommend existing-user interviewers initially; guest invitations deferred. Admin finalization override needs an explicit decision.
- After these, consolidate core functional requirements, permissions, and basic nonfunctional requirements before implementation approval.
