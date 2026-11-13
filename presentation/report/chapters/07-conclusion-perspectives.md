# Conclusion générale et perspectives

## Une réponse centrée sur le parcours de recrutement

Le projet apporte une réponse de prototype à la centralisation du recrutement : il réunit des offres configurables, des candidatures immuables après dépôt, une revue partagée, des entretiens éventuels et des décisions explicites. Sa contribution ne se réduit pas à l’intégration d’un fournisseur d’IA. Elle tient d’abord à l’articulation des responsabilités et à la séparation des informations. Les réponses du candidat, les résultats documentaires, les corrections humaines et les décisions finales n’occupent pas le même rôle dans le système.

La problématique initiale reçoit ainsi une réponse de conception et de réalisation, plutôt qu’une démonstration de performance en exploitation. Le code matérialise des règles de publication, d’autorisation contextuelle et de modification concurrente. L’interface rend ces règles accessibles dans des parcours ciblés. En revanche, la présence de ces mécanismes ne suffit pas à déclarer l’ensemble accepté. Les contrôles historiques et les observations locales renseignent une partie du fonctionnement ; ils n’équivalent pas à une validation actuelle complète du produit.

Le caractère facultatif de l’assistance est déterminant. Une offre peut ne comporter aucune tâche d’extraction et aucun entretien configuré. Les ressources humaines peuvent décider de la présélection sans attendre le traitement ou l’achèvement d’une revue. Une proposition reste ensuite une action explicite du propriétaire, soumise aux prérequis applicables, et l’embauche constitue une décision distincte. Cette organisation conserve au recrutement sa logique propre, au lieu de faire d’un état technique la condition implicite de toutes les actions humaines.

## Bilan des contributions et des preuves

Les contributions principales s’organisent autour de la cohérence, de la provenance et de la maîtrise des effets. La publication fige les configurations utiles ; les révisions séparées rendent les conflits explicites ; les projections privées limitent les informations retournées selon le contexte. L’assistance documentaire produit des réponses structurées et révisables, sans modifier les pièces du candidat. Le CSV offre une continuité avec des outils externes, tout en réservant l’écriture des décisions à une confirmation contrôlée dans la plateforme.

Le tableau suivant distingue ces réalisations des observations et des vérifications encore nécessaires. Il ne remplace pas le registre daté du chapitre consacré à la vérification.

| Domaine | Réalisé dans les sources | Observation disponible | Encore à vérifier |
| --- | --- | --- | --- |
| Offre et parcours | Publication figée, responsabilités contextuelles, proposition et embauche séparées | Parcours manuels partiels rapportés par l’utilisateur | Matrice actuelle des droits et conflits sur HTTP authentifié |
| Revue partagée | Corrections indépendantes, libération explicite, clôtures et refus d’écritures tardives | Contrôles ciblés historiques et parcours de revue partiel rapporté | Transactions réelles, concurrence, confidentialité et situations de reprise |
| Interface et CSV | Navigation protégée, import groupé et confirmé, export de valeurs effectives | Vérifications de source, contrôles DOM historiques et retours partiels | Aller-retour CSV complet et comportements natifs actuels |
| Assistance documentaire | Lecture native bornée, requête multi-question, caches privés et garde-fous d’envoi | Constructions logicielles et démarrage hors ligne avec lecture native et réponse fixture | Qualité intégrée, reprise après incident et concurrence en conditions autorisées |
| Démonstration | Catalogue synthétique et préparation locale documentée | Création des cinq offres et vingt-cinq scénarios, disponibilité locale observée | Répétabilité complète et parcours authentifiés du catalogue |

La distinction entre observation et résultat évalué évite deux erreurs opposées. Il serait excessif de présenter le prototype comme un produit validé ; il serait également inexact de considérer que toute vérification restante désigne une fonctionnalité non réalisée. Les contrôles de source et les parcours rapportés possèdent une valeur réelle, mais leur portée demeure celle de leur environnement, de leur date et de leurs assertions effectivement observées.

## Limites actuelles

La première limite concerne l’acceptation transversale. Les tests sur modèles et les simulations d’interface n’établissent pas toutes les propriétés de PostgreSQL, des sessions authentifiées ou du navigateur réel. Les changements successifs imposent également de ne pas additionner les effectifs de tests historiques comme s’ils constituaient une couverture finale. Les vérifications de confidentialité, de concurrence et de reprise conservent donc leur place dans le travail restant, même lorsque les mécanismes correspondants sont présents dans le code.

La deuxième limite porte sur la qualité documentaire. Le chemin réel lit les PDF possédant une couche texte exploitable ; il ne fournit pas de secours OCR ou vision. L’ordre de lecture, l’encodage ou la structure de certains documents peuvent altérer l’information disponible. Une sortie conforme au schéma ne démontre pas que la réponse est sémantiquement juste. Les observations exploratoires et les scénarios synthétiques ne constituent pas un corpus représentatif annoté pour la version intégrée. Aucun taux de précision, seuil de confiance calibré ou avantage général sur un autre produit n’est donc conclu.

La troisième limite est opérationnelle. Les caches et les registres de tentative contribuent à une reprise prudente, mais leur présence ne prouve pas une absence universelle de doublons facturables. Refuser un nouvel envoi après une incertitude peut laisser un traitement sans résolution automatique. La conservation, les quotas et la réconciliation des fichiers demandent encore un cadrage d’exploitation. De même, la capture locale des courriers ne démontre pas leur délivrabilité réelle. Une installation disponible ne suffit pas à caractériser un service exploitable durablement.

Enfin, la maîtrise humaine n’est pas une preuve de conformité juridique. Conserver une décision explicite, limiter la portée des questions et protéger les documents sont des choix importants, mais ils ne dispensent pas d’analyser la finalité réelle, les données traitées et le contexte de déploiement. La qualification d’un système au regard du règlement européen sur l’IA ne peut pas être écartée au seul motif qu’un humain intervient. Le rapport ne revendique ni conformité auditée, ni équité démontrée, ni autorisation générale de transfert de CV réels.

## Perspectives priorisées

La première priorité est de terminer l’acceptation du périmètre existant avant de l’élargir. Une revue devrait rapprocher les contrats actuels, les réponses serveur et les parcours de chaque acteur. Elle ciblerait les lectures privées, les écritures concurrentes, les clôtures pendant traitement, les conflits de revue et les décisions importées. Les scénarios de réponse incertaine devraient être distingués des échecs certains. Ce travail exige un périmètre autorisé ; il n’est pas exécuté pour les besoins de la rédaction.

La deuxième priorité est une évaluation documentaire reproductible. Un corpus autorisé et séparé des réglages permettrait de comparer les réponses à des annotations humaines indépendantes, question par question. Les désaccords, les documents inexploités et les valeurs inconnues devraient être conservés dans les résultats, non retirés pour améliorer artificiellement une moyenne. La validité structurelle, la justesse sémantique et l’utilité pour la revue seraient évaluées séparément. Les mesures de coût et de latence devraient, elles aussi, distinguer attente, lecture, cache, fournisseur et persistance ; les formules illustratives du modèle de coût ne remplacent pas cette collecte.

La troisième priorité concerne la préparation d’une exploitation maîtrisée : conservation des documents et caches, nettoyage des objets orphelins, sauvegarde, réconciliation, diagnostic et documentation d’installation. La documentation statique de l’API devra être réalignée avec les contrats CV actuels. Les effets de notification encore absents et le lanceur complet de démonstration relèvent d’évolutions identifiées, non d’acquis implicites. Ces sujets demandent des critères d’acceptation propres plutôt qu’un calendrier promis.

Les extensions fonctionnelles viennent ensuite, selon un besoin démontré : OCR pour les documents sans texte exploitable, nouveaux connecteurs ou enrichissement du suivi candidat. Chacune modifierait les coûts, les flux de données ou la maintenance ; aucune ne découle automatiquement de l’existence du prototype. Le bilan reste donc mesuré : une plateforme et une assistance révisable sont réalisées dans les sources, plusieurs observations locales en étayent des portions, et l’évaluation complète demeure à conduire. Cette séparation est une condition de crédibilité du travail, non une réserve accessoire.

## Notes de source

- Synthèse métier : `docs/current/workflows.md` et contrats de publication, candidature, entretien, revue et présélection dans `docs/current/contracts/`.
- Observations et limites : `docs/current/status.md`, entrées datées et section des retours manuels ; aucune nouvelle exécution pour ce texte.
- Perspectives : `docs/plan/tasks.md`, `docs/plan/product-decisions.md` et `presentation/report-outline.md` ; ces documents ne valent pas autorisation d’exécution.
- Coûts : `presentation/cost-model.md`, à utiliser exclusivement avec ses hypothèses et sa granularité d’appel explicites.
