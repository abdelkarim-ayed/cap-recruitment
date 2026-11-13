#import "../../templates/fontawesome/lib.typ": *

#let name = "Daniel Mercer"
#let accent = rgb("#002366")
#let sidebar-fill = rgb("#eef0f5")
#let sans-font = "Liberation Sans"
#let serif-font = "Liberation Serif"
#let col-ratio = (3fr, 7fr)

#set document(title: [#name])
#set text(size: 10pt)
#show heading.where(level: 1): set text(font: sans-font, fill: accent)

#grid(
  columns: col-ratio,
  column-gutter: 12pt,
  [
    #block(fill: sidebar-fill, inset: 8pt)[
      = Contact
      #fa-icon("envelope") daniel.mercer.example@example.net
    ],
    [
      #text(font: serif-font, size: 24pt, fill: accent)[DANIEL MERCER]
      = Profile
      Backend engineer with experience building business-critical services.
    ]
  )
)
