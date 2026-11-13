#import "@preview/vantage-cv:1.0.0": vantage-cv, styled-link, term, skill
#let configuration = yaml("configuration.yaml")


#vantage-cv(
  name: configuration.contacts.name,
  position: configuration.position,
  links: (
    (name: "email", link: "mailto:"+ configuration.contacts.email),
    (name: "website", link: configuration.contacts.website.url, display: configuration.contacts.website.displayText),
    (name: "github", link: configuration.contacts.github.url, display: configuration.contacts.github.displayText),
    (name: "linkedin", link: configuration.contacts.linkedin.url, display: configuration.contacts.linkedin.displayText),
    (name: "location", link: "https://maps.google.com/?q=" + configuration.contacts.address, display: configuration.contacts.address)
  ),
  tagline: (configuration.tagline),
  [

    #if configuration.jobs.len() > 0 [
      == Experience
      #for job in configuration.jobs [
        === #job.position \
        _#link(job.company.link)[#job.company.name]_ - #styled-link(job.product.link)[#job.product.name] \
        #term[#job.from --- #job.to][#job.location]
        #for point in job.description [- #point]
      ]
    ]
    
  ],
  [
    == Objective

    #configuration.objective


    #if configuration.education.len() > 0 [
      == Education
      #for edu in configuration.education [
        === #if edu.place.link != "" [
          #link(edu.place.link)[#edu.place.name]\
        ] else [
          #edu.place.name\
        ]
        #edu.from - #edu.to #h(1fr) #edu.location
        #edu.degree in #edu.major
      ]
    ]

    #if configuration.technical_expertise.len() > 0 [
      == Technical Expertise
      #for expertise in configuration.technical_expertise [#skill(expertise.name, expertise.level)]
    ]

    #if configuration.skills.len() > 0 [
      == Skills/Exposure
      #for skill in configuration.skills [• #skill]
    ]

    #if configuration.methodology.len() > 0 [
      == Methodology/Approach
      #for method in configuration.methodology [• #method]
    ]

    #if configuration.tools.len() > 0 [
      == Tools
      #for tool in configuration.tools [• #tool]
    ]

    #if configuration.achievements.len() > 0 [
      == Achievements/Certifications
      #for achievement in configuration.achievements [
        === #achievement.name\
        #achievement.description
      ]
    ]

  ]
)
