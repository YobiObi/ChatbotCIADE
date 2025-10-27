import Banner from "../../components/BannerTitulo";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import * as authService from "../../services/auth.service.js";

export default function AgendarCita() {
  const { token, cargando } = useAuth();
  
  const [formData, setFormData] = useState({
    correo: "",
    modalidad: "",
    descripcion: ""
  });

  const [campusUsuario, setCampusUsuario] = useState("");
  const [carreraUsuario, setCarreraUsuario] = useState("");
  const [coordinadorCIADE, setCoordinadorCIADE] = useState(null);

  useEffect(() => {
  if (!token) return;

  const fetchUsuario = async () => {
    try {
      const data = await authService.getUsuarioInfo(token);
      setFormData((prev) => ({ ...prev, correo: data.email }));
      setCampusUsuario(data.campus?.nombre || "");
      setCarreraUsuario(data.carrera?.nombre || "");
      console.log("Datos del usuario:", data);

    } catch (error) {
      console.error("Error al conectar con backend:", error);
    }
  };

  fetchUsuario();
}, [token]);

useEffect(() => {
  if (!token) return;

  const fetchCoordinador = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/coordinador-asignado`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setCoordinadorCIADE(data.coordinador);
      } else {
        console.warn("No hay coordinador asignado:", data.error);
        setCoordinadorCIADE(null);
      }
    } catch (error) {
      console.error("Error al obtener coordinador CIADE:", error);
      setCoordinadorCIADE(null);
    }
  };

  fetchCoordinador();
}, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "descripcion" && value.length > 500) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !coordinadorCIADE) {
      alert("No se puede agendar la cita: falta coordinación CIADE.");
      return;
    }

    if (!formData.modalidad || !formData.descripcion.trim()) {
      alert("Por favor completa todos los campos antes de enviar.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/crear-cita`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coordinadorId: coordinadorCIADE.id,
          modalidad: formData.modalidad,
          descripcion: formData.descripcion,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Cita solicitada con éxito. La coordinación CIADE (${coordinadorCIADE.firstName} ${coordinadorCIADE.lastName}) se contactará contigo por correo en los próximos días.`);
        setFormData({ ...formData, modalidad: "", descripcion: "" });
      } else {
        console.error("Respuesta del backend:", data);
        alert(data.error || "Error al enviar la solicitud.");
      }
    } catch (error) {
      console.error("Error al enviar cita:", error);
      alert("Hubo un problema al registrar la cita.");
    }
  };

  if (cargando)
    return <div className="p-5 text-center">Cargando agendamiento...</div>;

  return (
    <>
      <Banner title="Agendar Cita" />
      <div className="container my-5" style={{ maxWidth: "600px" }}>
        <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light fw-semibold">
          {/* Correo */}
          <div className="mb-3">
            <label className="form-label">Correo Institucional</label>
            <input
              type="email"
              name="correo"
              className="form-control"
              value={formData.correo}
              readOnly
              required
            />
          </div>

          {/* Coordinador CIADE */}
          <div className="mb-3">
            <label className="form-label">Coordinación CIADE</label>
            {coordinadorCIADE && (
              <div className="alert alert-info mt-2">
                Coordinador asignado: <strong>{coordinadorCIADE.firstName} {coordinadorCIADE.lastName}</strong><br />
              </div>
            )}

            {!coordinadorCIADE && campusUsuario && carreraUsuario && (
              <div className="alert alert-warning mt-2">
                No hay coordinadores asignados para la carrera <strong>{carreraUsuario}</strong> en el campus <strong>{campusUsuario}</strong>.
              </div>
            )}
          </div>

          {/* Modalidad */}
          <div className="mb-3">
            <label className="form-label">Modalidad</label>
            <select
              name="modalidad"
              className="form-select"
              value={formData.modalidad}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona modalidad</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="mb-3">
            <label className="form-label">Descripción (máx. 500 caracteres)</label>
            <textarea
              name="descripcion"
              className="form-control"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              maxLength={500}
              required
            />
            <small className="text-muted">{formData.descripcion.length}/500</small>
          </div>

          <div className="text-center">
            <button type="submit" className="btn-institucional">Solicitar Cita</button>
          </div>
        </form>
      </div>
    </>
  );
}
