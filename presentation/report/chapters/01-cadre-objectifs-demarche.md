# Chapitre 1 — Contexte du projet et démarche de réalisation

## Introduction

La conception d’une plateforme de recrutement demande de relier les étapes du parcours, les informations disponibles et les responsabilités de ses intervenants. Ce chapitre présente le cadre du projet, délimite le produit réalisé et expose la démarche suivie pour passer des règles métier à une application intégrée.

## Cadre du projet

Ce projet de fin d’études en génie informatique à Esprit a été réalisé dans le cadre d’un stage chez BeeCoders. Il porte sur la conception et la réalisation d’une plateforme de recrutement associant gestion des candidatures et assistance à la lecture des documents.

Le besoin traité est de réunir, dans un même environnement, les exigences d’un poste, les dossiers reçus, les observations des intervenants et les décisions du recrutement. Une information centralisée doit rester compréhensible : son origine, son usage et les personnes autorisées à la modifier comptent autant que sa disponibilité. La plateforme organise ainsi le dossier autour d’une offre déterminée, plutôt qu’autour d’un profil candidat modifiable indépendamment de ses dépôts.

## Objectifs et périmètre

### Objectifs du projet

Le premier objectif est de couvrir les principales étapes du recrutement : préparer une offre et son formulaire, recevoir les candidatures, examiner les dossiers, organiser les entretiens éventuels et enregistrer les décisions. Chaque étape doit présenter les informations et les actions utiles à son intervenant.

Le deuxième objectif concerne le travail partagé. Plusieurs membres des ressources humaines peuvent examiner les mêmes dossiers ; le système doit donc encadrer les autorisations et éviter qu’une modification ancienne écrase silencieusement une décision plus récente. La confidentialité des documents et la conservation du contenu soumis font partie de cette exigence.

Le troisième objectif est d’apporter une assistance documentaire configurable. Des questions définies pour une offre permettent d’obtenir des indicateurs structurés à partir des documents. Les ressources humaines peuvent consulter la source et corriger les champs proposés. Cette assistance est facultative : le dépôt et les décisions manuelles restent accessibles sans extraction.

### Périmètre fonctionnel

CAP est destiné à une instance déployée pour une entreprise. Ce choix concentre la conception sur les droits internes et les parcours de recrutement, sans introduire de gestion de locataires entre plusieurs entreprises. Le périmètre ne couvre ni une place de marché de candidats ni la gestion administrative complète des salariés.

[[TABLE:ch1-perimetre]] Périmètre fonctionnel de CAP

| Domaine | Fonctions couvertes | Frontière du périmètre |
| --- | --- | --- |
| Offres | Brouillon, formulaire configurable, publication, fermeture des dépôts | Pas de multidiffusion vers les sites d’emploi |
| Candidatures | Dépôt authentifié, pièces privées, consultation du dossier | Contenu soumis conservé après dépôt |
| Assistance | Questions documentaires, réponses structurées, revue par champ | Pas de classement automatique des candidats |
| Coordination | Examen RH partagé et entretiens affectés | Répartition du travail et discussion des critères organisées par l’équipe |
| Finalisation | Proposition puis embauche enregistrées séparément | Pas de signature électronique ni de paie |
| Échanges | Export CSV et import confirmé de décisions de présélection ou de rejet | Pas de synchronisation native avec les outils externes |

La plateforme facilite l’exploitation des informations sans se substituer à l’évaluation professionnelle. Les questions documentaires portent sur ce qu’un CV permet d’identifier ; elles ne certifient pas les déclarations du candidat. Les décisions de poursuite du recrutement restent des actes humains.

## Démarche de réalisation

### Organisation itérative

Le projet suit une démarche itérative et incrémentale, avec approfondissement progressif des spécifications. Chaque ensemble de changements part d’un besoin délimité, précise les règles et les échanges attendus, puis les traduit dans le domaine, l’API et l’interface. Le suivi par tâches et sous-tâches permet de décomposer les sujets, de suivre les dépendances et de distinguer les réalisations des vérifications restantes.

Les changements cohérents sont isolés dans des branches et des répertoires de travail Git (*worktrees*), puis intégrés à la branche principale. La refonte de l’interface et l’intégration de l’extracteur CV ont notamment été menées de cette manière. Le découpage distingue règles métier, protections des brouillons, assistance documentaire et préparation de la démonstration.

Une itération peut également conduire à simplifier une règle. La présélection a ainsi été dissociée de l’achèvement de la revue documentaire : les ressources humaines peuvent poursuivre ou arrêter une candidature à partir des éléments disponibles, sans attendre systématiquement l’assistance. Ce choix a demandé de préciser les interactions entre décision, traitement et corrections, puis d’adapter les parcours concernés.

Cet approfondissement concerne aussi la conception technique : extraction de politiques d’autorisation, harmonisation des parcours d’interface et intégration progressive des questions typées Jev à la revue. La documentation technique a été nettoyée et mise à jour avec les contrats retenus. Ces ajustements maintiennent l’alignement entre spécification, code et usage, sans imposer une conception entièrement figée au départ.

Les contrôles interviennent à la suite d’ensembles cohérents de modifications. Ils associent, selon le sujet, compilation, vérifications ciblées et examen de parcours. Le workflow CI présent dans le dépôt est configuré pour lancer la construction et la vérification de types. Le [[REF:chapter-6]] présente la couverture des contrôles et les compléments nécessaires.

### Principaux jalons techniques

[[TABLE:ch1-jalons]] Principaux jalons techniques

| Jalon | Travail structurant | Apport au produit |
| --- | --- | --- |
| Cadrage du parcours | Définition des étapes et responsabilités | Décisions et prérequis explicites |
| Configuration des offres | Formulaire, tâches documentaires et plan d’entretien | Parcours adaptable à chaque poste |
| Gestion du dossier partagé | Consultation, corrections et détection des conflits | Collaboration sans écrasement silencieux |
| Unification de l’interface | Navigation, inspection, édition et confirmations | Actions présentées dans leur contexte |
| Assistance documentaire | Préparation du PDF et réponses structurées | Indicateurs exploitables dans la revue |
| Préparation de la démonstration | Scénarios synthétiques et documentation de lancement | Illustration des principaux états du parcours |

## Livrables et critères de réussite

Les livrables comprennent l’application web, l’API, le domaine partagé et le schéma de persistance, accompagnés des contrats d’échange, des guides de lancement et des scénarios synthétiques de démonstration. L’ensemble permet de présenter à la fois les usages du produit et les mécanismes qui les soutiennent.

Les critères de réussite portent sur des comportements observables : déposer une candidature sans dépendre d’un service d’IA, restreindre les accès selon le contexte, conserver la source des informations examinées, signaler un conflit de modification et confirmer les décisions importées avant leur application. Ils servent de fil conducteur entre les besoins, la conception et la vérification.

Le résultat est un prototype intégré, évalué par des contrôles ciblés et des parcours partiels. Le [[REF:chapter-6]] en présente les résultats et les vérifications restantes.

## Conclusion

Le projet associe centralisation du recrutement, collaboration RH et assistance documentaire facultative dans un périmètre destiné à une entreprise. La démarche itérative a permis d’articuler les règles métier, les échanges et leur présentation dans l’interface. Le chapitre suivant précise les besoins des acteurs et les critères qui orientent les choix de solution.
