import prisma from "../config/prisma.js";

export const obtenerCampus = async (req, res) => {
  const { sede } = req.query;

  try {
    const sedeEncontrada = await prisma.sede.findUnique({
      where: { nombre: sede },
      select: { id: true }
    });

    if (!sedeEncontrada) return res.json([]);

    const campus = await prisma.campus.findMany({
      where: { sedeId: sedeEncontrada.id },
      select: { id: true, nombre: true }
    });

    res.json(campus);
  } catch (error) {
    console.error("Error al obtener campus:", error);
    res.status(500).json({ error: "Error interno al obtener campus" });
  }
};

export const obtenerCarreras = async (req, res) => {
  const { campus } = req.query;

  try {
    const carreras = await prisma.carreraCampus.findMany({
      where: {
        campus: {
          nombre: campus
        }
      },
      include: {
        carrera: {
          select: {
            id: true,
            nombre: true,
            facultad: {
              select: { nombre: true }
            }
          }
        }
      }
    });

    const resultado = carreras.map(cc => ({
      id: cc.carrera.id,
      nombre: cc.carrera.nombre,
      facultad: cc.carrera.facultad.nombre
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener carreras:", error);
    res.status(500).json({ error: "Error interno al obtener carreras" });
  }
};

export const obtenerFacultades = async (req, res) => {
  try {
    const facultades = await prisma.carrera.findMany({
      distinct: ["facultad"],
      select: { facultad: true },
      where: { facultad: { not: null } }
    });

    const lista = facultades.map(f => f.facultad).filter(Boolean);
    res.json(lista);
  } catch (error) {
    console.error("Error al obtener facultades:", error);
    res.status(500).json({ error: "Error interno al obtener facultades" });
  }
};
