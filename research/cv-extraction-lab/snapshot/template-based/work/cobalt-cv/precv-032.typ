#import "../../templates/fontawesome/lib.typ": *
#let accent = rgb("#65544b")
#let sidebar-fill = rgb("#f1ece7")
#set document(title: [Noé Laurent])
#set text(size: 9.5pt)
#show heading.where(level: 1): set text(font: "Liberation Sans", tracking: 0.06em, weight: 500, fill: accent)
#set page(paper: "a4", margin: (top: 1cm, left: 1cm, right: 1cm, bottom: 1cm))
#align(center)[#text(font: "Liberation Serif", size: 25pt, fill: accent)[NOÉ LAURENT] \
Service et coordination d'événements · Nice \
noe.laurent.cv\@example.fr · +33 6 00 00 00 32]
#line(length: 100%, stroke: accent)
Employé de l'hôtellerie attentif aux détails qui facilitent le service : horaires, places, besoins alimentaires transmis et matériel prêt à temps. Souhaite évoluer vers la préparation d'événements tout en restant proche du terrain.
#line(length: 100%, stroke: accent)
#grid(columns: (3fr, 7fr), column-gutter: 12pt,
  [
    == Formation
    CAP Commercialisation et services en hôtel-café-restaurant \
    Lycée hôtelier de Nice (2019–2021)
    == Compétences
    Mise en place \
    Accueil \
    Coordination avec cuisine \
    Réservations \
    Vérification du matériel
    == Langues
    Français courant \
    Italien intermédiaire
    == Engagement
    Bénévole lors de repas de quartier; aide à installer la salle.
  ],
  [
    == Expérience
    === Hôtel des Orangers
    *Commis de salle* — Nice | 2023–2025
    - Prépare la salle, vérifie le matériel et transmet les besoins alimentaires.
    - Coordonne les changements de table avec la cuisine et l'accueil.
    - A dessiné un plan simple de reconfiguration pour les petits événements privés.
    === Café du Port
    *Employé polyvalent* — Nice | 2021–2023
    - Accueillait les clients, préparait les commandes et aidait à la fermeture.
    - Suivait les réservations et signalait les changements de dernière minute.
    == Tâche choisie
    Pour un événement, a préparé un plan papier avec les tables, les changements de places et le matériel requis afin que l'équipe répartisse les préparatifs avant l'arrivée des invités.
  ],
)
