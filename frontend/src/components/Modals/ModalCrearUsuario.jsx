import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import carrerasData from "../../utils/carrerasData";
import facultadesPorCampus from "../../utils/facultadesData";

export default function ModalCrearUsuario({ visible, onClose, onUsuarioCreado }) {
  const [form, setForm] = useState({
    rut: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    campus: "",
    carrera: "",
    facultad: "",
    sede: "",
    role: "COORDINACION",
  });

  const campusPorSede = {
    Santiago: ["Antonio Varas", "Los Leones", "Bellavista", "República", "Creativo", "Casona"],
    "Viña del Mar": ["Viña del Mar"],
    Concepción: ["Concepción"]
  };

  const campusFiltrados = campusPorSede[form.sede] || [];

  const carrerasFiltradas = carrerasData.filter(c =>
    c.sede.includes(form.sede) &&
    c.campus.includes(form.campus)
  );

  const facultadesFiltradas = facultadesPorCampus[form.campus] || [];

  const facultadSeleccionada = carrerasData.find(c => c.carrera === form.carrera)?.facultad || "";

  useEffect(() => {
    if (form.role === "ALUMNO") {
      setForm(prev => ({
        ...prev,
        facultad: facultadSeleccionada
      }));
    } else if (form.role === "COORDINACION") {
      setForm(prev => ({
        ...prev,
        carrera: "Coordinación CIADE"
      }));
      } else if (form.role === "ADMIN") {
    setForm(prev => ({
      ...prev,
      carrera: "Administrador", // puedes dejarlo vacío o asignar una genérica si lo deseas
    }));
    }
  }, [facultadSeleccionada, form.carrera, form.role]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        onUsuarioCreado(data);
        onClose();
      } else {
        alert(data.error || "Error al crear usuario");
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error interno al crear usuario");
    }
  };

  if (!visible) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Crear Usuario</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                {/* Datos básicos */}
                <div className="col-md-4">
                  <input name="rut" placeholder="RUT" className="form-control" value={form.rut} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <input name="firstName" placeholder="Nombre" className="form-control" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <input name="lastName" placeholder="Apellido" className="form-control" value={form.lastName} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <input name="email" type="email" placeholder="Email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <input type="password" name="password" placeholder="Contraseña temporal" value={form.password} onChange={handleChange} className="form-control" required />
                </div>

                {/* Rol */}
                <div className="col-md-6">
                  <select name="role" className="form-select" value={form.role} onChange={handleChange} required>
                    <option value="COORDINACION">COORDINACION</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="ALUMNO">ALUMNO</option>
                  </select>
                </div>

                {/* Sede */}
                <div className="col-md-6">
                  <select name="sede" className="form-select" value={form.sede} onChange={handleChange} required>
                    <option value="">Selecciona sede</option>
                    {Object.keys(campusPorSede).map(sede => (
                      <option key={sede} value={sede}>{sede}</option>
                    ))}
                  </select>
                </div>

                {/* Campus */}
                <div className="col-md-6">
                  <select name="campus" className="form-select" value={form.campus} onChange={handleChange} required disabled={!form.sede}>
                    <option value="">Selecciona campus</option>
                    {campusFiltrados.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Carrera */}
                <div className="col-md-6">
                  {form.role === "ALUMNO" ? (
                    <select name="carrera" className="form-select" value={form.carrera} onChange={handleChange} required disabled={!form.campus}>
                      <option value="">Selecciona carrera</option>
                      {carrerasFiltradas.map(c => (
                        <option key={c.carrera} value={c.carrera}>{c.carrera}</option>
                      ))}
                    </select>
                  ) : (
                    <input name="carrera" className="form-control" value={form.carrera} disabled />
                  )}
                </div>

                {/* Facultad */}
                <div className="col-md-6">
                  {form.role === "ALUMNO" ? (
                    <input name="facultad" className="form-control" value={facultadSeleccionada} disabled />
                  ) : (
                    <select name="facultad" className="form-select" value={form.facultad} onChange={handleChange} required disabled={!form.campus}>
                      <option value="">Selecciona facultad</option>
                      {facultadesFiltradas.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">Crear</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
