#import "lib.typ": *

#show: resume.with(
  contact-info-position: center,
  contacts-separator: [#h(0.45em)◆#h(0.45em)],
  inline-separator: [#h(0.35em)/#h(0.35em)],
  link-color: rgb("#38556b"),
  accent-color: rgb("#38556b"),
  font: "Libertinus Serif",
  font-size: 10.5pt,
  line-spacing: 0.65em,
  entry-spacing: 0.325em,
  page-margin: 0.55in,
  list-marker: [--],
  justify: true,
)

#contact-info(
  name: [Diego Ramírez],
  phone: [+52 55 0000 0057],
  email: [diego.ramirez.cv\@example.mx],
  address: [Ciudad de México, México],
)

#summary[
  Auxiliar administrativo junior, cuidadoso con registros y seguimiento de pendientes. Ha combinado atención al cliente, reparación básica de bicicletas y tareas de caja; ahora busca orientar esa experiencia hacia crédito y cobranza. Prefiere llevar una lista clara de facturas, acuerdos y fechas de seguimiento para que ninguna consulta quede sin respuesta.
]

#experience(
  title: [Auxiliar de cuentas por cobrar],
  company: [Suministros La Estación],
  location: [Ciudad de México],
  start-date: [2024],
  end-date: [Actualidad],
  [Actualiza el registro de facturas y fechas de vencimiento para una cartera pequeña de clientes comerciales.],
  [Envía recordatorios de pago y registra respuestas, promesas y documentos recibidos.],
  [Compara depósitos con referencias de factura y consulta diferencias antes de actualizar el estado de cuenta.],
  [Ayudó a ordenar saldos antiguos por fecha y responsable para las revisiones semanales.],
)

#experience(
  title: [Técnico auxiliar],
  company: [Taller Ciclo Norte],
  location: [Ciudad de México],
  start-date: [2021],
  end-date: [2024],
  [Recibía bicicletas, anotaba el trabajo solicitado y preparaba presupuestos sencillos para aprobación.],
  [Apoyaba reparaciones básicas, control de piezas y registro de pagos.],
  [Explicaba al cliente qué se había revisado y cuándo estaría lista la bicicleta.],
)

#experience(
  title: [Cajero y apoyo de tienda],
  company: [Mercado San Lucas],
  location: [Ciudad de México],
  start-date: [2019],
  end-date: [2021],
  [Atendía caja y ayudaba con inventarios y reposición.],
  [Revisaba cierres de turno y comunicaba diferencias al encargado.],
)

#education(
  degree: [Técnico en Contabilidad, estudios parciales],
  school: [Centro de Estudios Comerciales del Valle],
  location: [Ciudad de México],
  start-date: [2017],
  end-date: [2019],
)

#education(
  degree: [Bachillerato],
  school: [Escuela Preparatoria No. 18],
  location: [Ciudad de México],
  start-date: [2014],
  end-date: [2017],
)

#skillset(
  category: [Administración y seguimiento],
  skills: [Excel, registro de facturas, conciliación básica de depósitos, seguimiento por correo y teléfono],
)

#skillset(
  category: [Experiencia práctica],
  skills: [Caja, atención al cliente, reparación básica de bicicletas, control de piezas],
)

#skillset(
  category: [Idiomas y disponibilidad],
  skills: [Español nativo, inglés básico, jornada completa, presencial o híbrido en Ciudad de México],
)

#project(
  name: [Registro comunitario de gastos y reembolsos],
  info: [Voluntariado],
  start-date: [2023],
  end-date: [Actualidad],
  [Lleva el registro de gastos, cuotas y reembolsos de un grupo vecinal de ciclismo.],
  [Ayuda a organizar paseos mensuales y a comunicar los gastos a sus participantes.],
)

#print-contact
#print-summary
#print-experience
#print-projects
#print-education
#print-skills
