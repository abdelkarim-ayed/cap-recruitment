#import "lib.typ": *
#import "../../templates/fontawesome/lib.typ": *

#show: lavandula-theme

#cv(
  sidebar-position: "left",
  sidebar: [
    #set text(size: 10pt)

    = Pete Callahan
    == Field Sales Representative

    #contact-list((
      (icon: "at", icon-solid: true, text: link("mailto:pete.callahan.example@example.net")[pete.callahan.example\@example.net]),
      (icon: "phone", text: "+44 7700 900208"),
      (icon: "location-dot", text: "Leeds, United Kingdom"),
    ))

    #sidebar-section(title: "About me")[
      Field sales with 12+ years of experience across different sectors. I've done a bit of everything — from retail to B2B sales — and I'm comfortable building relationships and getting things done. I'm not the most polished on paper, but I get results and I'm honest about what I don't know.
    ]

    #sidebar-section(title: "Skills")[
      #skill-group(
        name: "Sales",
        icon: "handshake",
        skills: ("Relationship building", "Negotiation", "Closing", "Territory management")
      )

      #skill-group(
        name: "Tools",
        icon: "tools",
        skills: ("CRM (basic)", "Product knowledge", "Presentation")
      )

      #skill-group(
        name: "Personal",
        icon: "user",
        skills: ("Resilience", "Self-motivation", "Communication")
      )
    ]

    #sidebar-section(title: "Languages")[
      [
        English: native
        French: basic
      ]
    ]
  ],
  main-content: [
    #section(title: "Experience")[
      #section-element(
        title: "Field Sales Representative @ Northern Business Supplies",
        info: [_Mar 2020 – Present_],
        [
          Managed a territory of existing and prospective business customers.
          Built relationships through regular visits, calls and follow-ups.
          Met and exceeded sales targets consistently over the last 3 years.
          Handled objections and negotiated deals.
          Provided feedback to head office on customer needs and market trends.
        ],
      )

      #section-element(
        title: "Sales Executive @ TechFlow Solutions",
        info: [_Jun 2017 – Feb 2020_],
        [
          Sold software solutions to SMEs over the phone and in person.
          Built a pipeline and converted leads into customers.
          Worked to monthly and quarterly targets.
          Learned to use CRM systems and sales tools.
        ],
      )

      #section-element(
        title: "Sales Assistant @ DFS",
        info: [_2014 – 2017_],
        [
          Helped customers choose furniture, handled sales and paperwork.
          Worked in a target-driven retail environment.
          Developed product knowledge and customer service skills.
        ],
      )
    ]

    #section(title: "Education")[
      #section-element(
        title: "Allerton High School",
        info: [_2010_],
        [GCSEs including English and Mathematics]
      )
    ]

    #section(title: "Additional")[
      #section-element(title: "Volunteering")[
        [
          Volunteer driver for local charity (2022 – Present)
        ]
      ]

      #section-element(title: "Interests")[
        [
          Sport, travel, keeping active
        ]
      ]
    ]
  ]
)
