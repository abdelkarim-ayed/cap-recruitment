#import "lib.typ": *
#import "../../templates/fontawesome/lib.typ": *
#show: lavandula-theme

#cv(sidebar-position: "left", sidebar-width: 34%,
  sidebar: [
    = Sam Patel
    == Quality Checks Assistant
    #contact-list(((icon: "at", icon-solid: true, text: link("mailto:sam.patel.cv@example.uk")[sam.patel.cv\@example.uk]), (icon: "phone", text: "+44 7700 900047"), (icon: "location-dot", text: "Leeds, UK")))
    #sidebar-section(title: "Practical skills")[Label and quantity checks · handheld scanner · careful records · packing · stock counts · escalation]
    #sidebar-section(title: "Languages")[English: native \ Punjabi: conversational]
    #sidebar-section(title: "Availability")[Full-time]
  ],
  main-content: [
    #section(title: "Profile")[Junior worker interested in checking that items and records match before work moves on. Previous jobs were a mix of warehouse, packing and customer support. Careful with repeat tasks; asks when instructions are unclear.]
    #section(title: "Experience")[
      #section-element(title: "Packing and Quality Assistant — Aire Goods", info: [_2023–Present_], [Checks labels and quantities against pick lists before cartons are sealed. Separates damaged packaging and records the issue for supervisor review. Keeps a notebook of recurring packing errors and shares patterns at team check-ins.])
      #section-element(title: "Warehouse Operative — Northgate Distribution", info: [_2021–2023_], [Picked orders using a handheld scanner, reported location mismatches, helped with stock counts and kept aisles clear.])
      #section-element(title: "Customer Assistant — Leeds Market Co-op", info: [_2019–2021_], [Supported customers and helped check delivery notes against incoming goods.])
    ]
    #section(title: "Education")[Secondary education — Leeds (completed 2019). One brief transition between roles is not detailed.]
    #section(title: "Working approach")[Escalates damaged items rather than guessing; English native, Punjabi conversational.]
  ],
)
