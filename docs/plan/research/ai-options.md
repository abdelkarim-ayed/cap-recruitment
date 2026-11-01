# AI research pointers — optional, not implementation requirements

Current selected starter is guarded Noul for configured skills; [current safety/wiring](../../current/jev-safety.md). Broader templates/evidence are [design work](../extraction-design.md). Research does not authorize spending, direct-provider paths or replacing the selected starter.

## Retained findings and sources

Earlier documentation research (2026-10-08 to 2026-10-31; not refreshed here) distinguished typed Jev Choice/Score/Noul from free-form text/list extraction. Multiple questions can share state. Source-excerpt selection is possible in principle but was not selected for the current starter. Confidence/calibration claims are not verified CV accuracy.

- https://docs.typesafe.ai/api
- https://docs.typesafe.ai/models
- https://docs.typesafe.ai/cookbooks/parallel_questions.md
- https://www.langchain.com/blog/building-a-harness-with-jev

Real text-native PDF preparation is now implemented with PDF.js. DOCX/Mammoth and OCR remain options, not integrations. Complex font/layout/reading-order accuracy still needs sample-based verification.

- https://mozilla.github.io/pdf.js/
- https://github.com/mwilliamson/mammoth.js

Other structured-output providers and local inference were investigated only as alternatives. Access, prices, licenses, hardware, privacy/retention and actual task quality must be rechecked before selection; historical price arithmetic is not an account usage measurement. No new service/model installation selected.

- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/pricing
- https://developers.openai.com/api/docs/guides/your-data
- https://ai.google.dev/gemini-api/docs/structured-output
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/terms
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- https://platform.claude.com/docs/en/build-with-claude/pdf-support
- https://github.com/GPT-AGI/OpenJev
- https://github.com/kyegomez/open-jev

Reusable separation: prepare document → typed factual questions/evidence → human correction/export → external selection. No embeddings, automatic ranking or generative model is required merely to represent these boundaries. Fixture demonstrations prove relay/persistence, not model quality.
