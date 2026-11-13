#import "lib.typ": *
#import "../../templates/metalogo/lib.typ": LaTeX

#resume(
  author: (
    firstname: "Ruth",
    lastname: "Bennett",
    email: "ruth.bennett.cv@example.uk",
    phone: "+44 7700 900055",
    address: "Sheffield, England",
    github: "",
    positions: ("Process Improvement Lead", "Production Operations"),
  ),
)[
  = Practical Skills
  #aside-skill-item("Process", ("Production support", "Trial coordination", "Work instructions"))
  #aside-skill-item("Operations", ("Shift handovers", "Basic data logging", "Maintenance coordination"))
  #aside-skill-item("Tools", ("Excel", "Controlled documents"))

  = Education
  #resume-entry(title: "Level 3 Diploma in Engineering Operations", location: "Sheffield College", date: "2014–2016", description: "Sheffield, England")
  #resume-entry(title: "Risk assessment basics and controlled document updates", location: "Internal training", date: "2023", description: "")

  = Languages
  #aside-skill-item("Languages", ("English: native", "Spanish: basic"))

  = Additional
  Full-time availability; prefers day shifts.
  Weekend project: restoring a small benchtop lathe with a family member; cleaning, checking and documenting parts before reassembly.
][
  = Profile
  #resume-item[
    Process specialist with a steady background in production support and small operational improvements. Often notices when a procedure is technically clear but awkward to follow during a busy shift. Has recently taken on more coordination of trial changes and handovers, and wants to grow into a project-focused plant role.
  ]

  = Experience
  #resume-entry(title: "Process Improvement Coordinator", location: "Calder Works", date: "2022–Present", description: "Sheffield, England")
  #resume-item[
    - Coordinates small production trials, recording the change, owner, review date and operator feedback.
    - Works with maintenance and shift teams to schedule trials around planned downtime.
    - Updates work instructions after approved changes and checks that the current version is available at the station.
    - Introduced a short restart checklist after changeovers, helping operators flag missing setup details before a run.
  ]

  #resume-entry(title: "Production Technician", location: "North Forge Components", date: "2017–2022", description: "Rotherham, England")
  #resume-item[
    - Supported daily production, basic equipment checks and routine quality records.
    - Raised recurring process issues with supervisors and helped test practical adjustments.
    - Showed new starters how to complete shift logs and follow safe setup steps.
  ]

  = Selected Improvement
  #resume-item[
    Worked with operators to add a short, consistent restart check after tool changes. The checklist captures setup confirmation and any issue for the next shift, rather than relying on informal verbal handover.
  ]
]
