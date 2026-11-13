# Request-template register

Keep request templates here and semantic observations in this register. Template
names identify research revisions, **not** cache-key metadata. Preserve a revision
once used for a run; put changed phrasing/choices into a new numbered file.
The full hydrated request/response cache remains the reproducibility artifact.
Never put API keys or hydrated CV text in templates.

Reusable forms: [snippets](../snippets/README.md).
Next series: [semantic batch 001](semantic-batch-001/README.md), five freshly
PDF-inspector-parsed PDFs, with one user-run request prepared at a time.

[Semantic batch 002](semantic-batch-002/README.md) prepares eight further CVs
across Calligraphics, Cobalt, Metronic, JSume and Vercanard, using the same
baseline (v001 plus coverage v002). Its arguments/provisional readings are saved
in a matrix; eight explicit user-run calls stop on failure. User results are now
recorded with full distributions/cache references: 42 clearer provisional
agreements, six pre-flagged unresolved fields; not a measured accuracy percentage.

[Semantic batch 003](semantic-batch-003/README.md) prepares at most five targeted
user-run requests (18 questions) on failing/weak cases: skill linkage, a controlled
formatting derivative, count diagnostics, date wording and positive controls.
Original forms/snapshots are preserved. Five user-run results are recorded:
skill-evidence v002 did not fix the named-Excel inference, count winners agreed,
and date wording reduced but retained unsupported upper-bin probability. Full
distributions/cache references are preserved; no assistant calls or extra reruns.

## maintenance-v001

- Template: [maintenance-v001.json](maintenance-v001.json).
- Intended input: `parser-evaluation/outputs/liteparse/precv-010-vantage-cv.md`
  (native-text/no-OCR variant, not pdf-inspector or OCR output).
- Fixed reference date: **2026-11-12**, deliberately literal for cache stability.
- One request, five Choice questions: one per extraction family. No explanations,
  citations, expiry checking, expected-education window or confidence transforms.
- **Status: user reported one completed run**, matching all five provisional
  readings below. Not independently rerun or source-PDF-verified; no generalized
  accuracy finding. These remain readings of parsed text, not ground truth.

| Question | Provisional expected choice | Document basis / semantic issue |
| --- | --- | --- |
| Education, scoped to facilities/building maintenance | `vocational_technical` | Education lists City & Guilds NVQ Level 3 in Facilities Management, 2020–2022. Treating this as completed is an interpretation of a dated education entry, not independent proof. NVQ Level 3 must not become a bachelor's degree. |
| One certification, aliases, no validity | `present` | IOSH Managing Safely appears under Achievements/Certifications. The section has merged dates/other credential names; do not infer validity or authenticate it. |
| Relevant employment duration, five original bins | `8_plus` | June 2018–February 2022 technician work and March 2022–present supervision already span more than eight years at the reference date; the 2015–2018 facilities assistant period adds support. No exact duration claimed. |
| Coverage across CMMS, Excel, contractor management, welding | `3` | CMMS and Excel appear in Tools; contractor management is listed and supported by contractor liaison. Welding is not evidenced. |
| Specific CMMS evidence | `stated_or_studied` | Tools says CMMS (basic), but no concrete role/activity is explicitly linked to CMMS. Asset registers alone must not imply CMMS use. |

### What this revision probes

- A non-IT domain, with scopes/names/lists that could later become arguments.
- Distinguishing a vocational qualification from higher education.
- Credential naming without validity arithmetic or extra questions.
- Broad experience bins, using documented roles instead of trusting the summary.
- A single count Choice, intentionally testing the desired cheap strategy despite
  the official counting limitation; **not** assumed reliable.
- Avoiding an unsupported jump from a tools-list mention to professional use.

Open semantic limits: school-only qualifications outside a narrow scope; ambiguity
about completed versus attended education; omitted experience; vague/overlapping
dates; expected graduation; expiry; coverage synonyms; and boundary cases across
other fields. This single CV cannot settle those questions. Choice probabilities
are preserved, but low confidence is not equivalent to missing evidence.

### Run record (user-supplied result)

- Outcome: user supplied a response for `jev-1.14.0` and cache path.
- Request SHA-256: `6d45ffb28bde3223d8a3d5a46c6a0da85efe58e46efd4787262d5e012a278e74`.
- Response: `/home/ubuntu/.cache/cvextract/requests/6d45ffb28bde3223d8a3d5a46c6a0da85efe58e46efd4787262d5e012a278e74/attempts/f3148652351949ffa3701c5b72fdd4e3/response.json`.
- Usage: **2009 input / 305 output tokens**; account charge not verified.
- Disagreements: none against provisional readings; no ground-truth accuracy or
  calibration claim follows from one selected CV.
- Next: [forms-v001](../snippets/README.md), removing CV-specific hints and
  moving configurable content into state arguments. This is a new untested form.

| ID | Returned choice | Confidence | Reported probabilities |
| --- | --- | --- | --- |
| `education_level` | `vocational_technical` | 1.0 | Winning option 1.0; others 0.0. |
| `certification` | `present` | 1.0 | Present 1.0; not mentioned 0.0. |
| `experience_years` | `8_plus` | 0.98 | 8+ 0.98; 5–under 8 0.02; others 0.0. |
| `skill_coverage` | `3` | 1.0 | Count 3 is 1.0; other counts 0.0. |
| `skill_evidence` | `stated_or_studied` | 0.97 | Stated/studied 0.98; not mentioned 0.01; applied 0.0; professional 0.01. |

Record actual artifacts and disagreements before calling a phrasing successful.
Do not silently change a question based only on the provisional expected answer;
compare across other CVs/fields in separately authorized manual runs.
