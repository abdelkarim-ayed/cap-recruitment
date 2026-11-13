#import "lib.typ": *
#import "../../templates/metalogo/lib.typ": LaTeX

#resume(
  author: (
    firstname: "Julien",
    lastname: "Moreau",
    email: "julien.moreau.example@example.fr",
    phone: "+33 6 12 34 56 80",
    address: "Lyon, France",
    github: "",
    positions: ("Chef de Projet", "Coordinateur"),
  ),
)[
  = Compétences

  #aside-skill-item(
    "Gestion de projet",
    (strong[Suivi de planning], "Échéances", "Coordination d'équipes"),
  )

  #aside-skill-item("Outils", ("Excel", "MS Project (basique)", "Communication"))
  #aside-skill-item("Langues", ("Français : langue maternelle", "Anglais : professionnel"))
  #aside-skill-item("Atouts", ("Résolution de problèmes", "Relation client", "Organisation"))

  = Formation
  #resume-entry(
    title: "Licence Pro Gestion de Projet",
    location: "Université Lumière Lyon 2",
    date: "2016 - 2019",
    description: "Lyon, France",
  )

  #resume-entry(
    title: "Baccalauréat STMG",
    location: "Lycée La Martinière",
    date: "2016",
    description: "Lyon, France",
  )

  = Complément
  - Permis B
  - Bénévole à la Croix-Rouge (logistique) — 2023 - Présent
  - Centres d'intérêt : Organisation, sport, lecture
][
  = Profil
  #resume-item[
    Coordinateur de projets avec une expertise spécifique en gestion de planning et suivi d'échéances. A travaillé dans plusieurs secteurs, ce qui rend le parcours moins lisible mais apporte une expérience pratique variée. Très à l'aise avec les outils de suivi et la coordination d'équipes, moins à l'aise avec les aspects stratégiques ou formels.
  ]

  = Expérience

  #resume-entry(
    title: "Coordinateur de Projets",
    location: "BTP Services Lyon",
    date: "Mar 2022 - Présent",
    description: "Lyon, France",
  )
  #resume-item[
    - Suivi des plannings et coordination des équipes sur chantiers
    - Relation avec les sous-traitants et les clients
    - Préparation des rapports d'avancement et des points de situation
    - Gestion des commandes et des livraisons de matériel
  ]

  #resume-entry(
    title: "Assistant de Direction",
    location: "Groupe ALP",
    date: "Sep 2019 - Feb 2022",
    description: "Lyon, France",
  )
  #resume-item[
    - Organisation des déplacements et réunions
    - Suivi des dossiers administratifs et facturation
    - Gestion des plannings des équipes
  ]

  #resume-entry(
    title: "Employé de Bureau",
    location: "Mairie de Lyon",
    date: "2017 - 2019",
    description: "Lyon, France",
  )
  #resume-item[
    - Accueil du public, gestion des dossiers
    - Saisie de données et archivage
  ]
]
