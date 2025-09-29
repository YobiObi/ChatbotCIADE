import logo from "../images/Logo-CIADE.png";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, rol, cargando } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (cargando) return null; // o un loader si prefieres

  const nombreCompleto = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <header className="border-bottom shadow-sm">
      <div className="bg-unab text-white py-2">
        <div className="container d-flex justify-content-end">
          <a href="https://www.instagram.com/ciade.unab/" target="_blank" rel="noopener noreferrer" className="btn btn-sm d-flex align-items-center gap-2 text-white bg-unab">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="18" height="18" />
            Síguenos en Instagram
          </a>
        </div>
      </div>

      <div className="bg-white">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center py-3">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="Logo UNAB" height="40" />
          </a>

          <nav className="d-flex flex-wrap gap-3 mt-3 mt-md-0 fw-semibold align-items-center">
            <a href="https://ciade.unab.cl/quienes-somos/" className="nav-link-custom">¿Quiénes Somos?</a>
            <a href="https://ciade.unab.cl/programa/" className="nav-link-custom">Programas</a>
            <a href="https://ciade.unab.cl/noticias/" className="nav-link-custom">Noticias</a>
            <a href="https://ciade.unab.cl/contacto/" className="nav-link-custom">Contacto</a>
            {!user && <a href="/acceso-usuario" className="nav-link-custom">Acceso Usuarios</a>}
            <a href="/faq" className="nav-link-custom">Preguntas Frecuentes</a>
            {rol === "ALUMNO" && (
              <>
                <a href="/agendarcita" className="nav-link-custom">Agendar Cita</a>
                <a href="/alumno/citas" className="nav-link-custom">Mis Citas</a>
              </>
            )}
            {rol === "COORDINACION" && <a href="/panel-coordinacion" className="nav-link-custom">Panel Coordinación</a>}
            {rol === "ADMIN" && <a href="/panel-admin" className="nav-link-custom">Panel Administrativo</a>}

            {user && (
              <>
                <span className="me-2" style={{ color: "#003366" }}>
                  ¡Hola {nombreCompleto}!
                </span>
                <button onClick={cerrarSesion} className="btn btn-outline-danger btn-sm">
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
