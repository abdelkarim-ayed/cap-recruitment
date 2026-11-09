# Intent-led UI/UX overhaul — implementation briefing

Consolidated user direction, 2026-11-09. **Requested design, not delivered behavior or blanket implementation approval.** Earlier reports remain on the [task board](tasks.md); detailed export/import proposals and the exact CSV are in [HR decision-file feedback](hr-export-import-ux.md). Use this briefing to choose a bounded checkpoint in the next session. The HR examples are non-exhaustive: apply their principles across roles, not their exact controls indiscriminately.

## 1. Design around an entity and an actor's intent

People arrive to **inspect information**, **navigate to a related entity**, or **perform a particular action**. A page must make those purposes easy to distinguish rather than display every related backend operation together.

- Primary entities: vacancies and applications; related views include appointments/agenda, submitted answers/documents, extraction results/human review, screening and recruitment decisions, and notifications.
- Role and ownership change the available actions and information hierarchy, not the underlying resource identity or backend authority. HR inspection, vacancy-owner editing, candidate application tracking and assigned-interviewer feedback are different journeys.
- A detail header identifies the entity, its genuinely useful status and compact metadata. Separate navigation from metadata and actions visually; use a consistent location/style for page-wide/back navigation. Put section-specific actions beside their section, not in a general collection at the top/bottom simply because they were added there first.
- Separate sufficiently different intents into distinct named sections, pages, or dialogs/wizards. Do not require a page per backend concept or put every task on a single long page. Use subtle boundaries/spacing or a slightly contrasting surface, not another card/pill for every fact.
- Inspecting and editing a vacancy should be recognizably different modes. Published/closed inspection must not resemble a disabled draft editor. An owner edit icon may lead to the draft editor; inspection remains available to other authorized HR without a lecture about ownership.
- Keep consistency across related entities: primary link/row behavior, related-entity links, section headings, metadata, action placement and dialogs should be predictable.

## 2. Visual and interaction language

| Element | Direction |
| --- | --- |
| Navigation | Use real links with a distinct, generally lighter style than mutation buttons. Link an entity's displayed name/title instead of repeating it elsewhere as a second navigation button. A row/card may have a large primary link target; support keyboard, open-in-new-tab and modifier-click. Do not implement an inaccessible clickable div or nest conflicting interactive targets |
| Mutation actions | Give the current intent a clear primary action; place secondary/destructive actions consistently nearby. Use accessible semantic icon buttons for compact actions such as edit, refresh, preview, reorder and remove; tooltip/accessibility name required, text where meaning would otherwise be ambiguous |
| Status/metadata | Badges are not a universal wrapper. Retain readable genuine statuses such as Draft/Published; ownership can be `Owner: Alex (you)`, counts can be plain text. Aim for one, at most two useful primary state signals per row, not three competing stacked pills. Icons, type weight, a subtle dot or colour may substitute where semantically clear |
| Colour | Use purposeful consistent meaning: positive/proposed-preselect, destructive/proposed-reject, attention/unresolved, muted/inactive. Supplement with text/icon/shape; colour alone must not communicate state. Avoid decorative per-field colours |
| Email/contact | Do not repeat mailto hyperlinks throughout the interface. Prefer names as identity and a compact click/focus/hover contact affordance that exposes/copies email when useful. It must work with keyboard/touch, not hover only; copy feedback should be concise |
| Notifications | Distinguish unread/read visually, e.g. dot, weight and subdued read styling, rather than adding another status pill everywhere. The top notification affordance should use the same visual vocabulary. Read and hide remain different concepts; do not implement future hide/retention changes incidentally |
| Help | Use concise human wording; optional small `?` affordances for unfamiliar concepts. Help must be focusable/tappable and available without relying on hover. Do not move a mandatory destructive consequence into a tooltip |
| Dialogs/wizards | Confirmation/preview/short focused workflows should be actual foreground dialogs, not surprising inline page sections. Label them, contain/restore focus, make the background inert, support keyboard and appropriate Escape/cancel. Keep dangerous-action details and explicit confirmation visible; never assume a visual overlay alone is accessible |
| Technical detail | Hide ordinary revision numbers, raw task IDs, protocol/fixture/run details and boilerplate permission explanations from the main actor view. Keep diagnostics available separately and truthful provenance compactly discoverable. No pretending synthetic fixtures are real extraction |

### Action visibility, not permission lectures

Hide controls the actor is not authorized to use or that are irrelevant to this stage—especially owner-only Offer/Hired. An owner label can explain context without `Only the owner can edit/publish/close...` blocks. Do not make pages look like disabled administrative consoles to ordinary users.

This is **not** a ban on all disabled controls: pending writes, invalid input, meaningful navigation limits and actionable prerequisites may still require them. Use a short actor-facing explanation when it helps complete the task, not backend policy prose. UI visibility never replaces server authorization, ownership, lock/readiness or separate revision checks.

## 3. Preserve navigation and working context

Opening a detail and returning must preserve the user's selected date range/week, view, filters, sort, pagination and sensible return/scroll position. Known reproduction: choose past agenda week → open appointment → return → current range replaces selection. Apply the principle to application/vacancy lists and Inbox too; do not assert every filter predicate is broken.

- User suggests URL filter state or temporary browser storage, leaning toward temporary tab-session storage. `sessionStorage` is tab-session scoped and normally survives reload; `localStorage` persists beyond the session. **Exact strategy remains to select**, not an approved framework migration.
- Non-sensitive route/query state suits Back/Forward and deep links; tab-session state can remember last list context/scroll when entering from another route. If combined, define URL precedence and when defaults/reset apply; do not accumulate two conflicting sources of truth.
- Scope retained state to account/role as appropriate and clear it on logout/identity changes. Never store answers, correction drafts, private candidate payloads, credentials or authorization decisions as a shortcut. Fetches still enforce current permissions/state.
- Keep existing explicit dirty/conflict/refresh/reapply protections. Preserving list filters is distinct from introducing persistent form drafts, automatic saving or replaying a write.
- No switch to Next.js, Angular, SvelteKit, TanStack or a new state/workflow platform merely for this overhaul. Remain within the existing React/Vite/hash-router/local-component architecture unless a separate concrete change is approved.

## 4. HR vacancy journeys

### Vacancy list

- The position/title already navigates: remove redundant `Open →` text for the same destination. Use a clear row primary target and optional owner edit/pen action for a draft.
- Keep Draft/Published/Closed readable; status need not become an obscure icon. Replace ownership pill with owner metadata, optionally `(you)`; remove routine revision display.
- Add useful owner/draft filtering (e.g. My drafts) as a requested follow-up, not an assumed existing backend filter. Define list/count/pagination parity if API filtering is needed.

### Draft editor versus vacancy inspection

- A never-published draft has no ordinary candidate applications/results journey: hide irrelevant Applications / Interview results navigation in that editing context. **Keep draft interview-plan configuration available** before publication; do not confuse configuring a plan with inspecting appointment results.
- Preserve underlying authorization/routes; hiding an irrelevant link is not authorization to delete an endpoint. Published/closed inspection should offer related applications/appointments in context, with existing closure semantics unchanged.
- Remove the developer-style heading subtitle about publication locking configuration. Put the important irreversible publication consequences in its actual confirmation dialog, in HR language.
- Keep job details and form-builder intents distinct. Put form-associated controls/help/counts with the builder, not together with unrelated vacancy metadata or a random sticky action strip.
- The generic form builder is broadly acceptable. Refine terminology around automated document information/skills rather than exposing unexplained `extraction settings`, task/configuration jargon. Exact wording remains design work; use optional help where needed.
- Preview: eye action in the builder header, preferably opening a focused preview dialog. Reorder fields with labelled up/down icons; remove with a bin icon and appropriate protection; Add can use a restrained plus with its existing picker/dropdown.
- Hide revision numbers. If useful, put input/automation counts unobtrusively at builder top/bottom-right as text, not status badges. Do not remove actual concurrency counters or publication's separate saved-plan checks.

## 5. HR/interviewer agenda and appointment inspection

- Use time as the main scanning hierarchy: date plus **time (duration)** prominent together; relevant candidate/application and vacancy links nearby. Make interviewer versus interviewee identity unambiguous. Contact email should be secondary/on demand.
- Replace Previous/Next week text with accessible arrows and a visible date range; prefer Monday-aligned weeks and a return-to-current-week control rather than a competing arbitrary Week starting date input.
- User's preferred view direction is **Upcoming / Past / Cancelled**, with an optional undecided/awaiting-feedback filter in Past. Upcoming moves forward, Past backward/up to the present, Cancelled may cover both directions. **Exact buckets/boundaries, ongoing appointments, pagination and API queries still need design.** Preserve the existing distinct meanings of scheduled/unassessed, submitted Pass/Fail and cancelled.
- An alternative mentioned was retaining Agenda/Needs feedback/Cancelled but removing week controls when the view is an independent past-90-days query. Do not keep controls that look shared but are irrelevant to the active view. Final view model should be resolved once, not implement both competing proposals.
- Avoid a Scheduled pill on every ordinary upcoming agenda item when the view already communicates it. Use meaningful outcome/cancellation cues when needed. A rescheduling-request attention indicator matters to HR's resolution intent; do not show redundant operational clutter to the requester.
- Timezone belongs with the actual time, or as compact contextual information—not an intrusive technical sentence. Never remove timezone interpretation from scheduling, corrupt conversion or make displayed times ambiguous. Whether to show a zone globally or alongside each time is an open presentation choice; do not assume every browser is UTC.
- Refresh may be an accessible icon where useful. Successful mutations should update the relevant record/list. Background auto-refresh is only a suggestion, **not selected polling, auto-retry, worker or service scope**; it must not erase local edits or bypass explicit refresh after conflict/unknown outcomes.

## 6. HR application list

- Aim for roughly four/five primary columns: Candidate, Position, Submitted, and one/two useful summary signals. This is a target for scanability, not permission to throw away state dimensions or hide material unknowns.
- Group related date filters visually; avoid presenting processing, review, derived readiness and recruitment as a wall of overlapping controls.
- User proposes intent-based filters such as Reviewed / Reviewing / Automated results ready / Failed / Pending. **Exact mapping is unresolved**: keep no-task, released, operationally blocked, ordinary failure, incomplete review and decided applications truthful; screening must not become reviewed-only. Any new derived filter must keep actual SQL detail/list/count/export parity.
- Collapse combinations like In review + Ready for review + HR corrections saved into an understandable summary with secondary detail where needed. Do not conflate extraction success, human completion and screening outcome.
- Candidate/name is the primary application link; vacancy name may navigate to vacancy inspection. Remove redundant `Open →`, `Vacancy applications` hops and stacked Selection & interviews links where they duplicate the normal detail journey. Purposeful quick actions can use nearby labelled icons rather than a tower of text links.

## 7. HR application inspection, review and recruitment actions

### Information first

- Name the candidate/application clearly; make the subdued vacancy title itself a related-entity link rather than repeating it as a separate Vacancy details control. Back/list navigation should retain originating context, not assume every application was opened from one vacancy.
- Start with **Submitted answers / Application information**, documents and associated automated results. Separate answer groups with whitespace/subtle short dividers; avoid one undifferentiated text dump.
- Related vacancy inspection is a natural navigation destination; from there its applications are available. Avoid redundant page-wide navigation and unrelated vacancy-wide CSV export inside one application. Exports belong to the corresponding list/selection intent.

### Results and human review

- Present understandable Automated results / Extracted information, with concise Pending/Unavailable/Error indication as appropriate, not multiple contradictory-looking pills (`Processing blocked`, `Original extraction errors`, `Pending`, `Fixture result`). Original and corrected values must remain distinguishable when inspected.
- When processing is unfinished/blocked, a proposed clearer action is **Skip automated extraction / Continue with manual review** (copy to refine), with optional help. This is the existing manual-release operation, **not** cancellation of external billing, successful extraction, review completion or a screening decision. Its confirmation must explain permanent processing closure and possible already-admitted work/cost without dev jargon.
- After release, do not keep prompting to release again. Avoid repeated empty failed-task cards and developer remediation messages. Put useful editable review fields in a coherent review block/page/dialog; preserve the factual failed/pending original and explicit unknowns in secondary detail. Best-effort automation is not a reason to make failed/missing evidence look like a successful empty/No value.
- Mark in review / Reset to pending / Complete review and per-field saves belong to the **human review intent**, not a generic extraction status panel. Hide irrelevant controls when review is unavailable/not applicable. Consider a dedicated review editor/page/dialog with a coherent save/complete action area rather than scattered task/status controls. **Exact surface boundary remains open**; preserve partial-save, no-op attribution and retained-conflict-draft semantics.
- Do not expand quotation/evidence UI or redesign extraction results in this checkpoint merely to fill these sections; Jev/output-template/evidence work remains separate.

### Screening and later progression

- Initial screening and interview logistics are different intents. Before preselection, do not foreground an empty interview workflow or label the only route `Selection & interviews`.
- Initial screening can be a clearly separate **Screening decision** action opening a focused dialog/wizard: Preselect / Not selected, optional internal screening rejection reason, concise permanence/locking explanation and explicit confirmation. No side effects before confirmation; preserve first-committed decision and server revalidation.
- After preselection, surface the appropriate interview/finalization intent. Empty plans must still allow the explicit owner Offer route; do not invent a booking. Configured plans require all Pass. Hired remains a separate owner confirmation; later rejection has its existing authority/reason/cancellation rules.
- A dedicated related page versus an embedded action/dialog is not fully settled; make the stage/intent relevant and avoid exposing all future controls together. Do not silently change shared screening authority, immutable submissions, scheduling/feedback ownership or private projections during re-layout.

## 8. Carry forward earlier feedback without duplicating scope

| Existing item | Relationship to this guide |
| --- | --- |
| UX-DENSITY / UX-NAV | Primary cross-cutting entity/intent/layout/copy/visual language; sidebar issue remains a reported discoverability/visibility problem, not a proven missing route |
| UX-STATE | Navigation context; select one bounded route/tab-state strategy |
| UX-ID | Make required account email identity explicit in authoring/intake without a conflicting editable identity answer |
| UX-CAND-ENTRY | Already applied → View application; candidate My applications opens the submission first, vacancy second; retain duplicate-return protection |
| UX-CAND-STATUS / B2b | Show truthful public outcomes instead of rejection notice plus Received; no internal HR state/reason leak. New candidate-progress mapping is separate backend/API work if needed |
| UX-EXPORT / UX-IMPORT | Compact effective decision file and visual interactive wizard; keep the [detailed requests and exact earlier/later CSV clarification](hr-export-import-ux.md) rather than re-specifying them here |
| B2 notification effects | User-facing layout/read dots do not implement the still-missing candidate appointment/Fail/Offer/Hired notifications, hide/retention, workload counters or recruitment email |

## 9. Boundaries and next-session working method

1. Start from the [board](tasks.md), this guide and the relevant implemented [contracts](../current/README.md). User-reported happy/negative paths are evidence only for what was reported; other Q-* gates remain pending/deferred, not passed by trust.
2. Before coding a slice, write its compact entity/role/intent map: what is inspected, primary action, related navigation, secondary details and confirmation/dirty boundaries. Use this to resolve actual layout choices; do not ask the user to redesign already-settled backend rules.
3. Prefer bounded slices: shared visual/navigation/dialog vocabulary; list/context retention; vacancy inspection/editor; application information/review; screening/interview journeys. This is a proposal for decomposition, not approval of every slice or a mandatory order. API/filter/status changes need their own backend-first contract scope.
4. Maintain keyboard/focus and native anchor semantics, private projections, no-op/revision checks, irreversible confirmations, explicit conflict/unknown-outcome refresh, dirty navigation protection and correct time/role rules. Test DOM behavior meaningfully; user manually checks native layout/history/focus. No browser automation/screenshots newly authorized.
5. No live Jev/provider/key/spending/migration/data/service/global-config work follows from this UI direction. Existing demo services stay alive; discover RMUX/listeners before any separately authorized management. Framework migration, an unattended worker and generic workflow/state platforms are non-goals.
6. Keep current docs factual when a slice ships; this plan must not be described as current UI. Use a fresh worktree outside `/tmp`, scoped checks, authorized local commit/ff-merge/removal, no push.

Open choices are the exact route/session-state strategy, agenda buckets/time boundaries, derived filter/status mapping, inspection-versus-edit page structure, review/screening dialog/page boundaries and final actor-facing wording. Resolve only what the selected implementation slice needs. No need to reopen backend invariants or finish every deferred QA gate before bounded UX work.
