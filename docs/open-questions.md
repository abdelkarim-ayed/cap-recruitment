# Open decisions

Answer each cluster independently; detailed API/database design comes later.
Latest prioritised feedback and current-versus-requested matrix: [product-checkpoint.md](product-checkpoint.md). That checkpoint preserves changeability concerns even while business rules remain open.

## 1. Authority and collaboration
- Bounded interview policy now implemented: owner pipeline/finalization, shared HR scheduling, assignee-only final assessment, Fail automatically ends application, no reopening. See interview-api.md. Admin override and guest invitations remain deferred.
- Owner, collaborative recruiters, assigned interviewers, and owner finalization are accepted in principle.
- Responsible recruiter ownership is approved; hiring-manager capability need not be a separate role. Decide whether admin can override finalization.
- Existing company users only, or guest interviewers? Guest invitations add auth and scoping work.

## 2. Candidate identity and access
- Implemented: Better Auth password accounts, candidate-only signup/one-time email verification, code reset/session revocation and trusted staff provisioning. Legacy OTP API retained. Mailpit/file local delivery; production email setup remains open. See candidate-access.md and api.md.
- Google OAuth is desired but deferred pending provider configuration; LinkedIn is optional.
- Verified email identifies the lightweight account; same-email signup reuses it. Different-email/imported-profile linking remains a later policy; phone is contact data, not the default identity key.
- First slice: submitted answers/files locked; editing before send does not require saved server drafts. Withdrawal/resubmission, explicit later corrections, and account-profile changes remain later decisions.

## 3. Vacancy form and screening policy
- See `vacancy-form.md` for hybrid intake/extraction; `form-tooling.md` for researched library candidates.
- Generic catalog/extractSkills config implemented; presets TODO. One file/input, optional accept/business limit, 10 MiB/file and 25 MiB combined. Admin/recruiter read-all applications, candidate read-own. Allowed-HR registry and production quota/scan/orphan-reconciliation policies deferred.
- Branch target is predefined skills only; richer tasks/experience/proficiency extraction remain future decisions. PDF preparation is real on the feature branch; guarded Jev executor is experimental/unselected and has no live quality verification. See jev-gateway-handoff.md.
- Automated qualification/filtering is outside current scope; reconcile original automated-ranking requirement before claiming coverage.
- Define uncertain/missing/conflicting evidence handling and bulk confirmation.

## 4. Public communication
- Internal event inbox approved/implemented; seven days after first read cleanup, unread retained. No chat, automatic business email or timed reminders. Candidate publication still deferred; current new stages remain internal.
- Current internal pipeline is implemented, not immune to review: see workflows.md and interview-api.md. Latest questions include publish-time prerequisites, preselection/bulk/import semantics and panel responsibility. HR Not selected is distinct from deferred candidate withdrawal/offer decline.
- Internal stage labels versus candidate-visible status labels.
- Publication manual, automatic for selected events, or mixed?
- Email/in-app basics; bulk messages and external integrations remain separate scope.
- Prefer deliberate selected-recipient emails; scheduling changes must not automatically send. Define the initial message/template scope.

## 5. AI contract and providers
- Extraction-only scope: choose practical methods for selected facts; no automatic qualification policy.
- Evidence representation, confidence interpretation, fixture cases, and fallback behavior.
- Final extraction method/model/question design remains open despite guarded Jev transport being implemented. No in-platform ranking or embeddings requirement follows from this.

## 6. Presentation and runtime
- Visual direction and the concrete demo scenario.
- Local container deployment versus hosting; exact hosting target is unidentified.
- Operational status screen scope and visibility.
- Production email delivery and optional future OAuth setup; current library/session integration is implemented and tested.

## Next product checkpoint — proposals, not approvals
- Pipeline/identity agreed. Review is optional cleanup; failed/unreviewed values may export with status/provenance. Completion not approval/export gate. Candidate-visible updates and automatic stage transition remain future decisions.
- No automatic receipt/business emails required initially; identity verification/reset messages are separate. Internal interview inbox exists. HR can use external communication; candidate publication/email/calendar integration remain separate decisions.
- Submitted definition/identity snapshots and locked answers/files are implemented; account is not a reusable CV profile. Withdrawal and later submitted-content corrections remain separate unapproved policies.
- User prefers noneditable published vacancies. Recommend editable drafts, locked published intake definition, and cloning; decide whether closing/unpublishing or descriptive corrections remain allowed.
- Recommend existing-user interviewers initially; guest invitations deferred. Admin finalization override needs an explicit decision.
- After these, consolidate core functional requirements, permissions, and basic nonfunctional requirements before implementation approval.
