import { useEffect, useMemo, useState } from "react";
import Paginacion from "../../components/Paginacion";
import FiltrosInstitucionales from "../../components/FiltrosInstitucionales";
import { formatFechaCL } from "../../utils/formatFecha";
import SortBar from "../../components/SortBar";
import { SORT_MODES } from "../../utils/sortCollection";
import { auth } from "../../firebase";

export default function UsuariosTable({ usuarios }) {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [seleccionados, setSeleccionados] = useState([]);
  const [sortMode, setSortMode] = useState(SORT_MODES.NEWEST);

  const [filtro, setFiltro] = useState({
    rut: "", nombre: "", email: "",
    campus: "", facultad: "", sede: "", rol: ""
  });

  const usuariosPorPagina = 10;

  useEffect(() => {
    setListaUsuarios(usuarios || []);
  }, [usuarios]);

  // Resumen de roles (Coordinación, Alumnos, Admin)
  const resumenRoles = useMemo(() => {
    const acc = { Coordinacion: 0, Alumno: 0, Admin: 0 };
    for (const u of listaUsuarios) {
      const r = u.role?.name;
      if (r && acc[r] !== undefined) acc[r]++;
    }
    return acc;
  }, [listaUsuarios]);

  // Filtrar
  const usuariosFiltrados = useMemo(() => {
    return (listaUsuarios || []).filter((u) => {
      const nombre = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim().toLowerCase();
      const rol = u.role?.name?.toLowerCase() || "";
      const campus = u.campus?.nombre?.toLowerCase() || "";
      const facultad = u.carrera?.facultad?.nombre?.toLowerCase() || "";
      const sede = u.campus?.sede?.nombre?.toLowerCase() || "";
      const email = u.email?.toLowerCase() || "";
      const rut = (u.rut || "").toLowerCase();

      return (
        nombre.includes((filtro.nombre || "").toLowerCase()) &&
        email.includes((filtro.email || "").toLowerCase()) &&
        campus.includes((filtro.campus || "").toLowerCase()) &&
        facultad.includes((filtro.facultad || "").toLowerCase()) &&
        sede.includes((filtro.sede || "").toLowerCase()) &&
        rut.includes((filtro.rut || "").toLowerCase()) &&
        rol.includes((filtro.rol || "").toLowerCase())
      );
    });
  }, [listaUsuarios, filtro]);

  // Ordenar según sortMode
  const usuariosOrdenados = useMemo(() => {
    const arr = [...usuariosFiltrados];
    arr.sort((a, b) => {
      const aT = new Date(a.createdAt || 0).getTime();
      const bT = new Date(b.createdAt || 0).getTime();
      if (sortMode === SORT_MODES.NEWEST) return bT - aT;
      if (sortMode === SORT_MODES.OLDEST) return aT - bT;
      return 0;
    });
    return arr;
  }, [usuariosFiltrados, sortMode]);

  // Paginación
  const totalPaginas = Math.ceil(usuariosOrdenados.length / usuariosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const usuariosPaginados = usuariosOrdenados.slice(indiceInicio, indiceInicio + usuariosPorPagina);

  const toggleSeleccion = (uid) => {
    setSeleccionados((prev) =>
      prev.includes(uid) ? prev.filter((i) => i !== uid) : [...prev, uid]
    );
  };

  return (
    <>
      {/* Filtros + SortBar + Resumen */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <FiltrosInstitucionales
          filtros={filtro}
          setFiltros={(nuevos) => { setFiltro(nuevos); setPaginaActual(1); }}
          campos={["rut", "nombre", "email", "campus", "facultad", "sede", "rol"]}
        />

        {/* Resumen de roles */}
        <div className="text-end">
          <div className="d-flex flex-wrap justify-content-end gap-2 mb-2">
            <span className="badge bg-secondary">
              Coordinadores CIADE: {resumenRoles.Coordinacion}
            </span>
            <span className="badge bg-secondary">
              Alumnos: {resumenRoles.Alumno}
            </span>
            <span className="badge bg-secondary">
              Admin: {resumenRoles.Admin}
            </span>
          </div>

          {/* SortBar de orden */}
          <SortBar
            value={sortMode}
            onChange={(mode) => { setSortMode(mode); setPaginaActual(1); }}
            modes={[SORT_MODES.NEWEST, SORT_MODES.OLDEST]}
          />
        </div>
      </div>

      {seleccionados.length > 0 && (
      <div className="mb-3 d-flex gap-2 align-items-center">
        <button
          className="btn btn-danger btn-sm"
          onClick={async () => {
            const ok = window.confirm(`¿Eliminar ${seleccionados.length} usuario(s)? Esta acción también intentará borrar sus cuentas en Firebase.`);
            if (!ok) return;
            try {
              const token = await auth.currentUser.getIdToken();
              const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ uids: seleccionados }), // tu endpoint de borrado masivo usa UIDs
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || "No se pudo eliminar");

              // refresco local
              setListaUsuarios(prev => prev.filter(u => !seleccionados.includes(u.uid)));
              setSeleccionados([]);
              alert(data?.message || "Usuarios eliminados correctamente");
            } catch (e) {
              alert(e.message);
            }
          }}
        >
          Eliminar {seleccionados.length} seleccionada(s)
        </button>
        <span className="text-muted small">Se eleminarán en la Base de Datos.</span>
      </div>
    )}

      {/* Tabla */}
      <table className="table table-bordered table-hover">
        <thead className="encabezado-citas text-center">
          <tr>
            <th style={{ width: "2%" }}>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSeleccionados(
                    e.target.checked ? usuariosPaginados.map((u) => u.uid) : []
                  )
                }
                checked={
                  usuariosPaginados.length > 0 &&
                  usuariosPaginados.every((u) => seleccionados.includes(u.uid))
                }
              />
            </th>
            <th>ID</th>
            <th style={{ width: "9%" }}>RUT</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Sede</th>
            <th>Campus</th>
            <th>Facultad</th>
            <th>Carrera</th>
            <th style={{ width: "8%" }}>Creado</th>
            <th>Actualizado</th>
            <th>Rol</th>
          </tr>
        </thead>

        <tbody>
          {usuariosPaginados.length === 0 ? (
            <tr>
              <td colSpan="12" className="text-center py-4 text-muted">
                No hay resultados para este filtro.
              </td>
            </tr>
          ) : (
            usuariosPaginados.map((u) => (
              <tr key={u.uid}>
                <td>
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(u.uid)}
                    onChange={() => toggleSeleccion(u.uid)}
                  />
                </td>
                <td className="text-muted fw-semibold" style={{ fontFamily: "monospace" }}>
                  {u.id}
                </td>
                <td>{u.rut ?? "—"}</td>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.campus?.sede?.nombre || "—"}</td>
                <td>{u.campus?.nombre || "—"}</td>
                <td>{u.carrera?.facultad?.nombre || "—"}</td>
                <td>{u.carrera?.nombre || "—"}</td>
                <td>{formatFechaCL(u.createdAt)}</td>
                <td>{formatFechaCL(u.updatedAt)}</td>
                <td>{u.role?.name || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>Página {paginaActual} de {totalPaginas}</span>
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambiar={setPaginaActual}
        />
      </div>
    </>
  );
}
