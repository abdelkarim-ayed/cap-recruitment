# HR decision export and interactive import — feedback and source decisions

Earlier feedback and exact synthetic reproduction below are retained as context. The user subsequently approved the bounded compact export/grouped import and form-authoring refinements, now **source-implemented** in the UI worktree. [Current contract](../current/contracts/screening-api.md) supersedes proposal details and former parser behavior below; [form/email presentation](../current/guides/frontend-design.md#decision-files-and-form-authoring). Builds and focused offline checks pass, not authenticated/native/SQL/race gates. No provider work follows from this slice; broader Q-* gates remain pending.

## Collected requests

- UX-ID: globally required email identity should be explicit in authoring/intake. Current application identity freezes signed-in account name/email; CSV matches application ID plus frozen email, never name or an arbitrary editable form answer.
- UX-NAV: interview sidebar item was not visible to the user; source has eligible-staff agenda navigation. Reproduction/role/discoverability work remains, not a new permission grant.
- UX-STATE: user reports losing the selected past interview week after opening a detail and returning, and generally losing filters/list context. Source confirms `Agenda` initializes local start=today, view=agenda and offset=0 on remount; the detail's Agenda link carries no return state. Preserve nonsensitive week/view/filter/sort/page/return context with account/role isolation; do not misdiagnose this React client-state reset as SSR or claim every filter query is broken. Distinct from dirty-form guards and UX-DENSITY, with its own board card.
- UX-DENSITY: misplaced buttons, stacked/redundant pills, technical HR wording and opportunities for accessible icons. Further progression feedback reports unintuitive layout/perspective across preselection/interview/Offer pages, programmer-oriented messages and repeated out-of-place demo disclaimers. Treat this as a coherent HR journey/action/copy overhaul, not cosmetic badge changes only. Prefer one concise contextual demo indicator with details on demand; reduce repetition without hiding unavailable values, separate HR corrections or truthful fixture provenance. User did not check inboxes.
- UX-EXPORT: the current decision export is too close to a diagnostic table dump. Make it usable in Excel, Notion or external human/AI-assisted screening, with pertinent effective information and no internal IDs/timestamps/protocol metadata beyond the required application key.
- UX-IMPORT: clearer visual status/outcome grouping, meaningful explanations, duplicate resolution/exclusion and application links opening a new tab. Exact supplied CSV is retained below.

## UX-EXPORT — original requested direction

The earlier proposals below informed the now source-implemented compact decision file; use the current contract for exact columns and limits. Detailed diagnostic export remains distinct:

| Content | Requested/proposed presentation |
| --- | --- |
| Identity | Keep `application_id` and frozen `candidate_email` for reimport; human candidate name remains useful, not an assertion key |
| Application/CV access | Absolute authenticated application-page link instead of private document UUIDs, workstation paths or fake public storage URIs. It must not embed sessions, signed bearer access or bypass document authorization |
| Answers | Pertinent candidate answers with readable values, not indiscriminately every technical field |
| Review | Compact meaningful label, e.g. Unreviewed / In review / Reviewed by email; optionally distinguish corrections saved without falsely claiming review completed. No raw reviewer UUID. Omit review/task/correction timing clutter from the standard decision file |
| Effective extraction | Use an explicit HR override when present (including null/unknown); otherwise original machine result. Do not flatten successful empty, unknown, failed, pending or missing evidence into the same blank/negative |
| Skill list output | Readable comma-space-separated text in a correctly quoted CSV cell is proposed; no JSON object required for the HR file. A true predefined per-skill question may instead retain one clear Yes/No/Unknown column per skill. Do not multiply list output into every original/effective/provenance/correction subcolumn |
| Unavailable/error | Short stable human-readable status, not internal exception text, fixture IDs or a run dump. Keep unknown distinct from not found/No; HR should understand what can and cannot be concluded |
| Provenance | Keep detailed provenance stored and available in diagnostic/detail views; omit raw fixture/mode/attempt/run/corrected-at columns from the decision file. Synthetic/demo files still need a concise truthful indication; never make fixtures look live-validated |
| Round trip | Retain empty `decision` and optional `reason` for external completion. Only ID/email/decision/reason are imported; extra human-facing evidence/link/review columns stay ignored. Preserve formula escaping, CSV quoting, private access and undecided-only eligibility |

Examples are proposals, not final column names or a new generic export framework. Compact content must still support truthful partial failure/unknown handling and distinguish effective corrections without forcing HR to reconstruct internals.

## UX-IMPORT — original interactive proposal

- Outcome and row eligibility are different axes. Proposed visual language: green Preselect, red Reject, amber unresolved duplicate/conflict, muted grey Already decided/Excluded; invalid rows use an icon/text and optionally strike-through. Do not use colour alone or make grey already-decided rows look editable. Maintain keyboard access and readable contrast.
- Group duplicate application IDs, show all source CSV row numbers/proposals, and let HR **keep one or exclude all**. Contradictory decisions require an explicit choice. Identical duplicates may be collapsed only with a clear displayed count/retained proposal and explicit consent; never silently merge or last-row-wins. Re-evaluate the chosen row through server scope/email/state validation before enabling it.
- Let HR exclude/remove problematic source rows and resolve the duplicate group without abandoning other valid choices. Do not casually turn this into identity/email repair or arbitrary invalid-input editing. Backend contract changes are required before a locally chosen duplicate can become eligible; current parser invalidates duplicate occurrences before UI inclusion.
- Already-decided applications stay grey/ineligible; no undo or replay. Recheck on apply, keep atomic included-set confirmation, preserve unaffected choices after conflict and require reconfirmation. Preview/exclude/choice has no persisted recruitment effect; no automatic retry after uncertain responses.
- Show an application ID/name as a real new-tab application link only after server scope/identity resolution. Arbitrary uploaded IDs must not gain trusted names/links or leak out-of-scope existence. Preserve the wizard's staged work when opening a preview.
- Explain accepted CSV literals exactly: `preselected` / `rejected`. `refused` is not currently accepted; do not silently add an alias. Distinguish missing columns/row width, malformed email, valid-but-mismatched email, duplicate, already-decided and invalid decision; the current one-error-per-row precedence can obscure additional problems.
- Recommended balance: interactive exclusion/duplicate/outcome selection, while malformed identity/content still has a clear Fix CSV path. A richer general CSV editor is not implied.

## Exact user reproduction (synthetic lifecycle data)

```csv
application_id,candidate_email,decision
b66245af-4538-462a-8bf6-80cb6108fab3,lifecycle.ready@example.test,preselected
b6d34da3-bc65-4358-8456-05ac592d6020,lifecycle.empty@example.test,refused
b6d34da3-bc65-4358-8456-05ac592d6020,lifecycle.empty@example.test,preselected
1c04feab-a5ec-4370-8450-85d41d9684bb,
3b78d7c8-05fc-4342-8962-e6f215083495,lifecycle.reviewed@example.tes,preselected
8c540073-668e-4630-8e90-25ffdc4c45cf,lifecycle.screened-pending@example.test,refused
```

Before the refinement, pure parser/issue functions were run on this text, without DB/HTTP/provider calls. The following are **former behavior**, not current preview results. CSV record numbering includes the header:

| Record | Local parser result | Further source-level implication, not a live preview result |
| --- | --- | --- |
| 2 | No local issue | Server must still check vacancy/email/undecided state |
| 3 | Decision must be preselected or rejected | Also duplicates record 4; invalid-decision message wins precedence |
| 4 | Duplicate application ID; repair the source file | Current UI cannot resolve by unchecking record 3: both were excluded from server eligibility resolution |
| 5 | A valid candidate email is required | Missing email and decision/short row; only first issue returned |
| 6 | No local issue | `.tes` is syntactically valid, but differs from seeded `.test`; server compares frozen email and should reject a mismatch |
| 7 | Decision must be preselected or rejected | Once corrected to `rejected`, server should show Already decided if the application remains in its seeded preselected state |

The user reported correct detection but unsatisfactory visual interaction, and an unclear decision error around a column/value they believed valid. **Subsequent clarification:** the pasted `refused` file was an earlier test; the later error was seen after using the correct decision literal, and the pasted example had not been updated. Do not explain away that later report as `refused` misuse. The exact corrected input/error pair is not retained, so the later issue remains unresolved/unreproduced. Row-width mismatch is a separate source diagnostic possibility (parser replaces decision with empty text), not an established cause of the user's later error. Keep the original sample as the earlier reproduction for diagnostics and DOM/manual acceptance cases. No successful apply, race test or current DB state was observed here.

## Source review of requested backend edge cases

| Question | Current source evidence and remaining limits |
| --- | --- |
| Vacancy close | `VacancyService.transition` / `VacancyRepository.save` update the vacancy only. Intake submissions require Published; existing application, review, task and interview operations do not use vacancy Closed as a cancellation/processing-stop gate. Closing is not archive/finalize. No closure race executed |
| View filters / disappearing interviews | `InterviewService.agenda` filters date/status/role, not vacancy status; filtering has no mutation. Cancelled appointments have their own view. Application/detail reads retain relationships. A hidden row is not a cancelled/removed business record |
| Screening concurrency | Individual and CSV apply take application update locks, compare current flow revision/state and use shared `commitScreening`; bulk locks sorted IDs, validates the full included set before writes and commits notifications in the same transaction. First committed screening outcome wins; later conflicting/identical proposals do not replay. Source-level design, not a real PostgreSQL race pass |
| Review concurrency | `ReviewService.patch` locks the application, checks readiness/closure and separate review revision before equality/writes. Concurrent saves from the same version cannot silently overwrite. Open review can continue after explicit refresh, unlike immutable screening; completion/screening locks it. No real concurrent requests executed |
| Timing | `InterviewService.validateSlot` rejects start <= current app clock, invalid timezone/half-hour and assignee overlaps for create/reschedule. Feedback requires scheduled active application, assigned actor and start <= now, **not the end time**. Potential boundary follow-up: future-time check occurs before waiting for interviewer advisory lock; recheck after that wait before write is not present. No lock-wait/clock-boundary test executed |
| Rejection / Offer | Final Fail sets Not selected and cancels all other scheduled instances atomically; owner later rejection also cancels them. Final state blocks new scheduling/feedback. Existing completed feedback stays. `finalizationOwner` enforces actual vacancy ownership for Offer/Hired; no admin override. Nonempty plan counts every configured interview as completed Pass; empty plan requires Preselected. No new runtime verification |
| Import identity | `ApplicationService.submit` freezes account name/email; `ReviewService.export` exports frozen email, `ScreeningService.preview/apply` trim/lowercase and match ID+email within the vacancy. Email is automatically captured identity, not automatically added as a custom form question. Names are not assertion keys |

Do not broaden this source check into a claim that every access/rollback/race edge is proven. Remaining technical checks stay on Q-R1A/Q-R3C/Q-SI/Q-B1P/F/R/J and the interview contract's verification scope. Jev paid-attempt safety and presentation review remain separate; no live-provider execution authorized.
