# CAP — Pré-soutenance PFE

Version de travail pour relecture de l’encadrant. CAP : « Centralisation et Assistance au Parcours de recrutement ». 34 diapositives principales, deux annexes, six intercalaires : **42 pages**. Correspondance physique dans `dist/page-map.md`. Notes orales non affichées dans le PDF. Captures dans [assets/requests.md](assets/requests.md), bibliographie dans [report/references.bib](report/references.bib).

## 01 — CAP
**Plateforme de gestion du recrutement**

*(Diapositive de couverture rendue depuis `metadata.json` : nom, sous-titre, mission, auteur, encadrant, organisme, date.)*

Note orale : annoncer un projet d’ingénierie logicielle avec une composante IA. Il ne s’agit ni d’entraîner un modèle de sélection ni de remplacer le recruteur. CAP est développé pour expliciter le sens du nom : centralisation du dossier, assistance à la préparation de l’information, continuité du parcours. Confirmer le nom et les informations académiques avant la version définitive.

## 02 — Plan de la présentation
- **Contexte et problématique** : pourquoi cette plateforme ?
- **Analyse des besoins** : pour qui et selon quelles règles ?
- **Conception** : comment articuler métier, données et IA ?
- **Réalisation** : le parcours d’une candidature.
- **Validation et bilan** : acquis, limites et perspectives.

Note orale : viser environ 20 à 25 minutes, durée de travail proposée et non consigne institutionnelle. Les deux annexes servent aux questions. Les vues de conception peuvent être parcourues rapidement pour conserver du temps aux écrans métier.

## 03 — Cadre et enjeux du projet
- **Organisme d’accueil : BeeCoders.**
- **Domaine :** gestion du recrutement pour une entreprise.
- **Intervenants :** candidats, équipe RH, responsables d’offres et interviewers.
- **Enjeu :** relier les informations du dossier aux actions de chaque intervenant.

**Un périmètre ciblé : de la publication de l’offre à la décision d’embauche.**

Note orale : ne pas inventer l’historique, l’effectif, les clients ou un diagnostic terrain de BeeCoders. Le nom de l’organisme provient des métadonnées déjà fournies. Le processus présenté est celui du prototype ; l’organisation réelle reste à préciser oralement si nécessaire. Un logo officiel pourra être ajouté, sans bloquer cette version.

## 04 — Problématique
**Comment rendre les candidatures exploitables et coordonner leur suivi, tout en conservant la maîtrise humaine des décisions ?**

- **Information hétérogène :** formulaires, CV et pièces jointes.
- **Travail collectif :** responsabilités et actions à coordonner.
- **Assistance IA :** résultats à vérifier, erreurs à rendre visibles.

Note orale : présenter ces points comme les difficultés auxquelles répond la conception, pas comme les conclusions d’une enquête menée dans l’entreprise. Les objectifs de réduction du temps de traitement ne sont pas encore mesurés.

## 05 — Étude de l’existant et positionnement
| Approche | Apport principal | Question pour le projet |
|---|---|---|
| Courriels et tableurs | Collecter et comparer des dossiers | Comment garder un suivi commun ? |
| ATS : Greenhouse, Workable | Centraliser le parcours de recrutement | Comment adapter les règles et les accès ? |
| Extraction : Textkernel | Structurer les informations des CV | Comment vérifier et intégrer ces résultats ? |

Note orale : panorama fonctionnel documentaire, et non benchmark commercial. Les références sont conservées dans notes.md. Ces solutions ne sont pas présentées comme incapables de répondre au besoin. Le PFE porte sur la conception et l’intégration d’un parcours maîtrisé, pas sur une supériorité démontrée face aux ATS existants.

## 06 — Solution proposée
- **Centraliser** les offres, candidatures et documents privés.
- **Assister** la lecture des CV par des questions structurées.
- **Permettre** la revue, la correction et les échanges CSV.
- **Coordonner** la présélection, les entretiens et les décisions finales.

**CAP : Centralisation et Assistance au Parcours de recrutement.**

Note orale : CAP est ici développé pour rendre explicite le sens du nom, sans prétendre retrouver sa motivation historique. Centralisation = dossier commun ; Assistance = préparation des informations, non décision automatique ; Parcours = continuité entre candidat, RH et interviewer. Déploiement dédié à une entreprise ; paie et gestion des employés hors périmètre. L’IA prépare l’information ; les acteurs autorisés décident.

## 07 — Une plateforme, plusieurs façons de travailler
- **Parcours traditionnel :** lire les dossiers et décider dans l’application.
- **Assistance facultative :** extraire les informations utiles avant leur revue.
- **Échanges CSV :** exploiter les données dans un tableur ou un outil externe.
- **Cadre commun :** conserver les identifiants, responsabilités et décisions.

Note orale : plateforme généraliste dans le périmètre du recrutement, configurable par offre, pas moteur universel de processus. Excel/LibreOffice et des outils d’analyse ou d’IA peuvent exploiter le CSV ; ce sont des usages externes possibles, pas des connecteurs natifs livrés. Le retour dans CAP porte sur des décisions contrôlées, pas sur un remplacement libre des données. Exporter n’autorise pas à transmettre des CV privés à n’importe quel service. Les entretiens et l’extraction peuvent être absents du parcours configuré.

## 08 — Acteurs et besoins fonctionnels
| Acteur / responsabilité | Besoins principaux | Portée |
|---|---|---|
| Candidat | Consulter, déposer, suivre | Ses candidatures |
| Équipe RH | Examiner, corriger, exporter, présélectionner | Travail partagé |
| Propriétaire d’offre | Configurer, publier, proposer, confirmer l’embauche | Ses offres |
| Interviewer | Consulter, évaluer, demander une replanification | Entretiens affectés |

Note orale : propriétaire est une capacité portée par un compte RH ou administrateur, pas un rôle autonome. Un administrateur ne peut pas se substituer automatiquement au propriétaire pour les décisions finales. Le candidat voit uniquement les informations publiques autorisées, pas les corrections ou évaluations internes.

## 09 — Exigences de qualité
- **Confidentialité :** documents privés et vues adaptées aux droits.
- **Intégrité :** dépôt original conservé et décisions cohérentes.
- **Fiabilité :** erreurs explicites, conflits détectés, confirmations ciblées.
- **Maintenabilité :** modules métier et contrats TypeScript partagés.
- **Utilisabilité :** actions lisibles et corrections au contact du CV source.

Note orale : exigences traduites en mécanismes concrets, sans revendiquer de certification sécurité ni de validation complète en production. Les vérifications authentifiées, les courses concurrentes et l’accessibilité restent des axes de consolidation.

## 10 — Démarche de réalisation
- **Définir** un scénario et ses règles métier.
- **Construire** le contrat, la persistance et les autorisations backend.
- **Intégrer** le parcours utilisateur et les confirmations nécessaires.
- **Vérifier** le périmètre retenu et documenter les limites.

**Développement itératif par incréments fonctionnels.**

Note orale : démarche attestée par les checkpoints et décisions du dépôt, sans inventer des sprints Scrum, un calendrier ou des rituels. Progression générale : socle et dépôt, revue et entretiens, consolidation des règles et de l’UX, intégration documentaire. Le journal est sélectif ; il ne permet pas de reconstruire une durée totale de développement.

## 11 — Cas d’utilisation essentiels
`[DIA-02 — acteurs et principales actions autorisées]`

**L’autorisation combine le rôle, la propriété de l’offre et l’affectation à l’entretien.**

Note orale : les contrôles sont appliqués côté serveur ; l’affichage des boutons n’est pas la frontière de sécurité. Vue de synthèse, pas inventaire de tous les endpoints. Les besoins d’inscription et récupération d’accès restent dans les fonctionnalités support.

## 12 — Modèle métier centré sur la candidature
`[DIA-03 — relations conceptuelles entre offre, candidature, documents, tâches et entretiens]`

**Un même dossier relie les données d’origine, leur exploitation et les étapes de recrutement.**

Note orale : vue conceptuelle simplifiée, pas schéma relationnel exhaustif. Le dépôt conserve son instantané ; une correction ne remplace ni la réponse du candidat ni le résultat de l’extraction. Les détails d’attribution et de présence des corrections sont développés dans le contrat de traitement.

## 13 — Architecture de la solution
`[DIA-04 — architecture technique actuelle]`

**React / Vite · NestJS · PostgreSQL · TypeScript / Zod · Monorepo pnpm**

Note orale : backend modulaire, pas architecture microservices. Documents servis par des accès contrôlés. Le traitement documentaire est exécuté hors de la requête de dépôt. Redis participe aux garde-fous des appels externes ; la messagerie et le stockage sont isolés derrière des interfaces. Le branchement réel ne vaut pas validation de qualité.

## 14 — Des choix techniques liés aux besoins
| Besoin | Choix retenu | Compromis |
|---|---|---|
| Faire évoluer un prototype cohérent | Backend modulaire, contrats partagés | Déploiement commun |
| Allier règles stables et formulaires variables | PostgreSQL et JSONB | Validation métier explicite |
| Préparer les CV à faible coût | Lecture PDF native sur CPU local | Pas de lecture des scans par OCR |
| Garder un dépôt réactif | Traitement différé, caches privés | États et reprises à gérer |

Note orale : mettre en évidence conception modulaire, modèle relationnel, données semi-structurées, validation et traitements asynchrones. Le parseur local extrait le texte présent dans le PDF : ce n’est ni de l’OCR ni une inférence IA locale. L’analyse sémantique est effectuée par le service externe. Éviter une brique OCR/vision pour les PDF textuels vise à limiter ressources et latence ; aucun benchmark local n’en quantifie encore le gain. Pas de microservices nécessaires pour expliquer cette séparation des responsabilités.

## 15 — Du PDF à une information structurée
`[DIA-05 — chaîne documentaire et extraction encadrée]`

**Des résultats typés, conservés avec leur origine, puis soumis à la revue humaine.**

Note orale : le lecteur natif produit du Markdown à partir du PDF, sans OCR. Une requête regroupe les questions d’un extracteur ; la réponse complète est validée avant persistance. Le worker et la passerelle Jev sont intégrés. Les caches et gardes de tentative limitent les répétitions ; leur robustesse en concurrence n’est pas une garantie vérifiée. Le déploiement documenté utilise le mode réel pour les nouvelles soumissions synthétiques autorisées, après chargement de clé par l’utilisateur.

## 16 — Cinq familles de questions sur les CV
| Famille | Information recherchée | Limite d’interprétation |
|---|---|---|
| Formation | Niveau documenté, domaine éventuel | En cours ≠ diplôme obtenu |
| Certification | Certification déclarée obtenue | Authenticité non vérifiée |
| Expérience | Classe de durée, domaine éventuel | Déclarations du CV |
| Couverture d’une liste | Nombre d’éléments mentionnés | Mention ≠ maîtrise |
| Contexte d’une compétence | Étudiée, appliquée, professionnelle | Contexte ≠ niveau vérifié |

Note orale : configuration par questions structurées, pas prompt libre. La date de publication sert de référence temporelle stable. Les durées d’expérience sont des classes, pas une précision calculée au mois. Une réponse absente ou invalide est une erreur de traitement, pas un zéro ou un jugement défavorable sur le candidat.

## 17 — Une extraction pensée pour rester économique
- **Lecture locale :** texte PDF natif sur CPU, sans étape OCR ni appel vision.
- **Une requête par extracteur** : toutes les questions voyagent ensemble.
- **Réutilisation :** caches privés du Markdown et de la réponse validée.
- **Scénario fournisseur :** 5 000 tokens complets à 0,042 $ / million → **0,000210 $ par requête** ; sorties gratuites.

Note orale : tarif direct TypeSafe consulté le 13 novembre 2026 : 0,042 dollar par million de tokens d’entrée, sorties gratuites. Une requête multi-question par extracteur, et non cinq appels pour cinq familles. À 5 000 tokens complets par requête, mille requêtes représentent 0,210 dollar de fournisseur. C’est un scénario, pas une taille moyenne ou une facture mesurée ; hébergement, stockage et revue humaine sont exclus. Le tarif ne démontre ni débit ni gain face à un ATS complet. Voir cost-model.md.

## 18 — Corriger sans effacer l’original
`[DIA-07 — filiation d’un champ, de la source à la valeur effective]`

**Document source, résultat original et correction RH restent distincts.**

Note orale : les RH relisent le PDF et peuvent corriger chaque champ avec attribution. L’export utilise la valeur effective. Une absence de correction, une valeur nulle et une suppression de correction ont des significations distinctes. Le système conserve l’original et la correction courante, pas un historique exhaustif de toutes les modifications.

## 19 — Progression du recrutement
`[DIA-06 — présélection, entretiens éventuels, proposition et embauche]`

**Traitement, revue RH et recrutement : trois états indépendants.**

Note orale : la présélection est explicite et peut intervenir sans revue terminée. Elle clôt le travail de traitement/revue sans le déclarer réussi. Avec zéro entretien, la présélection permet au propriétaire de proposer l’embauche ; sinon tous les entretiens configurés doivent être réussis. Proposition et embauche sont deux commandes distinctes, jamais une conséquence automatique de l’IA.

## 20 — Configurer et publier une offre
- **Formulaire** adapté aux informations attendues.
- **Documents et questions d’extraction** configurables.
- **Plan d’entretien** ordonné, éventuellement vide.
- **Publication confirmée** sur une version cohérente.

`[CAP-10 — offre et revue de publication]`

Note orale : tâches et entretiens sont facultatifs. La publication fige le plan d’entretien, y compris vide, et la date de référence documentaire. Les révisions de l’offre et du plan sont vérifiées séparément. Utiliser une capture récente ; l’ancien écran du deck d’octobre ne prouve pas cette règle.

## 21 — Déposer une candidature
- **Un formulaire** et les pièces requises.
- **Contrôles serveur** avant acceptation.
- **Dépôt conservé**, non modifiable après soumission.
- **Suivi personnel** des informations publiques autorisées.

`[CAP-11 — formulaire candidat avec données synthétiques]`

Note orale : une candidature par candidat et offre. Le dépôt ne doit pas attendre le fournisseur IA. Aucun résultat interne de revue ou feedback d’entretien n’est exposé dans l’espace candidat. La sortie d’un formulaire saisi demande une confirmation d’abandon.

## 22 — Examiner et corriger le dossier
- **CV source visible** pendant la revue.
- **Résultats par champ**, corrections indépendantes.
- **Disponibilité de la revue** distincte de l’état du traitement.
- **Libération manuelle confirmée** si le traitement reste bloqué.

`[CAP-12 — CV source et panneau de correction RH]`

Note orale : libérer la revue ne fabrique pas un résultat réussi. En cas de conflit, les brouillons locaux peuvent être comparés et réappliqués explicitement après actualisation. Ils ne sont pas fusionnés automatiquement. Les résultats présentés doivent garder leur provenance : fixture, réponse réelle ou correction humaine.

## 23 — Exporter et confirmer la présélection
- **Export filtré** avec les valeurs effectives disponibles.
- **Décisions CSV** reliées aux identifiants et emails.
- **Aperçu contrôlé** : lignes invalides et décisions déjà prises.
- **Confirmation finale** du groupe de décisions retenu.

`[CAP-13 — aperçu du réimport de décisions]`

Note orale : le réimport est implémenté, contrairement au deck précédent. L’exclusion d’une ligne n’est pas un rejet. Le lot inclus est appliqué atomiquement ; la première décision enregistrée fait foi. Les champs non disponibles restent vides avec un état fidèle ; importer des décisions ne corrige pas les résultats d’extraction. Présélection et rejet sont définitifs dans ce parcours.

## 24 — Organiser les entretiens
- **Agenda partagé** et rendez-vous datés.
- **Interviewer affecté** à chaque entretien.
- **Contrôle des chevauchements** et replanification.
- **Évaluation finale** après le début prévu.

`[CAP-14 — agenda et détail d’un entretien]`

Note orale : une instance par candidature et étape, un interviewer responsable ; pas de synchronisation avec un calendrier externe ni de panel. Pass/Fail décide de la réussite de l’entretien ; le score facultatif n’est pas un seuil automatique. Les demandes de replanification et les changements alimentent les notifications pertinentes.

## 25 — Enregistrer une décision explicite
- **Proposition d’embauche** réservée au propriétaire de l’offre.
- **Prérequis** : présélection et entretiens réussis, s’ils existent.
- **Embauche** confirmée dans une action distincte.
- **Notifications ciblées** selon les événements et les destinataires.

`[CAP-15 — détail de candidature et action du responsable]`

Note orale : ne pas confondre décision interne Offer avec génération ou signature d’un contrat. Les notifications candidat couvrent les résultats publics autorisés de présélection/rejet, pas une publication de toutes les étapes internes. Le feedback et les changements de rendez-vous ont leurs destinataires internes spécifiques.

## 26 — Coordonner les acteurs du recrutement
- **RH :** une liste partagée, des filtres et une revue commune.
- **Responsable :** les choix de l’offre et les décisions finales.
- **Interviewer :** ses rendez-vous, demandes et évaluations.
- **Candidat :** son dépôt et les informations de suivi autorisées.

**Le dossier et les notifications relient les intervenants.**

Note orale : une petite équipe peut cumuler des responsabilités ; une autre peut séparer préparation, présélection et entretien, dans les limites des droits implémentés. L’outil fournit une structure minimale, pas une méthode d’organisation universelle. Pas d’assignation exclusive des dossiers RH, de workflow d’approbation configurable, de chat ou de débat formalisé. Inbox interne et notifications candidat ont des causes précises ; pas de fil de conversation partagé ni de diffusion de toutes les évaluations. Les conflits sont détectés et la première décision de présélection enregistrée fait foi.

## 27 — Une boîte de réception pour les actions à traiter
- **Affectations et changements** de rendez-vous signalés à l'interviewer.
- **Demandes de replanification** et retours transmis aux responsables.
- **Statut lu / non lu** conservé par destinataire.
- **Dossiers métier indépendants** : supprimer un message ne supprime pas une candidature.

`[CAP-16 — boîte de réception interne avec plusieurs messages non lus]`

Note orale : les notifications ont des causes métier précises et des destinataires choisis, pas une diffusion générale. Les messages lus sont purgés après un délai ; les non-lus ne le sont jamais. Il n'y a ni fil de discussion ni chat.

## 28 — Un export qui reste exploitable ailleurs
- **Valeurs effectives** et provenance incluses dans le fichier.
- **Colonnes stables** par identifiant de question.
- **Ouverture directe** dans un tableur ou un outil d'analyse.
- **Import de décisions** séparé, confirmé et atomique.

`[CAP-17 — fichier d'export ouvert dans un tableur]`

Note orale : l'export sert au travail externe et au contrôle ; il ne modifie aucune donnée. Le réimport ne porte que sur des décisions, jamais sur les résultats d'extraction. Les liens de documents restent authentifiés.

## 29 — Stratégie de vérification et preuves
| Niveau | Éléments disponibles | Portée de la preuve |
|---|---|---|
| Règles et interfaces | Contrôles unitaires, modèles hors ligne, tests DOM datés | Scénarios ciblés |
| Intégration locale | Builds, migrations et disponibilité des services documentés | Préparation technique |
| Usage et exploitation | Parcours manuels partiels, régression complète en attente | Consolidation à poursuivre |

Note orale : les nombres de tests des checkpoints ne sont pas additionnés et ne décrivent pas une régression complète de la dernière version. Les builds du 13 novembre ont réussi ; le démarrage du worker réel a été observé. Cela ne prouve ni une validation bout en bout réelle ni la confidentialité ou les courses concurrentes dans tous les scénarios. Aucune nouvelle exécution de tests applicatifs n’a été faite pour cette présentation.

## 30 — Démonstration : un dossier de bout en bout
- **Publier et déposer** une candidature synthétique.
- **Lire et corriger** un champ au contact du CV.
- **Exporter et présélectionner** avec confirmation.
- **Parcourir les entretiens** puis la décision du responsable.

**Support préparé : cinq offres et vingt-cinq scénarios synthétiques.**

Note orale : proposer un parcours court à partir des captures ou de dossiers préparés ; ne pas dépendre d’un appel payant pendant la soutenance. Ces scénarios servent au workflow, pas à mesurer la précision. Le premier achèvement documenté utilisait un parseur natif avec réponse simulée ; ne pas le présenter comme résultat Jev. Les captures seront fournies manuellement par l’utilisateur.

## 31 — Limites actuelles
- **Qualité IA :** précision et robustesse encore à mesurer.
- **Documents :** PDF natif ; OCR et lecture réelle du DOCX non intégrés.
- **Validation :** régression complète, confidentialité et concurrence à consolider.
- **Usage :** gain de temps et accessibilité non quantifiés.

**Une intégration fonctionnelle ne constitue pas encore une validation en production.**

Note orale : l’extraction réelle est branchée, donc la qualifier de simple simulation serait désormais faux. En revanche, l’activation locale n’établit aucune performance mesurée. Les mécanismes de contrôle des appels et de reprise locale existent dans le code ; les comportements de panne et de concurrence restent à vérifier dans le périmètre autorisé.

## 32 — Bilan : apports métier et techniques
- **Produit :** un dossier commun et des responsabilités explicites, du dépôt à l’embauche.
- **Ingénierie full-stack :** contrats typés, API modulaire et interfaces adaptées aux acteurs.
- **Données et IA :** extraction structurée, sources conservées et corrections humaines séparées.
- **Fiabilité :** transactions, autorisations contextuelles et gestion des conflits.

**Compétences mobilisées :** analyse des besoins · modélisation · développement full-stack · intégration d’un service externe · conception de schémas · concurrence et transactions · vérification.

Note orale : relier chaque ligne aux acquis du cursus plutôt qu’à une liste de technologies. Le bilan décrit le système et ses choix, sans inventer une attribution personnelle détaillée ni des technologies nouvellement apprises. Ne pas promettre une sélection plus juste ou plus rapide sans protocole. Le lien éventuel à l’ODD 8 peut être évoqué comme intention, sans impact démontré.

## 33 — Perspectives prioritaires
- **Consolider les parcours** : régression, droits, conflits et reprises.
- **Évaluer l’extraction** sur un corpus relu humainement.
- **Évaluer l’usage** : temps de revue, erreurs et compréhension des statuts.
- **Préparer le déploiement** : exploitation, installation et accompagnement.

Note orale : priorités proposées pour discussion avec l’encadrant ; pas de calendrier garanti. Les fonctionnalités CSV, le plan figé à publication, la revue par champ et le worker réel ne doivent plus figurer comme futures intégrations. Les extensions OCR et autres formats viendraient après consolidation du périmètre actuel.

## 34 — Conclusion et discussion
**Centraliser le dossier. Structurer l’information. Garder la décision humaine.**

- Un prototype couvrant le parcours de recrutement retenu.
- Une assistance documentaire intégrée et révisable.
- Une prochaine étape centrée sur la validation de la qualité et de l’usage.

**Merci pour votre attention — questions et retours.**

Note orale : terminer ici la présentation principale. Solliciter un retour sur le cadrage PFE, la profondeur technique attendue et le protocole d’évaluation. Les annexes suivantes ne sont montrées que si elles servent la discussion.

## 35 — Annexe : protocole d’évaluation proposé
| Axe | Méthode envisagée | Mesures possibles |
|---|---|---|
| Extraction | CV variés, annotation humaine, comparaison par famille | Exactitude, erreurs, sorties non exploitables |
| Workflow | Scénarios de bout en bout et conflits contrôlés | Respect des règles, cohérence des états |
| Utilisabilité | Tâches RH avec et sans assistance | Temps de revue, corrections, difficultés |
| Exploitation | Observations dans un périmètre autorisé | Latence, coût, comportement en panne |

Note orale : protocole non exécuté. Définir corpus et vérité de référence avant la mesure ; séparer mise au point et évaluation. Pour les classes de durée ou de contexte, utiliser un accord par classe et une matrice de confusion ; pour les réponses catégorielles, exactitude et erreurs par catégorie. La confiance renvoyée par un fournisseur n’est pas une précision mesurée. Aucun appel fournisseur ni test payant n’est autorisé par ce document.

## 36 — Annexe : invariants métier à retenir
- **Publication :** vérification des révisions et gel du plan d’entretien.
- **Dépôt :** réponses et documents d’origine immuables.
- **Revue :** correction séparée ; clôture explicite et conflits détectés.
- **Sélection :** décision humaine finale, indépendante de l’extraction.
- **Embauche :** proposition puis confirmation par le propriétaire.

Note orale : sources de référence : contrats vacancy, application, processing-review et interview ; action-policy pour les capacités. Ces invariants expliquent l’utilité des transactions, verrous et compteurs de révision. Ils ne doivent pas être présentés comme une preuve de test exhaustif de toutes les combinaisons.
