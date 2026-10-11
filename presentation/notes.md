# Pré-draft — réunion d’avancement (30 diapositives)

**Historique du premier découpage.** Après retour utilisateur, le draft courant est [draft.md](draft.md) : besoins fonctionnels/non fonctionnels explicites, trois diagrammes au lieu de six, davantage de slides de réalisation et une seule slide ODD. Les références ci-dessous restent utilisables.

Points à relire, **pas encore le texte final ni le deck**. Français provisoire ; durée, titre officiel et identité à confirmer. Une diapositive = une idée principale, pas un écran rempli de ces notes. Les détails/caveats pourront devenir des notes orales.

Fil conducteur : **accélérer le travail de recrutement RH, sans déléguer la décision à une boîte noire**. Présenter un prototype fonctionnel et ses choix, pas un produit fini ni plusieurs mois de développement. Aucun gain de temps, taux de précision ou impact social n’a encore été mesuré.

Repères de travail : `Réalisé` = implémenté ; `Vérifié` = couvert par les contrôles documentés ; `À faire` = non livré ; `À confirmer` = contenu à convenir avec l’encadrant. Ces repères ne sont pas nécessairement des badges sur chaque slide.

## A — Introduction et problématique

### 01 — Plateforme de recrutement : état d’avancement
- Plateforme dédiée au processus de recrutement d’une entreprise.
- Du dépôt de candidature aux entretiens et décisions internes.
- `[À confirmer : titre officiel, auteur, encadrant, établissement, date]`.
- Annonce : besoins → conception → réalisation → validation → suite.

### 02 — Contexte : un travail RH à plusieurs intervenants
- Le candidat dépose des informations et documents ; les RH préparent et suivent les dossiers.
- Un responsable définit le besoin et le parcours ; des interviewers évaluent les candidats assignés.
- Besoin de retrouver la bonne information, au bon moment, avec les bons droits.
- `[À confirmer : processus réellement observé dans l’entreprise ; ne pas transformer un cas-type en enquête terrain]`.

### 03 — Volume de candidatures et attention limitée
- Ashby, rapport 2026 : plus de **300 candidatures par embauche en moyenne pendant 2025**, dans le jeu de données étudié [S1].
- Ladders, étude 2018 rapportée par HR Dive : **7,4 secondes pour le premier examen** d’un CV [S2].
- Deux indicateurs différents : volume par embauche ≠ volume par offre ; premier examen ≠ lecture complète.
- Contexte externe, pas statistiques de notre entreprise ni mesure universelle.
- Visuel : deux chiffres sourcés avec périmètre/date, sans image générée.

### 04 — Problématique : accélérer sans perdre le contrôle
- Comment rendre les candidatures exploitables plus rapidement et coordonner leur suivi ?
- Réduire les ressaisies, les informations dispersées et les ambiguïtés de statut.
- Conserver les documents originaux, les corrections et la responsabilité humaine.
- L’IA pourrait aider à structurer l’information ; elle ne garantit ni exactitude ni équité.
- Question directrice : **comment assister le recrutement tout en gardant un processus contrôlable ?**

## B — Existant et solution proposée

### 05 — Existant : outils génériques et ATS
- Cas-type à confirmer : courriels, dossiers et tableurs pour collecter, comparer et coordonner.
- ATS : centralisation des candidatures, suivi des étapes, planification et évaluations.
- Exemples documentaires : Greenhouse et Workable [S3, S4].
- Pas de benchmark produit exécuté : revue des fonctions annoncées, non test comparatif.
- Tableau simple « outils génériques / ATS / besoin ciblé », sans score inventé.

### 06 — Positionnement et périmètre
- Un déploiement par entreprise ; pas de marketplace ni de multi-tenancy.
- Recrutement uniquement : offres, candidatures, revue RH, entretiens, décisions internes.
- Ni paie, ni gestion des employés, ni onboarding complet.
- Objectif : un flux cohérent, adaptable au besoin retenu ; pas prouver une supériorité sur les ATS.
- Gains attendus à mesurer : temps de préparation, coordination, lisibilité et traçabilité.

### 07 — Solution proposée : deux parcours reliés
- Candidat : compte → offre → formulaire/documents → confirmation du dépôt.
- Équipe : candidature → extraction/revue facultative → comparaison/export → présélection.
- Puis : planification → feedback → décision interne.
- Les RH peuvent avancer sans extraction ; pas de blocage artificiel par l’IA.
- `[DIA-01 — flux global ; distinguer extraction simulée et progression interne non publiée au candidat]`.

## C — Méthodologie et environnement de travail

### 08 — Démarche itérative inspirée Kanban
- Découper le travail en checkpoints fonctionnels et limiter le périmètre actif.
- Définir le contrat backend → implémenter/persister → vérifier → intégrer l’interface → ajuster.
- Séparer « réalisé », « à vérifier » et « différé » dans le suivi documentaire.
- Retours manuels intégrés sur des scénarios courts.
- `[À confirmer avec l’encadrant : intitulé méthodologique]` ; ne pas revendiquer un Scrum formel, des sprints ou un tableau Kanban utilisés sans preuve.

### 09 — Progression : construire par dépendances
- Identité et accès → offres/formulaires → dépôt et documents privés.
- Traitement simulé → corrections RH/export → entretiens/décisions/inbox.
- Contrats et données persistantes avant le parcours frontend correspondant.
- Revue UX et intégration réelle de l’extraction : prochains chantiers.
- Frise par checkpoints, sans dates/durée inventées et sans suggérer plusieurs mois de travail.

### 10 — Qualité, CI et documentation
- Tests de domaine/backend et tests DOM pour les interactions frontend.
- Workflow GitHub configuré : installation verrouillée, tests et typecheck [I7].
- Vérifications PostgreSQL/mail/intégration via commandes séparées ; ne pas les présenter comme exécutées dans la CI actuelle.
- Documentation : contrats API, décisions, statut, scénarios de démo, backlog.
- Vérifications locales documentées ≠ preuve d’un passage CI distant ; rien n’a été poussé à ce checkpoint.

## D — Conception fonctionnelle et technique

### 11 — Acteurs et cas d’utilisation — UML
- Candidat : inscription/vérification, candidature, accès à ses propres dépôts.
- RH : consultation partagée, corrections, export, présélection, planification.
- Propriétaire : configuration de son offre/parcours, Offer/Hired.
- Interviewer : agenda et dossiers assignés, retour final/demande de replanification.
- Administrateur : rôle interne ; pas de contournement automatique de toutes les règles métier.
- `[DIA-02 — cas d’utilisation UML ; propriétaire représenté comme capacité d’un rôle RH/admin, pas rôle autonome]`.

### 12 — Rôles, capacités et portée des ressources
- Un rôle donne des possibilités générales ; propriété/assignation limitent certaines actions.
- Exemple : les RH planifient ; seul l’interviewer assigné soumet le feedback.
- Exemple : être administrateur ne donne pas le droit de décider Offer/Hired pour toute offre.
- Contrôle backend, pas seulement boutons cachés ; documents soumis aux mêmes droits.
- À approfondir : vocabulaire et matrice rôles/capacités, cohérence des écrans et des règles.

### 13 — Données métier essentielles — UML
- Offre et révisions ; candidature liée à une définition figée au dépôt.
- Réponses et documents ; tâches de traitement/résultats ; corrections RH séparées.
- Étapes d’entretien de l’offre ; instances par candidature ; retour final.
- Notifications adressées à des destinataires internes.
- `[DIA-03 — diagramme de classes conceptuel limité aux relations utiles ; pas un dump du schéma SQL]`.

### 14 — Architecture technique mise en œuvre
- React/Vite → API NestJS/TypeScript → PostgreSQL.
- Monorepo pnpm : domaine partagé, API, web ; séparation des responsabilités.
- Stockage privé local des documents ; contrôle d’accès via API.
- Ports remplaçables pour mail et extraction ; implémentation actuelle d’extraction = fixtures.
- `[DIA-04 — architecture actuelle ; intégrations futures en pointillés, sans prétendre à des microservices]`.

### 15 — Préserver le dépôt et faire évoluer les offres
- Le dépôt garde sa définition d’entrée, ses réponses et ses documents.
- Les changements futurs d’une offre ne réécrivent pas les anciennes candidatures.
- Les corrections RH enrichissent la lecture ; elles ne modifient pas la réponse du candidat.
- Distinction : formulaire figé au dépôt / étapes d’entretien figées dès qu’une instance existe.
- Valeur : interprétation stable et séparation des responsabilités ; pas de journal d’audit exhaustif revendiqué.

### 16 — Extraction : passer d’un document à des tâches
- Définition de traitement attachée à l’offre, copiée dans la candidature au dépôt.
- Un besoin d’extraction devient une tâche avec source/arguments et résultat attendu.
- Cas actuel : vérifier des compétences configurées, avec résultats structurés par compétence.
- Séparer état global, résultat de tâche et erreurs ; conserver la provenance.
- Pas de score automatique d’employabilité ni de classement calculé.
- Visuel : « document → tâches → résultats structurés », sans graphique de performance.

### 17 — Pipeline d’extraction : contrat actuel et cible IA
- Actuel : lecture de la définition figée → dispatch explicite → exécuteur mock → stockage des résultats/erreurs.
- Cible à intégrer : extraction du texte PDF/DOCX → exécuteur réel → validation structurée → preuves textuelles → persistance.
- Lecture OCR, provider/model et politique d’exécution restent à décider selon le périmètre.
- Validation JSON ≠ véracité du résultat ; le contenu d’un CV doit rester une donnée non fiable, pas une instruction.
- `[DIA-05 — séquence UML du traitement ; séparer visuellement chemin implémenté et cible future]`.

### 18 — Pourquoi simuler avant d’intégrer l’IA ?
- Tester le workflow sans dépendre du coût, de la latence ou d’un provider.
- Fixtures explicites : succès, échec, sortie vide ; vérifier récupération et correction.
- Exécution locale explicite ; pas d’extraction automatique lancée en arrière-plan.
- Un succès fixture utilise les compétences configurées, **pas une lecture intelligente du CV**.
- Ce qui est vérifié : orchestration/persistance/erreurs ; ce qui ne l’est pas : précision, robustesse sémantique, performance IA.

### 19 — Revue RH : corriger sans effacer
- Afficher la dernière correction effective tout en conservant le résultat/échec original.
- Distinguer « erreur d’extraction », « correction enregistrée » et « revue terminée ».
- Sans tâche : pas de travail de revue, contrôles cachés ; ce n’est pas une approbation du candidat.
- Export et présélection ne dépendent pas d’une revue terminée.
- Décision : l’outil assiste les RH, il ne transforme pas un marqueur technique en décision métier.

### 20 — Export livré, réimport à concevoir
- CSV disponible pour poursuivre une analyse externe, sans attendre la revue.
- Export : réponses, états et valeurs originales/effectives pertinentes.
- Réimport de décisions **non livré** ; présélection actuellement manuelle.
- Cible envisagée : identifiants stables → sélection partielle → validation/aperçu → confirmation.
- Décisions ouvertes : doublons, données périmées, actions autorisées, lignes étrangères et atomicité.
- Visuel : flèche sortante pleine « export » ; retour en pointillés « futur contrat d’import ».

### 21 — Entretiens : étapes, rendez-vous et décisions distincts
- Le propriétaire définit un parcours ordonné ; instance unique par candidature/étape.
- Les RH planifient/replanifient ; l’interviewer assigné soumet notes, score facultatif 0–10 et Pass/Fail.
- Le score est informatif : pas de seuil automatique.
- Fail est terminal et annule les autres entretiens non terminés ; pas de réouverture.
- Offer : toutes les étapes configurées doivent avoir réussi ; Hired nécessite Offer, décision du propriétaire.
- `[DIA-06 — états/transitions UML simplifiés ; états techniques d’entretien distincts du statut de recrutement]`.

### 22 — Effets métier explicites et inbox interne
- Les effets suivent des causes métier typées : affectation, changement de rendez-vous, retour, échec.
- Transactions actuelles pour les effets liés ; pas de bus d’événements ajouté.
- Inbox : affectation/modification à l’interviewer ; demandes/feedback au créateur et propriétaire, dédupliqués.
- Conservation : suppression sept jours après première lecture ; jamais des messages non lus ni des dossiers métier.
- Pas de chat, de calendrier synchronisé ni de notification métier candidate à ce stade.

## E — Fonctionnalités et validation

### 23 — Fonctionnalités : publier et recevoir
- Accès email/mot de passe ; inscription candidate et vérification ponctuelle.
- Configuration d’offres et formulaires ; dépôt avec documents privés.
- Candidat : consulter ses dépôts ; réponses/fichiers non modifiables après soumission.
- Données persistées ; comptes et documents synthétiques pour les scénarios de démonstration.
- `[CAP-01 facultative — capture réelle et anonymisée d’une offre/formulaire ; aucune capture fabriquée]`.

### 24 — Fonctionnalités : exploiter et suivre
- Liste RH : filtrer/trier, repérer le statut interne, les erreurs et corrections.
- Dossier : consulter documents, résultats fixture identifiés et corrections effectives.
- Export CSV ; présélection manuelle.
- Agenda, planification, feedback assigné, decisions internes et inbox.
- `[CAP-02 facultative — capture réelle et anonymisée d’un dossier ou agenda ; libellés fixture visibles]`.

### 25 — Résultats et vérifications à ce stade
- Chaîne fonctionnelle persistante implémentée, avec intégrations remplaçables.
- Dernier checkpoint documenté : **66 tests ordinaires, dont 26 DOM**, build/typecheck, contrôles réels processing et interviews [I1].
- Scénarios d’intégration : droits/propriété, conflits horaires et concurrence, documents assignés, Fail terminal, rétention.
- Des retours manuels ont entraîné des ajustements ; la dernière retouche UX n’a pas été retestée manuellement.
- Aucun taux d’extraction, gain de temps ni qualité UX globale validés ; prototype, pas validation de production.

### 26 — Démonstration courte ou scénario illustré
- Objectif : montrer la continuité du dossier, pas parcourir chaque bouton.
- Offre/dépôt synthétique → dossier RH → fixture identifiée/correction → export.
- Agenda et affectation possibles en seconde étape, seulement si le temps le permet.
- Feedback indisponible avant le début prévu ; ne pas improviser un résultat d’entretien ni modifier des données manuelles pour la démo.
- `[TODO : choisir le dossier, répéter le parcours et prévoir une alternative avec captures réelles]`.
- Démo facultative ; ne pas faire dépendre la présentation d’une IA non intégrée.

## F — Contribution, limites et perspectives

### 27 — Relation avec les ODD : contribution potentielle
- **ODD 8**, notamment cible 8.5 : emploi productif et travail décent [S5].
- Contribution envisagée : mieux organiser l’accès aux candidatures et le travail de coordination RH.
- Dimension sociale : décisions humaines, droits d’accès et informations traçables ; cela ne prouve pas l’absence de biais.
- Dimension environnementale : dématérialisation possible, mais coût numérique/IA non mesuré ; pas de bénéfice net revendiqué.
- ODD 9 secondaire si utile : infrastructure numérique ; éviter une liste d’ODD décorative.
- Visuel sobre avec icône officielle ODD 8 à sourcer plus tard ; une seule diapositive.

### 28 — Limites actuelles : socle vérifié, usage à consolider
- Extraction réelle et lecture automatique des documents non intégrées.
- UX encore à revoir : navigation, composants chargés, actions peu intuitives et cohérence des permissions visibles.
- Backend/frontend disposent de tests, mais couverture complète, utilisabilité et exploitabilité en production non démontrées.
- Refactorisation ciblée à examiner, sans affirmer une dette mesurée ; clarifier rôles versus capacités.
- Réimport CSV, publication candidate, calendrier et notifications externes différés.
- Formulation proposée : **« le flux central existe ; la qualité d’usage et la validation de l’extraction constituent les prochains checkpoints »**.

### 29 — Prochain checkpoint : intégration et évaluation
- Priorité à confirmer : revue UX/capacités + lecteur de documents borné + premier exécuteur réel.
- Comparer quelques solutions sur **le même corpus**, avec résultats attendus relus humainement.
- Corpus à constituer : CV synthétiques diversifiés, formats/langues/presentations, absence de compétence et documents difficiles ; données réelles seulement avec autorisation.
- Mesurer par tâche : précision/rappel, preuves correctes, erreurs/abstentions, latence et coût.
- Comparer à une baseline simple ; conserver modèles/versions et conditions d’essai.
- `[TODO : corpus, protocole, taille et seuils d’acceptation à convenir ; aucun résultat disponible]`.

### 30 — Conclusion : acquis, valeur et travail restant
- Atteint à ce stade : socle persistant, flux RH/interview interne, séparation des responsabilités.
- Architecture mise en œuvre et vérifiée sur les scénarios documentés, pas validée pour la production.
- Valeur actuelle : centralisation du dossier et enchaînement explicite des actions ; accélération attendue, non mesurée.
- Reste à démontrer : qualité d’usage et valeur de l’extraction réelle.
- À discuter avec l’encadrant : prochain checkpoint et protocole de validation ; questions.

## Arbitrages pour la prochaine relecture
- Confirmer langue, durée, titre et contexte terrain ; 30 diapositives peuvent demander une narration très concise.
- Accepter/fusionner les sections ; si besoin de réduire, fusionner 05–06, 08–09, 23–24 plutôt que masquer les limites.
- Confirmer le nom de la démarche sans fabriquer de pratiques de gestion de projet.
- Choisir une démo courte ou des captures réelles ; pas d’automatisation navigateur autorisée.
- Valider les six schémas avant dessin : flux, cas d’utilisation, classes, architecture, séquence, états. Les vues non UML restent explicitement telles.
- Aucun besoin d’image générée pour cette première version ; une illustration de contexte serait optionnelle, sans valeur de preuve.
- Le deck Reveal et le PDF Typst restent des placeholders jusqu’à validation des points.

## Références externes — contexte, pas résultats du projet

Consultation : 11 octobre 2026. Ajouter les références courtes en pied des slides concernées et les détails aux notes/annexes lors de l’assemblage.

- **S1 — Ashby**, *Recruiter Productivity | 2026 Talent Trends Report*, 28 avril 2026 : https://www.ashbyhq.com/talent-trends-report/reports/2023-recruiter-productivity-trends-report . Analyse annoncée de 109 millions de candidatures et 247 000 postes, janvier 2021–mars 2026. Jeu de données de l’éditeur ; pas un échantillon universel ni une étude de notre entreprise. Ne pas confondre candidatures/embauche avec candidatures/offre.
- **S2 — HR Dive**, *Eye tracking study shows recruiters look at resumes for 7 seconds*, 8 novembre 2018 : https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/ . Source secondaire sur Ladders, moyenne annoncée de 7,4 secondes au premier examen. Ancienne étude commerciale ; protocole primaire à examiner avant d’en tirer des conclusions fortes. PDF primaire trouvé mais accès HTTP 403 : https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf .
- **S3 — Greenhouse**, fonctions d’entretien/décision : https://www.greenhouse.com/interviewing-decision-making . Documentation commerciale consultée, pas test indépendant ni évaluation exhaustive.
- **S4 — Workable**, catalogue de fonctions : https://www.workable.com/features . Documentation commerciale ; produit plus large que le périmètre recrutement retenu.
- **S5 — Nations unies**, ODD 8, cible 8.5 : https://sdgs.un.org/goals/goal8 . Un rapprochement thématique ne démontre pas l’atteinte d’une cible.
- **S6 — Textkernel**, fonctions documentées de Parser et Semantic Search & Matching, consultées le 11 octobre 2026 : https://www.textkernel.com/products-solutions/parser/ et https://www.textkernel.com/learn-support/blog/semantic-search-advanced-matching/ . Extraction/structuration des CV, normalisation des compétences, recherche sémantique et APIs intégrables. Documentation commerciale, pas test indépendant ; aucune performance fournisseur reprise comme résultat du projet. Recherche sémantique ne suffit pas à qualifier le système de RAG. Cette entrée remplace la comparaison prématurée avec « projet proposé » dans le tableau du draft courant.
- Anecdote des CV contenant des phrases absurdes : récit viral attribué à Jerry Lee repéré, **écarté du chiffrage et des preuves** ; pas de protocole contrôlé permettant de conclure que les recruteurs ne lisent pas les CV.

## Preuves internes — liens à relire avant le draft

- **I1** — [État et vérifications](../docs/status.md).
- **I2** — [Produit](../docs/product.md), [workflows](../docs/workflows.md), [décisions](../docs/decisions.md).
- **I3** — [Offres et révisions](../docs/vacancy-api.md), [dépôt et documents](../docs/application-api.md).
- **I4** — [Traitement, corrections et export](../docs/processing-review-api.md).
- **I5** — [Entretiens, politiques et inbox](../docs/interview-api.md).
- **I6** — [Options IA — recherchées, non sélectionnées](../docs/ai-options.md), [backlog](../docs/backlog.md).
- **I7** — [Workflow CI configuré](../.github/workflows/ci.yml), [tests d’intégration](../docs/integration-testing.md).
- **I8** — [Scénarios et limites de démo](../docs/demo-guide.md).
