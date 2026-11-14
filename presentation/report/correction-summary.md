# Passe ciblée du 14 novembre 2026

La structure en six chapitres et le niveau de concision sont conservés.

## Modifications

- **Chapitre 1** : démarche itérative et incrémentale avec approfondissement progressif des spécifications ; organisation par tâches, branches/worktrees et intégration, sans journal de développement ni succès CI supposé.
- **Chapitre 2** : tableau court reliant cinq choix techniques à leurs besoins et contreparties.
- **Chapitre 5** : exemple synthétique enregistré de certification, de l’extrait du CV aux critères, à la requête, à la réponse et à la valeur en revue. Construction originale des questions précisée après consultation de `/home/ubuntu/cv-extraction-lab`, sans nouvelle campagne d’inférence.
- **Chapitre 6** : contrôles formulés plus directement ; « échec technique » corrigé en avis éliminatoire de l’entretien technique ; récit du cache retiré et synthèse alignée sur l’exemple présenté.
- **Forme** : introductions/conclusions harmonisées, légendes précises, disposition A4 du diagramme d’architecture et suppression des sauts forcés autour des diagrammes. Dernière correction bornée : renvois sans préfixe « Chapitre » doublé ni tiret, interligne et retours à la ligne des blocs de code, suppression de la page blanche initiale.
- **Typst** : `heading`, `cite`, `bibliography`, `label`, `ref` et `outline` gèrent les numéros, renvois et listes. La bibliographie BibLaTeX contient douze sources extérieures déjà consultées et une seule référence consolidée au projet. Les correspondances détaillées restent hors du PDF.

## Construction et contrôles documentaires

- PDF compilé : **51 pages, dont 44 pages de corps**, sans remplissage.
- Quinze figures et dix-huit tableaux ; aucun asset manquant, citation non résolue ou label dupliqué.
- Métadonnées Typst : six chapitres numérotés automatiquement de 1 à 6 ; légende et début de chacun des dix-huit tableaux sur la même page ; renvois de chapitres, section, figures et tableau résolus.
- Extraction textuelle native : aucun marqueur interne résiduel, préfixe de renvoi doublé ou citation numérique immédiatement répétée ; aucun problème d’encodage signalé. Inspection visuelle ciblée effectuée sur la couverture et les pages imprimées 23 (publication) et 31 (requête/réponse) : code sans chevauchement et renvoi « chapitre 3 » sans duplication. Pas de relecture visuelle exhaustive.
- Géométrie vectorielle : texte minimal du diagramme d’architecture porté d’environ 7,4 à 10,3 pt à sa taille dans le rapport ; modèle conceptuel réduit à 150 mm de hauteur avec texte minimal d’environ 11,4 pt. Ces mesures ne remplacent pas une relecture visuelle des diagrammes et captures. Avertissement Graphviz de métrique d’un caractère accentué du diagramme relationnel toujours non bloquant.
- `git diff --check` sans anomalie. Le contrôle synthétique du renderer a été adapté au nouveau format, **sans être exécuté**. Aucun test applicatif, appel fournisseur, accès aux clés, modification de limites ou gestion de services.

## Notes de suite

Les [notes de suite](../remaining-notes.md) et la [liste destinée à l’étudiant](student-checklist.md) rassemblent le contexte de mission, les éléments institutionnels, la préparation et les vérifications éventuelles. Le projet est considéré terminé comme prototype ; cette liste ne rouvre pas l’ancien backlog et ne vaut pas attestation de contrôles fonctionnels. Ces consignes ne figurent pas dans le rapport.

Le checkpoint publié comprend les sources, le PDF du rapport et la présentation. Les intermédiaires et notes privées restent ignorés.
