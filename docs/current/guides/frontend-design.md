# Frontend design — durable UI baseline

Use this guide before changing existing screens. It records the implemented presentation choices to preserve, not an event log or permission to implement the remaining backlog. API contracts remain authoritative; [planned follow-ups](../../plan/ui-ux-overhaul.md) and [verification gates](../../plan/tasks.md) are separate.

## Design and interaction rules

- Start with **entity + actor + intent**: inspecting information, navigating and performing an action are different purposes. Put relevant actions beside their section; do not expose every related backend command on one page. Examples are principles, not an exhaustive checklist.
- Keep a light slate canvas, restrained white working surfaces, thin neutral borders, dark readable type and one blue action accent. Prefer whitespace/short boundaries to nested cards and pill stacks. Use semantic positive/destructive/attention/muted colours only with readable text or icons.
- Use native links for navigation, normally the entity's displayed title/name. Avoid duplicate Open links, clickable div rows and mutation-like navigation buttons. Preserve keyboard, modifier-click and new-tab behavior.
- Use labelled SVG buttons for refresh, preview, reorder and removal. Retain text for ambiguous/destructive actions. Refresh targets must not shrink or clip; statuses must not wrap within words. Keep visible focus and usable narrow-screen layouts.
- Badges are not universal wrappers: show only useful primary state signals; keep secondary processing/review/ownership facts quiet or expandable. Prefer names and optional contact disclosures to repeated mailto links. Do not hide essential information behind hover alone.
- Hide unauthorized or stage-irrelevant controls rather than presenting a disabled administrative console or repeated permission lectures. Ownership remains discoverable. Pending/invalid/prerequisite/navigation limits may meaningfully disable controls; UI visibility never grants authority.
- Focused action/confirmation/preview flows use labelled native dialogs, cancel-first focus, idle Escape, background inertness and focus restoration. They yield their top layer to the shared Stay/discard warning without losing local input. File selection/review tables may remain inline within a wizard; final confirmation and whole-file errors are dialogs.
- Keep technical keys, revisions, raw protocol/provenance and diagnostic dumps out of the main scanning surface. Secondary diagnostics and concise truthful fixture labels remain available. Never invent success, evidence, results or real-provider validation.

Implementation stays React/Vite/hash routing with local styled components and native controls. No framework or component-library migration is selected.

## Vacancy list — UX-DENSITY-a

- One primary position-title link per row. Staff columns: Position, Location, Status; quiet `Owner: Alex (you)` metadata, with email only as a missing-name fallback. Draft / Published / Closed use readable text and a supplementary dot, not stacked ownership/revision pills. Closed is muted, not destructive.
- Staff filters: status, All owners / Owned by me / named owner, sort; My drafts sets own + draft, All vacancies clears owner/status without resetting sort. Owner choices come from a staff-only dataset query, never the current page. Owner/status predicates apply before total/pagination. These are convenience filters, not edit permissions.
- Candidate/guest rows contain only public Position / Location. Signed-in candidates additionally have Not applied yet, applied server-side before count/page. No owner/revision/configuration leak or staff controls.

## Vacancy inspection and editing — UX-DENSITY-b

Only an authorized draft owner gets the editor. Other HR and published/closed owners see readable job/form/automation information, not disabled authoring controls. Owner metadata is concise; no routine revisions or ownership-policy lecture. Drafts retain interview-plan configuration, but not irrelevant application/results navigation. Published/closed Recruitment groups the Applications and Interview plan & results links.

Publication reviews the **saved** plan, including empty, then confirms both separate counters. Unsaved changes block publication. Publish/close dialogs explain irreversible consequences; close stops new intake, not ongoing recruitment. No owner override, shortcut edit bypass or reopening. [Contract](../contracts/vacancy-api.md).

## Application inspection — UX-DENSITY-c

- Submitted information/documents first; distinct Automated results, Human review and relevant screening/recruitment navigation after it. Use the vacancy title as its single related link, local submission time and a contact disclosure. Back targets all/own Applications, not an invented origin/history stack.
- Staff list has five primary columns: Candidate, Position, Submitted, Recruitment status, Work to do. Work and recruitment are independent factual dimensions; expandable details retain original processing/review/correction facts. Shared list/count/export predicates are server-side. Review readiness is never a screening gate.
- Candidate list links primarily to the submitted application and displays the same allowlisted public status as detail. No internal review/work/reason/assessment metadata is published. [Public mapping](../contracts/application-api.md#candidate-public-status).
- Documents name their source and use authenticated preview/download. PDF preview sits beside associated information/correction fields on wide screens and stacks on narrow screens. Preserve byte validation, access revocation and blob-URL cleanup. Vacancy-wide decision files belong to the vacancy list, not one applicant's detail.

## Screening and recruitment dialogs — UX-DENSITY-d

Initial screening, later rejection, Offer, Hired and new booking are separate focused intents. Screening starts without a selected outcome; explicit confirmation explains finality, review/processing locks and the generic candidate notice. Keep optional initial versus required later rejection reasons distinct.

Only the owner sees relevant Offer/Hired controls. Zero configured interviews permits explicit Offer after preselection; otherwise all configured interviews must pass. Hired remains separate; no automatic Offer or fake booking. Actual interview results and unscheduled configured steps remain inspectable. [Authority and progression](../contracts/interview-api.md).

## Review and appointment dialogs

- Human review opens a source-PDF/correction editor. Keep per-field explicit saves; completion is a separate confirmation and requires no unsaved corrections. Remove manual Mark in review / Reset to pending buttons; opening a review performs no write. Original machine results, saved HR corrections and local conflict drafts remain distinct.
- Continue with manual review is the existing explicit release operation. Its own confirmation explains permanent processing closure, unchanged results/unknown unfinished values, independent screening and possible already-admitted provider cost. It is not extraction success, completed review or billing cancellation. Do not offer release again once unavailable.
- Appointments lead with browser-local time, duration and zone, then candidate/responsible interviewer, meeting/preparation, actual feedback and optional submitted documents. Contacts and rare standalone cancellation are secondary. Reschedule/reassign, request rescheduling, feedback and cancellation open focused dialogs. Feedback begins without a default Pass/Fail and has a final review/confirmation step; submitted feedback stays immutable.
- Preserve assigned/time/state/owner rules, separate workflow/review/appointment revisions and server availability. Dirty drafts use Stay/discard; pending requests block leave. Unknown/conflicting writes require explicit refresh and reconfirmation, retaining local proposals for inspection/reapply. Never save, merge or retry automatically.

## Interview views and displayed time

Monday-first toolbar: View, previous / This week / next, visible Monday–Sunday range. Upcoming shows only starts **after server time**, including within the current week, earliest first. Past shows non-cancelled interviews whose start has arrived, including ongoing interviews, newest first; Awaiting feedback only narrows it to unassessed appointments. Cancelled stays separate and covers either time direction. No rolling-90-day UI or redundant Scheduled pills; retain actual Pass/Fail and rescheduling attention.

Past navigation stops at the current week; Upcoming cannot browse earlier weeks. Time/assignment/status predicates precede count/page. Displayed times are browser-local; scheduling converts the local selection to an ISO instant plus IANA zone and rejects nonexistent local times. UTC-labelled submission-date filters retain their distinct API contract. No polling or timed state mutation is implied. [Agenda context/legacy-link behavior](../contracts/agenda-navigation.md).

## Candidate entry

A vacancy is a summary, not an application form. Apply leads to a separate checked `/apply` entry. Both summary and direct entry check this candidate's existing submission before showing a form; existing applicants get View your application only. Loading/error never opens an unchecked form. Closed intake may show the applicant's authorized frozen snapshot, not reopen submission. Backend transactional duplicate return remains the multiple-tab backstop. [Contract](../contracts/candidate-access.md).

## List filter memory

Retain useful filters/sort/page in account-ID + role-scoped tab-session storage: applications (all-list and each vacancy separate), vacancies (status/owner/sort/Not applied yet), and Inbox (Unread/All + page). Clear on logout, unauthenticated initialization or identity/role changes. Validate restored values, reset page when filters change, and use fresh server totals to correct stale pages. Storage failure falls back safely; lists always fetch authorized data.

No private record payloads, answers/files, editor/import/dialog drafts, credentials or stored authorization. No elaborate custom history, exact-window restoration, return-route stack, automatic save or retry. Existing agenda query/session/scroll behavior remains a bounded exception, not a model to expand to every list.

## Decision files and form authoring

- Keep compact undecided decision export separate from detailed diagnostic export-all. Include useful answers/contact identity, submission date, vacancy/application/authenticated document links, review summary and effective results separated by configured field/type. Current skills use separate Yes/No/Unknown columns; explicit HR overrides, including unknown, win over machine results. Preserve successful empty versus unavailable/failed/pending and compact fixture provenance. [Exact contract](../contracts/screening-api.md).
- Import has Upload / Review selection / Confirm stages. Group valid duplicates with source record numbers; matching outcomes are prefilled but excluded until explicitly included, conflicting outcomes start Undecided. Explicit retained source choice preserves reasons. Bar invalid/mismatched rows, distinguish structural CSV errors, grey already-decided/excluded entries, always with text/icons. Whole-file errors use a dialog and preserve prior staging. New-tab application links require server-resolved identity. Fresh eligibility and atomic apply remain authoritative; no identity repair, silent merge or uncertain-outcome replay.
- Builder leads with readable question types and optional Automated document checks / Skills to check. IDs, answer keys, stored choice values, result prefixes and additional byte limits are secondary disclosures, not removed or rewritten. New checks do not invent skill choices or execute a provider. Preserve stable IDs, explicit saves and publication locks.
- Account email is fixed/read-only in builder, preview and candidate intake, and described in staff inspection. Preview uses a labelled example; real intake shows the signed-in candidate email. It is not a custom answer or client-writable identity: the backend freezes session email. Do not silently delete existing custom questions.

## Verification and scope

Build/static and focused offline checks are not native-layout/accessibility, authenticated privacy, real SQL/export/import/race or full regression proof. Older DOM fixtures/labels need adaptation; all pending gates remain on the [board](../../plan/tasks.md). Keep dated evidence in [status](../status.md), not appended to this guide. No browser automation, provider execution, data reset, polling, framework migration, merge or push follows from these design rules.
