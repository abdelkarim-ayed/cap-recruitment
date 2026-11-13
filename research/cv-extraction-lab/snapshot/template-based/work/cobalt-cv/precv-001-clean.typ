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
    #block(fill: sidebar-fill, inset: 10pt, radius: 2pt)[
      = Contact
      daniel.mercer.example@example.net \
      +44 7700 900101 \
      London, United Kingdom

      = Skills
      == Languages
      TypeScript, Node.js, Python, SQL

      == Data / Infra
      PostgreSQL, Redis, Docker, GitHub Actions

      == Practices
      REST APIs, Testing, Observability, Performance

      == Languages
      - English (native)

      == Certifications
      - AWS Certified Developer - Associate (2023)
    ],
    [
      #text(font: serif-font, size: 28pt, fill: accent)[DANIEL MERCER]
      #v(4pt)
      #text(size: 14pt, fill: accent)[Senior Backend Engineer]

      = Profile
      Backend engineer with 8+ years building business-critical services. Experienced in taking ambiguous requirements to monitored production, with a focus on reliability, observability, and clean API design. Comfortable leading small teams and improving performance.

      = Northmere Commerce
      #emph[Senior Backend Engineer | London, UK | Mar 2022 - Present]
      - Led replacement of nightly order import with idempotent TypeScript service backed by PostgreSQL
      - Designed REST endpoints with contract tests and clear error responses
      - Cut slowest reporting query from 18s to under 3s
      - Established CI checks and coached two junior engineers

      = Alder Quay Systems
      #emph[Software Engineer | Reading, UK | Sep 2018 - Feb 2022]
      - Built Python ingestion jobs and SQL transformations for billing
      - Implemented retries and dashboards for integrations
      - Broke down large migrations into safe releases

      = Selected Project
      #emph[Supplier reconciliation service | Technical Lead | 2024]
      - Compared supplier statements to purchase records with PostgreSQL, Redis, structured logging
      - Wrote rollout plan and ran first reconciliation cycles with Finance
    ],
  )
)
