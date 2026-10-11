# Diagram sources

Approved diagrams will use names such as `DIA-01-workflow.mmd`. Keep editable Mermaid source alongside its eventual rendering. Use project evidence, distinguish current/proposed architecture and avoid real identities/credentials.

`pnpm --filter @recruitment/presentation diagram:check` checks `.mmd` syntax. With no files it runs a neutral tooling self-check, not a project diagram. Mermaid rendering happens in the browser deck; SVG export/PDF embedding can be added when the approved visual plan needs it.
