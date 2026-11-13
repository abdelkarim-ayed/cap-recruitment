// Text source: draft.md; page structure/assets: prepare-reading-slides.mjs.
#let ink = rgb("172b4d")
#let muted = rgb("64748b")
#let accent = rgb("0f766e")
#let light = rgb("eff6f6")
#let slides = json("../dist/reading-slides.json")
#let meta = json("../metadata.json")
#set page(width: 13.333in, height: 7.5in,
  margin: (left: 0.65in, right: 0.65in, top: 0.44in, bottom: 0.62in),
  fill: white,
  footer: context {
    let n = counter(page).get().first()
    let slide = slides.at(n - 1)
    if slide.kind == "content" {
      stack(spacing: 8pt,
        line(length: 100%, stroke: 0.5pt + rgb("dbe4ed")),
        grid(columns: (1fr, 0.7in), column-gutter: 18pt,
          text(size: 9pt, fill: muted, slide.source),
          align(right)[#text(size: 11pt, fill: accent)[#n / #slides.len()]]))
    } else { align(right)[#text(size: 11pt, fill: muted)[#n / #slides.len()]] }
  })
#set text(font: "Liberation Sans", size: 21pt, fill: ink, lang: "fr")
#set par(leading: 0.48em, spacing: 0pt)
#let inline(value) = {
  for (i, part) in value.split("**").enumerate() {
    if calc.rem(i, 2) == 1 { text(weight: "bold", part) } else { text(part) }
  }
}
#let items-view(items, size: 21pt, paragraph: false) = {
  set text(size: size)
  stack(spacing: 18pt, ..items.map(item => {
    if item.bullet {
      grid(columns: (10pt, 1fr), column-gutter: 10pt,
        text(fill: accent, size: 18pt)[•], inline(item.text))
    } else if paragraph {
      block(width: 100%)[#inline(item.text)]
    } else {
      block(fill: light, stroke: (left: 3pt + accent),
        inset: (x: 14pt, y: 12pt), radius: 3pt, width: 100%)[
        #set text(size: size - 1pt)
        #inline(item.text)
      ]
    }
  }))
}
#let pending-image(visual) = block(width: 100%, height: 2.6in,
  fill: rgb("f8fafc"), stroke: 0.7pt + rgb("dbe4ed"), radius: 6pt, inset: 20pt)[
  #align(center + horizon)[
    #text(size: 11pt, fill: accent, tracking: 1pt)[#visual.id]
    #v(15pt)
    #text(size: 18pt, fill: muted)[#visual.label]
    #v(12pt)
    #text(size: 12pt, fill: muted)[#if visual.kind == "capture" { [Capture à fournir] } else { [Illustration à générer] }]
  ]
]
#let cover() = {
  stack(spacing: 22pt,
    grid(columns: (1fr, auto), column-gutter: 20pt, align: horizon,
      stack(spacing: 2pt,
        text(size: 13pt, fill: muted)[#meta.institution],
        text(size: 11pt, fill: muted)[#meta.program]),
      box(height: 34pt)[#image("../assets/images/LOGO-02-institution.svg", height: 34pt, fit: "contain")]),
    line(length: 80pt, stroke: 3pt + accent),
    text(size: 76pt, weight: "bold", fill: ink)[#meta.codename],
    text(size: 29pt, fill: accent)[#meta.subtitle],
    text(size: 15pt, fill: muted)[#meta.fullName],
    block(width: 80%)[#text(size: 21pt)[#meta.mission]],
    grid(columns: (1fr, 1fr), column-gutter: 30pt,
      stack(spacing: 10pt,
        text(size: 12pt, fill: muted)[PRÉSENTÉ PAR],
        text(size: 19pt)[#meta.author],
        text(size: 12pt, fill: muted)[ENCADREMENT],
        text(size: 19pt)[#meta.supervisor]),
      stack(spacing: 10pt,
        text(size: 12pt, fill: muted)[ORGANISME D’ACCUEIL],
        image("../assets/images/LOGO-01-beecoders.png", height: 26pt, fit: "contain"),
        text(size: 12pt, fill: muted)[#upper(meta.occasion)],
        text(size: 17pt)[#meta.date · #meta.academicYear])))
}
#let divider(slide) = {
  v(0.6in)
  stack(spacing: 24pt,
    text(size: 72pt, fill: rgb("b7d8d3"), weight: "bold")[#slide.sectionNumber],
    line(length: 90pt, stroke: 3pt + accent),
    text(size: 44pt, weight: "bold")[#slide.title],
    block(width: 80%)[#text(size: 22pt, fill: muted)[#slide.summary]])
}
#let body(slide) = {
  if slide.visual != none and slide.visual.kind == "diagram" {
    stack(spacing: 12pt,
      align(center)[#image(slide.visual.path, width: 100%, height: 3.65in, fit: "contain")],
      items-view(slide.items, size: 17pt))
  } else if slide.table.len() > 0 {
    table(columns: (0.85fr, 1.15fr, 1fr), inset: (x: 14pt, y: 12pt),
      stroke: 0.5pt + rgb("dbe4ed"),
      fill: (x, y) => if y == 0 { rgb("e0f2f1") } else if calc.rem(y, 2) == 0 { rgb("f8fafc") } else { white },
       ..slide.table.enumerate().map(((i, row)) => row.map(cell => text(size: 17pt,
        weight: if i == 0 { "bold" } else { "regular" })[#inline(cell)])).flatten())
  } else if slide.visual != none {
    let capture = slide.visual.kind == "capture"
    let wide = capture and slide.visual.id in ("CAP-17",)
    if wide {
      stack(spacing: 14pt,
        items-view(slide.items, size: 18pt),
        image(slide.visual.path, width: 100%, height: 2.9in, fit: "contain"))
    } else {
      grid(columns: if capture { (0.85fr, 1.65fr) } else { (1.1fr, 1fr) }, column-gutter: 26pt,
        items-view(slide.items, size: if capture { 18pt } else { 20pt }),
        if slide.visual.available {
          image(slide.visual.path, width: 100%, height: if capture { 4.3in } else { 3.6in }, fit: "contain")
        } else { pending-image(slide.visual) })
    }
  } else {
    items-view(slide.items, size: slide.at("bodySize", default: 21) * 1pt)
  }
}
#for (index, slide) in slides.enumerate() {
  if index > 0 { pagebreak() }
  if slide.kind == "cover" { cover() }
  else if slide.kind == "section" { divider(slide) }
  else {
    stack(spacing: 0pt,
      block(height: 0.75in)[
        #stack(spacing: 9pt,
          text(size: 11pt, fill: accent, tracking: 1.1pt)[\[ #upper(slide.section) \]],
          line(length: 54pt, stroke: 1.5pt + accent))
      ],
      block(height: 0.98in)[#text(size: 33pt, weight: "bold")[#slide.title]],
      block(height: 4.48in, width: 100%)[#body(slide)])
  }
}
