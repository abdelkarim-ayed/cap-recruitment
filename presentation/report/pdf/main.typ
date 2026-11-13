// All assets are rooted in presentation; compile with --root . from that directory.
#let report = json(sys.inputs.at("report-data", default: "/dist/report/report.json"))
#let ink = rgb("263343")
#let accent = rgb("315b70")
#let muted = rgb("65727b")
#let pale = rgb("f3f5f6")

#set document(title: "CAP — Rapport de projet", author: ())
#set text(font: ("Libertinus Serif", "DejaVu Serif"), size: 11.5pt, lang: "fr", fill: ink)
#set page(paper: "a4", margin: (top: 25mm, bottom: 25mm, left: 26mm, right: 24mm), numbering: none)
#set par(justify: true, leading: 0.65em, spacing: 0.85em)
#set heading(numbering: none)
#set outline(indent: 1.2em)
#show link: set text(fill: accent)
#show heading.where(level: 1): it => block(above: 0pt, below: 17pt)[
  #text(size: 22pt, weight: "bold", fill: accent, it.body)
]
#show heading.where(level: 2): it => block(above: 15pt, below: 8pt)[
  #text(size: 15pt, weight: "bold", it.body)
]
#show heading.where(level: 3): it => block(above: 11pt, below: 6pt)[
  #text(size: 12pt, weight: "bold", it.body)
]
#show raw: set text(font: ("DejaVu Sans Mono", "Liberation Mono"), size: 8.5pt)
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
      let body = text(size: 9pt)[[#node.key]]
      if not bibliography and node.key in report.bibliographyKeys {
        link(label("bib-" + node.key), body)
      } else { body }
    }
  }
}

#let anchors(node) = {
  for key in node.at("anchors", default: ()) {
    [#metadata(key)#label("bib-" + key)]
  }
}

#let render-figure(node) = {
  let asset = "/" + node.path
  let title = node.title
  let sizing = node.at("sizing", default: none)
  let dedicated = sizing != none and sizing.dedicatedPage
  if dedicated { pagebreak(weak: true) }
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
  figure(body, kind: image, caption: [#title #text(fill: muted)[(#node.id)]], supplement: [Figure], placement: none)
  if dedicated { pagebreak(weak: true) }
}

#let inlines-text(value) = text(size: 9pt, value.replace("Tableau — ", ""))
#let render-table(node, bibliography: false) = {
  let columns = node.headers.len()
  let alignment = node.align.map(value => if value == "right" { right } else if value == "center" { center } else { left })
  let cells = ()
  for row in node.rows {
    for cell in row { cells.push(inlines(cell, bibliography: bibliography)) }
  }
  figure(
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
  )
}
// Long tables must be able to span pages; header rows repeat on subsequent pages.
#show figure.where(kind: table): set block(breakable: true)
#show figure.where(kind: table): set text(size: 9pt)

#let blocks(nodes, bibliography: false, frontmatter: false) = {
  for node in nodes {
    anchors(node)
    if node.type == "heading" {
      if bibliography {
        heading(level: calc.min(node.level + 1, 4), outlined: false, inlines(node.children, bibliography: true))
      } else if frontmatter {
        if node.level == 1 { pagebreak(weak: true) }
        heading(level: node.level, outlined: false, inlines(node.children))
      } else {
        if node.level == 1 { pagebreak(weak: true) }
        heading(level: node.level, inlines(node.children))
      }
    }
    else if node.type == "paragraph" {
      inlines(node.children, bibliography: bibliography)
      parbreak()
    }
    else if node.type == "list" {
      for entry in node.entries {
        anchors(entry)
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
    else if node.type == "reference-entry" {
      block(above: 10pt, below: 4pt)[#strong(inlines(node.identifier, bibliography: true))]
      for field in node.fields {
        strong(inlines(field.label, bibliography: true))
        [: ]
        inlines(field.children, bibliography: true)
        parbreak()
      }
    }
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

// Page 1 stays blank for the institution's own cover template.
#box()
#pagebreak()
// Page 2: simple text title page, to be replaced by the institution template later.
#align(center + horizon)[
  #text(size: 13pt, fill: muted)[Esprit School of Engineering]
  #v(2pt)
  #text(size: 11pt, fill: muted)[Génie informatique]
  #v(60pt)
  #text(size: 34pt, weight: "bold", fill: accent)[CAP]
  #v(16pt)
  #text(size: 17pt)[Plateforme de gestion du recrutement]
  #v(6pt)
  #text(size: 12pt, fill: muted)[Centralisation et Assistance au Parcours de recrutement]
  #v(50pt)
  #text(size: 11pt, fill: muted)[Projet de fin d’études · Rapport technique]
  #v(40pt)
  #text(size: 13pt)[Ayed Abdelkarim]
  #v(4pt)
  #text(size: 11pt, fill: muted)[Encadrant : Aziz Ben Ismail]
  #v(4pt)
  #text(size: 11pt, fill: muted)[Organisme d’accueil : BeeCoders]
  #v(30pt)
  #text(size: 11pt, fill: muted)[Année universitaire 2026–2027]
]
#pagebreak()
#set page(numbering: "i", header: none, footer: context align(center, counter(page).display("i")))
#counter(page).update(1)
#for section in report.at("frontmatter", default: ()) {
  blocks(section.blocks, frontmatter: true)
  pagebreak(weak: true)
}
#outline(title: [Table des matières], depth: 3)
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
#heading(level: 1)[Bibliographie]
#if report.missingReferences.len() > 0 {
  block(fill: pale, inset: 9pt)[Sources bibliographiques non fournies : #report.missingReferences.join(", ").]
}
#for section in report.references {
  blocks(section.blocks, bibliography: true)
}
