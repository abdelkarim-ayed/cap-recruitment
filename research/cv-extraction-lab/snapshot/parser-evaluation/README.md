# Parser evaluation workspace

This folder is for inspecting document-parsing pipelines against the synthetic CV corpus. It is separate from the corpus-generation workflow.

## LiteParse

LiteParse is installed globally with `uv tool install liteparse` (currently `2.18.0`). Its `lit` command is available on the shell PATH. For text-based CV PDFs, start with OCR disabled:

```sh
lit parse /path/to/cv.pdf --format json --no-ocr -o outputs/liteparse/result.json
```

Existing parser outputs live under `outputs/`. Native-text pdf-inspector
extraction uses the installed Python API (the wheel has no CLI entry point).
`scripts/parse_native.py` extracts explicitly supplied PDFs to a fresh directory,
without OCR or remote services, and saves small provenance summaries alongside
Markdown. The five-PDF semantic experiment is recorded in
[semantic batch 001](cvextract/templates/semantic-batch-001/README.md).

All 63 template-based PDFs (60 numbered identities plus alternate/additional
variants) now have a separate native-text snapshot under
[corpus-native-001](outputs/pdf-inspector/corpus-native-001/README.md).
Six jsume outputs carry encoding warnings; successful extraction is not quality
validation. No OCR or inference was run for this preprocessing.

## Workspace layout

- `outputs/<parser>/` — parser results, organized by tool
- `notes/` — run settings, observations, and comparisons
- `scripts/` — repeatable commands or small evaluation helpers, if needed

The source PDFs remain in the corpus outputs; reference them by path rather than duplicating them unless a run requires a separate input copy.

## Jev extraction CLI

For transfer into the HR platform, start with the
[research/integration handoff](../docs/cv-extraction-handoff.md). The CLI is
temporary experiment tooling, not the intended production job interface.

[cvextract](cvextract/README.md) is a separate nested uv project for manually
sending one hydrated native Jev request over already-parsed Markdown/plain text.
It includes dry-run inspection, exact-request caching and a persistent spending
latch. It does not change this parser environment. Normal execution can spend;
read its guide before use. Question phrasing/generators remain future research.
