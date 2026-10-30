# Presentation review plan

## Current state
Shared PDF now tracked at `exports/status.pdf`; `pdf:build` updates it. Old `dist/status.pdf` references below are historical. Intermediate outputs/PNG previews stay ignored; inspect only selected low-resolution pages when needed.
Revised French script and PDF ready for review: 30 contents + six section dividers = 36 pages. Nominal titles, explicit requirements, Textkernel in the existing-solutions review, prose backlog and direct conclusion. Three diagrams coded/rendered: UML use cases, conceptual classes and architecture, with Mermaid/DOT sources and Graphviz/WASM SVG rendering. Six user-provided images integrated on pages 3/20/21/22/25/27 with no crop; dense portrait captures may need user-directed framing adjustments. Proposed CAP name and content/visual approval remain pending. Cover values provided except institution/program; methodology label/context/duration still to confirm. Reveal remains a tooling placeholder. Earlier outlines are historical; draft.md is authoritative. Obsolete repeated-image placeholder archived under ignored docs/.ignore/tmp/presentation/.

## Checkpoints
1. **Structure:** review supplied example(s), agree presentation sections and scope. Keep report detail separate from slide content.
2. **Point-only pre-draft:** fill notes.md with facts/points and uncertainties; user revises before prose.
3. **Draft:** write slide titles/text/speaker notes from approved points. User reviews; iterate.
4. **Visual plan:** insert named placeholders such as `[IMG-01 — description]` / `[DIA-01 — purpose]`. Give a bulk prompt list with filenames, aspect ratios and intended slide placement. No silent image generation.
5. **Assets:** create approved Mermaid diagrams; user returns named images. Record asset provenance and confirm what each depicts. Illustrations must not pretend to be application screenshots or evaluation evidence.
6. **Assembly:** implement the approved narrative in the selected Reveal/Typst source; produce draft PDF. User checks readability/content, then revise/export.
7. **Optional report-support log:** organize existing decisions/implementation/checks and known gaps into a linked notes log. Not a fabricated audit trail, not required before the meeting.

## Session continuity
Keep this session while context is helpful. A new session is optional, not needed for tooling. If switching, hand off this folder, current review checkpoint and docs/status.md; do not rely on chat memory alone. No presentation-only subagents or extra services authorized by this plan.
