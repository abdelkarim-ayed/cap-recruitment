# Visuels et informations à fournir

## Priorité : six captures actuelles

Les rectangles du PDF sont intentionnels. Déposer les fichiers dans **`presentation/assets/images/`**, sous les noms exacts ci-dessous, puis lancer `pnpm --filter @recruitment/presentation pdf:build`. Ils remplacent automatiquement les placeholders, sans recadrage. PNG préféré, paysage, environ 1600 px de large ; cadrer une zone métier lisible plutôt qu’un écran complet très dense.

| Priorité | Page PDF / contenu | Fichier exact | Ce qu’il faut montrer |
|---|---|---|---|
| **1** | **26 / 22 — Examiner et corriger** | `CAP-12-revue-cv.png` | Dossier synthétique : PDF visible et panneau de résultat/correction pour un champ. Garder l’indication de provenance réelle, simulée ou corrigée. C’est le visuel principal de la contribution IA + contrôle humain. |
| **2** | **27 / 23 — Export et présélection** | `CAP-13-import-decisions.png` | Aperçu du CSV avec quelques lignes, décisions retenues et confirmation finale. Capturer l’aperçu suffit : inutile d’appliquer le lot pour l’image. |
| **3** | **24 / 20 — Publier l’offre** | `CAP-10-offre-publication.png` | Configuration ou résumé avant publication : formulaire, extraction et plan d’entretien. Choisir une zone représentative plutôt que tout le long formulaire. |
| **4** | **28 / 24 — Entretiens** | `CAP-14-agenda.png` | Agenda avec un rendez-vous synthétique lisible ; éventuellement le détail et l’interviewer affecté. |
| **5** | **25 / 21 — Candidature** | `CAP-11-candidature.png` | Formulaire candidat avec données synthétiques et PDF choisi, ou confirmation du dépôt. Aucun nouvel appel IA nécessaire pour fournir l’image : un dossier existant convient. |
| **6** | **29 / 25 — Décision** | `CAP-15-decision.png` | Dossier existant où le responsable voit l’action de proposition ou d’embauche, avec les prérequis lisibles. Ne pas inventer ni déclencher une décision pour la seule capture. |

Si le temps manque : fournir d’abord **CAP-12 et CAP-13**. Les autres placeholders restent explicites et le texte est déjà complet. Les captures doivent venir de l’application, pas d’un générateur d’images. Utiliser des dossiers synthétiques ; masquer les éléments personnels ou d’accès. Ne pas convertir un libellé fixture en résultat IA réel.

**Liste consolidée pour la version 40 pages : aucun nouveau fichier requis.** Les six noms précédents restent valables ; seule la pagination change. Faire une seule collecte, puis prévenir l’agent lorsque tous les fichiers sont déposés pour reconstruire le PDF. Aucun rafraîchissement des services ni nouvelle soumission payante n’est requis par cette demande.

## Logos facultatifs — aucun blocage

| Identifiant | Fichier souhaité | Utilisation prévue | Source |
|---|---|---|---|
| LOGO-01 | `LOGO-01-beecoders.png` | Couverture, organisme d’accueil | Logo officiel fourni par l’entreprise ou l’utilisateur |
| LOGO-02 | `LOGO-02-institution.svg` | Couverture, établissement | Logo officiel de l’établissement, après identification |

Reçus le 13 novembre 2026 et intégrés à la couverture du PDF de présentation. L’établissement reste à préciser.

## État des captures — reçues le 13 novembre 2026

Les huit captures ont été reçues et intégrées (aucun recadrage) :

| ID | Fichier | Contenu fourni |
|---|---|---|
| CAP-10 | `CAP-10-offre-publication.png` | Brouillon prêt à publier + dialogue de confirmation, formulaire en arrière-plan |
| CAP-11 | `CAP-11-candidature.png` | Candidature vue candidat, CV prévisualisé |
| CAP-12 | `CAP-12-revue-cv.png` | Assistant de revue : PDF à gauche, champs extraits à droite |
| CAP-13 | `CAP-13-import-decisions.png` | Import CSV (gauche) + éditeur CSV en ligne (droite) |
| CAP-14 | `CAP-14-agenda.png` | Agenda en mode passé, plusieurs entretiens passés |
| CAP-15 | `CAP-15-decision.png` | Progression entretien/recrutement, entretien réussi, prochaine action |
| CAP-16 | `additional-inbox-view.png` | Boîte de réception RH avec plusieurs messages non lus |
| CAP-17 | `export-csv.png` | Export CSV ouvert dans un tableur (optionnelle) |

PNG transparent ou SVG officiel ; ne pas générer une imitation de logo. **Ces logos ne sont pas branchés automatiquement au rendu** : leur placement sera ajusté s’ils sont fournis. La couverture est déjà utilisable avec les noms en texte. Aucun téléchargement tenté sans connaître l’établissement ou l’identité visuelle officielle exacte.

## Informations de couverture

- Établissement et formation exacte : remplacer `[Établissement · Formation]` dans `metadata.json`.
- Confirmer l’auteur, l’encadrant déjà renseigné, l’année académique et le nom de travail **CAP**.
- Éventuel encadrant académique distinct et date exacte de la pré-soutenance ; sinon « Novembre 2026 » reste volontairement général.

## Pas d’illustration générée nécessaire

Les diagrammes expliquent le système ; les captures démontrent les usages. Aucun robot, cerveau, photo décorative, faux écran ou résultat inventé n’est nécessaire. Pas de service distant de placeholder : les emplacements sont dessinés localement par Typst, sans dépendance réseau.

## Diagrammes prêts pour la présentation et le rapport

| Page PDF | ID | Sujet |
|---|---|---|
| 14 | DIA-02 | Acteurs et cas d’utilisation |
| 15 | DIA-03 | Modèle métier conceptuel |
| 16 | DIA-04 | Architecture actuelle |
| 18 | DIA-05 | Extraction documentaire |
| 21 | DIA-07 | Source, correction et valeur effective |
| 22 | DIA-06 | Parcours de recrutement |

Sources dans `presentation/diagrams/`, SVG vectoriels dans `presentation/dist/diagrams/` après build. Le [README des diagrammes](../diagrams/README.md) explique les simplifications et la réutilisation. Aucune image externe à commander pour ces schémas.

## Visuels antérieurs conservés

Les six fichiers IMG-01 et CAP-02 à CAP-06 restent dans `assets/images/`, sans modification ni recadrage. Ils ne sont plus intégrés au PDF courant : les écrans d’octobre peuvent diverger du produit actuel. Provenance et anciennes pages dans `manifest.json`, sous `historicalAssets`.

### IMG-01 — provenance de l’ancienne illustration

Illustration fournie par l’utilisateur depuis `~/Downloads/3.png`, modèle externe non précisé. Ancien brief : trois personnes collaborant autour d’un dossier, illustration éditoriale sobre, palette bleu ardoise/vert/gris, format 4:3, sans texte ni logo ni interface lisible. Ce visuel n’est pas une preuve produit et aucune nouvelle génération n’est demandée.

## Relecture visuelle

À la demande de l’utilisateur, **plus de rasterisation ni lecture d’images de pages par l’agent** après son interruption du 13 novembre. L’utilisateur vérifie lui-même la mise en page dans le PDF. Quelques pages avaient été inspectées auparavant ; cela ne constitue pas une revue visuelle finale de toutes les pages.
