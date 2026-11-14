# CAP — guide du présentateur

Ce guide accompagne le mémoire ; il ne fait pas partie de son corps. Adapter les formulations à la contribution réelle de l’étudiant et aux règles de son établissement.

## Message principal

CAP centralise le parcours de recrutement : offre configurable, dépôt et documents privés, examen RH, entretiens et décisions. L’assistance documentaire répond à des questions définies pour l’offre. Elle est facultative et ne présélectionne personne.

## Architecture à expliquer

- **React/Vite** présente les vues adaptées à chaque acteur. Les boutons disponibles facilitent la navigation, mais le serveur contrôle de nouveau les droits et l’état à chaque commande.
- **NestJS** réunit les modules métier dans une API. Un domaine **TypeScript/Zod** partage les types et la validation des données.
- **PostgreSQL** conserve relations, états, révisions et instantanés ; JSONB porte les formulaires et données variables. Les documents sont stockés séparément et téléchargés après autorisation.
- Le **runner intégré** découvre les tâches persistées, après dépôt et par balayage. Il prépare les PDF et exécute les extracteurs séquentiellement. Ce n’est pas une file BullMQ ni un service autonome.
- **Redis** coordonne les contrôles d’admission de la passerelle Jev. La préparation et les réponses validées disposent de caches fichiers privés distincts.

## Chaîne documentaire

PDF privé → lecteur natif `@firecrawl/pdf-inspector` → Markdown → constructeur de requête contenant questions, critères et date de première publication → JevGateway/TypeSafe → validation de toutes les réponses → original conservé → corrections RH → valeurs effectives.

Un extracteur envoie **une requête regroupée**, même avec plusieurs questions. Le cache de préparation dépend du PDF et du lecteur ; celui de réponse dépend de la requête effective complète. Un cache ne rend pas sans risque tout nouvel envoi après une interruption.

## Questions fréquentes

**Avez-vous entraîné un modèle ?** Non. Le travail porte sur le choix des questions, leur construction, l’intégration et l’exploitation contrôlée des résultats d’un service existant.

**Que signifie la confiance ?** Pour les questions Choice, TypeSafe la calcule à partir de la probabilité de l’option sélectionnée et du nombre d’options. Ce n’est pas un taux de précision mesuré sur les CV de CAP. Le code actuel conserve ces données sans appliquer de seuil de sélection.

**Que signifie “certification : oui” ?** Le document présente la certification comme obtenue selon les critères de la question ; CAP ne vérifie pas l’organisme émetteur.

**Pourquoi la date de publication ?** Elle fournit une référence commune stable à toutes les candidatures de l’offre, distincte de la date de création du brouillon. Une offre ouverte longtemps peut utiliser une référence vieillissante.

**Qui termine une candidature ?** Les décisions RH sont explicites. Certaines finalisations sont réservées au propriétaire ; l’interviewer affecté peut aussi enregistrer un Fail éliminatoire qui termine la candidature et annule les autres entretiens planifiés. Ce n’est pas un rejet automatique par l’extraction.

**Comment travaillez-vous à plusieurs ?** L’accès RH est partagé. Les révisions empêchent les écrasements silencieux ; une présélection concurrente conserve la première décision validée. L’attribution de charge et la discussion des critères restent organisées par l’équipe.

**Combien coûte une extraction ?** Au tarif public consulté, 0,042 USD par million de tokens d’entrée, sorties gratuites. Une requête complète de 5 000 tokens représente 0,000210 USD de fournisseur. C’est un scénario, pas une moyenne mesurée ; l’infrastructure et la revue sont exclues.

## Exploration et résultats

Présenter les CV synthétiques, variantes de contenu et mise en page, formulations de questions et paires sauvegardées décrites au chapitre 5. Montrer un exemple récupérable de ce chapitre plutôt que réciter un taux d’exactitude inexistant. Distinguer une ambiguïté de formulation, une erreur observée et une réponse correcte sur un cas précis.

Les documents utilisés pour ajuster les questions constituent un ensemble de développement, pas une évaluation indépendante. Les réponses préparées du scénario de démonstration ne sont pas des observations Jev. Une réponse réelle enregistrée illustre le chemin intégré, sans valider la qualité générale.

## Limites à savoir expliquer

Le chemin actuel exploite les PDF à couche texte, sans OCR de secours. La qualité sémantique représentative et les gains de temps restent à mesurer ; les scénarios finaux d’autorisation, concurrence et reprise demandent une vérification complète. L’environnement montré est local. Les plafonds d’appel sont ceux de la démonstration, non une capacité industrielle.

Avant la soutenance, le présentateur doit savoir retrouver dans le code ou dans une observation chaque mécanisme qu’il expose, et distinguer ce qu’il a réalisé personnellement de ce qui a été fourni ou assisté.
