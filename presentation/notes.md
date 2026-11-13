# Notes de cadrage et preuves — 13 novembre 2026

Le texte présenté et les notes orales sont dans [draft.md](draft.md). Ce fichier garde les décisions de structure et les sources réutilisables pour le rapport ; ce n’est pas un second script.

## Deux exemples anciens, sans lien métier avec le projet

Analyse locale du texte PPTX/PDF par un sous-agent Sol. Les pages image seules n’ont pas été interprétées ; aucune règle institutionnelle n’est déduite de ces exemples.

| Exemple fourni | Séquence observée | Inspiration retenue |
|---|---|---|
| `73625af8-ca8e-4974-905a-49e8dce2cea1.pptx`, 31 slides | Couverture/plan 1–3 ; contexte/problème/solution 4–7 ; besoins et conception 8–14 ; sprints 15 ; architecture/outils 16–19 ; réalisation 20–29 ; remerciements 31 | Besoins explicites, diagrammes choisis, réalisation concrète |
| `Présentation_PFE_SirineKabboura - Finale - Copie.pptx.pdf`, 48 pages physiques | Couverture/plan 1–2 ; contexte 3–8 ; méthode/outils 9–12 ; besoins 13–15 ; réalisation BI/ML 16–42 ; web 43–44 ; bilan/perspectives 45–48 | Existant → problème → solution, conclusion séparée des perspectives |

Non transférés : Kimball, scraping, entrepôt de données, schémas étoile/flocon, entraînement prédictif, métriques MSE/MAE et précision de modèles. Pas de sprint inventé à partir du premier exemple. Les titres de sections des exemples ne sont pas une norme PFE.

## Synthèse du projet pour la présentation et le rapport

- **Objet :** prototype dédié à une entreprise, depuis l’offre jusqu’à la décision d’embauche ; pas de multi-tenancy ni gestion de paie.
- **Métier :** rôles et capacités contextuelles, formulaire configurable, documents privés, dépôt immuable, revue RH partagée, échanges CSV, entretiens et décisions explicites.
- **Architecture :** React/Vite, NestJS, domaine TypeScript/Zod partagé, PostgreSQL et documents locaux privés ; interfaces dédiées pour stockage/mail/lecture/exécution.
- **Traitement :** dépôt non bloquant, worker natif PDF → Markdown, JevGateway, validation des réponses, résultats originaux et caches privés. Le worker réel est intégré ; son activation locale autorisée concerne une cohorte synthétique définie dans les docs d’exploitation.
- **Cinq familles :** formation, certification, expérience, couverture d’une liste, contexte de preuve d’une compétence. Ce sont des informations documentaires déclarées, pas une mesure de qualité professionnelle.
- **Contrôle humain :** source, résultat et correction indépendants ; valeur effective pour l’usage RH/export ; aucune décision d’embauche automatique.
- **Cohérence :** états traitement/revue/recrutement séparés ; publication et décisions contrôlées ; autorité, révision et transaction sont des responsabilités distinctes.
- **Preuves :** vérifications ciblées datées, builds et préparation locale, scénarios synthétiques. Ni benchmark représentatif, ni précision intégrée, ni gain de temps établi.

## Sources internes par sujet

| Sujet / contenus | Source de référence |
|---|---|
| Périmètre, acteurs, besoins (03–09, 11) | [Produit](../docs/current/product.md), [workflows](../docs/current/workflows.md) |
| Démarche et preuves (10, 27–31) | [Journal](../docs/journal.md), [statut daté](../docs/current/status.md) |
| Modèle et architecture (12–14) | [Architecture](../docs/current/architecture.md), contrats ci-dessous |
| CV, revue, valeurs effectives et CSV (15–18, 22–23) | [Traitement et revue](../docs/current/contracts/processing-review-api.md), [estimation de coût](cost-model.md) |
| Publication et dépôt (20–21) | [Offres](../docs/current/contracts/vacancy-api.md), [candidatures](../docs/current/contracts/application-api.md) |
| États, entretiens, décisions (19, 24–26, 34) | [Workflows](../docs/current/workflows.md), [entretiens](../docs/current/contracts/interview-api.md) |
| Interfaces actuelles | [Guide frontend](../docs/current/guides/frontend-design.md) |
| Jeu synthétique (28) | [Cycle de démonstration](../docs/current/guides/lifecycle-demo.md), [handoff de lancement](../docs/plan/cv-demo-launch.md) |
| Perspectives (31, 33) | [Board](../docs/plan/tasks.md), limites documentées ; protocole d’évaluation proposé, non exécuté |
| Paysage concurrentiel (ch.2 du rapport) | Pages produit et tarifaires sourcées dans [report-plan.md](report-plan.md) §4 |
| Coût, cadrage réglementaire (ch.5–6) | [cost-model.md](cost-model.md) ; sources AI Act et NIST listées dans [report-plan.md](report-plan.md) §4 |

Attention : certains paragraphes généraux d’architecture portent encore des indications plus anciennes sur le worker/cache et les migrations. Pour ces points, le contrat de traitement actualisé et le checkpoint du 13 novembre priment. Les documents applicatifs n’ont pas été réécrits pendant cette révision de présentation.

## Références externes effectivement utilisées

Panorama documentaire déjà présent dans le deck précédent, sans nouveau benchmark ni vérification commerciale exhaustive en novembre :

- Greenhouse — fonctions d’entretien/décision : https://www.greenhouse.com/interviewing-decision-making
- Workable — catalogue de fonctions : https://www.workable.com/features
- Textkernel — Parser : https://www.textkernel.com/products-solutions/parser/ ; recherche sémantique : https://www.textkernel.com/learn-support/blog/semantic-search-advanced-matching/

Ces pages commerciales illustrent des catégories de solutions. Elles ne démontrent ni leur insuffisance ni la supériorité du projet. Les anciens chiffres Ashby/Ladders ne sont plus utilisés. ODD 8 facultatif en discussion : https://sdgs.un.org/goals/goal8 ; aucune causalité sur emploi, équité ou environnement établie.

## À ne pas transformer en résultat

Le cadrage utilisateur privilégie une extraction économique en temps et en coût, ainsi qu’une plateforme utilisable avec ou sans IA. Ces motivations sont désormais explicites ; elles ne constituent pas un benchmark. Le nom CAP est développé en « Centralisation et Assistance au Parcours de recrutement » comme proposition éditoriale, pas récit historique. Les échanges CSV facilitent l’usage de tableurs et d’outils externes ; ils ne constituent ni un connecteur IA natif ni une autorisation générale de transfert de données. Le [plan du rapport](report-outline.md) approfondit les choix et alternatives.

Les 25 scénarios sont synthétiques et servent au workflow. Les archives exploratoires du laboratoire CV ne sont pas un benchmark de la version intégrée. Le démarrage du worker Jev n’est pas une preuve de qualité réelle. Les corrections humaines ne sont pas les réponses du fournisseur. Les gates de QA restent ouvertes ; leurs nombres de tests historiques ne s’additionnent pas en couverture actuelle.

Le [plan de production du rapport](report-plan.md) est le document de référence pour la rédaction : structure cible, répartition en pages, briefs autoportants par chapitre, sources externes datées et plan des figures. Le [plan du rapport](report-outline.md) précédent en reste la version longue non exécutée ; en cas de divergence, `report-plan.md` prime.
