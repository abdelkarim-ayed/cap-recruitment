#let entry(title, body, details) = [
    #heading(level: 2, title)
    #block(above: 0.3em, below: 0.3em, inset: (right: 1.5em), body)
    #block(above: 0.4em, below: 0.8em, text(fill: gray, size: 9.5pt, details))
]

#let resume(name: "", title: "", accent-color: rgb("db9df8"), margin: 100pt, aside: [], body) = {
  set page(margin: 0pt, background: place(top + right, rect(fill: accent-color.lighten(80%), width: 33.33333%, height: 100%)))
  set text(font: "Inria Sans", size: 11pt)
  set block(above: 0pt, below: 0pt)
  set par(justify: true, leading: 0.5em)

  {
    show heading.where(level: 1): set text(size: 32pt)
    show heading.where(level: 2): set text(size: 16pt)
    box(
      fill: accent-color,
      width: 100%,
      outset: 0pt,
      inset: (rest: margin, bottom: 0.3 * margin, top: 0.3 * margin),
      stack(
        spacing: 6pt,
        heading(level: 1, upper(name)), heading(level: 2, upper(title)))
    )
  }

  show heading: set text(fill: accent-color)

  grid(
    columns: (2fr, 1fr),
    block(outset: 0pt, inset: (top: 0.4 * margin, right: 0pt, rest: margin), stroke: none, width: 100%, {
        set block(above: 6pt)
        show heading.where(level: 1): it => context {
          let h = text(size: 16pt, upper(it))
          let dim = measure(h)
          stack(
            dir: ltr,
            h,
            place(
              dy: 6pt,
              dx: 8pt,
              horizon + left,
              line(stroke: accent-color, length: 100% - dim.width - 10pt)
            ),
          )
        }
        set text(size: 10.5pt)
        body
    }),
    block(inset: (bottom: margin, rest: 0.35 * margin), width: 100%, {
      show heading: it => align(right, upper(it))
      set list(marker: "")
      show list: it => {
        set par(justify: false, linebreaks: "optimized")
        set text(size: 10pt)
        align(right, it)
      }
      set text(size: 10pt)
      aside
    }),
  )
}