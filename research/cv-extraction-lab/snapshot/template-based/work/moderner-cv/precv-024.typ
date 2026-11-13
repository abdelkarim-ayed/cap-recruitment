#import "lib.typ": *
#show: moderner-cv.with(
  name: "Morgan Reyes",
  lang: "en",
  social: (
    email: "morgan.reyes.example@example.net",
    phone: "+44 7700 900202",
    linkedin: "morgan-reyes-example",
  ),
  // Try to use a different accent color if supported via theme - moderner-cv has limited params
)

#align(right)[#image("profile.png", width: 2.5cm)]

= Profile
Results-oriented senior field sales professional with broad commercial experience across varied sectors. Comfortable building rapport, qualifying opportunities, and following up consistently. Pragmatic approach with a focus on practical outcomes; open to new sectors while leveraging proven relationship-building skills.

= Experience
#cv-entry-multiline(
  date: [2016 -- Present],
  employer: [Various SMEs],
  title: [Field Sales / Account Development],
  location: [Birmingham, UK],
  [
    - Developed and maintained client relationships across different territories
    - Qualified opportunities and followed up to move conversations forward
    - Adapted approach to different business types and buying cycles
    - Focused on reliable follow-up and clear communication
  ],
)
#cv-entry-multiline(
  date: [2012 -- 2016],
  employer: [Various],
  title: [Sales / Customer-facing Roles],
  location: [UK],
  [
    - Built strong interpersonal skills and resilience in target-driven environments
    - Developed practical understanding of customer needs and objections
  ],
)

= Skills
#cv-double-item[Sales][Relationship building, qualification, follow-up, objection handling][Business][Territory management, pipeline awareness, commercial awareness]
#cv-line[Communication][Clear, personable, persistent without being pushy]

= Languages
#cv-double-item[English][Fluent][Spanish][Conversational]

= Additional
#cv-line[Availability][Open to field sales/account development roles (UK-wide)]
#cv-line[Notes][Broad experience across sectors; specifics to be tailored per opportunity]
