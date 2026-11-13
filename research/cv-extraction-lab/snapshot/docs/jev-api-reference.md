# Jev API reference for CV extraction

For the selected task schema, frozen publication-date policy, evaluation findings
and TypeScript/native Node migration, see the [integration handoff](cv-extraction-handoff.md).
This API snapshot is not a claim that the platform builder/jobs are implemented.

Documentation checked **2026-11-12**; no inference/API calls, credentials, corpus inspection, installations or live validation. This is a documentation snapshot, not measured extraction quality. Workflow: **CV Markdown → Jev extraction → human review → CSV**; no extra general-purpose LLM, candidate ranking, filtering or rejection.

## Official contract and input

- [Introduction](https://docs.typesafe.ai/introduction), [documentation index](https://docs.typesafe.ai/llms.txt), [HTTP reference](https://docs.typesafe.ai/api/system-one.md), and [OpenAPI 0.2.0](https://api.typesafe.ai/openapi.json) are the primary sources. The [official skill](https://raw.githubusercontent.com/typesafe-ai/skills/refs/heads/main/skills/typesafe-ai/SKILL.md) explicitly defers syntax/limits to live documentation; its experiment/install instructions were not executed.
- Endpoint: `POST https://api.typesafe.ai/v1/systemone`; `Authorization: Bearer <API_KEY>` and `Content-Type: application/json`. This documents authentication, not permission to obtain/use a key. `GET /v1/models` is authenticated too and was **not** called.
- Required body fields: `model`, `state`, `questions`. [State](https://docs.typesafe.ai/concepts/state.md) accepts a string, object or array. Put the **actual full parsed CV Markdown** in the string, not a file path, URL or server-side document ID. Markdown is ordinary text here; no special Markdown ingestion endpoint is documented. An object such as `{ "cv_markdown": "…", "reference_date": "2026-11-12" }` can carry explicit contextual facts instead.
- [Models](https://docs.typesafe.ai/models.md): currently `jev-1.14.0` and `jev-1.13.0`; both aliases `jev-latest`/`jev-preview` currently point to 1.14.0 but can move. Pin a version for reproducible experiments and retain the returned `model`.

## Questions, integers and floats

`questions` is a nonempty object keyed by caller-chosen question IDs, not an array. Each answer returns under the same ID. IDs identify results and are not sent to the model; put the complete task in `instructions`. See [primitives](https://docs.typesafe.ai/primitives.md) and the OpenAPI schemas.

| Type | Request criteria | Answer / constraints |
| --- | --- | --- |
| `choice` | Object mapping option names to descriptions; descriptions may be string/object/array/null | 1–255 options in OpenAPI. Returns string `choice`, per-option numeric `probabilities`, numeric `confidence`. `choice` is documented as the highest-probability option; probabilities sum approximately to 1. |
| `score` | Ordered array of descriptions, numbered by position from zero | OpenAPI accepts 1–10 levels; [Score guidance](https://docs.typesafe.ai/primitives/score.md) recommends at least two. Returns numeric `score` (probability-weighted mean, **may be fractional**), `legend`, `probabilities`, `confidence`. HTTP level keys are strings; Python SDK uses integers. |
| `noul` | Optional `true`/`false` criteria; question in `instructions` | Returns numeric `noul` in 0–1 (probability of yes), not a separate confidence field. |

There is **no documented arbitrary integer/float range primitive** or `min`/`max` question schema. To represent an exact discrete count 0…N, a Choice can enumerate N+1 named options with complete descriptions and a local integer mapping (N ≤ 254 if no extra option). This establishes output shape, **not reliable counting**. A Score with N+1 levels is limited to N ≤ 9 and its expected value is not an integer count; rounding is not proof of the correct count. Fractional scores/probabilities are supported, but unconstrained real-number extraction is not documented. Finite numbers are allowed inside structured input.

For this project's coverage count, [official jaggedness](https://docs.typesafe.ai/model-jaggedness.md#counting) recommends one semantic question per supplied item and counting in code, rather than asking Jev to tally. That is a future design tradeoff (more questions versus one count), **not a change to the selected semantics**. Numeric precision, overlapping experience durations and date-window comparisons also need code/review; see the same page's math/date sections.

## Minimal illustrative body (not sent)

This adapts the verified Choice request schema; text is synthetic, not a corpus sample. It demonstrates a field extraction, not skill proficiency or a screening decision.

```json
{
  "model": "jev-1.14.0",
  "state": "# Example CV\n## Skills\nPython\n",
  "questions": {
    "python_mention": {
      "type": "choice",
      "instructions": "What evidence of Python appears in this CV?",
      "criteria": {
        "mentioned": "Python is explicitly mentioned in the CV.",
        "not_mentioned": "The CV contains no mention of Python."
      }
    }
  }
}
```

## Batching, completion and failures

- Any mix of question types can share one state in one request. Questions run independently/in parallel and cannot read other answers; a genuinely dependent question needs a subsequent request. There is **no separate question-count cap**, but context/body limits apply. This is multi-question batching, not a documented asynchronous batch-job API. Sources: [primitives](https://docs.typesafe.ai/primitives.md#ask-multiple-questions-together), [models](https://docs.typesafe.ai/models.md#context-length).
- HTTP 200 body: `{ "model": "…", "answers": { "question_id": { "type": "choice", "choice": "…", "confidence": 0.9, "probabilities": { "…": 1.0 } } }, "usage": { "input_tokens": 123, "output_tokens": 12 } }` (illustrative values). Other answer shapes are above. The documented response is completed JSON, not generated prose; no `finish_reason`, streaming completion, job polling, per-question failure union or conversation ID appears in the published schema.
- [Request rules/errors](https://docs.typesafe.ai/api/errors.md): 400 malformed/rule/context failure (`max_tokens_exceeded` for context), 401 auth, 413 body size, 415 encoding, 422 validation, 429 rate limit, 529 overloaded. OpenAPI defines 400 `detail` as string/object and 422 `detail` as validation entries (`loc`, `msg`, `type`, optional `input`/`ctx`); do not assume every transport/intermediary error matches those two bodies.
- Preserve missing/invalid response, network timeout and parse/extraction failure as failures for human review, never `not mentioned` or zero. Validate expected question IDs/types and allowed values before accepting results. Low certainty is distinct from failure; confidence summarizes distribution concentration, not a correctness guarantee ([Score](https://docs.typesafe.ai/primitives/score.md), [official skill](https://raw.githubusercontent.com/typesafe-ai/skills/refs/heads/main/skills/typesafe-ai/SKILL.md)). Review thresholds remain unvalidated on these CVs.

## Cost and limits

- [Models pricing](https://docs.typesafe.ai/models.md): **USD 0.042 per million input tokens** (USD 42/billion), output tokens free for both current versions. Shared state is read/paid once per request; extra instructions/criteria add input tokens. Separate calls resend/pay for the CV again. Rough planning formula: `0.042 × total_billable_input_tokens / 1_000_000`; e.g. 10,000 input tokens costs USD 0.00042. Use returned `usage.input_tokens` for documented post-call accounting, not character count or another model's tokenizer.
- [Parallel questions cookbook](https://docs.typesafe.ai/cookbooks/parallel_questions.md) demonstrates shared-state savings. Its 12.2× cost result is a particular vendor example, **not a CV estimate or batch discount**. No separate batch discount, cached-input rate, minimum charge, exact local tokenizer, preflight token-count/cost estimator or inference dry-run is documented in the reviewed pages/OpenAPI. Failed/interrupted-call billing also remains unspecified there; budget conservatively and obtain clarification before paid work.
- Default limits: **64k tokens/request** (state + all questions), **32k tokens/question** (state + that question). No silent full-CV truncation: an oversized input needs an explicit reviewed handling policy. Optional `TypeSafe-Danger-Zone-Long-Context: true` raises both to 262k at the same token rate; vendor warns of slower/lower-accuracy behavior. This reference does not enable it.
- Body ≤32 MiB, UTF-8 JSON without BOM, nesting ≤64 in state/instructions/criteria; finite numbers only. Compression does not bypass limits. [Errors](https://docs.typesafe.ai/api/errors.md).
- Rate limits are organization-specific tokens/second and requests/second; public docs give no universal numeric allowance and point to the authenticated console. Do not inherit third-party historical figures. [Models](https://docs.typesafe.ai/models.md#rate-limits).

## Python versus direct HTTP

[Official Python SDK](https://docs.typesafe.ai/sdk/python.md): package `typesafe-sdk`, imports from `typesafe_sdk`, synchronous `TypeSafeClient` or asynchronous `AsyncTypeSafeClient`; `system_one(state=…, questions=…, model=…)` accepts typed questions or dictionaries and returns typed answers/usage. SDKs are conveniences over the HTTP API, not an additional model. Direct Python HTTP can serialize the same JSON and parse the response without the SDK; it must own authentication, validation, timeouts and HTTP failures. No installation or Python implementation is included here.

Important SDK behavior: [RetryPolicy](https://docs.typesafe.ai/sdk/python/api/retries.md) defaults to **two retries after the initial attempt**, including 408/429/5xx, connection errors and timeouts; `max_retries=0` disables retries. A later authorized runner needs explicit attempt/spending controls; default retry behavior is not permission to retry uncertain paid requests. [Client reference](https://docs.typesafe.ai/sdk/python/api/clients/sync.md) warns that secret headers are redacted but request/response **bodies are not**: avoid payload logging with CVs.

## Reproducibility and cache implications

- API `state` means supplied content, not a documented persistent server session. Published request/response schemas contain no seed, temperature, conversation/resume ID, idempotency field, cache-control contract or server-side document handle. That does **not** establish zero retention or absence of internal caching; [models/data handling](https://docs.typesafe.ai/models.md#data-handling) points to legal terms and enterprise ZDR.
- Do not promise deterministic reruns. The [official parallel-question experiment](https://docs.typesafe.ai/cookbooks/parallel_questions.md) reports nonzero repeat noise even for identical documents/requests. The [self-consistency Choice cookbook](https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook.md) additionally varies a `uid` field to avoid cache reuse; this is experimental methodology, not a documented required ID or a reason to add random fields to CV state. Exact same-payload determinism and internal randomness/caching mechanisms are not specified.
- Suggested **local** cache provenance (not implemented): exact Markdown hash/parser configuration, explicit run reference date and optional horizon, full question/criteria content **and order**, pinned/requested + returned model, API/SDK version, original complete response/usage, and attempt outcome. Separate original machine answers from human corrections and CSV export choices. Replay stored responses for exact reproducibility; a new provider call is a new observation, not guaranteed reproduction. Cache failure/unknown completion separately; never silently retry it or reuse across different dates/questions/models.
- Official guidance flags Choice option-order bias and untrusted state steering answers ([jaggedness](https://docs.typesafe.ai/model-jaggedness.md)); preserve option order for replay and separately test reordered variants only under future scoped consent. No CV-specific accuracy/calibration evidence was obtained here.

## Supplementary third-party material / unresolved decisions

Read only, **not an official API contract**: [abhisheksharma001/jev-skill](https://github.com/abhisheksharma001/jev-skill/tree/main), specifically [facts.md](https://raw.githubusercontent.com/abhisheksharma001/jev-skill/main/skills/jev/references/facts.md) and [integration.md](https://raw.githubusercontent.com/abhisheksharma001/jev-skill/main/skills/jev/references/integration.md), main observed at `f7620379cb6115067d222c7e0dc5a92dca7d3e6a`. Useful ideas: a narrow adapter, fixtures, model/version provenance and separating uncertainty from errors. Numeric jitter bounds, independent benchmark results, historical limits, SDK versions and fallback prescriptions are **third-party claims**, not adopted guarantees; these files even contain differing SDK-version snapshots. No scripts/instructions were executed. LLM fallbacks, candidate scoring and filtering examples are outside this project's workflow.

Still open: count implementation/quality versus per-item questions; human-review rules and ground truth; exact preflight token estimation, error billing and server caching/idempotency guarantees. Education look-ahead is **optional, relative to the explicit run date** (e.g. 1/6/12 months), not finalized here; do not silently adopt the older two-month proposal in [semantic notes](cv-extraction-semantics.md). Whether expected completion shares a completed-qualification category remains a separate semantic decision.
