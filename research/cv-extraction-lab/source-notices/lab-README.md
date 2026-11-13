# CV extraction lab

Twenty **entirely synthetic** CVs for inspecting PDF parsing and, later, separately authorized extraction experiments. All people, employment histories, education records, achievements and credential claims are invented. Institutions/employers are fictional; locations, technologies and some qualification names are real vocabulary. Any resemblance to a real person or organization is incidental. Emails and links use reserved example domains; telephone numbers use fictional-number ranges.

The PDFs intentionally read as ordinary CVs: no fixture labels, instructions to an AI, assertions about absent skills, ratings, photographs, charts or progress bars. This README and `manifest.json` retain synthetic provenance outside the CV page content. Do not use these documents as genuine applications or credential evidence.

## Outputs

- `typst/cv01.typ` … `typst/cv20.typ`: generated, editable Typst sources.
- `pdf/cv01.pdf` … `pdf/cv20.pdf`: text PDFs, compiled locally with Typst.
- `text/cv01.txt` … `text/cv20.txt`: diagnostic text extracted with pypdf, not model output or ground truth.
- `data/cvs.json`: authoritative synthetic content and layout choices.
- `templates/resume.typ`: shared restrained layout variants.
- `manifest.json`: file hashes, page/text counts, language/layout and corpus provenance.
- [CATALOG.md](CATALOG.md): compact index with links to each PDF and Typst source.

The corpus varies profession, seniority, completeness, chronology granularity, section order, prose/bullets, separators, dates, font and single/two-column layout. Some CVs are sparse or generic rather than deliberately adversarial. Claimed years belong in profile/experience, not numerical ratings attached to skills. A missing field is simply omitted.

## Use

Requires Python 3.11+ and [uv](https://docs.astral.sh/uv/). Dependencies and the embedded Typst compiler are project-local; no global Typst install is needed.

```sh
uv sync --locked
uv run cv-lab build
uv run cv-lab verify
uv run cv-lab list
uv run python -m unittest discover -s tests -v
```

`build` regenerates the numbered sources/PDFs, extracted text and manifest. Edit `data/cvs.json` for reproducible content changes; direct edits to generated `.typ` files will be replaced by the next build. To compile an edited source without regenerating it:

```sh
uv run cv-lab compile cv01
```

Font fallbacks use Liberation/DejaVu families. The build records the compiler package version; hashes can differ across compiler/font environments. Text extraction checks establish that files compile and contain text, not correct visual reading order or successful semantic extraction. Inspect the PDFs yourself before choosing evaluation cases.

## Boundaries

No Jev/TypeSafe calls, SDK, API keys, spending counters, extraction runner or recruitment database integration exists here. No extraction accuracy/evaluation result is claimed. Any future live evaluation needs its own explicit budget/input scope and the recruitment project's spending gateway; this repository is not permission or a route to bypass it. No real CVs were copied or downloaded to create this corpus.
