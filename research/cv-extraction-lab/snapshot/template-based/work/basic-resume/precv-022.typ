#import "src/lib.typ": *

#let name = "Camille Moreau"
#let location = "Nantes, France"
#let email = "camille.moreau.cv@example.fr"
#let phone = "+33 6 00 00 00 22"

#show: resume.with(author: name, location: location, email: email, phone: phone, accent-color: "#7b4c38", font: "Liberation Sans", paper: "a4", author-position: left, personal-info-position: left)

== Profil

Je viens surtout de postes où il faut écouter, comprendre le besoin et trouver une solution concrète. Je passe maintenant vers la vente aux professionnels. Je n'ai pas encore un parcours commercial très long, mais je connais les produits, les commandes et les retours clients. Je préfère vérifier une information plutôt que promettre quelque chose d'incertain.

== Expérience

#work(title: "Assistante commerciale", location: "Nantes, France", company: "Atelier Fournier", dates: dates-helper(start-date: "2023", end-date: "Present"))
- Prépare des devis simples et rassemble les informations nécessaires aux commandes des petits clients professionnels.
- Vérifie les disponibilités avec l'atelier et informe les clients des délais réalistes.
- Suit les demandes après livraison et transmet les problèmes au bon interlocuteur.
- Aide à tenir une liste des clients à rappeler et des devis en attente.

#work(title: "Vendeuse conseil", location: "Rezé, France", company: "Comptoir des Matériaux", dates: dates-helper(start-date: "2019", end-date: "2022"))
- Conseillait artisans et particuliers sur des produits d'entretien et de rénovation.
- Préparait les commandes, contrôlait les références et aidait à résoudre les erreurs de livraison.
- Transmettait les demandes récurrentes à l'équipe pour améliorer les fiches produits.

== Compétences pratiques

- Accueil et découverte du besoin
- Devis simples et suivi de commandes
- Vérification de références et résolution de problèmes de livraison
- Tableur partagé, téléphone et courriel

== Engagement et langues

#extracurriculars(activity: "Bénévole — association de fabrication locale, commandes groupées et répartition des livraisons", dates: "Depuis 2022")

Français courant · Anglais intermédiaire · Espagnol élémentaire

== Disponibilité

Temps plein à Nantes; déplacements locaux possibles. Une courte période entre deux emplois reste peu documentée.
