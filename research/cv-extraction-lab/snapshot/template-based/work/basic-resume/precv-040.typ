#import "src/lib.typ": *

#let name = "Élodie Martin"
#let location = "Bruxelles, Belgique"
#let email = "elodie.martin.cv@example.be"
#let linkedin = "elodie-martin-accompagnement"
#let phone = "+32 470 00 00 40"

#show: resume.with(
  author: name,
  location: location,
  email: email,
  linkedin: linkedin,
  phone: phone,
  accent-color: "#5b3a68",
  font: "Liberation Sans",
  paper: "a4",
  author-position: left,
  personal-info-position: left,
)

== Profil

Professionnelle de l'accompagnement éducatif, attentive aux besoins concrets des apprenants et au fonctionnement quotidien des ateliers. Après plusieurs années en soutien de classe, elle prend davantage de responsabilités dans la préparation des activités et l'organisation du matériel. Elle préfère les outils simples, visibles et faciles à reprendre par toute l'équipe.

== Expérience

#work(
  title: "Référente d'atelier et accompagnement",
  location: "Bruxelles, Belgique",
  company: "Centre de formation Les Passerelles",
  dates: dates-helper(start-date: "2022", end-date: "Aujourd'hui"),
)
- Prépare les salles et le matériel pour des ateliers de remise à niveau et d'orientation professionnelle.
- Accompagne les participants qui ont besoin d'explications supplémentaires ou d'un rythme de travail adapté.
- A mis en place des fiches de prêt à code couleur pour le matériel partagé; les formateurs repèrent plus facilement les retours incomplets.
- Transmet les difficultés récurrentes à l'équipe pédagogique et participe aux ajustements d'organisation.

#work(
  title: "Assistante pédagogique",
  location: "Bruxelles, Belgique",
  company: "École communale du Parc",
  dates: dates-helper(start-date: "2017", end-date: "2022"),
)
- Aidait de petits groupes à suivre les consignes et à terminer les activités pratiques.
- Préparait les supports, suivait les présences et communiquait avec l'équipe enseignante.
- Apportait un soutien calme aux élèves pendant les transitions et les travaux de groupe.

== Pratique choisie

Le système de fiches de prêt est volontairement simple : chaque catégorie de matériel a une couleur, et la fiche suit le matériel jusqu'à son retour. L'équipe peut voir rapidement ce qui manque sans ajouter un nouvel outil numérique.

== Formation

#edu(
  institution: "Institut de formation sociale de Bruxelles",
  location: "Bruxelles, Belgique",
  dates: dates-helper(start-date: "2019", end-date: "2020"),
  degree: "Certificat en accompagnement pédagogique",
)

#edu(
  institution: "Athénée du Canal",
  location: "Bruxelles, Belgique",
  dates: dates-helper(start-date: "2016", end-date: "2016"),
  degree: "Enseignement secondaire général",
)

== Compétences

- Accompagnement individuel et en petit groupe
- Préparation d'ateliers et adaptation des consignes
- Organisation de matériel et suivi des présences
- Communication avec les équipes pédagogiques
- Fiches de suivi, outils bureautiques courants

== Engagement et langues

#extracurriculars(activity: "Bénévole — activités de lecture, bibliothèque de quartier", dates: "2023 – aujourd'hui")

Français courant · Néerlandais intermédiaire · Anglais de base

== Informations complémentaires

Disponible à temps plein; préférence pour un horaire de journée compatible avec les activités éducatives. Portfolio non préparé pour le moment.
