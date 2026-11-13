# Pré-soutenance PFE — CAP

**[Ouvrir le PDF](exports/status.pdf)** — version restructurée le 13 novembre 2026 pour relecture de l’encadrant.

42 pages : **34 diapositives principales, deux annexes et six intercalaires**. Fil conducteur : contexte/problème → besoins → conception → réalisation → validation/bilan. Équilibre produit/ingénierie : usages traditionnels et assistés, choix techniques, coût estimatif et coordination. Six diagrammes, huit captures réelles et les deux logos officiels. CAP est développé en **Centralisation et Assistance au Parcours de recrutement** ; métadonnées académiques et validation finale restent à confirmer.

## Documents utiles

- [draft.md](draft.md) : texte finalisable et notes orales, une seule source éditoriale.
- [plan.md](plan.md) : structure, pagination, arbitrages et gates de revue.
- [brief.md](brief.md) : périmètre autorisé et informations manquantes.
- [notes.md](notes.md) : analyse des exemples, synthèse technique et preuves pour le rapport.
- [report-plan.md](report-plan.md) : **plan de production du rapport** — structure cible, répartition en pages, briefs autoportants par chapitre, sources externes datées, plan des figures.
- [cost-model.md](cost-model.md) : granularité réelle des appels, calcul illustratif des coûts, comparaison avec un tarif commercial publié, cadre de confiance.
- [report-outline.md](report-outline.md) : version longue du plan de rapport, non exécutée ; `report-plan.md` prime en cas de divergence.
- [report-frontmatter.md](report-frontmatter.md) : gabarits réservés pour couverture, page de garde, résumé, mots-clés, sommaire et glossaire.
- [report-orchestration.md](report-orchestration.md) : comment lancer la rédaction par chapitre, prompt type, ordre de dispatch, contrôles qualité.
- [assets/requests.md](assets/requests.md) : **six captures à fournir**, noms exacts, priorités et logos facultatifs.
- [assets/manifest.json](assets/manifest.json) : provenance des anciens visuels et inventaire courant.
- [diagrams/README.md](diagrams/README.md) : sources, périmètre et réutilisation des diagrammes.
- [metadata.json](metadata.json) : couverture ; établissement/formation à compléter.

## Construction

Depuis la racine :

```sh
pnpm --filter @recruitment/presentation pdf:build
pnpm --filter @recruitment/presentation diagram:check
```

Le build lit `draft.md`, génère `dist/reading-slides.json` et `dist/page-map.md`, rend les diagrammes SVG et compile **`exports/status.pdf`**, export partagé suivi par Git. Déposer les captures demandées dans `assets/images/` sous leurs noms exacts puis reconstruire : les placeholders sont remplacés automatiquement, sans recadrage. Les anciens fichiers sont conservés ; leurs noms ne sont pas réutilisés silencieusement.

`pdf/main.typ` est le rendu actif. Typst officiel 0.15.1 est installé localement dans `.local/tools/typst-0.15.1/typst`, ou accessible via `TYPST_BIN`/PATH. Racine de compilation limitée à `presentation/`. Pour un nouveau checkout : [compilateur officiel](https://github.com/typst/typst/releases/tag/v0.15.1).

Graphviz/WASM via `@viz-js/viz` rend les DOT sans navigateur. Mermaid vérifie les sources `.mmd`. Dépendances limitées à ce workspace ; aucun kit distant nécessaire. `dist/` contient les intermédiaires ignorés. `deck/` reste l’ancien placeholder Reveal/Vite, pas une deuxième version du contenu.

## Vérification et relecture

PDF compilé, syntaxe des cinq Mermaid vérifiée ; six diagrammes rendus. Quelques pages ont été inspectées à basse résolution avant la demande d’arrêt de l’utilisateur. **Relecture visuelle finale laissée à l’utilisateur : aucune nouvelle rasterisation ni lecture d’images de pages par l’agent.** Ces contrôles portent uniquement sur la présentation ; aucun test applicatif ni appel fournisseur exécuté.

Le corps des diapositives s’ajuste automatiquement sur quatre contenus plus denses (`bodySize` dans `scripts/prepare-reading-slides.mjs`) pour éviter le débordement de la zone de texte.

À finaliser : réception des captures, métadonnées et retour de l’encadrant. Les assertions de réalisation sont séparées des preuves : worker réel intégré, mais qualité IA et gain de temps non mesurés. Les exemples fournis inspirent la structure ; leur contenu métier et leurs méthodes BI/ML ne sont pas repris.
