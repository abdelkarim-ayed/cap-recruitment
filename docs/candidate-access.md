# Candidate access — approved direction

## Approved: email code, no password signup
1. Candidate opens public vacancy and clicks Apply.
2. Enters email; receives a short-lived code and verifies it.
3. Backend creates or reuses the account for that verified email. Name is profile data, not an identity key.
4. Candidate completes the vacancy form and uploads application-specific documents. Existing contact fields may be prefilled; CV is not an account/profile document.
5. Submission creates at most one application for this candidate/vacancy.
6. Returning users use the same email-code login; active sessions do not need another code for each vacancy.

This is account creation without a registration/password screen, not account-free intake. It moves verification earlier than the previous provisional flow to reduce duplicate and unauthorized submissions.

## Duplicate handling
- Existing verified email: reuse account/profile, do not create another.
- Existing application for that vacancy: show that application instead of accepting another; enforce uniqueness server-side/database-side, including concurrent submissions.
- Other vacancy: permit another application linked to the same profile.
- Different email: initially a different account. Do not automatically merge using name or phone. Possible duplicates can be reviewed by HR later.
- HR-entered/imported profile with same email: use a verified linking path; neither merge arbitrarily nor allow access based only on unverified email. Detailed import/linking flow is deferred.
- Candidate can correct the form before submission. Submitted answers/documents should remain a snapshot; exact post-submission correction/withdrawal policy is open. Changing contact identity must not silently rewrite historical applications.

## Scope
Email/password signup is not selected. Google sign-in may be added later. Better Auth email OTP and cookie sessions implement this flow; local mail delivery uses Mailpit.

## Testing and extensions
- Local captured email can test actual code delivery/verification without sending real mail.
- Google sign-in is a later alternative entrance to the same account system, not another profile store. Linking must follow the auth library's safe verified-account rules.
- Mock OAuth is development-only and is not proof of real Google integration.
- Google Forms import is deferred; sample imports do not validate live ingestion or identity linking.
