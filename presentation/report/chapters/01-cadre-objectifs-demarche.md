# Chapitre 1 — Cadre, objectifs et démarche

## Introduction

Un projet de recrutement ne se réduit ni à un formulaire de dépôt ni à l’analyse automatique d’un curriculum vitæ. Il relie des informations de nature différente, des responsabilités partagées et des décisions qui n’ont pas les mêmes conséquences. Concevoir une plateforme dans ce domaine exige donc de préciser sa frontière avant de présenter ses technologies. Quelles personnes peuvent agir ? Sur quelles candidatures ? Quelle différence existe entre une information extraite, une revue humaine et une décision de recrutement ? Ces questions structurent le projet présenté dans ce rapport.

Ce chapitre situe le travail dans son cadre confirmé, délimite les objectifs de CAP et expose la démarche effectivement traçable. Il distingue les utilisateurs visés des personnes dont la consultation serait attestée, ainsi que la réalisation logicielle de son acceptation finale. Le nom développé proposé pour CAP est « Centralisation et Assistance au Parcours de recrutement ». Cette désignation résume l’intention du produit ; elle ne constitue pas une dénomination institutionnelle définitivement validée.

## Organisme d’accueil et origine du projet

BeeCoders est l’organisme d’accueil identifié pour ce projet de fin d’études. Les éléments disponibles ne permettent pas de documenter davantage son histoire, son effectif, son organisation interne ou son portefeuille de clients. Le rapport n’en déduit donc aucun profil d’entreprise. De même, la désignation précise du commanditaire opérationnel, les fonctions des interlocuteurs métier et les modalités des consultations restent à confirmer. Présenter ces informations comme acquises reviendrait à reconstruire artificiellement le contexte du projet.

Trois positions doivent être distinguées. L’organisme d’accueil fournit le cadre du travail. Le commanditaire formule ou arbitre les attentes du produit. Les utilisateurs cibles accomplissent les tâches que la plateforme doit soutenir. Une même personne peut occuper plusieurs de ces positions, mais cette possibilité n’autorise pas à les confondre. Les arbitrages conservés dans la documentation établissent des attentes fonctionnelles et des corrections de direction ; ils ne constituent pas, à eux seuls, une enquête auprès d’un service RH représentatif [REF-CAP-DECISIONS].

Le besoin retenu est celui d’une plateforme générale de recrutement déployée pour une entreprise. Elle doit réunir les offres, les candidatures et leurs documents, l’assistance documentaire éventuelle, les revues humaines, les entretiens et les décisions internes. La dispersion de ces éléments entre plusieurs supports constitue un risque de conception plausible : perte de contexte, copies divergentes ou ambiguïté sur la prochaine action. Elle n’est pas présentée ici comme un dysfonctionnement mesuré chez BeeCoders. Le projet traite cette catégorie de problèmes sans inventer un diagnostic de terrain [REF-CAP-PRODUIT].

Cette précision n’affaiblit pas le sujet. Elle situe correctement sa contribution : construire un prototype cohérent, expliciter ses règles et préparer les conditions de son évaluation. La pertinence pour une organisation réelle devra ensuite être confrontée à ses pratiques, à ses contraintes de conservation et aux responsabilités qu’elle souhaite effectivement déléguer.

## Objectifs et frontière du produit

### Centraliser sans automatiser la décision

L’objectif principal est de fournir un dossier de candidature compréhensible dans son contexte. Une réponse saisie par un candidat, une indication extraite de son CV et une correction RH ne portent pas la même signification. CAP les conserve séparément afin que l’information utilisée reste interprétable. Le recruteur peut ainsi examiner la source, lire une suggestion et retenir une valeur corrigée sans réécrire ce que le candidat a déposé [REF-CAP-TRAITEMENT].

La centralisation concerne également les responsabilités. La plateforme ne suppose pas qu’une seule personne accomplisse tout le recrutement. Elle organise un travail RH partagé tout en réservant certaines actions au propriétaire de l’offre et certaines évaluations à l’interviewer affecté. L’intention n’est pas de reproduire une hiérarchie administrative complète, mais de rendre explicite l’autorité nécessaire à chaque action.

L’assistance par intelligence artificielle reste facultative. Une offre peut être publiée sans extracteur, puis recevoir des candidatures et conduire à une présélection, à une proposition et à une embauche. Lorsqu’une extraction est configurée, elle répond à des questions documentaires bornées ; elle ne mesure pas la compétence réelle du candidat et ne décide pas de sa sélection. Le classement automatique et les formules générales de qualification ne font pas partie du moteur métier livré [REF-CAP-PRODUIT].

### Un déploiement pour une entreprise

Le périmètre vise une instance déployée et personnalisable pour une entreprise. Il ne s’agit pas d’une place de marché reliant plusieurs employeurs, ni d’un service SaaS multi-entreprises avec séparation de locataires. Cette décision réduit le nombre de frontières organisationnelles à traiter, sans supprimer les frontières privées entre candidats et personnel. Une seule entreprise peut contenir des acteurs aux droits très différents.

Le tableau suivant délimite la contribution. Les exclusions sont des choix de périmètre, non des jugements sur l’utilité des fonctions concernées.

| Domaine | Périmètre de CAP | Hors-périmètre ou extension non revendiquée |
| --- | --- | --- |
| Offres | Brouillon, formulaire configurable, publication et fermeture des dépôts | Diffusion universelle vers des sites d’emploi ou place de marché |
| Candidatures | Dépôt authentifié, pièces privées, consultation contextualisée | Dossier salarié modifiable ou gestion complète des talents |
| Assistance documentaire | Questions configurées, résultats structurés et correction humaine distincte | Classement automatique, mesure de compétence ou décision autonome |
| Coordination | Revue RH partagée, entretiens affectés et décisions explicites | Réservation exclusive des dossiers, vote ou dispositif de débat |
| Finalisation | Proposition enregistrée puis embauche séparée | Signature électronique, paie ou intégration administrative complète |
| Échanges externes | Export CSV et import confirmé de décisions de présélection | Connecteur natif avec chaque tableur ou service d’IA |

La clôture d’une offre illustre l’importance de cette frontière. Elle arrête les nouveaux dépôts, mais n’achève pas automatiquement les recrutements en cours et n’archive pas les candidatures. De même, l’enregistrement d’une proposition ne vaut pas embauche. Le produit privilégie des actes distincts plutôt qu’une progression automatique supposant des événements extérieurs non constatés [REF-CAP-PARCOURS].

## Acteurs et capacités contextuelles

### Des rôles nécessaires mais insuffisants

Le candidat dispose d’un compte léger et peut déposer au plus une candidature par offre. Le contenu soumis devient immuable : les réponses et documents restent ceux du dépôt. L’accès à sa candidature ne donne aucun accès aux notes internes, aux corrections RH ou aux évaluations des interviewers. La présentation de sa progression utilise une projection publique limitée plutôt que l’exposition directe de tous les états internes [REF-CAP-PRODUIT].

Les recruteurs et administrateurs partagent la lecture des candidatures, la revue, la présélection et la planification. Le propriétaire d’une offre est un recruteur ou administrateur particulier, identifié dans les données. Il est seul autorisé à modifier son brouillon, publier ou fermer cette offre et enregistrer une proposition ou une embauche. Le rôle administrateur ne constitue pas un droit universel de substitution au propriétaire.

L’interviewer intervient sur les rendez-vous qui lui sont affectés. Il consulte le contexte autorisé et soumet son appréciation finale. Un membre du personnel RH peut également être affecté comme interviewer ; sa capacité à évaluer découle alors de cette affectation, pas seulement de son rôle général. Un rendez-vous possède un responsable, et non un panel doté d’un mécanisme collectif de décision [REF-CAP-PARCOURS].

Le diagramme DIA-02 présente ces intentions principales. Il se lit comme une vue de cadrage, non comme une spécification exhaustive des droits.

[[FIG:DIA-02]]

Une capacité est donc contextuelle. Elle dépend du rôle, du lien avec la ressource, de l’état courant et, parfois, du temps. Être interviewer ne suffit pas pour évaluer n’importe quel rendez-vous ; être propriétaire ne suffit pas pour enregistrer une proposition avant que ses prérequis soient remplis. L’interface utilise les disponibilités d’action communiquées par le serveur, mais l’autorisation doit être contrôlée de nouveau lors de l’écriture [REF-CAP-ARCHITECTURE].

### Une coordination volontairement minimale

La revue RH est partagée. Le système ne réserve pas une candidature à la première personne qui l’ouvre et n’impose pas une attribution exclusive. Ce choix rend l’accès simple, mais expose à des modifications concurrentes. Il est accompagné de révisions de concurrence et d’un conflit explicite lorsqu’un utilisateur tente d’enregistrer une version devenue obsolète. Le brouillon local peut alors être comparé aux données fraîches avant une réapplication volontaire.

Cette sobriété concerne aussi la présélection. Deux personnes peuvent examiner le même dossier ; la première décision effectivement validée en base prévaut. Ouvrir une fenêtre ou exporter un fichier ne réserve rien. Les choix peuvent être discutés en dehors de CAP, mais aucun processus de débat ou d’approbation hiérarchique n’est prétendu implémenté. La plateforme encadre l’acte de décision, sans formaliser toutes les interactions humaines qui le précèdent [REF-CAP-PRESELECTION].

**Exemple conceptuel.** Une recruteuse consulte une candidature pendant qu’un collègue prépare une décision depuis un CSV. Le simple fait de lire le dossier ne bloque pas le collègue. Si celui-ci confirme une présélection, une correction restée ouverte ne doit plus être enregistrable ensuite. Cet exemple explique pourquoi le partage d’accès demande des contrôles d’état au moment de la mutation ; il ne décrit pas un incident observé en entreprise.

## Démarche de réalisation et checkpoints

### Une progression par décisions et incréments

Les traces disponibles montrent une démarche itérative organisée autour de problèmes bornés. Le cadrage des règles est suivi de leur traduction dans les contrats, puis de changements logiciels délimités et de checkpoints de vérification. Le tableau des tâches conserve les travaux restants ; les documents courants décrivent le comportement livré ; le journal retient quelques étapes significatives. Ces supports n’ont pas la même fonction et ne doivent pas être utilisés indifféremment [REF-CAP-DEMARCHE].

Le projet ne revendique pas une application formelle de Scrum. Aucun calendrier complet de sprints, aucun rituel régulier ni aucune durée totale de stage ne sont reconstitués à partir de quelques dates Git. L’itération est ici une propriété visible des décisions et des livraisons : une règle est discutée, précisée, mise en œuvre, puis confrontée à une preuve de portée définie. Cette description est plus fidèle qu’une méthode nommée mais non documentée.

Une évolution significative concerne le rôle de la revue. Une direction antérieure envisageait de conditionner la présélection à son achèvement. L’arbitrage retenu a séparé les deux : les RH peuvent décider sur une candidature encore en traitement, à condition que cette décision ferme les écritures ultérieures de traitement et de revue. Cette modification montre que l’incrément ne consiste pas seulement à ajouter des écrans ; il peut simplifier le modèle métier en supprimant une dépendance jugée indue [REF-CAP-DECISIONS].

### Des jalons documentés sans chronologie artificielle

Les checkpoints suivants permettent de comprendre la logique de progression. Ils ne prétendent pas couvrir toutes les activités du projet.

| Checkpoint documenté | Question traitée | Apport à la démarche |
| --- | --- | --- |
| Clarification de la présélection et de la revue | L’assistance doit-elle bloquer une décision RH ? | Séparation des dimensions et définition des clôtures |
| Politiques d’action contextualisées | Où exprimer rôle, propriété et affectation ? | Règles proches du domaine et disponibilités typées pour l’interface |
| Publication et entretiens facultatifs | Quand figer la configuration et permettre une proposition ? | Contrôle des configurations enregistrées et chemin sans entretien artificiel |
| Revue partagée et conflits | Comment éviter l’écrasement silencieux ? | Révisions séparées et réapplication locale explicite |
| Démonstration et intégration documentaire | Comment distinguer scénario préparé et résultat réel ? | Données synthétiques identifiées et provenance des modes d’exécution |

Le journal du 13 novembre 2026 documente notamment l’intégration du traitement documentaire et les corrections de lancement. Il distingue les réponses déclarées des fixtures, la lecture native d’un PDF et l’exécution réelle d’un fournisseur. Une préparation locale réussie n’est donc pas transformée en mesure de qualité de l’extraction. De même, les vérifications historiques ciblées ne sont pas additionnées pour produire un total donnant l’impression d’une régression complète [REF-CAP-JOURNAL].

La vérification est organisée par nature de preuve. Une compilation établit une compatibilité statique dans un périmètre donné ; un scénario synthétique prépare un cas d’usage ; une vérification HTTP authentifiée ou une manipulation manuelle répond à d’autres questions. Plusieurs gates d’acceptation demeurent ouvertes, notamment sur la confidentialité, la concurrence, la reprise et les interactions natives. Le rapport réserve leur discussion détaillée au chapitre de vérification, plutôt que de les masquer derrière le terme général « validé » [REF-CAP-STATUT].

## Livrables, contraintes et critères de réussite

Le premier livrable est la plateforme elle-même : une interface React/Vite, une API NestJS, un domaine TypeScript partagé et une persistance PostgreSQL. À ce code s’ajoutent les contrats décrivant les règles d’accès et les échanges, les guides de lancement, les données synthétiques de démonstration et les supports de présentation. Ces éléments forment un ensemble : un scénario démonstratif sans contrat peut être ambigu, tandis qu’un contrat sans réalisation ne prouve pas l’existence d’un parcours utilisable [REF-CAP-ARCHITECTURE].

Les contraintes du projet influencent directement les choix. Les documents sont privés. Les dépendances externes doivent rester remplaçables derrière des frontières explicites. Le dépôt d’une candidature ne doit pas attendre une interprétation distante. L’activation d’un fournisseur implique un périmètre et une maîtrise des dépenses propres ; elle n’est pas une condition générale d’utilisation du produit. Enfin, la démonstration repose sur des données synthétiques dont l’étiquetage doit permettre de distinguer information préparée, résultat automatique et correction humaine.

Les critères de réussite doivent être formulés comme des propriétés observables, non comme des slogans. « Simplifier le recrutement » serait trop large pour permettre une acceptation. À l’inverse, vérifier qu’une candidature sans extraction peut suivre le parcours attendu, ou qu’un utilisateur non propriétaire ne peut pas finaliser une offre, pose une question déterminée.

| Objectif | Livrable ou mécanisme associé | Critère d’acceptation pertinent |
| --- | --- | --- |
| Maintenir un recrutement sans IA | Configuration sans tâche et décisions manuelles | Parcours complet sans dépendance fournisseur |
| Rendre les responsabilités explicites | Propriété, affectation et politiques d’action | Refus et projections cohérents selon acteur et contexte |
| Préserver le sens des informations | Dépôt, résultat original et correction distincts | Source inchangée et valeur effective explicable |
| Permettre le travail partagé | Révisions et conflits présentés à l’utilisateur | Aucune écriture obsolète appliquée silencieusement |
| Ouvrir un travail externe maîtrisé | CSV et assistant de confirmation | Identités vérifiées et décisions confirmées atomiquement |
| Présenter un bilan crédible | Contrats, statut et catalogue synthétique | Affirmations proportionnées à la preuve disponible |

Ces critères structurent l’acceptation à mener ; leur présence dans le tableau ne signifie pas qu’ils ont tous été vérifiés en conditions réelles. La réalisation dans le code, une observation datée et l’acceptation complète restent trois niveaux distincts. Aucune réduction mesurée du temps de recrutement, aucune équité démontrée et aucune conformité juridique auditée ne sont revendiquées à ce stade.

## Conclusion

CAP est un prototype de centralisation du recrutement pour une entreprise, et non une plateforme universelle de gestion des ressources humaines. Son cadre confirmé se rattache à BeeCoders, sans permettre d’inventer une histoire de l’organisme ou une enquête métier. Sa contribution repose sur des responsabilités contextualisées, une assistance documentaire facultative et des actes de recrutement explicites. La démarche traçable procède par arbitrages, incréments et checkpoints dont les preuves conservent leur portée propre. Ce cadre permet maintenant d’analyser les besoins et les solutions existantes selon des critères précis, plutôt que de justifier le produit par une promesse générale d’automatisation.
