#import "lib.typ": *
#import "../../templates/fontawesome/lib.typ": *
#show: lavandula-theme

#cv(sidebar-position: "left", sidebar-width: 34%,
  sidebar: [
    = Nora Walsh
    == Administration and Reporting Coordinator
    #contact-list(((icon: "at", icon-solid: true, text: link("mailto:nora.walsh.cv@example.ie")[nora.walsh.cv\@example.ie]), (icon: "phone", text: "+353 80 000 0044"), (icon: "location-dot", text: "Dublin, Ireland")))
    #sidebar-section(title: "Practical skills")[Excel · spreadsheet checks · basic charts · action tracking · document coordination · scheduling · Microsoft 365]
    #sidebar-section(title: "Languages")[English: native \ Irish: basic]
    #sidebar-section(title: "Community")[Volunteer coordinator for a community repair café; maintains bookings and welcomes visitors.]
  ],
  main-content: [
    #section(title: "Profile")[Senior administrator experienced with records, schedules and service requests. Interested in using basic data to make follow-up clearer; careful with spreadsheets and checks.]
    #section(title: "Experience")[
      #section-element(title: "Operations Administrator — Liffey Support Network", info: [_2023–Present_], [Maintains shared service logs and checks unresolved requests have an owner and next step. Prepares weekly summaries of request volume and common follow-up reasons. Helped redesign a tracker separating new requests from cases waiting on external information.])
      #section-element(title: "Project Administrator, contract — Beacon Facilities Group", info: [_2021–2023_], [Scheduled meetings, maintained action lists and compiled project status notes. Checked invoices and supporting documents before routing for approval.])
      #section-element(title: "Office Coordinator — Fairview Community Hub", info: [_2017–2021_], [Managed room bookings and reception cover; helped standardize handover notes between part-time staff.])
    ]
    #section(title: "Selected project")[Created a monthly spreadsheet for a community repair café to record bookings, repair categories and repeat issues. The tracker helps volunteers plan parts and capacity; it is not a predictive system.]
    #section(title: "Education and availability")[Further education coursework in office administration, Dublin (2008–2009). Full-time; hybrid preference in Dublin.]
  ],
)
