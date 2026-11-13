# Chapitre 4 — Architecture et réalisation de la plateforme

Les règles du chapitre précédent imposent plusieurs exigences simultanées : conserver le contexte du dépôt, restreindre les données selon l’acteur, préserver les décisions concurrentes et maintenir le recrutement utilisable sans assistance documentaire. L’architecture doit rendre ces exigences localisables dans le code. Elle doit aussi rester proportionnée à un prototype destiné à un déploiement d’entreprise, sans introduire une infrastructure distribuée dont le besoin ne serait pas établi.

La réalisation repose sur un monolithe modulaire NestJS, une interface React et une base PostgreSQL, réunis dans un espace de travail pnpm. Des ports isolent les interactions avec les fichiers, le courrier et les traitements documentaires. Le résultat n’est pas une application abstraite d’un modèle d’architecture idéale : certaines fonctions utilisent un dépôt SQL dédié, tandis que d’autres services regroupent encore orchestration, requêtes et projections. Ce chapitre explique les frontières réelles, leurs apports et leurs compromis, à partir des contrats et de quelques parcours représentatifs [REF-ARCH-ARCHITECTURE].

## 4.1. Une pile partagée, sans confondre typage et validation

### 4.1.1. Répartition du monorepo

Le dépôt comprend trois unités principales. `apps/web` contient l’interface React et son outillage Vite ; `apps/api` contient l’application NestJS ; `packages/domain` expose les types, vocabulaires et schémas communs. Le fichier `pnpm-workspace.yaml` déclare les espaces de travail et le manifeste racine fixe les versions attendues de l’environnement JavaScript. Cette organisation facilite l’évolution conjointe d’un contrat et de ses consommateurs, sans installer un service réseau entre le navigateur et le domaine [REF-ARCH-SRC-MODULES ; REF-ARCH-PNPM].

| Unité | Responsabilité principale | Ce qu’elle ne doit pas devenir |
|---|---|---|
| `packages/domain` | Formes des données, validation commune, vocabulaire des actions | Une autorité fondée sur les seules données du client |
| `apps/api` | Session, politiques contextuelles, transactions et ressources privées | Un relais aveugle des permissions affichées |
| `apps/web` | Interaction, brouillons, inspection et confirmations | Une frontière de sécurité autonome |
| Infrastructure locale | PostgreSQL, garde Redis et objets privés | Un moteur de recrutement distribué implicite |

Le partage du domaine réduit les divergences entre ce qu’un éditeur produit et ce que le serveur accepte. Il ne supprime pas la nécessité d’une frontière HTTP : le navigateur reste non fiable, même lorsqu’il utilise les mêmes types. Un autre client peut soumettre des champs supplémentaires, un identifiant étranger ou une définition incohérente. Les commandes serveur réanalysent donc les données reçues et résolvent l’identité depuis la session [REF-ARCH-DOMAIN ; REF-ARCH-ACTIONS].

### 4.1.2. TypeScript et Zod : deux fonctions complémentaires

TypeScript vérifie les usages pendant le développement ; ses annotations ne valident pas les octets d’une requête ni le contenu JSON d’une ligne SQL. Zod apporte cette validation à l’exécution, puis permet d’inférer des types cohérents avec les schémas. Les définitions de formulaire contrôlent notamment les types, les identifiants uniques, les références aux champs documentaires et les sorties qui ne doivent pas entrer en collision avec les réponses candidat [REF-ARCH-DOMAIN ; REF-ARCH-TS ; REF-ARCH-ZOD].

Cette combinaison est particulièrement utile pour la définition CV version 2. Une tâche contient plusieurs questions typées, mais reste une seule unité d’exécution. Les réponses structurées doivent correspondre aux identifiants réellement demandés et aux catégories prévues. La validité de la forme ne démontre pas la vérité documentaire ; elle empêche toutefois qu’une réponse incomplète ou mal formée devienne silencieusement un zéro ou une absence de mention. Les décisions humaines sont tenues en dehors de ce contrat d’extraction [REF-ARCH-PROCESSING].

Le paquet commun ne contient pas toutes les politiques transactionnelles. La carte statique des rôles peut être partagée, mais la propriété d’une offre et l’affectation courante d’un entretien sont des faits privés chargés par l’API. Cette répartition évite de transporter de prétendues autorisations durables dans les données de l’interface. Elle laisse aussi un compromis de maintenance : plusieurs modèles dynamiques de liste ou d’éditeur restent moins précisément typés que les vues principales porteuses d’actions [REF-ARCH-ARCHITECTURE].

## 4.2. Un monolithe modulaire aux frontières concrètes

### 4.2.1. Pourquoi conserver un processus applicatif principal

`AppModule` assemble les modules d’identité, de santé locale, d’offres, de candidatures, de traitement, de revue et d’entretiens. NestJS organise leur injection et leur composition ; les modules ne sont pas des services déployés indépendamment. Les décisions impliquant plusieurs tables peuvent ainsi rester dans une transaction PostgreSQL locale. Pour le périmètre actuel, cette propriété apporte une simplicité utile : un rejet, ses annulations et ses notifications n’exigent pas un protocole de cohérence interservices [REF-ARCH-SRC-MODULES ; REF-ARCH-NEST].

[[FIG:DIA-04]]

*Figure — Architecture de responsabilités. Montrer l’interface React, l’API modulaire, PostgreSQL, le stockage documentaire privé et les adaptateurs externes ; représenter le worker actuel et ses caches, sans dessiner une file Redis inexistante.*

Les microservices pourraient devenir pertinents pour des équipes autonomes ou des charges nécessitant une isolation indépendante. Ils ajouteraient ici des communications, une exploitation séparée et une gestion des effets distribués. Aucun benchmark de charge n’établit ce besoin. Le choix du monolithe n’est donc pas une affirmation universelle de supériorité, mais un arbitrage fondé sur les transactions métier et le coût de complexité du périmètre présent [REF-ARCH-ARCHITECTURE].

### 4.2.2. Distinguer contrôleur, politique, service et persistance

Le contrôleur reçoit la requête et porte les métadonnées de route. Le garde de session vérifie l’authentification, l’origine de confiance sur les écritures et l’admissibilité du rôle. Les politiques de fonctionnalité expriment les conditions contextuelles ; le service conserve l’orchestration transactionnelle. Dans le module d’offres, `VacancyRepository` porte les requêtes et les projections. Dans `ApplicationService`, `ReviewService` et `InterviewService`, des requêtes demeurent directement proches des règles [REF-ARCH-ACTIONS ; REF-ARCH-ARCHITECTURE].

Cette structure ne doit pas être décrite comme une architecture hexagonale entièrement uniforme. Les ports externes sont explicites, mais toutes les opérations SQL ne passent pas par une interface de dépôt indépendante. Cette proximité facilite la lecture d’un invariant transactionnel complet, au prix de services plus denses. Une décomposition future doit préserver la propriété du client SQL, l’ordre des verrous et les projections privées ; déplacer des lignes entre fichiers ne suffit pas à améliorer la modularité [REF-ARCH-SRC-TRANSACTION].

Les politiques pures apportent néanmoins une séparation ciblée. Elles décident, par exemple, si le propriétaire et l’état autorisent une mutation, ou quels destinataires doivent recevoir une notification d’entretien. Elles n’ouvrent pas de connexion et ne déclenchent pas d’appel réseau. Le service fournit les faits chargés et persiste les effets retenus. Le même raisonnement peut alors alimenter une disponibilité d’action et son contrôle à l’écriture, sans transformer la politique en moteur générique de workflow [REF-ARCH-SRC-NOTIFICATIONS ; REF-ARCH-ACTIONS].

### 4.2.3. Une frontière asynchrone interne, pas un second produit

L’extraction fonctionne hors de la requête de dépôt. Un signal mémoire est envoyé après commit ; des balayages périodiques retrouvent les travaux éligibles en base. Le runner courant ne chevauche pas deux candidatures dans un même processus ; les baux PostgreSQL coordonnent les claims entre processus. Redis ne porte pas la file de tâches : son rôle est lié aux gardes d’admission et de dépense de la passerelle [REF-ARCH-PROCESSING].

Cette réalisation corrige une description ancienne de la carte d’architecture, qui mentionnait l’absence de poller et de cache persistant. Le contrat de traitement récent et les sources `cv-runner.ts`, `processing-wake.ts` et `cv-file-cache.ts` sont prioritaires sur ces passages. L’architecture actuelle possède bien un worker intégré et des caches privés, mais ni bus d’événements, ni BullMQ, ni moteur de workflow général [REF-ARCH-SRC-EXECUTION ; REF-ARCH-LAUNCH].

## 4.3. Persistance relationnelle, JSONB et fichiers privés

### 4.3.1. Placer chaque contrainte au niveau adapté

PostgreSQL conserve les identités, relations, états, compteurs et associations qui nécessitent des contraintes fortes. JSONB porte les formulaires variables, les instantanés, les réponses, les arguments et les résultats. Une base entièrement relationnelle aurait rendu explicite chaque variante, mais aurait multiplié les tables pour des configurations évolutives. Un modèle exclusivement documentaire aurait déplacé vers le code plusieurs contraintes de rattachement et d’unicité. Le compromis retient les relations structurantes en SQL et la variabilité validée en JSONB [REF-ARCH-MIGRATIONS ; REF-ARCH-PG-JSON].

| Ensemble persistant | Données structurantes | Données variables ou dérivées |
|---|---|---|
| `vacancies` | Propriétaire, état, révisions, référence temporelle | Formulaire et définition de traitement |
| `applications` | Candidat, offre, stade et compteurs | Identité figée, instantané, réponses |
| `stored_files` et `application_documents` | Propriété, référence, taille et empreinte | Nom présenté au lecteur |
| `application_tasks` | Identité, état, tentatives | Arguments, résultat, provenance |
| `extraction_field_corrections` | Candidature, tâche, question et auteur | Valeur typée, éventuellement inconnue |
| `interview_steps` et `interviews` | Plan, affectation, temps et rattachements | Causes structurées, notes |
| Notifications | Destinataire, contexte et lecture | Texte limité à la projection prévue |

JSONB n’apporte pas de schéma métier automatique. Les contraintes SQL vérifient certaines propriétés locales, tandis que les schémas Zod imposent la structure des objets acceptés. Une évolution de version doit donc définir comment lire ou refuser les données antérieures. Pour le passage au CV actuel, les anciens enregistrements ne sont pas convertis en inventant une date de publication : le code retourne un conflit explicite lorsque le contexte requis manque [REF-ARCH-PROCESSING ; REF-ARCH-SRC-PUBLICATION].

### 4.3.2. Des migrations explicites et une transaction maîtrisée

Les migrations applicatives sont identifiées, ordonnées et suivies avec contrôle d’empreinte. Le démarrage normal de l’API ne migre ni ne réinitialise silencieusement le recrutement. Les migrations d’identité restent un préalable distinct. Cette séparation aide à interpréter une installation : démarrer un processus ne démontre pas qu’un schéma attendu a été appliqué, et appliquer un schéma ne démontre pas que le parcours HTTP fonctionne [REF-ARCH-SRC-TRANSACTION ; REF-ARCH-LAUNCH].

`DatabaseService` utilise le pilote PostgreSQL et un pool commun. Son aide transactionnelle obtient un client, commence la transaction, exécute la fonction métier puis valide. En cas d’erreur, elle tente le rollback et conserve l’erreur initiale. Le client est toujours rendu au pool. L’invariant crucial est que les fonctions composées utilisent ce client, et non une requête indépendante du pool qui pourrait voir un autre instant ou s’engager séparément [REF-ARCH-SRC-TRANSACTION].

Les exports demandent une cohérence de lecture supplémentaire : ils utilisent un instantané répétable afin que les lignes, corrections et résultats décrivent un même état de lecture. Les listes regroupent quant à elles filtrage, total et pagination dans une même instruction SQL. Cette technique évite les écarts entre un compteur et une page calculés séparément, sans promettre qu’une consultation reste figée face aux changements ultérieurs [REF-ARCH-SRC-REVIEW ; REF-ARCH-SRC-INTAKE ; REF-ARCH-PG-ISOLATION].

### 4.3.3. L’intégrité des octets ne dépend pas du nom du fichier

`DocumentStorage` expose une référence opaque. L’adaptateur local génère un identifiant, écrit un fichier temporaire en création exclusive, synchronise les octets et le renomme. Les permissions limitent l’accès local ; les lectures refusent les liens symboliques et vérifient qu’il s’agit d’un fichier de taille acceptable. L’application conserve en base la taille et l’empreinte SHA-256, qu’elle recalcule au téléchargement avant de retourner les octets [REF-ARCH-SRC-STORAGE ; REF-ARCH-SRC-INTAKE].

Ce mécanisme contrôle la correspondance avec l’objet déposé, pas son innocuité. L’extension autorisée n’est pas une analyse de contenu et le dépôt ne réalise pas de scan antivirus. Les téléchargements utilisent une pièce jointe générique avec des en-têtes défensifs, sans URL publique inline. La prévisualisation PDF du navigateur réutilise les octets autorisés après contrôle de signature et crée une URL blob locale à la session [REF-ARCH-APPLICATION].

SQL et système de fichiers ne partagent pas un commit atomique. Le service compense donc les objets créés lorsque l’annulation SQL est confirmée. Si l’acquittement du commit est ambigu ou si la base ne permet pas de déterminer l’existence du dossier, il conserve les octets : supprimer pourrait détruire une pièce déjà référencée par une candidature validée. Le compromis privilégie l’intégrité du dossier au risque d’objets privés orphelins. La réconciliation globale, les sauvegardes et les quotas d’exploitation restent des compléments nécessaires [REF-ARCH-APPLICATION ; REF-ARCH-SRC-INTAKE].

## 4.4. Ports externes et frontières de données

### 4.4.1. Un port exprime une capacité, pas toute une technologie

Le port documentaire offre les opérations de stockage nécessaires au métier sans lui imposer un chemin local. Le port de courrier isole l’envoi utilisé notamment par les parcours d’identité. Les adaptateurs présents comprennent des variantes en mémoire, en fichier et SMTP. Un courrier capturé dans un fichier de développement permet d’examiner le parcours local ; il ne prouve ni l’acheminement SMTP ni la réception dans une boîte réelle [REF-ARCH-SRC-STORAGE ; REF-ARCH-SRC-MAIL].

Pour le traitement CV, les interfaces actuelles sont `DocumentMarkdownReader` et `TaskExecutor`. La première reçoit les octets et produit un document analysé ; la seconde reçoit ce document et le contexte d’exécution, puis retourne un résultat et une provenance. Les noms précis comptent : ils décrivent une conversion vers Markdown et une exécution documentaire, non un service indifférencié capable de prendre des décisions RH [REF-ARCH-SRC-EXECUTION].

Le contexte contient les identités de candidature, document et tâche, l’empreinte source, le jeton de traitement, la date de référence et les questions. Un registre de fixtures peut fournir des résultats déclarés, mais seulement si ces identités et paramètres correspondent. Une fixture manquante ne déclenche aucun repli réel. Cette construction empêche qu’un candidat sélectionne une réponse simulée par un champ de requête et préserve l’attribution de la provenance [REF-ARCH-PROCESSING].

### 4.4.2. Décrire les données qui franchissent les frontières

Le stockage privé reçoit le fichier original. Le lecteur natif travaille dans un processus enfant sans credential et retourne du texte et des diagnostics. Le fournisseur réel, lorsqu’un mode explicitement autorisé est activé, reçoit une requête construite à partir du Markdown et des questions figées. Les résultats validés et la provenance sont ensuite conservés pour la revue RH. Le navigateur candidat ne reçoit ni ces paramètres privés ni les corrections [REF-ARCH-PROCESSING].

La passerelle est une frontière obligatoire du transport fournisseur. Elle porte les admissions et les bornes ; le registre SQL conserve la connaissance durable des tentatives. Les caches fichiers mémorisent le parsing et les réponses complètes validées selon leurs entrées effectives. Un cache est donc une ressource privée contenant potentiellement du texte documentaire, pas une simple accélération sans conséquence sur la conservation des données [REF-ARCH-PROCESSING ; REF-ARCH-SRC-EXECUTION].

Le chapitre documentaire détaille les gardes et les reprises. À l’échelle architecturale, le point décisif est l’absence de contournement : le métier n’initialise pas directement un SDK ou un transport. Le paramètre historique `EXTRACTION_DRIVER` concerne un ancien fournisseur et ne sélectionne pas le moteur des tâches actuelles. Distinguer ces configurations évite d’interpréter un ancien mode désactivé comme la preuve que tout worker documentaire est arrêté [REF-ARCH-ARCHITECTURE ; REF-ARCH-LAUNCH].

## 4.5. Réalisation de parcours représentatifs

### 4.5.1. De l’édition à la publication confirmée

L’éditeur d’offre manipule des identifiants stables, des champs typés et des questions documentaires attachées à leur source. L’adresse de compte du candidat demeure une identité fournie par l’authentification, non une réponse libre à la place d’une identité fiable. Les paramètres techniques restent accessibles dans des zones secondaires, tandis que les contrôles principaux expriment des questions lisibles. Cette simplification d’interface ne modifie pas les clés enregistrées [REF-ARCH-FRONTEND].

[[FIG:CAP-10]]

*Figure — Capture attendue de l’offre et de sa publication : montrer la configuration sauvegardée et la confirmation du plan d’entretien, y compris vide. Utiliser des données synthétiques et préciser la date de capture ; ne pas afficher de secret ni d’identité réelle.*

La commande de publication transmet deux révisions, recharge le plan dans la transaction verrouillée puis laisse l’état publié porter le gel. L’extrait suivant illustre l’ordre logique ; ce n’est pas une copie exécutable du service.

```text
# Illustration : publication d’une configuration sauvegardée
transaction :
  offre = verrouiller_offre()
  vérifier_propriétaire_et_révision_offre(offre)
  plan = lire_plan_dans_la_même_transaction()
  vérifier_révision_plan_et_définitions(plan, offre)
  publier_et_fixer_la_date_UTC_si_absente()
```

L’interface ne publie pas ses champs locaux non enregistrés. Elle charge le plan sauvegardé avant confirmation et ferme cette confirmation après un échec sans recommencer automatiquement. La logique métier et le dialogue expriment ainsi la même intention : confirmer ce qui est réellement en base, pas ce que l’utilisateur pourrait supposer être enregistré [REF-ARCH-VACANCY ; REF-ARCH-SRC-PUBLICATION].

### 4.5.2. Un dépôt conservé avant tout enrichissement

Le parcours candidat vérifie d’abord l’existence de sa candidature pour l’offre. Une réponse indéterminée ou un échec de chargement ne doit pas ouvrir un formulaire non vérifié. Le serveur reste la protection contre plusieurs onglets : il sérialise le couple candidat–offre, retourne le dossier existant ou crée un instantané et ses pièces après validation. Le signal du worker n’est émis qu’après la validation de la transaction [REF-ARCH-APPLICATION ; REF-ARCH-SRC-INTAKE].

[[FIG:CAP-11]]

*Figure — Capture attendue de la candidature déposée : identité de session, réponses figées et documents distincts des résultats ultérieurs. Montrer une soumission synthétique, sans présenter son dépôt comme une extraction exécutée.*

Cette séquence maintient une réponse HTTP indépendante de la durée documentaire. Le signal mémoire n’est pas une file durable : si le processus s’arrête après commit, les scans de base retrouvent les dossiers éligibles. Les tâches réussies sont exclues des réexécutions ; les baux et jetons encadrent les écritures encore autorisées. La disponibilité ne repose donc pas sur la conservation parfaite d’un événement en mémoire [REF-ARCH-PROCESSING].

### 4.5.3. Une revue reliée à sa source

La revue présente les questions configurées dans leur ordre, le résultat original et la valeur effective. Une correction est indépendante pour chaque question et conserve auteur et date. Sa priorité inclut la valeur inconnue explicite : `null` n’est pas un retour automatique à la réponse machine. Supprimer l’override est une intention séparée. Les corrections ne changent ni les réponses candidat ni le résultat original du lot [REF-ARCH-PROCESSING].

[[FIG:CAP-12]]

*Figure — Capture attendue de la revue : PDF source et correction par champ, avec distinction original/correction/effectif et provenance synthétique ou fixture explicitée. Éviter toute suggestion de qualité fournisseur non établie.*

La fermeture de revue demande une confirmation distincte et l’absence de brouillons non enregistrés. La libération manuelle possède son propre dialogue, qui explique la clôture définitive du traitement sans présenter les valeurs manquantes comme réussies. Le parcours n’est ainsi pas un simple formulaire d’édition JSON : son organisation révèle les frontières de responsabilité déjà portées par les données [REF-ARCH-FRONTEND].

### 4.5.4. Agenda et décision finale

L’agenda sépare les rendez-vous à venir, passés et annulés. Les filtres temporels et d’affectation s’appliquent en SQL avant pagination. Un entretien dont le début est atteint rejoint la vue passée, même si sa durée n’est pas écoulée ; le filtre « avis attendu » sélectionne les instances encore sans évaluation. L’affichage utilise le fuseau du navigateur, tandis que la planification transmet un instant ISO et une zone IANA [REF-ARCH-INTERVIEW].

[[FIG:CAP-14]]

*Figure — Capture attendue de l’agenda : semaine commençant le lundi, distinction temporelle et responsable affecté ; aucune disponibilité calendrier externe ne doit être suggérée.*

Les avis sont confirmés sans valeur Pass/Fail choisie par défaut. Le propriétaire enregistre ensuite Offer si les prérequis du plan le permettent, puis Hired par une autre action. Les instances manquantes restent affichées comme non planifiées plutôt que fabriquées pour compléter l’écran [REF-ARCH-INTERVIEW].

[[FIG:CAP-15]]

*Figure — Capture attendue de la décision : contexte de candidature, prérequis Offer et confirmation distincte de Hired. Montrer l’autorité propriétaire sans assimiler la fin d’une extraction à une décision favorable.*

## 4.6. CSV : lecture effective et import atomique de présélection

### 4.6.1. Deux exports pour deux intentions

Le CSV diagnostic conserve une vue large de toutes les candidatures d’une offre, sans condition de revue terminée. Il comprend les états, les résultats originaux, les valeurs effectives, les corrections et leur provenance. L’export compact de présélection ne contient que les candidatures encore indécises et les informations utiles à une décision. Ce second fichier reçoit les filtres factuels partagés avec les listes RH ; il ne doit pas être confondu avec un export des seules lignes actuellement chargées dans le navigateur [REF-ARCH-PROCESSING ; REF-ARCH-SCREENING].

Les versions anciennes de la documentation décrivent des colonnes spécifiques au contrôle de compétences. Pour le CV actuel, `decisionHeaders` parcourt le registre d’extracteurs et génère une colonne par identifiant de question, sous la forme `<outputKey>.question.<questionId>`. `decisionValues` utilise les champs effectifs de la revue. Le rapport retient cette réalisation et le contrat de traitement récent, plutôt que d’annoncer des colonnes Yes/No pour toutes les familles documentaires [REF-ARCH-SRC-REVIEW].

Les réponses candidat restent formatées selon le formulaire figé : libellés des choix, listes lisibles, faux et zéro préservés. Les sorties d’extraction conservent leur type propre. Le résumé distingue résultat automatisé, fixture, correction et indisponibilité ; une revue sans tâche indique « non requise ». Les exports sont bornés à mille candidatures et dix mébioctets, utilisent une sérialisation citée et protégée contre les formules de tableur, et restent privés [REF-ARCH-SCREENING ; REF-ARCH-PROCESSING].

Les liens sont construits depuis l’origine web configurée, non depuis un en-tête Host arbitraire. Les documents restent derrière leurs routes authentifiées ; aucun jeton d’accès public n’est incorporé au fichier. Exporter facilite un travail externe, mais crée une copie qu’il faut gouverner. Le CSV n’est ni un connecteur Excel natif ni une autorisation de transférer des données à un service tiers [REF-ARCH-SCREENING].

### 4.6.2. L’aperçu ne fait pas confiance au fichier

L’import accepte un CSV UTF-8 borné, avec identifiant de candidature, adresse de compte et décision. L’identifiant sélectionne un dossier dans l’offre ; l’adresse vérifie l’identité figée après normalisation. Elle n’est ni une clé de recherche alternative ni une demande de modification du compte. Les colonnes supplémentaires sont ignorées, y compris celles contenant des corrections documentaires. Une décision importée ne réécrit donc jamais une extraction [REF-ARCH-SCREENING].

Le parseur prend en charge les guillemets, les retours à la ligne dans une cellule et les numéros d’enregistrements logiques. Les erreurs de structure du fichier sont distinctes des erreurs de contenu ou d’identité. L’aperçu retourne une identité et un lien utilisables seulement après résolution serveur dans le bon périmètre. Un UUID fourni dans un fichier ne devient pas de lui-même une preuve d’existence d’une personne [REF-ARCH-SRC-SCREENING].

[[FIG:CAP-13]]

*Figure — Capture attendue du regroupement d’import : une candidature, ses propositions sources, les exclusions et le choix explicite d’un motif en cas de divergence. La légende doit rappeler que l’aperçu ne modifie aucune décision.*

### 4.6.3. Regrouper les propositions avant de s’engager

L’interface regroupe les propositions valides par candidature. Des décisions et motifs identiques peuvent préremplir une seule proposition incluse. Des issues divergentes exigent un choix ; des motifs différents exigent une source explicite. Choisir une source prend son couple décision–motif, sans concaténation silencieuse. Un changement d’issue absent des sources efface le motif incompatible. Ces règles évitent un comportement « dernière ligne gagnante » difficilement inspectable [REF-ARCH-SCREENING].

La confirmation finale rafraîchit l’éligibilité sans supprimer les choix conservés. Lors de l’application, le serveur verrouille l’offre puis les candidatures dans un ordre déterministe. Il contrôle tout l’ensemble avant la première écriture et utilise la même opération de décision que le parcours individuel. Le pseudocode suivant résume ce mécanisme, sans reproduire le code exécutable [REF-ARCH-SRC-SCREENING].

```text
# Illustration : engagement atomique d’une sélection CSV
transaction :
  verrouiller_offre_en_partage()
  dossiers = verrouiller_candidatures_triées()
  conflits = vérifier_toutes_les_identités_états_et_révisions(dossiers)
  si conflits : refuser_sans_écriture()
  pour chaque proposition : engager_présélection_et_notice()
  valider_une_seule_fois()
```

Une seule ligne incluse devenue périmée provoque un conflit et zéro modification de cette confirmation. Les décisions qu’un autre utilisateur avait déjà engagées ne sont pas annulées. Le principe est donc « première décision validée gagnante », et non « premier export gagnant ». Après un échec réseau ambigu, l’interface exige un rafraîchissement et n’interprète pas l’issue courante comme un reçu causal prouvant que sa propre tentative avait réussi [REF-ARCH-SCREENING].

## 4.7. Brouillons locaux, inspection et navigation protégée

### 4.7.1. L’interface distingue lire, préparer et engager

La conception visuelle commence par l’entité, l’acteur et l’intention. Un RH autorisé à inspecter une offre publiée voit des informations lisibles, non un éditeur désactivé. Les liens de titres restent de vrais liens, compatibles avec l’ouverture dans un autre onglet. Les mutations apparaissent dans des dialogues ciblés avec conséquences visibles et confirmation explicite. Cette hiérarchie évite qu’un écran de consultation expose toutes les commandes techniques à la fois [REF-ARCH-FRONTEND].

La liste RH distingue « travail à faire » et « état du recrutement ». Une file « en attente de proposition » ne donne aucun droit supplémentaire au non-propriétaire. Une file « traitement » n’interdit pas la présélection. Les filtres sont calculés côté serveur et partagés avec l’export : les reproduire sur une page locale serait incorrect pour le total et les candidatures non chargées [REF-ARCH-APPLICATION].

### 4.7.2. Conserver un brouillon sans le faire passer pour une sauvegarde

Les propositions de correction restent locales à la vue montée, associées au rôle, à la candidature et au couple tâche–question. Une sauvegarde réussie nettoie seulement le champ concerné. Une réponse conflictuelle ou inconnue bloque les mutations suivantes jusqu’au rafraîchissement explicite, en conservant la proposition pour comparaison, réapplication ou abandon. Le rafraîchissement ne fusionne pas et ne renvoie pas la commande [REF-ARCH-PROCESSING].

`NavigationBoundary` protège ces états dans le routeur par fragment. Les éditeurs déclarent s’ils sont modifiés ou s’ils attendent une écriture. Quitter une vue modifiée propose de rester ou de partir en abandonnant ; une écriture en cours bloque le départ tant qu’elle n’est pas résolue. Le garde couvre aussi les redirections applicatives et la déconnexion, et utilise l’avertissement standard du navigateur pour rechargement ou fermeture [REF-ARCH-SRC-NAVIGATION].

Le garde ne sauvegarde rien, n’annule pas la requête et ne constitue pas un mécanisme de sécurité. Les marqueurs d’historique ne contiennent que des positions, jamais des réponses ou corrections. La mémoire de filtres est distincte : elle est limitée au compte, au rôle et à l’onglet, conserve des préférences validées et est nettoyée lors des changements d’identité. Les brouillons et contenus privés ne sont pas stockés pour restaurer automatiquement une session [REF-ARCH-FRONTEND].

### 4.7.3. Une confirmation accessible reste à examiner nativement

Les dialogues s’appuient sur les contrôles natifs : libellé, focus initial côté annulation, fermeture par Échap au repos, arrière-plan inerte et restitution du focus. Pendant une écriture, l’annulation ne doit pas laisser croire que le traitement serveur s’est arrêté. Le dialogue cède temporairement sa couche supérieure à l’avertissement de navigation pour ne pas le masquer, tout en gardant la proposition locale [REF-ARCH-INTERVIEW ; REF-ARCH-VACANCY].

Ces mécanismes sont implémentés, mais leur présence ne démontre pas tous les comportements de clavier, d’historique ou de lecteur PDF selon les navigateurs. Les contrôles historiques ciblés ne remplacent pas la vérification native restante. Cette limite concerne l’acceptation de l’interaction, pas l’existence du mécanisme dans les sources [REF-ARCH-STATUS].

## 4.8. Déploiement local et modes d’exécution

### 4.8.1. Une topologie locale explicite

L’environnement documenté utilise Node.js, pnpm, PostgreSQL et Redis, avec l’interface Vite et l’API dans des processus séparés. Les services d’infrastructure locaux utilisent le réseau hôte prévu par le projet. Les fichiers documentaires, captures de courrier et caches restent hors du suivi Git. Le répertoire de runtime peut être distinct du checkout source afin de conserver ces ressources lors d’un changement de version [REF-ARCH-LAUNCH].

[[FIG:RPT-DEPLOY]]

*Figure — Déploiement logique local : navigateur, frontend, API avec runner interne, PostgreSQL, Redis de garde, stockage et caches privés, processus enfant PDF, fournisseur facultatif. Ne montrer aucun chemin privé, compte, credential ou identifiant de session.*

Cette topologie distingue les artefacts construits des processus réellement démarrés. Fusionner une source ou reconstruire un paquet ne redémarre pas un service déjà en mémoire. De même, une readiness locale vérifie les dépendances prévues de l’application, pas la qualité d’une réponse fournisseur. Le guide de lancement décrit la préparation, tandis que le registre de statut borne les observations déjà effectuées [REF-ARCH-LAUNCH ; REF-ARCH-STATUS].

### 4.8.2. Des modes qui ne se substituent pas implicitement

| Mode | Lecture et réponses | Sens de la démonstration |
|---|---|---|
| Désactivé | Aucun traitement normal actif | Recrutement utilisable sans assistance |
| Fixture | Réponses déclarées et liées à une configuration précise | Parcours déterministe, pas observation fournisseur |
| `offline-demo` | Parsing PDF natif et réponses déclarées pour sources connues | Parsing réel, inférence simulée |
| `jev` autorisé | Lecteur natif et exécuteur réel via passerelle | Cohorte synthétique et consentement délimités |

Le mode désactivé reste le défaut. Les modes de démonstration ne sont pas autorisés en production. Le mode réel demande un contexte explicite et une frontière temporelle fixe pour les nouvelles soumissions autorisées ; il ne draine pas l’historique en attente. La clé est chargée par l’utilisateur dans une mémoire de processus initialement vide. La recopier dans un fichier ou cloner le dépôt ne fait pas partie du déploiement décrit et ne transfère pas l’autorisation d’exécution [REF-ARCH-PROCESSING].

Le runner utilise un réveil mémoire borné et des scans espacés, avec un bail SQL. Les caches persistants survivent au redémarrage, mais ne remplacent ni l’autorisation ni le registre durable d’envoi. Une réponse déjà validée peut soutenir une reprise locale sans nouvel appel ; une réponse absente après une tentative ambiguë ne justifie pas un renvoi. Ces choix privilégient la maîtrise des effets externes à une disponibilité obtenue par répétition automatique [REF-ARCH-PROCESSING].

### 4.8.3. Portée de la réalisation

L’architecture met en place les mécanismes nécessaires au prototype : frontières de données, stockage intègre, transactions métier, traitement différé et interaction prudente. Elle conserve des limites d’exploitation identifiées, notamment la réconciliation des objets, la rétention et les quotas de cache, les sauvegardes et une validation plus complète des courses et projections privées. Aucun résultat de charge, de latence ou d’économie mesurée n’est déduit de ces choix.

La contribution technique réside moins dans l’accumulation de frameworks que dans leur articulation. Le contrat partagé définit les données possibles ; le serveur contrôle l’autorité et l’état courant ; PostgreSQL arbitre les engagements concurrents ; les adaptateurs bornent les effets extérieurs ; l’interface conserve les intentions sans les engager à l’insu de l’utilisateur. Cette architecture fournit ainsi un support cohérent aux règles métier, tout en laissant l’assistance documentaire facultative et les décisions humaines explicites.
