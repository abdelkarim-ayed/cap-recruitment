# Chapitre 6 — Vérification, démonstration et bilan

## Introduction

La vérification de CAP accompagne trois objectifs : préserver les règles du parcours de recrutement, rendre les dossiers et corrections cohérents, et intégrer l’assistance documentaire sans confondre résultat technique et décision humaine. Elle associe des contrôles ciblés, des constructions de l’application et des parcours manuels sur données synthétiques. Leur portée est présentée par usage plutôt que par étape de développement.

Les contrôles historiques et les parcours manuels consignés donnent une base concrète de démonstration, sans constituer une acceptation complète de la version finale. Les observations exploratoires et l’exemple documentaire enregistré du [[REF:chapter-5]] complètent ce bilan ; ce chapitre précise la couverture des vérifications et les priorités restantes.

## 6.1. Organisation des vérifications

### 6.1.1. Contrôles ciblés et intégration continue

Les contrôles du domaine et de l’API ont porté notamment sur la validation des configurations, les transitions autorisées, la préparation de revue, les corrections et les décisions. Des modèles de transaction et des ports simulés ont permis d’examiner des cas difficiles à reproduire manuellement : requête périmée, écriture sans changement, validation atomique de plusieurs champs ou conflit entre deux opérations. Les contrôles DOM ont porté sur les brouillons, les confirmations, la navigation et les états d’attente ou de conflit.

Ces contrôles sont complémentaires. Un modèle sérialisé vérifie une règle sous l’ordre qu’il représente ; il ne prouve pas les verrous réels de PostgreSQL. Un DOM simulé examine les interactions rendues, pas tous les comportements natifs de focus ou d’historique. Les résultats successifs ne sont donc ni additionnés en un total de couverture, ni présentés comme une campagne complète sur le code final.

Le workflow GitHub Actions est déclenché sur les push et demandes de fusion. Il installe les dépendances avec le fichier de verrouillage, sous Node.js 24, puis lance la construction et la vérification de types. Une étape de tests d’intégration est conditionnée à la présence d’une URL de base de données ; le workflow ne prépare ni PostgreSQL, ni Redis, ni les données nécessaires. Ce fichier établit un contrôle d’assemblage automatisé, pas la preuve d’une exécution des parcours métier en CI. Les constructions locales consignées restent des résultats distincts.

### 6.1.2. Vérification des parcours

Le tableau rassemble les contrôles ciblés et les parcours manuels consignés dans le suivi du projet.

[[TABLE:ch6-verifications]] Vérifications des parcours de recrutement

| Parcours | Comportement recherché | Résultat consigné | Vérification finale restante |
|---|---|---|---|
| Configuration et publication | Valider le formulaire et le plan, figer la configuration et la référence temporelle | Contrôles ciblés des règles et constructions consignés ; états publiés disponibles dans le jeu synthétique | Publication authentifiée de bout en bout, révisions périmées et opérations concurrentes sur la version finale |
| Dépôt et document privé | Enregistrer une candidature complète et limiter l’accès au document | Contrôles historiques d’admission et d’accès privé ; documents synthétiques initialisés avec empreintes vérifiées | Nouveau dépôt authentifié avec refus croisé d’accès entre comptes et rôles |
| Préparation, libération et revue | Libérer un traitement bloqué, corriger puis figer la revue | Sur une candidature en attente : libération manuelle, corrections, achèvement puis revue en lecture seule | Contrat actuel par question, isolation HTTP, conflits et écritures tardives réels |
| Présélection et finalisation sans entretiens | Décider explicitement, puis distinguer proposition et embauche | Sur le même dossier sans entretiens : présélection, proposition explicite du propriétaire puis embauche séparée | Matrice complète des rôles et conflits de décisions |
| Entretiens et proposition | Bloquer la proposition tant que les résultats requis manquent ; réserver la finalisation au propriétaire | Validation partielle bloquante ; second recruteur incapable de finaliser ; proposition explicite du propriétaire après résultats requis | Refus HTTP directs, concurrence et cohérence des états finaux |
| Évaluation éliminatoire et replanification | Appliquer la sortie disqualifiante et annuler les rendez-vous restants ; replanifier par le parcours prévu | Après le « Fail » de l’entretien technique saisi par le premier évaluateur, le rendez-vous restant quitte la vue ordinaire et figure dans « Cancelled ». Sur un autre parcours : demande de changement, notification et replanification RH | Chevauchements, destinataires, immutabilité des évaluations et accès documentaires révoqués |
| Notifications candidat | Montrer la présélection et distinguer non-lu et historique | Notification visible ; lecture la retire des non-lus mais la conserve dans la vue générale | Isolation entre comptes et couverture des destinataires prévus |
| Export et import CSV | Exporter les valeurs effectives, prévisualiser puis confirmer des décisions | Contrôles ciblés de parsing, projections et interface ; inspection manuelle partielle | Aller-retour authentifié complet, parité liste/total/export, rollback et conflit lors de l’application |

Pour le CSV, l’acceptation reste centrée sur un scénario traçable : exporter des dossiers, préparer des décisions, prévisualiser leur regroupement, confirmer leur application puis contrôler les états obtenus.

## 6.2. Vérification de la chaîne documentaire

### 6.2.1. Résultats techniques disponibles

Le transfert du laboratoire conserve vingt paires exactes requête-réponse et 102 réponses dont la structure a été contrôlée. Les identifiants, catégories, distributions et métadonnées correspondent à leurs requêtes historiques. Des lectures natives ciblées ont également retrouvé les octets Markdown transférés pour deux identités documentaires. Ces vérifications ont porté sur l’intégrité des artefacts et la compatibilité des contrats.

Lors du démarrage local initial en mode simulé, une tâche présemée a terminé la lecture PDF native et le traitement par réponse de fixture, avec écriture des fichiers de préparation et de réponse. Les constructions du domaine, de l’API et du web sont également consignées. L’exemple documentaire enregistré du [[REF:chapter-5]] présente la mention de certification, la requête correspondante et la réponse utilisée par la revue.

### 6.2.2. Portée des observations sémantiques

L’analyse qualitative met en évidence des distinctions utiles : formation explicitement en cours non traitée comme achevée, emploi supervisé distingué du bénévolat et mention explicite de certification normalisée en booléen dans l’exemple intégré. Elle conserve aussi un cas de liaison insuffisamment justifiée entre Excel et un projet de tableur, ainsi qu’une distribution de durée attribuant une probabilité à une tranche incompatible avec la période maximale documentée.

L’échantillon exploratoire n’est pas indépendant : contenus synthétiques, choix intentionnel des difficultés, variantes d’une identité et ajustements de formulation limitent la généralisation. Certains cas de qualification ou de durée restent ambigus à la lecture. Aucun taux de précision global n’est établi.

## 6.3. Dispositif de démonstration

### 6.3.1. Cinq offres et 25 scénarios

Le jeu de démonstration rassemble cinq offres et 25 candidatures synthétiques. Il couvre un brouillon de Data Analyst, une offre Backend Engineer centrée sur la revue, une offre Senior Software Engineer avec entretiens, une offre Finance Operations Analyst sans extraction et une offre Financial Accountant dont les dépôts sont fermés. Les dossiers préparent des situations reçues, bloquées, libérées, corrigées, présélectionnées, en entretien, rejetées, en proposition et embauchées.

Cette préparation rend visibles des mécanismes difficiles à parcourir rapidement depuis une plateforme vide. Le dossier sans tâches montre que l’assistance est facultative ; un dossier libéré distingue renoncement au traitement et succès ; des entretiens partiellement validés montrent le blocage de proposition. La fermeture d’une offre arrête les nouveaux dépôts sans arrêter, à elle seule, les recrutements existants.

L’initialisation locale et les empreintes des 25 objets documentaires ont été vérifiées. La répétabilité complète de la remise en état et les transitions authentifiées de tous les scénarios restent à confirmer. Les documents et identités sont synthétiques ; les états préparés ne sont pas présentés comme des actions accomplies pendant la démonstration.

### 6.3.2. Lecture du parcours présenté

Une démonstration représentative peut partir d’une offre publiée, déposer une candidature synthétique, consulter son état, examiner le PDF et un résultat disponible, corriger un champ puis poursuivre par une décision humaine. Une seconde branche montre les entretiens et les prérequis de proposition. Les actions réellement effectuées sont distinguées des dossiers déjà préparés ; le mode de réponse est annoncé selon la distinction du [[REF:chapter-5]].

Le dispositif local dispose aussi d’une capture des courriels sur fichier, adaptée à la consultation des messages de développement. Cela ne vaut pas déploiement de messagerie en production. De même, la disponibilité locale de l’API et de l’interface soutient la présentation du prototype, sans établir une exploitation prolongée ou une capacité à grande échelle.

## 6.4. Vérifications complémentaires et limites

### 6.4.1. Priorités de consolidation

Les prochaines vérifications utiles traversent les frontières du système : session et document privé ; publication et instantané ; correction et export ; décision humaine et résultat tardif ; réponse en cache et persistance en base. Elles doivent compléter les contrôles ciblés existants par quelques parcours authentifiés de la version finale.

Pour la chaîne documentaire, une vérification finale concise consisterait à figer questions et documents, réserver quelques CV non utilisés pour régler les formulations, puis relever réponse, passage justificatif et éventuelle ambiguïté. Elle distinguerait erreur de lecture, erreur d’interprétation et information insuffisante. Les absences, qualifications en cours, produits voisins et dates chevauchantes constituent des cas particulièrement utiles. Cette étape est un suivi proposé, pas une campagne déjà réalisée.

La récupération après panne demande des scénarios séparés : interruption autour de l’envoi, succès caché avant enregistrement, accusé de persistance perdu, cache manquant et clôture pendant le traitement. La politique implémentée interdit un nouvel envoi après une issue incertaine et permet certaines récupérations locales. Son acceptation sur PostgreSQL, Redis et HTTP réels reste ouverte. Le coût fournisseur est estimé au [[REF:chapter-5]] ; les délais et l’utilité en revue restent à mesurer.

### 6.4.2. Limites d’usage et perspectives

Le lecteur natif dépend de la couche texte des PDF et ne traite pas les scans. Les catégories simplifient les durées et qualifications ; les équivalences internationales et les liens entre outils et activités demandent encore une vigilance humaine. L’interface rend la vérification possible, mais les parcours disponibles ne mesurent pas l’attention réelle des recruteurs ni un gain de temps.

Avant un usage avec des candidatures réelles, il faudrait préciser les conditions de transfert au fournisseur, la conservation des dérivés documentaires et la responsabilité des utilisateurs. Les accès doivent être éprouvés à travers les sessions réelles. La rétention automatique et les quotas des caches, les comportements multiplateformes et l’exploitation prolongée demandent également une consolidation.

Les extensions les plus cohérentes seraient ensuite l’OCR pour les documents numérisés, une justification mieux localisée dans la source et une politique explicite de délégation des responsabilités.

## 6.5. Synthèse des contributions et résultats

[[TABLE:ch6-contributions]] Contributions et résultats

| Contribution | Réalisation | Résultat disponible | Limite principale |
|---|---|---|---|
| Parcours de recrutement partagé | Offres configurables, candidatures, présélection, entretiens, proposition et embauche distinctes | Finalisation sans entretiens ; proposition bloquée sur résultats partiels et réservée au propriétaire | Recette complète de la version finale et concurrence réelle restantes |
| Revue documentaire contrôlable | PDF source, original conservé, correction par question, valeur effective et verrouillage | Libération, corrections, achèvement et revue en lecture seule ; contrôles ciblés des révisions et brouillons | Isolation authentifiée et conflits réels à compléter |
| Assistance configurable | Cinq familles, requête regroupée par extracteur, réponse typée et normalisée | Archives exploratoires et exemple documentaire enregistré du [[REF:chapter-5]] | Pas de mesure de précision indépendante |
| Préparation locale et réutilisation | Lecteur PDF natif borné, diagnostics, caches privés et connaissance durable des envois | Lectures ciblées, chemin intégré avec réponse simulée et constructions consignées | Robustesse documentaire et reprise sous panne non acceptées de bout en bout |
| Interopérabilité | Exports effectifs, import groupé avec prévisualisation et confirmation | Contrôles ciblés des formats, projections et interactions | Aller-retour authentifié complet restant |
| Support de démonstration | Cinq offres, 25 scénarios synthétiques et capture locale de courriels | Initialisation et préparation locales observées | Répétabilité globale et transitions de tous les scénarios à confirmer |

La contribution principale est l’intégration d’un parcours métier et d’une assistance inspectable dans une même plateforme. L’extraction ne décide pas du recrutement : elle produit des indicateurs documentaires dont l’origine et la correction restent lisibles. Le travail d’ingénierie porte autant sur ces frontières que sur l’appel au modèle.

## Conclusion

CAP réunit les fonctions nécessaires à une démonstration représentative du recrutement, avec une assistance documentaire facultative et une revue humaine explicite. Les contrôles ciblés, les parcours manuels et les observations exploratoires soutiennent des résultats précis. La consolidation finale doit encore confirmer les frontières d’accès, les échanges CSV et les comportements sous concurrence ou panne, avant de transformer ce prototype en service exploité.
