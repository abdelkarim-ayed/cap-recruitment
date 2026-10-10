# Vacancy API — implemented checkpoint

Manual-feedback refinements: staff responses include `owner: {name,email}` alongside ownerId; public projections never include owner identity. List query adds `status=draft|published|closed` and `sort=newest|oldest|title` (default newest), applied before pagination with deterministic ID ties. Public lists remain published-only regardless of filter. Existing owner permissions unchanged.

**Implemented and integration-tested.** Admin/recruiter create/read; owner alone mutates. Interviewer/candidate denied staff vacancy routes. Writes require trusted Origin. Intake: application-api.md; mock-only processing/review/export: processing-review-api.md. No live AI.

## Staff create/update
`POST /api/vacancies` body:
```json
{
  "title":"Backend developer",
  "description":"Build and maintain our internal services.",
  "location":"Tunis / hybrid",
  "formDefinition":{
    "version":1,
    "inputs":[
      {"id":"full_name","name":"full_name","label":"Full name","type":"text","required":true,"args":{}},
      {"id":"cv","name":"cv","label":"Your CV","type":"document","required":true,
       "args":{"accept":[".pdf",".docx"],"limit":{"kind":"NO_LIMIT"}}}
    ]
  },
  "processingDefinition":{
    "version":1,
    "tasks":[{"id":"cv-skills","sourceInputId":"cv","outputKey":"extracted_skills","type":"extractSkills","args":{"skills":["SQL","TypeScript"],"evidence":true}}]
  }
}
```

- `title`, `description`, `formDefinition`, and `processingDefinition` required; task list can be empty. `location` optional. Both definitions are validated/saved/published atomically.
- Owner/creator comes from the authenticated actor, not a client-controlled role/ownership field.
- `id` is stable input identity; `name` is a unique answer/export key; changing a label does not rename that key.
- Verified email comes from the authenticated candidate account, not a freely trusted application-answer field.
- `formDefinition` holds candidate inputs and their args. `processingDefinition` holds private task args; sourceInputId associates each task with its source field in the graphical editor. No nested input `options`. Scheduling/cache/provider credentials are not part of either definition.
- Task `id` is stable identity; `outputKey` is unique across task outputs and must not collide with candidate answer names. extractSkills is the first allowed task configuration, document sources only; it does not trigger extraction or select a live provider.
- NO_LIMIT/omitted limit remains subject to operational 10 MiB/file and 25 MiB combined upload caps. MAX_BYTES may impose a smaller business limit; intake enforces it.
- If supplied, `location` is a nonempty string; responses omit it when unset. `status` is `draft`, `published`, or `closed`; timestamps are ISO-8601 strings. Vacancy IDs are UUIDs; invalid path IDs return 400.
- Strings are trimmed; title/location/labels max 200 characters, description max 20000. Unknown fields are rejected, including owner/status injection. Max 100 inputs/tasks; IDs/names/output keys match `^[a-z][a-z0-9_\-]{0,63}$` with reserved keys rejected. Input IDs, answer names, task IDs, and choice values must be unique.

## Supported input and task arguments
Every answer/document input requires id, name, label, type, required, args. Separators use only id, label, type, args; no name/required/task.

| Type | args |
| --- | --- |
| text / long_text | `{}` or optional `maxLength` integer 1–10000 |
| number | Optional finite min/max; min ≤ max; optional positive step |
| yes_no | `{}` |
| single_choice / multiple_choice | `{"choices":[{"value":"day","label":"Day"}]}`; 1–100 unique values |
| document | Optional accept: 1–32 unique lower-case extensions matching `^\.[a-z0-9]{1,16}$`; optional limit: NO_LIMIT or MAX_BYTES with positive safe-integer bytes |
| separator | `{}`; display-only, no answer |

extractSkills args require skills (1–100 nonempty strings, max 100 chars, case-insensitively unique) and evidence boolean. Remove a task to disable it; no enabled flag. Future editor can show settings on its source document. Unknown types/args fail. Empty task list is valid; publish requires a non-separator input. Omitted accept/limit means no business restriction; uploads still obey 10 MiB/file and 25 MiB combined caps. Extension restrictions are not content verification.

**201** response (illustrative ID, actual responses return UUIDs):
```json
{
  "id":"11111111-1111-4111-8111-111111111111",
  "status":"draft",
  "revision":1,
  "ownerId":"example-recruiter-id",
  "title":"Backend developer",
  "description":"Build and maintain our internal services.",
  "location":"Tunis / hybrid",
  "formDefinition":{
    "version":1,
    "inputs":[
      {"id":"full_name","name":"full_name","label":"Full name","type":"text","required":true,"args":{}},
      {"id":"cv","name":"cv","label":"Your CV","type":"document","required":true,
       "args":{"accept":[".pdf",".docx"],"limit":{"kind":"NO_LIMIT"}}}
    ]
  },
  "processingDefinition":{
    "version":1,
    "tasks":[{"id":"cv-skills","sourceInputId":"cv","outputKey":"extracted_skills","type":"extractSkills","args":{"skills":["SQL","TypeScript"],"evidence":true}}]
  },
  "createdAt":"2026-10-09T12:00:00.000Z",
  "updatedAt":"2026-10-09T12:00:00.000Z"
}
```
`GET /api/vacancies/:id` returns this same full shape with **200**. `revision` is the server-controlled edit counter, distinct from `formDefinition.version` (wire-schema version). `PATCH /api/vacancies/:id` requires positive-integer expectedRevision (max 2147483647) plus at least one editable field. Each successful PATCH increments revision. Definitions replace the whole pair rather than merging individual inputs. Example:
```json
{"expectedRevision":1,"title":"Senior backend developer"}
```
Return the full staff shape with **200**, incrementing revision on change. Only drafts are editable; stale revision or published/closed edits return 409. Reject client-supplied `id`, `ownerId`, `status`, `revision`, or timestamps in create/update payloads.

For definition changes, send both definitions as a replacement pair. Validation covers source references, compatible types and unique IDs/output keys; failure writes nothing. This does not imply live skill extraction exists.

## Publish/close
- `POST /api/vacancies/:id/publish`, body `{"expectedRevision":1}`: validate draft, publish and lock the entire record. Return 200 with status published and incremented revision.
- `POST /api/vacancies/:id/close`, body `{"expectedRevision":2}`: close a published vacancy without deleting it; remove it from public routes. Return 200 with status closed and incremented revision. Use actual last-read revision; submission eligibility will use this state when applications are implemented.
- Owner-authorized same-state actions return the current record unchanged even with an old revision. A stale revision on a real transition or illegal transition returns 409. Draft cannot close; closed cannot reopen. Row locking prevents two stale concurrent edits from both succeeding.

## Public detail
`GET /api/public/vacancies/:id`, **200**:
```json
{
  "id":"11111111-1111-4111-8111-111111111111",
  "title":"Backend developer",
  "description":"Build and maintain our internal services.",
  "location":"Tunis / hybrid",
  "form":{
    "version":1,
    "inputs":[
      {"id":"full_name","name":"full_name","label":"Full name","type":"text","required":true,"args":{}},
      {"id":"cv","name":"cv","label":"Your CV","type":"document","required":true,"args":{"accept":[".pdf",".docx"],"limit":{"kind":"NO_LIMIT"}}}
    ]
  }
}
```
No ownerId, processingDefinition, internal notes, or backend metadata. Projection is allowlisted. Only published vacancies appear publicly; a draft/closed/unknown UUID returns 404.

## Lists and errors
- `GET /api/vacancies?limit=20&offset=0`: staff summaries, not every full definition.
- `GET /api/public/vacancies?limit=20&offset=0`: published job summaries, no backend configuration.
- limit defaults to 20 (integer 1–100); offset defaults to 0 (integer 0–2147483647). Unknown query parameters are rejected. Order: newest createdAt first, descending ID tie-break. Total/page use one database statement; an offset beyond the end returns an empty page with the full visible total.
- Public list example (**200**):
```json
{
  "items":[{"id":"11111111-1111-4111-8111-111111111111","title":"Backend developer","location":"Tunis / hybrid"}],
  "total":1,
  "limit":20,
  "offset":0
}
```
- Staff list uses the same envelope; each summary adds `status`, `revision`, `ownerId`, `createdAt`, and `updatedAt`:
```json
{
  "items":[{
    "id":"11111111-1111-4111-8111-111111111111","title":"Backend developer","location":"Tunis / hybrid",
    "status":"draft","revision":1,"ownerId":"example-recruiter-id",
    "createdAt":"2026-10-09T12:00:00.000Z","updatedAt":"2026-10-09T12:00:00.000Z"
  }],
  "total":1,
  "limit":20,
  "offset":0
}
```
- Lists omit `description` and form/task definitions. No results returns `items: []` and `total: 0`; `total` counts records visible to that caller.
- 400 invalid field/task configuration; 401 signed out; 403 management role required; 404 missing/nonpublic record; 409 stale revision/locked state/invalid transition.

Validation errors return 400 with statusCode/error/message plus issues with path/message. UUID/transition errors use Nest envelopes. General JSON body limit is 256 KiB. No vacancy delete/cloning, arbitrary rules, task execution or staff-management API. Applications/uploads have a separate contract; richer presets remain TODO.
