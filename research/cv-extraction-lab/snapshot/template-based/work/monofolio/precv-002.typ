#import "lib.typ": *

#show: resume.with(
  contact-info-position: center,
  contacts-separator: [#h(0.45em)◆#h(0.45em)],
  inline-separator: [#h(0.35em)/#h(0.35em)],
  link-color: rgb("#2F4F4F"),
  accent-color: rgb("#2F4F4F"),
  font: "Libertinus Serif",
  font-size: 11pt,
  line-spacing: 0.65em,
  entry-spacing: 0.325em,
  page-margin: 0.5in,
  list-marker: [--],
  justify: true,
)

#contact-info(
  name: [Amélie Hartmann],
  phone: [+33 6 12 34 56 78],
  email: [amelie.hartmann.example\@example.fr],
  address: [Lyon, France],
  linkedin: [amelie-hartmann-example],
  github: [amelie-hartmann-example],
)

#summary[
  Analyste de données junior à la recherche d'un premier poste en environnement commercial. À l'aise avec Excel/SQL et Power BI, rigoureuse dans le contrôle des données et soucieuse de rendre les indicateurs compréhensibles pour les équipes non techniques. Intéressée par le reporting fiable et l'amélioration des tableaux de bord.
]

#skillset(
  category: [Analyse de données],
  skills: [SQL, Excel, Tableaux croisés dynamiques, Power BI],
)

#skillset(
  category: [Langages & Outils],
  skills: [Python, pandas, Git],
)

#skillset(
  category: [Transversaux],
  skills: [Sens du détail, Esprit critique, Vulgarisation],
)

#experience(
  title: [Assistante Reporting],
  company: [Willowbank Retail Group],
  location: [Lyon, France],
  start-date: [Jan 2025],
  end-date: [Présent],
  [Élaboration de rapports hebdomadaires ventes/stocks pour 6 magasins],
  [Rapprochement retours/ventes et signalement d'écarts],
  [Création d'une page Power BI et documentation pour transfert de compétence],
)

#experience(
  title: [Vendeuse polyvalente (temps partiel)],
  company: [Brookfield Librairie],
  location: [Lyon, France],
  start-date: [Oct 2021],
  end-date: [Août 2024],
  [Accueil, caisse, inventaires tout en poursuivant ses études],
  [Tenue d'un suivi des commandes spéciales],
)

#project(
  name: [Tableau de bord transport en commun],
  info: [Python, pandas, SQLite],
  start-date: [2024],
  end-date: [2024],
  [Nettoyage de données GTFS et chargement dans SQLite],
  [Analyse de tendances saisonnières avec mise en garde sur les données manquantes],
  [Documentation des limites méthodologiques],
)

#education(
  degree: [Licence Économie, mention Assez Bien],
  school: [Université Jean Moulin Lyon 3],
  location: [Lyon, France],
  start-date: [2021],
  end-date: [2024],
)

#education(
  degree: [Baccalauréat Économique et Social],
  school: [Lycée Édouard Herriot],
  location: [Lyon, France],
  start-date: [2019],
  end-date: [2021],
)

#certification(
  name: [Microsoft Power BI Data Analyst],
  issuer: [Formation en ligne],
  date: [2025],
)

#certification(
  name: [Initiation SQL],
  issuer: [Auto-formation certifiante],
  date: [2024],
)

#print-contact
#print-summary
#print-skills
#print-experience
#print-projects
#print-education
#print-certifications
