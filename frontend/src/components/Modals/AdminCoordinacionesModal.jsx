import { useState } from "react";
import { auth } from "../../firebase";

export default function AdminCoordinacionesModal({ user, catalogos, onClose, onSaved }) {
  const [items, setItems] = useState(
    (user.coordinaciones || []).map(co => ({
      campus: co.campus?.nombre,
      carrera: co.carrera?.nombre,
    }))
  );

  const [draft, setDraft] = useState({ sedeId: "", campusId: "", facultadId: "", carreraId: "" });

  const campusBySede = new Map();
  (catalogos?.sedes || []).forEach(s => campusBySede.set(s.id, []));
  (catalogos?.campus || []).forEach(c => {
    if (!campusBySede.has(c.sedeId)) campusBySede.set(c.sedeId, []);
    campusBySede.get(c.sedeId).push(c);
  });

  const carrerasByFac = new Map();
  (catalogos?.facultades || []).forEach(f => carrerasByFac.set(f.id, []));
  (catalogos?.carreras || []).forEach(ca => {
    if (!carrerasByFac.has(ca.facultadId)) carrerasByFac.set(ca.facultadId, []);
    carrerasByFac.get(ca.facultadId).push(ca);
  });

  const campusOpts = draft.sedeId ? (campusBySede.get(Number(draft.sedeId)) || []) : (catalogos?.campus || []);
  const carreraOpts = draft.facultadId ? (carrerasByFac.get(Number(draft.facultadId)) || []) : (catalogos?.carreras || []);

  const addItem = () => {
    const campus = campusOpts.find(c => c.id === Number(draft.campusId));
    const carrera = carreraOpts.find(ca => ca.id === Number(draft.carreraId));
    if (!campus || !carrera) return alert("Seleccione campus y carrera");
    const nuevo = { campus: campus.nombre, carrera: carrera.nombre };
    // evitar duplicados exactos
    if (items.some(it => it.campus === nuevo.campus && it.carrera === nuevo.carrera)) return;
    setItems(prev => [...prev, nuevo]);
    setDraft({ sedeId: "", campusId: "", facultadId: "", carreraId: "" });
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios/${user.uid}/coordinaciones`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error al guardar coberturas");
      return;
    }
    onSaved?.(data); // <- usuario actualizado completo
  };

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 720 }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Cobertura de Coordinación — {user.firstName} {user.lastName}</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <div className="row g-2 align-items-end">
              <div className="col-3">
                <label className="form-label">Sede</label>
                <select
                  className="form-select form-select-sm"
                  value={draft.sedeId}
                  onChange={(e) => setDraft({ ...draft, sedeId: e.target.value, campusId: "" })}
                >
                  <option value="">—</option>
                  {(catalogos?.sedes || []).map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="col-3">
                <label className="form-label">Campus</label>
                <select
                  className="form-select form-select-sm"
                  value={draft.campusId}
                  onChange={(e) => setDraft({ ...draft, campusId: e.target.value })}
                >
                  <option value="">—</option>
                  {campusOpts.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="col-3">
                <label className="form-label">Facultad</label>
                <select
                  className="form-select form-select-sm"
                  value={draft.facultadId}
                  onChange={(e) => setDraft({ ...draft, facultadId: e.target.value, carreraId: "" })}
                >
                  <option value="">—</option>
                  {(catalogos?.facultades || []).map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
              </div>
              <div className="col-3">
                <label className="form-label">Carrera</label>
                <select
                  className="form-select form-select-sm"
                  value={draft.carreraId}
                  onChange={(e) => setDraft({ ...draft, carreraId: e.target.value })}
                >
                  <option value="">—</option>
                  {carreraOpts.map(ca => <option key={ca.id} value={ca.id}>{ca.nombre}</option>)}
                </select>
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button className="btn btn-outline-primary btn-sm" onClick={addItem}>Agregar</button>
              </div>
            </div>

            <hr />

            <ul className="list-group">
              {items.length === 0 && <li className="list-group-item text-muted">Sin coberturas</li>}
              {items.map((it, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{it.campus} — {it.carrera}</span>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(idx)}>Quitar</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={save}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
