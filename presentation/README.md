# Progress-meeting presentation workspace

Separate development tooling, not part of the recruitment app/runtime. No presentation structure/content approved yet; current deck/PDF is a **tooling placeholder only**.

- [brief.md](brief.md): purpose, constraints and pending inputs.
- [plan.md](plan.md): agreed review gates and current state.
- [notes.md](notes.md): empty point-only pre-draft, awaiting reference/structure.
- `deck/`: Reveal.js browser presentation; Mermaid available for approved diagrams.
- `pdf/`: Typst PDF source. Choose one final deck source before drafting; these are alternatives, not two independently maintained presentations.
- `diagrams/`: named `.mmd` diagram sources, once approved.
- `assets/images/`: user-supplied/generated visuals; catalogue in `assets/manifest.json`.
- `dist/`: ignored generated HTML/PDF/SVG outputs.

## Tooling
From project root:
```sh
pnpm --filter @recruitment/presentation deck:dev
pnpm --filter @recruitment/presentation deck:build
pnpm --filter @recruitment/presentation diagram:check
pnpm --filter @recruitment/presentation pdf:build
```
Reveal preview: **http://localhost:5174**, separate from app port 5173. Start in named RMUX `presentation` tab when preview is requested. Vite host is loopback; no app process changes. Tool scripts deliberately avoid generic build/dev/test names so normal application workspace commands do not start/build the presentation.

Typst uses the local official compiler at `.local/tools/typst-0.15.1/typst`, or `TYPST_BIN`/an existing PATH installation. No global install/config. The wrapper restricts the default compilation root to this presentation folder. No Typst-specific agent skill is currently available.
Installed from [official Typst v0.15.1 release](https://github.com/typst/typst/releases/tag/v0.15.1), Linux x86_64 musl archive. Binary is ignored under .local; a fresh checkout needs that compiler installed again. Reveal.js 6.0.2, Mermaid 12.1.0 and jsdom 30.1.2 are pinned dev tools; jsdom supports syntax checks without browser automation. Vite reuses the existing workspace tool version.

Setup verified: frozen pnpm install, deck build, Mermaid syntax self-check and Typst compilation to `presentation/dist/status.pdf`. This PDF/deck contains only the setup placeholder—not a status presentation. Reveal build emits a large-diagram-chunk warning; Mermaid is lazy-loaded only when a diagram exists. Browser layout/print output remains unverified. No presentation server was started; existing app/retention tabs were left untouched.

Reveal PDF alternative: open `http://localhost:5174/?print-pdf`, then browser Print → Save as PDF, landscape/no headers/footers. Check page sizing and fonts manually. No browser automation or browser rendering verification performed during setup. Typst produces PDF directly without a browser.

## Working agreement
References → proposed structure → point-only notes → user feedback → prose draft → iterations/image placeholders → diagram sources + bulk image prompts → returned assets → formatted deck/PDF → review/final export. Do not skip content approval because tooling is ready. See plan.md.

Technical facts come from project docs/tests. Keep mock/live, implemented/planned and verified/unverified distinct. Never publish secrets, captured codes, cookies, real applicant data or the ignored root briefing. Before tracking any user reference/image, check whether it is sensitive; private material stays under `docs/.ignore/private/` and is not published.
