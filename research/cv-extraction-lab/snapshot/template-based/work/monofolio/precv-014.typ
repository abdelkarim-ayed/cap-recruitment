#import "lib.typ": *
#show: resume.with(contact-info-position: center, contacts-separator: [#h(0.45em)◆#h(0.45em)], inline-separator: [#h(0.35em)/#h(0.35em)], link-color: rgb("#38556b"), accent-color: rgb("#38556b"), font: "Libertinus Serif", font-size: 10.5pt, line-spacing: 0.65em, entry-spacing: 0.325em, page-margin: 0.55in, list-marker: [--], justify: true)

#contact-info(name: [Éric Laurent], phone: [+32 470 00 00 14], email: [eric.laurent.cv\@example.be], address: [Liège, Belgique])
#summary[
  J'ai travaillé dans plusieurs environnements de production et de service. Ce qui revient souvent : clarifier les priorités, rendre les consignes utilisables et transmettre les points ouverts au bon moment. Après une période moins documentée, je souhaite reprendre un rôle où l'expérience du terrain compte autant que les outils de suivi.
]

#experience(title: [Coordinateur de production], company: [Atelier Meuse], location: [Liège], start-date: [2022], end-date: [Aujourd'hui], [Suit le programme quotidien et vérifie les besoins en composants avec l'équipe magasin.], [Réunit les informations de production, maintenance et qualité pour les points de coordination.], [A simplifié le tableau de relève afin de distinguer arrêt en cours, action attendue et personne à contacter.])
#experience(title: [Référent d'équipe], company: [Conditionnement Ardenne], location: [Seraing], start-date: [2017], end-date: [2021], [Organisait la répartition des tâches et accompagnait les collègues lors des changements de série.], [Vérifiait les enregistrements de lot et transmettait les écarts au responsable qualité.], [A participé à la mise à jour des consignes de nettoyage et de remise en route.])
#experience(title: [Agent polyvalent], company: [Service Logis], location: [Liège], start-date: [2013], end-date: [2016], [Assurait le suivi de demandes d'entretien et la coordination des accès aux locaux.])
#experience(title: [Période d'activité non détaillée], company: [Liège], location: [Belgique], start-date: [2021], end-date: [2022])

#project(name: [Tableau de relève d'équipe], info: [Amélioration opérationnelle], start-date: [2023], end-date: [2023], [Sépare les informations urgentes des tâches à planifier, avec un responsable et une prochaine vérification.])

#education(degree: [Formation professionnelle en organisation de production], school: [Promotion sociale de Liège], location: [Liège], start-date: [2010], end-date: [2012])
#education(degree: [Formation interne aux pratiques de sécurité et d'hygiène], school: [Atelier Meuse], location: [Liège], start-date: [2023], end-date: [2023])

#skillset(category: [Opérations], skills: [Coordination de production, relèves d'équipe, suivi de composants, consignes de travail])
#skillset(category: [Collaboration], skills: [Enregistrements de lot, communication avec maintenance et qualité, tableurs])
#project(name: [Bénévolat — coopérative alimentaire], info: [Liège], start-date: [2022], end-date: [Aujourd'hui], [Aide à organiser l'emballage et la transmission des consignes pour les distributions hebdomadaires.])
#skillset(category: [Langues et disponibilité], skills: [Français courant, néerlandais de base, temps plein, horaires planifiés possibles])

#print-contact
#print-summary
#print-experience
#print-projects
#print-education
#print-skills
