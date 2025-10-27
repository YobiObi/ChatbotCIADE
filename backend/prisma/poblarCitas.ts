import prisma from '../src/config/prisma.js' // ajusta la ruta si es distinta

async function poblarCitas() {
  const rolAlumno = await prisma.role.findUnique({
    where: { name: "Alumno" }
  })

  if (!rolAlumno) {
    console.error("❌ Rol 'Alumno' no encontrado.")
    return
  }

  const alumnosData = [
    {
      uid: "alumno001",
      rut: "20.123.456-7",
      email: "alumno001@alumnos.unab.cl",
      firstName: "Camila",
      lastName: "González",
      campusNombre: "Casona",
      carreraNombre: "Ingeniería Civil Industrial"
    },
    {
      uid: "alumno002",
      rut: "21.234.467-8",
      email: "alumno002@alumnos.unab.cl",
      firstName: "Diego",
      lastName: "Muñoz",
      campusNombre: "República",
      carreraNombre: "Psicología"
    },
    {
      uid: "alumno003",
      rut: "22.345.678-9",
      email: "alumno003@alumnos.unab.cl",
      firstName: "Valentina",
      lastName: "Rojas",
      campusNombre: "Viña del Mar",
      carreraNombre: "Arquitectura"
    }
  ]

  for (const a of alumnosData) {
    const campus = await prisma.campus.findUnique({ where: { nombre: a.campusNombre } })
    const carrera = await prisma.carrera.findUnique({ where: { nombre: a.carreraNombre } })

    if (!campus || !carrera) {
      console.warn(`⚠️ Campus o carrera no encontrados para ${a.firstName} ${a.lastName}`)
      continue
    }

    const existe = await prisma.user.findUnique({ where: { rut: a.rut } })
    if (existe) {
      console.log(`ℹ️ Alumno ya existe: ${a.rut}`)
      continue
    }

    await prisma.user.create({
      data: {
        uid: a.uid,
        rut: a.rut,
        email: a.email,
        firstName: a.firstName,
        lastName: a.lastName,
        roleId: rolAlumno.id,
        campusId: campus.id,
        carreraId: carrera.id
      }
    })

    console.log(`✅ Alumno creado: ${a.firstName} ${a.lastName}`)
  }

  const citasData = [
    {
      estudianteUid: "alumno001",
      coordinadorUid: "0bx0xaDrIBhZuDOsJ4FzXDElvsP2",
      fecha: new Date("2025-10-02T10:00:00"),
      modalidad: "presencial",
      descripcion: "Consulta sobre malla curricular"
    },
    {
      estudianteUid: "alumno002",
      coordinadorUid: "kybrOzkqyNSii0AMs2fgEuCciuf1",
      fecha: new Date("2025-10-03T11:30:00"),
      modalidad: "virtual",
      descripcion: "Apoyo en carga académica"
    },
    {
      estudianteUid: "alumno003",
      coordinadorUid: "S8YLoRzCJ9XByrVGgbuyz667K183",
      fecha: new Date("2025-10-04T09:00:00"),
      modalidad: "presencial",
      descripcion: "Revisión de avance en práctica profesional"
    }
  ]

  for (const cita of citasData) {
    const estudiante = await prisma.user.findUnique({ where: { uid: cita.estudianteUid } })
    const coordinador = await prisma.user.findUnique({ where: { uid: cita.coordinadorUid } })

    if (!estudiante || !coordinador) {
      console.warn(`⚠️ Usuario no encontrado: estudiante ${cita.estudianteUid}, coordinador ${cita.coordinadorUid}`)
      continue
    }

    const rolCoordinador = await prisma.role.findUnique({ where: { id: coordinador.roleId } })
    if (rolCoordinador?.name !== "Coordinacion") {
      console.warn(`⚠️ Usuario ${coordinador.uid} no tiene rol de Coordinacion`)
      continue
    }

    await prisma.cita.create({
      data: {
        estudianteId: estudiante.id,
        coordinadorId: coordinador.id,
        fecha: cita.fecha,
        modalidad: cita.modalidad,
        descripcion: cita.descripcion,
        estado: "pendiente"
      }
    })

    console.log(`✅ Cita creada entre ${estudiante.uid} y ${coordinador.uid}`)
  }
}

poblarCitas()
  .then(() => {
    console.log("✅ Script finalizado correctamente.")
    prisma.$disconnect()
  })
  .catch((e) => {
    console.error("❌ Error al poblar citas:", e)
    prisma.$disconnect()
  })
