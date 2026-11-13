# Chapitre 3 — Conception métier, données et garanties

Une plateforme de recrutement ne se résume pas à une succession de formulaires. Elle conserve des déclarations, organise une activité collective et porte des décisions dont les auteurs n’ont pas la même autorité. Une erreur de conception peut ainsi prendre plusieurs formes : modifier après coup les conditions d’une candidature, exposer une appréciation interne au candidat, écraser une correction concurrente ou présenter une extraction comme une décision. La conception retenue cherche à empêcher ces confusions par des objets distincts, des transitions explicites et des frontières d’écriture identifiables.

Ce chapitre présente le modèle métier effectivement traduit dans les contrats et le schéma PostgreSQL. Il explique les invariants avant leurs détails de réalisation. Les références internes désignent des sources consultables dans le dépôt ; leur correspondance est réunie dans `presentation/report/references-architecture.md`. La présence d’un contrôle dans le code constitue une preuve de réalisation, non une validation exhaustive de son comportement sous toutes les courses possibles. L’état des vérifications est traité séparément au chapitre consacré à l’évaluation [REF-ARCH-STATUS].

## 3.1. Frontière du système et responsabilités des acteurs

### 3.1.1. Un parcours de recrutement, avec assistance facultative

Le système prend en charge la préparation d’une offre, son ouverture aux candidatures, la conservation des dossiers, la présélection, les entretiens éventuellement configurés et l’enregistrement explicite des issues. Il ne prétend pas gérer la paie, l’administration complète du personnel ou une place de marché multi-entreprises. Dans ce périmètre, la candidature est l’unité de travail : elle relie une personne authentifiée à une offre donnée et conserve les informations reçues à cette occasion. Elle n’est pas un profil réutilisable dont les pièces changeraient rétroactivement [REF-ARCH-APPLICATION].

Deux parcours doivent rester possibles. Dans le premier, l’offre ne prévoit aucune extraction : le candidat dépose ses réponses et ses pièces, puis les RH examinent directement le dossier. Dans le second, une définition privée ajoute des questions documentaires sur un fichier. L’exécution enrichit alors le dossier avec des résultats consultables et corrigeables, mais ne change pas l’autorité de décision. Le dépôt n’attend pas l’extraction ; la présélection n’exige pas son achèvement. Cette indépendance évite de rendre tout recrutement indisponible parce qu’un outil d’assistance ne fonctionne pas [REF-ARCH-PROCESSING].

### 3.1.2. Une coordination partagée, sans responsabilité indistincte

Le candidat dépose depuis un compte vérifié et consulte ses propres candidatures. Les acteurs RH, correspondant aux rôles techniques `admin` et `recruiter`, partagent la lecture des dossiers, la revue et les décisions initiales. Le propriétaire d’une offre demeure seul autorisé à modifier son brouillon, à la publier, à fermer ses dépôts et à enregistrer les décisions finales qui lui sont réservées. Le propriétaire n’est pas un rôle supplémentaire : c’est une relation entre un compte RH et une ressource [REF-ARCH-ACTIONS].

L’interviewer agit dans un autre contexte. Son affectation lui donne accès à certains entretiens et, sous conditions, au dossier associé. Elle ne l’intègre pas au collectif RH pour toutes les candidatures. Même lorsqu’un recruteur conduit un entretien, la remise de l’évaluation suit la règle d’affectation. Cette distinction écarte un raccourci fréquent : disposer d’un rôle général ne signifie pas pouvoir effectuer toute action sur toute ressource [REF-ARCH-INTERVIEW].

Le système ne matérialise pas de réservation exclusive de revue RH, de vote collectif ni de débat d’évaluation. La coordination minimale repose sur un état partagé et sur la détection des écritures périmées. Plusieurs personnes peuvent inspecter le même dossier ; aucune ne gagne la décision simplement parce qu’elle l’a ouvert en premier. Dans la présélection, la première décision effectivement validée en transaction l’emporte. La conception privilégie ainsi une responsabilité explicite au moment de l’engagement plutôt qu’une attribution implicite au moment de la consultation [REF-ARCH-SCREENING].

## 3.2. Modèle métier et contraintes de données

### 3.2.1. Les objets qui structurent le dossier

L’offre rassemble des informations publiques, un formulaire et une définition de traitement privée. Le formulaire décrit les champs reçus, avec leurs identifiants, types et contraintes. La définition de traitement configure des extracteurs dont chacun référence un champ documentaire source. Le plan d’entretien est associé à l’offre, mais suit un compteur de modification distinct. La candidature conserve ensuite une identité figée, les réponses, la configuration reçue et des liens vers les pièces [REF-ARCH-VACANCY ; REF-ARCH-MIGRATIONS].

[[FIG:DIA-03]]

*Figure — Modèle conceptuel sélectionné : offre, candidature, document, traitement, correction et entretien. Montrer les responsabilités et cardinalités utiles ; ne pas confondre cette vue métier avec l’ensemble des tables physiques.*

Le document métier est séparé de l’objet stocké. `application_documents` indique à quelle candidature et à quel champ une pièce appartient ; `stored_files` conserve la référence interne, la taille et l’empreinte des octets. Le nom fourni par le candidat n’est donc pas une adresse de stockage. Une tâche documentaire est identifiée par le couple candidature–tâche. Les corrections actuelles ajoutent l’identifiant de question : plusieurs réponses d’un même extracteur peuvent être rectifiées indépendamment, sans remplacer le résultat original du lot [REF-ARCH-MIGRATIONS, migrations 002, 003 et 010].

| Objet | Identité ou association structurante | Règle portée |
|---|---|---|
| Offre | Identifiant et propriétaire | Cycle brouillon, publiée, fermée |
| Candidature | Candidat et offre | Un seul dépôt par couple |
| Document métier | Candidature et champ source | Une pièce par champ documentaire |
| Tâche | Candidature et identifiant stable | Résultat d’un extracteur configuré |
| Correction de champ | Candidature, tâche et question | Valeur humaine indépendante |
| Étape d’entretien | Offre et position | Plan ordonné, figé à publication |
| Entretien | Candidature et étape | Une instance au plus pour cette étape |
| Notification | Destinataire et contexte | Lecture privée et effet explicite |

### 3.2.2. Des contraintes relationnelles plutôt que des conventions seules

Les contraintes SQL complètent la validation applicative. L’unicité candidat–offre protège le dépôt contre deux requêtes concurrentes. L’unicité candidature–étape interdit de créer plusieurs instances d’un même entretien. Les clés étrangères composites des entretiens vérifient que la candidature et l’étape appartiennent bien à la même offre. Sans elles, vérifier séparément l’existence de deux UUID ne suffirait pas : des ressources valides mais étrangères pourraient être combinées [REF-ARCH-MIGRATIONS, migration 006].

Le schéma contraint également les états et quelques cohérences locales. Un entretien terminé doit posséder une issue, des notes et une date de soumission. Un entretien annulé doit porter une cause d’annulation. Le score éventuel est un entier de zéro à dix ; il demeure une information affichée, non un seuil automatique d’embauche. La base peut imposer ces propriétés d’une ligne, tandis que la politique applicative vérifie des conditions plus larges, comme l’affectation courante ou l’achèvement de toutes les étapes du plan [REF-ARCH-INTERVIEW].

[[FIG:RPT-ER]]

*Figure — Modèle relationnel resserré. Faire apparaître les unicités, les deux clés étrangères composites des entretiens et la clé candidature–tâche–question des corrections ; isoler le registre technique des tentatives du dossier métier.*

Cette dernière séparation est importante. `cv_request_attempts` conserve la connaissance d’un envoi documentaire et possède ses propres états techniques. Il ne constitue ni une étape de recrutement ni un historique de candidature. Sa clé est le mode et l’empreinte de requête ; sa conservation répond à la maîtrise des répétitions d’envoi, y compris lorsque des données de démonstration sont recréées. Le modèle évite donc d’assimiler toutes les tables à des entités métier modifiables par les utilisateurs [REF-ARCH-MIGRATIONS, migration 009 ; REF-ARCH-PROCESSING].

### 3.2.3. Une variabilité encadrée

Les réponses, définitions et résultats variables sont stockés en JSONB, mais ils ne sont pas laissés sans contrat. Leurs formes sont validées à l’exécution par des schémas partagés. Les identifiants stables servent aux associations ; les libellés servent à la lecture. Renommer une question ne doit pas renommer implicitement sa clé d’export. Cette discipline rend possible l’évolution des interfaces sans déplacer silencieusement le sens des données déjà déposées [REF-ARCH-DOMAIN].

## 3.3. Publication, instantanés et stabilité temporelle

### 3.3.1. Publier signifie figer une configuration cohérente

La publication n’est pas un simple changement d’étiquette. Elle transforme un brouillon modifiable en conditions de candidature stables. Le propriétaire doit confirmer la révision courante de l’offre et celle du plan d’entretien sauvegardé. Les deux compteurs sont nécessaires parce que le formulaire et le plan ne se modifient pas dans le même écran ni au même rythme. Une seule révision imposerait des conflits sans rapport avec l’intention ; ignorer la révision du plan permettrait au contraire de publier sans confirmer sa dernière version [REF-ARCH-VACANCY].

La transaction verrouille la ligne de l’offre, vérifie le propriétaire et les compteurs attendus, valide les définitions puis lit le plan enregistré avec le même client transactionnel. Elle contrôle son ordre et son contenu avant la mise à jour. Le plan peut être vide : l’absence d’entretien est une configuration valable, pas une omission à réparer automatiquement. Publier le fige tout autant qu’un plan non vide. Aucun rendez-vous ni interviewer n’est requis à cette étape [REF-ARCH-SRC-PUBLICATION].

[[FIG:RPT-PUBLISH]]

*Figure — Séquence de publication et concurrence avec l’enregistrement du plan. Montrer le verrou commun sur l’offre, la lecture transactionnelle des deux révisions, la validation du plan sauvegardé et le gel d’un plan vide ou non vide.*

Le gel est porté par l’état publié, non par la création d’une nouvelle copie des étapes au moment de publier. Leurs identifiants et leur révision restent inchangés. Les rendez-vous pourront ensuite être planifiés et réorganisés selon leurs propres règles, mais la liste des étapes exigées ne sera plus réécrite. Fermer l’offre arrête les nouveaux dépôts ; cela ne dégèle pas cette configuration et n’annule pas les recrutements existants [REF-ARCH-INTERVIEW].

### 3.3.2. Fixer le sens d’une question relative au temps

Certaines questions documentaires dépendent d’une date, par exemple lorsqu’elles concernent l’achèvement attendu d’une formation. Les recalculer selon le jour d’exécution produirait une variabilité injustifiée : deux candidatures à la même offre pourraient être interprétées différemment parce qu’un traitement a été retardé. Le système enregistre donc `extraction_reference_date` à la première publication réussie, selon la date UTC de la base, puis la copie dans l’instantané de candidature [REF-ARCH-PROCESSING].

Cette date ne bouge pas lors d’un échec de publication, d’une demande sans changement, d’une fermeture ou d’une reprise du traitement. Le brouillon peut afficher une prévisualisation provisoire fondée sur la date courante, mais ce calcul préparatoire n’est pas la référence de production. Le mécanisme est porté par la mise à jour verrouillée de `VacancyRepository.save`, dont l’expression SQL ne renseigne la date que lors du passage initial de brouillon à publiée [REF-ARCH-SRC-PUBLICATION].

### 3.3.3. Le dépôt comme instantané immuable

Au dépôt, la candidature copie l’identité issue de la session et la définition publiée de l’offre. Les réponses restent associées aux identifiants du formulaire reçu. Les pièces originales sont conservées séparément, sans devenir des champs éditables de revue. Il n’existe pas d’API de modification des réponses ou fichiers après soumission. La correction humaine concerne les résultats d’extraction, jamais la déclaration initiale du candidat [REF-ARCH-APPLICATION].

L’instantané stabilise le contexte de lecture, mais ne constitue pas un système complet de versions. Les compteurs enregistrent des changements et détectent l’obsolescence ; ils ne permettent pas de reconstruire tous les états intermédiaires. De même, la conservation d’un auteur et d’une date de correction ne fournit pas un journal intégral de toutes les valeurs antérieures. La conception assume cette distinction : elle conserve les références nécessaires au dossier sans revendiquer une architecture de journalisation événementielle [REF-ARCH-ARCHITECTURE ; REF-ARCH-PROCESSING].

## 3.4. Trois dimensions indépendantes : traitement, revue et recrutement

### 3.4.1. Pourquoi un statut unique ne suffit pas

Un statut global tel que « dossier terminé » serait ambigu. Il pourrait désigner la fin d’une extraction, celle d’une revue documentaire ou une décision de recrutement. Le modèle distingue donc l’exécution technique, le travail humain sur ses résultats et l’avancement du recrutement. Ces dimensions répondent à trois questions différentes : que s’est-il passé techniquement, que les RH ont-ils vérifié et quelle décision a été enregistrée ? Leur séparation empêche qu’une panne technique prenne la signification d’un rejet [REF-ARCH-APPLICATION ; REF-ARCH-PROCESSING].

| Dimension | Valeurs stockées ou projetées | Signification |
|---|---|---|
| Traitement agrégé | `not_requested`, `pending`, `processing`, `completed`, `completed_with_errors` | Exécution des tâches du dossier |
| Tâche individuelle | `pending`, `processing`, `completed`, `failed` | Résultat d’un extracteur |
| Revue | `pending`, `in_review`, `completed` | Travail humain documentaire |
| Recrutement | `received`, `review_ready`, `preselected`, `interview`, `offer`, `hired`, `not_selected` | Progression et issue du dossier |
| Préparation de revue | `not_required`, `waiting`, `blocked`, `ready`, `released`, `locked` | Projection d’éligibilité à l’édition |

Les quatre états d’`application_tasks` doivent être conservés tels quels. La clôture du traitement et la libération manuelle ne créent pas d’états de tâche `cancelled` ou `manual_release`. Ce sont des barrières d’éligibilité, qui laissent visibles les faits d’exécution antérieurs. Un dossier peut donc conserver une tâche historiquement en cours tout en n’autorisant plus aucune écriture de résultat [REF-ARCH-MIGRATIONS ; REF-ARCH-SRC-CLOSURE].

### 3.4.2. Préparer une revue sans fabriquer un succès

La préparation de revue est calculée à partir de l’ensemble des tâches et des barrières du dossier. La fin normale suppose des succès ou des échecs ordinaires terminaux, sans invocation encore active. Les défaillances opérationnelles, les envois incertains ou les cas non classés ne deviennent pas automatiquement des dossiers prêts. La projection `blocked` indique précisément que l’automatisme n’a pas produit une situation suffisamment résolue pour ouvrir la voie normale [REF-ARCH-PROCESSING].

Les RH peuvent alors confirmer une libération manuelle. Cette opération ferme définitivement le traitement, conserve son attribution et ouvre la revue humaine sans réécrire les résultats. Elle ne signifie ni « extraction réussie », ni « revue terminée », ni « candidat approuvé ». Une valeur absente reste indisponible tant qu’un humain ne la renseigne pas explicitement. La finalité du mécanisme est de débloquer un travail humain, pas d’améliorer artificiellement les indicateurs techniques [REF-ARCH-PROCESSING, sections « Readiness, release and UI fences »].

Le cas sans tâche illustre la même rigueur. Le traitement commence à `not_requested` et la revue à `completed`, avec `required=false`. Il s’agit d’un état administratif non applicable, sans auteur de revue inventé. Le recrutement demeure à `received`. Aucun contrôle documentaire n’a été accompli, et aucune appréciation favorable ne doit être déduite de cette complétion automatique [REF-ARCH-APPLICATION].

### 3.4.3. Une décision peut fermer le travail sans en réécrire l’histoire

La présélection et le rejet initial restent autorisés indépendamment de la préparation documentaire. Lorsqu’ils sont engagés, ils invalident le jeton et le bail de traitement et rendent la revue non modifiable. Ils ne convertissent pas les échecs en succès, ne complètent pas artificiellement la revue et ne suppriment pas les corrections déjà enregistrées. La fin de revue possède également sa propre barrière, même lorsqu’aucune décision de recrutement n’est encore prise [REF-ARCH-SCREENING].

Cette fermeture protège contre les résultats tardifs. Un appel externe déjà admis peut toutefois continuer et occasionner un coût ; la clôture logique ne constitue pas une annulation de facturation. Le contrat distingue ainsi le droit d’écrire dans le dossier et la réalité d’une exécution extérieure. Les détails du bail, du registre d’envoi et des reprises locales sont développés dans le chapitre documentaire, sans être assimilés à des transitions de recrutement [REF-ARCH-PROCESSING].

## 3.5. Autorité contextuelle et projections privées

### 3.5.1. Combiner rôle, relation et état courant

L’autorisation repose sur plusieurs niveaux complémentaires. La session fournit une identité et un rôle de confiance. Une carte commune indique les rôles admissibles pour chaque action. Les politiques métier examinent ensuite les ressources courantes : propriétaire de l’offre, candidat concerné, interviewer affecté et état compatible. Enfin, les révisions, les données soumises et les contraintes d’horaire sont vérifiées séparément. Un acteur admissible peut donc recevoir un conflit sans que son rôle ait changé [REF-ARCH-ACTIONS].

| Intention | Acteur admissible | Condition contextuelle déterminante |
|---|---|---|
| Modifier ou publier une offre | RH | Être propriétaire ; état compatible |
| Lire une candidature | RH ou candidat | Accès RH partagé, ou candidature propre |
| Corriger l’extraction | RH | Revue ouverte et prête ou libérée |
| Présélectionner | RH | Candidature encore indécise |
| Planifier un entretien | RH | Étape et recrutement compatibles |
| Remettre un avis | Interviewer affecté | Entretien prévu, début atteint, dossier actif |
| Enregistrer Offer ou Hired | RH propriétaire | Prérequis propres à chaque décision |
| Lire un document par entretien | Interviewer affecté | Affectation courante donnant encore accès |

Un administrateur ne possède pas d’exception permettant de finaliser l’offre d’un autre propriétaire. Inversement, les RH non propriétaires peuvent lire et examiner les candidatures. Ce compromis associe coopération opérationnelle et responsabilité finale, sans transformer la propriété de l’offre en restriction générale de visibilité [REF-ARCH-INTERVIEW].

### 3.5.2. Répondre avec une vue autorisée, pas avec une entité complète

La confidentialité ne se limite pas au refus d’une route. Une lecture autorisée doit encore limiter ses champs. La projection publique d’une offre contient le texte de l’annonce et le formulaire candidat, mais pas les définitions de traitement ni l’identité du propriétaire. Le candidat consulte son instantané et ses pièces, sans résultats documentaires, corrections, raisons RH ni préparation de revue. Les résumés de candidature utilisent une liste explicite de statuts publics : les états internes inconnus reviennent à « candidature reçue », plutôt que d’être transmis tels quels [REF-ARCH-VACANCY ; REF-ARCH-APPLICATION].

L’interviewer utilise des routes dédiées. Il ne reçoit pas les autres évaluations, ni les paramètres d’extraction. Une affectation annulée seule ne donne plus accès aux pièces du candidat ; une réaffectation retire l’accès de l’ancien responsable. La notification historique peut rester visible sous une forme adaptée, sans maintenir un lien désormais révoqué. Le droit de connaître qu’une affectation a changé et le droit de télécharger une pièce sont donc traités séparément [REF-ARCH-INTERVIEW].

Les téléchargements recontrôlent le contexte et le rattachement du document à la candidature. Les réponses privées emploient des directives de cache adaptées ; les fichiers n’ont pas d’URL publique de stockage. Un lien exporté dans un CSV reste une route authentifiée : posséder le fichier CSV n’accorde pas le téléchargement. La frontière de confiance est le serveur, jamais l’absence d’un bouton dans l’interface [REF-ARCH-SCREENING ; REF-ARCH-SRC-INTAKE].

### 3.5.3. Une disponibilité d’action demeure consultative

Les vues RH exposent des métadonnées `{allowed, visible, reason}` pour présenter des commandes cohérentes. Elles évitent de dupliquer toute la politique dans React et permettent d’expliquer un prérequis utile. Elles restent un instantané : entre la lecture et le clic, une autre personne peut décider, réaffecter ou modifier une ressource. Chaque mutation recharge donc son contexte et applique ses contrôles transactionnels. La disponibilité facilite l’interaction ; elle ne devient ni une permission persistante ni une promesse de succès [REF-ARCH-ACTIONS].

## 3.6. Cohérence transactionnelle, révisions et conflits

### 3.6.1. Sérialiser les ressources réellement disputées

Les transactions regroupent les écritures qui doivent devenir visibles ensemble. `DatabaseService` fournit un client commun entre `BEGIN` et `COMMIT`, avec tentative de rollback en cas d’échec. Les services métier choisissent les lignes à verrouiller ; l’aide transactionnelle ne devine pas les invariants. Pour les entretiens, l’ordre documenté commence par l’offre, poursuit avec la candidature puis l’instance. Les verrous consultatifs d’interviewer protègent en outre la vérification des chevauchements horaires [REF-ARCH-SRC-TRANSACTION ; REF-ARCH-INTERVIEW].

Le dépôt utilise un verrou consultatif candidat–offre avant de rechercher une soumission existante. Il verrouille ensuite l’offre en partage avant de vérifier qu’un nouveau dépôt est encore autorisé. Une fermeture concurrente et une soumission ne doivent ainsi pas décider toutes deux depuis un état périmé. Si une candidature existe déjà, le serveur la retourne sans remplacement, même lorsque l’offre est désormais fermée. La contrainte d’unicité demeure le dernier rempart relationnel [REF-ARCH-SRC-INTAKE].

Un autre scénario éclaire le rôle du verrou commun de publication. Le propriétaire a ouvert la confirmation pour une offre et un plan aux révisions données ; dans un autre onglet, il enregistre une modification réelle du plan. Si cet enregistrement obtient le verrou en premier, il augmente la révision du plan. La confirmation ancienne peut ensuite lire un état cohérent, mais son compteur attendu ne correspond plus : la publication est refusée. Si la publication obtient le verrou en premier, elle fige le plan courant ; l’enregistrement tardif est refusé parce que l’offre n’est plus un brouillon. Aucun des deux ordres ne doit produire une offre publiée avec une configuration modifiée après la confirmation [REF-ARCH-VACANCY].

Ce scénario décrit une conséquence attendue du protocole, non une course nouvellement exécutée pour le rapport. Il montre aussi pourquoi un verrou seul serait insuffisant : il ordonne les commandes, mais la révision détecte que l’intention reposait sur une lecture ancienne. Réciproquement, comparer un compteur sans garder le verrou jusqu’à la mise à jour laisserait une fenêtre entre le contrôle et l’écriture. Les deux mécanismes répondent donc à des problèmes complémentaires [REF-ARCH-PG-LOCKS].

### 3.6.2. Détecter l’obsolescence sans fusionner les intentions

Quatre compteurs ont des responsabilités différentes : révision de l’offre, révision du plan, révision du flux de recrutement et révision de revue. L’entretien possède également son compteur propre. Une correction documentaire ne doit pas rendre périmée une confirmation de présélection uniquement parce qu’elles partagent le même dossier ; une décision de recrutement peut néanmoins fermer l’édition documentaire par une règle explicite. Les compteurs séparés réduisent les conflits artificiels sans supprimer les barrières métier communes [REF-ARCH-ACTIONS ; REF-ARCH-PROCESSING].

Considérons deux RH ayant lu la même révision de revue. Le premier enregistre une correction ; le compteur augmente. La proposition du second, même relative à un autre champ, reçoit un conflit si elle utilise l’ancien compteur. Le système ne fusionne pas silencieusement leurs intentions. Le second doit rafraîchir l’état, comparer sa proposition conservée et la réappliquer explicitement si elle reste pertinente. Ce choix est plus exigeant qu’une fusion automatique, mais rend visible le risque d’écrasement et évite d’inventer une règle de résolution implicite [REF-ARCH-PROCESSING].

### 3.6.3. Définir précisément une opération sans changement

Une commande identique ne doit pas provoquer de bruit artificiel. Pour un brouillon courant, une modification normalisée sans différence retourne le même enregistrement, sans nouvelle date ni révision. Le plan identique conserve ses étapes et leurs identifiants. La revue identique conserve l’attribution des corrections. Les contrôles d’autorité, d’état et de révision interviennent toutefois avant la comparaison : un PATCH identique mais périmé reste un conflit, et un acteur interdit n’obtient pas une réussite au prétexte qu’il ne changerait rien [REF-ARCH-VACANCY ; REF-ARCH-INTERVIEW ; REF-ARCH-PROCESSING].

La revue distingue également trois intentions : ne pas mentionner un champ, enregistrer `null` comme inconnu revu et retirer une correction. L’absence préserve la valeur existante ; `null` conserve une intervention humaine explicite ; le retrait redonne priorité au résultat original disponible. Confondre ces opérations effacerait soit une décision de revue, soit la possibilité de revenir à la machine. Tout l’ensemble proposé est validé avant une écriture, y compris lorsque certaines suppressions seraient sans effet [REF-ARCH-PROCESSING].

Certaines transitions possèdent une idempotence différente : une publication ou fermeture déjà atteinte, demandée par le propriétaire, retourne l’état courant selon le contrat, même avec une ancienne révision. Cela n’autorise pas à répéter indistinctement toutes les commandes. Les confirmations Offer/Hired périmées ou dupliquées restent des conflits. L’idempotence est donc définie par intention métier, non supposée à partir de la méthode HTTP [REF-ARCH-VACANCY ; REF-ARCH-INTERVIEW].

## 3.7. Décisions humaines et effets associés

### 3.7.1. Présélection : un engagement atomique

La décision initiale utilise une opération commune, qu’elle provienne d’un dialogue individuel ou d’un import CSV. `commitScreening` reçoit le client transactionnel du demandeur ; elle ne crée pas son propre commit. Elle modifie le stade, incrémente `flow_revision`, enregistre auteur, date et motif éventuel, ferme les possibilités d’écriture documentaire et insère la notification candidat. Une panne de persistance de cet effet annule la transaction, plutôt que de laisser une décision sans sa notice prévue [REF-ARCH-SRC-SCREENING].

Le rejet initial accepte un motif interne facultatif. Celui-ci n’est pas recopié dans la notification, qui annonce seulement une issue générique en nommant l’offre. Après la présélection, les possibilités de rejet et leurs effets suivent les règles du recrutement : le motif devient obligatoire et les entretiens inachevés concernés sont annulés. Un même mot visible, « rejet », recouvre donc des commandes dont le contexte et les effets doivent rester distingués [REF-ARCH-SCREENING ; REF-ARCH-INTERVIEW].

### 3.7.2. Entretiens et finalisation explicite

[[FIG:DIA-06]]

*Figure — Progression du recrutement et autorités. Distinguer présélection, avis Pass/Fail, Offer et Hired ; représenter le chemin sans entretien sans créer de rendez-vous fictif.*

Un avis Pass termine l’entretien évalué, mais ne produit pas automatiquement une proposition. Un avis Fail final place la candidature à `not_selected` et annule tous les autres entretiens non terminés, y compris ceux dont le début est déjà atteint. Les évaluations soumises ne sont pas rouvertes. Ces règles évitent de maintenir un agenda actif après une issue incompatible et empêchent de reconstruire un parcours favorable en remplaçant discrètement un entretien annulé [REF-ARCH-INTERVIEW].

L’enregistrement d’Offer appartient au propriétaire. Avec un plan vide, il exige une candidature présélectionnée. Avec un plan non vide, il exige le stade entretien et la réussite de chaque étape configurée. Une instance absente, prévue, annulée ou échouée ne satisfait pas cette condition. Le décompte porte sur tout le plan, pas uniquement sur les entretiens déjà réalisés. L’embauche reste une décision séparée, autorisée seulement depuis Offer ; aucune extraction, note ou présélection ne la déclenche automatiquement [REF-ARCH-INTERVIEW].

### 3.7.3. Des effets causés, pas déduits des lignes modifiées

Les effets internes d’entretien sont décrits par des causes typées : planification, réaffectation, demande de réorganisation, avis remis ou fin de candidature. Une politique pure reçoit le contexte chargé et produit des intentions de notification. Le service les persiste dans la même transaction que la mutation. Cette organisation distingue l’annulation d’un rendez-vous de l’arrêt d’un dossier, même si les deux opérations modifient certaines colonnes identiques [REF-ARCH-SRC-NOTIFICATIONS].

Les notifications existantes ne constituent pas un dispositif général d’événements. Elles n’impliquent ni courriel automatique, ni intégration calendrier, ni nouvelles annonces candidat pour Offer ou Hired. Le modèle livre une cohérence locale entre décision et effets effectivement prévus, sans inventer des conséquences futures. Sa contribution principale est cette explicitation : une donnée reçue reste une donnée reçue, une assistance reste révisable et une décision reste attribuée à l’acteur qui l’engage.
