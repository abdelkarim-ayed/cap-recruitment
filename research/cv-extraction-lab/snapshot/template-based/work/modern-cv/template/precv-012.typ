#import "@preview/modern-cv:0.10.0": *
#import "sections/experience.typ": *
#import "sections/education.typ": *
#import "sections/skills.typ": *
#import "sections/projects.typ": *

#show: resume.with(
  author: (
    firstname: "Thomas",
    lastname: "Lefèvre",
    email: "thomas.lefevre.example@example.fr",
    phone: "+33 6 12 34 56 79",
    linkedin: "thomas-lefevre-example",
    address: "Lyon, France",
    positions: (
      "Plombier (Apprenti)",
      "Vendeur Bricolage",
    ),
  ),
  keywords: ("Plomberie", "Maintenance", "Bricolage"),
  description: "Thomas Lefevre CV - Plombier junior",
  language: "fr",
  colored-headers: true,
  show-footer: false,
  show-address-icon: true,
  paper-size: "a4",
)

= Profil

Jeune plombier en reconversion professionnelle, motivé et manuel. Expérience variée en commerce et maintenance de base. À l'aise avec les outils et les procédures, cherche un poste d'apprenti ou de plombier junior avec formation continue. Travaille bien en équipe et apprend vite.

= Expérience professionnelle

#resume-entry(
  title: "Apprenti Plombier",
  location: "Lyon, France",
  date: "Sep 2023 - Présent",
  description: "Plomberie Martin & Fils",
)

#resume-item[
  - Assistance sur chantiers de rénovation et dépannage
  - Préparation de matériaux, outillage et évacuation des déchets
  - Observation et aide aux gestes techniques (soudure, raccordements)
  - Entretien des outils et véhicules de service
]

#resume-entry(
  title: "Vendeur Bricolage (temps partiel)",
  location: "Lyon, France",
  date: "Mar 2021 - Août 2023",
  description: "Leroy Merlin",
)

#resume-item[
  - Conseil clients sur produits plomberie/chauffage
  - Mise en rayon, inventaires, gestion des stocks
  - Formation interne sur produits techniques
]

#resume-entry(
  title: "Serveur (temps partiel)",
  location: "Lyon, France",
  date: "2019 - 2021",
  description: "Brasserie Le Progrès",
)

#resume-item[
  - Service en salle, encaissement, préparation de salle
  - Travail en équipe sous pression
]

= Formation

#resume-entry(
  title: "CAP Plomberie",
  location: "Lyon, France",
  date: "2022 - 2024 (en cours)",
  description: "CFA du Bâtiment",
)

#resume-entry(
  title: "Baccalauréat Professionnel Maintenance des Équipements",
  location: "Lyon, France",
  date: "2019 - 2021",
  description: "Lycée La Martinière",
)

= Compétences

#resume-item[
  - Outils manuels et électroportatifs
  - Lecture de plans de base
  - Soudure (initiation)
  - Service client et conseil technique
  - Travail en équipe, autonomie
]

= Certifications

#resume-entry(
  title: "SST (Sauveteur Secouriste du Travail)",
  location: "Lyon, France",
  date: "2023",
  description: "Formation continue",
)

#resume-entry(
  title: "Habilitation électrique B0/H0",
  location: "Lyon, France",
  date: "2024",
  description: "Formation continue",
)

= Langues

#resume-item[
  - Français : langue maternelle
  - Anglais : bases professionnelles
]

= Bénévolat

#resume-entry(
  title: "Bénévole maintenance",
  location: "Lyon, France",
  date: "2024 - Présent",
  description: "Centre social de la Croix-Rousse",
)

#resume-item[
  - Aide à l'entretien et aux petites réparations
  - Organisation d'événements communautaires
]

= Informations complémentaires

#resume-item[
  - Permis B (véhicule léger)
  - Disponibilité : Temps plein, horaires flexibles
  - Centres d'intérêt : Bricolage, football, cuisine
  - Références : Sur demande
]
EOF
echo "done"