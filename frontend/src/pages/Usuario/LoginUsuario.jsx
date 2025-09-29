// src/pages/Usuario/LoginUsuario.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Banner from "../../components/BannerTitulo";
import { useAuth } from "../../context/AuthContext";

export default function LoginUsuario() {
  const [formData, setFormData] = useState({
    correo: "",
    contraseña: "",
  });

  const [errorCorreo, setErrorCorreo] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "correo") {
      const regex = /^[a-z]+\.[a-z]+@ksan\.edu$/i;
      setErrorCorreo(
        regex.test(value) ? "" : "Formato inválido: nombre.apellido@ksan.edu"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errorCorreo) return;

    try {
      const userCredential = await login(formData.correo, formData.contraseña);
      console.log("Usuario autenticado:", userCredential.user);
      navigate("/"); // redirige al inicio
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Credenciales inválidas o usuario no registrado");
    }
  };

  return (
    <>
      <Banner title="Iniciar Sesión" />
      <div className="container my-5" style={{ maxWidth: "500px" }}>
        <form
          onSubmit={handleSubmit}
          className="shadow p-4 rounded bg-light fw-semibold"
          style={{ color: "#003366" }}
        >
          <h2 className="mb-4 text-center">Inicio de Sesión</h2>

          {/* Correo */}
          <div className="mb-3">
            <label className="form-label">Correo Institucional</label>
            <input
              type="email"
              name="correo"
              placeholder="nombre.apellido@ksan.edu"
              className={`form-control ${errorCorreo ? "is-invalid" : ""}`}
              value={formData.correo}
              onChange={handleChange}
              required
            />
            {errorCorreo && (
              <div className="invalid-feedback">{errorCorreo}</div>
            )}
          </div>

          {/* Contraseña */}
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="contraseña"
              className="form-control"
              value={formData.contraseña}
              onChange={handleChange}
              required
            />
          </div>

          {/* Botón */}
          <div className="text-center">
            <button type="submit" className="btn btn-primary">
              Ingresar
            </button>
          </div>

          <div className="mt-3 text-center">
            <span>¿Aún no estás registrad@? </span>
            <Link
              to="/registro"
              className="text-primary text-decoration-underline"
            >
              Registrate
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
