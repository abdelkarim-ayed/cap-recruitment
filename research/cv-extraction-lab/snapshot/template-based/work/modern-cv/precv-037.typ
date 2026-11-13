#import "lib.typ": *

#show: resume.with(
  author: (
    firstname: "Nicolas",
    lastname: "Perrin",
    email: "nicolas.perrin.cv@example.fr",
    phone: "+33 6 00 00 00 37",
    address: "Lyon, France",
    linkedin: "nicolas-perrin-immobilier",
    positions: ("Assistant gestion immobilière", "Maintenance de bâtiments"),
  ),
  profile-picture: image("../../templates/modern-cv/template/assets/profile.png"),
  language: "fr",
  colored-headers: true,
  show-footer: false,
  show-address-icon: true,
  paper-size: "a4",
)

= Profil

Profil junior orienté vers l'entretien et la gestion quotidienne de bâtiments. A commencé par des tâches pratiques sur site et prend progressivement part à la coordination des demandes, des prestataires et des petites interventions. Apprend mieux en observant et en faisant; souhaite consolider ses bases dans une équipe expérimentée.

= Expérience

#resume-entry(
  title: "Assistant de site",
  location: "Lyon, France",
  date: "2023 – Aujourd'hui",
  description: "Résidences du Parc",
)
#resume-item[
  - Réceptionne les demandes des occupants et note les problèmes à transmettre à l'équipe technique.
  - Prépare les accès pour les interventions et confirme les rendez-vous avec les prestataires.
  - Effectue des vérifications visuelles dans les parties communes et signale les réparations à planifier.
  - Tient un journal photo avec date et emplacement pour suivre les défauts récurrents; l'équipe l'utilise lors des rondes hebdomadaires.
]

#resume-entry(
  title: "Agent polyvalent d'entretien",
  location: "Villeurbanne, France",
  date: "2020 – 2023",
  description: "Atelier Besson",
)
#resume-item[
  - Réalisait de petites réparations, remplacements simples et travaux de remise en état sous consigne.
  - Préparait les outils et matériaux, rangeait les zones de travail et signalait les besoins de réapprovisionnement.
  - Utilisait un tableur partagé pour noter les interventions terminées et les tâches en attente.
]

= Contribution pratique

Le journal photo évite de décrire plusieurs fois le même défaut sans contexte : chaque note indique l'endroit, la date et si le problème est revenu après réparation. L'outil reste volontairement simple et est utilisé lors des rondes.

= Formation

#resume-entry(
  title: "CAP Maintenance de bâtiments de collectivités",
  location: "Lycée professionnel des Canuts, Lyon",
  date: "2018 – 2020",
)

#resume-entry(
  title: "Sécurité des interventions et accueil des prestataires",
  location: "Formation interne",
  date: "2023",
)

= Compétences pratiques

#resume-item[
  - Petite maintenance et outils manuels courants
  - Contrôle visuel et suivi des demandes
  - Coordination des accès et relation avec les occupants
  - Utilisation d'un tableur partagé
]

= Engagement et langues

#resume-item[
  - Aide ponctuelle à une association de quartier pour préparer les salles et le matériel d'événements.
  - Français courant; anglais élémentaire.
]

= Disponibilité

Temps plein; préférence pour un poste de terrain dans la métropole de Lyon.
