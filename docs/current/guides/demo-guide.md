# Manual demo — implemented workflows

For the separate five-vacancy/25-application dataset, see [lifecycle fixtures](lifecycle-demo.md). Local setup applied migrations 007/008 and seeded it on 2026-11-07; Q-T2A and other functional/manual gates remain pending. API/frontend run in the shared [RMUX workspace](rmux.md). Commands below remain operator reference, not blanket authorization for future migrations, reseeds or process changes.

## Interview checkpoint — manual test
Shared RMUX session: `workspace`, tabs `backend` and `frontend`; see [RMUX](rmux.md). Redis/PostgreSQL/Mailpit run in host-network containers. Discover current listeners/tabs before starting or managing anything. Routine checks use normal shell execution. No extraction or inbox-retention runner was launched for this setup.

1. Sign in as vacancy owner, save a **draft**, open **Interview plan**, configure Technical/HR interviews and save. Return to the vacancy, review the saved plan and publish; publication locks it, including an empty plan. Other HR/published vacancies show readable inspection, not disabled authoring. For an already-published empty-plan demo, create another draft rather than modifying frozen data. Do not reset/reseed existing records.
2. Open application → **View screening** → **Screening decision**, choose Preselect and confirm. Then use recruitment's booking dialog for an existing staff interviewer (`demo.interviewer@example.test`), date, half-hour start, duration and link/location. Another planned interview can be booked ahead without overlap. Other HR may schedule, not edit the owner's draft plan/finalize owner decisions. Screening sends a generic candidate notice, not internal review/assessment data.
3. Sign in as interviewer → **My interviews** / **Inbox**. Assigned appointment exposes its application/CV only. Request rescheduling; owner/creator get an inbox message. HR reschedules/reassigns; old assignee loses candidate access. Agenda is grouped by local date with Monday-first weeks: Upcoming excludes already-started entries; Past includes them, with **Awaiting feedback only** for unassessed appointments. Cancelled is separate.
4. At/after scheduled start (not before), interviewer submits notes + optional score + Pass/Fail, then confirms. Pass is final feedback, not acceptance. Fail is **terminal**: application Not selected, all remaining unfinished interviews cancelled with explicit failure cause; no reopening or further scheduling. Use a fresh posting/application for another attempt. Do not submit Fail on manual data unless that terminal result is intended.
5. Owner reviews interview results. With configured interviews, all must pass before explicitly recording Offer; with none, preselection enables that same owner confirmation directly. Hired is a separate confirmation after Offer, never automatic. Screening notices exist, but Offer/Hired/email effects remain unimplemented; candidate submission stays immutable and assessments private.
6. **Inbox is in the top bar only** and defaults Unread. Normal View interview/application navigation marks read before opening; **All messages** shows read ones. Native modified/new-tab links do not prove a completed read request. The separate interview-retention command, if run, deletes interview notifications seven days after first read, never unread/business records; screening notices have no expiry. No retention runner, chat or reminders is implied.
   Alternatively use **Mark as read** without navigation. Owners receive requests/feedback, not booking copies. Candidate screening notices and CSV import are implemented; migrations 007/008 are applied locally, broader integration remains pending. Other candidate effects remain planned. Original extraction errors and saved HR corrections stay distinct—correction does not rerun or rewrite extraction.

No seeded interview results are fabricated for this checkpoint. Native date/file/PDF UI requires user testing. Automated synthetic clock fixtures in interviews:check are not a runtime bypass. Details/known bounds: [interview contract](../contracts/interview-api.md).

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
1. Login demo.hr. Vacancy rows show one title link, location/status and quiet owner metadata with `(you)`. Use status/owner/sort filters, **My drafts** or **All vacancies**; options/count/page are dataset-wide, not current-page filtering.
2. Open the RenderCV vacancy → Applications. Four scenarios: Casey successful/completed review; Jordan simulated failed extraction; Drew pending; Avery successful empty list.
3. Use independent **Work to do** / **Recruitment status** and sort controls; work filters require backend support. Detail retains original processing/review facts. Compact **decision export** uses the undecided matching set with effective skill columns; separate diagnostic export-all still includes every vacancy application. Neither early screening nor export requires completed review.
4. Open application information/documents and use the labelled preview icon. In human review, authorized source-PDF bytes sit beside per-field correction controls; completion/release have separate confirmations. Download remains available; non-PDFs are download-only. Native browser PDF viewing support varies.
5. Save a skills correction: **latest saved value** appears prominently and is used in export. Original extraction/evidence stays unchanged under its expandable section. Refresh/relogin preserves the correction. Explicit null differs from empty skills.
6. Latest editor and save time are visible. Revision remains an internal concurrency counter, **not historical versions**; technical counters are not shown in normal review UI.
7. Login demo.hr2 or admin and continue shared review. Completion is optional and never candidate approval/export gating. Test interviewer exclusion separately.

## Fresh vacancy → candidate → mock processing
1. As recruiter, create/edit a draft, configure questions/extraction and its optionally empty interview plan, then review/publish. Publication locks all configuration; unsaved form changes disable publishing. Appointment arrangements remain separately editable.
2. Login candidate, inspect the vacancy summary, then choose **Apply for this role** to reach the checked `/apply` form. Fill/upload a RenderCV PDF and submit. Existing applicants get **View your application**, not another mounted form; My applications opens the submission first. Racing duplicate requests still return the immutable existing submission. For another run use another candidate/vacancy, not a reset.
3. Login recruiter and open the new application. Copy its UUID from the URL (`#/applications/UUID`); operator commands now live only in this guide. Run:
```sh
pnpm --filter @recruitment/api demo:process APPLICATION_UUID success
```
Choose failure/empty instead for those recorded outcomes. Refresh afterward. Unattempted tasks only; refuses overwriting results. Actual source identity/hash/args verified, real persisted executor used. **No parsing/AI**: success chooses first two configured skill names, regardless of CV text. Every result retains fixture provenance. No automatic poller; ordinary submissions stay pending until run. Underlying processing:run and recovery: [processing contract](../contracts/processing-review-api.md).

For a vacancy with **no extraction tasks**, submit normally: no processing/review action is needed. Review marker auto-completes as not applicable; no reviewer/date or candidate approval implied. Staff screens omit extraction controls; mixed tables show a dash, and review-status filters exclude these records. PDF preview/download and CSV remain available. No bulk “review applications” decision is introduced.

## Staff outside demo
Operator-local staff:provision creates/updates staff roles and revokes sessions. Optional STAFF_INITIAL_PASSWORD environment variable sets a password (don't put secrets in CLI arguments/history); without it use password reset to establish one. Verify email ownership before normal login. No public HR/admin signup or staff management UI. See [candidate access](../contracts/candidate-access.md).

## Verification
Checks and partial user-reported paths are recorded in [status](../status.md); no fresh test run is claimed by this guide. Migrations 007/008 and initial lifecycle seed/file checks were executed locally, not a full workflow/privacy/race pass. Native PDF/layout/dialog/history and spreadsheet CSV checks remain manual; focused DOM evidence does not establish them. Merge/readiness alone does not establish backend work-filter activation. Report sanitized errors, never credentials/real CV data; the guide is not authorization to restart services, reset data or execute providers.
