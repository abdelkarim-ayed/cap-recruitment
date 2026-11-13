# Résumé, mots-clés et glossaire

## Résumé

Ce projet porte sur la conception et la réalisation d’un prototype de plateforme de recrutement destiné à un déploiement séparé pour une entreprise. Il traite une question de coordination : réunir les offres, les candidatures, les documents et les évaluations, tout en conservant des responsabilités humaines explicites et des accès contextualisés. L’assistance documentaire est facultative et ne constitue ni un classement automatique des candidats ni une mesure de leur compétence réelle.

La solution associe une API NestJS, une interface React/Vite, un domaine partagé TypeScript/Zod, PostgreSQL et un stockage documentaire privé. Elle distingue le traitement documentaire, la revue humaine et l’avancement du recrutement. La publication fige les configurations ; les réponses du candidat restent immuables après dépôt. Les transactions et les révisions séparées traduisent les règles de cohérence des modifications, tandis que les conflits demandent une résolution explicite.

L’extraction exploite le texte natif des PDF et regroupe les questions d’un extracteur configuré dans une requête structurée. Les résultats originaux, les corrections humaines et les valeurs effectives demeurent séparés. Des caches privés et un registre durable de tentative encadrent la reprise, sans autoriser un nouvel envoi payant après une incertitude. Les exports CSV et l’import confirmé de décisions permettent une continuité avec des traitements externes autorisés, sans réimporter les preuves comme des corrections.

Les éléments disponibles comprennent des contrôles ciblés historiques, des constructions logicielles, une préparation locale et des parcours manuels partiels. La démonstration repose sur des scénarios synthétiques ; elle ne constitue pas une évaluation représentative de l’extraction. La validation complète des autorisations, de la concurrence, de la reprise et des comportements natifs reste à achever. Aucun gain de temps, taux de précision, avantage économique mesuré ou conformité réglementaire n’est établi. Les perspectives prioritaires concernent l’acceptation du périmètre existant, une évaluation documentaire annotée et la préparation de l’exploitation avant toute extension fonctionnelle.

## Mots-clés

Recrutement ; assistance documentaire ; extraction structurée ; revue humaine ; cohérence transactionnelle ; confidentialité ; interopérabilité CSV.

## Glossaire

| Terme | Définition dans ce rapport |
| --- | --- |
| CAP | Nom de travail ; développement proposé : « Centralisation et Assistance au Parcours de recrutement ». Ce développement n’est pas une origine historique attestée. |
| Candidature | Dossier reliant un candidat à une offre, avec réponses et références documentaires figées au dépôt. |
| Propriétaire d’offre | Membre habilité du personnel auquel l’offre appartient ; certaines décisions, dont la publication et la proposition, lui sont réservées. |
| Plan d’entretien | Liste ordonnée, éventuellement vide, des entretiens configurés et figés à la publication ; distincte des rendez-vous effectivement programmés. |
| Présélection | Décision humaine faisant poursuivre une candidature ; elle ne signifie ni proposition ni embauche. |
| Traitement documentaire | Exécution technique des tâches configurées ; son état est distinct de la revue et du recrutement. |
| Revue partagée | Examen des informations et corrections par les ressources humaines habilitées, sans réservation exclusive d’un dossier. |
| Libération manuelle | Action explicite fermant définitivement le traitement inachevé d’une candidature pour permettre la revue, sans fabriquer un succès. |
| Extracteur | Tâche configurée sur un document, regroupant plusieurs questions dans une requête structurée. |
| PDF natif | PDF dont la couche texte est exploitée directement ; un document scanné sans texte nécessite un traitement différent. |
| OCR | Reconnaissance optique de caractères à partir d’images ; aucun secours OCR n’est livré dans le chemin décrit. |
| Résultat original | Réponse de traitement conservée séparément des corrections humaines ; elle reste une information documentaire, non une vérité vérifiée. |
| Correction humaine | Valeur saisie indépendamment du résultat original, avec les règles d’attribution et de verrouillage de la revue. |
| Valeur effective | Valeur retenue pour l’usage courant ou l’export selon la priorité explicite d’une correction présente sur le résultat original. |
| Projection privée | Ensemble de champs retournés en fonction de l’acteur et du contexte, sans exposer toutes les informations internes. |
| Révision | Compteur servant à détecter une modification concurrente ; il ne conserve pas les anciennes versions d’une ressource. |
| Bail de traitement | Droit temporaire de travailler sur une tâche, associé à une expiration et à un jeton permettant de contrôler les écritures. |
| Passerelle Jev | Point de passage obligatoire des appels réels, portant notamment les contrôles d’admission et de dépense. |
| Cache de réponse | Conservation privée d’une réponse validée pour la requête effective correspondante ; ce cache ne remplace pas le registre de tentative. |
| CSV | Format textuel tabulaire utilisé pour les exports et les propositions de décisions importées ; la confirmation finale reste distincte du fichier. |

## Notes de source

Résumé fondé sur `docs/current/workflows.md`, `docs/current/status.md` et `docs/current/contracts/processing-review-api.md`. Les termes métier sont précisés par les contrats de `docs/current/contracts/`. Ce résumé doit être recoupé avec l’ensemble du corps avant l’assemblage final ; aucune version anglaise n’est prévue.
