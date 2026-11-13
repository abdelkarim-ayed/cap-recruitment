#import "@preview/modern-cv:0.10.0": *

#let my-resume = resume.with(
  author: (
    firstname: "Thomas",
    lastname: "Lefevre",
    email: "thomas.lefevre.example@example.fr",
    positions: ("Plombier",),
  ),
)

#show: my-resume

= Test

Hello world
