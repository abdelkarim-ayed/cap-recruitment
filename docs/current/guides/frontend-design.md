# Enterprise UI — design rules
1. Light slate canvas with white working surfaces.
2. Thin neutral borders and restrained shadows.
3. Dark slate typography with a single blue action accent.
4. Persistent compact navigation and clear page headings.
5. Shadcn-style buttons, inputs, badges and cards using accessible native elements.
6. Consistent spacing, readable labels and visible keyboard focus.
7. Tables lead HR work; forms lead vacancy and candidate work.
8. Text-labelled statuses; colour is supplementary.
9. Explicit loading, empty, success and recoverable error states.
10. Minimal motion, responsive layouts, no decorative charts or invented metrics.

Implementation uses React/Vite with local styled components/native controls, not an installed shadcn component registry. Browser testing remains manual; backend, build and relevant component/model checks are automated.

The requested 2026-11-09 [intent-led UI/UX overhaul](../../plan/ui-ux-overhaul.md) adds entity/role/intent, navigation/action/dialog, state-retention and concrete HR page guidance for future work. It is a plan, not a claim the current interface already follows it. Keep implemented behavior/contracts and verification limits separate as bounded slices ship.
