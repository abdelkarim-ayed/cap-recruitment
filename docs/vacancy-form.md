# Vacancy intake and extraction

## Confirmed direction
Hybrid intake, not mandatory CV-first. HR selects contact fields, documents, explicit questions, and extraction tasks. Ask candidates directly where extraction is unreliable; reduce repetitive work where extraction is practical. Keep candidate answers and extracted values distinct for comparison/export.

Current backend scope is extraction, not qualification, filtering, scoring, or rejection. HR reviews facts and makes decisions manually or with external spreadsheets/scripts. NLP, skill dictionaries, rules, and typed classifiers are candidates; no commitment to a generative LLM.

## Input-scoped configuration direction
An ordered input list with a separate selected-input settings area. Add/remove premade or custom inputs; each input owns its name, label, type, required flag, arguments, and optional processing tasks. A CV input owns its extraction tasks, not a global extraction toggle.

Keep input arguments (slider min/max/step, choices, file limits) distinct from optional task arguments (skills to extract, request evidence, highest education only). Candidate rendering and backend task plans derive from this configuration. Exact first supported presets remain open.

Example: source `cv`; extractor `skills`; output `extracted_skills`; arguments `React, SQL, project management` and an approved alias dictionary. A second task could extract education. Output columns can be internal-only or paired with explicit candidate answers.

Default identity core remains verified email/name. Proposed field catalog: contact details, CV, portfolio link, availability, education, skills, and generic text/number/slider/yes-no/single-choice/multi-choice fields. First supported field and extractor list is not locked.

Use a bounded extractor registry with parameter forms, not arbitrary executable expressions or a text prompt promising unsupported extraction. Premade fields offer compatible task presets. Group abstraction is optional later, not needed for current ordered-input ownership.

## Approved editor refinements for the real application
- User accepts the custom domain-editor approach demonstrated by the second spike.
- Standard fields usually unique per application (e.g. main CV, contact fields) use on/off chips, not repeated Add buttons. Custom questions/additional documents remain repeatable.
- Expand the premade field catalog; exact entries remain to be selected. Proposed: phone, location, portfolio, availability, education, declared skills, cover letter, supporting document.
- Show clear upload labels, supported types/size limits, and useful validation errors. Prototype implementation warnings are not normal candidate-facing copy; fixture/demo provenance still stays honest.
- Add a display-only separator/section-title element. It generates no answer column or processing task.
- Keep form structure selection visually separated from selected-input settings, with candidate preview alongside.

## Result contract
- Candidate answer, extracted suggestion, and reviewed value remain separate.
- Extraction may return a value or unknown; confidence only where meaningful, evidence where supported.
- Review status is separate from the value; every result can be corrected.
- Save source document and configuration versions so edits do not silently rewrite submitted applications.
- Required document/answer controls submission completeness, not candidate eligibility.
- Internal notes/attachments and extraction configuration stay out of candidate-visible responses unless explicitly intended for publication.

## Export
CSV can contain stable application IDs, explicit answers, extracted values, and reviewed values. External tools handle qualification/formulas. Decision reimport is deferred pending validation, confirmation, and audit design.

## Library shortlist
See `form-tooling.md`: current custom-editor/RJSF spike and historical library research. Production renderer integration is not finalized.

## Open
Production renderer, first extractors and parameters, export shape, candidate editing after submission, and exact document constraints. Domain-editor direction is accepted; generic visual-builder selection is no longer a blocker.
