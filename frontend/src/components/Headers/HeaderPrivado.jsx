import logo from "../../images/Logo-CIADE.png";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export default function HeaderPrivado() {
  const { user, cargando } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate("/login");
  };

  console.log("Renderizando Header:", { cargando, user });

  if (cargando || !user?.role?.name) return null;

  const nombreCompleto = `${user.firstName} ${user.lastName}`;
  const rol = user?.role?.name;
  const carrera = user.carrera?.nombre || "—";
  const campus = user.campus?.nombre || "—";

  let infoInstitucional = "";

  if (rol === "Alumno") {
    infoInstitucional = `${carrera} — ${campus}`;
  } else if (rol === "Coordinacion") {
    infoInstitucional = "Equipo CIADE";
  } else if (rol === "Admin") {
    infoInstitucional = "Administración";
  }

  return (
    <header className="border-bottom shadow-sm">
      {/* Franja superior institucional */}
      <div className="bg-unab text-white py-2">
        <div className="container d-flex justify-content-end">
          <a
            href="https://www.instagram.com/ciade.unab/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm d-flex align-items-center gap-2 text-white bg-unab"
            aria-label="Ir al Instagram de CIADE"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
              alt="Instagram"
              width="18"
              height="18"
            />
            Síguenos en Instagram
          </a>
        </div>
      </div>

      {/* Logo y navegación */}
      <div className="bg-white">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center py-3">
          <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Ir al sitio institucional">
            <img src={logo} alt="Logo UNAB" height="40" />
          </a>

          <nav className="d-flex flex-wrap gap-3 mt-3 mt-md-0 fw-semibold align-items-center">
            <a href="https://ciade.unab.cl/quienes-somos/" className="nav-link-custom">¿Quiénes Somos?</a>
            <a href="https://ciade.unab.cl/programa/" className="nav-link-custom">Programas</a>
            <a href="https://ciade.unab.cl/noticias/" className="nav-link-custom">Noticias</a>
            <a href="/coordinaciones" className="nav-link-custom">Contacto</a>
            {!user && <a href="/acceso-usuario" className="nav-link-custom">Acceso Usuarios</a>}
            <a href="/faq" className="nav-link-custom">Preguntas Frecuentes</a>

            {rol === "Alumno" && (
              <>
                <a href="/agendarcita" className="nav-link-custom">Agendar Cita</a>
                <a href="/alumno/citas" className="nav-link-custom">Mis Citas</a>
              </>
            )}
            {rol === "Coordinacion" && (
              <a href="/panel-coordinacion" className="nav-link-custom">Panel Coordinación</a>
            )}
            {rol === "Admin" && (
              <a href="/panel-admin" className="nav-link-custom">Panel Administrativo</a>
            )}

            {user && (
              <>
                <span className="me-2 text-start" style={{ color: "#003366" }}>
                  ¡Hola {nombreCompleto}!<br />
                  <small className="text-muted">{infoInstitucional}</small>
                </span>
                <button
                  onClick={cerrarSesion}
                  className="btn btn-outline-danger btn-sm"
                  aria-label="Cerrar sesión"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
