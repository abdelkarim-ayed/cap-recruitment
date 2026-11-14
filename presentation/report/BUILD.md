# Construction du rapport

## Commandes

Depuis la racine du dépôt :

```sh
pnpm --filter @recruitment/presentation report:build
pnpm --filter @recruitment/presentation report:pages
```

La première commande rend les sources vectorielles, assemble les neuf manuscrits et compile `presentation/exports/report.pdf`. La seconde lit la métadonnée du nombre de pages du corps, sans images de pages. Typst local 0.15.1 est utilisé via `presentation/scripts/typst.mjs` ; `TYPST_BIN` permet un compilateur explicite.

## Sources

- `chapters/00…07` : introduction, six chapitres et conclusion.
- `chapters/08-resume-mots-cles-glossaire.md` : préliminaires.
- `references.bib` : bibliographie BibLaTeX lue directement par Typst. Les sources extérieures déjà consultées y sont conservées ; le projet dispose d’une seule référence consolidée.
- `references-context.md`, `references-architecture.md`, `references-extraction.md` : correspondances de travail antérieures, non utilisées pour construire le PDF.
- `pdf/main.typ` : composition A4 ; `../metadata.json` fournit les informations institutionnelles communes.
- `../assets/images/` et sources DOT : figures et captures fournies.

Le PDF commence par une page de garde textuelle, sans page blanche préalable ; résumé, glossaire et listes sont numérotés en romain. La pagination arabe commence à l’introduction. La bibliographie est exclue du compteur du corps. Aucune page n’est ajoutée pour atteindre une longueur cible.

## Assemblage

`scripts/assemble.mjs` produit `../dist/report/report.json` et `figures.json`. Ces intermédiaires sont ignorés. Le mode normal refuse un chapitre absent ou vide ; `--partial` est réservé à une préversion incomplète explicitement signalée.

Le sous-ensemble Markdown comprend titres ATX, paragraphes, listes, citations, blocs de code, tableaux, liens et images locales. Le HTML et le code Typst du manuscrit ne sont jamais exécutés. Les images distantes ne sont pas téléchargées.

- Citations : `[REF-CLE]`, `[[REF-CLE]]` ou `[REF-UNE ; REF-DEUX]` deviennent des appels natifs à `cite`. `bibliography` lit `references.bib`, applique le style IEEE et sélectionne les seules sources citées. L’assembleur ne calcule aucun numéro bibliographique.
- Figures : `[[FIG:CAP-12]]`, éventuellement suivi d’une légende sur la même ligne. Une ligne `*Figure — Description.*` après le marqueur est absorbée comme légende, sans paragraphe doublonné. Les identifiants restent dans le manifeste, pas dans les légendes imprimées.
- Tableaux : `[[TABLE:identifiant]] Légende` avant le tableau ; légende en haut liée au premier contenu, en-tête répété en cas de tableau multipage. Une légende de repli est tirée du sujet de la section.
- Sections : titres sémantiques transmis à `heading`, qui numérote les six chapitres et leurs sections. Les anciens préfixes Markdown sont ignorés ; ils ne déterminent aucun compteur. Introduction et conclusion de chapitre restent sans numéro de section.
- Renvois : `[[REF:identifiant]]` devient un appel natif à `ref`. Les figures prennent leur identifiant de marqueur ; les tableaux leur identifiant de légende ; les chapitres possèdent les labels `chapter-1` à `chapter-6`. `[[LABEL:identifiant]]` après un titre permet un label de section explicite. Numéros, liens et pages sont résolus par Typst. Les références absentes et labels dupliqués font échouer l’assemblage.
- Sommaire et listes : `outline`, limité à deux niveaux pour les titres et ciblant les figures/tableaux pour les deux listes. Ces listes étaient déjà natives avant cette passe.

Les chemins d’assets restent sous la racine `presentation/`. Les SVG sont intégrés en conservant leurs proportions, dans une boîte maximale de 160 × 205 mm (150 mm de hauteur pour le modèle conceptuel), sans saut de page forcé autour de chaque diagramme. L’architecture possède un arrangement A4 issu du même modèle sémantique, sans changer la disposition large de la présentation. Les captures sont intégrées sans recadrage automatique. Les longues lignes des blocs de code peuvent revenir à la ligne sans réécriture de leur contenu.

## Contrôles et limites

La compilation documentaire, les citations résolues et la disponibilité des fichiers ne prouvent ni la lisibilité des captures ni l’absence de débordement visuel. La dernière passe de rendu autorisée a inspecté trois pages ciblées : couverture, pseudocode de publication et exemple documentaire. Les PNG intermédiaires restent ignorés dans `dist/report/`. La relecture globale appartient à l’étudiant ; aucun navigateur ni inspection automatique de toutes les pages.

Une extraction **textuelle native** du PDF construit peut servir à rechercher des consignes résiduelles, codes d’assets et clés bibliographiques visibles. Elle ne remplace pas la relecture visuelle et peut perdre l’ordre ou la segmentation de certains blocs.

Cette chaîne n’exécute aucun test applicatif, parcours authentifié ou appel fournisseur. Les guides `presenter-guide.md` et `demo-script.md` sont des supports distincts, non inclus dans le corps du rapport.

Documentation Typst consultée le 14 novembre 2026 pour cette correction : [Bibliography](https://typst.app/docs/reference/model/bibliography/), [Cite](https://typst.app/docs/reference/model/cite/), [Reference](https://typst.app/docs/reference/model/ref/), [Outline](https://typst.app/docs/reference/model/outline/), [Heading](https://typst.app/docs/reference/model/heading/), [Figure](https://typst.app/docs/reference/model/figure/) et [Raw](https://typst.app/docs/reference/text/raw/). Ces références d’outillage ne sont pas ajoutées à la bibliographie métier du mémoire.
