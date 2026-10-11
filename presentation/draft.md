# CAP : script de présentation

Révision éditoriale après retour utilisateur. **CAP** est un nom de travail proposé, à confirmer. Les 30 contenus sont conservés, avec six intercalaires de section : **36 pages** au total. La table de correspondance des pages est générée dans `dist/page-map.md`.

Les titres et points ci-dessous sont destinés aux slides. Les notes orales restent dans ce document. Sources externes et preuves internes dans [notes.md](notes.md#références-externes--contexte-pas-résultats-du-projet). Métadonnées de couverture dans `metadata.json`, en attente des valeurs utilisateur.

## 01 — CAP
**Plateforme de gestion du recrutement**

Centralisation des candidatures et coordination du parcours de sélection.

Note orale : présentation d’avancement. Nom proposé, à confirmer ; aucune durée de développement inventée.

## 02 — Contexte : acteurs du recrutement
- **Candidat** : candidature, CV et pièces justificatives.
- **Équipe RH** : examen des dossiers et organisation du recrutement.
- **Responsable de l’offre** : définition du besoin et décisions finales.
- **Interviewer** : évaluation des candidatures qui lui sont confiées.

`[IMG-01 — illustration du travail collectif autour des candidatures]`

Note orale : le responsable est le propriétaire de l’offre, capacité portée par un compte recruteur ou administrateur. Le processus précis de l’entreprise reste à compléter avec l’encadrant.

## 03 — Recrutement : volume et temps de lecture
- **Plus de 300 candidatures par embauche** en moyenne pendant 2025 dans les données Ashby.
- **7,4 secondes au premier examen d’un CV**, selon Ladders, étude de 2018 rapportée par HR Dive.

**Enjeu : une information pertinente, rapidement accessible.**

Note orale : deux sources et périmètres distincts ; premier examen et lecture approfondie sont différents. Ces chiffres ne mesurent ni notre entreprise ni la performance du projet. Sources S1 et S2.

## 04 — Existant : outils et solutions spécialisées
| Approche | Fonctions principales | Point d’attention |
|---|---|---|
| Courriels et tableurs | Collecte, échanges, comparaison manuelle | Coordination répartie entre plusieurs outils |
| ATS : Greenhouse, Workable | Suivi des candidatures, entretiens, évaluations | Paramétrage du parcours et des droits |
| IA spécialisée : Textkernel | Extraction des CV, normalisation des compétences, recherche sémantique | Intégration au SI et qualité à évaluer sur les CV cibles |

Note orale : panorama documentaire des fonctions annoncées, pas benchmark réalisé. Textkernel illustre des briques IA intégrables ; aucune utilisation de RAG n’est déduite de la seule présence de recherche sémantique. Sources S3, S4 et S6. Notre solution est introduite après la problématique.

## 05 — Problématique : efficacité du travail RH
**Comment accélérer l’examen des candidatures et la coordination du recrutement ?**

- **Centralisation** des dossiers et des échanges utiles.
- **Réduction des ressaisies** grâce à des données structurées.
- **Lisibilité du suivi** : étapes, responsabilités et évaluations.

Note orale : objectifs du projet ; réduction du temps de travail encore à mesurer. La préparation des données par IA constitue une piste, à intégrer et évaluer.

## 06 — Solution proposée : périmètre de CAP
- **Déploiement dédié** à une entreprise.
- **Espace candidat** pour le dépôt et la consultation des candidatures.
- **Espace RH** pour la revue, l’export et le suivi des entretiens.
- **Assistance à l’extraction** intégrable au parcours de recrutement.

**Périmètre métier : du dépôt de candidature à la décision de recrutement.**

Note orale : paie et gestion des employés hors périmètre. L’extraction est aujourd’hui simulée ; son intégration réelle fait partie du backlog. Les étapes internes ne sont pas encore publiées au candidat.

## 07 — Besoins fonctionnels : gestion des candidatures
- **BF1 : gestion des accès** et des comptes candidats/personnel.
- **BF2 : configuration des offres**, formulaires et documents attendus.
- **BF3 : dépôt et consultation** des candidatures et pièces jointes.
- **BF4 : exploitation des dossiers**, résultats d’extraction, corrections RH et export.

Note orale : les identifiants BF sont des repères de présentation. BF4 est implémenté avec résultats simulés ; le lecteur documentaire et l’exécuteur IA restent à intégrer.

## 08 — Besoins fonctionnels : suivi du recrutement
- **BF5 : présélection** et définition du parcours d’entretien.
- **BF6 : planification** des rendez-vous et affectation des interviewers.
- **BF7 : évaluations** et enregistrement des décisions internes.
- **BF8 : notifications internes** aux intervenants concernés.

Note orale : le réimport et la publication des progrès au candidat sont différés. Le responsable de l’offre garde les décisions Offer/Hired.

## 09 — Besoins non fonctionnels : qualité du système
- **Confidentialité** : accès aux dossiers selon le rôle, la propriété et l’assignation.
- **Intégrité** : dépôts conservés, règles métier et opérations cohérentes.
- **Maintenabilité** : modules, contrats partagés et tests automatisés.
- **Évolutivité** : intégrations mail et extraction remplaçables.
- **Utilisabilité** : actions lisibles et parcours adaptés aux intervenants.

Note orale : exigences visées, avec des réponses déjà implémentées pour les accès, l’intégrité et la modularité. L’UX nécessite une revue ; performance, accessibilité et exploitation en production n’ont pas de seuil validé à ce stade.

## 10 — Méthodologie : développement itératif
- **Cadrage** : scénarios métier et périmètre du checkpoint.
- **Backend** : contrats API, persistance et règles de gestion.
- **Interface** : intégration des parcours et retours manuels.
- **Validation** : tests, corrections et mise à jour de la documentation.

**Progression : accès → candidatures → revue RH → entretiens.**

Note orale : organisation par checkpoints inspirée Kanban ; appellation à convenir avec l’encadrant. Aucun sprint ou rituel Scrum fictif. Le suivi existe dans le statut, les décisions et le backlog.

## 11 — Conception fonctionnelle : cas d’utilisation
`[DIA-02 — cas d’utilisation UML]`

**Droits adaptés au dossier : rôle, propriété de l’offre et assignation à l’entretien.**

Note orale : diagramme volontairement centré sur les actions majeures. Propriétaire = capacité d’un compte RH/admin ; feedback réservé à l’interviewer assigné, y compris lorsqu’il possède aussi un rôle RH/admin. Aucun rôle propriétaire distinct.

## 12 — Conception fonctionnelle : modèle de données
`[DIA-03 — classes UML conceptuelles]`

**La candidature relie les documents, l’extraction, les corrections et les entretiens.**

Note orale : vue conceptuelle simplifiée, pas reproduction exhaustive des tables. Définition de formulaire et de traitement figée au dépôt. Les corrections sont séparées des résultats originaux ; elles ne constituent pas un historique complet de révisions.

## 13 — Conception technique : architecture
`[DIA-04 — architecture modulaire et interfaces d’intégration]`

**React / Vite · NestJS / TypeScript · PostgreSQL · Monorepo pnpm**

Note orale : documents privés stockés localement ; accès via API. Mail et extraction derrière des ports dédiés. Traitement actuel par fixtures, déclenché explicitement ; lecteur documentaire réel et provider IA à intégrer. Le schéma distingue cette extension future.

## 14 — Conception : choix structurants
- **Dépôt immuable** : conservation des réponses et fichiers d’origine.
- **Corrections séparées** : enrichissement du dossier par les RH.
- **Autorisations contextuelles** : rôle complété par la propriété et l’assignation.
- **États distincts** : traitement, revue et progression du recrutement.

**Un dossier stable et des responsabilités identifiables à chaque étape.**

Note orale : extraction et revue n’autorisent aucune acceptation automatique. Les contrôles portent sur les actions backend, pas seulement la visibilité des boutons.

## 15 — Réalisation : accès et espaces de travail
- **Authentification** par email et mot de passe.
- **Inscription candidate** avec vérification de l’adresse email.
- **Comptes internes** pour les RH et les interviewers.
- **Récupération d’accès** par code de réinitialisation.

Note orale : les comptes du personnel sont provisionnés en interne. Capture de connexion non nécessaire : privilégier les écrans qui montrent la valeur métier.

## 16 — Réalisation : configuration des offres
- **Formulaire adaptable** au poste et aux informations attendues.
- **Documents requis ou facultatifs**, avec contraintes de dépôt.
- **Tâches d’extraction** associées aux documents sources.
- **Parcours d’entretien** défini par le propriétaire de l’offre.

`[CAP-02 — formulaire de configuration d’une offre]`

Note orale : les champs/formats disponibles correspondent aux presets implémentés. L’offre publiée est verrouillée ; les étapes d’entretien se figent dès la première instance. Capture réelle à fournir, sans faux écran généré.

## 17 — Réalisation : dépôt d’une candidature
- **Formulaire candidat** et pièces jointes dans un même parcours.
- **Contrôles serveur** sur les données et contraintes de dépôt.
- **Conservation du dossier** après soumission.
- **Consultation personnelle** des candidatures déposées.

`[CAP-03 — formulaire candidat ou confirmation de dépôt]`

Note orale : réponses/fichiers non modifiables après soumission. La confirmation affiche la réception, sans publier les décisions RH internes.

## 18 — Réalisation : consultation des dossiers
- **Vue RH partagée** avec filtres et tri.
- **Accès aux documents privés** depuis la candidature.
- **Repères de suivi** : progression, traitement et corrections.
- **Comparaison facilitée** par la centralisation des informations.

`[CAP-04 — liste RH et aperçu d’un dossier]`

Note orale : comparaison humaine ; aucun classement automatique des candidats. Afficher uniquement des données synthétiques et conserver les libellés fixture lorsqu’ils sont présents.

## 19 — Extraction : organisation par tâches
- **Source** : document joint à la candidature.
- **Consigne** : compétences recherchées et paramètres définis dans l’offre.
- **Sortie** : résultat structuré, état et provenance.
- **Suivi** : erreurs et reprises gérées au niveau du traitement.

**Contrat de traitement implémenté ; extraction réelle à intégrer.**

Note orale : exemple actuel extractSkills ; pas de scoring global d’employabilité. Les ports DocumentTextReader/TaskExecutor sont séparés ; les fixtures permettent de vérifier le relais et le stockage.

## 20 — Extraction : stratégie de simulation
- **Fixtures déterministes** : succès, erreur et résultat vide.
- **Scénarios reproductibles** pour la revue et les corrections RH.
- **Vérification du traitement** : exécution, persistance et récupération.
- **Intégration progressive** d’un lecteur documentaire et d’un fournisseur IA.

**Objectif actuel : fiabilisation du parcours avant l’évaluation de l’extraction.**

Note orale : fixture = donnée de test, pas analyse sémantique du CV. Le succès utilise les compétences configurées. Aucun taux de précision ni gain de temps mesuré ; pas de traitement automatique lancé en arrière-plan.

## 21 — Réalisation : revue et correction RH
- **Lecture conjointe** du document et des résultats disponibles.
- **Correction RH** visible dans la valeur effective.
- **Résultat original conservé**, y compris en cas d’erreur.
- **Revue partagée** entre les membres de l’équipe RH.

`[CAP-05 — document, résultat fixture et correction RH]`

Note orale : absence de tâches = absence de revue à effectuer ; ce marqueur ne vaut pas présélection. Les dernières corrections sont affichées, sans navigateur d’historique fictif.

## 22 — Réalisation : export et analyse externe
- **Export CSV** des candidatures et informations de revue.
- **Valeurs originales et corrigées** disponibles pour l’analyse.
- **Export à tout moment**, indépendamment de l’avancement de la revue.
- **Présélection manuelle** dans l’application.

**Évolution prévue : réimport contrôlé d’une sélection de décisions.**

Note orale : réimport non livré. Identifiants stables, aperçu, erreurs, doublons et atomicité à définir avant implémentation. Les filtres de liste ne restreignent pas l’export actuel.

## 23 — Réalisation : organisation des entretiens
- **Étapes ordonnées** pour chaque offre.
- **Agenda partagé** et affectation des interviewers.
- **Créneaux, durée et fuseau horaire** explicites.
- **Détection des chevauchements** et replanification.

`[CAP-06 — agenda et détail d’un rendez-vous]`

Note orale : créneaux par demi-heure ; pas de synchronisation calendrier. Une instance par candidature/étape ; pas de retries d’entretien.

## 24 — Réalisation : évaluations et décisions
- **Retour de l’interviewer** : notes, Pass/Fail et score facultatif sur 10.
- **Échec terminal** : clôture de la candidature et annulation des entretiens restants.
- **Proposition d’embauche** : après réussite du parcours configuré.
- **Embauche confirmée** : décision finale du propriétaire de l’offre.

**Évaluations centralisées et règles de progression explicites.**

Note orale : le score n’est pas un seuil automatique ; seul l’assigné soumet le retour, après le début prévu. Offer/Hired réservés au propriétaire, sans override administrateur. États Hired/Not selected finaux.

## 25 — Réalisation : notifications internes
- **Affectation et changement de rendez-vous** signalés à l’interviewer.
- **Demande de replanification et feedback** transmis aux responsables concernés.
- **Boîte de réception individuelle** avec statut lu/non lu.
- **Conservation des dossiers métier** indépendante des notifications.

Note orale : créateur/propriétaire destinataires des demandes et feedback, dédupliqués. Pas de copie systématique au propriétaire pour les réservations ; pas de publication candidate. Suppression des messages sept jours après première lecture, jamais des non-lus.

## 26 — Validation : résultats du checkpoint
- **66 tests automatisés**, dont **26 tests DOM**, au dernier checkpoint.
- **Vérifications d’intégration** sur PostgreSQL et les parcours API.
- **Scénarios sensibles** : droits, conflits horaires, concurrence et décisions terminales.
- **Outillage qualité** : build, contrôle de types, CI configurée et documentation API.

**Parcours central implémenté et vérifié sur les scénarios retenus.**

Note orale : contrôles locaux processing/interviews séparés de la CI ; aucune exécution distante revendiquée. La dernière retouche UX n’a pas été retestée manuellement. L’évaluation de l’extraction réelle et de l’utilisabilité reste à mener. Sources I1 et I7.

## 27 — Démonstration : parcours d’une candidature
- **Dépôt** d’une candidature synthétique.
- **Examen RH**, résultat simulé et correction.
- **Export CSV** du dossier exploitable.
- **Planification** d’un entretien dans l’agenda.

**Fil conducteur : continuité du dossier entre les intervenants.**

Note orale : choisir/répéter un chemin court ; alternative avec les captures réelles des slides précédentes. Aucun faux retour d’entretien ; l’heure prévue conditionne sa saisie. Pas de dépendance à une IA live.

## 28 — ODD 8 : travail décent et croissance économique
- **Organisation du recrutement** : information centralisée et responsabilités explicites.
- **Dimension sociale** : examen humain des candidatures et accès maîtrisé aux données.
- **Dimension environnementale** : dématérialisation des échanges, bilan numérique à évaluer.

**Contribution envisagée : de meilleures conditions de traitement des candidatures.**

Note orale : rapprochement avec la cible 8.5, sans impact démontré sur l’emploi, l’équité ou l’environnement. Icône officielle facultative ; ne pas la faire générer par un modèle. Source S5.

## 29 — Bilan d’avancement et backlog
Le parcours central couvre désormais le **dépôt**, la **revue RH** et les **entretiens**, avec des données persistantes et des accès contrôlés.

Le prochain chantier associe **simplification de l’UX**, **clarification des rôles et capacités** et **refactorisation ciblée**. L’intégration de l’extraction réelle sera accompagnée d’une comparaison de solutions sur un **corpus de CV relu humainement**.

Le **réimport de décisions** et la **visibilité du suivi pour le candidat** complètent le backlog fonctionnel.

Note orale : backlog à prioriser avec l’encadrant, sans échéances promises. Protocole envisagé : précision/rappel par tâche, qualité des preuves, taux d’erreur, coût et latence. Corpus et seuils d’acceptation à convenir ; pas de résultats déjà obtenus.

## 30 — Conclusion : apports du projet
- **Dossier centralisé**, du dépôt jusqu’aux évaluations internes.
- **Coordination RH structurée**, avec des responsabilités et décisions explicites.
- **Architecture modulaire**, préparée à l’intégration de l’extraction.

**Prochaine étape : consolidation de l’usage et évaluation de l’assistance IA.**

Note orale : la valeur actuelle tient à la centralisation et au suivi ; l’accélération attendue sera mesurée lors de l’évaluation. Discussion avec l’encadrant sur les priorités.

## Notes d’édition
- Titres nominaux, termes métier mis en évidence, labels BF avec deux-points.
- Petits repères de section entre crochets et soulignement, espacés du titre.
- Trois diagrammes rendus à partir de code ; sources Mermaid pour classes/architecture et DOT pour le rendu local sans navigateur.
- Visuels externes : une illustration de contexte facultative ; cinq captures produit à fournir manuellement. Voir assets/requests.md pour pages/noms/prompts.
- Métadonnées, nom CAP et visuels externes restent à confirmer. Cette version assemblée permet la relecture ; les anciennes notes décrivent des propositions antérieures.
