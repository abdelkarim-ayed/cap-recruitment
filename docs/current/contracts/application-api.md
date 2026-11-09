# Applications and documents — implemented contract

Interview extension: generic HR application routes remain interviewer-denied, but assigned scheduled/completed interviewers can access that application's answers/documents through dedicated interview routes. No extraction-review/configuration access. Internal progression is supported via interview-api.md; candidates receive only the coarse public stages below. Answers/files stay immutable.
Staff list review metadata adds `hasCorrections`: whether any separate correction exists (including explicit null), not whether all failed fields are repaired. Original processing_state stays unchanged. UI separates Original extraction, HR review and saved corrections; correction availability survives refresh and removal clears the indicator. No extraction state rewrite/retry implied.

No extraction tasks in the frozen snapshot: processing remains not_requested, review status starts completed and staff `review.required=false`. It is automatic housekeeping, not approval; stage stays received. Staff list `reviewRequired` indicates whether the full scoped dataset has any extraction tasks. No candidate answer/file changes. See processing-review-api.md.

Manual-feedback refinements: list query adds `processing=pending|not_requested|processing|completed|completed_with_errors`, staff-only `review=pending|in_review|completed`, and `sort=newest|oldest|candidate|position` (default newest). Database applies filters/sort before count/pagination, with ID ties. Candidate review filters return 403. CSV remains unfiltered across the vacancy. React PDF preview reuses authorized attachment bytes, checks PDF signature and uses a session-local PDF blob; no public/inline server route. Non-PDFs download-only. Browser PDF support varies; signature is not malware validation.

B1-J adds HR-only `readiness=not_required|waiting|blocked|ready|released|locked` filtering and list `{readiness:{state,reason},processingClosed}`. Candidate readiness requests return 403 and responses omit these fields. Filtering precedes count/pagination and shares its SQL expression with undecided screening export; its [compact decision-file columns](screening-api.md#export-and-input) no longer repeat raw readiness metadata. Diagnostic export-all stays unfiltered/unchanged. Original processing/review statuses are preserved. [Readiness/release UI and conflict behavior](processing-review-api.md#explicit-manual-release). Migrations 007/008 are applied locally; DB/HTTP/manual QA remains pending.

Backend contract consumed by React ([demo guide](../guides/demo-guide.md)). [Processing/review/CSV](processing-review-api.md); [PDF/gateway details](../jev-safety.md). Internal progression uses the [interview contract](interview-api.md); decision import has its own [screening contract](screening-api.md). No withdrawal or candidate-answer/file corrections. Live extraction is not quality-verified.

## Access
- Candidate submits using a verified account/session (current UI: email/password plus one-time verification), and reads/downloads only their own applications. Legacy OTP remains a regression API path. Foreign application/document returns 404.
- All admin/recruiter staff may read all applications and download their documents, not only vacancy owners. Interviewers use the assigned-interview routes described above, not these generic routes. Staff cannot submit as a candidate.
- Answers/files are locked for everyone. No application PATCH/DELETE endpoint. Staff coordination/advancement policies are separate checkpoints.
- Submitted choice answers display labels from the frozen form (readable multiple-choice lists, explicit missing/empty choices), not raw stored option keys. This is presentation only: answers are unchanged and extraction outputs keep their own task-defined type/CSV shape.
- Cookie-authenticated POST requires trusted Origin as in [`api.md`](api.md). Responses containing candidate data use private/no-store; document bytes have no public URL.

## Candidate public status

Own application list/detail (including duplicate-submit responses) share one allowlisted `stage` projection: `received` → Application received, `preselected` → Preselected, `interview` → Interviewing, `offer` → Offer recorded, `hired` → Hired, `not_selected` → Not selected. Internal `review_ready` and unrecognized stages fall back to `received`; they are never forwarded verbatim. Both candidate screens display the same public wording. This is current progression/outcome, not a timeline, assessment result, promised next appointment or offer document.

Staff stages and authorization are unchanged. No internal reasons, assessments, review/work/readiness metadata, new processing details or notification/email effects are added. Existing immutable answers/documents and private projections remain intact. API/web builds and static checks only; authenticated isolation/manual status checks remain pending. Lightweight list preferences are described in [frontend design](../guides/frontend-design.md#list-filter-memory).

## Submit
`POST /api/vacancies/:id/applications`, `multipart/form-data`:
- Exactly one text part `answers`: a JSON object (max 256 KiB), keyed by **stable input id**, not input name. Name remains the review/export column label. Document/separator keys do not belong in answers.
- Each file part's name is its document input id; one file per document input. Required documents must be present. Optional unanswered inputs may be omitted; null is not an answer.
- Text types accept strings, maxLength or default 10000 characters; required text cannot be blank. Numbers are finite, respect min/max/step (step anchored at min or zero). Yes/no accepts actual booleans, including false. Choices use configured values; multiple choices must be unique, nonempty when required. Unknown inputs/incorrect types fail without writing rows/files.
- `document.args.accept` is optional: lower-case extension list, e.g. `[".pdf",".docx"]`; omitted permits any extension/no extension. Matching is case-insensitive on filename, **not MIME/content validation**. `limit` is optional: MAX_BYTES or NO_LIMIT. Omission/NO_LIMIT still obey hard operational **10 MiB per file / 25 MiB combined**, max 100 files.
- Files are untrusted. Submission performs no parsing/malware scan; the separate processing command can use the PDF reader. Generic downloads use octet-stream attachment with nosniff/sandbox headers. Client PDF preview uses authorized bytes; no public inline route. Browser downloads are not a safety guarantee when subsequently opened locally.

201 returns the created application; 200 returns an existing candidate/vacancy submission unchanged. Database uniqueness plus transaction/advisory locking prevent duplicate concurrent submissions. The existing record is returned even if the vacancy is now closed. A new submission requires published vacancy; row locking coordinates submit versus close. Malformed request/oversized multipart can still fail before duplicate lookup.

Stored application freezes candidate identity and published revision/definitions. Answers are not overwritten/copied for extraction. Stage starts received. Initial processingState pending/not_requested; explicit processing command later sets processing/completed/completed_with_errors independently of recruitment stage. Pending is not proof execution has run. Staff detail/list also receive review metadata; candidates do not.

Example for a published vacancy containing name, available and cv input IDs:
```sh
curl -i -b /tmp/opencode/candidate-cookies.txt \
  -H 'Origin: http://localhost:5173' \
  -F 'answers={"name":"Fixture candidate","available":false}' \
  -F 'cv=@/tmp/opencode/cv.pdf' \
  http://localhost:3000/api/vacancies/REPLACE_UUID/applications
```
Let curl set the multipart boundary; do not set a JSON Content-Type. Only use disposable fixture data for tests.

## Read/download
| Route | Result |
| --- | --- |
| GET /api/applications | Candidate own summaries; admin/recruiter all summaries |
| GET /api/vacancies/:id/applications | Admin/recruiter summaries for that vacancy; unknown vacancy is empty |
| GET /api/applications/:id | Locked answers, candidate identity snapshot, frozen vacancy/form, document metadata |
| GET /api/applications/:id/documents/:documentId | Original attachment bytes after authorization and size/SHA-256 integrity check |

Lists accept bounded limit/offset, processing status and sort; staff also have review filters, as described above. Defaults are newest submittedAt/ID first; responses contain items/total/limit/offset. No ranking or PII-bearing public application routes.

Detail keys: id, vacancyId, candidateId, candidate `{name,email}`, vacancy `{id,title,description,location?,revision,formDefinition}`, answers, documents, stage, processingState, submittedAt. Staff vacancy projection also includes processingDefinition; candidates never receive task arguments. Document metadata: id (business document UUID), inputId, filename, byteCount, mediaType (application/octet-stream); storage references/hashes stay private. No reusable profile CV.

400: invalid UUID/query/body/form answers/files. 401: no session. 403: denied role/untrusted Origin. 404: absent/foreign resource. 409: vacancy not published. 413: operational upload caps. 503 download: missing storage/integrity failure. Input validation includes issues with path/message; ordinary errors use Nest envelopes.

## Answer navigation

Candidate application answers and selected files register with the shared [navigation guard](editor-navigation.md): leaving asks Stay or Discard and leave, while a submission in progress blocks leaving until settled. Preview mode is unguarded. A successful submission redirects only after the form is no longer dirty; no automatic save, retry or persistent draft is added.

## Application inspection layout — UX-DENSITY-c

Source-implemented in the UI worktree, 2026-11-09; native/manual review pending. The existing application route starts with candidate/application identity, a single vacancy-title link, browser-local submission time and a native contact-email disclosure. Its Applications link goes to the all/own list, not an assumed vacancy-scoped origin. Application-list filter/return-context retention remains separate UX-STATE work; this slice does not claim to restore that state.

Submitted answers retain the frozen form's separator groups and order, excluding document fields from answer rows. Existing value display preserves zero, false and missing-value semantics. Documents retain their source labels and explicit preview/download actions, authorized attachment paths, PDF validation and object-URL cleanup. Candidate answers/documents remain immutable.

Staff-only Automated results and Human review sections separate original-processing/readiness facts from human review. [Review dialogs](../guides/frontend-design.md#review-and-appointment-dialogs) place corrections and completion in a native editor, and release in a separate native confirmation. Per-field draft/save/reapply/discard behavior, revision/no-op checks, release consequences, original-versus-corrected results and truthful fixture provenance remain intact. Result headings use source-document labels; output keys remain in collapsed original diagnostics. [List filter memory](../guides/frontend-design.md#list-filter-memory) retains preferences, not originating windows/history. Candidate vacancy-summary and checked application-entry behavior is specified in [candidate access](candidate-access.md#intake-and-duplicates); it does not alter immutable submissions.

The server's existing workflow visibility controls one staff-only related link: Screening decision for received/review_ready; Interviews & next steps for preselected/interview; View recruitment progress otherwise. These are labels for the same existing workflow route, not new eligibility decisions, bookings, Offer/Hired controls or automatic mutations. Screening remains available independently of review readiness. Actual screening/interview/finalization authority stays on that destination/server. Focused workflow dialogs are implemented separately in [UX-DENSITY-d](interview-api.md#focused-workflow-dialogs--ux-density-d), not by this inspection layout slice.

Duplicate Vacancy details / interview-results links and the vacancy-wide CSV button are removed from individual application inspection. Vacancy inspection and the existing staff list/export routes remain available in their appropriate contexts; no endpoint or export contract changes. Candidate inspection does not fetch review or show staff intents, even if a fixture contains staff action metadata. Candidate Received/public-progress behavior is unchanged; UX-CAND-STATUS/B2b remains pending.

Verification and manual limits: [frontend design](../guides/frontend-design.md#application-inspection--ux-density-c). No backend/schema/data/service/provider changes or additional source evidence/quality claims.

## HR work and outcome filters

Source-implemented in the worktree; build/static checked only, not DB/HTTP validated. Staff list responses add `workItem` per row and `workFiltersSupported:true`. Optional staff-only `work` and `recruitmentStatus` predicates apply before pagination and total; candidates cannot request them and receive neither work property nor capability flag. Coarse `received` includes compatible internal `review_ready`; other statuses are preselected/interview/offer/hired/not_selected. Stored recruitment/review/processing states and all action eligibility are unchanged.

Work precedence: terminal Not selected/Hired/Offer recorded first; undecided with no extraction tasks or completed review → For screening; undecided ready/released with unfinished review → For review; remaining undecided → Processing (blocked remains explicitly flagged). Preselected with zero configured interviews, or interview-stage with a nonempty all-Pass configured plan → Awaiting offer. Other preselected/interview records → Interviews; unfamiliar stages → Other. Awaiting offer is a factual queue, not permission for non-owners to finalize. Cancelled/missing/non-Pass interviews cannot satisfy it. Review readiness is never a screening eligibility gate.

The same fixed SQL expressions are used by staff list/count and filtered undecided screening export. Screening export always remains undecided-only even if a selected work/status filter would match later stages; diagnostic all-application export is unchanged. Legacy processing/review/readiness query predicates remain API-compatible, but the primary HR UI replaces their three overlapping controls with Work to do and Recruitment status. Dates/sort remain secondary and UTC date-query meanings are unchanged. The controls require the matching backend; the frontend does not simulate filtering on the loaded page. Candidate public status uses its own allowlist, never these staff work/readiness projections.

## Storage and verification

LocalDocumentStorage implements DocumentStorage port at ignored `.local/documents/`, opaque generated keys, 0700 directory/0600 files, atomic rename and no-follow reads. Stored-file metadata is separate from application_document business ownership. DB failure rolls back rows; created objects are removed when rollback is confirmed. Ambiguous commit outcome retains files rather than risking deletion of committed data. **Process crash or failed cleanup may leave private orphan objects**: no automated reconciliation/backup/quota policy in this demo checkpoint. Do not deploy this as a production upload service without those policies and abuse controls.

```sh
pnpm build
pnpm --filter @recruitment/api db:migrate
pnpm --filter @recruitment/api applications:check
```
Real PostgreSQL, real OTP/session, mocked mail, isolated local file directory. Checks validation/limits, rollback and storage-failure cleanup, duplicate races, staff visibility/candidate isolation, byte-identical downloads and persistence across API restart. Cleanup owns only disposable rows/files; never resets tables. Run auth migration first on a fresh database. See [backend checks](../guides/backend-test.md).
