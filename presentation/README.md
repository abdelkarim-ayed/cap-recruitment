# Présentation d’avancement

**[Ouvrir le PDF partagé](exports/status.pdf)** — seul export binaire publié. `pdf:build` actualise désormais `exports/status.pdf` (suivi par Git) ; `dist/` reste ignoré pour les intermédiaires, SVG de rendu et aperçus PNG. L’ancien `dist/status.pdf` peut subsister localement mais n’est plus la référence. Après modification, reconstruire et committer le PDF avec ses sources.

Contrôle visuel : privilégier la compilation PDF ; rasteriser uniquement les pages à examiner, à basse résolution (par exemple `--pages 20,21 --ppi 70`), jamais systématiquement les 36 pages. Ne lire que les aperçus nécessaires.

## Version courante

**PDF : [`exports/status.pdf`](exports/status.pdf)**. 36 pages : 30 contenus et six intercalaires. Couverture CAP (nom proposé), trois diagrammes et six images utilisateur intégrées sans recadrage. Auteur/encadrant/organisme/date renseignés ; établissement/formation reste à compléter. Contenu et cadrage soumis à relecture.

- [draft.md](draft.md) : texte et notes orales actuels.
- [metadata.json](metadata.json) : nom, sous-titre, auteur, encadrement, établissement, organisme et date.
- [assets/requests.md](assets/requests.md) : visuels reçus, noms de fichiers, pages et prompt externe initial.
- [assets/manifest.json](assets/manifest.json) : provenance et état des visuels.
- [diagrams/README.md](diagrams/README.md) : sources Mermaid/DOT et rendu.
- [notes.md](notes.md) : sources et ancien découpage, remplacé par draft.md.
- [brief.md](brief.md), [plan.md](plan.md), [style-notes.md](style-notes.md) : contraintes, validation et direction visuelle.

## Construction

Depuis la racine :
```sh
pnpm --filter @recruitment/presentation pdf:build
pnpm --filter @recruitment/presentation diagram:check
```

La construction lit draft.md, insère les intercalaires, écrit `dist/reading-slides.json` et `dist/page-map.md`, produit les SVG puis compile Typst. Les images retournées dans `assets/images/` sous les noms attendus remplacent automatiquement les emplacements vides à la construction suivante. Notes orales conservées dans le script/JSON, sources courtes dans les pieds de page concernés.

`pdf/main.typ` est le rendu actif. Typst officiel **0.15.1** installé localement dans `.local/tools/typst-0.15.1/typst`, ou `TYPST_BIN`/PATH ; aucun réglage global. Racine de compilation limitée à presentation par la commande. Un nouveau checkout doit réinstaller le [compilateur officiel](https://github.com/typst/typst/releases/tag/v0.15.1).

Les diagrammes de classes/architecture ont une source commune `diagrams/models.mjs`, qui produit Mermaid et DOT. Les cas d’utilisation UML sont définis directement en DOT. SVG rendus par **@viz-js/viz 3.31.0** (Graphviz/WASM), sans navigateur ni installation système ; Mermaid **12.1.0** vérifie les `.mmd`, avec jsdom **30.1.2**. Tout est une dépendance de développement de ce workspace.

PDF vérifié : compilation, 36 pages, syntaxe Mermaid et inspection de pages rasterisées représentatives (couverture, tableaux, diagrammes, sections, texte). Sorties PDF/SVG/PNG sous `dist/`, ignorées. Données et services de l’application inchangés.

## Reveal.js disponible

Reveal.js **6.0.2** et Vite sont installés ; `deck/` reste le placeholder initial, sans second draft à maintenir. `deck:dev` sert sur `http://localhost:5174`, `deck:build` compile le placeholder. Aucun serveur de présentation ni navigateur lancé. Si prévisualisation web demandée, utiliser un onglet RMUX nommé `presentation`, selon docs/rmux.md.

## Relecture

Structure → points → draft → retours → visuels → assemblage → relecture finale. L’utilisateur a autorisé l’assemblage et les diagrammes pour faciliter la lecture ; cela ne vaut pas approbation finale du texte. En attente : retours sur le contenu/cadrage et établissement/formation. Ne pas convertir une proposition en décision métier, ni une fixture en résultat IA réel. Sources techniques dans docs/ ; contextes sensibles et données réelles restent hors des artefacts publiables.
