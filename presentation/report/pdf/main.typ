// All assets are rooted in presentation; compile with --root . from that directory.
#let report = json(sys.inputs.at("report-data", default: "/dist/report/report.json"))
#let meta = json("/metadata.json")
#let ink = rgb("263343")
#let accent = rgb("315b70")
#let muted = rgb("65727b")
#let pale = rgb("f3f5f6")

#set document(title: "CAP — Rapport de projet", author: ())
#set text(font: ("Libertinus Serif", "DejaVu Serif"), size: 11.5pt, lang: "fr", fill: ink)
#set page(paper: "a4", margin: (top: 25mm, bottom: 25mm, left: 26mm, right: 24mm), numbering: none)
#set par(justify: true, leading: 0.65em, spacing: 0.85em)
#let heading-numbering(..values) = {
  let nums = values.pos()
  if nums.len() == 1 { "Chapitre " + numbering("1", ..nums) + " —" }
  else { numbering("1.1", ..nums) }
}
#set heading(numbering: heading-numbering, supplement: [section])
#show ref: it => {
  let target = it.element
  if target != none and target.func() == heading {
    let supplement = if it.supplement == auto { target.supplement } else { it.supplement }
    link(target.location(), [#if supplement != none { [#supplement~] }#context numbering("1.1", ..counter(heading).at(target.location()))])
  } else { it }
}
#set outline(indent: 1.2em)
#show link: set text(fill: accent)
#show heading.where(level: 1): set text(size: 22pt, weight: "bold", fill: accent)
#show heading.where(level: 1): set block(above: 0pt, below: 17pt)
#show heading.where(level: 2): set text(size: 15pt, weight: "bold")
#show heading.where(level: 2): set block(above: 15pt, below: 8pt)
#show heading.where(level: 3): set text(size: 12pt, weight: "bold")
#show heading.where(level: 3): set block(above: 11pt, below: 6pt)
#show raw: set text(font: ("DejaVu Sans Mono", "Liberation Mono"), size: 8.5pt)
#show raw.where(block: true): it => {
  set text(font: ("DejaVu Sans Mono", "Liberation Mono"), size: 8.5pt)
  set text(hyphenate: false)
  set par(justify: false, leading: 5pt, spacing: 0pt)
  it.text.split("\n").map(line => text(line)).join(linebreak())
}
#show figure.caption: set text(size: 9pt)

#let inlines(nodes, bibliography: false) = {
  for node in nodes {
    if node.type == "text" { node.text }
    else if node.type == "strong" { strong(inlines(node.children, bibliography: bibliography)) }
    else if node.type == "emphasis" { emph(inlines(node.children, bibliography: bibliography)) }
    else if node.type == "code" { raw(node.text) }
    else if node.type == "link" {
      // No runtime network access: the PDF only contains an ordinary hyperlink.
      if node.href.starts-with("https://") or node.href.starts-with("http://") or node.href.starts-with("mailto:") {
        link(node.href, inlines(node.children, bibliography: bibliography))
      } else {
        // Local Markdown URLs remain navigable text; not interpreted as Typst paths.
        inlines(node.children, bibliography: bibliography)
        text(size: 9pt, fill: muted)[ (#node.href)]
      }
    }
    else if node.type == "citation" {
      cite(label(node.key))
    }
    else if node.type == "reference" { ref(label(node.target)) }
  }
}

#let render-figure(node) = {
  let asset = "/" + node.path
  let title = node.title
  let sizing = node.at("sizing", default: none)
  let body = if node.available {
    if sizing != none {
      // Preserve SVG proportions and avoid upscaling short diagrams. The portrait
      // image cap leaves at least 17 mm of the 247 mm body for caption and gap.
      image(asset, width: sizing.widthMm * 1mm, height: sizing.heightMm * 1mm, fit: "contain")
    } else {
      image(asset, width: 100%, height: if node.kind == "screenshot" { 105mm } else { 140mm }, fit: "contain")
    }
  } else {
    block(width: 100%, inset: 15pt, fill: pale, stroke: 0.6pt + rgb("c7d0d6"))[
      #align(center)[
        #text(weight: "bold")[#node.id — #title]
        #parbreak()
        #text(size: 10pt)[#if node.kind == "screenshot" { [Capture actuelle non fournie.] } else { [Diagramme non fourni.] }]
        #parbreak()
        #text(size: 8.5pt, fill: muted)[Fichier attendu : #raw(node.path)]
        #parbreak()
        #text(size: 9pt)[Emplacement réservé ; aucune image ni preuve d’exécution n’est simulée.]
      ]
    ]
  }
  [#figure(body, kind: image, caption: [#title], supplement: [Figure], placement: none)#label(node.id)]
}

#let inlines-text(value) = text(size: 9pt, value.replace("Tableau — ", ""))
#let render-table(node, bibliography: false) = {
  let columns = node.headers.len()
  let alignment = node.align.map(value => if value == "right" { right } else if value == "center" { center } else { left })
  let cells = ()
  for row in node.rows {
    for cell in row { cells.push(inlines(cell, bibliography: bibliography)) }
  }
  [#figure(
    table(
      columns: (1fr,) * columns,
      align: (x, y) => alignment.at(x, default: left),
      inset: (x: 6pt, y: 6pt),
      stroke: 0.4pt + rgb("ccd4d8"),
      fill: (x, y) => if y == 0 { pale } else { none },
      table.header(repeat: true, ..node.headers.map(cell => text(weight: "bold", inlines(cell, bibliography: bibliography)))),
      ..cells,
    ),
    kind: table,
    caption: inlines-text(node.caption),
    supplement: [Tableau],
    placement: none,
  )#label(node.id)]
}
// Long tables must be able to span pages; header rows repeat on subsequent pages.
#show figure.where(kind: table): set block(breakable: true)
#show figure.where(kind: table): set text(size: 9pt)
#show figure.where(kind: table): set figure.caption(position: top)
#show figure.caption.where(position: top): set block(sticky: true)

#let blocks(nodes, bibliography: false, frontmatter: false) = {
  for node in nodes {
    if node.type == "heading" {
      if node.level == 1 { pagebreak(weak: true) }
      let item = if bibliography {
        heading(level: calc.min(node.level + 1, 4), numbering: none, outlined: false, inlines(node.children, bibliography: true))
      } else if frontmatter {
        heading(level: node.level, numbering: none, outlined: false, inlines(node.children))
      } else {
        heading(level: node.level, outlined: node.numbered or node.level == 1, supplement: if node.level == 1 { [chapitre] } else { [section] }, numbering: if node.numbered { heading-numbering } else { none }, inlines(node.children))
      }
      [#item#label(node.id)]
    }
    else if node.type == "paragraph" {
      inlines(node.children, bibliography: bibliography)
      parbreak()
    }
    else if node.type == "list" {
      for entry in node.entries {
        block(above: 3pt, below: 3pt, inset: (left: (entry.depth * 10 + 12) * 1pt))[
          #grid(
            columns: (18pt, 1fr),
            gutter: 5pt,
            align(right)[#if entry.ordered { entry.marker } else { [•] }],
            inlines(entry.children, bibliography: bibliography),
          )
        ]
      }
      parbreak()
    }
    else if node.type == "table" { render-table(node, bibliography: bibliography) }
    else if node.type == "figure" { render-figure(node) }
    else if node.type == "code" {
      block(width: 100%, breakable: true, fill: pale, inset: 9pt)[
        #raw(node.text, block: true, lang: if node.language == "" { none } else { node.language })
      ]
    }
    else if node.type == "quote" {
      block(inset: (left: 12pt), stroke: (left: 1.5pt + rgb("c7d0d6")))[
        #blocks(node.blocks, bibliography: bibliography, frontmatter: frontmatter)
      ]
    }
    else if node.type == "rule" { line(length: 100%, stroke: 0.5pt + rgb("c7d0d6")) }
  }
}

// Start directly with the provisional title page; no empty cover placeholder.
#align(center + horizon)[
  #text(size: 13pt, fill: muted)[#meta.institution]
  #v(2pt)
  #text(size: 11pt, fill: muted)[#meta.program]
  #v(60pt)
  #text(size: 34pt, weight: "bold", fill: accent)[#meta.codename]
  #v(16pt)
  #text(size: 17pt)[#meta.subtitle]
  #v(6pt)
  #text(size: 12pt, fill: muted)[#meta.fullName]
  #v(50pt)
  #text(size: 11pt, fill: muted)[Projet de fin d’études · Rapport technique]
  #v(40pt)
  #text(size: 13pt)[#meta.author]
  #v(4pt)
  #text(size: 11pt, fill: muted)[Encadrant : #meta.supervisor]
  #v(4pt)
  #text(size: 11pt, fill: muted)[Organisme d’accueil : #meta.organization]
  #v(30pt)
  #text(size: 11pt, fill: muted)[Année universitaire #meta.academicYear]
]
#pagebreak()
#set page(numbering: "i", header: none, footer: context align(center, counter(page).display("i")))
#counter(page).update(1)
#for section in report.at("frontmatter", default: ()) {
  blocks(section.blocks, frontmatter: true)
  pagebreak(weak: true)
}
#outline(title: [Table des matières], depth: 2)
#pagebreak()
#outline(title: [Liste des figures], target: figure.where(kind: image))
#pagebreak()
#outline(title: [Liste des tableaux], target: figure.where(kind: table))
#pagebreak()
#set page(numbering: "1", header: align(right, text(size: 8pt, fill: muted)[CAP · Rapport de projet]), footer: context align(center, counter(page).display("1")))
#counter(page).update(1)
#if report.partial {
  block(width: 100%, fill: pale, inset: 10pt)[
    #strong[Assemblage partiel — document de travail]
    #parbreak()
    Cette version a été assemblée avec l’option explicite `--partial` ; elle ne constitue pas un rapport complet.
    #if report.missingChapters.len() + report.emptyChapters.len() > 0 {
      parbreak()
      [Chapitres absents ou vides : #((report.missingChapters + report.emptyChapters).join(", ")).]
    }
  ]
}
#for chapter in report.chapters {
  pagebreak(weak: true)
  blocks(chapter.blocks)
}
#context [#metadata((main_body_pages: counter(page).get().first())) <report-main-body-pages>]
#pagebreak()
#block[
  #set text(size: 10pt)
  #set par(justify: false, leading: 0.5em, spacing: 0.65em)
  #bibliography("/report/references.bib", title: [Bibliographie], style: "ieee")
]
