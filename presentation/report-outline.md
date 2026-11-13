# Proposition de plan du rapport technique PFE

## Statut et intention éditoriale

Plan proposé le 13 novembre 2026, à valider avec l’encadrant ; **ce n’est ni un rapport rédigé, ni un modèle imposé par l’établissement**. Le nom CAP et les métadonnées académiques restent à confirmer. Les volumes ci-dessous sont indicatifs, sans exigence universitaire déduite des exemples.

Fil directeur : **concevoir une plateforme générale de recrutement, déployée pour une entreprise, avec une coordination minimale entre RH, propriétaire de l’offre et interviewer ; proposer une assistance IA facultative sans lui confier les décisions**. Le recrutement doit rester utilisable sans extraction. Les CSV permettent de travailler dans Excel ou d’alimenter un traitement externe, éventuellement une IA, uniquement dans un contexte de données et de destinataires autorisé ; ce n’est pas un connecteur IA intégré.

Écrire chaque chapitre selon la progression « besoin → options → choix justifié → mécanisme réalisé → preuve disponible → limite ». Séparer systématiquement comportement implémenté, observation datée, intention produit et perspective. Ne pas transformer un problème plausible en pratique effectivement observée dans l’entreprise.

## 1. Lecture de l’exemple fourni et adaptations

Source locale : `/home/ubuntu/Downloads/Example de format de rapport PFE_Report_Final .pdf`, **89 pages physiques** d’après l’extraction native locale avec `pdf-inspector`. Lecture textuelle seulement : aucune rasterisation, interprétation d’image, navigation web ou installation. Les références suivantes sont les **numéros imprimés indiqués dans la table des matières et les listes**, et non les positions du lecteur PDF. Les éléments uniquement graphiques n’ont pas été interprétés.

Le document porte sur les réseaux IoT, SDN/NFV et l’apprentissage distribué, sans lien métier avec le recrutement. Son établissement, son laboratoire, ses publications, ses simulations et sa durée de stage ne décrivent pas notre projet. Sa forme inspire l’enchaînement argumentatif, pas un gabarit institutionnel.

| Intitulé effectivement extrait | Référence imprimée | Inspiration utile pour notre rapport |
|---|---|---|
| `General Introduction` | p. 1 | Problème, objectif, contributions et annonce du plan |
| Chapitre 1 — `Project Framework` | p. 3 | Cadre du projet distinct de la technique |
| `Host institution`, `Project context`, `Work methodology and timeline` | p. 3, 5, 6 | Présenter le contexte confirmé et une démarche étayée ; aucun calendrier ni sprint à inventer |
| Chapitre 2 — `Background` | p. 9 | Introduire seulement les notions nécessaires à la compréhension des choix |
| `Internet of Things`, `Network softwarization`, `Machine Learning` | p. 10, 12, 17 | Organisation en familles conceptuelles ; leur contenu n’est pas transférable |
| Chapitre 3 — `Literature Review of Intelligent Network Softwarization for IoT` | p. 24 | Distinguer panorama documentaire et contribution propre |
| `Related surveys`, `Literature review`, `Discussion and future directions` | p. 25, 28, 35 | Comparer puis discuter les compromis, au lieu de juxtaposer des logos |
| Chapitre 4 — `Intelligent Distributed Network Softwarization for IoT` | p. 41 | Détailler la solution après les besoins et les alternatives |
| `Proposed architecture`, `Routing optimization in softwarized IoT` | p. 42, 44 | Séparer architecture globale et mécanisme technique principal |
| `Solution overview`, `Problem formulation`, `Description of the DRL part`, `Design of the FDRL routing` | p. 44, 46, 46, 48 | Passer de la vue d’ensemble aux contraintes et au fonctionnement ; ne pas inventer une formulation mathématique sans utilité métier |
| Chapitre 5 — `Simulation and Performance Evaluation` | p. 52 | Réserver un chapitre autonome aux preuves et à leurs limites |
| `Simulation environment`, `Metrics presentation`, `Results and discussion` | p. 53, 54, 56 | Définir environnement et métriques avant les résultats ; notre projet n’a pas ces résultats de simulation |
| `Conclusion and Perspectives`, `Bibliography` | Après le chapitre 5 ; bibliographie p. 64 | Bilan séparé des travaux futurs ; le numéro de la conclusion n’est pas lisible dans la table extraite |

Autres éléments réellement présents : dédicace, remerciements, `Abstract` p. i, `Résumé` p. ii, sommaire p. iii–v, figures p. vi–vii, tableaux p. viii, acronymes p. ix–xi et publications p. xii. Leur ordre et leur nécessité doivent être confirmés par l’établissement ; ne pas ajouter une liste de publications inexistantes.

Exemples de comparaison dans ce rapport : tableau 4.1 `Comparison of SPR, DRL, and FDRL Routing Approaches` p. 45 ; tableau 5.1 `Comparison of NS3, OMNeT++, and Mininet` p. 53 ; tableau 5.2 `Comparison of Floodlight, POX, and Ryu` p. 54 ; tableau 5.3 `Summary of Considered Metrics` p. 55. Retenir le principe « critères explicites → arbitrage → évaluation », **pas leurs critères réseau ni leurs conclusions de supériorité**.

Adaptation : remplacer les longs rappels IoT/ML par un état de l’art ciblé et une analyse du besoin ; donner davantage de place aux contrats, à la confidentialité, à la concurrence et au contrôle humain. Pas de chapitre d’entraînement de modèle : le projet intègre une extraction structurée, sans entraînement propre démontré.

## 2. Plan détaillé et répartition indicative

Objectif de travail : environ **70–84 pages de corps principal**, introduction et conclusion incluses ; les préliminaires, références et annexes sont comptés à part. Ajuster à la consigne réelle et à la matière disponible, sans remplissage. Les bornes de la table s’additionnent ; aucune pagination finale n’est fixée ici.

| Partie | Volume indicatif | Question à résoudre |
|---|---:|---|
| Introduction générale | 2–3 p. | Quel problème traite le projet et quelle contribution défend-il ? |
| 1. Cadre, objectifs et démarche | 5–6 p. | Pour qui et dans quel périmètre ? |
| 2. Analyse des besoins et étude des solutions | 9–10 p. | Quels besoins et quels compromis motivent la solution ? |
| 3. Conception métier, données et garanties | 12–14 p. | Quelles règles doivent rester vraies ? |
| 4. Architecture et réalisation de la plateforme | 12–14 p. | Comment ces règles sont-elles portées par le logiciel ? |
| 5. Assistance documentaire facultative et contrôle humain | 16–19 p. | Comment extraire sans confondre suggestion, preuve et décision ? |
| 6. Vérification, démonstration et discussion critique | 11–14 p. | Qu’est-ce qui est réellement établi et que reste-t-il à vérifier ? |
| Conclusion générale et perspectives | 3–4 p. | Quel bilan proportionné aux preuves ? |

Préliminaires proposés : couverture validée, remerciements facultatifs, résumé français/abstract et mots-clés, sommaire, listes utiles de figures/tableaux, glossaire limité au vocabulaire employé. Références : environ 3–5 p. selon les sources réellement citées ; annexes : environ 8–15 p. utiles et référencées, sans dump de code ni données privées.

### Introduction générale

- Problématique : centraliser le parcours de recrutement tout en conservant la responsabilité humaine et la confidentialité des dossiers.
- Objectifs fonctionnels, techniques et limites du prototype ; IA facultative, pas de classement automatique.
- Contributions annoncées : coordination sobre, configurations figées, garanties transactionnelles, extraction structurée révisable et interopérabilité CSV.
- Nature des preuves disponibles et annonce du plan ; pas de promesse de gain de temps ou de qualité mesurée.

### Chapitre 1 — Cadre, objectifs et démarche

1.1. Organisme d’accueil et cadre du PFE : uniquement informations validées ; distinguer commanditaire, utilisateur cible et utilisateur effectivement consulté.

1.2. Périmètre : une entreprise par déploiement ; ni marketplace, multi-tenancy SaaS, paie ou gestion complète des salariés.

1.3. Acteurs et coordination minimale : candidat, RH partagés, propriétaire d’offre, interviewer affecté ; absence de mécanisme de réservation/débat/attribution de revue RH.

1.4. Démarche réellement traçable : cadrage, choix documentés, développement incrémental, checkpoints de vérification et retours utilisateur identifiés. Le journal n’est pas une preuve d’une méthode Scrum appliquée.

1.5. Livrables, contraintes et critères de réussite : sources, contrats, interface, démonstration synthétique et documentation ; distinguer réalisation de l’acceptation finale.

### Chapitre 2 — Analyse des besoins et étude des solutions

2.1. Parcours attendu : offre → dépôt → examen/présélection → entretiens éventuels → proposition explicite → embauche séparée.

2.2. Besoins fonctionnels et matrice acteur/action/contexte ; propriétaire et RH ne sont pas interchangeables. Les capacités de l’interface ne remplacent pas l’autorisation serveur.

2.3. Exigences non fonctionnelles : accès privé, intégrité, conflits de modifications, dépôt non bloquant, indisponibilité de l’IA, maîtrise des dépenses, lisibilité et portabilité.

2.4. Panorama raisonné : ATS, parseurs de CV spécialisés, tableurs et traitements externes. Les pages commerciales Greenhouse, Workable et Textkernel déjà citées dans [notes.md](notes.md) illustrent des catégories, pas un audit comparatif ni la preuve d’un manque universel.

2.5. Comparaison des alternatives techniques selon la grille de la section 3 ci-dessous ; distinguer choix réalisés et possibilités de migration.

2.6. Synthèse : besoins → choix retenus → fonctionnalités livrées → critères/preuves à documenter. Prévoir une table de traçabilité plutôt qu’une liste promotionnelle d’outils.

### Chapitre 3 — Conception métier, données et garanties

3.1. Cas d’utilisation et frontière du système ; parcours sans extraction et avec assistance facultative.

3.2. Modèle conceptuel : offre, formulaire et plan d’entretien, candidature, document, tâche, question/correction, rendez-vous et notification ; compléter le modèle conceptuel par les contraintes utiles, pas toutes les colonnes.

3.3. Configurations et instantanés : publication contrôlant deux révisions indépendantes, gel des plans vides/non vides, date UTC de première publication et définition figée au dépôt ; pas d’historique complet déduit des compteurs.

3.4. Trois dimensions indépendantes : traitement, revue, recrutement. Cas sans tâches ; présélection possible sans achèvement de revue ; clôture des dépôts distincte de la fin des recrutements.

3.5. Autorité et projections privées : éligibilité de rôle, propriété/affectation et état courant ; réponses autorisées candidat/interviewer/RH, accès documentaire contextualisé.

3.6. Cohérence : transactions, ordre de verrouillage, unicité de dépôt, révisions séparées, conflit explicite et absence de fusion automatique ; montrer un scénario concurrent et sa règle attendue, sans le présenter comme exécuté.

3.7. Décisions et effets : présélection/rejet RH, Pass/Fail de l’interviewer, prérequis de proposition propriétaire, embauche distincte ; notices transactionnelles réellement présentes et effets non implémentés.

### Chapitre 4 — Architecture et réalisation de la plateforme

4.1. Monorepo pnpm : React/Vite, NestJS et domaine TypeScript/Zod partagé ; responsabilités de validation à l’exécution et de typage statique.

4.2. Organisation modulaire du monolithe : politiques métier contextualisées, services, accès SQL via DatabaseService et frontières effectivement présentes ; éviter de prétendre à une architecture « pure » que le code ne suit pas partout.

4.3. Persistance relationnelle/JSONB et stockage privé : clés, contraintes, snapshots, références opaques, contrôle d’intégrité et compensation fichier/transaction ; risques d’orphelins et absence de réconciliation globale.

4.4. Ports et adaptateurs : documents, mail, lecture PDF, exécution de tâches et passerelle fournisseur ; mail local capturé distinct d’une délivrabilité réelle démontrée.

4.5. Réalisation des parcours : auteur d’offre, dépôt immuable, revue partagée, agenda d’entretiens et décisions explicites ; quelques extraits de contrats et séquences plutôt qu’un tutoriel écran par écran.

4.6. CSV et aller-retour de présélection : export diagnostic versus export compact à valeurs effectives ; identité, filtres factuels, groupement des propositions, résolution des divergences et confirmation finale atomique. L’import de décision n’écrit pas de corrections d’extraction.

4.7. Interface et conflits : inspection/édition autorisée, dialogues ciblés, brouillons locaux, navigation protégée, rafraîchir/réappliquer explicitement. Distinguer comportement de source, vérification DOM historique et comportement natif restant à vérifier.

4.8. Déploiement local reproductible : migrations, modes désactivé/fixture/offline-demo/Jev et jeu synthétique ; ne pas publier chemins sensibles, comptes, clés ou instructions permettant de contourner les garde-fous.

### Chapitre 5 — Assistance documentaire facultative et contrôle humain

5.1. Place limitée de l’IA : répondre à des questions documentaires configurées, non mesurer la compétence réelle ni recommander automatiquement une embauche.

5.2. PDF natif → Markdown : parseur isolé en processus enfant, bornes opérationnelles, diagnostics d’encodage/mise en page, rejet explicite du texte inexploitable ; DOCX accepté au dépôt ne signifie pas parsing DOCX, aucun OCR/vision de secours.

5.3. Définition des cinq familles : formation, certification, expérience, couverture de liste et preuve individuelle de compétence. Détailler portée, alias directionnels, valeurs disponibles/inconnues, fenêtre relative à la publication et limites sémantiques ; une mention de diplôme n’en prouve pas l’obtention.

5.4. Contrat structuré et validation : une requête multi-question par extracteur configuré, pas un appel par famille ; correspondance des identifiants, catégories et réponses complètes. Une réponse mal formée ne devient pas un faux/zéro/non-mention.

5.5. Exécution asynchrone : commit du dépôt, signal mémoire borné, scans DB périodiques, leases et jetons ; traitement hors requête HTTP et absence de système générique de workflow.

5.6. Frugalité et sûreté économique : texte natif sur CPU local plutôt qu’images par défaut, regroupement des questions, cache de parsing et cache de réponse validée indexés sur leurs entrées effectives, succès non rejoués vers le fournisseur. Expliquer les facteurs de coût et de latence ; reprendre si utile le [modèle chiffré hypothétique](cost-model.md) dans un encadré distinct des observations. Aucune accélération ou économie mesurée n’en découle automatiquement.

5.7. Passerelle et reprise prudente : admissions bornées, secret en RAM et chargé par l’utilisateur, registre durable de tentative, réponse mise en cache avant règlement DB, récupération locale seulement si cache valide ; envoi ambigu ou cache perdu ne justifie jamais un nouvel envoi payant. Les garanties de source restent à confirmer en conditions réelles de panne/concurrence.

5.8. Résultat brut/original, correction indépendante et valeur effective : auteur/date, distinction absence/null/retrait, priorité explicite de correction, provenance des exports ; ni réécriture de la source ni journal d’audit intégral.

5.9. Préparation de la revue, libération manuelle et clôtures : ne pas convertir une erreur opérationnelle en succès ; empêcher les écritures tardives après libération, revue terminée ou présélection/rejet. Clôture logique et annulation de facturation sont distinctes.

5.10. Limites et contexte d’autorisation : CV privés, transfert externe conditionnel, fournisseur indisponible, vocabulaire/document incomplet, confiance non calibrée ; activation locale synthétique délimitée distincte d’une autorisation de production ou sur des CV réels.

### Chapitre 6 — Vérification, démonstration et discussion critique

6.1. Méthode de lecture des preuves : version/date, périmètre, environnement, résultat, limite et artefact source ; builds, modèles, DOM, DB/HTTP, usage manuel et qualité IA ne sont pas interchangeables.

6.2. Vérifications historiques : sélectionner les checkpoints utiles de [status.md](../docs/current/status.md), sans additionner les nombres de tests successifs ni annoncer une couverture actuelle globale. Aucun nouveau test n’est autorisé par ce plan.

6.3. Démonstration synthétique : cinq offres/25 scénarios du catalogue de cycle de vie ; distinguer état présemé, transition réellement parcourue, parsing natif, réponse fixture, observation fournisseur et correction humaine.

6.4. Retours utilisateur datés et vérification partielle : conserver leurs résultats positifs avec leurs bornes, sans requalifier un chemin déclaré en preuve de confidentialité ou de concurrence.

6.5. Évaluation proposée, non exécutée : annotations humaines indépendantes par question, désaccords, cas inconnus/échecs, variantes de mise en page groupées par identité, jeu tenu à l’écart du réglage ; métriques de validité structurelle et de justesse sémantique séparées.

6.6. Protocole futur de coût/latence : séparer dépôt HTTP, attente, parsing, cache, admission, fournisseur et persistance ; distinguer cache froid/chaud, temps fournisseur/total et usage observé/coût dérivé. Toute collecte réelle nécessite un périmètre et un consentement propres ; aucun chiffre inventé ni appel pour compléter ce rapport.

6.7. Menaces à la validité : corpus synthétique et restreint, variantes corrélées, observations exploratoires anciennes, questions évaluées différentes des formulations actuelles, absence de benchmark représentatif intégré et QA restante.

6.8. Bilan critique : résultat fonctionnel de source, préparation locale observée et acceptation restante ; prioriser les vérifications et limites plutôt que conclure à une supériorité générale.

### Conclusion générale et perspectives

- Répondre aux objectifs initiaux avec un tableau synthétique « réalisé / observé / encore à vérifier ».
- Souligner plateforme de recrutement et responsabilité humaine avant le sous-système IA.
- Limites actuelles, puis perspectives séparées : QA réelle, évaluation documentée, exploitation/retention des caches, OCR seulement si besoin démontré, intégrations futures sous autorisation. Ne pas requalifier une QA pendante en fonctionnalité absente.
- Aucun gain de temps, précision, équité, conformité réglementaire ou effet environnemental établi sans preuve adaptée.

### Annexes proposées

A. Matrice détaillée des actions et transitions ; B. Extraits de contrats de publication/revue/CSV ; C. Dictionnaire des cinq familles et exemples synthétiques ; D. Catalogue des scénarios et registre des preuves datées ; E. Protocole d’évaluation non exécuté ; F. Notice de provenance/licences des ressources réutilisées. Renvois nommés depuis le corps, pas de secrets ni CV personnels.

## 3. Comparaisons techniques à développer

Ces tableaux sont des **arguments d’adéquation au prototype**, pas les résultats d’un benchmark. Ajouter des références techniques officielles réellement consultées lors de la rédaction ; ne pas attribuer aux concurrents des défauts non vérifiés.

| Arbitrage | Solution retenue et raison contextualisée | Alternative et intérêt réel | Compromis / limite à expliquer |
|---|---|---|---|
| Monolithe modulaire / microservices | Une API NestJS, modules métier et PostgreSQL : transactions métier locales, déploiement et diagnostic plus simples pour le périmètre actuel | Microservices : déploiements/charges autonomes si équipes et besoins d’isolation le justifient | Distribution, observabilité, cohérence interservices et exploitation supplémentaires ; le monolithe partage ses ressources et exige de maintenir ses frontières. Aucune mesure de charge ne démontre ici le besoin de distribuer |
| Relationnel + JSONB / alternatives | Contraintes relationnelles pour identités, droits et relations ; JSONB validé pour formulaires, snapshots et résultats variables | Tout relationnel : schémas explicites et requêtes homogènes ; base documentaire : agrégats souples ; EAV : champs très dynamiques | Le tout relationnel multiplie tables/migrations pour la variabilité ; document/EAV déplacent certaines contraintes vers le code ou complexifient les requêtes. JSONB n’est pas sans schéma : validation, version et indexation doivent rester maîtrisées |
| PDF natif / OCR ou vision | Exploiter la couche texte sans envoyer des pages image par défaut ; chemin local borné, moins d’étapes distantes et volume d’entrée différent | OCR utile aux scans ; vision utile pour certaines structures visuelles et documents sans texte exploitable | Le natif peut perdre ordre/encodage/structure ; OCR/vision ajoutent calcul, erreurs propres, volume transmis et dépendances. Ni coût inférieur ni meilleure latence chiffrée ne sont démontrés ; aucun secours OCR/vision livré |
| Extraction structurée / résumé libre ou classement | Questions bornées, sorties typées et inconnus explicites : comparaison de champs, correction et CSV ; pas de décision automatique | Texte libre utile à une synthèse exploratoire ; ranking utile à un autre besoin, avec critères, biais et validation dédiés | Structure valide ≠ vérité du CV ; catégories peuvent simplifier la nuance. Le libre exige interprétation/normalisation ; un classement requiert une justification différente, des critères et une gouvernance non implémentés |
| CSV / intégrations étroites | Format inspectable, utilisable dans Excel et outils externes, import confirmé et contrôle humain ; couplage fournisseur faible | API/connecteurs : synchronisation, automatisation et expérience intégrée si contrats et autorisations disponibles | CSV : manipulation manuelle, fraîcheur limitée, copies privées et erreurs d’identité/formules à maîtriser ; connecteurs : maintenance, secrets, droits, transferts et reprise. Aucun connecteur Excel/IA natif n’est revendiqué |
| Traitement asynchrone borné / traitement HTTP synchrone | Dépôt confirmé avant extraction ; tolère attente et indisponibilité du fournisseur sans retenir la requête candidat | Synchrone : chemin plus court à expliquer pour une opération locale très brève | Asynchrone : état/lease/reprise et retour utilisateur à maintenir ; synchrone : latence et timeouts couplés au fournisseur. Les durées réelles restent à mesurer |
| Cache exact + registre durable / nouvelle tentative automatique | Réutiliser un succès validé et refuser un nouvel envoi après incertitude : priorité à la maîtrise de dépense | Retenter systématiquement peut améliorer la disponibilité lorsque l’idempotence facturable est garantie par un fournisseur | Un cache perdu peut bloquer la reprise ; quotas disque/rétention restent incomplets. Le cache seul n’est ni une preuve de non-duplication ni un mécanisme d’autorisation |

Pour le coût et la latence, présenter les mécanismes et les variables : nombre d’extracteurs, taille du Markdown, nombre de questions, admission, cache, appels effectivement commencés et incertitude. Le regroupement réduit les échanges par rapport à un appel par question, mais augmente la taille de la requête et l’unité d’échec. Les [montants illustratifs](cost-model.md) reposent sur des hypothèses utilisateur explicites, pas un tarif vérifié ou des dépenses observées ; ne fournir aucun temps moyen ni économie mesurée sans données.

## 4. Ce qui reste oral et ce qui appartient au rapport

Ne pas dépendre des numéros de diapositives : le manuscrit de présentation évolue séparément.

| Sujet | Présentation | Rapport technique |
|---|---|---|
| Contexte et objectif | Une formulation mémorisable du problème | Origine des besoins confirmée, périmètre et hors-périmètre |
| Solutions existantes | Catégories et positionnement prudent | Critères comparatifs, références, limites et justification des options |
| Acteurs et parcours | Cas d’utilisation et parcours représentatif | Matrice d’autorité, états indépendants, transitions et cas limites |
| Architecture et données | Une vue responsabilités + modèle sélectionné | Contraintes SQL/JSONB, transactions, révisions, ports, compromis et dette |
| Assistance documentaire | Chaîne PDF → extraction → revue humaine | Schémas, sémantique des cinq familles, diagnostics, caches, tentatives et reprise |
| Revue et CSV | Un exemple source/original/correction/effectif et une confirmation | Null/absence/retrait, confidentialité, filtres, conflits, atomicité et usages externes autorisés |
| Interfaces | Quelques captures actuelles fournies par l’utilisateur | Captures annotées au service d’une règle ; pas catalogue exhaustif |
| Vérification et bilan | Preuves clés et limites lisibles | Registre daté, distinction statique/modèle/DB/manual/live, protocole futur et menaces à la validité |
| Perspectives | Deux ou trois priorités | Dépendances, critères d’acceptation et séparation QA/extension produit |

## 5. Inventaire des diagrammes et preuves réutilisables

### Diagrammes existants

Sources et limites : [diagrams/README.md](diagrams/README.md). Réutiliser les sources vectorielles pour le rapport avec légende et portée ; leur validation syntaxique ne prouve pas les invariants métier. Aucun rendu supplémentaire n’est requis par ce plan.

| Actif | Réemploi proposé | Complément utile, non produit ici |
|---|---|---|
| `DIA-02-use-cases` | Chap. 1–2 : acteurs et intentions | Matrice de droits contextuels, car ce schéma n’est pas exhaustif |
| `DIA-03-classes` | Chap. 3 : associations choisies | Contraintes d’unicité/FK, snapshots et clé de correction candidature/tâche/question |
| `DIA-04-architecture` | Chap. 4 : responsabilités, dépendances et stockage privé | Vue de déploiement logique et frontières de confiance, sans chemins/identifiants privés |
| `DIA-05-processing` | Chap. 5 : chaîne de succès, requête multi-question | Séquence dépôt/worker/gateway/DB ; chemins d’échec et cache-only distincts du succès |
| `DIA-06-lifecycle` | Chap. 3 : décisions et prérequis Offer/Hired | Table de transitions/autorités, plans vides et non vides, clôture de dépôt distincte |
| `DIA-07-review` | Chap. 5 : original, correction et valeur effective | Exemple null/retrait et champ exporté, sans transformer la filiation en journal complet |

### Sources de preuve à citer, sans nouvelle exécution

| Source existante | Utilité | Frontière à conserver |
|---|---|---|
| [Notes de cadrage](notes.md), [produit](../docs/current/product.md), [workflows](../docs/current/workflows.md) | Périmètre, rôles et états | Exigence/propriété de source ≠ pratique d’entreprise observée |
| [Architecture](../docs/current/architecture.md), [contrat traitement/revue](../docs/current/contracts/processing-review-api.md) | Responsabilités et contrat actuel | Les passages anciens « pas de poller/cache » de la carte d’architecture sont dépassés par le contrat du 13 novembre |
| [Publication](../docs/current/contracts/vacancy-api.md), [candidature](../docs/current/contracts/application-api.md), [entretiens](../docs/current/contracts/interview-api.md), [screening](../docs/current/contracts/screening-api.md) | Invariants et parcours | OpenAPI statique en retard sur le CV version 2 ; ne pas l’annoncer comme preuve exhaustive |
| [Statut daté](../docs/current/status.md), [journal](../docs/journal.md) | Builds/checkpoints et retours utilisateur historiques | Pas de somme de tests ni de régression finale implicite ; Q-* restent ouvertes |
| [Catalogue de démonstration](../docs/current/guides/lifecycle-demo.md), [lancement](../docs/plan/cv-demo-launch.md) | Scénarios synthétiques, préparation locale et provenance | Cinq offres/25 scénarios ne sont ni 25 extractions réelles ni une mesure de qualité |
| [Archives du laboratoire](../research/cv-extraction-lab/README.md) et manifeste | Corpus synthétique, variantes et observations exploratoires | 63 PDF incluent des variantes ; 20 paires/102 réponses historiques ne sont pas un benchmark de la version intégrée ; l’ancien README de transfert décrit un état antérieur à l’intégration |
| [Guide frontend](../docs/current/guides/frontend-design.md), [demandes de captures](assets/requests.md) | Intentions UI et six captures actuelles attendues | Anciennes captures conservées mais pas preuve de l’interface actuelle ; captures utilisateur, sans nouvelle automatisation |

## 6. Éléments manquants et réserves avant rédaction finale

- **Cadre académique :** consignes officielles, couverture, établissement/formation, nom final, encadrants et exigences bibliographiques. L’exemple ne les remplace pas.
- **Contexte terrain :** informations validées sur l’organisme et origine des besoins ; aucun entretien métier, usage d’Excel, volume de candidatures ou dysfonctionnement quotidien ne doit être inventé.
- **Illustrations de réalisation :** six captures actuelles demandées et annotées avec provenance synthétique/fixture/réelle/corrigée ; pas de nouvelle capture ou rasterisation par l’agent.
- **Traçabilité technique :** sélectionner quelques extraits de source/contrats à version identifiable, réconcilier les indications anciennes de documentation et signaler le retard OpenAPI. Ne pas lancer de vérification pour combler le texte.
- **Acceptation :** régression actuelle DB/HTTP, autorisations/projections privées, concurrence/reprise et comportement natif restent partiels ou pendants selon les gates existantes. Les contrôles de build/readiness et modèles ne suffisent pas.
- **Qualité documentaire/IA :** annotations de référence, accord inter-annotateurs, protocole représentatif et évaluation intégrée absents ; pas de précision, seuil calibré ou avantage général démontré.
- **Coût/latence/utilité :** pas de benchmark représentatif ni de gain de temps établi ; documenter ultérieurement un protocole autorisé, sans appel fournisseur, chiffre de prix ou estimation inventée dans ce plan.
- **Exploitation et confidentialité :** confirmer les politiques de conservation/copies externes, sauvegarde/reconciliation de fichiers, quota/rétention des caches et autorisations de transfert ; ne pas présenter la confidentialité de conception comme une conformité réglementaire auditée.

Ce document ne commande aucune implémentation, rédaction complète, construction de PDF, installation, test, accès à une clé ou appel fournisseur. Il fournit uniquement une structure de rapport plus approfondie que la présentation.
