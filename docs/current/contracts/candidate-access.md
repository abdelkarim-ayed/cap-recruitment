# Account access — current behavior

Updated after manual feedback (2026-10-10): **email/password for staff and candidates**, replacing passwordless UI login.

- Public signup accepts name/email/password and creates candidate accounts only. Roles are non-client-writable. Existing accounts/passwords are not overwritten by duplicate signup.
- New candidates verify an emailed code once, then sign in with their password. Password length: 12–128 characters. Existing verified accounts use email/password without a code for every login.
- Staff accounts/roles are provisioned by a trusted local operator; no public staff registration. Set an initial password through STAFF_INITIAL_PASSWORD or use the email-code password-reset flow. Provisioning revokes prior sessions. Staff still verify email ownership before ordinary password login.
- Password reset verifies a short-lived emailed code and revokes existing sessions. Legacy OTP sign-in API remains available for compatibility/regression; current UI uses passwords.
- Demo seed identities/credentials are explicitly synthetic, verified by the trusted demo seed only; forbidden in production. This is not a general auth bypass.
- Application authoring/preview/intake explicitly show fixed read-only Account email. Preview uses an example address; candidate intake uses the signed-in account email. It is not a second editable answer/source of identity; the backend continues freezing session identity regardless of displayed content. No schema/account-email change or automatic form-question deletion.
- Better Auth stores password hashes/codes and validates cookie sessions. SMTP/file/memory adapters remain replaceable; development captures are not real deliveries. Google/OAuth deferred.

## Intake and duplicates

Candidates see their own [coarse application status](application-api.md#candidate-public-status) consistently in My applications and application detail, including Not selected rather than a contradictory Received label. No internal decision reasons or assessments are published.

Candidate Open positions offers an optional **Not applied yet** filter. It calls authenticated candidate-only `GET /api/candidate/vacancies?notApplied=true&limit=20&offset=0&sort=newest` (also supports oldest/title sort). One SQL statement restricts to published vacancies and excludes this session candidate's submissions before both total and pagination; existing rejected/preselected/final submissions still count as applied. The caller cannot supply a candidate identity. Results contain only public vacancy summaries, with private/no-store caching and no owner or other-candidate metadata. Unfiltered/guest browsing retains the public list; no new application/submission behavior or data change is introduced. Candidate/state changes trigger fresh requests; checking the filter resets pagination. Build/static checked; authenticated SQL/privacy/manual verification remains pending.
Vacancy summary → candidate signup/verification or existing login → separate `#/vacancies/:id/apply` entry → typed answers/upload → immutable application. A signed-in candidate's summary and direct apply entry first check for their own existing submission; if present, they show Already applied / View your application, not another form or apply link. Loading/error never falls back to an unchecked editable form. Guest sign-in returns to the checked entry. Identity/role/route changes invalidate the loaded projection.

`GET /api/applications/for-vacancy/:vacancyId` is candidate-only, authenticated, private/no-store, UUID-validated, and returns only `{applicationId:string|null}` for the session candidate plus vacancy. No client-supplied candidate identity or other person's submission can be queried. The lookup does not require public intake to remain open. When public detail returns 404 but this candidate has applied, the summary may use their existing authorized application snapshot and retain View your application; it does not reopen public intake or mount a form.

One application per candidate/vacancy; transactional duplicate-return remains the race/multiple-tab backstop. A repeat returns the existing application unchanged, never overwrites answers/files. No resubmission, correction or withdrawal is added. Different emails are different accounts; no automatic merging by name/phone. Email identity changes must not rewrite frozen application snapshots. Imports/linking remain deferred. Source/static verification only; authenticated role/race/native checks remain pending.

Manual accounts and commands: [demo guide](../guides/demo-guide.md). Backend contract: [api.md](api.md), [application-api.md](application-api.md).
