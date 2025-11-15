// src/components/Modals/Usuarios/ModalCrearUsuario.jsx
import { useEffect, useMemo, useState } from "react";
import { auth } from "../../../firebase";

export default function ModalCrearUsuario({ visible, onClose, onUsuarioCreado }) {
  const [submitting, setSubmitting] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Catálogos base (solo sedes)
  const [sedes, setSedes] = useState([]);

  // Listas dependientes “reales” (vienen del backend público institucional)
  const [campusList, setCampusList] = useState([]);
  const [carreraList, setCarreraList] = useState([]);

  const [form, setForm] = useState({
    rut: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    sede: "",
    campus: "",
    carrera: "",
    role: "Coordinacion", // Alumno | Coordinacion | Admin
  });

  // Errores por campo (UX)
  const [errorRUT, setErrorRUT] = useState("");
  const [errorEmail, setErrorEmail] = useState("");

  // Cargar sedes (puedes venir de /api/admin/catalogos si prefieres)
  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        setLoadingCats(true);
        setErrorMsg("");

        // Si ya tienes sedes en /api/admin/catalogos, usa ese endpoint con token Admin.
        // Aquí lo hago simple: hardcode o desde un pequeño catálogo si lo tienes.
        setSedes(["Santiago", "Viña del Mar", "Concepción"]);
      } catch (e) {
        setErrorMsg("No se pudieron cargar las sedes.");
        console.error(e);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, [visible]);

  // Cargar campus al elegir sede
  useEffect(() => {
    if (!form.sede) return;
    setForm((prev) => ({ ...prev, campus: "", carrera: "" }));
    setCarreraList([]);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/institucional/campus?sede=${encodeURIComponent(form.sede)}`)
      .then((r) => r.json())
      .then((data) => setCampusList(data || []))
      .catch(() => setCampusList([]));
  }, [form.sede]);

  // Cargar carreras al elegir campus
  useEffect(() => {
    if (!form.campus) return;
    setForm((prev) => ({ ...prev, carrera: "" }));
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/institucional/carreras?campus=${encodeURIComponent(form.campus)}`)
      .then((r) => r.json())
      .then((data) => setCarreraList(data || []))
      .catch(() => setCarreraList([]));
  }, [form.campus]);

  // Facultad derivada desde la carrera (la respuesta de /carreras ya trae facultad)
  const facultadDerivada = useMemo(() => {
    const c = carreraList.find((x) => x.nombre === form.carrera);
    return c?.facultad || "";
  }, [carreraList, form.carrera]);

  // Validaciones front
  const validarRUT = (rutCompleto) => {
    const rut = rutCompleto.replace(/\./g, "").replace("-", "");
    if (!/^\d{7,8}[0-9kK]$/.test(rut)) return false;
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toLowerCase();
    let suma = 0,
      multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "k" : String(dvEsperado);
    return dv === dvCalculado;
  };

  const formatearRUT = (rut) => {
    const limpio = rut.replace(/\./g, "").replace(/-/g, "");
    if (limpio.length < 2) return rut;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    let conPuntos = "";
    let i = 0;
    for (let j = cuerpo.length - 1; j >= 0; j--) {
      conPuntos = cuerpo[j] + conPuntos;
      i++;
      if (i === 3 && j !== 0) {
        conPuntos = "." + conPuntos;
        i = 0;
      }
    }
    return `${conPuntos}-${dv}`;
  };

  const onChange = (e) => {
    setErrorMsg("");
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setErrorEmail(ok ? "" : "Correo inválido");
    }
    if (name === "rut") {
      setErrorRUT(validarRUT(value) ? "" : "RUT inválido");
    }
  };

  const onBlurRUT = () => {
    if (!form.rut) return;
    setForm((p) => ({ ...p, rut: formatearRUT(p.rut) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validaciones
    if (errorRUT || errorEmail) return;
    if (!form.rut || !validarRUT(form.rut)) {
      setErrorMsg("RUT inválido. Ejemplo: 12.345.678-5");
      return;
    }
    if (!form.sede || !form.campus || !form.carrera) {
      setErrorMsg("Selecciona Sede, Campus y Carrera (según oferta real).");
      return;
    }

    setSubmitting(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const payload = {
        rut: form.rut.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        sede: form.sede,              // nombre
        campus: form.campus,          // nombre
        carrera: form.carrera,        // nombre
        facultad: facultadDerivada,   // solo informativo
        role: form.role,              // Alumno | Coordinacion | Admin
      };

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        // mapping de errores amables
        const msg = (data?.error || "").toLowerCase();

        if (res.status === 409 || msg.includes("already exists") || msg.includes("correo")) {
          setErrorMsg("El correo ya está registrado.");
        } else if (msg.includes("p2002") || msg.includes("rut") || msg.includes("unique")) {
          setErrorMsg("El RUT ya está registrado.");
        } else if (msg.includes("institucionales inválidos") || msg.includes("campus") && msg.includes("carrera")) {
          setErrorMsg("Campus o Carrera inválidos (o no se imparte en ese campus).");
        } else if (msg.includes("auth/")) {
          // Errores de Firebase
          if (msg.includes("email-already-exists")) setErrorMsg("El correo ya está registrado en la plataforma.");
          else setErrorMsg("Error al crear usuario en la plataforma.");
        } else {
          setErrorMsg(data?.error || "Error al crear usuario.");
        }
        return;
      }

      onUsuarioCreado?.(data);
      onClose?.();
    } catch (err) {
      console.error(err);
      setErrorMsg("Error interno al crear usuario.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-unab text-white">
              <h5 className="modal-title">Crear Usuario</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

              <div className="row g-3">
                {/* RUT */}
                <div className="col-md-4">
                  <label className="form-label">RUT</label>
                  <input
                    name="rut"
                    placeholder="Ej: 12.345.678-5"
                    className={`form-control ${errorRUT ? "is-invalid" : ""}`}
                    value={form.rut}
                    onChange={onChange}
                    onBlur={onBlurRUT}
                    required
                  />
                  {errorRUT ? (
                    <div className="invalid-feedback">Formato inválido. Ej: 12.345.678-5</div>
                  ) : (
                    <div className="form-text">Ej: 12.345.678-5</div>
                  )}
                </div>

                {/* Nombre / Apellido */}
                <div className="col-md-4">
                  <label className="form-label">Nombre</label>
                  <input name="firstName" className="form-control" value={form.firstName} onChange={onChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Apellido</label>
                  <input name="lastName" className="form-control" value={form.lastName} onChange={onChange} required />
                </div>

                {/* Email / Password */}
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="nombre.apellido@uandresbello.edu"
                    className={`form-control ${errorEmail ? "is-invalid" : ""}`}
                    value={form.email}
                    onChange={onChange}
                    required
                  />
                  {errorEmail && <div className="invalid-feedback">{errorEmail}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contraseña temporal</label>
                  <input type="password" name="password" className="form-control" value={form.password} onChange={onChange} required />
                </div>

                {/* Rol */}
                <div className="col-md-6">
                  <label className="form-label">Rol</label>
                  <select name="role" className="form-select" value={form.role} onChange={onChange} required>
                    <option value="Coordinacion">Coordinación</option>
                    <option value="Admin">Admin</option>
                    <option value="Alumno">Alumno</option>
                  </select>
                </div>

                {/* Sede */}
                <div className="col-md-6">
                  <label className="form-label">Sede</label>
                  <select
                    name="sede"
                    className="form-select"
                    value={form.sede}
                    onChange={onChange}
                    required
                    disabled={loadingCats}
                  >
                    <option value="">Selecciona sede</option>
                    {sedes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campus (por sede) */}
                <div className="col-md-6">
                  <label className="form-label">Campus</label>
                  <select
                    name="campus"
                    className="form-select"
                    value={form.campus}
                    onChange={onChange}
                    required
                    disabled={!form.sede}
                  >
                    <option value="">Selecciona campus</option>
                    {campusList.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Carrera (por campus) */}
                <div className="col-md-6">
                  <label className="form-label">Carrera</label>
                  <select
                    name="carrera"
                    className="form-select"
                    value={form.carrera}
                    onChange={onChange}
                    required
                    disabled={!form.campus}
                  >
                    <option value="">Selecciona carrera</option>
                    {carreraList.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Facultad derivada */}
                {form.carrera && (
                  <div className="col-12">
                    <label className="form-label">Facultad (derivada por carrera)</label>
                    <input className="form-control" value={facultadDerivada || "—"} disabled />
                  </div>
                )}

                {/* Nota para Coordinación */}
                {form.role === "Coordinacion" && (
                  <div className="col-12">
                    <div className="alert alert-info mb-0">
                      Esta selección define la <strong>asignación principal</strong>. Luego podrás añadir más desde{" "}
                      <strong>Coberturas</strong>.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn-institucional-outline-sm" disabled={submitting || loadingCats}>
                {submitting ? "Creando..." : "Crear"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
