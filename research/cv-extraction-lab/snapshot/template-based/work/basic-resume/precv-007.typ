#import "../../templates/basic-resume/src/lib.typ": *

// Personal information
#let name = "Morgan Ellis"
#let location = "Manchester, UK"
#let email = "morgan.ellis.example@example.net"
#let github = "github.com/morgan-ellis-example"
#let linkedin = "linkedin.com/in/morgan-ellis-example"
#let phone = "+44 7700 900200"

#show: resume.with(
  author: name,
  location: location,
  email: email,
  github: github,
  linkedin: linkedin,
  phone: phone,
  accent-color: "#26428b",
  font: "New Computer Modern",
  paper: "us-letter",
  author-position: left,
  personal-info-position: left,
)

== Profile

Pragmatic, detail-oriented IT career-changer moving into IT support/helpdesk and junior web work. Brings informal tech help, a habit of clear documentation, and an interest in turning small fixes into repeatable steps. Looking for a junior IT/support role with room to learn.

== Key Skills

- Troubleshooting (Windows/macOS basics, printers/network basics)
- Documentation & user guidance
- HTML/CSS/JavaScript basics
- Git basics
- Basic CLI familiarity
- Ticketing mindset, clear written communication

== Projects

#project(
  name: "Home lab notes site",
  role: "Self-initiated",
  dates: dates-helper(start-date: "2024", end-date: "Present"),
)
- Built a simple static notes page to document fixes
- Kept a short checklist style write-up for recurring issues

#project(
  name: "Fix-it log",
  role: "Informal",
  dates: dates-helper(start-date: "2022", end-date: "Present"),
)
- Collected and documented solutions to common tech issues
- Focused on reproducible steps for non-technical users

== Work Experience

#work(
  title: "General/Admin Support",
  location: "Manchester, UK",
  company: "Retail (part-time)",
  dates: dates-helper(start-date: "2019", end-date: "2023"),
)
- Assisted customers with simple IT-adjacent queries (logins/printers)
- Kept clear records and escalated issues appropriately
- Developed clear communication and escalation habits

== Education & Training

#edu(
  institution: "Self-directed learning",
  location: "Manchester, UK",
  dates: dates-helper(start-date: "2023", end-date: "Present"),
  degree: "IT fundamentals, web basics, practical troubleshooting",
)
- Focus on hands-on exercises and documentation

== Additional

- Languages: English (native/fluent)
- Availability: Open to junior onsite/hybrid support roles
- Interests: Practical troubleshooting, clear documentation
