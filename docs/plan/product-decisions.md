# Requested product changes and decisions

All changes below are unimplemented unless explicitly described as existing. Current baseline: [workflows](../current/workflows.md). This checkpoint replaces earlier scattered feedback without treating assistant suggestions as user approvals.

## Readiness, review and progression

**[selected direction]** HR needs understandable progression before preselection: submitted → processing → ready to review → reviewed → preselected/rejected. After preselection comes the configured interview pipeline. These are journey labels, not a decision that every item becomes one database stage enum.

- Successful processing or a normal, persisted parse/extraction failure makes the application ready for HR review; unknown/error values display cleanly. A service that is stopped, an interrupted operation or queue/infrastructure problem should not look like completed work.
- Whoever can review can manually release stalled work into review. Shared admin/recruiter review with conflict protection is selected; no exclusive claim/assignment introduced. Existing revision protection is sufficient in principle; improve conflict/refresh UX. Taking charge of an application remains a possible later discussion, not selected behavior.
- HR may complete review with partial/unavailable values. Forced readiness must not fabricate successful extraction, negatives or human corrections.
- **[needs decision]** model readiness as derived state or persisted screening status; exact retryable/terminal failure classification; how force-release fences in-flight results and affects later review completion. Automatic readiness must never regress preselected/interview/final states.
- Candidate answers/files remain static as today; at minimum preselection freezes application content. Separate HR review is allowed. Whether review edits remain available after preselection and how they affect exported/imported decisions needs definition; no answer/file reupload path is approved.
- Shared review, manual selection and owner finalization differ: current preselection is shared HR; Offer/Hired owner-only. Do not silently make every decision owner-only.

## Publication and vacancy lifecycle

**[selected direction]** Publish only after selected extraction tasks are configured and an interview pipeline is prepared; published vacancy should then be noneditable because applications flow through it. Today only intake freezes at publish, pipeline at first scheduling.

**[needs decision]** Are extraction tasks optional (including zero tasks)? Is at least one interview step sufficient, or are instructions/assignees required? Scheduling currently assigns a person per application, not a participant on the step definition. Freeze scope, legacy published/no-pipeline records and fixture migration need explicit policy. If pipeline setup stays late, preselection would instead need a gate; that is an alternative, not the chosen default.

**[later / needs decision]** Archive applications wherever they are when a vacancy closes/is filled. Define close-intake vs finish-recruitment vs archive, visibility, pending jobs and scheduled interviews. Current close only stops submissions; it must not be silently repurposed.

## Notifications, counters and email

**[selected direction]** Separate three UI mechanisms and email:

- Toast: immediate confirmation to the actor. Significant personal events may also warrant a notification, but no automatic actor copy for every action.
- Notification tray: information a person needs for their responsibilities or their own application, avoiding bulk spam. Rename current Inbox terminology where appropriate; icon always present even with zero unread, unread dot independent of workload counts.
- Workload indicators on HR Applications navigation/filters: counts of ready reviews, possibly preselected applications with unscheduled interviews. No per-application ready-for-review tray message.
- Email: independently selected recipients/channel policies. Do not make a notification helper automatically send email too. Existing identity email stays; recruitment emails/external bulk-mail support deferred.

**Candidate direction:** receipt confirmation (toast or toast+notification remains to decide), preselection, interview schedule/reschedule/cancellation, public interview progress/rejection and final positive outcome. Start in-app; mail later. Timeline on own application, mindful of multiple named interview steps. Appointment title, date/time and place/link visible. Internal extraction, review and assessment notes remain private. Wording for all-steps-passed/Offer must be generic to employment/contract arrangements; do not promise a signed contract or imply every Pass is acceptance.

**Staff direction:** assignment and scheduling changes notify involved responsible staff; candidate also needs appointment changes. Exact feedback/request recipients, initiator inclusion and importance rules need an explicit scenario matrix. Owner copies of every application decision can be noisy; do not adopt that default. Batch actions should not create 100 actor notifications.

**Tray lifetime:** read and hide are separate. User can explicitly hide; no default delete-after-read cleanup in the desired model. Optional per-kind expiry can wait. Hide is not an audit deletion or proof a task is complete. Existing seven-day retention remains operational until a future implementation checkpoint deliberately changes it; no process stop authorized by these docs.

**Work counters:** user accepts browser requests at login and periodic intervals → backend cache-first Redis → on miss query PostgreSQL, repopulate with TTL, return counts. Redis itself does not push to the browser. No WebSocket or counter-maintenance worker selected. **[needs decision]** TTL/poll cadence, HR scope (shared/all vs owned vacancies), count definition for unscheduled steps, stale-data/error handling. A count plus filter is preferred over another complicated workflow screen. Existing pipeline steps are all interviews; several can be scheduled ahead.

**Reported gap:** candidate expected a preselection notification after switching roles in the same tab. Current candidate routes/tray do not implement it. Other missed cases are not precisely reproduced; user will retest. Test logout/login cache isolation, links and recipient visibility rather than assuming retention was the cause.

## Export, import and reversal

**[selected direction]** Offline-selection export contains reviewed applications; HR decides whether partial fields are adequate. Exclude already preselected/rejected records. This changes today's ungated export-all contract; do not remove existing diagnostic export without deciding whether a separate selection export is needed.

- Desired filters: dates, previously exported/not exported, search; regex is only a possible request, with syntax/performance unresolved. Externally apply complex language/math rules, spreadsheets, agents or manual selection; no in-platform arbitrary ranking engine.
- Export history/tracking is **deferred**: no accepted batch-ledger or boolean design yet. Define whether downloaded/produced/retried counts as exported and whether it is shared or per HR before schema work.
- Import a small decision CSV, not all reviewed columns: application ID plus optional/asserted candidate name/email; chosen business actions `preselected` / `rejected`. Name/email help catch foreign/hallucinated identities, never overwrite stored candidate data. Exact CSV shape/required assertions still open.
- HR-friendly preview: parse rows, highlight problematic ones, allow action/selection adjustments, then apply or cancel. Completely unparseable upload gets a clear error. Missing rows never imply rejection.
- Store rejection cause to distinguish screening rejection from interview-stage rejection. Exact internal stage key/name migration remains open; current key is `not_selected`.
- Manual reversal is desired, not automatic batch undo. **[needs decision]** who can reverse screening decisions, until when, what stage to restore, what happens to schedules/candidate notifications, and whether interview rejection can ever reverse. Current terminal-Fail policy must remain until expressly changed.
- Preview is not concurrency authorization: recheck vacancy ownership/scope, revisions and allowed transitions at apply. Atomic whole-file vs selected-valid-rows execution, duplicate/conflicting IDs, identity mismatch, repeat-import idempotency and reporting need a short contract discussion.

## Capability and revision design

**[selected direction]** Static role→capability mapping plus resource/ownership resolution, e.g. edit own draft, review shared application, assess assigned interview. Small Nest decorator/guard plus reusable policy functions; no new permission framework dependency selected. Existing cookie session supplies trusted user ID/role; no JWT migration authorized. Capabilities should not encode stale ownership into a long-lived token.

**[proposal]** Coarse guard checks role eligibility; service evaluates record-level authority and prerequisites inside the mutation transaction. API exposes action availability/reasons for UI; server remains authoritative. Avoid a global switch growing into every feature's business logic.

**[selected direction]** Frontend dirty guard + backend no-op detection (`revisionedUpdate` helper direction). Keep concurrency counters; no revision history/browser needed. Reupload would count as a change wherever such a mutable upload feature exists; submitted documents are currently immutable. Decide stale-but-identical requests, semantic normalization, no-op effects and generated pipeline IDs before a universal helper. UI/backend double validation is appropriate; duplication inside UI should be extracted locally.

## Data, fixtures, testing and sequencing

- Current records are fake/demo. User permits future schema redesign and scoped fixture regeneration; large departures still require review. This is not permission to wipe all databases/volumes, overwrite unrelated/manual work or reset Jev counters. Plan target/ownership and a consistent ER model first.
- Prefer relational IDs, ownership, foreign keys, uniqueness and transition-critical guarantees. JSONB suits dynamic typed results/answers/corrections. Do not invent full review history because a table example mentioned generations; detail deferred.
- Backend-first resource guarding: existing Jev safeguards remain fixed; storage should eventually have generous individual and tighter global quotas with typed errors to UI. Global quota values/accounting and any dashboard are later decisions; no new storage gateway is assumed necessary.
- Testing preference: avoid repeated broad runs during planning/refactor churn. Use meaningful isolated checks where needed and a checkpoint-level suite after coherent changes. No paid/limit tests without explicit separate consent. Database integration checks create data; they are not read-only checks.
- Future fixture/data service (standalone or backend-invoked) and an overarching demo orchestrator are targets, not implemented. Infrastructure setup/reset/reseed actions need explicit scope; no automatic startup reset.
- Docs first, then obstacle/design discussion, then small branch/worktree checkpoints, local merge and worktree removal. No remote push.
