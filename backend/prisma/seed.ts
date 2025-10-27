import carrerasData from '../../frontend/src/utils/carrerasData.js'
import coordinacionData from '../../frontend/src/utils/coordinacionData.js'
import prisma from '../src/config/prisma.js'

async function main() {
  // 1. Poblar roles
  const roles = ["Alumno", "Coordinacion", "Admin"]
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  // 2. Poblar facultades
  const facultadesSet = new Set(carrerasData.map(c => c.facultad))
  for (const nombre of facultadesSet) {
    await prisma.facultad.upsert({
      where: { nombre },
      update: {},
      create: { nombre }
    })
  }

  // 3. Poblar carreras
  for (const { carrera, facultad } of carrerasData) {
    const facultadRecord = await prisma.facultad.findUnique({ where: { nombre: facultad } })
    if (facultadRecord) {
      await prisma.carrera.upsert({
        where: { nombre: carrera },
        update: {},
        create: {
          nombre: carrera,
          facultadId: facultadRecord.id
        }
      })
    }
  }

  // 4. Poblar sedes
  const sedesSet = new Set(carrerasData.flatMap(c => c.sede))
  for (const nombre of sedesSet) {
    await prisma.sede.upsert({
      where: { nombre },
      update: {},
      create: { nombre }
    })
  }

  // 5. Poblar campus
  const campusSet = new Set(carrerasData.flatMap(c => c.campus))
  for (const nombre of campusSet) {
    const sedeNombre = carrerasData.find(c => c.campus.includes(nombre))?.sede[0]
    const sedeRecord = await prisma.sede.findUnique({ where: { nombre: sedeNombre } })

    if (sedeRecord) {
      await prisma.campus.upsert({
        where: { nombre },
        update: {},
        create: {
          nombre,
          sedeId: sedeRecord.id
        }
      })
    }
  }

  // 6. Poblar CarreraCampus
const carreraCampusSet = new Set(
  carrerasData.flatMap(c => c.campus.map(campus => `${c.carrera}::${campus}`))
)

for (const entry of carreraCampusSet) {
  const [carreraNombre, campusNombre] = entry.split("::")
  const carrera = await prisma.carrera.findUnique({ where: { nombre: carreraNombre } })
  const campus = await prisma.campus.findUnique({ where: { nombre: campusNombre } })

  if (carrera && campus) {
    await prisma.carreraCampus.upsert({
      where: {
        carreraId_campusId: {
          carreraId: carrera.id,
          campusId: campus.id
        }
      },
      update: {},
      create: {
        carreraId: carrera.id,
        campusId: campus.id
      }
    })
  }
}

  // 6. Poblar usuarios y cobertura de coordinación
  for (const coor of coordinacionData) {
    const role = await prisma.role.findUnique({ where: { name: "Coordinacion" } })

    let user = await prisma.user.findUnique({ where: { rut: coor.rut } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          uid: coor.uid,
          email: `${coor.rut.replace(/\./g, "").replace("-", "")}@unab.cl`,
          firstName: coor.nombre.split(" ")[0],
          lastName: coor.nombre.split(" ").slice(1).join(" "),
          rut: coor.rut,
          roleId: role.id,
          campusId: 1, // valor temporal, será cubierto por Coordinacion
          carreraId: 1 // valor temporal, será cubierto por Coordinacion
        }
      })
    }

    for (const campusNombre of coor.campus) {
      const campus = await prisma.campus.findUnique({ where: { nombre: campusNombre } })

      for (const carreraNombre of coor.carreras) {
        const carrera = await prisma.carrera.findUnique({ where: { nombre: carreraNombre } })

        if (!campus || !carrera) {
          console.warn(`⚠️ Cobertura omitida: ${coor.nombre} - campus: ${campusNombre}, carrera: ${carreraNombre}`)
          continue
        }

        await prisma.coordinacion.upsert({
          where: {
            userId_campusId_carreraId: {
              userId: user.id,
              campusId: campus.id,
              carreraId: carrera.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            campusId: campus.id,
            carreraId: carrera.id
          }
        })

        console.log(`✅ Cobertura registrada: ${coor.nombre} - ${campusNombre} / ${carreraNombre}`)
      }
    }
  }

  console.log("✅ Seed institucional ejecutado correctamente")
  await prisma.$disconnect()
}

main().catch(e => {
  console.error("❌ Error en seed:", e)
  prisma.$disconnect()
})
