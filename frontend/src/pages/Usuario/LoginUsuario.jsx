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
  const [errorLogin, setErrorLogin] = useState("");
  const [infoLogin, setInfoLogin] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const getFriendlyLoginMessage = (error) => {
    const code = error?.code || "";

    if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
      return "Correo o contraseña incorrectos.";
    }
    if (code === "auth/user-not-found") {
      return "No existe una cuenta con ese correo institucional.";
    }
    if (code === "auth/invalid-email") {
      return "El correo ingresado no es válido. Revisa el formato nombre.apellido@uandresbello.edu o nombre.apellido@unab.cl.";
    }
    if (code === "auth/too-many-requests") {
      return "Demasiados intentos fallidos. Intenta nuevamente en unos minutos o restablece tu contraseña.";
    }
    if (code === "auth/user-disabled") {
      return "Tu cuenta se encuentra deshabilitada. Contacta a soporte institucional.";
    }
    if (code === "auth/network-request-failed") {
      return "No se pudo conectar. Revisa tu conexión a internet e inténtalo nuevamente.";
    }
    return error?.message || "No pudimos iniciar sesión. Inténtalo nuevamente.";
  };

const handleChange = (e) => {
  const { name, value } = e.target;
  const nextValue = name === "correo" ? value.trim() : value;
  setFormData({ ...formData, [name]: nextValue });

    if (name === "correo") {
      const correo = nextValue.toLowerCase();

      const esDominioValido =
        correo.endsWith("@uandresbello.edu") ||
        correo.endsWith("@unab.cl") ||
        correo.endsWith("@gmail.com");

      setErrorCorreo(
        esDominioValido
          ? ""
          : "Formato inválido: usa un correo @uandresbello.edu o @unab.cl"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errorCorreo || !formData.correo || !formData.contraseña) {
      setErrorLogin("Completa todos los campos correctamente.");
      return;
    }

    setErrorLogin("");
    setInfoLogin("");
    setCargando(true);

    try {
      const userCredential = await login(formData.correo, formData.contraseña);
      const token = await userCredential.user.getIdToken();

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        const rol = data.role?.name;
        if (rol === "Admin") navigate("/panel-admin");
        else if (rol === "Coordinacion") navigate("/panel-coordinacion");
        else if (rol === "Alumno") navigate("/agendarcita");
        else navigate("/");
      } else {
        setErrorLogin(
          "No se pudo obtener tu perfil institucional. Intenta nuevamente."
        );
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      if (error?.code?.startsWith?.("auth/")) {
        setErrorLogin(getFriendlyLoginMessage(error));
      } else {
        setErrorLogin(
          "No pudimos iniciar sesión en este momento. Intenta nuevamente."
        );
      }
      setFormData((prev) => ({ ...prev, contraseña: "" }));
    } finally {
      setCargando(false);
    }
  };

  // 👇 ahora solo redirige a la página de reset
  const handleGoToReset = () => {
    navigate("/restablecer");
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
          <h2 className="mb-3 text-center">Inicio de Sesión</h2>

          {/* Mensajes globales */}
          {errorLogin && <div className="alert alert-danger">{errorLogin}</div>}
          {infoLogin && <div className="alert alert-success">{infoLogin}</div>}

          {/* Correo */}
          <div className="mb-3">
            <label className="form-label">Correo Institucional</label>
            <input
              type="email"
              name="correo"
              className={`form-control ${errorCorreo ? "is-invalid" : ""}`}
              value={formData.correo}
              onChange={handleChange}
              required
            />
            {errorCorreo && (
              <div className="invalid-feedback">{errorCorreo}</div>
            )}
          </div>

          {/* Contraseña con ícono Bootstrap */}
          <div className="mb-2 position-relative">
            <label className="form-label">Contraseña</label>
            <div className="input-group">
              <input
                type={mostrarPass ? "text" : "password"}
                name="contraseña"
                className="form-control"
                value={formData.contraseña}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setMostrarPass(!mostrarPass)}
                tabIndex={-1}
                title={mostrarPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i
                  className={`bi ${
                    mostrarPass ? "bi-eye-slash" : "bi-eye"
                  }`}
                ></i>
              </button>
            </div>
          </div>

          {/* Link a recuperar */}
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={handleGoToReset}
              style={{ color: "#003366" }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón */}
          <div className="text-center">
            <button
              type="submit"
              className="btn-institucional"
              disabled={cargando}
            >
              {cargando ? "Validando..." : "Ingresar"}
            </button>
          </div>

          <div className="mt-3 text-center">
            <span>¿Aún no estás registrad@? </span>
            <Link
              to="/registro"
              className="text-primary text-decoration-underline"
            >
              Regístrate
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
