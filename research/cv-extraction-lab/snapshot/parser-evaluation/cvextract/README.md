# cvextract: manual Jev experiments

Isolated Python/uv project, independent of corpus generation and the existing
parser environment. Accepts **already-parsed CV text**, not PDF or parser JSON.
No extraction-family generator, response transformation, confidence threshold,
review UI, CSV export or candidate decisions. Question phrasing remains research
work; experimental templates and their observation register live in
[templates/](templates/README.md). These are research drafts, not validated
extraction rules. API sources and limitations:
[Jev reference](../../docs/jev-api-reference.md).

## Setup

From the repository root:

```sh
uv sync --project parser-evaluation/cvextract
uv run --project parser-evaluation/cvextract cvextract --help
```

The nested project has its own `.venv` and lockfile. It does not join a parent uv
workspace or change the corpus/parser dependencies. No runtime dependencies;
standard-library HTTP with a single 60-second-timeout attempt and no redirects
or retries. Linux local files/locks are required; do not share this cache through
a network filesystem. Do not delete/change the cache or latch to rearm spending.

## Template inputs

`--request template.json` accepts only the native Jev body fields `model`,
`state`, `questions`. The model may be omitted; otherwise it must be exactly
`jev-1.14.0`. The generated request always includes that model.

Use an **exact string value** `"$cv"` anywhere within `state`. Recommended state
shape when additional context is needed:

```json
{"cv": "$cv", "reference_date": "2026-11-12"}
```

Plain `"state": "$cv"` also works. Every exact placeholder value in state is
replaced with the complete UTF-8 file contents. No substring substitution, shell
expansion, date generation, environment-variable interpolation or other variable
mechanism. Additional state values are literal; update dates deliberately.
Questions are left untouched. Files must have `.md`, `.markdown` or `.txt`
extensions and nonempty content. JSON-to-CV-text conversion is not implemented.

`questions` is the native nonempty question-ID map; question types supported are
`choice`, `score`, `noul`, with native `instructions`/`criteria`. Structured
instructions/descriptions are allowed. Unknown fields, duplicate JSON keys and
malformed question shapes are rejected locally. Images/assets are unsupported.
`--questions definitions.json` is deliberately reserved and returns **not
implemented**, rather than guessing a family-to-question translation.

No claim that structural validation establishes meaningful questions, accurate
answers or provider acceptance. There is no exact local token/cost estimator.
Requests over the documented 32 MiB body limit are rejected; no truncation or
long-context override is applied. Provider context limits can still reject a
smaller request. Confirm current account pricing separately before sending.

## Inspect first; sending is manual

The following inspection command makes **no API call**, needs no key, and does
not touch the cache/latch. `-o` saves the generated request; omit it for stdout.
Use your own agreed template and CV path:

```sh
uv run --project parser-evaluation/cvextract cvextract \
  --cv path/to/cv.md --request path/to/template.json \
  --dry-run -o hydrated-request.json
```

**Without `--dry-run`, a cache miss can spend money.** You manually run this
only when ready to authorize a single request. Do not wrap it in loops, batch
scripts or an unattended runner. This CLI does not make fallback calls.

Credential variable: **`JEV_API_KEY`**, not `JAV_API_KEY`. A leading space before
`JEV_API_KEY=… cvextract …` suppresses history only if the shell is configured
accordingly (for Bash, typically `HISTCONTROL=ignorespace` or `ignoreboth`). Do
not rely on the space alone. Safer interactive Bash entry avoids putting the
value in a command line or history:

```sh
read -rsp 'Jev API key: ' JEV_API_KEY; echo
export JEV_API_KEY
```

Then, **only when you intend to send**, run:

```sh
uv run --project parser-evaluation/cvextract cvextract \
  --cv path/to/cv.md --request path/to/template.json -o response.json
```

Afterward, `unset JEV_API_KEY`. No `.env` loading, credential persistence, SDK
logging, credential hashing or key substitution. A credential detected in the
request content is rejected before hashing/output. An environment variable is
still accessible to processes with sufficient local privileges; hidden entry is
not protection against a compromised machine.

Response JSON goes to stdout by default, or `-o`; progress messages (request
creation, SHA-256/cache location, hit/miss, sending and saving) and the **absolute
cached response path** go to stderr. Original answer probabilities/confidence
and usage are preserved, not rounded, capped or interpreted as correctness.
Existing output files are never overwritten. A local output failure after a
successful send does not undo it: rerun the same request to retrieve the cache.

## Spending latch and failures

- First uncached invocation permits at most **one HTTP attempt**.
- The persistent latch closes **before** network access. Every later uncached
  attempt requires `--allow-next-send`. This flag authorizes one attempt only;
  it does not refresh a successful cache entry.
- Successful cache hits need neither a key nor the flag.
- One nonblocking global lock prevents simultaneous CLI cache/send operations.
  A competing invocation exits rather than waiting and potentially sending later.
- No automatic retry after HTTP errors, disconnects, timeouts or interruption.
  Failure and unknown completion are **not** successful responses. A provider
  may have charged even if no usable response reached disk.
- After a failed/uncertain attempt, inspect its recorded status before explicitly
  choosing whether to risk a new attempt with `--allow-next-send`. This is a
  manual override, not a guarantee that retrying is free or safe. A killed process
  leaves its initial `uncertain` status and closed latch behind.
- HTTP failures record the status code, not provider error bodies that could echo
  sensitive data. Invalid HTTP-200 bodies are saved when credential-free but are
  never published as successful cache entries. Exceptions aren't payload-logged.

Do not reset/delete the cache to bypass the latch. It is local protection, not
an account-wide spending quota. It cannot coordinate other tools or machines.

## Stable on-disk cache

Fixed root: `~/.cache/cvextract/` (no cache-root override or refresh command).

```text
send.lock
send-latch.json
requests/<sha256>/
  request.json
  success.json                        # only after complete validation
  attempts/<random-attempt-id>/
    status.json
    response.json                     # when an HTTP-200 body was received safely
```

The request hash is computed **after CV hydration**, over the exact bytes sent:
UTF-8 JSON, no insignificant whitespace/ASCII escaping, finite numbers only,
fixed top-level field order `model`, `state`, `questions`. All nested object and
array ordering is preserved: Jev documents choice-order sensitivity. Consequently
source formatting/whitespace outside strings doesn't change the key, but nested
key order does, conservatively. CV whitespace remains part of the input.

Before reuse, stored request bytes must equal the generated request bytes, the
success marker must point to a successful attempt, the stored response checksum
must match, and the response must validate against the request. Validation checks
model, exact question IDs/types, choices/ranges, complete probabilities,
confidence and token usage. An invalid/corrupt cache fails closed without sending.
No refresh and **no builder-version metadata/key component**, per the agreed
scope. Different CV contents, questions, ordering or literal dates change the
request and therefore the key. No combined CV/questions/version filename scheme.

The success marker is atomically written only after response/status durability.
An interrupted write may leave an unreferenced response, never a false cache hit.
Cache files use owner-only permissions when created, but contain full CV text
and machine answers. Keep the cache private and outside Git. Do not manually
edit cache entries. No inference, fixtures, tests or quality evaluation have been
run as part of building this CLI.
