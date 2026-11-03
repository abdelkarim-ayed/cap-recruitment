# Screening CSV import — contract draft

P0-I design checkpoint, 2026-11-03. **Not implemented.** User authorized this contract/docs checkpoint directly on `main`, as continuity toward the [selected target workflow](product-decisions.md#export-and-final-selection-wizard), not a separate feature built on legacy behavior. Recommendations below are proposals, not newly accepted product decisions. No application, database, provider or process operations are authorized here.

## Scope and invariants

- Shared admin/recruiter screening, scoped to **one vacancy per wizard**. Not owner-only; candidates/interviewers cannot preview or apply. Resolve session, role and record scope on the server; CSV identity is never authorization.
- Only undecided applications participate, regardless of extraction/review progress. Current `received` and compatible `review_ready` represent that source set; do not add a readiness gate or rename stored stages merely for CSV support.
- Included outcomes are `preselected` or `rejected`. `rejected` is an import vocabulary value; the current internal outcome is `not_selected`. Persist a screening cause distinct from later interview-stage rejection; exact schema remains part of the shared screening change.
- Either committed outcome closes processing eligibility and freezes extraction/review without fabricating completion. Preserve original answers/files, original machine results/provenance, and separate HR corrections. Import cannot modify any of them.
- Screening cannot be undone. Preselection still permits subsequent interviews, owner finalization or later recruitment rejection; those are not import actions.
- Missing, excluded or removed rows are unchanged. A file is never a complete-vacancy rejection instruction. Preview/edit/cancel creates no decisions, closures or notifications.
- Apply depends on the common target screening/closure contract (P0-S → B1-R), factual projection (B1-J), and selected notification effects (P0-N/B2). Do not ship a legacy-only import path and retrofit these guarantees later.

## Proposed input v1

One UTF-8 comma-separated file, header required. Example with synthetic identities:

```csv
application_id,decision,candidate_name,candidate_email
11111111-1111-4111-8111-111111111111,preselected,Taylor Candidate,taylor@example.test
22222222-2222-4222-8222-222222222222,rejected,Riley Candidate,riley@example.test
```

| Column | Proposed validation / meaning |
| --- | --- |
| `application_id` | Required UUID, outer whitespace trimmed; canonicalized before duplicate detection. Resolve inside the selected vacancy, never by email/name fallback. |
| `decision` | Required exact `preselected` or `rejected` after outer whitespace trimming. Blank, `null`, arbitrary stages and spreadsheet formulas are invalid, never guessed. |
| `candidate_name` | Optional assertion only, never an update. If nonblank, trim and compare Unicode-NFC text to the frozen submission identity; preserve case/internal whitespace. |
| `candidate_email` | Optional assertion only, never an update. If nonblank, trim and compare to the frozen submission identity using the application's established email normalization; do not invent provider-specific dot/plus/address rewriting. |

**Open decision:** recommend requiring at least one nonblank name/email assertion on each included row. This improves wrong-ID detection but is not authentication or proof of authenticity. If ID-only import is chosen instead, show a clear no-assertion warning and stored identity in the preview. In either option, every supplied assertion must match; changing the proposed outcome cannot clear an identity error.

**Proposed strictness and bounds:**

- Accept one optional UTF-8 BOM, LF/CRLF records, quoted commas/newlines and doubled quotes. No delimiter sniffing, XLSX, expressions or executable spreadsheet evaluation. Ignore entirely blank records; report an empty/header-only file as having no decisions.
- Header order is arbitrary; the two required headers must exist exactly once. Reject duplicate/unknown headers, including answer/extraction/review/correction columns. A diagnostic export is not a decision file; explain which columns the operator must retain/add instead of silently discarding data.
- Malformed encoding/quoting, inconsistent column counts or unsupported headers is a file-level error: apply nothing and ask for a repaired file. A structurally parsed row with invalid fields is a row error that can be removed/excluded in the wizard. Keep logical record numbers and source line locations distinct for quoted multiline records.
- Recommend 1,000 data records (including invalid/duplicate records), 1 MiB upload and 4 KiB decoded UTF-8 per cell. Apply the limits before/until parsing and also to edited JSON submissions; never truncate silently. These are proposed import bounds, not changes to existing upload/export/provider limits.
- No raw CSV/identity logging or persisted upload archive. Render cells as text, not HTML. Any downloadable errors/template/export must escape CSV syntax and neutralize formula-leading free text. Do not silently strip a spreadsheet-safety apostrophe from an imported assertion: show a mismatch and let HR repair the source.

Rejection reasons are not machine-inferred. **Proposal:** one explicit batch rejection reason entered at confirmation, required when any included row is rejected (trimmed, 1–2,000 characters, matching today's bound). It applies only to included rejected rows. No hidden default and no internal reason in candidate-facing copy. Per-row reasons/CSV reason column would be a separate choice, not silently accepted input.

## Preview and editable confirmation

1. HR opens the wizard for a vacancy and uploads the file. Server validates role/scope, parses it and resolves only vacancy-scoped records. No application mutations or notifications.
2. Preview returns a stable row key/source location, parsed proposal, safe stored identity for accessible records, factual processing/review summary and links to current decision evidence, validation issues and a server-observed concurrency baseline. Preserve original/effective/provenance distinctions in any evidence shown; CSV values are not that evidence. Unknown and out-of-scope IDs share an unavailable result; never disclose another vacancy's candidate identity.
3. Distinguish **validation** (`valid` / issues) from **inclusion** (`included` / `excluded`). Defaults: valid rows included, invalid rows excluded and clearly unresolved. An invalid row cannot be included until repaired and server-revalidated or removed. Empty/bad outcomes can be fixed by choosing a valid outcome; malformed IDs/identity mismatches require source repair/re-upload or exclusion, not an outcome switch.
4. HR can exclude/remove any row and switch valid proposals individually or in a selected group. Bulk controls affect only selected valid rows, not hidden/excluded rows. Excluded rows do not silently rejoin after an outcome edit. Duplicate detection considers every remaining parsed occurrence, even excluded ones; removing an occurrence permits revalidation.
5. Show preselected/rejected totals for the **included set**, exclusion/error totals and stored candidate identities. Reject an empty included set. Require explicit acknowledgement that screening is final; cancellation remains effect-free before apply.
6. Submit exactly the confirmed included IDs/outcomes, their baselines and the explicit rejection reason. Server treats every field as untrusted and revalidates. Disable repeated clicks locally, but do not rely on UI state for safety.

No silent last-row-wins deduplication. **Proposal:** all occurrences of a repeated canonical application ID are invalid, whether outcomes/assertions agree or conflict. Operator removes duplicates and revalidates before inclusion; show their source rows. An application can change at most once per confirmed set.

## Staleness and apply boundary

**Proposal: atomic included-set apply.** Excluded/removed rows are outside the operation. Every included row must pass fresh checks; one conflict/invalid row means **zero changes for the whole included set**, not a partial success. HR may refresh, re-examine conflicts, explicitly exclude rows and confirm a smaller set. Never silently skip errors or automatically apply the remainder.

Baseline means **what HR saw at preview/explicit refresh**, not when a spreadsheet was exported. Export tracking/history is deferred; no claim that later review/extraction changes since an untracked export can be detected. Make the current snapshot visible so HR can reconsider old spreadsheet decisions.

The server-observed baseline must cover:

- Application/vacancy association, frozen candidate assertion identity, screening eligibility and workflow revision.
- Review revision and relevant processing/release/closure state, plus any results/corrections presented as decision evidence. Workflow revision alone does not cover these today.
- A changed presented result must not slip through merely because `flow_revision`/`review_revision` stayed unchanged. P0-S/B1-J must define a reliable snapshot comparison or dedicated evidence/concurrency marker. A timestamp alone or client-supplied “allowed” flag is insufficient. Baseline representation/lifetime and transport are implementation design, not permission to add an import-session/export ledger.

**Recommended strict behavior:** changed review/result/closure evidence invalidates the affected preview even if screening remains eligible; HR refreshes/reconfirms. Ongoing extraction may therefore cause a conflict, **not** an eligibility ban or a requirement to wait/review/release. Changing only the proposed outcome does not refresh the baseline automatically. Never auto-merge or auto-reapply a stale confirmation.

Proposed command transaction:

1. Authenticate, enforce normal write-Origin/role checks and validate bounded request shape. Recheck vacancy access; no owner override or imported actor IDs.
2. Lock the vacancy under the common workflow convention, then included applications in deterministic ID order. Align review/task/closure and later notification locks with P0-S; a new batch path must not invert existing lock order.
3. Under locks, verify vacancy association, existence/access, unique included IDs, assertions, undecided state, baseline and per-outcome eligibility. Report only accessible row details; no preselection/rejection writes yet.
4. Invoke the **same transaction-owned screening operation** as individual decisions: persist outcome/cause/actor, increment workflow revision once per real transition, close/fence processing and freeze review without rewriting completion or values. Required closure-marker changes are not extraction corrections. No providers, file storage or email calls in this transaction.
5. Persist selected in-app notification intents in the same transaction: one candidate screening outcome per application, no copies for every actor and no redundant internal-cancellation spam. Use the approved subject/privacy/deduplication contract, not today's interview-only notification schema. External delivery, if later selected, happens after commit through its port.
6. Commit once, then return the applied included-set totals/outcomes. Any validation, closure or notification-persistence failure rolls back the whole set. Row locks/fencing also protect against extraction finishing or another staff decision concurrently.

## Repeated files, races and uncertain responses

**Proposal: repeated decisions are conflicts, not silent idempotent success.** A new import containing an already-decided application excludes/flags it at preview; if it changed after preview, apply conflicts atomically. Even the same requested outcome must not recreate effects, reattribute the decision, increment revisions or claim this import made somebody else's decision. Opposite outcomes never reverse screening.

- Two concurrent confirmations for overlapping applications cannot both transition the same application. After the winner, the loser must revalidate and conflict/roll back its included set.
- A network timeout after apply has an **unknown outcome** until fresh server reads. Do not automatically resubmit, regenerate effects, infer failure, or claim an exact receipt from current state alone. Show “confirmation unavailable; refresh to check recorded outcomes” and preserve the submitted set for comparison.
- Reliable replay/causal receipts would require a scoped operation key plus durable payload/result record committed atomically, with same-key/different-payload rejection. **Deferred unless explicitly chosen**; not an export-history ledger and not implied by this draft. Without that mechanism, promise no duplicate transitions/effects, not replayable success responses.

## Export boundary and logical API contract

**Proposal:** preserve today's diagnostic export-all endpoint/columns; add explicit screening export/template behavior rather than narrowing its existing scope. Screening export includes only undecided records under selected factual filters, never requires finished processing/review, and preserves unknowns and truthful provenance. Tracking/regex remain deferred. Decision import accepts only its allowlisted columns, not the full evidence export; revisions/identity are resolved at preview, not trusted from an external spreadsheet.

Backend-first logical operations, **not published routes/OpenAPI yet**:

| Operation | Required behavior |
| --- | --- |
| Preview / revalidate | Vacancy context + bounded CSV/edited selection → row validation, safe identities, baseline, included/excluded totals; no persistent effects |
| Apply | Vacancy context + nonempty unique included set + baselines + rejection reason → one atomic command or no changes |
| Conflict response | Stable issue codes/row keys and safe refresh guidance; do not replace unsaved selection or disclose foreign identities |

Keep 401 for no session, 403 for role/Origin denial, and existing vacancy/resource privacy conventions. Proposed input errors use 400, upload limits 413 and changed baselines/decided records at apply 409. Draft row codes include `invalid_id`, `invalid_decision`, `assertion_required`, `identity_mismatch`, `duplicate_application`, `application_unavailable`, `already_decided`, `snapshot_changed`. Cap returned errors; never return raw SQL or hidden records. Final DTOs/status mapping must be reviewed against the existing backend contract before implementation.

## Acceptance matrix — future checks, not executed

| Case | Required target result |
| --- | --- |
| Pending extraction / unfinished review / ordinary failure / manual release / no tasks | Undecided records remain screening-actionable; commit closes processing, preserves values and unfinished review |
| Missing rows, valid excluded rows, cancel | No decisions, closures, counters or notifications for them |
| Candidate/interviewer/direct request/foreign vacancy ID | Denial without candidate identity leakage; UI is not authority |
| Quotes, multiline cells, BOM, Unicode, formulas, blank/malformed/oversized CSV | Deterministic bounded parse/error behavior; no execution, truncation or formula-unsafe output |
| Blank/unknown decision, extra correction column, wrong identity | Error, never inferred rejection, identity update or extraction correction |
| Same/conflicting duplicate IDs including differently cased UUIDs | All remaining occurrences invalid until duplicates removed/revalidated |
| Edited/bulk-switched valid outcomes and excluded invalid rows | Only explicitly included unique valid records submitted; error state not erased by changing outcome |
| Concurrent review/result/release/individual/bulk decision | Fresh baseline/eligibility and common closure fences; no late overwrite or stale confirmation |
| One stale/decided/foreign included row, or failure midway through effects | Entire included set rolls back; no partial transition or notification |
| Repeat file / same outcome / opposite outcome / overlapping confirmations | No undo, reattribution, duplicate effects or second revision bump |
| Lost response after commit | Unknown-outcome guidance and fresh reads; no automatic replay or fabricated receipt |

Documentation checks passed: whitespace, 39 local Markdown links/anchors across the six touched documents, and the illustrative CSV's headers/UUIDs/outcomes. No application tests, imports, seed/fixture mutations, browser checks or provider calls were performed. Existing deferred Q-R1/R2/R3 verification remains outstanding.

## Decisions to settle before implementation

1. **Assertions:** require at least one name/email assertion (recommended), or permit ID-only with a warning?
2. **Atomicity:** all explicitly included rows succeed together (recommended), or deliberately support partial apply with its different reporting/retry contract?
3. **Rejection reason:** one explicit batch reason (recommended), or per-row reasons and corresponding CSV/UI changes?
4. **Freshness/repeats:** preview-time strict evidence baseline and already-decided conflicts (recommended), or a stronger export-time/replay guarantee requiring separately reviewed persistence?

P0-I is **drafted, awaiting these choices**, not “implementation ready.” Resolve the common closure/evidence/notification contracts in sequence before applying CSV decisions; don't introduce a second workflow or require a blanket release of all other backlog cards.
