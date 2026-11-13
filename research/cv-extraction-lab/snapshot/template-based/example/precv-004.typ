#import "vivid-cv.typ": *
#import "fontawesome/lib.typ": fa-icon

#show: resume.with(
  author: "Grace Ellington",
  title: "Registered Nurse · Adult Care",
  font: "Liberation Sans",

  email: "grace.ellington.example@example.net",
  github: "",
  linkedin: "grace-ellington-example",
  phone: "+44 7700 900104",
  location: "Bristol, United Kingdom",
  personal-site: "",

  about-title: "Profile",
  about-beside: [
    Adult nurse with experience in acute medical wards and community follow-up. Calm, organised approach to handover, patient education and escalation. Experienced in discharge planning, wound care and supporting patients transitioning from hospital to safe care at home.
  ],

  reference: "Professional registration details and references available on request",

  header-color: "#06332a",
  lang: "en",
  photo: image("photo.png"),
  show-photo: false,
)

== Work Experience

#work(
  title: "Staff Nurse, Acute Medicine",
  company: "Southbank Community Hospital",
  dates: dates-helper(start-date: "Aug 2022", end-date: "Present"),
  location: "Bristol, United Kingdom",
)
- Assess and plan care for adult medical patients, maintain accurate records and escalate deterioration using the ward's agreed observation pathway
- Administer prescribed medication, support discharge planning and communicate changes to patients and families
- Act as shift coordinator when delegated, allocating workload and supporting newly appointed colleagues
- Contributed to audit of discharge information completeness and helped revise the ward checklist

#work(
  title: "Community Nurse",
  company: "Avon Meadow Care Partnership",
  dates: dates-helper(start-date: "Oct 2020", end-date: "Jul 2022"),
  location: "Bristol, United Kingdom",
)
- Visited patients for wound care, observations and support with long-term condition management
- Liaised with general practice teams and social-care colleagues about follow-up needs
- Prepared clear visit notes and practical guidance for patients managing dressings between appointments

== Education

#edu(
  institution: "Severn Coast University",
  location: "Bristol, United Kingdom",
  dates: dates-helper(start-date: "Sep 2017", end-date: "Jul 2020"),
  degree: "BSc Adult Nursing",
)
- Clinical placements in elderly care, surgery, community services and acute assessment

== Professional Development

#certificates(
  name: "Immediate Life Support",
  issuer: "Resuscitation Council (renewed)",
  dates: dates-helper(start-date: "2025", end-date: "2025"),
)

#certificates(
  name: "Practice Assessor Preparation",
  issuer: "University CPD",
  dates: dates-helper(start-date: "2024", end-date: "2024"),
)

#certificates(
  name: "Safeguarding Adults Update",
  issuer: "Local Trust",
  dates: dates-helper(start-date: "2025", end-date: "2025"),
)

#certificates(
  name: "Wound Assessment and Documentation Workshop",
  issuer: "Trust Education",
  dates: dates-helper(start-date: "2023", end-date: "2023"),
)

== Skills

#extracurriculars(activity: "Clinical: Assessment, care planning, medication administration, escalation")
#extracurriculars(activity: "Coordination: Discharge planning, structured handover, MDT working")
#extracurriculars(activity: "Systems & Education: Electronic patient records, mentoring students, patient education")

== Additional Information

#extracurriculars(activity: "Languages: English (native), conversational Welsh")
#extracurriculars(activity: "Driving: Full UK driving licence")
#extracurriculars(activity: "Availability: Full-time, flexible shifts")
