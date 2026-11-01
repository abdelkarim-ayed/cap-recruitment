# Requested product changes and decisions

All changes below are unimplemented unless explicitly described as existing. Current baseline: [workflows](../current/workflows.md). This checkpoint replaces earlier scattered feedback without treating assistant suggestions as user approvals.

## Readiness, review and progression

**[selected direction]** HR-facing progression: submitted → processing → ready for review → ready for preselection → preselected/rejected. No-task applications go directly to ready for preselection, without implying a human reviewed them. After preselection comes the configured interview pipeline. These are journey labels, not a decision that every item becomes one database stage enum.

- Successful processing or a normal, persisted parse/extraction failure makes the application ready for HR review; unknown/error values display cleanly. A service that is stopped, an interrupted operation or queue/infrastructure problem should not look like completed work.
- Whoever can review can manually release stalled work into review. Shared admin/recruiter review with conflict protection is selected; no exclusive claim/assignment introduced. Existing revision protection is sufficient in principle; improve conflict/refresh UX. Taking charge of an application remains a possible later discussion, not selected behavior.
- HR may complete review with partial/unavailable values. Forced readiness must not fabricate successful extraction, negatives or human corrections.
- **[needs decision]** model readiness as derived state or persisted screening status; exact retryable/terminal failure classification; how force-release fences in-flight results and affects later review completion. Automatic readiness must never regress preselected/interview/final states.
- Candidate answers/files remain immutable after submission. HR corrections stay separate and editable during review, then lock when HR completes review. No reopening/correction-history UI is planned. Completion may retain partial/unavailable values.
- Processing is not revision-driven: never rerun successful tasks or start extraction after review completion/selection. Manual release closes processing eligibility; fence late saves so they cannot overwrite or invalidate completed review. Claim/check/save must be transactional, not a frontend check or a check-before-call alone. Uncertain paid attempts must not automatically retry.
- Shared review, manual selection and owner finalization differ: current preselection is shared HR; Offer/Hired owner-only. Do not silently make every decision owner-only.

## Publication and vacancy lifecycle

**[selected direction]** Publish only after selected extraction tasks are configured and an interview pipeline is prepared; published vacancy should then be noneditable because applications flow through it. Today only intake freezes at publish, pipeline at first scheduling.

**[selected direction]** Zero extraction tasks is valid. Publish requires a valid form, valid selected tasks if any, and at least one interview step; configuration freezes at publication while appointment schedules remain editable. **[needs implementation design]** exact step validation, legacy published/no-pipeline handling and fixture migration. Assignees currently belong to application appointments, not step definitions; no publish-time participant requirement is selected.

**[later / needs decision]** Archive applications wherever they are when a vacancy closes/is filled. Define close-intake vs finish-recruitment vs archive, visibility, pending jobs and scheduled interviews. Current close only stops submissions; it must not be silently repurposed.

## Notifications, counters and email

**[selected direction]** Separate three UI mechanisms and email:

- Toast: immediate confirmation to the actor. Significant personal events may also warrant a notification, but no automatic actor copy for every action.
- Notification tray: information a person needs for their responsibilities or their own application, avoiding bulk spam. Rename current Inbox terminology where appropriate; icon always present even with zero unread, unread dot independent of workload counts.
- Workload indicators on HR Applications navigation/filters: counts of ready reviews, possibly preselected applications with unscheduled interviews. No per-application ready-for-review tray message.
- Email: independently selected recipients/channel policies. Do not make a notification helper automatically send email too. Existing identity email stays; recruitment emails/external bulk-mail support deferred.

**Candidate direction:** submission receipt notification plus immediate confirmation; preselection notification; interview scheduling/change/cancellation with title, date/time and place/link. A Pass message names the completed step and says the application continues, not that another appointment is already booked. Rejection communicates the outcome without internal notes. All-steps-passed alerts HR to finalization availability; the candidate gets the positive final-decision message when the owner records Offer, then the recorded Hired status. Use generic wording appropriate to different contract arrangements, not a promise of a signed contract. Start in-app, mail later; own-application timeline supports multiple named steps and hides internal extraction/review/assessment notes.

For the bounded version prefer rescheduling over standalone appointment cancellation: current cancelled steps cannot be replaced. Avoid standalone cancellation as a normal HR action; rejection still cancels remaining appointments internally and should produce one clear candidate outcome, not several redundant cancellation notices. Shared HR schedules, one responsible interviewer submits immutable final feedback; conflict and overlap checks remain.

**Staff direction:** assignment and scheduling changes notify involved responsible staff; candidate also needs appointment changes. Exact feedback/request recipients, initiator inclusion and importance rules need an explicit scenario matrix. Owner copies of every application decision can be noisy; do not adopt that default. Batch actions should not create 100 actor notifications.

**Tray lifetime:** read and hide are separate. User can explicitly hide; no default delete-after-read cleanup in the desired model. Optional per-kind expiry can wait. Hide is not an audit deletion or proof a task is complete. Existing seven-day retention remains operational until a future implementation checkpoint deliberately changes it; no process stop authorized by these docs.

**Work counters:** user accepts browser requests at login and periodic intervals → backend cache-first Redis → on miss query PostgreSQL, repopulate with TTL, return counts. Redis itself does not push to the browser. No WebSocket or counter-maintenance worker selected. **[needs decision]** TTL/poll cadence, HR scope (shared/all vs owned vacancies), count definition for unscheduled steps, stale-data/error handling. A count plus filter is preferred over another complicated workflow screen. Existing pipeline steps are all interviews; several can be scheduled ahead.

**Reported gap:** candidate expected a preselection notification after switching roles in the same tab. Current candidate routes/tray do not implement it. Other missed cases are not precisely reproduced; user will retest. Test logout/login cache isolation, links and recipient visibility rather than assuming retention was the cause.

## Export and final selection wizard

**[selected direction]** Offline-selection export contains applications ready for preselection: completed review or no tasks. HR decides whether partial fields are adequate. Exclude already preselected/rejected records. This changes today's ungated export-all contract; do not remove existing diagnostic export without deciding whether a separate selection export is needed.

- Desired filters: dates, previously exported/not exported, search; regex is only a possible request, with syntax/performance unresolved. Externally apply complex language/math rules, spreadsheets, agents or manual selection; no in-platform arbitrary ranking engine.
- Export history/tracking is **deferred**: no accepted batch-ledger or boolean design yet. Define whether downloaded/produced/retried counts as exported and whether it is shared or per HR before schema work.
- Import a small decision CSV, not all reviewed columns: application ID plus optional/asserted candidate name/email; chosen business actions `preselected` / `rejected`. Name/email help catch foreign/hallucinated identities, never overwrite stored candidate data. Exact CSV shape/required assertions still open.
- Editable selection wizard: parse rows, highlight problematic ones, and let HR remove invalid rows or manually exclude valid ones. HR can switch proposed rejected rows to preselected and vice versa, individually or using multiselect/bulk buttons. Kanban-like decision groups are an interaction idea, not a drag-and-drop requirement. Excluded rows are unchanged, not rejected. Completely unparseable upload gets a clear error.
- Before final confirmation, show included outcomes, exclusions and unresolved errors clearly; permit further edits or cancellation without persisted decisions/notifications. Invalid rows cannot be forced through by changing their proposed outcome. Candidate identity/answers/review values are never overwritten by the wizard. Missing rows never imply rejection.
- Store rejection cause to distinguish screening rejection from interview-stage rejection. Exact internal stage key/name migration remains open; current key is `not_selected`.
- **[selected direction, supersedes earlier reversal request]** Applied selection decisions are final: no manual reversal or batch undo. Flexibility belongs in the pre-commit wizard; notifications to candidates make later undo misleading/complex. This removes decision reversal only, not HR extraction corrections during review. Preselected applicants continue into the interview pipeline; finality here means no undo of that selection, not stopping later progression/rejection.
- Preview is not concurrency authorization: recheck vacancy ownership/scope, revisions and allowed transitions at apply. Atomic whole-file vs selected-valid-rows execution, duplicate/conflicting IDs, identity mismatch, repeat-import idempotency and reporting need a short contract discussion.

## Capability and revision design

**[selected direction]** Static role→capability mapping plus resource/ownership resolution, e.g. edit own draft, review shared application, assess assigned interview. Small Nest decorator/guard plus reusable policy functions; no new permission framework dependency selected. Existing cookie session supplies trusted user ID/role; no JWT migration authorized. Capabilities should not encode stale ownership into a long-lived token.

**[proposal]** Coarse guard checks role eligibility; service evaluates record-level authority and prerequisites inside the mutation transaction. API exposes action availability/reasons for UI; server remains authoritative. Avoid a global switch growing into every feature's business logic.

**[selected direction]** Frontend dirty guard + backend no-op detection (`revisionedUpdate` helper direction). Keep small concurrency counters, not historical versions; hide technical counter numbers from normal UI. Under a row lock, check authority and expected counter before comparing normalized editable fields. Current identical saves return unchanged without increment/time/effects; stale saves still require refresh even if identical. Actual changes increment once. Shared HR users see latest editor/save time; preserve unsaved input on conflict for manual reapplication after refresh, with no automatic merging or exclusive claim workflow. Pipeline equality must be checked before regenerating step IDs. UI/backend double validation remains appropriate.

## Local mail capture and viewer (later)

Selected simple layout: `mail-outbox/<email-address>/<timestamp>.email`, UTF-8 plain text with `Metadata-Name: value` header lines, a `---` separator, then body. Include recipient, subject and capture timestamp; no HTML/read-state lifecycle. Keep the address recognizable as a safe single directory component. UUID filenames are unnecessary; exclusive creation and advancing to an available timestamp prevents simultaneous capture overwrites. Viewer lists addresses and messages. Current capture still stores only the latest message per hashed address; history/layout change is future work, not implemented by this decision. Recruitment mail remains independent of notifications.

## Data, fixtures, testing and sequencing

- Current records are fake/demo. User permits future schema redesign and scoped fixture regeneration; large departures still require review. This is not permission to wipe all databases/volumes, overwrite unrelated/manual work or reset Jev counters. Plan target/ownership and a consistent ER model first.
- Prefer relational IDs, ownership, foreign keys, uniqueness and transition-critical guarantees. JSONB suits dynamic typed results/answers/corrections. Do not invent full review history because a table example mentioned generations; detail deferred.
- Backend-first resource guarding: existing Jev safeguards remain fixed; storage should eventually have generous individual and tighter global quotas with typed errors to UI. Global quota values/accounting and any dashboard are later decisions; no new storage gateway is assumed necessary.
- Testing preference: avoid repeated broad runs during planning/refactor churn. Use meaningful isolated checks where needed and a checkpoint-level suite after coherent changes. No paid/limit tests without explicit separate consent. Database integration checks create data; they are not read-only checks.
- Future fixture/data service (standalone or backend-invoked) and an overarching demo orchestrator are targets, not implemented. Infrastructure setup/reset/reseed actions need explicit scope; no automatic startup reset.
- Docs first, then obstacle/design discussion, then small branch/worktree checkpoints, local merge and worktree removal. No remote push.
