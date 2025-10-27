import prisma from '../src/config/prisma.js'

async function validarCarrerasSinCampus() {
  const carreras = await prisma.carrera.findMany({
    include: { carreraCampus: true }
  })

  const sinCampus = carreras.filter(c => c.carreraCampus.length === 0)

  console.log("🔍 Carreras sin campus asociado:")
  console.table(sinCampus.map(c => ({ carrera: c.nombre })))
}

async function validarCampusSinSede() {
  const campus = await prisma.campus.findMany({
    include: { sede: true }
  })

  const sinSede = campus.filter(c => !c.sede)

  console.log("🔍 Campus sin sede asociada:")
  console.table(sinSede.map(c => ({ campus: c.nombre })))
}

async function validarFacultadesSinCarreras() {
  const facultades = await prisma.facultad.findMany({
    include: { carreras: true }
  })

  const sinCarreras = facultades.filter(f => f.carreras.length === 0)

  console.log("🔍 Facultades sin carreras asociadas:")
  console.table(sinCarreras.map(f => ({ facultad: f.nombre })))
}

async function validarUsuariosSinCobertura() {
  const usuarios = await prisma.user.findMany({
    where: { role: { name: "Coordinacion" } },
    include: { coordinaciones: true }
  })

  const sinCobertura = usuarios.filter(u => u.coordinaciones.length === 0)

  console.log("🔍 Coordinadores sin cobertura registrada:")
  console.table(sinCobertura.map(u => ({
    nombre: `${u.firstName} ${u.lastName}`,
    rut: u.rut,
    uid: u.uid
  })))
}

async function validarCoordinacionesInvalidas() {
  const coordinaciones = await prisma.coordinacion.findMany({
    include: {
      user: true,
      campus: true,
      carrera: true
    }
  })

  const inconsistencias = []

  for (const c of coordinaciones) {
    const existe = await prisma.carreraCampus.findUnique({
      where: {
        carreraId_campusId: {
          carreraId: c.carreraId,
          campusId: c.campusId
        }
      }
    })

    if (!existe) {
      inconsistencias.push({
        coordinador: `${c.user.firstName} ${c.user.lastName}`,
        campus: c.campus.nombre,
        carrera: c.carrera.nombre
      })
    }
  }

  console.log("🔍 Coordinaciones inválidas (carrera no impartida en campus):")
  console.table(inconsistencias)
}

async function ejecutarValidaciones() {
  await validarCarrerasSinCampus()
  await validarCampusSinSede()
  await validarFacultadesSinCarreras()
  await validarUsuariosSinCobertura()
  await validarCoordinacionesInvalidas()
  await prisma.$disconnect()
}

ejecutarValidaciones().catch(e => {
  console.error("❌ Error en validaciones:", e)
  prisma.$disconnect()
})
