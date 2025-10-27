// src/components/Modals/ModalCoberturaCoordinacion.jsx
import { useEffect, useMemo, useState } from "react";
import { auth } from "../../firebase";

export default function ModalCoberturaCoordinacion({
  visible,
  user,              // { id, uid, firstName, lastName, coordinaciones: [...] }
  onClose,
  onChanged,         // (rows) => refrescar la fila en la tabla padre
}) {
  // Cargar catálogos internamente (ya no vienen por props)
  const [catalogos, setCatalogos] = useState({ sedes: [], campus: [], facultades: [], carreras: [] });
  const [loadingCats, setLoadingCats] = useState(true);

  const [rows, setRows] = useState(user?.coordinaciones || []);
  const [sedeId, setSedeId] = useState("");
  const [campusId, setCampusId] = useState("");
  const [facultadId, setFacultadId] = useState("");
  const [carreraId, setCarreraId] = useState("");

  // Cargar catálogos al abrir el modal
  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        setLoadingCats(true);
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/catalogos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCatalogos({
          sedes: data.sedes || [],
          campus: data.campus || [],
          facultades: data.facultades || [],
          carreras: data.carreras || [],
        });
      } catch (e) {
        console.error("Error cargando catálogos:", e);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, [visible]);

  // Sincronizar filas si cambia el usuario
  useEffect(() => {
    setRows(user?.coordinaciones || []);
  }, [user]);

  // Derivados dependientes
  const campusOptions = useMemo(() => {
    if (!sedeId) return catalogos.campus;
    return catalogos.campus.filter(c => c.sedeId === Number(sedeId));
  }, [catalogos.campus, sedeId]);

  const carreraOptions = useMemo(() => {
    if (!facultadId) return catalogos.carreras;
    return catalogos.carreras.filter(c => c.facultadId === Number(facultadId));
  }, [catalogos.carreras, facultadId]);

  if (!visible) return null;

  const addPair = async () => {
    const campusIdNum = Number(campusId);
    const carreraIdNum = Number(carreraId);
    if (!campusIdNum || !carreraIdNum) return;

    // Evitar duplicados locales
    if (rows.some(r => Number(r.campusId) === campusIdNum && Number(r.carreraId) === carreraIdNum)) {
      alert("Esta cobertura ya existe para el/la coordinador/a.");
      return;
    }

    const ok = window.confirm("¿Agregar esta cobertura (Campus × Carrera)?");
    if (!ok) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios/${user.id}/coordinaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ campusId: campusIdNum, carreraId: carreraIdNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al agregar cobertura");

      const next = [...rows, data];
      setRows(next);
      onChanged?.(next);
    } catch (e) {
      alert(e.message);
    }
  };

  const removePair = async (row) => {
    const ok = window.confirm(`¿Eliminar cobertura ${row.campus?.nombre} × ${row.carrera?.nombre}?`);
    if (!ok) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios/${user.id}/coordinaciones`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ campusId: Number(row.campusId), carreraId: Number(row.carreraId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al eliminar cobertura");

      const next = rows.filter(r => !(Number(r.campusId) === Number(row.campusId) && Number(r.carreraId) === Number(row.carreraId)));
      setRows(next);
      onChanged?.(next);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="modal fade show"
         style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
         tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <div className="modal-header">
            <h5 className="modal-title">
              Cobertura de Coordinación — {user?.firstName} {user?.lastName}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {loadingCats ? (
              <div className="text-muted">Cargando catálogos…</div>
            ) : (
              <>
                {/* Filtros/selección */}
                <div className="row g-2 mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Sede</label>
                    <select className="form-select form-select-sm"
                            value={sedeId}
                            onChange={(e) => { setSedeId(e.target.value); setCampusId(""); }}>
                      <option value="">Todas</option>
                      {catalogos.sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Campus</label>
                    <select className="form-select form-select-sm"
                            value={campusId}
                            onChange={(e) => setCampusId(e.target.value)}>
                      <option value="">Seleccione</option>
                      {campusOptions.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Facultad</label>
                    <select className="form-select form-select-sm"
                            value={facultadId}
                            onChange={(e) => { setFacultadId(e.target.value); setCarreraId(""); }}>
                      <option value="">Todas</option>
                      {catalogos.facultades.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Carrera</label>
                    <select className="form-select form-select-sm"
                            value={carreraId}
                            onChange={(e) => setCarreraId(e.target.value)}>
                      <option value="">Seleccione</option>
                      {carreraOptions.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <button className="btn-institucional-outline-sm mb-3" onClick={addPair} disabled={!campusId || !carreraId}>
                  Agregar cobertura
                </button>

                {/* Chips/lista de coberturas */}
                {rows.length === 0 ? (
                  <div className="text-muted">Sin coberturas asignadas aún.</div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {rows.map((r) => (
                      <span key={`${r.campusId}-${r.carreraId}`} className="badge bg-light border text-dark">
                        {r.campus?.nombre} — {r.carrera?.nombre}
                        <button
                          type="button"
                          className="btn btn-sm btn-link ms-2"
                          onClick={() => removePair(r)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
