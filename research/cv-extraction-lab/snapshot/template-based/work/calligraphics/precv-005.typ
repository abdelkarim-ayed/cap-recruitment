#import "lib.typ": *
#import "../../templates/metalogo/lib.typ": LaTeX

#resume(
  author: (
    firstname: "Ronan",
    lastname: "Keating",
    email: "ronan.keating.example@example.ie",
    phone: "+353 1 555 0201",
    address: "Dublin, Ireland",
    github: "ronan-keating-example",
    positions: ("Financial Accountant", "Part-qualified ACCA"),
  ),
)[
  = Skills

  #aside-skill-item(
    "Technical",
    (strong[Month-end close], "Balance sheet recs", "Accruals/prepayments", "IFRS support", "VAT returns"),
  )

  #aside-skill-item("Tools", ("Excel / Power Query", "Sage Intacct", "Xero", "SQL (basics)"))
  #aside-skill-item("Languages", ("English (native)", "French (conversational)"))
  #aside-skill-item("Strengths", ("Attention to detail", "Clear working papers", "Stakeholder comms", "Process improvement"))

  = Education
  #resume-entry(
    title: "BA Accounting and Finance (2:1)",
    location: "Dublin Business School",
    date: "2016 - 2019",
    description: "Dublin, Ireland",
  )

  #resume-entry(
    title: "ACCA Applied Skills",
    location: "ACCA",
    date: "2022 - 2024",
    description: "Completed; Strategic Professional in progress",
  )

  = Certifications & Training
  #resume-entry(
    title: "Power Query & Reporting",
    location: "In-house/CPD",
    date: "2023",
    description: "Practical workbook automation",
  )

  = Additional
  - Availability: Full-time, hybrid (Dublin)
  - Driving: Full clean licence (Ireland)
  - Interests: Community rowing, volunteering at local fundraising events
][
  = Profile
  #resume-item[
    Financial accountant with seven years of progressive experience across AP/AR, reconciliations and month-end reporting in a multi-entity services business. Part-qualified ACCA with a track record of tightening close processes, producing audit-ready working papers, and following issues through to resolution. Practical with Excel/Power Query and comfortable liaising with auditors and operational teams.
  ]

  = Key Achievements
  #resume-item[
    - Reduced time spent consolidating bank extracts by automating with Power Query, cutting a recurring manual task down to a review step.
    - Documented and standardised the month-end reconciliation pack after a system migration, now used for onboarding and cover.
    - Maintained clean balance sheet reconciliations across three entities under a seven-day close timetable with minimal aged items.
  ]

  = Experience
  #resume-entry(
    title: "Financial Accountant",
    location: "Hawthorn Advisory Services",
    date: "Jan 2023 - Present",
    description: "Dublin, Ireland",
  )
  #resume-item[
    - Prepared monthly accounts and supporting schedules for three operating entities to a seven-day close timetable
    - Owned balance sheet reconciliations, investigated aged items and agreed corrective entries with the Finance Manager
    - Built and maintained a Power Query routine to consolidate multiple bank extracts into a single review workbook
    - Coordinated external audit requests, maintained evidence folders and explained supporting working papers
    - Reviewed VAT working papers and supported intercompany reconciliations
  ]

  #resume-entry(
    title: "Assistant Accountant",
    location: "Bracken Lane Facilities",
    date: "Jul 2020 - Dec 2022",
    description: "Dublin, Ireland",
  )
  #resume-item[
    - Posted accruals, prepayments and intercompany journals in support of quarterly management reporting
    - Prepared supplier statement reconciliations and chased missing invoices with operational teams
    - Produced cash flow schedules and flagged collection risks to senior finance colleagues
    - Assisted with year-end audit preparation and maintained supporting schedules
  ]

  #resume-entry(
    title: "Accounts Payable Assistant",
    location: "Harbourfold Distribution",
    date: "Jun 2019 - Jun 2020",
    description: "Dublin, Ireland",
  )
  #resume-item[
    - Matched purchase invoices to PO's and goods receipts, maintaining accurate supplier records
    - Prepared and reviewed weekly payment runs with appropriate checks and approvals
    - Maintained a log of disputed invoices and followed up to resolution
    - Responded to supplier queries promptly and kept the AP ledger tidy
  ]
]
