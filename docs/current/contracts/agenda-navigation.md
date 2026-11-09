# Agenda navigation context

Agenda views, context and week navigation. Backend authority and browser-local time interpretation are retained; current Upcoming/Past boundaries are explicit below.

## Entity / role / intent

- Authorized HR/interviewers inspect appointments in an agenda range/view/page, open an appointment, and return to the originating list context.
- Appointment actions, related-entity navigation and confirmation boundaries are unchanged. The shared [navigation guard](editor-navigation.md) remains authoritative for dirty/pending editor navigation.

## State and precedence

- Hash routes use `#/interviews?start=YYYY-MM-DD&view=upcoming|past|cancelled&awaitingFeedback=true&offset=N`. The optional awaitingFeedback flag is meaningful only in Past. Offset is a nonnegative multiple of 20, capped at the API's 100000 limit. Calendar dates are validated in local time (1900–9998).
- Explicit query state wins over remembered state; missing/invalid query fields use the current Monday as the week default. A supplied valid date is normalized to the Monday of its containing local week. Unrelated query fields are dropped. Week/view changes reset pagination.
- A bare agenda route uses the last valid tab-session context for the current account/role, otherwise the current Monday. The resolved route replaces that history entry, so Back does not resolve it against newer remembered state.
- Toolbar order is View, then grouped previous / This week / next controls and a visible Monday–Sunday date range; Past also offers Awaiting feedback only. There is no arbitrary week-start date input. Each query uses local Monday midnight inclusive through the following Monday midnight exclusive, preserving DST conversion. This week returns to the current local Monday.
- Upcoming is the default and shows only scheduled appointments whose start is strictly after server time, earliest first. Past shows non-cancelled appointments whose start has arrived, newest first, whether awaiting feedback or already assessed. At the exact start an appointment belongs to Past, including an ongoing interview. Current-week Upcoming never includes that week's already-started entries. Cancelled shows cancelled appointments only, in either time direction, earliest first.
- Awaiting feedback only narrows Past to scheduled/unassessed appointments in the selected week; it is not a rolling 90-day queue. Submitted Pass/Fail remain actual immutable results, never inferred from time. Changing view clears that filter; changing week/filter/view resets pagination. Past navigation stops at the current week; Upcoming cannot navigate to earlier weeks. Switching between opposite time directions clamps an incompatible week to the current week. A stale page uses fresh server totals to move to the last available page.
- Views, time predicates, assignment scope, total and page are evaluated in one backend SQL statement. Classification updates on fetch/Refresh, not via background polling, timed writes or fake status transitions. Feedback eligibility remains assigned + start arrived; action availability is not changed by list filtering.
- Old frontend `agenda` links map to Past for earlier weeks and Upcoming otherwise; old `feedback` links map to Past with Awaiting feedback in the selected week. Old valid session context is normalized similarly. The API retains legacy agenda/feedback meanings for existing callers; the UI no longer offers that competing model.
- Agenda appointment links carry only start/view/awaitingFeedback/offset to detail. Its Agenda link returns them; no arbitrary return URL is accepted. Direct appointment entry without context returns to the bare agenda route. Links remain native anchors, including modifier-click/new-tab semantics.
- `sessionStorage` holds only one account/role-scoped last context and scroll position. It survives reload in that tab; it is not an editor draft store, cache of private records, or authorization source. Identity/role mismatch, unauthenticated initialization and successful logout clear it; failed logout does not.
- Storage failure is nonfatal: explicit route state and detail-return links still work. Lists/details always fetch current server projections; no stored permissions or replayed writes.

## Scroll and limits

Scroll is restored best-effort after the matching list loads and saved on scroll events. A different context starts at the top. Only the last list context is remembered, not an unlimited per-history-entry scroll ledger. Changed records/page height may clamp the restored position. There is no polling, automatic retry or persisted form state.

Verification: API/web builds and diff/static checks pass for the current view changes; no test suite or browser checks were run at user preference. Original context-slice state/DOM evidence predates these views and is not a current pass; old fixtures need adaptation. Native history/scroll, Monday/DST/time-boundary/filter switching, counts/pagination and authenticated role/isolation checks remain pending. All prior Q-* gates remain pending.
