# Three configurations for wording review

All use the same [draft schema](../simple-tasks.schema.json) and
[Jinja template](../request.json.j2), not three different schema definitions.

| Configuration | Rendered native request | Demonstrates |
| --- | --- | --- |
| [01 input](01-education-experience.tasks.json) | [01 output](01-education-experience.request.json) | Two education questions; optional scope/window; OR-scoped experience. |
| [02 input](02-certifications.tasks.json) | [02 output](02-certifications.request.json) | Two certifications; string and name/aliases forms; no validity checking. |
| [03 input](03-skills.tasks.json) | [03 output](03-skills.request.json) | Coverage and two individual skill questions; mixed string/object skill values. |

`.request.json` is **Jinja-rendered request data**, not an inference response.
CV content is still `$cv`, to be hydrated later. No provider calls, actual CV
input, cache entries or new builder implementation. Choice wording/order is
shared by family and preserved. No examples are claimed as evaluated prompts.

Change input JSON to adjust task arguments; change `../request.json.j2` to adjust
shared phrasing/choices. Generated request files show the result for review.
Education returns a level qualifying within its configured window, not a separate
awarded/expected status. Show the task/window during review; never claim an
expected qualification is already awarded. Richer status annotation is deferred.
