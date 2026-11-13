#import "../../templates/fontawesome/lib.typ": *

// ─── Configuration ────────────────────────────────────────────────────────────
// Edit these values to customize the look and feel of your resume.
// You should not need to modify anything outside this block for basic use.

#let name         = "Daniel Mercer"
#let accent       = rgb("#002366")
#let sidebar-fill = rgb("#eef0f5")
#let sans-font    = "Liberation Sans"
#let serif-font   = "Liberation Serif"
#let col-ratio    = (3fr, 7fr)
// ──────────────────────────────────────────────────────────────────────────────

#set document(title: [#upper(name)])
#set text(size: 10pt)
#show heading.where(level: 1): set text(font: sans-font, tracking: 0.1em, weight: 500, fill: accent)
#show heading.where(level: 2): set text(size: 12pt)

#set page(margin: (
  top: 1cm,
  left: 1cm,
  right: 1cm,
  bottom: 1cm,
))

// ─── Helper functions ─────────────────────────────────────────────────────────

// Renders your name in the header
#let resume-title() = text(
  font: serif-font,
  tracking: 0.1em,
  weight: 500,
  size: 28pt,
  fill: accent,
)[#upper(name)]

// Renders a work experience entry.
// Usage:
//   #experience(
//     "Company Name",
//     "Job Title",
//     "City, State",
//     "Start – End",
//     (
//       "Bullet point one.",
//       "Bullet point two.",
//     ),
//   )
#let experience(
  company,
  role,
  location,
  dates,
  bullets,
) = [
  == #text(fill: accent)[#company]

  #grid(
    columns: (1fr, 1fr),
    align: (left, right),
    [ #emph[#role] ], [ #emph[#location | #dates] ],
  )

  #for bullet in bullets {
    [- #bullet]
  }
]

// Renders an education entry.
// Usage:
//   #education(
//     "University Name",
//     "City, State",
//     "Start – End",
//     ("Degree One", "Degree Two"),
//   )
#let education(
  institution,
  location,
  dates,
  degrees,
) = [
  == #institution

  #location | #dates \
  #for degree in degrees {
    [ #text(weight: "bold")[#degree] \ ]
  }
]

// Renders a skill category in the sidebar.
// Pass items as an array of strings — they will be joined with " | ".
// Usage:
//   #skill-category("Languages", ("Python", "Rust", "TypeScript"))
#let skill-category(category, items) = [
  == #category

  #items.join(" | ")
]

// ─── Header ───────────────────────────────────────────────────────────────────

#align(center)[
  #resume-title()
  #set text(size: 10pt)
  #grid(
    columns: (1fr, 1fr, 1fr),
    align: center,
    [ #text(fill: accent)[#fa-icon("envelope", font: "Font Awesome 7 Free Solid")] #link("mailto:daniel.mercer.example@example.net")[daniel.mercer.example\@example.net] ],
    [ #text(fill: accent)[#fa-icon("phone", font: "Font Awesome 7 Free Solid")] +44 7700 900101 ],
    [ #text(fill: accent)[#fa-icon("location-dot", font: "Font Awesome 7 Free Solid")] London, United Kingdom ],
  )
]

#line(length: 100%, stroke: accent)

Backend engineer with 8+ years building business-critical services. Experienced in taking ambiguous requirements to monitored production, with a focus on reliability, observability, and clean API design. Comfortable leading small teams, improving performance, and making systems easier to operate.

#line(length: 100%, stroke: accent)

// ─── Body ─────────────────────────────────────────────────────────────────────

#grid(
  columns: col-ratio,
  rows: auto,
  fill: (sidebar-fill, none),
  inset: 5pt,
  column-gutter: 0.5cm,
  [
    // ── Sidebar ──────────────────────────────────────────────────────────────

    = #upper("Education")

    // Add or remove #education(...) blocks as needed.
    #education(
      "Stanford University",
      "Stanford, CA",
      "Sept '18 – June '20",
      ("MS in Computer Science",),
    )

    #education(
      "University of Michigan",
      "Ann Arbor, MI",
      "Sept '14 – May '18",
      ("BS in Computer Science", "BS in Mathematics"),
    )

    #line(stroke: (dash: "dashed", paint: accent), length: 90%)

    = #upper("Skills")

    // Add or remove #skill-category(...) blocks as needed.
    // Each block takes a category name and an array of items.
    #skill-category("Languages", ("Python", "Go", "TypeScript", "Rust", "Java", "C++"))
    #skill-category("Frameworks", ("FastAPI", "gRPC", "PyTorch", "React", "Django"))
    #skill-category("Tooling", ("uv", "ruff", "mypy", "pytest", "Webpack"))
    #skill-category("Databases", ("Postgres", "Redis", "Elasticsearch", "DynamoDB"))
    #skill-category("DevOps", ("Docker", "Kubernetes", "Helm", "GitHub Actions", "Terraform"))

  ],
  [
    // ── Main content ─────────────────────────────────────────────────────────

    = #upper("Work Experience")

    // Add or remove #experience(...) blocks as needed.
    #experience(
      "Stripe",
      "Senior Software Engineer, Payments Infrastructure",
      "San Francisco, CA",
      "Aug 2022 – Present",
      (
        "Architected a distributed rate-limiting service handling over 500K requests per second, reducing fraudulent transaction volume by 34% across all payment flows.",
        "Led a team of four engineers to redesign the payment retry pipeline, cutting failed payment recovery time from 48 hours to under 6 hours and recovering an estimated \$12M annually.",
        "Drove adoption of internal observability tooling across three teams, reducing mean time to detection for production incidents by 40%.",
        "Served as technical lead for a real-time fraud scoring microservice integrating gradient-boosted and neural network models, deployed across 12 global regions.",
        "Onboarded and mentored five engineers, establishing code review standards and internal documentation practices adopted org-wide.",
      ),
    )

    #experience(
      "Airbnb",
      "Software Engineer, Search & Ranking",
      "San Francisco, CA",
      "July 2020 – July 2022",
      (
        "Built and maintained ranking models for Airbnb's core search pipeline, improving booking conversion rate by 8% through feature engineering and A/B experimentation.",
        "Owned the real-time feature computation service powering search ranking, reducing p99 latency from 180ms to 55ms through caching and query optimization.",
        "Co-authored an internal paper on listless search personalization adopted as a standard approach across the ranking team.",
        "Redesigned the search index update pipeline to support near-real-time listing availability, reducing stale search results by 60% during peak booking periods.",
      ),
    )

    #experience(
      "Microsoft",
      "Software Engineering Intern, Azure Networking",
      "Redmond, WA",
      "May 2019 – Aug 2019",
      (
        "Implemented a distributed tracing system for internal Azure networking services, enabling engineers to diagnose cross-region latency regressions 3× faster.",
        "Contributed to the design and rollout of a load balancing algorithm that improved throughput by 22% under peak traffic conditions.",
      ),
    )

    #experience(
      "Stanford University",
      "Research Assistant, Systems Lab",
      "Stanford, CA",
      "Sept 2018 – June 2020",
      (
        "Researched fault-tolerant consensus protocols for geo-distributed systems, publishing findings at OSDI 2020 on reducing leader election overhead in high-latency networks.",
        "Teaching assistant for CS 149: Parallel Computing, holding weekly office hours and developing course materials for a class of 200 students.",
      ),
    )

  ],
)

#line(length: 100%, stroke: accent)
