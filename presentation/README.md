# Pré-soutenance PFE — CAP

**[Ouvrir le PDF](exports/status.pdf)** — version restructurée le 13 novembre 2026 pour relecture de l’encadrant.

42 pages : **34 diapositives principales, deux annexes et six intercalaires**. Fil conducteur : contexte/problème → besoins → conception → réalisation → validation/bilan. Équilibre produit/ingénierie : usages traditionnels et assistés, choix techniques, coût estimatif et coordination. Six diagrammes, huit captures réelles et les deux logos officiels. CAP est développé en **Centralisation et Assistance au Parcours de recrutement** ; métadonnées académiques et validation finale restent à confirmer.

## Documents utiles

- [draft.md](draft.md) : texte finalisable et notes orales, une seule source éditoriale.
- [plan.md](plan.md) : structure, pagination, arbitrages et gates de revue.
- [brief.md](brief.md) : périmètre autorisé et informations manquantes.
- [notes.md](notes.md) : analyse des exemples, synthèse technique et preuves pour le rapport.
- [report-plan.md](report-plan.md) : **plan de correction du rapport**, en six chapitres ; le [retour détaillé](CAP_report_agent_handoff_feedback.md) remplace les anciens briefs.
- [cost-model.md](cost-model.md) : unité d’appel, tarif primaire TypeSafe et scénarios conditionnels.
- [report-outline.md](report-outline.md) : version longue du plan de rapport, non exécutée ; `report-plan.md` prime en cas de divergence.
- [report-frontmatter.md](report-frontmatter.md) : gabarits réservés pour couverture, page de garde, résumé, mots-clés, sommaire et glossaire.
- [report-orchestration.md](report-orchestration.md) : comment lancer la rédaction par chapitre, prompt type, ordre de dispatch, contrôles qualité.
- [assets/requests.md](assets/requests.md) : huit captures reçues et logos, avec provenance et contenu.
- [assets/manifest.json](assets/manifest.json) : provenance des anciens visuels et inventaire courant.
- [diagrams/README.md](diagrams/README.md) : sources, périmètre et réutilisation des diagrammes.
- [metadata.json](metadata.json) : métadonnées communes ; détails institutionnels finaux laissés à l’étudiant.
- [remaining-notes.md](remaining-notes.md) : informations à compléter et vérifications éventuelles pour la suite ; prototype considéré terminé, sans réouverture de l’ancien backlog.

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

PDF compilé et diagrammes rendus. La dernière passe autorisée sur le rapport a inspecté uniquement la couverture et les deux pages contenant les exemples de code, pour corriger les trois défauts de rendu signalés. La relecture globale des supports reste à l’étudiant. Aucun navigateur, test applicatif ou appel fournisseur utilisé pour cette passe.

Le corps des diapositives s’ajuste automatiquement sur quatre contenus plus denses (`bodySize` dans `scripts/prepare-reading-slides.mjs`) pour éviter le débordement de la zone de texte.

Rapport : [PDF](exports/report.pdf), [synthèse de correction](report/correction-summary.md), [guide du présentateur](report/presenter-guide.md), [scénario de démonstration](report/demo-script.md), [points à finaliser par l’étudiant](report/student-checklist.md). Le corps conserve six chapitres, sans contrainte de remplissage. Typst gère nativement la bibliographie, les citations et les renvois. La qualité IA et le gain de temps ne sont pas mesurés.
