# Plan de correction du rapport PFE

**Checkpoint de travail terminé.** Le prototype est considéré terminé dans son périmètre ; aucune nouvelle réécriture ni reprise de l’ancien backlog n’est demandée. Les informations et vérifications éventuelles restantes sont regroupées dans [les notes de suite](remaining-notes.md), hors du rapport. Toute nouvelle intervention sera bornée à une demande distincte.

## Direction retenue

Le [retour détaillé](CAP_report_agent_handoff_feedback.md) remplace les anciens briefs de rédaction. Le rapport raconte la conception et la réalisation d’une plateforme de recrutement intégrant une assistance documentaire ; il ne constitue ni une revue du dépôt ni une proposition de nouveau modèle NLP.

La priorité est un texte complet et lisible, sans remplissage pour atteindre les anciennes 70–84 pages. Une longueur de 60–70 pages est indicative, non une obligation de composition. Les exigences formelles finales seront vérifiées par l’étudiant.

## Structure et responsabilités éditoriales

| Partie | Contenu principal |
| --- | --- |
| Introduction | Problème, objectifs et organisation du mémoire |
| 1. Contexte du projet et démarche de réalisation | Stage chez BeeCoders, périmètre mono-entreprise, objectifs et travail itératif |
| 2. Analyse des besoins et étude des solutions | Acteurs, exigences et comparaison documentaire proportionnée |
| 3. Conception de la solution | Modèle métier, instantanés, dimensions d’état, autorisation, transactions et révisions |
| 4. Architecture et réalisation | Technologies, modules, parcours représentatifs, captures, CSV et topologie locale |
| 5. Assistance documentaire | Service Jev, préparation PDF, questions, sorties, revue, exploration et coût estimé |
| 6. Vérification et bilan | Vérifications par parcours, observations disponibles, synthèse et compléments |
| Conclusion | Capacité livrée et perspectives prioritaires |

Le chapitre 5 porte l’explication complète original/correction/effectif et le tableau des modes d’exécution. Le chapitre 6 porte le bilan de vérification. Les autres chapitres y renvoient sans recopier leurs limites. Une règle métier peut être rappelée lorsqu’elle explique un mécanisme, sans refaire l’inventaire des responsabilités.

## Sources et méthode de correction

Vérifier le comportement dans le code et les artefacts disponibles ; consulter les documentations primaires des dépendances. Les observations historiques, scénarios préparés et résultats réels restent distincts. Les informations de travail sur les assertions et les points non résolus restent dans `docs/.ignore/private/cap-report-factual-matrix.md`, hors du rapport.

Les registres `report/references-*.md` gardent les correspondances détaillées hors du mémoire. Typst lit `report/references.bib` et gère citations et bibliographie ; une seule référence consolidée au projet est conservée. Les instructions d’assemblage et d’exécution ne font pas partie du mémoire.

## Livrables

- Sources `report/chapters/` et PDF `exports/report.pdf`.
- [Synthèse de correction](report/correction-summary.md) par chapitre et liste bornée des changements techniques.
- [Guide du présentateur](report/presenter-guide.md) : architecture, exploration et décisions à savoir expliquer.
- [Scénario de démonstration](report/demo-script.md) : états préparés et transitions effectuées séparément.
- Matrice factuelle et questions privées : fichier ignoré indiqué ci-dessus.
- [Points à finaliser par l’étudiant](report/student-checklist.md) : contexte de mission, exigences institutionnelles, attribution des contributions, relecture et répétition de démonstration.

## Vérification finale

La compilation documentaire et l’inspection textuelle ne valent pas relecture visuelle. La mise en page, les recadrages éventuels et les éléments imposés par l’école restent à relire manuellement par l’étudiant. Aucun test applicatif, appel fournisseur, changement de limite, manipulation de clé ou redémarrage n’est nécessaire à cette correction.

`report-outline.md` et les anciens prompts de `report-orchestration.md` sont des documents de préparation antérieurs, non des consignes de rédaction actuelles.
