# Form tooling research — optional future reference

Research date: 2026-10-09. Historical experiment, retained only as optional future reference. Ginkgo/RJSF were tested in an isolated gitignored spike; Form.io and SurveyJS were not integration-tested. User preferred custom domain authoring. The application now uses a native React editor/renderer over shared typed schemas, not Ginkgo/RJSF. No library migration is selected; current behavior is in [vacancy contract](../../current/contracts/vacancy-api.md).

## First candidate: Ginkgo builder + react-jsonschema-form (RJSF)
- Ginkgo supplies a React visual authoring component producing JSON Schema and UI schema. Apache-2.0.
- Its current repository documents React 19+, Node 20+, and MUI 7+ dependencies.
- RJSF renders JSON Schema forms and offers theme/custom-widget integration; Apache-2.0.
- Ginkgo documents developer-defined elements such as file inputs. File storage still requires our backend integration; do not inline large CVs in answer JSON.
- This pairing could cover generic questions, options, ordering, preview, and validation. Extraction editor, review UI, permissions, versioning, and CSV are our domain code.
- Isolated spike verified published Ginkgo 4.2.0, React 19.3.0, and MUI 7.3.11: typecheck/production build and four DOM/schema tests pass. Both simple custom authoring and Ginkgo mounting/external schema insertion work with the shared definition. Actual visual usability and extraction-specific Ginkgo customization remain unverified.
- Spike location: `docs/.ignore/tmp/form-spike/`; its README provides manual test instructions. No real upload/extraction/backend. Combined bundle is about 1.09 MB minified / 344 KB gzip; lazy-loading the HR editor would be worth evaluating if selected. Percentage coverage is not measured.

Sources:
- https://github.com/ginkgobioworks/react-json-schema-form-builder
- https://raw.githubusercontent.com/ginkgobioworks/react-json-schema-form-builder/main/package.json
- https://rjsf-team.github.io/react-jsonschema-form/docs

## Richer alternative: Form.io frontend builder + renderer
- React wrapper documents both `FormBuilder` and `Form`, accepting JSON form definitions; using these frontend components does not require adopting Form.io authentication or hosted APIs.
- Official license table lists frontend renderer/SDK and React wrapper as MIT, while the server core is OSL-3.0. Recheck the exact selected packages/licenses before adoption.
- More integrated features, but larger configuration/styling surface. Restrict to allowlisted components/settings; no arbitrary JavaScript rules or external data sources.
- Our NestJS backend would store schemas/answers and handle uploads; upload integration still needs verification.

Sources:
- https://github.com/formio/react
- https://form.io/open-source

## Other options
- SurveyJS: MIT renderer, commercial visual Creator. Not the default free-builder choice.
- Small premade-field editor + RJSF or React Hook Form: bounded fallback if visual-builder integration costs more than it saves. No custom drag-and-drop framework.

Current direction: custom premade-field/input editor owns arguments and processing options; renderer is reusable and replaceable. No library provides the recruitment extraction workflow out of the box.

Second iteration: 7 tests and typecheck/production build pass. Input-owned tasks survive selection changes and are removed with their document or incompatible type changes. Slider/file parameters drive preview. No actual extraction/upload/backend. Bundle about 894 KB minified / 286 KB gzip. Current manual instructions are in the ignored spike README; first-iteration Ginkgo findings above are historical evidence, not the selected authoring design.
