import { useState } from "react";
import { auth } from "../../firebase";
import ModalDescripcion from "../../components/Modals/ModalDescripcion";
import Paginacion from "../../components/Paginacion";

export default function CitasTable({ citas }) {
  const [listaCitas, setListaCitas] = useState(citas);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtro, setFiltro] = useState({ estado: "", alumno: "", coordinador: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [descripcionSeleccionada, setDescripcionSeleccionada] = useState("");
  const [seleccionadas, setSeleccionadas] = useState([]); // IDs seleccionadas

  const citasPorPagina = 10;

  const filtrarCitas = listaCitas.filter((cita) => {
    const alumno = `${cita.estudiante?.firstName ?? ""} ${cita.estudiante?.lastName ?? ""}`.toLowerCase();
    const coordinador = `${cita.coordinador?.firstName ?? ""} ${cita.coordinador?.lastName ?? ""}`.toLowerCase();
    return (
      cita.estado.toLowerCase().includes(filtro.estado.toLowerCase()) &&
      alumno.includes(filtro.alumno.toLowerCase()) &&
      coordinador.includes(filtro.coordinador.toLowerCase())
    );
  });

  const totalPaginas = Math.ceil(filtrarCitas.length / citasPorPagina);
  const indiceInicio = (paginaActual - 1) * citasPorPagina;
  const citasPaginadas = filtrarCitas.slice(indiceInicio, indiceInicio + citasPorPagina);

  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    const confirmar = window.confirm(
      `¿Deseas cambiar el estado de esta cita a "${nuevoEstado}"?`
    );
    if (!confirmar) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/citas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      // Verificar tipo de contenido antes de parsear
      const contentType = res.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Respuesta inesperada del servidor: ${text}`);
      }

      if (res.ok) {
        setListaCitas((prev) =>
          prev.map((cita) =>
            cita.id === id ? { ...cita, estado: nuevoEstado } : cita
          )
        );
      } else {
        alert(data.error || "Error al actualizar estado");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert(`Error al actualizar la cita: ${error.message}`);
    }
  };

  const eliminarSeleccionadas = async () => {
    if (seleccionadas.length === 0) {
      alert("No hay citas seleccionadas");
      return;
    }

    const confirmar = window.confirm(`¿Deseas eliminar ${seleccionadas.length} cita(s) seleccionada(s)?`);
    if (!confirmar) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/citas`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: seleccionadas }),
      });

      const data = await res.json();
      if (res.ok) {
        setListaCitas((prev) => prev.filter((cita) => !seleccionadas.includes(cita.id)));
        setSeleccionadas([]);
        alert(data.message || "Citas eliminadas correctamente");
      } else {
        alert(data.error || "Error al eliminar citas");
      }
    } catch (error) {
      console.error("Error al eliminar citas:", error);
      alert("Error interno");
    }
  };

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
      {/* Filtros */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filtrar por estado"
            value={filtro.estado}
            onChange={(e) => {
              setFiltro({ ...filtro, estado: e.target.value });
              setPaginaActual(1);
            }}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filtrar por alumno"
            value={filtro.alumno}
            onChange={(e) => {
              setFiltro({ ...filtro, alumno: e.target.value });
              setPaginaActual(1);
            }}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filtrar por coordinador"
            value={filtro.coordinador}
            onChange={(e) => {
              setFiltro({ ...filtro, coordinador: e.target.value });
              setPaginaActual(1);
            }}
          />
        </div>
      </div>

      {/* Botón eliminar seleccionadas */}
      {seleccionadas.length > 0 && (
        <div className="mb-3">
          <button className="btn btn-danger btn-sm" onClick={eliminarSeleccionadas}>
            Eliminar {seleccionadas.length} seleccionada(s)
          </button>
        </div>
      )}

      {/* Tabla */}
      <table className="table table-bordered">
        <thead className="encabezado-citas">
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSeleccionadas(e.target.checked ? citasPaginadas.map((c) => c.id) : [])
                }
                checked={
                  citasPaginadas.every((c) => seleccionadas.includes(c.id)) &&
                  citasPaginadas.length > 0
                }
              />
            </th>
            <th>ID</th>
            <th>Alumno</th>
            <th>Coordinador</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {citasPaginadas.map((cita) => (
            <tr key={cita.id}>
              <td>
                <input
                  type="checkbox"
                  checked={seleccionadas.includes(cita.id)}
                  onChange={() => toggleSeleccion(cita.id)}
                />
              </td>
              <td>{cita.id}</td>
              <td>{cita.estudiante?.firstName ?? "—"} {cita.estudiante?.lastName ?? ""}</td>
              <td>{cita.coordinador?.firstName ?? "—"} {cita.coordinador?.lastName ?? ""}</td>
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
              <td>{new Date(cita.createdAt).toLocaleString("es-CL", {
                dateStyle: "short",
                timeStyle: "short"
              })}</td>
              <td>
                <span className={`badge text-capitalize ${
                  cita.estado === "aceptada" ? "bg-success" :
                  cita.estado === "rechazada" ? "bg-danger" : "bg-secondary"
                }`}>
                  {cita.estado}
                </span>
              </td>
              <td>
                <select
                  className="form-select form-select-sm mb-2"
                  value={cita.estado}
                  onChange={(e) => actualizarEstado(cita.id, e.target.value)}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="aceptada">Aceptada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
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

      {/* Modal */}
      <ModalDescripcion
        visible={mostrarModal}
        descripcion={descripcionSeleccionada}
        onClose={cerrarModal}
      />
    </>
  );
}
