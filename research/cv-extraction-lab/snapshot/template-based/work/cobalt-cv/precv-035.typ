#import "../../templates/fontawesome/lib.typ": *

#let name = "Nadia Bouchard"
#let accent = rgb("#654321")
#let sidebar-fill = rgb("#f1eee8")
#let sans-font = "Liberation Sans"
#let serif-font = "Liberation Serif"
#let col-ratio = (3fr, 7fr)

#set document(title: [#name])
#set text(size: 9.5pt)
#show heading.where(level: 1): set text(font: sans-font, tracking: 0.08em, weight: 500, fill: accent)
#show heading.where(level: 2): set text(size: 11pt)
#set page(paper: "a4", margin: (top: 1cm, left: 1cm, right: 1cm, bottom: 1cm))

#align(center)[
  #text(font: serif-font, size: 25pt, fill: accent, weight: 500)[NADIA BOUCHARD]
  #v(3pt)
  #text(size: 12pt, fill: accent)[Technicienne spécialisée en recherche biomédicale]
  #v(5pt)
  #fa-icon("envelope") nadia.bouchard.cv\@example.net #h(8pt)
  #fa-icon("phone") +1 202 555 0135 #h(8pt)
  #fa-icon("location-dot") Montréal, Québec
]

#line(length: 100%, stroke: accent)

Technicienne de laboratoire ayant travaillé dans de petites équipes de recherche et de contrôle qualité. Expérience concrète en préparation d'échantillons, tenue de cahiers de laboratoire et vérification des lots. Parcours composé de contrats courts et d'une période moins documentée; souhaite aujourd'hui rejoindre une équipe où les procédures sont partagées et les responsabilités bien définies.

#line(length: 100%, stroke: accent)

#grid(
  columns: col-ratio,
  column-gutter: 12pt,
  [
      == Formation
      *DEC en techniques de laboratoire* \
      Collège du Saint-Laurent, Montréal \
      2015 – 2018

      == Compétences techniques
      Préparation d'échantillons \
      Micropipettes · centrifugation \
      PCR de base \
      Documentation de laboratoire \
      Contrôle qualité \
      Registres d'équipement \
      Excel

      == Formation professionnelle
      Bonnes pratiques de laboratoire, interne (2023) \
      SIMDUT, mise à jour (2024)

      == Langues
      Français courant \
      Anglais professionnel

      == Engagement
      Bénévole à un atelier scientifique de quartier depuis 2024; aide à préparer des activités de laboratoire simples pour les jeunes.
    ],
    [
      == Expérience en laboratoire

      === Institut biomédical du Canal
      *Technicienne de laboratoire principale* — Montréal | 2023 – 2025
      - Préparait réactifs et séries d'échantillons pour des analyses de biologie moléculaire selon les procédures établies.
      - Répartissait les tâches quotidiennes entre deux techniciennes lors des absences de la responsable.
      - Tenait à jour les cahiers de laboratoire, registres d'équipement et relevés de température.
      - A conçu une feuille de vérification croisée des identifiants après une incohérence d'étiquette repérée avant analyse; l'équipe l'a intégrée à la routine de préparation.

      === Centre de santé Nord-Rive
      *Assistante de recherche, contrat* — Montréal | 2021 – 2022
      - Préparait les dossiers d'échantillons et vérifiait la concordance entre formulaires et identifiants.
      - Aidait à organiser les consommables et documentait les écarts de procédure.

      === Laboratoires Vecteur
      *Technicienne contrôle qualité* — Laval | 2018 – 2020
      - Effectuait les contrôles de réception et mesures de routine sur des lots de réactifs.
      - Saisissait les résultats dans le système qualité et signalait les valeurs hors tolérance.

      === Période sans poste de laboratoire indiqué
      2020 – 2021

      == Contribution choisie
      Mise en place d'une vérification en deux étapes des étiquettes d'échantillons : comparaison avec la feuille de réception, puis validation par une seconde personne avant mise en rack. Préparation d'un modèle simple et explication de son utilisation à l'équipe.
    ],
  )
)
