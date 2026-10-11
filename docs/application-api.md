# Applications and documents — implemented checkpoint

Interview extension: generic HR application routes remain interviewer-denied, but assigned scheduled/completed interviewers can access that application's answers/documents through dedicated interview routes. No extraction-review/configuration access. Internal progression now supported via interview-api.md; candidate-facing stage remains Received until publication policy is approved. Answers/files stay immutable.
Staff list review metadata adds `hasCorrections`: whether any separate correction exists (including explicit null), not whether all failed fields are repaired. Original processing_state stays unchanged. UI separates Original extraction, HR review and saved corrections; correction availability survives refresh and removal clears the indicator. No extraction state rewrite/retry implied.

No extraction tasks in the frozen snapshot: processing remains not_requested, review status starts completed and staff `review.required=false`. It is automatic housekeeping, not approval; stage stays received. Staff list `reviewRequired` indicates whether the full scoped dataset has any extraction tasks. No candidate answer/file changes. See processing-review-api.md.

Manual-feedback refinements: list query adds `processing=pending|not_requested|processing|completed|completed_with_errors`, staff-only `review=pending|in_review|completed`, and `sort=newest|oldest|candidate|position` (default newest). Database applies filters/sort before count/pagination, with ID ties. Candidate review filters return 403. CSV remains unfiltered across the vacancy. React PDF preview reuses authorized attachment bytes, checks PDF signature and uses a session-local PDF blob; no public/inline server route. Non-PDFs download-only. Browser PDF support varies; signature is not malware validation.

Backend contract now consumed by the React frontend (demo-guide.md). Mock executor/review/CSV: processing-review-api.md. No live AI, import, stage mutations, interviews, withdrawal or candidate-answer/file corrections.

## Access
- Candidate submits using their verified OTP/session account, and reads/downloads only their own applications. Foreign application/document returns 404.
- All admin/recruiter staff may read all applications and download their documents, not only vacancy owners. Interviewer excluded for now. Staff cannot submit as a candidate.
- Answers/files are locked for everyone. No application PATCH/DELETE endpoint. Staff coordination/advancement policies are separate checkpoints.
- Cookie-authenticated POST requires trusted Origin as in [`api.md`](api.md). Responses containing candidate data use private/no-store; document bytes have no public URL.

## Submit
`POST /api/vacancies/:id/applications`, `multipart/form-data`:
- Exactly one text part `answers`: a JSON object (max 256 KiB), keyed by **stable input id**, not input name. Name remains the review/export column label. Document/separator keys do not belong in answers.
- Each file part's name is its document input id; one file per document input. Required documents must be present. Optional unanswered inputs may be omitted; null is not an answer.
- Text types accept strings, maxLength or default 10000 characters; required text cannot be blank. Numbers are finite, respect min/max/step (step anchored at min or zero). Yes/no accepts actual booleans, including false. Choices use configured values; multiple choices must be unique, nonempty when required. Unknown inputs/incorrect types fail without writing rows/files.
- `document.args.accept` is optional: lower-case extension list, e.g. `[".pdf",".docx"]`; omitted permits any extension/no extension. Matching is case-insensitive on filename, **not MIME/content validation**. `limit` is optional: MAX_BYTES or NO_LIMIT. Omission/NO_LIMIT still obey hard operational **10 MiB per file / 25 MiB combined**, max 100 files.
- Files are untrusted. No parser, malware scan, inline preview or executable processing; download as octet-stream attachment with nosniff/sandbox headers. Browser downloads are not a safety guarantee when subsequently opened locally.

201 returns the created application; 200 returns an existing candidate/vacancy submission unchanged. Database uniqueness plus transaction/advisory locking prevent duplicate concurrent submissions. The existing record is returned even if the vacancy is now closed. A new submission requires published vacancy; row locking coordinates submit versus close. Malformed request/oversized multipart can still fail before duplicate lookup.

Stored application freezes candidate identity and published revision/definitions. Answers are not overwritten/copied for extraction. Stage remains received. Initial processingState pending/not_requested; explicit mock command later sets processing/completed/completed_with_errors. Pending is not proof execution has run. Staff detail/list also receive review metadata; candidates do not.

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

Lists accept only limit (1–100, default 20), offset (0–2147483647, default 0), order newest submittedAt/ID first, and return items/total/limit/offset. No filtering/ranking or PII-bearing public routes.

Detail keys: id, vacancyId, candidateId, candidate `{name,email}`, vacancy `{id,title,description,location?,revision,formDefinition}`, answers, documents, stage, processingState, submittedAt. Staff vacancy projection also includes processingDefinition; candidates never receive task arguments. Document metadata: id (business document UUID), inputId, filename, byteCount, mediaType (application/octet-stream); storage references/hashes stay private. No reusable profile CV.

400: invalid UUID/query/body/form answers/files. 401: no session. 403: denied role/untrusted Origin. 404: absent/foreign resource. 409: vacancy not published. 413: operational upload caps. 503 download: missing storage/integrity failure. Input validation includes issues with path/message; ordinary errors use Nest envelopes.

## Storage and verification
LocalDocumentStorage implements DocumentStorage port at ignored `.local/documents/`, opaque generated keys, 0700 directory/0600 files, atomic rename and no-follow reads. Stored-file metadata is separate from application_document business ownership. DB failure rolls back rows; created objects are removed when rollback is confirmed. Ambiguous commit outcome retains files rather than risking deletion of committed data. **Process crash or failed cleanup may leave private orphan objects**: no automated reconciliation/backup/quota policy in this demo checkpoint. Do not deploy this as a production upload service without those policies and abuse controls.

```sh
pnpm build
pnpm --filter @recruitment/api db:migrate
pnpm --filter @recruitment/api applications:check
```
Real PostgreSQL, real OTP/session, mocked mail, isolated local file directory. Checks validation/limits, rollback and storage-failure cleanup, duplicate races, staff visibility/candidate isolation, byte-identical downloads and persistence across API restart. Cleanup owns only disposable rows/files; never resets tables. Run auth migration first on a fresh database. See [`backend-test.md`](backend-test.md).
