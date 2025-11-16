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

  // Modal de detalle (texto libre)
  const [modalTxt, setModalTxt] = useState({
    visible: false,
    title: "",
    text: "",
  });
  const cerrarModalTexto = () =>
    setModalTxt({ visible: false, title: "", text: "" });

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
      const alumno = `${cita.estudiante?.firstName ?? ""} ${
        cita.estudiante?.lastName ?? ""
      }`.toLowerCase();
      const estado = cita.estado?.toLowerCase() || "";
      const fechaSolicitud = new Date(cita.createdAt)
        .toISOString()
        .slice(0, 10);

      const coincideRut =
        !filtros.rut || rut.includes(filtros.rut.toLowerCase());
      const coincideNombre =
        !filtros.alumno ||
        alumno.includes(filtros.alumno.toLowerCase());
      const coincideEstado =
        !filtros.estado || estado === filtros.estado.toLowerCase();
      const coincideFecha =
        (!filtros.fechaInicio || fechaSolicitud >= filtros.fechaInicio) &&
        (!filtros.fechaFin || fechaSolicitud <= filtros.fechaFin);

      return coincideRut && coincideNombre && coincideEstado && coincideFecha;
    });
  }, [citas, filtros]);

  // Orden
  const citasOrdenadas = useMemo(
    () =>
      sortCollection(citasFiltradas, sortMode, {
        getCreatedAt: (c) => c.createdAt,
        getEstado: (c) => c.estado,
      }),
    [citasFiltradas, sortMode]
  );

  // Paginación
  const totalPaginas =
    Math.ceil(citasOrdenadas.length / citasPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * citasPorPagina;
  const citasPaginadas = citasOrdenadas.slice(
    indiceInicio,
    indiceInicio + citasPorPagina
  );

  // Helper para armar texto de detalle en el modal
  const abrirDetalleCita = (cita) => {
    const estudiante = `${cita.estudiante?.firstName || ""} ${
      cita.estudiante?.lastName || ""
    }`.trim() || "—";

    const rut = cita.estudiante?.rut || "—";
    const correo = cita.estudiante?.email || "—";
    const carrera = cita.estudiante?.carrera?.nombre || "—";
    const facultad =
      cita.estudiante?.carrera?.facultad?.nombre || "—";
    const campus = cita.estudiante?.campus?.nombre || "—";
    const modalidad = cita.modalidad || "—";
    const descripcion = (cita.descripcion || "").trim() || "—";
    const motivo = (cita.observacion || "").trim() || "—";
    const fechaSolicitud = formatFechaCL(cita.createdAt);

    const estadoLower = (cita.estado || "").toLowerCase();
    let fechaCitaTexto = "";
    if (estadoLower === "rechazada") {
      fechaCitaTexto = "No aplica";
    } else if (estadoLower === "pendiente") {
      fechaCitaTexto = "Por confirmar";
    } else if (!cita.fecha) {
      fechaCitaTexto = "—";
    } else {
      fechaCitaTexto = formatFechaCL(cita.fecha);
    }

    const estado = cita.estado || "—";

    const texto = `
Estudiante: ${estudiante}
RUT: ${rut}
Correo: ${correo}

Carrera: ${carrera}
Facultad: ${facultad}
Campus: ${campus}

Modalidad: ${modalidad}
Estado: ${estado}

Fecha de solicitud: ${fechaSolicitud}
Fecha de cita: ${fechaCitaTexto}

Descripción:
${descripcion}

Motivo:
${motivo}
    `.trim();

    setModalTxt({
      visible: true,
      title: `Detalle de la cita #${cita.id}`,
      text: texto,
    });
  };

  if (cargando) {
    return (
      <div className="p-5 text-center">
        Cargando panel de coordinación...
      </div>
    );
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
          onChange={(val) => {
            setSortMode(val);
            setPaginaActual(1);
          }}
          modes={[
            SORT_MODES.NEWEST,
            SORT_MODES.OLDEST,
            SORT_MODES.PENDING_FIRST,
          ]}
        />

        {citasPaginadas.length === 0 ? (
          <p>No hay citas que coincidan con los filtros.</p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-hover tabla-citas">
                <thead className="table-light encabezado-citas text-center">
                  <tr>
                    <th className="col-id">ID</th>
                    <th>RUT</th>
                    <th>Estudiante</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {citasPaginadas.map((cita) => {
                    const yaAceptada =
                      (cita.estado || "").toLowerCase() === "aceptada";
                    const pendiente =
                      (cita.estado || "").toLowerCase() === "pendiente";

                    const nombreEstudiante = `${
                      cita.estudiante?.firstName || ""
                    } ${cita.estudiante?.lastName || ""}`.trim();

                    return (
                      <tr className="text-center" key={cita.id}>
                        <td
                          className="text-muted fw-semibold col-id"
                          style={{ fontFamily: "monospace" }}
                        >
                          {cita.id}
                        </td>

                        <td>{cita.estudiante?.rut || "—"}</td>

                        <td>{nombreEstudiante || "—"}</td>

                        <td>
                          <span
                            className={`badge text-capitalize ${
                              yaAceptada
                                ? "bg-success"
                                : (cita.estado || "").toLowerCase() ===
                                  "rechazada"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {cita.estado || "—"}
                          </span>
                        </td>

                        <td className="text-center">
                          <div className="acciones-cita d-flex gap-2 flex-wrap">
                            {/* Ver detalle en modal */}
                            <button
                              className="btn-institucional-outline-sm"
                              onClick={() => abrirDetalleCita(cita)}
                            >
                              Ver detalle
                            </button>

                            {pendiente && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ width: 80 }}
                                  onClick={() => {
                                    setCitaSeleccionada(cita);
                                    setShowAceptar(true);
                                  }}
                                >
                                  Aceptar
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  style={{ width: 80 }}
                                  onClick={() => {
                                    setCitaSeleccionada(cita);
                                    setShowRechazar(true);
                                  }}
                                >
                                  Rechazar
                                </button>
                              </>
                            )}

                            {yaAceptada && (
                              <button
                                className="btn btn-warning btn-sm text-white"
                                style={{ width: 80 }}
                                onClick={() => {
                                  setCitaSeleccionada(cita);
                                  setShowReagendar(true);
                                }}
                              >
                                Reagendar
                              </button>
                            )}

                            {!pendiente && !yaAceptada && (
                              <span className="text-muted">
                                Ya gestionada
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <Paginacion
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onCambiar={setPaginaActual}
              />
            </div>
          </>
        )}

        {/* Modal de detalle */}
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
