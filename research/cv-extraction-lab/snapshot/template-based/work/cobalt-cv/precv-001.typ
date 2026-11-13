#import "../../templates/fontawesome/lib.typ": *

#let name         = "Daniel Mercer"
#let accent       = rgb("#002366")
#let sidebar-fill = rgb("#eef0f5")
#let sans-font    = "Liberation Sans"
#let serif-font   = "Liberation Serif"
#let col-ratio    = (3fr, 7fr)

#set document(title: [#upper(name)])
#set text(size: 10pt)
#show heading.where(level: 1): set text(font: sans-font, tracking: 0.1em, weight: 500, fill: accent)
#show heading.where(level: 2): set text(size: 12pt)
#set page(margin: (top: 1cm, left: 1cm, right: 1cm, bottom: 1cm))

#let resume-title() = text(font: serif-font, tracking: 0.1em, weight: 500, size: 28pt, fill: accent)[#upper(name)]

#let experience(company, role, location, dates, bullets) = [
  == #text(fill: accent)[#company]
  #grid(columns: (1fr, 1fr), align: (left, right), [ #emph[#role] ], [ #emph[#location | #dates] ])
  #for bullet in bullets { [- #bullet] }
]

#let education(institution, location, dates, degrees) = [
  == #text(fill: accent)[#institution]
  #grid(columns: (1fr, 1fr), align: (left, right), [ #emph[#location] ], [ #emph[#dates] ])
  #for degree in degrees { [- #degree] }
]

#let project(title, subtitle, bullets) = [
  == #text(fill: accent)[#title]
  #if subtitle != "" { [#emph[#subtitle]] }
  #for bullet in bullets { [- #bullet] }
]

#let pill-list(items) = {
  for item in items {
    box(stroke: 0.5pt + accent, radius: 3pt, inset: (x: 4pt, y: 2pt), fill: white)[#text(size: 9pt, fill: accent)[#item]]
    h(2pt)
  }
}

#grid(
  columns: col-ratio,
  column-gutter: 12pt,
  [
    #block(fill: sidebar-fill, inset: 10pt, radius: 2pt)[
      #v(6pt)
      == Contact
      #fa-icon("envelope") #link("mailto:daniel.mercer.example@example.net")[daniel.mercer.example\@example.net] \
      #fa-icon("phone") +44 7700 900101 \
      #fa-icon("location-dot") London, United Kingdom \
      #fa-icon("github") #link("https://github.com/daniel-mercer-example")[github.com/daniel-mercer-example] \
      #fa-icon("linkedin") #link("https://linkedin.com/in/daniel-mercer-example")[linkedin.com/in/daniel-mercer-example]

      == Skills
      === Languages
      #pill-list(("TypeScript", "Node.js", "Python", "SQL"))

      === Data / Infra
      #pill-list(("PostgreSQL", "Redis", "Docker", "GitHub Actions"))

      === Practices
      #pill-list(("REST APIs", "Testing", "Observability", "Performance"))

      === Leadership
      #pill-list(("Design reviews", "Mentoring", "Docs"))

      == Languages
      - English (native)

      == Certifications
      - AWS Certified Developer – Associate (2023)

      == Education
      #education("Westbridge University", "UK", "2015 – 2018", ("BSc Computer Science"))
    ],
    [
      #resume-title()
      #v(4pt)
      #text(size: 14pt, fill: accent)[Senior Backend Engineer]

      == Profile
      Backend engineer with 8+ years building business-critical services. Experienced in taking ambiguous requirements to monitored production, with a focus on reliability, observability, and clean API design. Comfortable leading small teams, improving performance, and making systems easier to operate.

      #experience(
        "Northmere Commerce",
        "Senior Backend Engineer",
        "London, UK",
        "Mar 2022 – Present",
        (
          "Led replacement of nightly order import with idempotent TypeScript service backed by PostgreSQL; added reconciliation reports",
          "Designed REST endpoints for fulfilment and support with contract tests and clear error responses",
          "Cut slowest reporting query from 18s to under 3s via indexing and query restructuring",
          "Established CI deployment checks and coached two junior engineers",
        ),
      )

      #experience(
        "Alder Quay Systems",
        "Software Engineer",
        "Reading, UK",
        "Sep 2018 – Feb 2022",
        (
          "Built Python ingestion jobs and SQL transformations for subscription billing",
          "Implemented retries and operational dashboards for payment/accounting integrations",
          "Broke down large migrations into safe releases with support handover notes",
        ),
      )

      #project(
        "Supplier reconciliation service",
        "Technical Lead | 2024",
        (
          "Led service comparing supplier statements to purchase records using PostgreSQL transactions, Redis coordination, structured logging",
          "Wrote rollout plan and ran first reconciliation cycles with Finance colleagues",
        ),
      )

      == Additional
      - Availability: Open to senior backend/engineer-lead roles (hybrid/London)
      - Interests: System design, mentoring, developer experience
    ],
  )
)
