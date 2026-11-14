# Chapitre 4 — Architecture et réalisation

## Introduction

CAP est organisé autour d’un monolithe modulaire : l’API centralise les règles et les transactions, tandis que l’interface prend en charge la préparation et la confirmation des actions. Le stockage documentaire, le courrier et l’assistance sont reliés par des interfaces dédiées. Cette organisation maintient les décisions métier dans une base transactionnelle commune tout en isolant les interactions extérieures [REF-CAP-SOURCE].

## 4.1. Technologies et organisation du code

### 4.1.1. Espace de travail partagé

Le projet utilise un espace de travail pnpm et trois ensembles TypeScript. `apps/web` contient l’interface React construite avec Vite ; `apps/api` contient l’API NestJS ; `packages/domain` regroupe les types, les schémas et le vocabulaire communs. Le manifeste fixe Node.js 24 comme environnement JavaScript. Les dépendances principales comprennent React 19, NestJS 12, Zod 4 et le pilote PostgreSQL `pg`.

[[TABLE:ch4-ensembles-responsabilites]] Responsabilités des ensembles techniques.

| Ensemble | Responsabilité |
|---|---|
| Domaine partagé | Contrats, validation des données et vocabulaire des actions |
| API NestJS | Identité, autorisation contextuelle, orchestration et persistance |
| Interface React | Navigation, formulaires, inspection, brouillons et confirmations |
| Infrastructure | PostgreSQL, Redis, stockage privé et courrier |

Le partage de contrats permet de faire évoluer ensemble un schéma et ses consommateurs. TypeScript contrôle les usages pendant le développement ; Zod analyse à l’exécution les données reçues. Le serveur valide donc les requêtes même lorsque l’interface emploie les mêmes schémas. Il vérifie notamment les identifiants uniques des champs, les références documentaires et la cohérence entre formulaire et extracteurs.

### 4.1.2. Modules et responsabilités

NestJS assemble les modules d’identité, d’offres, de candidatures, de traitement, de revue, d’entretiens et d’infrastructure. Ils appartiennent à la même application et ne constituent pas des microservices. Cette organisation permet de conserver les décisions et leurs effets dans des transactions PostgreSQL locales.

[[FIG:DIA-04]]

*Figure — Architecture modulaire de CAP et interfaces avec le stockage, le courrier et l’assistance documentaire.*

Les contrôleurs portent les routes et leurs conditions d’accès générales. Les politiques expriment les conditions métier à partir des faits chargés. Les services orchestrent les commandes et leurs transactions. La séparation de persistance est ciblée : le module d’offres possède un dépôt SQL dédié, tandis que les services de candidature, de revue et d’entretien conservent des requêtes près de leurs règles. Les interfaces externes sont isolées sans imposer une couche de dépôt uniforme à toutes les fonctionnalités.

Ce choix limite la complexité d’exploitation tout en rendant les responsabilités identifiables. Une séparation future de services pourrait répondre à un besoin d’isolation ou de charge spécifique.

## 4.2. Identité et accès aux ressources

### 4.2.1. Authentification

L’identité repose sur Better Auth et sur des tables PostgreSQL. L’inscription publique crée un compte candidat ; le champ de rôle n’est pas modifiable par cette inscription. L’authentification par mot de passe exige une adresse vérifiée. La configuration ajoute des codes à usage unique, conservés sous forme hachée, avec expiration de cinq minutes et trois tentatives autorisées. Elle limite également les requêtes d’authentification.

Le garde de session résout l’utilisateur à partir du cookie et construit l’acteur de confiance transmis aux services. Pour les écritures protégées, il contrôle aussi l’origine de la requête. Les rôles admissibles sont vérifiés au niveau des routes ; la propriété d’une offre ou l’affectation d’un entretien sont ensuite vérifiées à partir des données courantes. Les droits affichés par React ne deviennent jamais une autorisation persistante.

### 4.2.2. Initialisation des comptes internes

Les comptes internes sont provisionnés par une commande dédiée qui accepte les rôles administrateur, recruteur et interviewer. Cette commande permet notamment de créer le premier administrateur ; l’application ne crée pas automatiquement un compte administrateur avec un mot de passe par défaut. Le compte provisionné doit vérifier son adresse avant la connexion par mot de passe. Un mot de passe initial peut être fourni au provisionnement ; à défaut, le parcours de réinitialisation permet de le définir.

Cette étape est distincte des migrations d’identité et des migrations métier. Les migrations sont explicites et ne sont pas exécutées silencieusement par le démarrage normal de l’API. L’initialisation d’une installation comprend donc le schéma, le compte interne et le canal de courrier nécessaire à la vérification.

## 4.3. Persistance et stockage documentaire

### 4.3.1. PostgreSQL et données variables

PostgreSQL conserve les rattachements et les contraintes présentés au [[REF:chapter-3]]. JSONB porte les formulaires, les instantanés, les réponses et les résultats dont la structure dépend de l’offre. Ce compromis garde les relations structurantes en SQL et permet de faire varier les configurations sans ajouter une table pour chaque question. La mise à jour d’une valeur JSONB verrouille toutefois la ligne entière, et non le seul champ modifié [REF-TECH-POSTGRES-JSON].

`DatabaseService` fournit un pool et un client transactionnel commun aux opérations composées. Les migrations métier sont ordonnées et suivies avec contrôle d’empreinte. Pour les exports, une lecture répétable rassemble dossiers, résultats et corrections dans un même instantané de lecture. Les listes calculent leur total et leur page dans une seule instruction SQL ; leurs filtres s’appliquent avant pagination.

### 4.3.2. Stockage privé et intégrité documentaire

Le port `DocumentStorage` sépare les opérations métier de leur implantation locale. L’adaptateur génère une référence opaque, écrit les octets dans un fichier temporaire puis le renomme. La base conserve la taille et l’empreinte SHA-256. Au téléchargement, le serveur contrôle à nouveau l’accès au dossier, le rattachement du document, la taille et l’empreinte avant de retourner les octets.

Les fichiers ne possèdent pas d’URL publique. Ils sont téléchargés par une route authentifiée ; la prévisualisation PDF emploie les octets autorisés dans le navigateur. Le contrôle d’intégrité vérifie la correspondance avec le fichier déposé, pas son innocuité : une analyse antivirus n’est pas intégrée au prototype.

La base et le système de fichiers n’ont pas de validation atomique commune. Si l’écriture SQL échoue et que l’absence de candidature est confirmée, le service tente de retirer les objets créés. Si l’issue du commit est ambiguë, il conserve les octets afin de ne pas supprimer une pièce potentiellement référencée. Ce choix privilégie l’intégrité du dossier ; une réconciliation des objets orphelins relève des compléments d’exploitation.

## 4.4. Traitement asynchrone et intégrations

### 4.4.1. Traitement documentaire intégré

Le dépôt ne reste pas ouvert pendant l’extraction. Après validation de la candidature, l’API émet un signal mémoire ; un runner intégré recherche aussi les travaux éligibles en base, par balayages espacés de cinq secondes. Chaque cycle traite séquentiellement jusqu’à dix candidatures. Les baux et jetons PostgreSQL encadrent les prises en charge et les écritures, tandis que les tâches déjà réussies ne sont pas relancées.

Le signal accélère la prise en charge, mais la base conserve le travail à retrouver après un redémarrage. Redis n’est pas une file documentaire : il intervient dans les contrôles d’admission de la passerelle fournisseur. Le traitement n’utilise donc ni BullMQ ni bus d’événements.

Deux interfaces décrivent la chaîne documentaire : `DocumentMarkdownReader` transforme les octets en document analysé ; `TaskExecutor` produit les réponses et leur provenance à partir du document et du contexte figé. Le lecteur PDF natif est exécuté dans un processus enfant. Les caches privés conservent les sorties de parsing et les réponses validées ; le registre SQL des tentatives complète ces caches pour la maîtrise des envois. Le [[REF:chapter-5]] développe la construction des requêtes, les réponses typées et la revue.

### 4.4.2. Courrier et notifications internes

Le port `MailSender` possède un adaptateur SMTP fondé sur Nodemailer et un adaptateur de capture en fichier pour le développement. Le courrier intervient notamment dans la vérification d’adresse et les parcours d’accès au compte. Le transport SMTP est implémenté ; l’environnement local décrit ici utilise la capture en fichier. Celle-ci permet de consulter le message généré sans établir sa réception dans une boîte externe.

Les notifications métier internes sont différentes des courriels. Les décisions initiales alimentent la boîte du candidat ; les changements d’entretien produisent les notifications prévues pour les intervenants. Leurs destinataires et contenus sont déterminés par des politiques, puis enregistrés avec la commande métier. Il n’existe pas de couplage général transformant toute notification en courriel, ni de synchronisation avec un calendrier externe.

## 4.5. Parcours réalisés

### 4.5.1. Édition et publication

L’éditeur réunit l’annonce, les champs candidat et les questions documentaires attachées à leurs sources. Il conserve des identifiants stables tout en présentant des libellés lisibles. La publication confirme la configuration sauvegardée et le plan d’entretien, y compris lorsqu’il est vide.

[[FIG:CAP-10]]

*Figure — Édition d’une offre et confirmation de sa publication.*

L’exemple suivant résume la réalisation du protocole de concurrence présenté au [[REF:chapter-3]]. Le dépôt verrouille l’offre ; le service vérifie les deux révisions dans cette transaction, puis la mise à jour fixe la date de référence au premier passage à l’état publié.

```text
transaction :
  offre = verrouiller_offre()
  vérifier_propriétaire_et_révision_offre(offre)
  plan = lire_plan_sauvegardé_dans_la_transaction()
  vérifier_révision_plan_et_définitions(plan, offre)
  publier_et_fixer_la_date_de_référence_si_absente()
```

L’interface ne publie pas les changements locaux non enregistrés. Elle charge le plan sauvegardé avant confirmation et ne répète pas automatiquement une commande après échec. Cette articulation relie la configuration inspectée à celle effectivement engagée.

### 4.5.2. Dépôt et consultation du dossier

Le parcours candidat vérifie si un dossier existe déjà avant d’ouvrir une nouvelle saisie. L’adresse du compte reste une identité issue de l’authentification, et non un champ libre du formulaire. À la soumission, le serveur valide les réponses selon le formulaire publié, conserve l’instantané et les pièces, puis déclenche le réveil documentaire après commit.

[[FIG:CAP-11]]

*Figure — Consultation d’une candidature déposée et de ses pièces.*

Les RH consultent ensuite le dossier et, si des extracteurs sont configurés, disposent d’une revue liée au PDF source. Les résultats originaux, corrections et valeurs effectives suivent le modèle présenté au [[REF:chapter-5]], qui contient également la vue détaillée de cet écran.

### 4.5.3. Agenda et décisions

L’agenda sépare les entretiens à venir, passés et annulés. La semaine commence le lundi. Les filtres de période et d’affectation sont appliqués côté serveur ; la planification transmet un instant ISO et une zone IANA, tandis que l’affichage utilise le fuseau du navigateur. Un entretien dont le début est atteint rejoint les entretiens passés et peut être retrouvé par le filtre des avis attendus.

[[FIG:CAP-14]]

*Figure — Agenda des entretiens et affectations.*

La remise de l’avis demande une issue explicite, sans choix favorable ou défavorable présélectionné. Les étapes sans rendez-vous restent visibles comme non planifiées. Le propriétaire confirme ensuite la proposition si les prérequis sont satisfaits, puis l’embauche par une autre action.

[[FIG:CAP-15]]

*Figure — Progression d’une candidature et actions de finalisation accessibles.*

### 4.5.4. Navigation et brouillons

L’interface distingue consultation, préparation et engagement. Les titres restent des liens natifs ; les mutations se concentrent dans des dialogues ciblés. Les propositions non sauvegardées restent locales à la vue. Après un conflit, leur conservation permet de comparer l’intention avec l’état rafraîchi, sans fusion ni renvoi automatique.

Une frontière de navigation protège les vues modifiées et les écritures en cours. Elle demande confirmation avant abandon, bloque le départ pendant une mutation non résolue et utilise l’avertissement standard du navigateur pour la fermeture ou le rechargement. Les marqueurs d’historique contiennent des positions, pas les réponses ou corrections. La mémoire de filtres, distincte des brouillons, est limitée au compte, au rôle et à l’onglet.

## 4.6. Exports et import CSV

### 4.6.1. Exports de diagnostic et de présélection

L’export diagnostic fournit une vue large des candidatures, de leurs états et des données de revue. L’export compact de présélection porte sur les candidatures encore indécises et reprend les filtres factuels des listes RH. Il concerne l’ensemble filtré côté serveur, pas uniquement les lignes chargées dans le navigateur.

Les colonnes documentaires sont générées à partir des questions configurées. Les valeurs de présélection utilisent la projection effective définie au [[REF:chapter-5]]. Les réponses candidat restent formatées selon leur formulaire figé, avec préservation de la valeur booléenne fausse et du nombre zéro. La sérialisation protège contre les formules de tableur et gère les caractères de séparation. Les exports sont bornés à mille candidatures et dix mébioctets.

Les liens documentaires sont construits depuis l’origine web configurée et restent authentifiés. L’export facilite l’analyse ou la coordination hors de CAP ; il crée aussi une copie de données dont la conservation doit être maîtrisée.

### 4.6.2. Aperçu et confirmation de l’import

L’import accepte un CSV UTF-8 borné contenant l’identifiant de candidature, l’adresse du compte et la décision. L’identifiant désigne le dossier dans l’offre ; l’adresse confirme l’identité figée après normalisation. Les colonnes supplémentaires sont ignorées : importer une décision ne modifie pas les extractions ni les réponses candidat.

[[FIG:CAP-13]]

*Figure — Aperçu des propositions CSV regroupées par candidature avant confirmation.*

Le parseur prend en charge les cellules citées et les retours à la ligne internes. L’aperçu distingue les erreurs de structure et les erreurs de contenu, puis résout les identités dans le périmètre de l’offre. Il ne modifie aucune décision.

L’interface regroupe les propositions valides par candidature. Des propositions identiques peuvent être réunies ; des décisions divergentes demandent un choix, et des motifs différents une source explicite. La confirmation finale rafraîchit l’éligibilité avant d’engager l’ensemble sélectionné selon la règle atomique du [[REF:chapter-3]]. Ce parcours remplace un traitement implicite « dernière ligne gagnante » par une synthèse inspectable.

## 4.7. Topologie locale

La réalisation est utilisée dans un environnement local où l’interface Vite et l’API sont deux processus distincts. Le fichier Compose décrit PostgreSQL 17, Redis 7 et un service Mailpit disponible pour le SMTP local. Les services d’infrastructure utilisent le réseau hôte et des écoutes locales. Les documents, captures de courrier et caches sont privés et exclus du suivi Git. Un répertoire de runtime distinct du code permet de conserver ces ressources lors d’un changement de version.

[[FIG:RPT-DEPLOY]]

*Figure — Topologie locale : navigateur, interface, API avec runner, bases techniques et ressources documentaires privées.*

Le runner intégré ne nécessite pas de processus worker supplémentaire. Le lecteur PDF s’exécute en enfant de l’API ; l’accès au fournisseur documentaire passe par la passerelle dédiée. Cette topologie décrit l’environnement de réalisation et de démonstration, pas un déploiement de production établi.

Les modes documentaires, leurs données et la différence entre simulation et inférence réelle sont regroupés au [[REF:chapter-5]]. Le fonctionnement métier reste disponible sans assistance active. Les compléments d’exploitation — sauvegardes, rétention et réconciliation du stockage notamment — et la portée des vérifications sont examinés au [[REF:chapter-6]].

## Conclusion

L’apport architectural réside dans l’articulation de ces éléments : les contrats partagés définissent les données acceptées, le serveur applique les droits contextuels, PostgreSQL coordonne les engagements et les adaptateurs isolent les effets extérieurs. L’interface rend ces frontières compréhensibles tout en conservant une confirmation humaine des décisions.
