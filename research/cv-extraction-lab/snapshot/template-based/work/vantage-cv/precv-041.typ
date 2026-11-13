#import "@preview/vantage-cv:1.0.0": vantage-cv, styled-link, term, skill
#let configuration = yaml("configuration-041.yaml")
#vantage-cv(name: configuration.contacts.name, position: configuration.position,
  links: ((name: "email", link: "mailto:" + configuration.contacts.email), (name: "website", link: configuration.contacts.website.url, display: configuration.contacts.website.displayText), (name: "github", link: configuration.contacts.github.url, display: configuration.contacts.github.displayText), (name: "linkedin", link: configuration.contacts.linkedin.url, display: configuration.contacts.linkedin.displayText), (name: "location", link: "https://maps.google.com/?q=" + configuration.contacts.address, display: configuration.contacts.address)),
  tagline: (configuration.tagline),
  [
    == Expérience
    #for job in configuration.jobs [
      === #job.position \
      _#link(job.company.link)[#job.company.name]_ — #styled-link(job.product.link)[#job.product.name] \
      #term[#job.from --- #job.to][#job.location]
      #for point in job.description [- #point]
    ]
  ],
  [
    == Objectif
    #configuration.objective
    #parbreak()
    == Formation
    #for edu in configuration.education [
      === #edu.place.name\
      #edu.from - #edu.to #h(1fr) #edu.location
      #edu.degree en #edu.major
    ]
    == Compétences
    #for item in configuration.skills [- #item]
    == Outils
    #for item in configuration.tools [- #item]
  ],
)
