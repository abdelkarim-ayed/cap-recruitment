# Manual demo — start here

## Interview checkpoint — manual test
Current RMUX tabs: `api`, `web`; `inbox-retention` runs notification cleanup only when launched. Routine checks use normal shell execution; see [rmux.md](rmux.md). No extraction worker is started.

1. Sign in as vacancy owner, open vacancy → **Interview pipeline & results**. Add ordered Technical/HR steps and save. Owner contact appears beneath the heading. Steps can be configured for an already-published vacancy independently of the locked intake form, but freeze after the first appointment.
2. Open application → **Selection & interviews** → Preselect. Schedule a step with an existing staff interviewer (`demo.interviewer@example.test`), date, half-hour start, duration and link/location. A second step can be booked ahead with a non-overlapping slot. Another recruiter may schedule but cannot edit pipeline/finalize owner decisions.
3. Sign in as interviewer → **My interviews** / **Inbox**. Assigned appointment exposes its application/CV only. Request rescheduling; owner/creator get an inbox message. HR reschedules/reassigns; old assignee loses candidate access. Agenda is grouped by date; week navigation and Needs feedback show past pending appointments.
4. At/after scheduled start (not before), interviewer submits notes + optional score + Pass/Fail, then confirms. Pass is final feedback, not acceptance. Fail is **terminal**: application Not selected, all remaining unfinished interviews cancelled with explicit failure cause; no reopening or further scheduling. Use a fresh posting/application for another attempt. Do not submit Fail on manual data unless that terminal result is intended.
5. Owner sees per-step result/score table. Once every step passes, owner records Offer, then Hired. No email or candidate-visible business status is sent/published. Candidate still sees immutable submission, not internal assessment.
6. Inbox defaults unread. Opening marks read; All retained messages shows read ones. Retention runner deletes seven days after first read, never unread or interview/application records. No chat or timed reminders.

No seeded interview results are fabricated for this checkpoint. Native date/file/PDF UI is manually tested. Automated synthetic clock fixtures in interviews:check are not a runtime bypass. Details/known bounds: [interview-api.md](interview-api.md).

Open **http://localhost:5173** using localhost consistently. Browser layout/interaction remains manually tested; no browser automation/screenshots.

## Login now uses passwords
All seeded accounts below initially use **`DemoRecruitment!2026`**. This is a public, synthetic **demo-only** credential, not a production password. Seed commands refuse production mode. A seed rerun does not reset passwords you changed.

| Email | Role / purpose |
| --- | --- |
| demo.hr@example.test | Recruiter, owns demo vacancies |
| demo.hr2@example.test | Second recruiter, shared application review; cannot edit first recruiter's vacancies |
| demo.admin@example.test | Admin, shared review; no vacancy-owner override |
| demo.candidate@example.test | Candidate for manual intake |
| demo.candidate2@example.test | Second candidate for manual intake |
| demo.interviewer@example.test | Staff login; application/review access intentionally excluded |

Sign out before changing accounts. No OTP required for seeded password login. A private browser window can hold another session if you choose. Role comes from the real database account, never the typed email's spelling or a UI selection. Public signup always creates candidates, not staff.

### Fresh signup, verification and reset
Use **Candidate signup**, choose name/email/password (12–128 characters), enter the emailed verification code, then sign in with your password. **Verify email** resends verification for existing unverified accounts. **Forgot password?** sends a separate reset code; saving a new password revokes prior sessions. Existing OTP-only accounts can set their password this way. Duplicate signup does not overwrite an account.

In local file-mail mode, run this for the **exact address you entered**:
```sh
MAIL_DRIVER=file pnpm --filter @recruitment/api mail:latest your-address@example.test
```
It now prints recipient, purpose and timestamp with the local code. Check all three; old captures remain until a new message for that address is captured. Do not paste codes/cookies into reports. Normal password login sends no email. SMTP mode uses Mailpit at http://localhost:58025 instead. Code endpoint limits remain tight; password login allows ten requests per socket peer/path/minute. Vite-proxied users share the socket peer. A 429 is an explicit rate-limit failure, not a delivered mail.

## Start/restart after sleep
From repository root (existing .env/host-network infrastructure):
```sh
pnpm infra:up
pnpm build
pnpm --filter @recruitment/api auth:migrate
pnpm --filter @recruitment/api db:migrate
pnpm --filter @recruitment/api demo:seed
```
Keep these in two terminals:
```sh
MAIL_DRIVER=file pnpm --filter @recruitment/api start
```
```sh
pnpm --filter @recruitment/web exec vite --host 127.0.0.1
```
If ports are occupied, an existing server may be running. Don't start duplicates. Preserve PostgreSQL volume and .local/documents together.

## Realistic synthetic CVs — RenderCV
Already generated in this workspace. For fresh setup/regeneration, Python 3.12+:
```sh
python3 -m venv .local/rendercv-venv
.local/rendercv-venv/bin/pip install 'rendercv[full]==2.8'
python3 scripts/render-demo-cvs.py
pnpm --filter @recruitment/api demo:seed
```
Isolated local authoring tool, not a runtime service or global installation. Source: docs/demo-cvs.json; RenderCV engineeringresumes theme produces PDFs and local Typst sources only. **No images/photos/PNG generation.** Five profiles have varied experience, dates, responsibilities, education, skills and languages. All people/employers/achievements are fictional; no extraction accuracy claims. RenderCV rejects .test email syntax, so document contact addresses use reserved example.com; login accounts still use example.test. No mail is sent to CV contact addresses.

Outputs: .local/demo/rendercv-pdfs/*.pdf, with convenient copies such as **/home/ubuntu/code/.local/demo/candidate-cv.pdf** for upload. Hidden folders may require “show hidden files” or pasting the path.

New seed vacancy: **[DEMO] Backend developer — RenderCV**, containing fresh scenario applications using these PDFs. The earlier simple-PDF vacancy and any manual submissions are preserved, not rewritten. Use the RenderCV-labelled vacancy for current testing. Repeated seed preserves review/submissions/passwords and regenerates convenience samples/manifest; no broad reset. Rename/close of a seeded job is preserved, but title lookup can create another demo job after a rename. Run seed serially.

## HR check
1. Login demo.hr. Vacancy table/header now shows owner name/email and “Owned by you”. Filter status/sort positions across the full dataset.
2. Open the RenderCV vacancy → Applications. Four scenarios: Casey successful/completed review; Jordan simulated failed extraction; Drew pending; Avery successful empty list.
3. Use processing/review filters and sorting; counts/pagination reflect the full matching dataset. Export still includes **all** vacancy applications, not just filtered rows.
4. Open a record → **Preview CV**. Authorized PDF bytes open beside review. Download remains available; non-PDFs are download-only. Native browser PDF viewing support varies.
5. Save a skills correction: **latest saved value** appears prominently and is used in export. Original extraction/evidence stays unchanged under its expandable section. Refresh/relogin preserves the correction. Explicit null differs from empty skills.
6. Current saved revision, last editor and save time are visible. Revision is a concurrency counter, **not historical versions**; no history arrows/browser in this checkpoint.
7. Login demo.hr2 or admin and continue shared review. Completion is optional and never candidate approval/export gating. Test interviewer exclusion separately.

## Fresh vacancy → candidate → mock processing
1. As recruiter, create/edit a vacancy, configure questions and document extraction, preview, save, publish. Published definitions lock; unsaved changes disable publishing.
2. Login candidate, fill/upload a RenderCV PDF and submit. Answers/files are immutable; duplicates return existing submission unchanged. For another run use another candidate/vacancy, not a reset.
3. Login recruiter and open the new application. Copy its UUID from the URL (`#/applications/UUID`); operator commands now live only in this guide. Run:
```sh
pnpm --filter @recruitment/api demo:process APPLICATION_UUID success
```
Choose failure/empty instead for those recorded outcomes. Refresh afterward. Unattempted tasks only; refuses overwriting results. Actual source identity/hash/args verified, real persisted executor used. **No parsing/AI**: success chooses first two configured skill names, regardless of CV text. Every result retains fixture provenance. No automatic poller; ordinary submissions stay pending until run. Underlying processing:run and recovery: processing-review-api.md.

For a vacancy with **no extraction tasks**, submit normally: no processing/review action is needed. Review marker auto-completes as not applicable; no reviewer/date or candidate approval implied. Staff screens omit extraction controls; mixed tables show a dash, and review-status filters exclude these records. PDF preview/download and CSV remain available. No bulk “review applications” decision is introduced.

## Staff outside demo
Operator-local staff:provision creates/updates staff roles and revokes sessions. Optional STAFF_INITIAL_PASSWORD environment variable sets a password (don't put secrets in CLI arguments/history); without it use password reset to establish one. Verify email ownership before normal login. No public HR/admin signup or staff management UI. See candidate-access.md.

## Verification
56 ordinary tests pass; build/typecheck pass. DOM tests also verify no-task applications hide review controls/requests but keep preview/export. Real PostgreSQL processing:check verifies automatic no-task completion, no invented reviewer/date, unchanged stage and review-filter exclusion. Prior auth:password-check/auth:mock-check and vacancy/proxy checks remain documented in status.md. User manually validates native PDF viewer, appearance and spreadsheet CSV opening. Report sanitized errors, never credentials/real CV data.
