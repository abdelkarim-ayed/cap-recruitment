# Catalogue des figures du rapport

Références stables, sans imposer la numérotation finale du rapport. Catalogue
établi le **13 novembre 2026**, pas un compte rendu de validation fonctionnelle.
Les légendes ci-dessous sont proposées pour l’intégration ; les chapitres restent
à assembler. Les cinq figures RPT sont nouvelles, les six DIA sont réutilisées
sans modification, les six CAP restent des demandes de captures actuelles.

## 1. Compléments techniques propres au rapport

Sources et SVG : [`diagrams/`](diagrams/README.md). Le rendu est vectoriel,
portrait, au plus 160 × 240 mm ; conserver les proportions. Les tailles calculées
ne remplacent pas la relecture visuelle de l’utilisateur.

### RPT-ER — Schéma relationnel sélectionné (chapitre 3)

- **Fichiers :** [`RPT-ER.dot`](diagrams/RPT-ER.dot), [`RPT-ER.svg`](diagrams/RPT-ER.svg).
- **Légende :** « Sous-ensemble physique du dossier de candidature et de
  l’extraction CV : clés relationnelles, résultats originaux, corrections par
  question et garde durable des envois. »
- **Source :** réalisation de l’auteur d’après
  [`migrations.ts`](../../apps/api/src/database/migrations.ts), migrations
  001–003, 006, 008–010, et le
  [contrat traitement/revue](../../docs/current/contracts/processing-review-api.md).
- **Simplifications :** huit tables, attributs sélectionnés, pas un schéma SQL
  exhaustif. PK/UQ/FK désignent les contraintes réelles ; les flèches vont de la
  table référençante vers la table référencée. `"user"` est la cible réelle des FK
  d’identité. La FK nullable `corrected_by` et les autres colonnes d’attribution
  sont volontairement omises, ainsi que sessions/comptes/vérifications Better
  Auth, entretiens/étapes, notifications et ancienne `extraction_corrections`
  (encore créée par 003, distincte des corrections par question de 010).
  `source_input_id`/`question_id` sont des identités validées dans les définitions,
  pas des FK vers des tables de champs/questions. `cv_request_attempts` a bien
  des identités application/tâche, **sans FK SQL vers le dossier** ; aucune
  association relationnelle fictive n’est dessinée. Cette garde ne contient pas
  les réponses/Markdown et les resets métier ne doivent pas l’effacer.

### RPT-DEPLOY — Topologie locale logique (chapitre 4)

- **Fichiers :** [`RPT-DEPLOY.dot`](diagrams/RPT-DEPLOY.dot), [`RPT-DEPLOY.svg`](diagrams/RPT-DEPLOY.svg).
- **Légende :** « Topologie logique de développement : interface React/Vite,
  API NestJS et worker intégré, ressources privées locales et frontière externe
  Jev contrôlée par le gateway. »
- **Source :** réalisation de l’auteur d’après le
  [contrat traitement/revue](../../docs/current/contracts/processing-review-api.md),
  [Jev safety](../../docs/current/jev-safety.md),
  [`cv-runner.ts`](../../apps/api/src/processing/cv-runner.ts),
  [`cv-pdf-reader.ts`](../../apps/api/src/processing/cv-pdf-reader.ts) et
  [`jev.gateway.ts`](../../apps/api/src/integrations/jev/jev.gateway.ts).
- **Simplifications :** vue conceptuelle, sans chemins, ports, PID, comptes ni
  relevé de services. Le worker est **dans le processus API**, pas un microservice.
  Le parseur est un enfant natif éphémère sans identifiants, pas un service OCR.
  Le panneau de ressources nomme explicitement les relations SQL, fichiers,
  IPC, admission et mail sans multiplier les flèches. PostgreSQL porte tâches et
  connaissance durable des envois ; Redis porte les admissions/compteurs, pas une
  file. Les caches privés ne sont pas le ledger. Capture mail locale ≠ preuve de
  livraison. Jev requiert activation/consentement ; la figure ne transfère pas
  l’autorisation du cohort synthétique local à un autre déploiement.

### RPT-PUBLISH — Publication sous verrou (chapitre 3)

- **Fichiers :** [`RPT-PUBLISH.dot`](diagrams/RPT-PUBLISH.dot), [`RPT-PUBLISH.svg`](diagrams/RPT-PUBLISH.svg).
- **Légende :** « Publication atomique : contrôle séparé des révisions de l’offre
  et du plan d’entretien, validation du plan sauvegardé et gel de la date de
  référence d’extraction sous le verrou de l’offre. »
- **Source :** réalisation de l’auteur d’après le
  [contrat offre](../../docs/current/contracts/vacancy-api.md#publishclose),
  le [contrat traitement](../../docs/current/contracts/processing-review-api.md#definition-and-publication),
  [`vacancy.service.ts`](../../apps/api/src/vacancies/vacancy.service.ts)
  (`transition`, `change`) et
  [`vacancy.repository.ts`](../../apps/api/src/vacancies/vacancy.repository.ts)
  (`change`, `save`).
- **Simplifications :** le flux porte la première transition réelle
  `draft → published`. Rôle/session/Origin et validation du corps HTTP ne sont pas
  tous détaillés ; le contrôle propriétaire reste explicite. Une requête déjà
  `published`, autorisée par le propriétaire et syntaxiquement valide, retourne
  l’existant sans modifier date/révisions, même avec des compteurs anciens.
  `expectedRevision` et `expectedInterviewRevision` ne sont jamais fusionnés.
  Date UTC figée seulement si absente à la première publication réussie ; aucun
  défaut « aujourd’hui » à l’exécution. Plan vide valide et figé ; pas de rendez-vous
  créé automatiquement. La course illustrée vise une **modification réelle** du
  plan, pas un no-op qui ne change pas son compteur.

### RPT-SEQUENCE — Traitement et issues distinctes (chapitre 5)

- **Fichiers :** [`RPT-SEQUENCE.dot`](diagrams/RPT-SEQUENCE.dot), [`RPT-SEQUENCE.svg`](diagrams/RPT-SEQUENCE.svg).
- **Légende :** « Séquence d’un extracteur CV : dépôt non bloquant, claim,
  parsing natif, cache, frontière durable avant admission et envoi, cache de la
  réponse validée avant règlement, puis sauvegarde sous barrières. »
- **Source :** réalisation de l’auteur d’après
  [`application.service.ts`](../../apps/api/src/applications/application.service.ts),
  [`processing.service.ts`](../../apps/api/src/processing/processing.service.ts),
  [`processing.repository.ts`](../../apps/api/src/processing/processing.repository.ts),
  [`cv-attempts.ts`](../../apps/api/src/processing/cv-attempts.ts),
  [`cv-attempt.repository.ts`](../../apps/api/src/processing/cv-attempt.repository.ts),
  [`jev.gateway.ts`](../../apps/api/src/integrations/jev/jev.gateway.ts)
  et le [contrat traitement](../../docs/current/contracts/processing-review-api.md).
- **Simplifications :** séquence tabulaire plutôt que six lignes de vie trop
  étroites en A4. Chemin nominal numéroté et panneau d’alternatives rattachées à
  leurs étapes ; elles ne sont **pas** un `opt` exécuté après le succès. La
  frontière PostgreSQL `send_started` confirmée vient **avant** l’admission Redis,
  donc avant le transport : ce statut n’est pas une preuve que le réseau a envoyé.
  Cache réponse valide : pas de réservation/admission/envoi ; cache parseur et
  cache réponse ne sont pas confondus. Chaque tâche regroupe plusieurs questions
  dans une seule requête, pas un appel par question. Parser illisible/OCR requis :
  échec sans fallback hébergé. Réponses connues non-2xx, dont 429 et 5xx, sont
  terminales selon la politique actuelle ; elles ne deviennent pas arbitrairement
  « accusé inconnu ». Une erreur pendant le transport/flux après début d’envoi
  peut être ambiguë. Un règlement DB non confirmé peut également produire une
  erreur d’incertitude pour l’invocation, sans prouver l’état réellement commis.
  Si l’écriture cache échoue, le code tente tout de même `settle succeeded` ; si
  ce règlement échoue aussi, son accusé est inconnu. Une réponse déjà cachée avec
  règlement/save non confirmé permet seulement la reprise locale après expiration
  du bail ; cache perdu/invalide n’autorise jamais un nouvel appel payant. Détails
  d’authentification, compensation fichiers, wakes débordés et autres tâches omis.

### RPT-STATES — États et fermeture logique (chapitres 3 et 5)

- **Fichiers :** [`RPT-STATES.dot`](diagrams/RPT-STATES.dot), [`RPT-STATES.svg`](diagrams/RPT-STATES.svg).
- **Légende :** « États réels des tâches et des gardes d’envoi, séparés de la
  barrière applicative qui interdit les écritures tardives sans annuler la
  facturation externe. »
- **Source :** réalisation de l’auteur d’après migrations 003/008/009,
  [`processing.repository.ts`](../../apps/api/src/processing/processing.repository.ts),
  [`cv-attempts.ts`](../../apps/api/src/processing/cv-attempts.ts),
  [`cv-attempt.repository.ts`](../../apps/api/src/processing/cv-attempt.repository.ts),
  et les sections traitement/préparation/libération du
  [contrat actuel](../../docs/current/contracts/processing-review-api.md).
- **Simplifications :** tâche : `pending`, `processing`, `completed`, `failed` ;
  garde : `prepared`, `send_started`, `succeeded`, `retryable_unsent`, `terminal`,
  `uncertain`. Une erreur d’accusé DB ne permet pas d’affirmer que l’état SQL
  `uncertain` a été écrit. `prepared` expiré est réattribuable sous contrôles ;
  `send_started` sans propriétaire actif devient incertain à la réservation.
  Reprise ordinaire des tâches seulement si éligibles/retryable, délai écoulé et
  moins de trois tentatives ; reprise **cache-only** réservée aux tâches
  interrompues avec connaissance durable d’envoi, sans incrément de tentative et
  sans fallback payant. Le panneau des gardes résume les chemins principaux ;
  accusés inconnus et réattribution sont annotés, non dessinés en faux états.
  Libération manuelle, fin de revue ou décision de présélection/rejet ferment le
  traitement par une **barrière**, sans ajouter `cancelled` aux états de tâche.
  Le règlement de la connaissance d’envoi peut encore s’écrire après fermeture ;
  le résultat original ne peut pas franchir la barrière. Les états de préparation
  de revue et les étapes de recrutement ne sont pas une troisième machine dessinée.

## 2. Six diagrammes de présentation réutilisables

DOT dans [`../diagrams/`](../diagrams/README.md), SVG existants dans
`presentation/dist/diagrams/`. Format d’origine 16:9 : **ne pas supposer que leurs
labels restent lisibles à 160 mm** ; relecture/placement par l’utilisateur. Ne pas
les régénérer via le script RPT. « Auteur » ci-dessous désigne la réalisation
interne à partir du dépôt, pas une source externe.

| ID / fichiers sans extension | Légende proposée | Source | Simplification / placement conseillé |
|---|---|---|---|
| **DIA-02** `DIA-02-use-cases` | « Acteurs et principales intentions dans la plateforme de recrutement. » | Auteur ; [DOT](../diagrams/DIA-02-use-cases.dot), [actions](../../docs/current/contracts/action-policies.md) | Vue des usages, pas une matrice exhaustive d’autorisations. Chapitre 2. |
| **DIA-03** `DIA-03-classes` | « Modèle métier conceptuel du dossier, des entretiens et des corrections par question. » | Auteur ; [modèle source](../diagrams/models.mjs), migrations 001–010, [contrat traitement/revue](../../docs/current/contracts/processing-review-api.md) | Entités métier, pas des noms SQL ni toutes les FK ; au plus une correction par question/tâche/candidature, pas un historique. Complété par RPT-ER. Chapitre 3. |
| **DIA-04** `DIA-04-architecture` | « Répartition des responsabilités entre interface, API, persistance et intégrations. » | Auteur ; [modèle source](../diagrams/models.mjs), [architecture](../../docs/current/architecture.md), [contrat CV récent](../../docs/current/contracts/processing-review-api.md) | Composants et ports conceptuels ; worker dans l’API. Les anciennes phrases « pas de poller/cache » de l’architecture ne prévalent pas sur le contrat CV. RPT-DEPLOY ajoute la topologie logique. Chapitre 4. |
| **DIA-05** `DIA-05-processing` | « Du PDF privé aux réponses typées, puis à la revue et aux valeurs effectives. » | Auteur ; [DOT](../diagrams/DIA-05-processing.dot), [contrat traitement](../../docs/current/contracts/processing-review-api.md) | Chemin de succès, cinq familles de questions mais pas cinq appels ; caches annotés, échecs/reprises dans RPT-SEQUENCE. Chapitre 5. |
| **DIA-06** `DIA-06-lifecycle` | « Progression de recrutement : présélection, entretiens, proposition explicite et embauche distincte. » | Auteur ; [DOT](../diagrams/DIA-06-lifecycle.dot), [workflows](../../docs/current/workflows.md), [contrat entretien](../../docs/current/contracts/interview-api.md) | Parcours sélectionné, pas toutes les actions/rejets ; échec d’entretien terminal, pas d’Offer automatique. Revue/traitement indépendants. Chapitre 3. |
| **DIA-07** `DIA-07-review` | « Filiation d’un champ : original conservé, correction attribuée et valeur effective. » | Auteur ; [DOT](../diagrams/DIA-07-review.dot), [contrat revue/export](../../docs/current/contracts/processing-review-api.md) | Correction présente prioritaire, y compris `null` ; sinon original. Pas un journal d’audit complet ni une décision automatique. Chapitre 5. |

## 3. Six captures actuelles à fournir — pas de preuve inventée

Emplacement attendu : `presentation/assets/images/`. État : **réserves de captures,
non produites ni inspectées ici**. Source de cadrage :
[`assets/requests.md`](../assets/requests.md). Aucun écran généré, aucun appel Jev
requis, aucune action destructive ou décision réelle pour fabriquer une figure.
Conserver les indications fixture/réel/corrigé et masquer les données d’accès.

| ID / fichier attendu | Légende proposée | Source à créditer lors de réception | Simplification / cadrage |
|---|---|---|---|
| **CAP-10** `CAP-10-offre-publication.png` | « Configuration d’une offre avant publication : formulaire, extraction facultative et plan sauvegardé. » | Capture manuelle de l’application, utilisateur, date/version à renseigner | Zone métier lisible, pas tout l’éditeur dense ; ne prouve pas une course transactionnelle. Chapitre 4. |
| **CAP-11** `CAP-11-candidature.png` | « Dépôt candidat avec formulaire et document synthétique. » | Même source manuelle, provenance synthétique explicite | Formulaire ou confirmation d’un dépôt existant ; ni nouvelle soumission payante, ni preuve d’extraction. Chapitre 4. |
| **CAP-12** `CAP-12-revue-cv.png` | « Inspection du PDF source et correction RH indépendante d’un champ extrait. » | Même source manuelle ; provenance réelle/fixture/correction visible | Montrer PDF + un champ, pas tous les résultats en petit ; ne démontre pas la qualité générale du modèle. Priorité 1, chapitre 5. |
| **CAP-13** `CAP-13-import-decisions.png` | « Aperçu des décisions importées et confirmation finale du lot. » | Même source manuelle ; CSV synthétique | Aperçu suffisant, sans appliquer le lot pour l’image ; pas une preuve de round-trip exhaustif. Priorité 2, chapitre 4 ou 6. |
| **CAP-14** `CAP-14-agenda.png` | « Planification d’un entretien synthétique et identification de l’interviewer. » | Même source manuelle | Rendez-vous existant, cadrage lisible ; pas une preuve de détection exhaustive des chevauchements. Chapitre 4. |
| **CAP-15** `CAP-15-decision.png` | « Action de proposition ou d’embauche accessible au responsable selon les prérequis. » | Même source manuelle | Dossier existant ; ne pas déclencher une décision pour la capture ni confondre Offer/Hired. Chapitre 4 ou 6. |

Les anciens `IMG-01` et `CAP-02` à `CAP-06` sont conservés ailleurs comme actifs
historiques ; **ils ne remplacent pas ces six captures actuelles**. Les figures
RPT/DIA montrent des mécanismes lus dans les sources, jamais des résultats de QA,
une certification de confidentialité, une qualité IA mesurée ou une garantie de
non-double-facturation testée. Aucun test applicatif, accès runtime/clé/provider,
navigateur, lecture d’image ou rendu raster n’a été nécessaire à ce catalogue.
