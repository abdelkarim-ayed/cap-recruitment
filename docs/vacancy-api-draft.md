# Vacancy API — proposed next-batch shapes

**Not implemented.** This is a concrete starting contract for review before the next batch, not a promise of existing endpoints. It stays outside `openapi.json` until implemented/tested. See `backend-modules.md` for checkpoint scenarios and permissions still needing confirmation.

## Staff create/update
Proposed `POST /api/vacancies` body:
```json
{
  "title":"Backend developer",
  "description":"Build and maintain our internal services.",
  "location":"Tunis / hybrid",
  "formDefinition":{
    "version":1,
    "inputs":[
      {"id":"full_name","name":"full_name","label":"Full name","type":"text","required":true,"args":{},"options":[]},
      {"id":"cv","name":"cv","label":"Your CV","type":"document","required":true,
       "args":{"accept":[".pdf",".docx"],"limit":{"kind":"NO_LIMIT"}},
       "options":[{"id":"cv-skills","outputKey":"extracted_skills","type":"extractSkills","enabled":true,"args":{"skills":["SQL","TypeScript"],"evidence":true}}]}
    ]
  }
}
```

- `title`, `description`, and `formDefinition` required; `location` optional.
- Owner/creator comes from the authenticated actor, not a client-controlled role/ownership field in this first proposal.
- `id` is stable input identity; `name` is a unique answer/export key; changing a label does not rename that key.
- Verified email comes from the authenticated candidate account, not a freely trusted application-answer field.
- `options` are private per-input processing tasks. `args` configure the input itself.
- Task `id` is stable identity; `outputKey` is a unique internal review/export key. These are consistency proposals from `architecture.md`, not a finalized extractor registry.
- `NO_LIMIT` is a business configuration only; a separate operational upload cap must still apply. The shared `MAX_BYTES` variant (`{"kind":"MAX_BYTES","bytes":5242880}`) can impose a smaller business limit; upload enforcement is not implemented yet.
- If supplied, `location` is a string; this proposal omits it from responses when unset. `status` is `draft`, `published`, or `closed`; timestamps are ISO-8601 strings.
- Exact preset list, supported tasks, and separator wire shape will be fixed with the runtime schema before implementation. This example is not the disposable prototype's final production schema.

Proposed **201** response:
```json
{
  "id":"example-vacancy-id",
  "status":"draft",
  "revision":1,
  "ownerId":"example-recruiter-id",
  "title":"Backend developer",
  "description":"Build and maintain our internal services.",
  "location":"Tunis / hybrid",
  "formDefinition":{
    "version":1,
    "inputs":[
      {"id":"full_name","name":"full_name","label":"Full name","type":"text","required":true,"args":{},"options":[]},
      {"id":"cv","name":"cv","label":"Your CV","type":"document","required":true,
       "args":{"accept":[".pdf",".docx"],"limit":{"kind":"NO_LIMIT"}},
       "options":[{"id":"cv-skills","outputKey":"extracted_skills","type":"extractSkills","enabled":true,"args":{"skills":["SQL","TypeScript"],"evidence":true}}]}
    ]
  },
  "createdAt":"2026-10-09T12:00:00.000Z",
  "updatedAt":"2026-10-09T12:00:00.000Z"
}
```
Proposed `GET /api/vacancies/:id` returns this same full shape with **200**. `revision` is the server-controlled edit counter, distinct from `formDefinition.version` (wire-schema version). Proposed `PATCH /api/vacancies/:id` requires positive-integer `expectedRevision` plus at least one create field. `formDefinition`, when present, replaces the whole definition rather than merging individual inputs. Example:
```json
{"expectedRevision":1,"title":"Senior backend developer"}
```
Return the full staff shape with **200**, incrementing revision on change. Only drafts are editable; stale revision or published/closed edits return 409. Reject client-supplied `id`, `ownerId`, `status`, `revision`, or timestamps in create/update payloads.

## Publish/close
- Proposed `POST /api/vacancies/:id/publish`, body `{"expectedRevision":1}`: validate the draft definition, make it public, and lock intake. Return the staff vacancy shape with `status: "published"` and incremented revision.
- Proposed `POST /api/vacancies/:id/close`, body `{"expectedRevision":2}`: stop new applications without deleting history. Return the staff vacancy shape with `status: "closed"` and incremented revision. Use the actual last-read revision, not a hardcoded value.
- Authorized same-state actions should return the current record unchanged; stale revision on a real transition or illegal transitions should return 409. This behavior is proposed, not implemented.

## Public detail
Proposed `GET /api/public/vacancies/:id`, **200**:
```json
{
  "id":"example-vacancy-id",
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
No `ownerId`, task `options`, internal notes, or backend metadata. The projection is allowlisted, not the full staff record with a few fields deleted. Only open/published vacancies appear publicly; a draft/closed/unknown ID returns 404 in this proposal.

## Lists and proposed errors
- `GET /api/vacancies?limit=20&offset=0`: staff summaries, not every full definition.
- `GET /api/public/vacancies?limit=20&offset=0`: published job summaries, no backend configuration.
- Proposed bounds: `limit` defaults to 20 (integer 1–100); `offset` defaults to 0 (nonnegative integer). No filtering/sorting parameters in this first proposal.
- Public list example (**200**):
```json
{
  "items":[{"id":"example-vacancy-id","title":"Backend developer","location":"Tunis / hybrid"}],
  "total":1,
  "limit":20,
  "offset":0
}
```
- Staff list uses the same envelope; each summary adds `status`, `revision`, `ownerId`, `createdAt`, and `updatedAt`:
```json
{
  "items":[{
    "id":"example-vacancy-id","title":"Backend developer","location":"Tunis / hybrid",
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

No delete/cloning endpoint, arbitrary JSON rules, extraction execution, application submission, or staff-management API is implied by this draft. Those are separate checkpoints.
