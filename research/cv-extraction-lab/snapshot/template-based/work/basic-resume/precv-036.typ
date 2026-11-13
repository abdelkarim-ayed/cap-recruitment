#import "src/lib.typ": *

#let name = "Morgan Ellis"
#let location = "Bristol, UK"
#let email = "morgan.ellis.cv@example.uk"
#let phone = "+44 7700 900036"

#show: resume.with(
  author: name,
  location: location,
  email: email,
  phone: phone,
  accent-color: "#335b63",
  font: "Liberation Sans",
  paper: "a4",
  author-position: left,
  personal-info-position: left,
)

== Profile

Practical administrator moving toward compliance support. Previous roles involved checking records, following procedures and helping people understand what information was needed. Comfortable asking when something does not match rather than guessing. Currently building experience with routine documentation and shared office systems.

== Experience

#work(title: "Compliance Support Assistant", location: "Bristol, UK", company: "West Quay Housing", dates: dates-helper(start-date: "2024", end-date: "Present"))
- Checks incoming supplier and property records for missing fields before they are added to the shared register.
- Follows up with colleagues when a document is out of date or a required confirmation is missing.
- Maintains a simple action log and prepares items for the monthly review meeting.
- Made a one-page opening checklist after routine checks were sometimes missed during busy handovers.

#work(title: "Shop Floor Assistant", location: "Bristol, UK", company: "Harbour Home Supplies", dates: dates-helper(start-date: "2021", end-date: "2023"))
- Helped customers locate products and explained basic return and delivery procedures.
- Recorded deliveries, flagged damaged items and supported stock counts.
- Shared handover notes with the next shift when customer issues remained open.

#work(title: "Office and Reception Cover", location: "Bristol, UK", company: "Elm Street Practice", dates: dates-helper(start-date: "2019", end-date: "2021"))
- Answered calls, booked appointments and filed routine paperwork.
- Scanned documents and directed confidential queries to the appropriate staff member.

== Education

#edu(institution: "City of Bristol College", location: "Bristol, UK", dates: dates-helper(start-date: "2018", end-date: "2019"), degree: "Business Administration studies, part-completed")

#edu(institution: "Secondary education", location: "Bristol, UK", dates: dates-helper(start-date: "2016", end-date: "2018"), degree: "Secondary education")

== Practical Skills

- Record checking and document filing
- Action tracking and clear handover notes
- Customer service and routine checklist use
- Excel and shared spreadsheets

== Community and Languages

#extracurriculars(activity: "Occasional volunteer — community advice centre appointment forms and reception preparation", dates: "Occasional")

English: native · Polish: conversational

Full-time availability; open to office-based or hybrid work in Bristol.
