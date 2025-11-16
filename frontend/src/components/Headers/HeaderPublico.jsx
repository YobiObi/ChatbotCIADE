import logo from "../../images/Logo-CIADE.png";
import { Link, useNavigate } from "react-router-dom";

export default function HeaderPublico() {
  const navigate = useNavigate();

  return (
    <header className="border-bottom shadow-sm">
      <div className="bg-unab text-white py-2">
        <div className="container d-flex justify-content-end">
          <a
            href="https://www.instagram.com/ciade.unab/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm d-flex align-items-center gap-2 text-white bg-unab"
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

      <div className="bg-white">
        <div className="container d-flex justify-content-between align-items-center py-3">
          {/* Logo público */}
          <div
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
            aria-label="Ir al inicio CIADE"
          >
            <img src={logo} alt="Logo UNAB" height="40" />
          </div>

          <nav className="d-flex gap-3 fw-semibold">
            {/* EXTERNOS */}
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

            {/* INTERNOS */}
            <Link to="/coordinaciones" className="nav-link-custom">
              Contacto
            </Link>
            <Link to="/faq" className="nav-link-custom">
              Preguntas Frecuentes
            </Link>
            <Link to="/acceso-usuario" className="nav-link-custom">
              Acceso Usuarios
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
