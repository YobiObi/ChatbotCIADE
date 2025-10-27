// src/pages/Admin/CitasTable.jsx
import { useState, useMemo, useEffect } from "react";
import { auth } from "../../firebase";
import ModalTexto from "../../components/Modals/ModalTexto";
import Paginacion from "../../components/Paginacion";
import FiltrosInstitucionales from "../../components/FiltrosInstitucionales";
import TextPreviewCell from "../../components/Table/TextPreviewCell";
import { formatFechaCL } from "../../utils/formatFecha";
import SortBar from "../../components/SortBar";
import { sortCollection, SORT_MODES } from "../../utils/sortCollection";

export default function CitasTable({ citas }) {
  // Estado base
  const [listaCitas, setListaCitas] = useState(citas || []);
  const [paginaActual, setPaginaActual] = useState(1);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const citasPorPagina = 10;

  // Filtros + Orden
  const [filtro, setFiltro] = useState({
    estado: "",
    alumno: "",
    coordinador: "",
    campus: "",
    modalidad: "",
  });
  const [sortMode, setSortMode] = useState(SORT_MODES.NEWEST);

  // Modal texto (Descripción/Motivo)
  const [modalTxt, setModalTxt] = useState({ visible: false, title: "", text: "" });
  const abrirModalTexto = (title, text) => setModalTxt({ visible: true, title, text });
  const cerrarModalTexto = () => setModalTxt({ visible: false, title: "", text: "" });

  // Reset de página cuando cambian filtros u orden
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro, sortMode]);

  // Normaliza filtro para no recalcular toLowerCase muchas veces
  const filtroNorm = useMemo(() => ({
    estado: (filtro.estado || "").toLowerCase(),
    alumno: (filtro.alumno || "").toLowerCase(),
    coordinador: (filtro.coordinador || "").toLowerCase(),
    campus: (filtro.campus || "").toLowerCase(),
    modalidad: (filtro.modalidad || "").toLowerCase(),
  }), [filtro]);

  // Filtrado
  const citasFiltradas = useMemo(() => {
    return (listaCitas || []).filter((cita) => {
      const alumno = `${cita.estudiante?.firstName ?? ""} ${cita.estudiante?.lastName ?? ""}`.toLowerCase();
      const coordinador = `${cita.coordinador?.firstName ?? ""} ${cita.coordinador?.lastName ?? ""}`.toLowerCase();
      const campus = cita.estudiante?.campus?.nombre?.toLowerCase() || "";
      const modalidad = (cita.modalidad || "").toLowerCase();
      const estado = (cita.estado || "").toLowerCase();

      return (
        estado.includes(filtroNorm.estado) &&
        alumno.includes(filtroNorm.alumno) &&
        coordinador.includes(filtroNorm.coordinador) &&
        campus.includes(filtroNorm.campus) &&
        modalidad.includes(filtroNorm.modalidad)
      );
    });
  }, [listaCitas, filtroNorm]);

  // Orden (re-usa utils genérico)
  const citasOrdenadas = useMemo(() => {
    return sortCollection(citasFiltradas, sortMode, {
      getCreatedAt: (c) => c.createdAt,
      getEstado: (c) => c.estado,
      // tiebreaker opcional si lo necesitas:
      // tiebreaker: (a, b) => b.id - a.id,
    });
  }, [citasFiltradas, sortMode]);

  // Paginación sobre ordenadas
  const totalPaginas = Math.ceil(citasOrdenadas.length / citasPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * citasPorPagina;
  const citasPaginadas = citasOrdenadas.slice(indiceInicio, indiceInicio + citasPorPagina);

  // Selección
  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSeleccionPagina = (check) => {
    if (check) {
      setSeleccionadas(Array.from(new Set([...seleccionadas, ...citasPaginadas.map(c => c.id)])));
    } else {
      setSeleccionadas(prev => prev.filter(id => !citasPaginadas.some(c => c.id === id)));
    }
  };

  // Helper único para PUTs con confirmación y patch local
  const confirmAndUpdate = async ({
    id,
    payload,
    confirmMsg,
    patchLocal,
    errorLabel = "actualizar",
  }) => {
    const confirmar = window.confirm(confirmMsg);
    if (!confirmar) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/citas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json") ? await res.json() : null;
      if (!res.ok) throw new Error(data?.error || `Error al ${errorLabel}`);

      // patch local
      if (typeof patchLocal === "function") {
        setListaCitas((prev) => prev.map((c) => (c.id === id ? patchLocal(c) : c)));
      }
    } catch (error) {
      console.error(`Error al ${errorLabel}:`, error);
      alert(`No se pudo ${errorLabel}: ${error.message}`);
    }
  };

  // Actualizar estado (usa helper)
  const actualizarEstado = (id, nuevoEstado) => {
    if (!["pendiente", "aceptada", "rechazada"].includes(nuevoEstado)) {
      alert("Estado inválido");
      return;
    }
    confirmAndUpdate({
      id,
      payload: { estado: nuevoEstado },
      confirmMsg: `¿Deseas cambiar el estado de esta cita a "${nuevoEstado}"?`,
      errorLabel: "actualizar estado",
      patchLocal: (c) => ({ ...c, estado: nuevoEstado }),
    });
  };

  // Actualizar modalidad (usa el mismo helper)
  const actualizarModalidad = (id, nuevaModalidad) => {
    if (!["presencial", "virtual"].includes(nuevaModalidad)) {
      alert("Modalidad inválida");
      return;
    }
    confirmAndUpdate({
      id,
      payload: { modalidad: nuevaModalidad },
      confirmMsg: `¿Deseas cambiar la modalidad de esta cita a "${nuevaModalidad}"?`,
      errorLabel: "actualizar modalidad",
      patchLocal: (c) => ({ ...c, modalidad: nuevaModalidad }),
    });
  };

  // Eliminar seleccionadas
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
      if (!res.ok) throw new Error(data?.error || "Error al eliminar citas");

      setListaCitas((prev) => prev.filter((cita) => !seleccionadas.includes(cita.id)));
      setSeleccionadas([]);
      alert(data.message || "Citas eliminadas correctamente");
    } catch (error) {
      console.error("Error al eliminar citas:", error);
      alert("Error interno");
    }
  };

  // Render helper
  const renderFechaCita = (cita) => {
    const estado = (cita.estado || "").toLowerCase();
    const definida = estado === "aceptada" || !!cita.reagendadaEn;
    if (estado === "rechazada") return <span className="text-muted">No aplica</span>;
    if (estado === "pendiente") return <span className="text-secondary">Por confirmar</span>;
    if (!definida || !cita.fecha) return "—";
    return formatFechaCL(cita.fecha);
  };

  return (
    <>
      {/* Filtros institucionales */}
      <FiltrosInstitucionales
        filtros={filtro}
        setFiltros={(nuevos) => setFiltro(nuevos)}
        campos={["estado", "alumno", "coordinador", "campus", "modalidad"]}
      />

      {/* Barra de Orden */}
      <SortBar
        value={sortMode}
        onChange={setSortMode}
        modes={[SORT_MODES.NEWEST, SORT_MODES.OLDEST, SORT_MODES.PENDING_FIRST]}
      />

      {/* Acciones por lote */}
      {seleccionadas.length > 0 && (
        <div className="mb-3">
          <button className="btn btn-danger btn-sm" onClick={eliminarSeleccionadas}>
            Eliminar {seleccionadas.length} seleccionada(s)
          </button>
        </div>
      )}

      {/* Tabla */}
      <table className="table table-bordered table-hover tabla-citas">
        <thead className="encabezado-citas text-center">
          <tr>
            <th style={{ width: "3%" }}>
              <input
                type="checkbox"
                onChange={(e) => toggleSeleccionPagina(e.target.checked)}
                checked={
                  citasPaginadas.length > 0 &&
                  citasPaginadas.every((c) => seleccionadas.includes(c.id))
                }
              />
            </th>
            <th style={{ width: "5%" }}>ID</th>
            <th>Alumno</th>
            <th>Coordinador</th>
            <th>Descripción</th>
            <th>Campus</th>
            <th>Fecha creación</th>
            <th>Fecha de Cita</th>
            <th>Reagendada</th>
            <th>Motivo</th>
            <th>Modalidad</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {citasPaginadas.length === 0 ? (
            <tr>
              <td colSpan="14" className="text-center py-4 text-muted">
                No hay resultados para este filtro.
              </td>
            </tr>
          ) : (
            citasPaginadas.map((cita) => (
              <tr key={cita.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={seleccionadas.includes(cita.id)}
                    onChange={() => toggleSeleccion(cita.id)}
                  />
                </td>

                <td className="text-muted fw-semibold" style={{ fontFamily: "monospace", width: "1%" }}>
                  {cita.id}
                </td>

                <td>{cita.estudiante?.firstName ?? "—"} {cita.estudiante?.lastName ?? ""}</td>
                <td>{cita.coordinador?.firstName ?? "—"} {cita.coordinador?.lastName ?? ""}</td>

                <td className="descripcion-col" title="Haz clic para ver completo">
                  <TextPreviewCell
                    label="Descripción"
                    text={cita.descripcion}
                    onOpen={abrirModalTexto}
                    max={100}
                  />
                </td>

                <td>{cita.estudiante?.campus?.nombre || "—"}</td>

                <td>{formatFechaCL(cita.createdAt)}</td>
                <td>{renderFechaCita(cita)}</td>
                <td>{cita.reagendadaEn ? formatFechaCL(cita.reagendadaEn) : "—"}</td>

                <td className="motivo-col" title="Haz clic para ver completo">
                  <TextPreviewCell
                    label="Motivo"
                    text={(cita.observacion || "").trim()}
                    onOpen={abrirModalTexto}
                    max={80}
                  />
                </td>

                <td>
                  <select
                    className="form-select form-select-sm"
                    value={cita.modalidad}
                    onChange={(e) => actualizarModalidad(cita.id, e.target.value)}
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </td>

                <td>
                  <select
                    className="form-select form-select-sm"
                    value={cita.estado}
                    onChange={(e) => actualizarEstado(cita.id, e.target.value)}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aceptada">Aceptada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>Página {paginaActual} de {totalPaginas}</span>
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambiar={setPaginaActual}
        />
      </div>

      <ModalTexto
        visible={modalTxt.visible}
        title={modalTxt.title}
        text={modalTxt.text}
        onClose={cerrarModalTexto}
      />
    </>
  );
}
