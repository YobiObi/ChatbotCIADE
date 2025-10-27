// src/pages/Alumno/CitasAlumno.jsx
import { useMemo, useState } from "react";
import Banner from "../../components/BannerTitulo";
import ModalTexto from "../../components/Modals/ModalTexto";
import Paginacion from "../../components/Paginacion";
import FiltrosInstitucionales from "../../components/FiltrosInstitucionales";
import SortBar from "../../components/SortBar";
import { sortCollection, SORT_MODES } from "../../utils/sortCollection";
import { useCitasAlumno } from "../../hooks/useCitasAlumno";

import TextPreviewCell from "../../components/Table/TextPreviewCell";
import FechaCell from "../../components/Table/FechaCell";
import CitaStatusBadge from "../../components/Modals/Citas/CitaStatusBadge";

export default function CitasAlumno() {
  const { citas, cargando } = useCitasAlumno();

  // Modal genérico
  const [modalTxt, setModalTxt] = useState({ visible: false, title: "", text: "" });
  const abrirModalTexto = (title, text) => setModalTxt({ visible: true, title, text });
  const cerrarModalTexto = () => setModalTxt({ visible: false, title: "", text: "" });

  const [paginaActual, setPaginaActual] = useState(1);
  const citasPorPagina = 7;

  const [filtros, setFiltros] = useState({
    modalidad: "",
    estado: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const [sortMode, setSortMode] = useState(SORT_MODES.NEWEST);

  // filtros
  const citasFiltradas = useMemo(() => {
    return (citas || []).filter((c) => {
      const modalidad = c.modalidad?.toLowerCase() || "";
      const estado = c.estado?.toLowerCase() || "";
      const fechaSolicitud = new Date(c.createdAt).toISOString().slice(0, 10);

      const okMod = !filtros.modalidad || modalidad === filtros.modalidad.toLowerCase();
      const okEst = !filtros.estado || estado === filtros.estado.toLowerCase();
      const okFecha =
        (!filtros.fechaInicio || fechaSolicitud >= filtros.fechaInicio) &&
        (!filtros.fechaFin || fechaSolicitud <= filtros.fechaFin);

      return okMod && okEst && okFecha;
    });
  }, [citas, filtros]);

  // orden + paginación
  const citasOrdenadas = useMemo(
    () =>
      sortCollection(citasFiltradas, sortMode, {
        getCreatedAt: (c) => c.createdAt,      // para NEWEST/OLDEST
        getEstado: (c) => c.estado,            // habilita PENDING_FIRST
        // opcional: tiebreaker: (a,b) => a.id - b.id,
      }),
    [citasFiltradas, sortMode]
  );

  const totalPaginas = Math.ceil(citasOrdenadas.length / citasPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * citasPorPagina;
  const citasPaginadas = citasOrdenadas.slice(indiceInicio, indiceInicio + citasPorPagina);

  // helpers render
  const renderFechaCita = (c) => {
    const e = (c.estado || "").toLowerCase();
    if (e === "rechazada") return <span className="text-muted">No aplica</span>;
    if (e === "pendiente") return <span className="text-secondary">Por confirmar</span>;
    return <FechaCell value={c.fecha} />;
  };

  if (cargando) return <div className="p-5 text-center">Cargando tus citas...</div>;
  if (citas.length === 0) return <div className="p-5 text-center">No tienes citas solicitadas.</div>;

  return (
    <>
      <Banner title="Mis Citas" />
      <div className="container my-5">
        <FiltrosInstitucionales
          filtros={filtros}
          setFiltros={(n) => { setFiltros(n); setPaginaActual(1); }}
          campos={["modalidad", "estado", "fechaInicio", "fechaFin"]}
        />

        <SortBar
          value={sortMode}
          onChange={(val) => { setSortMode(val); setPaginaActual(1); }}
          modes={[SORT_MODES.NEWEST, SORT_MODES.OLDEST, SORT_MODES.PENDING_FIRST]}
        />

        <table className="table table-bordered table-hover tabla-citas">
          <thead className="encabezado-citas">
            <tr>
              <th style={{ width: "5%" }}>ID</th>
              <th>Coordinador</th>
              <th>Descripción</th>
              <th>Modalidad</th>
              <th>Campus</th>
              <th>Facultad</th>
              <th>Fecha Creación</th>
              <th>Fecha Cita</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {citasPaginadas.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-4 text-muted">
                  No hay resultados para este filtro.
                </td>
              </tr>
            ) : (
              citasPaginadas.map((cita) => {
                const coordinador = cita.coordinador
                  ? `${cita.coordinador.firstName} ${cita.coordinador.lastName}` : "—";

                return (
                  <tr key={cita.id}>
                    <td className="text-muted fw-semibold" style={{ fontFamily: "monospace", width: "5%" }}>
                      {cita.id}
                    </td>

                    <td>{coordinador}</td>

                    <td className="descripcion-col">
                      <TextPreviewCell
                        label="Descripción"
                        text={cita.descripcion}
                        onOpen={abrirModalTexto}
                        max={100}
                      />
                    </td>

                    <td className="text-capitalize">{cita.modalidad}</td>
                    <td>{cita.estudiante?.campus?.nombre || "—"}</td>
                    <td>{cita.estudiante?.carrera?.facultad?.nombre || "—"}</td>

                    <td><FechaCell value={cita.createdAt} /></td>
                    <td>{renderFechaCita(cita)}</td>

                    <td className="motivo-col">
                      <TextPreviewCell
                        label="Motivo"
                        text={(cita.observacion || "").trim()}
                        onOpen={abrirModalTexto}
                        max={80}
                      />
                    </td>

                    <td><CitaStatusBadge estado={cita.estado} /></td>
                  </tr>
                );
              })
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
      </div>
    </>
  );
}
