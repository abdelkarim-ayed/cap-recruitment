# Chapitre 3 — Conception métier et modèle de données

## Introduction

La conception de CAP articule trois besoins : conserver un dossier fidèle au dépôt, organiser les interventions de plusieurs acteurs et enregistrer des décisions cohérentes malgré les accès concurrents. Le modèle retenu est centré sur la candidature, avec des configurations figées, des états explicites et des droits dépendant du contexte. Ce chapitre présente les règles métier et les mécanismes de cohérence qui structurent leur réalisation.

## 3.1. Organisation du modèle métier

### 3.1.1. Offre, candidature et documents

L’offre rassemble une annonce, un formulaire candidat, une configuration documentaire privée et un éventuel plan d’entretien. Le formulaire définit les réponses et pièces attendues. La configuration documentaire associe chaque extracteur à un champ fichier source et à plusieurs questions typées. Le plan décrit des étapes ordonnées, sans imposer de rendez-vous ni d’interviewer avant publication.

La candidature relie un candidat authentifié à une offre. Elle conserve les réponses soumises, l’identité du compte au dépôt et un instantané de la configuration publiée. Le dossier n’est donc pas un profil partagé dont une modification ultérieure remplacerait les pièces de candidatures antérieures. Un candidat ne peut déposer qu’une candidature par offre ; une nouvelle tentative retourne le dossier existant sans le remplacer.

[[FIG:DIA-03]]

*Figure — Modèle conceptuel du dossier de recrutement et de ses principales associations.*

La pièce documentaire et l’objet physique sont séparés. L’association métier indique la candidature et le champ auxquels appartient le document ; les métadonnées de stockage conservent une référence opaque, une taille et une empreinte. Une tâche représente l’exécution d’un extracteur configuré. Ses résultats peuvent ensuite recevoir des corrections humaines par question, selon le mécanisme détaillé au [[REF:chapter-5]].

[[TABLE:ch3-entites-associations]] Entités et contraintes du dossier de recrutement.

| Entité | Association structurante | Contrainte principale |
|---|---|---|
| Offre | Propriétaire RH | Configuration modifiable en brouillon |
| Candidature | Candidat et offre | Un seul dépôt par couple |
| Document | Candidature et champ fichier | Une pièce par champ documentaire |
| Tâche documentaire | Candidature et identifiant de tâche | Résultat rattaché à la configuration figée |
| Correction | Candidature, tâche et question | Intervention humaine attribuée |
| Étape d’entretien | Offre et position | Plan ordonné, figé à publication |
| Entretien | Candidature et étape | Une instance au plus par étape |
| Notification | Destinataire et contexte | Consultation privée |

### 3.1.2. Contraintes relationnelles et données variables

PostgreSQL porte les identités, les rattachements, les états et les contraintes d’unicité. Les formulaires, réponses et résultats variables sont conservés en JSONB et validés par des schémas à l’exécution. Les identifiants stables assurent les associations, tandis que les libellés servent à leur présentation. Une modification de libellé ne change ainsi pas implicitement une clé de résultat ou d’export.

Les contraintes relationnelles complètent les contrôles applicatifs. L’unicité candidat–offre protège le dépôt ; l’unicité candidature–étape protège la création d’entretiens. Des clés étrangères composites vérifient également que l’entretien, la candidature et l’étape relèvent de la même offre. Vérifier séparément l’existence de ces objets ne suffirait pas à garantir ce rattachement.

[[FIG:RPT-ER]]

*Figure — Noyau relationnel des candidatures, documents, tâches et corrections, avec registre des tentatives. Les tables d’entretien ne figurent pas dans cette vue.*

Le schéma impose aussi des cohérences locales : un entretien terminé possède une issue, des notes et une date de remise ; une annulation possède une cause. Le score facultatif est un entier de zéro à dix. Il complète l’appréciation, sans constituer un seuil automatique de sélection. Les conditions impliquant plusieurs objets, telles que la réussite de toutes les étapes avant une proposition, relèvent des politiques applicatives.

## 3.2. Publication et instantanés

### 3.2.1. Gel de la configuration

La publication transforme le brouillon en conditions stables de candidature. Elle exige la confirmation de deux révisions : celle de l’offre et celle du plan d’entretien sauvegardé. Ces compteurs sont distincts, car les deux ensembles peuvent évoluer séparément. La commande vérifie les définitions et le plan enregistré dans une même transaction, sous verrou de l’offre.

[[FIG:RPT-PUBLISH]]

*Figure — Publication de l’offre et contrôle concurrent de la révision du plan d’entretien.*

Un plan vide est une configuration valide. La publication le fige comme un plan non vide, sans créer d’entretien fictif. Le gel est porté par l’état de l’offre : les étapes existantes ne sont pas recopiées ni renumérotées lors de la publication. Les rendez-vous sont ensuite organisés pour chaque candidature, sans réécriture du plan requis.

Fermer l’offre interdit les nouveaux dépôts, mais ne termine pas les candidatures déjà reçues. Les entretiens et décisions restent possibles selon leurs conditions propres. Le traitement documentaire des dossiers existants demeure lui aussi éligible : sa fermeture dépend du dossier, et non du seul état fermé de l’offre.

### 3.2.2. Référence temporelle et dépôt

La date de référence documentaire est fixée à la première publication réussie, à partir de la date UTC de la base. Elle se distingue de la date de création du brouillon et de la date de soumission de chaque candidat. Elle permet d’interpréter les questions temporelles avec une référence commune à toutes les candidatures de l’offre, même si leurs traitements sont exécutés à des moments différents.

Ce choix favorise la comparabilité au sein d’une campagne. Il présente une contrepartie pour une offre longtemps ouverte : la référence reste celle de sa publication, plutôt que le contexte temporel propre à chaque nouveau dépôt. Une prévisualisation de brouillon fondée sur la date courante reste préparatoire et ne remplace pas cette référence.

Au dépôt, le serveur copie la configuration publiée et l’identité issue de la session. Les réponses et pièces originales ne sont plus modifiables par une API de candidature après soumission. La revue agit sur les résultats documentaires, pas sur les déclarations du candidat. L’instantané conserve ainsi le contexte du dossier ; les compteurs de révision détectent les changements, sans constituer un historique intégral de toutes les versions intermédiaires.

## 3.3. États et transitions

### 3.3.1. Dimensions du dossier

Un statut unique ne permettrait pas de distinguer une extraction achevée, une revue humaine terminée et une décision de recrutement. Le modèle sépare donc trois dimensions, avec des interactions contrôlées.

[[TABLE:ch3-dimensions-etats]] Dimensions et états du dossier.

| Dimension | États principaux | Interprétation |
|---|---|---|
| Traitement documentaire | Non demandé, en attente, en cours, terminé, terminé avec erreurs | Avancement technique des extracteurs |
| Revue documentaire | En attente, en cours, terminée | Travail humain sur les résultats |
| Recrutement | Reçue, prête pour revue, présélectionnée, entretien, proposition, embauchée, non retenue | Progression métier de la candidature |

Une tâche individuelle possède quatre états : `pending`, `processing`, `completed` et `failed`. Un échec technique ne produit pas un rejet. Sans extracteur configuré, le traitement est « non demandé » et la revue est administrativement terminée et non requise, sans attribution à un réviseur. La candidature reste reçue.

### 3.3.2. Préparation de la revue et gestion des échecs

L’ouverture de la revue dépend d’une projection calculée : non requise, en attente, bloquée, prête, libérée ou verrouillée. Une fin normale des tâches permet la revue lorsque leurs issues sont résolues. Un échec encore réessayable, opérationnel ou incertain maintient une situation bloquée. Les RH peuvent alors confirmer une libération manuelle : elle arrête définitivement le traitement du dossier et permet de travailler sur les informations disponibles, sans transformer les échecs en réussites.

La revue demeure un contrôle disponible, non un préalable obligatoire à la présélection. Les RH peuvent poursuivre ou rejeter une candidature encore indécise sans attendre l’extraction ni achever la revue. Cette décision ferme toutefois les écritures documentaires. Passer directement à la décision réduit les vérifications disponibles et laisse à l’acteur humain la responsabilité d’examiner les éléments utiles.

La fermeture documentaire résulte du stade de recrutement, de la revue terminée ou d’une libération manuelle. Elle invalide l’éligibilité des écritures tardives sans réécrire les résultats ni les corrections. Une tâche peut donc rester historiquement « en cours » alors que le dossier est désormais verrouillé. Cette barrière protège les données ; elle ne garantit pas l’annulation d’un appel externe déjà parti.

### 3.3.3. Présélection, entretiens et finalisation

La présélection est une décision initiale de poursuite, non une attestation de compétence professionnelle. Elle est partagée entre les RH. La première décision validée en transaction est conservée ; une proposition concurrente devenue périmée est refusée. Ce mécanisme résout un conflit d’écriture, sans arbitrer la qualité des appréciations. La répartition du travail et la discussion des critères restent organisationnelles.

[[FIG:DIA-06]]

*Figure — Progression du recrutement, issues d’entretien et décisions finales.*

L’interviewer affecté peut remettre son appréciation une fois le début de l’entretien atteint. Un avis favorable termine l’entretien sans produire automatiquement une proposition. Selon la règle métier retenue, un avis final défavorable (`Fail`) est éliminatoire : sa remise place la candidature à « non retenue » et annule les autres entretiens encore planifiés, même si leur début est déjà passé. Les évaluations déjà remises restent conservées. Il s’agit d’une décision humaine déclenchant une transition prévue, et non d’un rejet automatique fondé sur l’extraction.

Le rejet RH direct est également contextuel : il est partagé jusqu’à la présélection incluse, puis réservé au propriétaire lorsque les entretiens ont commencé. Après la décision initiale, il exige un motif et annule les entretiens encore planifiés. Cette autorité se distingue du pouvoir de l’interviewer de remettre un avis éliminatoire.

La proposition (`Offer`) et l’embauche (`Hired`) appartiennent au propriétaire de l’offre. Sans étape configurée, la proposition exige une candidature présélectionnée. Avec un plan non vide, elle exige le stade entretien et la réussite de toutes les étapes configurées : une instance absente, annulée, prévue ou échouée ne satisfait pas la condition. L’embauche est une action séparée, possible seulement après une proposition.

## 3.4. Rôles et autorisations contextuelles

L’identité et le rôle proviennent de la session serveur. L’autorisation combine ensuite rôle admissible, relation à la ressource et état courant. La propriété d’une offre n’est pas un rôle supplémentaire : elle relie un compte RH à une offre précise. Le [[REF:chapter-2]] présente les responsabilités des acteurs ; le [[REF:ch3-autorisations-contextuelles]] précise leur traduction dans le modèle.

[[TABLE:ch3-autorisations-contextuelles]] Conditions contextuelles des principales actions.

| Action | Condition contextuelle essentielle |
|---|---|
| Modifier, publier ou fermer une offre | Être le propriétaire, avec un état compatible |
| Consulter une candidature | Accès RH partagé, candidature propre ou affectation d’entretien admissible |
| Corriger un résultat | Revue ouverte, prête ou libérée |
| Présélectionner | Candidature encore indécise |
| Remettre un avis | Être l’interviewer affecté, entretien planifié, début atteint et dossier actif |
| Enregistrer proposition ou embauche | Être propriétaire et satisfaire les prérequis métier |

Le rôle administrateur ne donne pas de dérogation pour finaliser l’offre d’un autre propriétaire. Le modèle ne prévoit pas de réattribution du propriétaire ; une délégation ou un transfert constituerait une extension pour la continuité d’activité. En revanche, les RH non propriétaires peuvent lire et examiner les candidatures.

La confidentialité s’applique aussi au contenu des réponses. L’offre publique expose l’annonce et le formulaire, mais pas la configuration documentaire privée ni le propriétaire. Le candidat reçoit ses réponses et ses pièces, sans résultats d’extraction, corrections ou motifs RH. L’interviewer accède au dossier dans le contexte de son affectation, sans recevoir les autres évaluations par cette vue. Le téléchargement recontrôle l’accès et le rattachement du document ; un lien dans un CSV reste authentifié.

Les métadonnées de disponibilité d’action transmises à l’interface facilitent la présentation des commandes et de leurs prérequis. Elles ne remplacent pas le contrôle serveur : l’état peut changer entre l’affichage et la confirmation. Chaque mutation recharge les faits nécessaires.

## 3.5. Transactions et gestion de concurrence

### 3.5.1. Verrous et révisions

Les transactions regroupent les écritures liées. Le client PostgreSQL fourni par `DatabaseService` est conservé jusqu’à la validation ou à l’annulation. Les services verrouillent les ressources disputées : offre pour la publication et le plan, puis offre, candidature et entretien pour les commandes d’entretien. Un verrou consultatif par interviewer sérialise la vérification des chevauchements de rendez-vous.

Au dépôt, un verrou consultatif candidat–offre sérialise les tentatives concurrentes. Un verrou partagé sur l’offre coordonne ensuite le contrôle d’ouverture avec sa fermeture. La contrainte d’unicité demeure la protection relationnelle contre un doublon.

Les verrous et révisions sont complémentaires. Le verrou ordonne les commandes ; le compteur détecte qu’une confirmation repose sur une lecture ancienne. Si un plan est modifié avant une publication en attente, sa nouvelle révision invalide cette confirmation. Si la publication obtient le verrou en premier, l’état publié interdit ensuite la modification du plan. Le [[REF:chapter-4]] illustre la réalisation de ce protocole.

Les révisions de l’offre, du plan, du recrutement, de la revue et de chaque entretien ont des responsabilités distinctes. Une correction documentaire ne rend pas, à elle seule, une confirmation de présélection périmée. En revanche, une présélection ferme la revue par une règle métier explicite. Pour deux corrections concurrentes, la seconde écriture utilisant l’ancienne révision reçoit un conflit ; son auteur doit rafraîchir puis réappliquer explicitement sa proposition.

### 3.5.2. Atomicité et effets associés

La décision initiale, individuelle ou importée, emploie une opération commune. Elle enregistre le stade, l’auteur, la date et l’éventuel motif interne, incrémente la révision du recrutement, ferme le traitement et crée la notification candidat dans la même transaction. Le motif interne n’est pas repris dans cette notification.

L’import CSV valide l’ensemble des propositions incluses sous verrous ordonnés avant toute écriture. Une ligne devenue incompatible provoque le refus de l’ensemble de cette confirmation. De même, l’avis éliminatoire, la fin de candidature, les annulations associées et les notifications prévues sont engagés ensemble. Les effets sont définis par la cause métier, sans déduire automatiquement des courriels de toute modification de ligne.

Une commande identique peut conserver la révision et l’attribution lorsqu’elle ne change aucune donnée, mais les contrôles d’autorité et d’obsolescence restent applicables. La répétition d’une publication ou fermeture déjà atteinte suit une règle propre d’idempotence ; une confirmation de proposition ou d’embauche périmée reste un conflit. La cohérence repose ainsi sur des intentions métier définies, plutôt que sur la seule méthode HTTP utilisée.

## Conclusion

Ce modèle donne à chaque information une place précise : déclaration figée du candidat, information documentaire corrigible et décision humaine attribuée. L’architecture du chapitre suivant traduit ces distinctions dans les modules, la persistance et les parcours de l’interface.
