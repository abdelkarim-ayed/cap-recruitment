#import "../../templates/fontawesome/lib.typ": *
#let accent = rgb("#49606b")
#let sidebar-fill = rgb("#edf1f2")
#set document(title: [Maya Chen])
#set text(size: 9.5pt)
#show heading.where(level: 1): set text(font: "Liberation Sans", tracking: 0.06em, weight: 500, fill: accent)
#set page(paper: "a4", margin: (top: 1cm, left: 1cm, right: 1cm, bottom: 1cm))

#align(center)[#text(font: "Liberation Serif", size: 25pt, fill: accent)[MAYA CHEN] \
Assistante données et opérations · Ottawa \
maya.chen.cv\@example.ca · +1 202 555 0146]
#line(length: 100%, stroke: accent)

Assistante d'opérations fiable qui aime rendre les listes cohérentes et repérer les informations manquantes. Elle apprend le nettoyage de données et les bases de l'automatisation, sans se présenter comme spécialiste en apprentissage automatique.

#line(length: 100%, stroke: accent)
#grid(columns: (3fr, 7fr), column-gutter: 12pt,
  [
    == Formation
    Études postsecondaires en administration et analyse de données, en cours (depuis 2024).
    == Compétences
    Excel et Google Sheets \
    Nettoyage de données de base \
    Contrôles de cohérence \
    Documentation de processus \
    Python débutant \
    Communication écrite
    == Langues
    Anglais courant \
    Français intermédiaire
    == Engagement
    Bénévole en réemploi numérique; trie les demandes et met à jour l'état des appareils.
  ],
  [
    == Expérience
    === Northbank Community Services
    *Adjointe aux opérations* — Ottawa | 2023–aujourd'hui
    - Met à jour des tableaux de suivi et vérifie les doublons ou champs incomplets.
    - Prépare des résumés simples pour les réunions et signale les chiffres à confirmer.
    - Aide à organiser les demandes et documenter les étapes de traitement.
    === Marché Maple
    *Agente de service* — Ottawa | 2020–2023
    - Répondait aux questions des clients et tenait des registres de caisse et de stock.
    - Aidait à rapprocher les bordereaux de livraison avec les articles reçus.
    == Projet bénévole
    Maintient un tableau partagé pour une initiative de réemploi informatique : statut des appareils, vérifications et prochaine action. Utilise des formules simples et fait relire les changements importants.
  ],
)
