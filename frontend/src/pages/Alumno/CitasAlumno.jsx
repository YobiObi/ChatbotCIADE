import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Banner from "../../components/BannerTitulo";
import ModalDescripcion from "../../components/Modals/ModalDescripcion";
import Paginacion from "../../components/Paginacion";

export default function CitasAlumno() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [descripcionSeleccionada, setDescripcionSeleccionada] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

// --- Paginación ---
  const [paginaActual, setPaginaActual] = useState(1);
  const citasPorPagina = 7;

  const totalPaginas = Math.ceil(citas.length / citasPorPagina);
  const indiceInicio = (paginaActual - 1) * citasPorPagina;
  const citasPaginadas = citas.slice(indiceInicio, indiceInicio + citasPorPagina);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCitas([]);
        setCargando(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/alumno/citas`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setCitas(data);
        } else {
          console.error("Error al obtener citas:", data.error);
        }
      } catch (error) {
        console.error("Error en fetch de citas alumno:", error);
      } finally {
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (cargando) return <div className="p-5 text-center">Cargando tus citas...</div>;

  if (citas.length === 0) {
    return <div className="p-5 text-center">No tienes citas solicitadas.</div>;
  }

  // --- Modal de descripción ---
  const abrirModalDescripcion = (descripcion) => {
    setDescripcionSeleccionada(descripcion);
    setMostrarModal(true);
  };
  const cerrarModal = () => {
    setMostrarModal(false);
    setDescripcionSeleccionada("");
  };

  return (
    <>
    <Banner title="Mis Citas" />
    <div className="container my-5">
      <table className="table table-bordered mt-4">
        <thead className="encabezado-citas">
            <tr>
            <th>ID</th>
            <th>Coordinador</th>
            <th>Descripción</th>
            <th>Fecha de creación</th>
            <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            {citasPaginadas.map((cita) => (
            <tr key={cita.id}>
                <td>{cita.id}</td>
                <td>{cita.coordinador ? `${cita.coordinador.firstName} ${cita.coordinador.lastName}` : "—"}</td>
                <td
                style={{
                    cursor: "pointer",
                    maxWidth: "350px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}
                title="Haz clic para ver más"
                onClick={() => abrirModalDescripcion(cita.descripcion)}
                >
                {cita.descripcion}
                </td>
                <td>{new Date(cita.createdAt).toLocaleDateString()}</td>
                <td>
                    <span className={`badge align-items-center text-capitalize ${
                        cita.estado === "aceptada"
                        ? "bg-success"
                        : cita.estado === "rechazada"
                        ? "bg-danger"
                        : "bg-secondary"
                    }`}>
                        {cita.estado === "aceptada" && "✅"}
                        {cita.estado === "rechazada" && "❌"}
                        {cita.estado === "pendiente" && "⏳"}
                        {cita.estado}
                    </span>
                    </td>
            </tr>
            ))}
        </tbody>
    </table>

      {/* Paginación */}
      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambiar={setPaginaActual}
      />
      {/* Modal reutilizable */}
      <ModalDescripcion
        visible={mostrarModal}
        descripcion={descripcionSeleccionada}
        onClose={cerrarModal}
      />
    </div>
    </>
  );
}
