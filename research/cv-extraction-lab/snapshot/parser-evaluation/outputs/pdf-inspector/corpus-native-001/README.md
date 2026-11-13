# Complete native-text PDF preprocessing

Prepared 2026-11-12 from **all 63 PDFs** under `template-based/outputs/`: numbered
CV identities 001–060, alternate layouts for 003 and 024, plus
`precv-french-001-jsume`. Synthetic provenance is unchanged. Different layouts
of one CV are not independent candidate examples for future evaluation splits.

- pdf-inspector **1.25.2**, Python `process_pdf`, native text only.
- **63 Markdown files / 63 provenance summaries**, 64 PDF pages total.
- Nonempty extracted Markdown: **116848 UTF-8 bytes** in total.
- All classified `text_based`; no OCR routing flags. No OCR performed.
- **Six encoding warnings**, all jsume: `precv-003`, `precv-031`, `precv-052`,
  `precv-054`, `precv-058`, `precv-french-001`. Keep their diagnostic flags visible.
- No Jev/provider calls, credentials, source-Markdown reading, source-data edits,
  rendering or image/screenshot work. Earlier parser results were preserved.

Each `<pdf-stem>.md` has a sibling `<pdf-stem>-summary.json` recording source PDF
path and hash, Markdown path and hash, version, page count and parser warnings.
All Markdown came from the PDFs; none was copied from corpus source Markdown.
Only parser summaries were aggregated across this full corpus; these files have
not all received content review, source-PDF verification or ground-truth labels.
No encoding warning is **not** a guarantee of correct text, layout or dates.

The local helper `parser-evaluation/scripts/parse_native.py` accepts explicit PDF
paths and `--output-dir`, refuses existing outputs and does not call OCR/remote
services. The preprocessing run used all PDF paths from a sorted recursive
inventory of `template-based/outputs/`. Do not silently replace this snapshot
after parser upgrades; choose a new output directory for comparisons.

Metadata-only overview, from repository root:

```sh
jq -s '{documents:length, encoding_warnings:map(select(.has_encoding_issues) | .markdown_path)}' \
  parser-evaluation/outputs/pdf-inspector/corpus-native-001/*-summary.json
```

Next evaluation selection remains manual. Separate clean/easy cases from
ambiguous or parser-damaged cases, retain cross-layout grouping, and review
expected answers before computing success percentages. Preprocessing this corpus
does not authorize bulk Jev requests or automatically change question forms.
