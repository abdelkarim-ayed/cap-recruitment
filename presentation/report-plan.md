# Plan de production du rapport technique PFE

## 1. Décisions et état de production

Mise à jour du 13 novembre 2026. **La rédaction intégrale est autorisée et en cours**, en français, avec des sous-agents ChatGPT affectés à des périmètres distincts. Ce document remplace le plan de production antérieur ; `report-outline.md` reste la source du budget cohérent et du détail argumentatif initial.

Le fil directeur est une plateforme de recrutement pour une entreprise, avec coordination sobre et assistance documentaire facultative. Le recrutement reste utilisable sans extraction. CAP est un nom de travail ; « Centralisation et Assistance au Parcours de recrutement » en est un développement proposé, non une histoire attestée.

Le corps principal vise **70–84 pages**, introduction et conclusion incluses. Les préliminaires, références et annexes sont comptés à part. Une seule langue est retenue : le français. Les deux pages initiales sont réservées avec les seuls libellés de `report-frontmatter.md`. Les estimations sont permises si leurs hypothèses sont explicites ; aucune mesure ne doit être inventée.

## 2. Budget de pagination

| Partie | Minimum | Maximum |
| --- | ---: | ---: |
| Introduction générale | 2 | 3 |
| 1. Cadre, objectifs et démarche | 5 | 6 |
| 2. Analyse des besoins et étude des solutions | 9 | 10 |
| 3. Conception métier, données et garanties | 12 | 14 |
| 4. Architecture et réalisation de la plateforme | 12 | 14 |
| 5. Assistance documentaire facultative et contrôle humain | 16 | 19 |
| 6. Vérification, démonstration et discussion critique | 11 | 14 |
| Conclusion générale et perspectives | 3 | 4 |
| **Total du corps** | **70** | **84** |

Ce sont des enveloppes éditoriales, non une pagination déjà constatée. Les tableaux et figures y sont compris. Après composition, réduire les redites plutôt que remplir artificiellement ou étendre la cible. Références : environ 3–5 pages selon les citations réellement utilisées ; annexes utiles : environ 8–15 pages, sans données privées ni copie massive de code.

## 3. Règles communes de rédaction

Chaque développement suit, quand cela s’applique : **besoin → options → choix justifié → mécanisme réalisé → preuve disponible → limite**. Distinguer systématiquement le code implémenté, l’observation datée, la direction future retenue et le protocole proposé non exécuté.

- Les contrats actuels fondent les règles ; `docs/current/status.md` fournit des observations datées, pas un état courant des processus ni une régression finale.
- En cas de documentation ancienne contradictoire, privilégier le contrat actuel et signaler l’écart. La carte d’architecture contient notamment des passages anciens sur les scans, caches et migrations ; le contrat de traitement et les entrées récentes du statut prévalent.
- Aucun organisme, calendrier, rituel Scrum, entretien métier, volume de candidatures, précision, gain de temps ou coût observé ne peut être reconstruit sans preuve.
- La validité du schéma ne prouve pas la justesse documentaire. Un résultat inconnu ou indisponible ne devient pas un faux, un zéro ou une non-mention.
- La présence d’un humain ne suffit pas à écarter le règlement européen sur l’IA ; aucune conformité auditée n’est revendiquée.
- Les notes de source identifient les chemins du dépôt ou les références effectivement utilisées. Un résultat de recherche web ne doit pas être présenté comme une consultation intégrale de la page.
- Aucun test, appel fournisseur, accès à une clé, changement de service, navigateur ou génération d’image n’est requis ou autorisé par cette production éditoriale.

## 4. Briefs par partie

### Introduction générale — 2–3 pages

Poser le problème de coordination sans inventer une enquête terrain. Formuler la problématique et les objectifs ; annoncer le parcours humain, les configurations figées, la cohérence transactionnelle, l’extraction révisable et le CSV. Présenter immédiatement la portée des preuves et les limites. Texte demandé : environ 1 100–1 500 mots, à ajuster à la composition.

Sources : `docs/current/product.md`, `workflows.md`, `status.md`, contrats actuels. Ne pas traiter l’activation locale synthétique comme une mesure de qualité ou une autorisation de production.

### Chapitre 1 — Cadre, objectifs et démarche — 5–6 pages

Séparer organisme d’accueil, commanditaire, utilisateurs cibles et personnes effectivement consultées. N’utiliser que les informations validées ; réserver les renseignements académiques manquants. Décrire un déploiement pour une entreprise, les hors-périmètres et les acteurs. Exposer la démarche incrémentale documentée par des checkpoints, sans inventer Scrum, durée totale ni attribution personnelle détaillée. Relier livrables et critères de réussite, puis distinguer réalisation et acceptation.

Sources : `docs/current/product.md`, `docs/current/workflows.md`, `docs/journal.md`, `docs/plan/tasks.md`. Figures utiles : acteurs ; jalons exclusivement étayés. Tableau : périmètre et critères de réussite.

### Chapitre 2 — Analyse des besoins et étude des solutions — 9–10 pages

Dérouler le parcours attendu et une matrice acteur/action/contexte. Traduire confidentialité, intégrité, indisponibilité fournisseur, coût, portabilité et lisibilité en exigences concrètes. Comparer raisonnablement ATS, parseurs spécialisés, tableurs et traitements externes selon des critères communs, sans test comparatif revendiqué ni défaut concurrent supposé. Justifier monolithe modulaire, relationnel/JSONB, extraction structurée, asynchronisme et CSV. Terminer par une traçabilité besoins/choix/preuves.

Sources : cadrage produit, décisions produit, contrats et pages externes dont la consultation est attestée. Le panorama est documentaire, pas un audit ni une preuve de supériorité. Un tarif générique par page ne décrit pas nécessairement un produit d’analyse de CV.

### Chapitre 3 — Conception métier, données et garanties — 12–14 pages

Présenter les cas d’utilisation, le modèle conceptuel et les contraintes utiles. Détailler la publication avec deux révisions distinctes, le gel des plans vides/non vides, les instantanés de candidature et la date de première publication. Séparer traitement, revue et recrutement. Expliquer les droits contextuels, les projections privées, les transactions et conflits. Décrire présélection/rejet, Pass/Fail, proposition explicite du propriétaire et embauche séparée. La fermeture des dépôts ne termine pas les recrutements.

Sources : `docs/current/workflows.md`, contrats de publication, candidature, entretien et présélection, guide des transitions. Figures : modèle sélectionné, états et scénario concurrent annoncé comme explicatif, non exécuté. Les compteurs ne sont pas un historique.

### Chapitre 4 — Architecture et réalisation — 12–14 pages

Expliquer pnpm, NestJS, React/Vite et le domaine TypeScript/Zod, puis les responsabilités effectives du monolithe. Décrire relationnel/JSONB validé, stockage privé, compensation et limites de nettoyage. Présenter les ports existants sans revendiquer une architecture pure absente du code. Montrer des parcours et contrats courts. Détailler export diagnostic/export effectif, import groupé, identité figée, contrôle final atomique et absence d’import des corrections. Expliquer navigation protégée, brouillons locaux, conflit et réapplication explicite. Distinguer modes désactivé, fixture, offline-demo et Jev ; ne pas publier secrets ou chemins sensibles.

Sources : architecture, contrats, `apps/api/src/`, `apps/web/src/`, `packages/domain/src/` et guide frontend. Figures : architecture, stockage et captures autorisées. Le courrier local capturé ne prouve pas la délivrabilité.

### Chapitre 5 — Assistance documentaire et contrôle humain — 16–19 pages

Définir la portée strictement documentaire de l’IA. Expliquer lecture native PDF isolée et bornée, diagnostics, absence d’OCR et différence entre dépôt DOCX et parsing. Détailler les cinq familles, leur sémantique et leurs inconnus. Décrire **une requête multi-question par extracteur configuré**, et non cinq appels par défaut. Présenter validation complète, asynchronisme après commit, bail/jeton, scans, passerelle et contexte d’autorisation. Expliquer caches exacts, registre durable et reprise locale seulement : un envoi ambigu ou un cache perdu n’autorise pas un nouvel envoi payant.

Développer original/correction/effectif, absence/null/retrait, attribution, revue, libération et clôtures. Les appels déjà admis peuvent coûter même après une clôture. Les variables et estimations chiffrées renvoient à `cost-model.md`, en cours de correction séparée ; aucune économie mesurée, aucun doublement universel du coût de sortie, aucun rapport « des centaines de fois moins cher ». L’analyse réglementaire ne peut être remplacée par l’affirmation d’une supervision humaine.

Sources : `docs/current/contracts/processing-review-api.md`, domaine CV et extracteurs, `docs/current/jev-safety.md`, `cost-model.md`. Figures : chaîne documentaire, séquence d’envoi et filiation des valeurs. La reprise réelle et les races restent à valider.

### Chapitre 6 — Vérification et discussion critique — 11–14 pages

Classer les preuves par version/date, périmètre, environnement et limite. Ne pas additionner les effectifs historiques de tests. Présenter les cinq offres/25 scénarios en distinguant état préparé, transition parcourue, lecture native, réponse fixture et observation fournisseur. Conserver les retours manuels positifs avec leurs bornes. Proposer, sans l’exécuter, un protocole avec annotations indépendantes, désaccords, jeu tenu à l’écart et variantes groupées par identité. Séparer validité structurelle, justesse sémantique, coût, latence et utilité. Discuter synthétique, corrélations, version des questions et absence de benchmark intégré.

Sources : `docs/current/status.md`, journal, guide de cycle de vie, contrat et handoff de lancement. Tableau final : réalisé/observé/à vérifier. Aucun nouveau contrôle applicatif pour compléter le récit.

### Conclusion — 3–4 pages

Répondre à la problématique sans résultat nouveau. Synthétiser réalisé/observé/à vérifier, souligner la plateforme avant l’IA, puis ordonner acceptation, évaluation documentaire, exploitation et extensions conditionnelles. Ne pas promettre calendrier, précision, équité ou conformité. Texte demandé : environ 1 000–1 300 mots. Recouper avec tous les chapitres terminés.

### Résumé, mots-clés et glossaire — hors corps

Environ 300 mots en français, sept mots-clés possibles et 15–20 termes réellement employés. Pas de résumé anglais. Ne pas introduire de coût ni de résultat absent du corps. Recouper le résumé après la revue générale.

## 5. Sources externes : statut et usages permis

Les recherches du 13 novembre ont servi aussi à découvrir des URL. **La liste antérieure ne prouve pas que toutes les pages ont été directement consultées.** Aucun taux agrégé ni fourchette non vérifiée n’est conservé ici. Le responsable de chaque chapitre doit distinguer source lue, résultat de recherche et référence à confirmer ; une date de recherche n’est pas automatiquement une date de consultation.

| Famille | Références repérées | Usage et précaution |
| --- | --- | --- |
| ATS | [Greenhouse](https://www.greenhouse.com/resources/glossary/what-is-an-applicant-tracking-system-ats), [Workable](https://www.workable.com/features) | Illustrer des fonctions documentées après consultation ; pas un benchmark de terrain. |
| Parseurs | [Textkernel](https://www.textkernel.com/products-solutions/parser/), [Affinda](https://www.affinda.com/pricing-plans), [facturation Affinda](https://docs.affinda.com/billing) | Distinguer produit, unité et conditions. Les montants génériques par page ne sont pas conservés comme prix du produit CV. Aucun prix actuel de CV n’est affirmé ici. |
| Cadre européen | [Texte du règlement 2024/1689 sur EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/1689/oj), [article 14, service officiel](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-14) | Examiner notamment annexe III et surveillance humaine sur texte officiel ; aucune exemption déduite de la seule intervention humaine. |
| Gestion des risques | [NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf) | Cadre documentaire, non certification ni preuve de conformité du prototype. |
| Prix d’inférence | Pages officielles à identifier dans `cost-model.md` | Pas de bornes agrégées non vérifiées, ni rapport fixe sortie/entrée. Dater chaque tarif réellement retenu et ses conditions. |

Les détails numériques et la comparaison commerciale appartiennent à `cost-model.md`, réparé séparément ; ils ne sont réutilisables qu’après vérification de leur provenance et de leurs unités. La bibliographie est traitée par son responsable, hors de ce lot éditorial.

## 6. Figures et réserves

Réutiliser les diagrammes vectoriels existants lorsque leur portée correspond à la question ; la production complémentaire est un lot distinct. Ne pas déclencher navigateur, capture ou rasterisation. Les six captures actuelles attendues conservent les noms de `assets/requests.md` : `CAP-10-offre-publication.png`, `CAP-11-candidature.png`, `CAP-12-revue-cv.png`, `CAP-13-import-decisions.png`, `CAP-14-agenda.png`, `CAP-15-decision.png`. Priorité à la revue par champ et à l’import confirmé. Leur absence est une réserve, pas une preuve manquante à inventer.

Chaque figure intégrée doit préciser objet, portée, provenance, date si capture, et caractère synthétique/fixture/corrigé applicable. La numérotation définitive dépend de l’assemblage. Aucun entonnoir chiffré sans données réelles, aucune illustration décorative ni logo supposé.

| Réserve | État / décision attendue |
| --- | --- |
| Couverture institutionnelle | À fournir ; page réservée, seul libellé autorisé. |
| Page de garde | À fournir ; page réservée, seul libellé autorisé. |
| Institution, formation, consignes et encadrement | Confirmation utilisateur avant usage dans les préliminaires ; ne pas dériver d’un exemple. |
| Titre définitif et nom CAP | Validation finale ; développement proposé seulement. |
| Contexte de l’organisme et origine des besoins | Informations validées à compléter si nécessaires ; aucune histoire d’entreprise inventée. |
| Six captures actuelles | À fournir par l’utilisateur, avec provenance ; anciens visuels non promus en preuve actuelle. |
| Diagrammes complémentaires | Lot séparé ; conformité aux contrats à revoir avant insertion. |
| Tarifs et données externes | Vérifier consultation effective, produit, unité et date ; chiffres non attestés exclus. |

## 7. Intégration et acceptation éditoriale

Les responsabilités et l’état d’avancement figurent dans `report-orchestration.md`. Après réception de tous les textes, la session principale relit **tous les chapitres**, y compris introduction, conclusion et résumé. Elle rapproche termes, règles, chiffres, références et limites ; la revue ne se limite pas aux chapitres 2, 4 et 5. L’assemblage et la pagination finale restent ultérieurs. L’absence d’un gabarit ou d’une capture n’empêche pas la rédaction ; elle doit rester visible dans le registre ci-dessus.
