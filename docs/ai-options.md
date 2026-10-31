# AI options — researched, not selected

Research history below is not current implementation/permission. Read jev-gateway-handoff.md and load `typesafe-ai` before Jev work: all real calls must use the mandatory gateway; no paid/limit tests or safeguard changes without consent. User's total development/showcase budget ceiling is $5. Branch target is predefined skills only; final method/question design remains unselected. Latest scope/changeability feedback: product-checkpoint.md. Model/pricing examples retain their original research dates and are not measured charges or evaluation results.

## Progress-meeting recommendation (2026-10-10)
With less than a day to the progress meeting, demonstrate the working intake → explicitly labelled fixture extraction → optional HR correction → export flow first. **Do not turn a provider experiment into the demo's dependency.** No live calls or extraction accuracy measurements were made in this batch.

### Smallest realistic next integration
1. Implement DocumentTextReader for bounded text-native PDFs (PDF.js) and DOCX raw text (Mammoth); reject unsupported/encrypted/scanned documents explicitly. OCR is a separate later option. Keep parsing isolated/bounded; uploaded extension alone is not proof of format.
2. Add one TaskExecutor using an already-available paid API account, JSON-schema structured output and local validation. Request only configured skills plus short verbatim evidence. Verify evidence occurs in source text; schema validity is not factual accuracy. Treat document text as data, not tool instructions.
3. Extend the current fixture/disabled provenance union with explicit live provider/model metadata; add AbortSignal cancellation and provider error/retry mapping. Current 10-second local timeout is not enough to assume all model calls finish: bound total request time deliberately, preserve lease fencing.
4. Try a small manually checked synthetic set (plain, two-column, French/English, no matching skills, unsupported file, adversarial instructions). Report disagreements, nulls and latency honestly; no claimed quality score without evaluation. No ranking/rejection or embeddings needed.

### Realistic options
| Option | Fit for this implementation | Caveat before the meeting |
| --- | --- | --- |
| OpenAI structured output | Direct TypeScript SDK/HTTP, JSON Schema; fits existing text → typed skills/evidence port | Use a model actually enabled on the user's account. API access/billing is not implied by a chat subscription. No need for agents/tools/RAG |
| Gemini structured output | JS SDK/HTTP with JSON schema; cost-focused Flash/Flash-Lite models; PDF understanding available separately | Free-tier terms differ from paid; use synthetic documents for experiments. Region/quota/account availability not checked |
| Claude structured output | JSON-schema output and TypeScript support; direct PDF text+image handling available | Native PDF path changes our current text-reader architecture; DOCX needs conversion/text extraction. PDF visual tokens increase cost |
| Jev | Direct HTTP Choice/Score/Noul for bounded factual classification | Not a general free-form skills/evidence generator or document parser. Skills could map to per-skill questions, but thresholds/evidence mapping need evaluation; not the fastest drop-in |
| Local model | Possible later behind same interface | Hardware/model/license/download/inference quality unverified. Do not introduce serving infrastructure before this meeting |

### Cost/data notes, checked against current primary docs
- Gemini 3.5 Flash-Lite standard paid pricing shown: $0.30/input MTok, $2.50/output MTok. Hypothetical text-only 3000 input + 500 output tokens ≈ **$0.00215/document**, before retries/thinking beyond the assumption, parsing/OCR, taxes or other features. This is arithmetic, not measured usage.
- Claude Haiku 5.5 pricing shown for prompts ≤100k tokens: $0.10/input MTok, $0.50/output MTok; same hypothetical input/output ≈ **$0.00055/document**. Larger prompt tier differs. Model access/quality not verified; cheap tokens alone do not establish suitability.
- No OpenAI price quote recorded here: choose the account-available model and verify its current published rates before estimating. For this small demo, access + reliable output matters more than theoretical fractions of a cent.
- OpenAI API documentation says content is not used for training by default unless opted in; default abuse-monitoring retention can be up to 30 days, with exceptions/controls. Not equivalent to zero retention.
- Gemini pricing distinguishes free-tier product improvement from paid; unpaid-service terms warn against personal/confidential data. Do not send real applicant CVs merely to try a free key. Provider-specific storage/retention and company approval remain decisions before live use.

Sources read 2026-10-10 (documentation, no account/API integration test):
- https://platform.openai.com/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/pricing
- https://developers.openai.com/api/docs/guides/your-data
- https://ai.google.dev/gemini-api/docs/structured-output
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/terms
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- https://platform.claude.com/docs/en/build-with-claude/pdf-support
- https://platform.claude.com/docs/en/about-claude/pricing
- https://docs.typesafe.ai/introduction/quickstart
- https://mozilla.github.io/pdf.js/
- https://github.com/mwilliamson/mammoth.js

Current scope supersedes the screening proposals below: extract HR-selected facts, compare with candidate answers, review, and export. Automated qualification/filtering/ranking is external. Typed factual classification remains a possible extraction method.

## Separate responsibilities
1. Extract document text (PDF/DOCX; OCR optional).
2. Extract/normalize profile facts and source evidence.
3. Assess job-specific typed questions.
4. Review/export facts; apply qualification/ranking policy externally.

Jev can serve step 3 without necessarily serving step 2. Embeddings are neither required for parsing nor for deterministic screening.

## Jev findings (2026-10-08)
- Official quickstart documents Choice, Score, and Noul (yes/no probability) outputs; multiple questions can be sent per request.
- These are not arbitrary strings, lists, or unrestricted numeric fact extraction. Bounded facts can be represented as Choices (e.g. experience bands or supplied year values); Score is an ordered assessment. Correct fact interpretation still needs testing.
- Jev may select an evidence excerpt if source excerpts are supplied as choices. It does not generate unrestricted source citations or explanatory text; selecting an excerpt still requires checking that it supports the answer.
- Direct HTTP API is available, so the TypeScript backend does not need Python or LangChain just to call it.
- The LangChain integration shown in the linked article is Python.
- Provider claims of calibration, cost, and latency are not evidence of accuracy on our CV screening task. Typed validity does not establish factual correctness.
- Source excerpts need a separate extraction/evidence mechanism; do not invent citations from classification probabilities.
- Access, pricing, data-handling terms, and task suitability must be checked before commitment.

Sources:
- https://docs.typesafe.ai/introduction/quickstart
- https://www.langchain.com/blog/building-a-harness-with-jev
- https://typesafe.ai/blog/introducing-system-one-models-and-jev

Open-source candidates surfaced, not evaluated for license, quality, compute requirements, or calibration:
- https://github.com/GPT-AGI/OpenJev
- https://github.com/kyegomez/open-jev

## Proposed fixture and recovery contract
- Server-configured provider mode, not candidate-controlled file metadata or a public request flag.
- Stable synthetic fixture scenarios: match, mismatch, unknown, conflicting evidence, unsupported document, transient provider failure.
- Save provenance: source, provider/model or fixture version, document/question revisions, processing state, and evidence where available.
- Preserve identical result shape across providers where meaningful. Do not invent confidence values for a rules fallback.
- AI failures must not prevent manual profile review or core recruitment work.
- Fixture behavior is visibly identifiable in demo/development; no assertion that mocked results are live AI.

## Deferred screening
Previously discussed qualification buckets and automatic rejection are not current requirements. If reintroduced, require explicit approval and uncertainty/override handling.
