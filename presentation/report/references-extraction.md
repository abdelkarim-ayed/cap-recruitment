# Références — assistance documentaire et vérification

Ce registre accompagne les chapitres 5 et 6. Les références internes sont des pièces primaires du projet, consultées le **13 novembre 2026**. Un contrat décrit le comportement de source ; un checkpoint décrit une observation datée. Leur citation ne transforme pas les vérifications encore ouvertes en résultats acquis. Les chemins indiqués sont relatifs à la racine du dépôt ; les liens sont relatifs à ce fichier.

## Contrats et sources d’implémentation

### [REF-EXTRACT-CONTRACT]

**Projet CAP, « CV extraction, shared HR review and export — source contract ».** `docs/current/contracts/processing-review-api.md`, état documentaire du 13 novembre 2026, baseline CV intégrée et correctifs décrits jusqu’à `e1f1d86`.

[Consulter le contrat](../../docs/current/contracts/processing-review-api.md).

Affirmations soutenues : définition de traitement version 2 ; un extracteur par source documentaire ; une requête multi-question par extracteur ; date UTC de première publication ; préparation native bornée ; exécution hors HTTP ; caches exacts privés ; registre de tentative et ordre cache-avant-règlement ; reprise locale seule ; résultat original immuable ; correction par candidature/tâche/question ; absence, null et retrait ; révision séparée ; préparation, libération et barrières de clôture ; projections privées et valeurs effectives des exports.

Limite : contrat de source, non preuve autonome de parcours authentifié, de qualité sémantique ou de reprise concurrente. Les observations correspondantes sont dans [REF-EXTRACT-STATUS].

### [REF-EXTRACT-DOMAIN]

**Projet CAP, domaine partagé, « CV extractor ».** `packages/domain/src/cv-extractor.ts`, consulté le 13 novembre 2026.

[Consulter la source](../../packages/domain/src/cv-extractor.ts).

Affirmations soutenues : cinq familles ; paramètres facultatifs ; identifiants uniques ; alias directionnels ; construction centralisée des instructions et choix ; catégories de formation, expérience et contexte d’utilisation ; compte borné de couverture ; normalisation ; validation des corrections ; calcul de la valeur effective. Les formulations sont lisibles dans le registre `families` et dans `buildCvRequest` ; la sémantique des surcharges apparaît dans `parseCvCorrections` et `effectiveCvField`.

Limite : typage et validation ne démontrent ni la vérité des déclarations du CV ni la justesse d’interprétation du fournisseur. Les informations de confiance ne sont pas une calibration évaluée sur le corpus du projet.

### [REF-EXTRACT-REGISTRY]

**Projet CAP, domaine partagé, « Extractor registry and processing definition ».** `packages/domain/src/extractors.ts`, consulté le 13 novembre 2026.

[Consulter la source](../../packages/domain/src/extractors.ts).

Affirmations soutenues : seul type enregistré `cvExtractor` ; source documentaire ; définition version 2 avec zéro tâche possible ; unicité des identités de tâche, source et clé de sortie ; contrôle des collisions avec les réponses du formulaire. Les cinq familles sont des types de questions, pas cinq jobs indépendants.

Limite : registre actuel limité ; il ne constitue pas une plateforme de workflows ou un mécanisme libre de prompts fournisseur.

### [REF-EXTRACT-SAFETY]

**Projet CAP, « Jev: mandatory safeguards and CV extraction ».** `docs/current/jev-safety.md`, état du 13 novembre 2026.

[Consulter les garde-fous](../../docs/current/jev-safety.md).

Affirmations soutenues : transport réel exclusivement par JevGateway ; un appel actif, trois admissions par minute, vingt admissions persistantes ; absence de retries cachés ; credential en mémoire chargé par l’utilisateur ; défauts désactivés ; activation locale limitée aux nouvelles soumissions synthétiques ; distinction avant-envoi démontrable et issue ambiguë ; registre durable distinct du cache ; reprise exclusivement locale après envoi connu ; interdiction d’interpréter un cache absent comme une autorisation de payer à nouveau.

Limite : les gardes et l’ordre cache-avant-règlement sont implémentés et construits, mais n’ont pas reçu une acceptation finale PostgreSQL/HTTP/concurrence ou une validation de récupération payante. Cette référence ne prouve aucune condition de facturation des sorties.

## Observations datées et provenance

### [REF-EXTRACT-STATUS]

**Projet CAP, « Implementation status ».** `docs/current/status.md`, notamment « Verification evidence », « Manual QA report », « 2026-11-13 — CV demo launch and real-worker correction » et « Contract gaps » ; consulté le 13 novembre 2026.

[Consulter le registre de statut](../../docs/current/status.md).

Affirmations soutenues : checkpoints du 31 octobre, des 7 et 9 novembre et du 13 novembre 2026 ; périmètres des builds, contrôles hors ligne, DOM et modèles ; préparation locale et migrations ; cinq offres/25 scénarios ; une tâche native/fixture terminée lors du premier démarrage hors ligne ; démarrage ultérieur du worker Jev restreint, credential initialement vide ; retours utilisateur du 8 novembre ; limites des tests historiques et retard OpenAPI.

Limite : les nombres successifs ne sont pas additifs. Les retours utilisateur sont des chemins rapportés, pas une campagne indépendante exhaustive. Le statut rassemble aussi des limitations historiques devenues caduques après modification : les contrats actuels possèdent les règles présentes.

### [REF-EXTRACT-DEMO]

**Projet CAP, « Lifecycle demo fixtures ».** `docs/current/guides/lifecycle-demo.md`, sections « Dataset », « Verification boundary » et mise à jour du 13 novembre 2026.

[Consulter le catalogue](../../docs/current/guides/lifecycle-demo.md).

Affirmations soutenues : cinq offres et 25 scénarios ; état présemé distinct d’une transition exécutée ; quatre profils PDF synthétiques transférés ; réponses, évaluations et notifications déclarées ; provenance fixture ; métadonnées d’usage nul et confiance simulées ; setup/reset bornés ; ancien mode hors ligne distinct du runner réel ultérieurement sélectionné.

Limite : catalogue de démonstration, pas corpus d’évaluation humaine ni 25 appels réels observés. La répétabilité complète, les parcours authentifiés, la confidentialité et les courses restent ouverts. Les comptes et données opérationnelles du guide ne sont pas reproduits dans le rapport.

### [REF-EXTRACT-LAB]

**Projet CAP, « Portable CV-extraction research and synthetic fixtures » et manifeste de transfert.** `research/cv-extraction-lab/README.md` et `research/cv-extraction-lab/manifest.json`, transfert du 13 novembre 2026.

[Consulter l’index de provenance](../../research/cv-extraction-lab/README.md) · [Manifeste](../../research/cv-extraction-lab/manifest.json).

Affirmations soutenues : 63 PDF synthétiques, dont soixante identités numérotées, deux variantes de mise en page et un document supplémentaire ; treize familles de modèles ; couples PDF/Markdown et diagnostics historiques ; vingt paires exactes requête-réponse et 102 réponses ; vérifications d’empreintes du transfert ; observations exploratoires, sans précision validée ni seuil calibré.

Limite : le README conserve des descriptions d’un état antérieur à l’intégration ; elles ne prévalent pas sur [REF-EXTRACT-CONTRACT]. L’archive ne constitue ni un cache runtime, ni une allowance, ni une évaluation intégrée actuelle. Les variantes doivent rester groupées par identité. Les auteurs et licences des modèles conservent leur attribution d’origine.

### [REF-EXTRACT-BOARD]

**Projet CAP, « Task board ».** `docs/plan/tasks.md`, consulté le 13 novembre 2026.

[Consulter le suivi](../../docs/plan/tasks.md).

Affirmations soutenues : distinction entre travail source réalisé et gates d’acceptation Q-* ; suivi de la régression, de la confidentialité, de la concurrence et de l’UX restante. Le chapitre 6 cite des familles de gates, sans prétendre dresser l’inventaire complet des tâches.

Limite : source de planification, pas preuve de succès ni autorisation d’exécuter une opération. Les résultats datés sont dans [REF-EXTRACT-STATUS].

## Hypothèses économiques et méthode proposée

### [REF-EXTRACT-COST]

**Projet CAP, « Coût de l’extraction — hypothèses, unités et limites ».** `presentation/cost-model.md`, révision du 13 novembre 2026.

[Consulter le modèle](../cost-model.md).

Scénarios arithmétiques de 2 000, 5 000 et 8 000 tokens d’entrée complets. Tarif direct TypeSafe consulté : 0,042 USD par million ; sorties gratuites. La configuration de CAP pointe directement sur l’API TypeSafe.

Calcul : 5 000 tokens complets coûtent 0,000210 USD par requête, soit 0,210 USD pour mille requêtes. Aucun multiplicateur par famille ; hébergement et revue humaine hors estimation.

Portée : scénarios conditionnels, non facture ni taille moyenne mesurée.

## Documentation primaire des dépendances

### REF-JEV-PRICE

- **Auteur :** TypeSafe AI.
- **Titre :** How much does Jev cost?
- **URL :** https://help.typesafe.ai/articles/5187202169-how-much-does-jev-cost
- **Consultation :** 13 novembre 2026.

### REF-JEV-CONFIDENCE

- **Auteur :** TypeSafe AI.
- **Titre :** Confidence.
- **URL :** https://docs.typesafe.ai/confidence
- **Consultation :** 13 novembre 2026.

### REF-JEV-API

- **Auteur :** TypeSafe AI.
- **Titre :** HTTP API — System One.
- **URL :** https://docs.typesafe.ai/go/api.md
- **Consultation :** 13 novembre 2026.

### REF-JEV-INTRO

- **Auteur :** Diogo Almeida, TypeSafe AI.
- **Titre :** Introducing System One Models & Jev.
- **URL :** https://typesafe.ai/blog/introducing-system-one-models-and-jev
- **Consultation :** 13 novembre 2026.

### REF-PDF-INSPECTOR

- **Auteur :** Firecrawl.
- **Titre :** pdf-inspector — README de la révision du paquet Node.js 1.25.2.
- **URL :** https://github.com/firecrawl/pdf-inspector/blob/ef52f77850b29189048797a48b24862251f54fe7/README.md
- **Consultation :** 13 novembre 2026.
