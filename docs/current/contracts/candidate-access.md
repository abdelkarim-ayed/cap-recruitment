# Account access — current behavior

Updated after manual feedback (2026-10-10): **email/password for staff and candidates**, replacing passwordless UI login.

- Public signup accepts name/email/password and creates candidate accounts only. Roles are non-client-writable. Existing accounts/passwords are not overwritten by duplicate signup.
- New candidates verify an emailed code once, then sign in with their password. Password length: 12–128 characters. Existing verified accounts use email/password without a code for every login.
- Staff accounts/roles are provisioned by a trusted local operator; no public staff registration. Set an initial password through STAFF_INITIAL_PASSWORD or use the email-code password-reset flow. Provisioning revokes prior sessions. Staff still verify email ownership before ordinary password login.
- Password reset verifies a short-lived emailed code and revokes existing sessions. Legacy OTP sign-in API remains available for compatibility/regression; current UI uses passwords.
- Demo seed identities/credentials are explicitly synthetic, verified by the trusted demo seed only; forbidden in production. This is not a general auth bypass.
- Better Auth stores password hashes/codes and validates cookie sessions. SMTP/file/memory adapters remain replaceable; development captures are not real deliveries. Google/OAuth deferred.

## Intake and duplicates
Public vacancy → candidate signup/verification or existing login → typed answers/upload → immutable application. One application per candidate/vacancy; a repeat returns the existing application unchanged. Different emails are different accounts; no automatic merging by name/phone. Email identity changes must not rewrite frozen application snapshots. Imports/linking/withdrawal remain deferred.

Manual accounts and commands: [demo guide](../guides/demo-guide.md). Backend contract: [api.md](api.md), [application-api.md](application-api.md).
