import prisma from "../config/prisma.js";

/**
 * Obtener campus por sede
 * Ejemplo: /api/institucional/campus?sede=Santiago
 */
export const obtenerCampus = async (req, res) => {
  const { sede } = req.query;

  try {
    // 1️⃣ Validar parámetro
    if (!sede) {
      return res.status(400).json({
        error: "Debe especificar una sede. Ejemplo: /api/institucional/campus?sede=Santiago"
      });
    }

    // 2️⃣ Buscar sede
    const sedeEncontrada = await prisma.sede.findUnique({
      where: { nombre: sede },
      select: { id: true }
    });

    if (!sedeEncontrada) {
      return res.status(404).json({
        error: `No se encontró la sede "${sede}".`
      });
    }

    // 3️⃣ Buscar campus de esa sede
    const campus = await prisma.campus.findMany({
      where: { sedeId: sedeEncontrada.id },
      select: { id: true, nombre: true }
    });

    return res.json(campus);
  } catch (error) {
    console.error("Error al obtener campus:", error);
    return res.status(500).json({ error: "Error interno al obtener campus" });
  }
};

/**
 * Obtener carreras por campus
 * Ejemplo: /api/institucional/carreras?campus=Campus%20Santiago
 */
export const obtenerCarreras = async (req, res) => {
  const { campus } = req.query;

  try {
    // 1️⃣ Validar parámetro
    if (!campus) {
      return res.status(400).json({
        error: "Debe especificar un campus. Ejemplo: /api/institucional/carreras?campus=Campus%20Santiago"
      });
    }

    // 2️⃣ Buscar carreras asociadas al campus
    const carreras = await prisma.carreraCampus.findMany({
      where: {
        campus: { nombre: campus }
      },
      include: {
        carrera: {
          select: {
            id: true,
            nombre: true,
            facultad: { select: { nombre: true } }
          }
        }
      }
    });

    if (!carreras.length) {
      return res.status(404).json({
        error: `No se encontraron carreras asociadas al campus "${campus}".`
      });
    }

    // 3️⃣ Mapear resultados
    const resultado = carreras.map(cc => ({
      id: cc.carrera.id,
      nombre: cc.carrera.nombre,
      facultad: cc.carrera.facultad.nombre
    }));

    return res.json(resultado);
  } catch (error) {
    console.error("Error al obtener carreras:", error);
    return res.status(500).json({ error: "Error interno al obtener carreras" });
  }
};

/**
 * Obtener lista de facultades
 */
export const obtenerFacultades = async (req, res) => {
  try {
    const facultades = await prisma.facultad.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" }
    });

    return res.json(facultades);
  } catch (error) {
    console.error("Error al obtener facultades:", error);
    return res.status(500).json({ error: "Error interno al obtener facultades" });
  }
};