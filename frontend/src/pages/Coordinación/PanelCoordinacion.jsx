import { useEffect, useState } from "react";
import Banner from "../../components/BannerTitulo";
import ModalDescripcion from "../../components/Modals/ModalDescripcion";
import { useAuth } from "../../context/AuthContext";

export default function PanelCoordinacion() {
  const { token } = useAuth(); // Obtenemos token del contexto

  const [citas, setCitas] = useState([]);
  const [descripcionSeleccionada, setDescripcionSeleccionada] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroRut, setFiltroRut] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const citasPorPagina = 5;

  // --- Cargar citas al montar el componente ---
  useEffect(() => {
    if (!token) return;

    const fetchCitas = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/citas-coordinador`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setCitas(data.citas);
        else console.error("Error al cargar citas:", data.error);
      } catch (error) {
        console.error("Error al conectar con el backend:", error);
      }
    };

    fetchCitas();
  }, [token]);

  // --- Actualizar estado de una cita ---
  const actualizarEstado = async (id, nuevoEstado) => {
    if (!token) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de ${nuevoEstado === "aceptada" ? "aceptar" : "rechazar"} esta cita?`
    );
    if (!confirmacion) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/actualizar-estado-cita/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      const data = await res.json();
      if (res.ok) {
        setCitas((prev) =>
          prev.map((cita) =>
            cita.id === id ? { ...cita, estado: nuevoEstado } : cita
          )
        );
      } else alert(data.error || "Error al actualizar estado");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Error interno");
    }
  };

  // --- Modal de descripción ---
  const abrirModalDescripcion = (descripcion) => {
    setDescripcionSeleccionada(descripcion);
    setMostrarModal(true);
  };
  const cerrarModal = () => {
    setMostrarModal(false);
    setDescripcionSeleccionada("");
  };

  // --- Filtrado y paginación ---
  const citasFiltradas = citas.filter((cita) => {
    const coincideEstado = !filtroEstado || cita.estado.toLowerCase() === filtroEstado;
    const fechaCita = new Date(cita.createdAt).toISOString().slice(0, 10);
    const coincideFecha =
      (!fechaInicio || fechaCita >= fechaInicio) &&
      (!fechaFin || fechaCita <= fechaFin);

    const nombreCompleto = `${cita.estudiante.firstName} ${cita.estudiante.lastName}`.toLowerCase();
    const coincideNombre = !filtroNombre || nombreCompleto.includes(filtroNombre);

    const coincideRut = !filtroRut || (cita.estudiante.rut && cita.estudiante.rut.toLowerCase().includes(filtroRut));

    return coincideEstado && coincideFecha && coincideNombre && coincideRut;
  });

  const totalPaginas = Math.ceil(citasFiltradas.length / citasPorPagina);
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const indiceInicio = (paginaActual - 1) * citasPorPagina;
  const citasPaginadas = citasFiltradas.slice(indiceInicio, indiceInicio + citasPorPagina);

  return (
    <>
      <Banner title="Panel de Coordinación" />
      <div className="container my-5">
        {/* --- Filtros --- */}
        <div className="mb-4 d-flex flex-wrap gap-3 align-items-end">
          <div style={{ maxWidth: "200px" }}>
            <label className="form-label fw-bold">Estado</label>
            <select
              className="form-select"
              value={filtroEstado}
              onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>

          <div style={{ maxWidth: "420px" }}>
            <label className="form-label fw-bold">Rango de fechas</label>
            <div className="d-flex gap-2">
              <input type="date" className="form-control" value={fechaInicio}
                onChange={(e) => { setFechaInicio(e.target.value); setPaginaActual(1); }} />
              <input type="date" className="form-control" value={fechaFin}
                onChange={(e) => { setFechaFin(e.target.value); setPaginaActual(1); }} />
            </div>
          </div>

          <div style={{ maxWidth: "250px" }}>
            <label className="form-label fw-bold">Nombre del estudiante</label>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre"
              value={filtroNombre}
              onChange={(e) => { setFiltroNombre(e.target.value.toLowerCase()); setPaginaActual(1); }}
            />
          </div>

          <div style={{ maxWidth: "200px" }}>
            <label className="form-label fw-bold">RUT del estudiante</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: 12.345.678-9"
              value={filtroRut}
              onChange={(e) => { setFiltroRut(e.target.value.toLowerCase()); setPaginaActual(1); }}
            />
          </div>

          <div>
            <button
              className="btn btn-outline-secondary mt-4"
              onClick={() => {
                setFiltroEstado(""); setFiltroNombre(""); setFiltroRut("");
                setFechaInicio(""); setFechaFin(""); setPaginaActual(1);
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* --- Tabla de citas --- */}
        {citasPaginadas.length === 0 ? (
          <p>No hay citas que coincidan con los filtros.</p>
        ) : (
          <>
            <table className="table table-bordered table-hover">
              <thead className="table-light encabezado-citas">
                <tr>
                  <th>#</th>
                  <th>Estudiante</th>
                  <th>RUT</th>
                  <th>Carrera</th>
                  <th>Descripción</th>
                  <th>Fecha de Solicitud</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasPaginadas.map((cita, index) => (
                  <tr key={cita.id}>
                    <td>{indiceInicio + index + 1}</td>
                    <td>{cita.estudiante.firstName} {cita.estudiante.lastName}</td>
                    <td>{cita.estudiante.rut}</td>
                    <td>{cita.estudiante.carrera}</td>
                    <td
                      style={{ cursor: "pointer", maxWidth: "350px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      title="Haz clic para ver más"
                      onClick={() => abrirModalDescripcion(cita.descripcion)}
                    >
                      {cita.descripcion}
                    </td>
                    <td>{new Date(cita.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge text-capitalize ${
                        cita.estado.toLowerCase() === "aceptada"
                          ? "bg-success"
                          : cita.estado.toLowerCase() === "rechazada"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}>
                        {cita.estado}
                      </span>
                    </td>
                    <td>
                      {cita.estado.toLowerCase() === "pendiente" ? (
                        <div className="acciones-cita d-flex gap-2 flex-wrap">
                          <button className="btn btn-success btn-sm" onClick={() => actualizarEstado(cita.id, "aceptada")}>Aceptar</button>
                          <button className="btn btn-danger btn-sm" onClick={() => actualizarEstado(cita.id, "rechazada")}>Rechazar</button>
                        </div>
                      ) : (
                        <span className="text-muted">Ya gestionada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- Paginación --- */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span>Página {paginaActual} de {totalPaginas}</span>
              <nav>
                <ul className="pagination mb-0">
                  {paginas.map((num) => (
                    <li key={num} className={`page-item ${num === paginaActual ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPaginaActual(num)}>{num}</button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </>
        )}

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
