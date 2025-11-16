import logo from "../../images/Logo-CIADE.png";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export default function HeaderPrivado() {
  const { user, cargando } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    sessionStorage.setItem("skipLoginAlertOnce", "1");
    try {
      await signOut(auth);
    } finally {
      navigate("/login", { replace: true });
    }
  };

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
          {/* Logo: siempre misma pestaña */}
          <div
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
            aria-label="Ir al inicio CIADE"
          >
            <img src={logo} alt="Logo UNAB" height="40" />
          </div>

          <nav className="d-flex flex-wrap gap-3 mt-3 mt-md-0 fw-semibold align-items-center">
            {/* Enlaces EXTERNOS en nueva pestaña */}
            <a
              href="https://ciade.unab.cl/quienes-somos/"
              className="nav-link-custom"
              target="_blank"
              rel="noopener noreferrer"
            >
              ¿Quiénes Somos?
            </a>
            <a
              href="https://ciade.unab.cl/programa/"
              className="nav-link-custom"
              target="_blank"
              rel="noopener noreferrer"
            >
              Programas
            </a>
            <a
              href="https://ciade.unab.cl/noticias/"
              className="nav-link-custom"
              target="_blank"
              rel="noopener noreferrer"
            >
              Noticias
            </a>

            {/* Enlaces INTERNOS con Link */}
            <Link to="/coordinaciones" className="nav-link-custom">
              Contacto
            </Link>
            {!user && (
              <Link to="/acceso-usuario" className="nav-link-custom">
                Acceso Usuarios
              </Link>
            )}
            <Link to="/faq" className="nav-link-custom">
              Preguntas Frecuentes
            </Link>

            {rol === "Alumno" && (
              <>
                <Link to="/agendarcita" className="nav-link-custom">
                  Agendar Cita
                </Link>
                <Link to="/alumno/citas" className="nav-link-custom">
                  Mis Citas
                </Link>
              </>
            )}

            {rol === "Coordinacion" && (
              <Link to="/panel-coordinacion" className="nav-link-custom">
                Panel Coordinación
              </Link>
            )}

            {rol === "Admin" && (
              <Link to="/panel-admin" className="nav-link-custom">
                Panel Administrativo
              </Link>
            )}

            {user && (
              <div className="d-flex align-items-center gap-2 flex-wrap ms-md-3">
                <div
                  className="text-start"
                  style={{ color: "#003366", maxWidth: "260px" }}
                >
                  ¡Hola {nombreCompleto}!<br />
                  <small className="text-muted d-block">
                    {infoInstitucional}
                  </small>
                </div>

                <button
                  onClick={cerrarSesion}
                  className="btn btn-outline-danger btn-sm"
                  aria-label="Cerrar sesión"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
