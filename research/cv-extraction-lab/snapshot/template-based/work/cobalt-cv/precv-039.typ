#import "../../templates/fontawesome/lib.typ": *

#let accent = rgb("#385b54")
#let sidebar-fill = rgb("#edf1ec")
#let sans-font = "Liberation Sans"
#let serif-font = "Liberation Serif"

#set document(title: [Harriet Morgan])
#set text(size: 9.5pt)
#show heading.where(level: 1): set text(font: sans-font, tracking: 0.07em, weight: 500, fill: accent)
#show heading.where(level: 2): set text(size: 11pt)
#set page(paper: "a4", margin: (top: 1cm, left: 1cm, right: 1cm, bottom: 1cm))

#align(center)[
  #text(font: serif-font, size: 25pt, fill: accent, weight: 500)[HARRIET MORGAN]
  #v(3pt)
  #text(size: 12pt, fill: accent)[Legal Operations Coordinator]
  #v(5pt)
  #fa-icon("envelope") harriet.morgan.cv\@example.uk #h(8pt)
  #fa-icon("phone") +44 7700 900039 #h(8pt)
  #fa-icon("location-dot") Cardiff, Wales
]

#line(length: 100%, stroke: accent)

Senior administrator with a practical background in legal support, case-file coordination and public-facing services. Good at keeping documents moving and explaining the next step without making the process feel more complicated. The work history includes a few different settings; the common thread is helping people and teams navigate detailed procedures.

#line(length: 100%, stroke: accent)

#grid(columns: (3fr, 7fr), column-gutter: 12pt,
  [
    == Education
    *Legal Administration Diploma* \
    Cardiff and Vale College \
    2012–2014

    == Practical strengths
    Case intake \
    Deadline tracking \
    Document control \
    Client communication \
    Process notes \
    Team coordination \
    Microsoft 365 \
    Shared case registers

    == Languages
    English — native \
    Welsh — conversational

    == Community
    Occasional volunteer at a local advice hub; prepares accessible appointment packs and helps organize drop-in sessions.
  ],
  [
    == Experience

    === Taff Vale Legal Services
    *Legal Operations Coordinator* — Cardiff | 2022–present
    - Coordinates new matter intake, checks key documents and routes queries to the right fee earner.
    - Tracks deadlines and outstanding client information in a shared case register.
    - Supports onboarding of two administrative colleagues and maintains short process notes.
    - Created a plain-language intake checklist for clients who found standard legal forms difficult to follow.

    === Cardiff Community Advice Partnership
    *Casework Administrator* — Cardiff | 2018–2022
    - Scheduled appointments and prepared case files for advisers working across housing and employment matters.
    - Recorded client communications and followed up when supporting documents were missing.
    - Helped adapt appointment reminders into clearer, shorter messages.

    === Severn Mutual Services
    *Office Supervisor* — Cardiff | 2014–2018
    - Managed reception cover, document handling and daily task allocation for a small office team.
    - Resolved routine service issues and passed sensitive matters to the appropriate manager.

    == Availability
    Full-time; hybrid preference in Cardiff.
  ],
)
