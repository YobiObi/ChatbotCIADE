// src/components/Modals/Usuarios/ModalActualizarUsuario.jsx
import { useEffect, useMemo, useState } from "react";
import { auth } from "../../../firebase";
import ModalCoberturaCoordinacion from "../../Modals/ModalCoberturaCoordinacion";

export default function ModalActualizarUsuario({ visible, onClose, onUpdated }) {
  const [queryId, setQueryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [catalogos, setCatalogos] = useState({ sedes: [], campus: [], facultades: [], carreras: [] });
  const [user, setUser] = useState(null); // usuario cargado por ID
  const [form, setForm] = useState({
    rut: "", firstName: "", lastName: "", email: "", role: "",
    sedeId: "", campusNombre: "", facultadId: "", carreraNombre: ""
  });

  // Coberturas dentro del modal
  const [showCobertura, setShowCobertura] = useState(false);

  // Cargar catálogos una vez
  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
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
      }
    })();
  }, [visible]);

  // Derivados para selects dependientes
  const campusBySede = useMemo(() => {
    const map = new Map();
    for (const c of catalogos.campus) {
      if (!map.has(c.sedeId)) map.set(c.sedeId, []);
      map.get(c.sedeId).push(c);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return map;
  }, [catalogos.campus]);

  const carrerasByFacultad = useMemo(() => {
    const map = new Map();
    for (const c of catalogos.carreras) {
      if (!map.has(c.facultadId)) map.set(c.facultadId, []);
      map.get(c.facultadId).push(c);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return map;
  }, [catalogos.carreras]);

  const campusOpts = useMemo(() => {
    if (!form.sedeId) return [];
    return campusBySede.get(Number(form.sedeId)) || [];
  }, [form.sedeId, campusBySede]);

  const carreraOpts = useMemo(() => {
    if (!form.facultadId) return [];
    return carrerasByFacultad.get(Number(form.facultadId)) || [];
  }, [form.facultadId, carrerasByFacultad]);

  // Buscar usuario por ID
  const buscar = async () => {
    const idNum = Number(queryId);
    if (!Number.isInteger(idNum)) {
      alert("Ingresa un ID válido (número entero).");
      return;
    }
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios/${idNum}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo obtener el usuario.");

      setUser(data);

      // Inicializar formulario desde el usuario
      setForm({
        rut: data.rut || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        role: data.role?.name || "",

        // Dependientes
        sedeId: data.campus?.sede?.id || "",
        campusNombre: data.campus?.nombre || "",
        facultadId: data.carrera?.facultad?.id || "",
        carreraNombre: data.carrera?.nombre || "",
      });
    } catch (e) {
      console.error(e);
      alert(e.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Reset en cascada
  const onChangeSede = (e) => {
    const sedeId = e.target.value;
    setForm((prev) => ({
      ...prev,
      sedeId,
      campusNombre: "", // obligar a elegir un campus compatible
    }));
  };

  const onChangeFacultad = (e) => {
    const facultadId = e.target.value;
    setForm((prev) => ({
      ...prev,
      facultadId,
      carreraNombre: "", // obligar a elegir carrera compatible
    }));
  };

  // Guardar cambios
  const guardar = async () => {
    if (!user) return;
    const confirmar = window.confirm("¿Confirmas guardar los cambios de este usuario?");
    if (!confirmar) return;

    // Construir payload según backend (role, campus y carrera por NOMBRE)
    const payload = {
      rut: form.rut.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role || undefined,
      campus: form.campusNombre || undefined,
      carrera: form.carreraNombre || undefined,
    };

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar el usuario.");

      // avisa al padre para refrescar la tabla
      onUpdated?.(data);
      onClose?.();
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  // Handler cuando cambian coberturas dentro del sub-modal
  const onCoberturaChanged = (rows) => {
    setUser((prev) => prev ? { ...prev, coordinaciones: rows, updatedAt: new Date().toISOString() } : prev);
  };

  if (!visible) return null;

  const totalAsignaciones = user?.coordinaciones?.length || 0;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-unab text-white">
            <h5 className="modal-title">Actualizar usuario</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <div className="modal-body">
            {/* Buscador por ID */}
            <div className="d-flex gap-2 align-items-end mb-3">
              <div>
                <label className="form-label">ID del usuario</label>
                <input
                  className="form-control"
                  placeholder="Ej: 102"
                  value={queryId}
                  onChange={(e) => setQueryId(e.target.value)}
                />
              </div>
              <button className="btn-institucional-outline-sm" onClick={buscar} disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {!user ? (
              <div className="text-muted">Ingresa un ID y presiona “Buscar”.</div>
            ) : (
              <>
                {/* Header con rol y coberturas (si Coordinación) */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                    <div className="small text-muted">Rol actual: {form.role || "—"}</div>
                  </div>

                  {form.role === "Coordinacion" && (
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary">
                        {totalAsignaciones} asignación(es)
                      </span>
                      <button
                        className="btn-institucional-outline-sm"
                        onClick={() => setShowCobertura(true)}
                      >
                        Coberturas
                      </button>
                    </div>
                  )}
                </div>

                {/* Datos básicos */}
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">RUT</label>
                    <input
                      name="rut"
                      className="form-control"
                      value={form.rut}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Nombre</label>
                    <input
                      name="firstName"
                      className="form-control"
                      value={form.firstName}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Apellido</label>
                    <input
                      name="lastName"
                      className="form-control"
                      value={form.lastName}
                      onChange={onChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={onChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Rol</label>
                    <select
                      name="role"
                      className="form-select"
                      value={form.role}
                      onChange={onChange}
                    >
                      <option value="">Seleccione rol</option>
                      <option value="Alumno">Alumno</option>
                      <option value="Coordinacion">Coordinacion</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  {/* Sede / Campus */}
                  <div className="col-md-6">
                    <label className="form-label">Sede</label>
                    <select
                      name="sedeId"
                      className="form-select"
                      value={form.sedeId}
                      onChange={onChangeSede}
                    >
                      <option value="">Seleccione sede</option>
                      {catalogos.sedes.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                    <div className="form-text">Selecciona sede y luego campus.</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Campus</label>
                    <select
                      name="campusNombre"
                      className="form-select"
                      value={form.campusNombre}
                      onChange={onChange}
                      disabled={!form.sedeId}
                    >
                      <option value="">Seleccione campus</option>
                      {campusOpts.map(c => (
                        <option key={c.id} value={c.nombre}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Facultad / Carrera */}
                  <div className="col-md-6">
                    <label className="form-label">Facultad</label>
                    <select
                      name="facultadId"
                      className="form-select"
                      value={form.facultadId}
                      onChange={onChangeFacultad}
                    >
                      <option value="">Seleccione facultad</option>
                      {catalogos.facultades.map(f => (
                        <option key={f.id} value={f.id}>{f.nombre}</option>
                      ))}
                    </select>
                    <div className="form-text">Selecciona facultad y luego carrera.</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Carrera</label>
                    <select
                      name="carreraNombre"
                      className="form-select"
                      value={form.carreraNombre}
                      onChange={onChange}
                      disabled={!form.facultadId}
                    >
                      <option value="">Seleccione carrera</option>
                      {carreraOpts.map(c => (
                        <option key={c.id} value={c.nombre}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Nota para Coordinación */}
                {form.role === "Coordinacion" && (
                  <div className="alert alert-info mt-3">
                    Para asignar múltiples campus/facultades/carreras, usa el módulo <strong>Coberturas</strong> del usuario.
                    Aquí solo actualizas el campus/carrera “principal” del registro.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            <button className="btn-institucional-sm" onClick={guardar} disabled={!user}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modal: Coberturas (solo si Coordinación) */}
      {showCobertura && user && form.role === "Coordinacion" && (
        <ModalCoberturaCoordinacion
          visible={showCobertura}
          user={user}                // debe incluir .id (tu backend usa /usuarios/:id/coordinaciones)
          onClose={() => setShowCobertura(false)}
          onChanged={onCoberturaChanged}
        />
      )}
    </div>
  );
}
