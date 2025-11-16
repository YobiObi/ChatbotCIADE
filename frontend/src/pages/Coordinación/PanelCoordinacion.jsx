// src/pages/Coordinacion/PanelCoordinacion.jsx
import { useEffect, useMemo, useState } from "react";
import Banner from "../../components/BannerTitulo";

import ModalTexto from "../../components/Modals/ModalTexto";
import ModalAceptarCita from "../../components/Modals/Citas/ModalAceptarCita";
import ModalRechazarCita from "../../components/Modals/Citas/ModalRechazarCita";
import ModalReagendarCita from "../../components/Modals/Citas/ModalReagendarCita";

import FiltrosInstitucionales from "../../components/FiltrosInstitucionales";
import Paginacion from "../../components/Paginacion";
import SortBar from "../../components/SortBar";
import TextPreviewCell from "../../components/Table/TextPreviewCell";

import { formatFechaCL } from "../../utils/formatFecha";
import { sortCollection, SORT_MODES } from "../../utils/sortCollection";
import { useAuth } from "../../context/AuthContext";
import {
  getCitasCoordinador,
  aceptarCita,
  rechazarCita,
  reagendarCita,
} from "../../services/citas.api";

export default function PanelCoordinacion() {
  const { user, token, cargando } = useAuth();
  const rol = user?.role?.name;

  const [citas, setCitas] = useState([]);

  // Modal genérico (Descripción/Motivo)
  const [modalTxt, setModalTxt] = useState({ visible: false, title: "", text: "" });
  const abrirModalTexto = (title, text) => setModalTxt({ visible: true, title, text });
  const cerrarModalTexto = () => setModalTxt({ visible: false, title: "", text: "" });

  // Modales de acción
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [showAceptar, setShowAceptar] = useState(false);
  const [showRechazar, setShowRechazar] = useState(false);
  const [showReagendar, setShowReagendar] = useState(false);

  // Filtros / orden / página
  const [filtros, setFiltros] = useState({
    rut: "",
    alumno: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "",
  });
  const [sortMode, setSortMode] = useState(SORT_MODES.NEWEST);
  const [paginaActual, setPaginaActual] = useState(1);
  const citasPorPagina = 5;

  // Cargar citas
  const refetch = async () => {
    if (!token || rol !== "Coordinacion") return;
    try {
      const data = await getCitasCoordinador(token);
      setCitas(data.citas || []);
    } catch (e) {
      console.error("Error al cargar citas:", e);
    }
  };
  useEffect(() => {
    refetch();
  }, [token, rol]);

  // Filtros
  const citasFiltradas = useMemo(() => {
    return (citas || []).filter((cita) => {
      const rut = cita.estudiante?.rut?.toLowerCase() || "";
      const alumno = `${cita.estudiante?.firstName ?? ""} ${cita.estudiante?.lastName ?? ""}`.toLowerCase();
      const estado = cita.estado?.toLowerCase() || "";
      const fechaSolicitud = new Date(cita.createdAt).toISOString().slice(0, 10);

      const coincideRut = !filtros.rut || rut.includes(filtros.rut.toLowerCase());
      const coincideNombre = !filtros.alumno || alumno.includes(filtros.alumno.toLowerCase());
      const coincideEstado = !filtros.estado || estado === filtros.estado.toLowerCase();
      const coincideFecha =
        (!filtros.fechaInicio || fechaSolicitud >= filtros.fechaInicio) &&
        (!filtros.fechaFin || fechaSolicitud <= filtros.fechaFin);

      return coincideRut && coincideNombre && coincideEstado && coincideFecha;
    });
  }, [citas, filtros]);

  // Orden
  const citasOrdenadas = useMemo(
    () => sortCollection(citasFiltradas, sortMode, {
      getCreatedAt: (c) => c.createdAt,      // para NEWEST/OLDEST
      getEstado: (c) => c.estado,            // habilita PENDING_FIRST
      // opcional: tiebreaker: (a,b) => a.id - b.id,
    }),
  [citasFiltradas, sortMode]
);

  // Paginación
  const totalPaginas = Math.ceil(citasOrdenadas.length / citasPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * citasPorPagina;
  const citasPaginadas = citasOrdenadas.slice(indiceInicio, indiceInicio + citasPorPagina);

  // Helpers
  const renderFechaCita = (cita) => {
    const estado = (cita.estado || "").toLowerCase();
    const definida = estado === "aceptada" || !!cita.reagendadaEn;
    if (estado === "rechazada") return <span className="text-muted">No aplica</span>;
    if (estado === "pendiente") return <span className="text-secondary">Por confirmar</span>;
    if (!definida || !cita.fecha) return "";
    return formatFechaCL(cita.fecha);
  };

  if (cargando) {
    return <div className="p-5 text-center">Cargando panel de coordinación...</div>;
  }

  return (
    <>
      <Banner title="Panel de Coordinación" />
      <div className="container my-5">
        <FiltrosInstitucionales
          filtros={filtros}
          setFiltros={(nuevos) => {
            setFiltros(nuevos);
            setPaginaActual(1);
          }}
          campos={["rut", "alumno", "fechaInicio", "fechaFin", "estado"]}
        />

        <SortBar
          value={sortMode}
          onChange={(val) => { setSortMode(val); setPaginaActual(1); }}
          modes={[SORT_MODES.NEWEST, SORT_MODES.OLDEST, SORT_MODES.PENDING_FIRST]}
        />

        {citasPaginadas.length === 0 ? (
          <p>No hay citas que coincidan con los filtros.</p>
        ) : (
          <>
            <table className="table table-bordered table-hover tabla-citas">
              <thead className="table-light encabezado-citas text-center">
                <tr>
                  <th className="col-id">ID</th>
                  <th>RUT</th>
                  <th>Estudiante</th>
                  <th>Correo</th>
                  <th>Carrera</th>
                  <th>Facultad</th>
                  <th>Campus</th>
                  <th>Modalidad</th>
                  <th>Descripción</th>
                  <th>Fecha Solicitud</th>
                  <th>Fecha Cita</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {citasPaginadas.map((cita) => {
                  const yaAceptada = (cita.estado || "").toLowerCase() === "aceptada";
                  const pendiente = (cita.estado || "").toLowerCase() === "pendiente";

                  return (
                    <tr key={cita.id}>
                      <td
                        className="text-muted fw-semibold col-id"
                        style={{ fontFamily: "monospace" }}
                      >
                        {cita.id}
                      </td>

                      <td>{cita.estudiante?.rut}</td>
                      <td>{cita.estudiante?.firstName} {cita.estudiante?.lastName}</td>
                      <td className="correo-col">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-start w-100"
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                          }}
                          title={cita.estudiante?.email}
                          onClick={() =>
                            abrirModalTexto(
                              "Correo del estudiante",
                              cita.estudiante?.email || "—"
                            )
                          }
                        >
                          {cita.estudiante?.email || "—"}
                        </button>
                      </td>
                      
                      <td>{cita.estudiante?.carrera?.nombre || "—"}</td>
                      <td>{cita.estudiante?.carrera?.facultad?.nombre || "—"}</td>
                      <td>{cita.estudiante?.campus?.nombre || "—"}</td>
                      <td className="text-capitalize">{cita.modalidad}</td>

                      <td className="descripcion-col" title="Haz clic para ver completo">
                        <TextPreviewCell
                          label="Descripción"
                          text={cita.descripcion}
                          onOpen={abrirModalTexto}
                          max={100}
                        />
                      </td>

                      <td>{formatFechaCL(cita.createdAt)}</td>
                      <td>{renderFechaCita(cita)}</td>

                      <td className="motivo-col" title="Haz clic para ver completo">
                        <TextPreviewCell
                          label="Motivo"
                          text={(cita.observacion || "").trim()}
                          onOpen={abrirModalTexto}
                          max={80}
                        />
                      </td>

                      <td>
                        <span
                          className={`badge text-capitalize ${
                            yaAceptada
                              ? "bg-success"
                              : (cita.estado || "").toLowerCase() === "rechazada"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </td>

                      <td>
                        <div className="acciones-cita d-flex gap-2 flex-wrap" >
                          {pendiente && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                style = {{width:80}}
                                onClick={() => { setCitaSeleccionada(cita); setShowAceptar(true); }}
                              >
                                Aceptar
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                style = {{width:80}}
                                onClick={() => { setCitaSeleccionada(cita); setShowRechazar(true); }}
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                          {yaAceptada && (
                            <button
                              className="btn btn-warning btn-sm text-white"
                              style = {{width:80}}
                              onClick={() => { setCitaSeleccionada(cita); setShowReagendar(true); }}
                            >
                              Reagendar
                            </button>
                          )}

                          {!pendiente && !yaAceptada && (
                            <span className="text-muted">Ya gestionada</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
          </>
        )}

        {/* Modal Texto unificado (Descripción / Motivo) */}
        <ModalTexto
          visible={modalTxt.visible}
          title={modalTxt.title}
          text={modalTxt.text}
          onClose={cerrarModalTexto}
        />

        {/* Aceptar */}
        {showAceptar && (
          <ModalAceptarCita
            cita={citaSeleccionada}
            onClose={() => setShowAceptar(false)}
            onSubmit={async ({ enlaceVirtual, ubicacion, fechaISO }) => {
              try {
                await aceptarCita(
                  citaSeleccionada.id,
                  { enlaceVirtual, ubicacion, fechaISO },
                  token
                );
                setShowAceptar(false);
                await refetch();
              } catch (e) {
                alert(e.message);
              }
            }}
          />
        )}

        {/* Rechazar */}
        {showRechazar && (
          <ModalRechazarCita
            onClose={() => setShowRechazar(false)}
            onSubmit={async ({ motivo }) => {
              try {
                await rechazarCita(citaSeleccionada.id, { motivo }, token);
                setShowRechazar(false);
                await refetch();
              } catch (e) {
                alert(e.message);
              }
            }}
          />
        )}

        {/* Reagendar */}
        {showReagendar && (
          <ModalReagendarCita
            cita={citaSeleccionada}
            onClose={() => setShowReagendar(false)}
            onSubmit={async (payload) => {
              try {
                await reagendarCita(citaSeleccionada.id, payload, token);
                setShowReagendar(false);
                await refetch();
              } catch (e) {
                alert(e.message);
              }
            }}
          />
        )}
      </div>
    </>
  );
}
