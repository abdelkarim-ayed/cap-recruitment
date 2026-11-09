# Vacancy API — implemented contract

Publication validates and freezes the saved interview plan, including a valid empty plan. The 2026-11-07 B1-P checkpoint changes source/client contracts without a new migration; real PostgreSQL/HTTP/manual validation remains pending. Guarded extraction defaults/limits are unchanged; see [Jev safety](../jev-safety.md).

Staff responses include `owner: {name,email}` alongside ownerId; public projections never include owner identity. Lists support `status=draft|published|closed` and `sort=newest|oldest|title` (default newest); staff lists also accept `owner=me|<user ID>`. All filters apply before count/pagination with deterministic ID ties. Public lists remain published-only and reject the staff-only owner query. Existing owner permissions are unchanged.

R1 adds `actions:{edit,publish,close}` to full staff responses only; each entry has `{allowed,visible,reason}`. Public/list projections are unchanged. Availability is advisory and does not bypass owner/state/revision/request checks; see [action policies](action-policies.md).

**Implemented; historical integration evidence and checkpoint-specific verification limits are recorded in [status](../status.md).** Admin/recruiter create/read; owner alone mutates. Interviewer/candidate denied staff vacancy routes. Writes require trusted Origin. [Intake](application-api.md); [processing/review/export](processing-review-api.md).

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
    "tasks":[{"id":"cv-skills","sourceInputId":"cv","outputKey":"extracted_skills","type":"extractSkills","args":{"skills":["sql","typescript"],"evidence":false}}]
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

## Draft editor navigation

Unsaved vacancy edits register with the shared [navigation guard](editor-navigation.md). Leaving asks Stay or Discard and leave; no save-all, automatic save or request cancellation is added. An untouched create form or unchanged saved draft does not warn, and a successful create redirects only after its record is clean. Existing save/publish/close authority and revision rules are unchanged.

### Staff inspection versus editing — UX-DENSITY-b

The vacancy route opens the editor only for a draft owner whose server action metadata allows editing. Other authorized HR inspect draft/published/closed vacancies as job information, read-only form requirements and configured automated document checks—not a disabled editor. Owner metadata is quiet text; routine revisions and ownership-policy lectures are absent. A new-vacancy route opens the creation form for eligible HR. This is implemented in main; native/manual review remains pending.

Drafts retain a distinct interview-plan configuration/read link; application/result links are hidden in that context without deleting or changing their routes. Published/closed inspection groups Applications and Interview plan & results under Recruitment. Only an owner with the existing published-close availability sees Close vacancy; closed vacancies cannot be edited or reopened. No extra plan fetch is needed just to inspect a vacancy. Staff/public resource state is keyed by identity/role/projection and resource ID, so switching those waits for a fresh fetch rather than reusing a previous staff surface.

Publication still loads the saved plan and confirms its separate revision alongside the vacancy revision. Publish/close confirmations use native modal dialogs: labelled visible consequences, cancel-first focus, Escape/cancel while idle, native background inertness/focus containment, and focus restoration to the trigger or entity header after a transition. Pending writes disable confirmation/cancel and stay guarded. A shared leave warning temporarily suspends the native modal presentation so the top layer cannot obscure the guard; it neither cancels the request nor discards confirmation state. Stale/failed publication closes confirmation without retry, preserves draft edits, and requires another saved-plan review before another publication attempt. Close still sends only the vacancy revision and stops intake, not ongoing recruitment.

Candidate entry, form authoring and list preferences have their own current contracts; inspection must preserve the [durable design baseline](../guides/frontend-design.md#vacancy-inspection-and-editing--ux-density-b), not revert to disabled editing or repeated permission explanations. Native/manual verification remains pending.

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

extractSkills args require skills (1–100 nonempty strings before normalization, max 100 chars each) and evidence boolean. Skills trim/lowercase/deduplicate on validation. Remove a task to disable it; no enabled flag. Editor settings are attached to the source document. Evidence remains accepted for compatibility, but new tasks default false and Noul emits no quotes. Adapter execution bounds differ from the definition schema; see [Jev safety](../jev-safety.md). Unknown types/args fail. Empty task list is valid; publish requires a non-separator input. Omitted accept/limit means no business restriction; uploads still obey 10 MiB/file and 25 MiB combined caps. Extension restrictions are not content verification.

**201** response (illustrative ID, actual responses return UUIDs):
```json
{
  "id":"11111111-1111-4111-8111-111111111111",
  "status":"draft",
  "revision":1,
  "ownerId":"example-recruiter-id",
  "actions":{
    "edit":{"allowed":true,"visible":true,"reason":null},
    "publish":{"allowed":true,"visible":true,"reason":null},
    "close":{"allowed":false,"visible":false,"reason":"Invalid vacancy transition."}
  },
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
    "tasks":[{"id":"cv-skills","sourceInputId":"cv","outputKey":"extracted_skills","type":"extractSkills","args":{"skills":["sql","typescript"],"evidence":false}}]
  },
  "createdAt":"2026-10-09T12:00:00.000Z",
  "updatedAt":"2026-10-09T12:00:00.000Z"
}
```
`GET /api/vacancies/:id` returns this same full shape with **200**. `revision` is the server-controlled edit counter, distinct from `formDefinition.version` (wire-schema version). `PATCH /api/vacancies/:id` requires positive-integer expectedRevision (max 2147483647) plus at least one editable field. Revision increments once only for a real change; an unchanged current draft returns the existing record without an UPDATE or timestamp change. Definitions replace the whole pair rather than merging individual inputs. Example:
```json
{"expectedRevision":1,"title":"Senior backend developer"}
```
Return the full staff shape with **200**, incrementing revision on change. Only drafts are editable; stale revision or published/closed edits return 409. Reject client-supplied `id`, `ownerId`, `status`, `revision`, or timestamps in create/update payloads.

R3a no-op comparison happens after owner, draft-state and expectedRevision checks under the vacancy row lock: even an identical stale PATCH returns 409, and an identical unauthorized PATCH is still denied. Compare only submitted fields using the existing patch schema's normalization (including trimming and skill normalization), ignoring object-key order but retaining array order. Omitted fields are untouched; null/blank location remains invalid rather than a new clearing operation. No-op responses retain owner metadata like ordinary staff responses. A valid replacement can still repair invalid old field data; unrelated stored fields are not revalidated by a metadata-only comparison. Automated regression is deferred as Q-R3A, not reported passed.

For definition changes, send both definitions as a replacement pair. Validation covers source references, compatible types and unique IDs/output keys; failure writes nothing. This does not imply live skill extraction exists.

## Publish/close
- `POST /api/vacancies/:id/publish`, body `{"expectedRevision":1,"expectedInterviewRevision":1}`: validate draft form/task definitions and saved ordered interview plan; publish and freeze configuration. Both counters are required positive integers; old one-counter clients must update. Return 200 with status published and incremented vacancy revision; interview revision/IDs remain unchanged.
- `POST /api/vacancies/:id/close`, body `{"expectedRevision":2}`: close a published vacancy without deleting it; remove it from public routes. Return 200 with status closed and incremented revision. Use actual last-read revision; new submissions require published state. Existing recruitment continues.
- Owner-authorized same-state actions return the current record unchanged even with an old revision. A stale revision on a real transition or illegal transition returns 409. Draft cannot close; closed cannot reopen. Row locking prevents two stale concurrent edits from both succeeding.

Publication and interview-plan PUT serialize on the same vacancy row `FOR UPDATE`. Publish reads the plan/revision through the repository on that transaction, never a separate service transaction. It checks vacancy revision, definition validity, intake and interview revision/content before writing. Plan entries: 0–10, trimmed nonblank name (max 100), instructions (max 4000), consecutive positions from zero. Empty tasks/interviews are valid; duplicate interview names remain allowed. No publish-time interviewer/appointment requirement. Invalid stored plan returns 400; stale plan returns 409 and does not publish.

If publication wins, a later plan save is denied even if identical. If a real plan edit wins, an older publish confirmation conflicts; HR must review its updated saved version. The UI loads/shows the saved plan (including instructions or explicit empty plan) before confirmation and sends both counters. Unsaved form edits disable confirmation; a failed publication closes confirmation without automatic retry. Close still needs only expectedRevision, stops intake only, and cannot unfreeze a plan.

Published/closed existing records freeze their current plan as-is; no backfill, row rewrite, migration/reset or seed run occurs. Draft plans with existing appointments remain defensively frozen. Source fixtures now configure planned interviews before publication; demo publication obtains the current plan revision without overwriting manual plan data. Internal `interview-pipeline`/`steps` names remain; product wording is Interview plan / Interviews. Appointment scheduling/reassignment/location/time permissions are unchanged.

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

- Candidate-specific browsing is separate from public/staff routes: authenticated `GET /api/candidate/vacancies` accepts existing limit/offset/sort plus `notApplied=true|false`. Candidate role is checked in both route metadata and service; published-only exclusion uses `NOT EXISTS` for the trusted session candidate, before count and pagination in the same statement. Its projection is id/title/location only, private/no-store. The UI exposes Not applied yet only to signed-in candidates. Existing public list and owner authority remain unchanged; no candidate-supplied identity or cross-candidate application details are exposed.
- `GET /api/vacancies?limit=20&offset=0`: staff summaries, not every full definition. Optional `owner=me` resolves the trusted session ID; a named owner ID is only a list predicate, never a permission/assignment change. Owner and status compose in one SQL statement before total/page. Unknown or no-longer-owning IDs return an empty matching set, not broader results.
- `GET /api/vacancies/owners`: HR-only, private/no-store `{items:[{id,name,email}]}` for users who actually own vacancies, ordered by name/email/ID across the dataset, independent of list page/status. No general user directory or new public/candidate owner projection. Both staff list and owner options enforce the existing vacancy.read role; public/candidate routes reject owner query input.
- Staff UI offers All owners / Owned by me / named owner. My drafts sets `owner=me&status=draft`; All vacancies clears owner/status but preserves sort. Changes reset the page and persist in account/role-scoped tab-session memory. If owner options fail, All owners/Owned by me remain available and a remembered named-owner filter is not silently discarded. Filters do not enable editing another owner's draft.
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

Owner/draft filtering and current UI: builds/static and focused offline predicate/role/normalization checks only; authenticated SQL/list-count/isolation and native filter-memory checks remain pending. No schema/data/provider change.

Validation errors return 400 with statusCode/error/message plus issues with path/message. UUID/transition errors use Nest envelopes. General JSON body limit is 256 KiB. No vacancy delete/cloning, arbitrary rules, task execution or staff-management API. Applications/uploads have a separate contract; richer presets remain TODO.
