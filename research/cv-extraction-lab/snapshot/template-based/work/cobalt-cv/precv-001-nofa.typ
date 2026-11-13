#let name = "Daniel Mercer"
#let accent = rgb("#002366")
#let sidebar-fill = rgb("#eef0f5")
#let sans-font = "Liberation Sans"
#let serif-font = "Liberation Serif"
#let col-ratio = (3fr, 7fr)

#set document(title: [#upper(name)])
#set text(size: 10pt)
#show heading.where(level: 1): set text(font: sans-font, tracking: 0.1em, weight: 500, fill: accent)
#show heading.where(level: 2): set text(size: 12pt)
#set page(margin: (top: 1cm, left: 1cm, right: 1cm, bottom: 1cm))

#grid(
  columns: col-ratio,
  column-gutter: 12pt,
  [
    #block(fill: sidebar-fill, inset: 10pt)[
      == Contact
      daniel.mercer.example@example.net
    ],
    [
      #text(font: serif-font, size: 28pt, fill: accent)[DANIEL MERCER]
      == Profile
      Backend engineer with experience building business-critical services.
    ],
  )
)
