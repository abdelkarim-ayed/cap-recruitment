# AI options — researched, not selected

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
