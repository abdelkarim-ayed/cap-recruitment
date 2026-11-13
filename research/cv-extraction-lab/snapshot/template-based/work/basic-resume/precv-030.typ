#import "src/lib.typ": *

#let name = "Marina Gil"
#let location = "Zaragoza, España"
#let email = "marina.gil.cv@example.es"
#let phone = "+34 600 000 030"

#show: resume.with(author: name, location: location, email: email, phone: phone, accent-color: "#45635b", font: "Liberation Sans", paper: "a4", author-position: left, personal-info-position: left)

== Perfil

Profesional de apoyo con experiencia en orientar a personas hacia servicios adecuados y ayudar a completar pasos administrativos. Ha trabajado en atención comunitaria, recepción y coordinación de equipos pequeños. Su formación en intervención social complementa una forma de trabajar práctica: escuchar, confirmar qué falta y dejar claro el siguiente paso.

== Experiencia

#work(title: "Coordinadora de atención", location: "Zaragoza, España", company: "Punto Abierto Zaragoza", dates: dates-helper(start-date: "2022", end-date: "Present"))
- Organiza turnos de un equipo de cuatro personas voluntarias y distribuye consultas según el tipo de apoyo requerido.
- Ayuda a reunir documentos para citas y derivaciones, sin sustituir el asesoramiento profesional.
- Preparó una guía visual de citas con pictogramas y lenguaje sencillo que se utiliza en el punto de atención.
- Registra temas frecuentes y comparte observaciones con la coordinación del servicio.

#work(title: "Auxiliar de recepción", location: "Zaragoza, España", company: "Centro Médico Las Fuentes", dates: dates-helper(start-date: "2018", end-date: "2022"))
- Gestionó citas, recepción de visitantes y actualización de datos administrativos.
- Atendió consultas con discreción y derivó preguntas clínicas al personal sanitario.

#work(title: "Monitora de actividades", location: "Zaragoza, España", company: "Asociación La Plaza", dates: dates-helper(start-date: "2015", end-date: "2018"))
- Apoyó actividades grupales e informó a familias sobre horarios y materiales.
- Ayudó a preparar espacios accesibles y a resolver cambios de última hora.

== Formación

#edu(institution: "Universidad de Zaragoza", location: "Zaragoza, España", dates: dates-helper(start-date: "2011", end-date: "2015"), degree: "Grado en Trabajo Social")

#edu(institution: "Entidad local", location: "Zaragoza, España", dates: dates-helper(start-date: "2023", end-date: "2023"), degree: "Comunicación accesible y atención informada por trauma")

== Fortalezas prácticas

- Orientación y derivación; coordinación de turnos
- Escucha activa y comunicación accesible
- Registros administrativos, confidencialidad y límites
- Herramientas ofimáticas

== Voluntariado e idiomas

#extracurriculars(activity: "Voluntaria — red vecinal de apoyo a personas recién llegadas; orientación sobre servicios y materiales de bienvenida", dates: dates-helper(start-date: "2021", end-date: "Present"))

Español nativo · Inglés intermedio · Árabe básico

== Disponibilidad

Jornada completa; preferencia por horario de lunes a viernes en Zaragoza.
