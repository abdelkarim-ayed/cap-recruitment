# Unsaved-change navigation guards

Source-implemented 2026-11-07 (R3d-a review; R3d-b vacancy draft and interview plan). Frontend-only: no API, schema, permission or persisted-draft change.

## Shared behavior

`navigation-guard.tsx` wraps the existing hash router. Only the mounted editor registers dirty/pending state: review correction drafts, the vacancy draft form or interview-plan steps. All other pages are unaffected.

- Same-document links, client `go()` redirects, sign-out and managed Back/Forward ask **Stay** or **Discard and leave**. Stay/Escape keeps the current editor mounted and its inputs intact; discard unmounts without saving, cancelling or retrying a request. There is no Save all and leave.
- An in-flight review PATCH/release, vacancy save/publish/close or interview-plan PUT blocks in-app discard/leave until it settles. Leaving does not cancel a server write.
- Reload, tab close and cross-document exit use the standard `beforeunload` warning while dirty/pending; display and user-activation behavior are browser-controlled.
- History entries store only a numeric position, never review, candidate or identity content.
- Sign-out sends its existing request only after consent. A failed sign-out keeps the original editor and draft.
- Unknown, pre-existing or unmanaged fragment entries use conservative current-view/URL restoration. Exact earlier history order is not guaranteed.

## Editor specifics

- **Review:** editing a control back to its exact saved UI value removes that local draft. A successful save clears only its task; unsaved siblings and preserved inactive conflict drafts keep the warning. See [review guard details](processing-review-api.md#review-navigation-guard).
- **Vacancy draft:** an untouched create form and an unchanged saved draft do not warn. The draft compares local form content with the last loaded/saved record. Publish/close confirmation remains a separate in-page action.
- **Interview plan:** compares local steps with the last loaded/saved plan and shows `Unsaved changes`. Pagination and Refresh preserve local steps instead of silently resetting the editor. A successful PUT uses its response as the new baseline; stale/conflict responses retain local edits without automatic retry.

A successful new-vacancy create redirects only after the saved draft is no longer dirty, so it does not prompt on its own success. Existing backend authority, lock, no-op and expected-revision rules remain authoritative; the guard is UX only, not a processing hold or permission.

## Limits

Candidate application answers/files and screening-import staged decisions are not guarded yet (R3d-c). Native history menus, reload/close dialogs, focus/inert behavior, authenticated logout isolation and real delayed/uncertain responses remain manual/native QA in Q-R3DA/Q-R3DB.
