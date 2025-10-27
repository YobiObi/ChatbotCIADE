import { Link } from "react-router-dom";
import IconoLogin from "../../images/iconoLogin.png";
import IconoRegistro from "../../images/iconoRegistro.png";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AccesoUsuario() {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario && token) {
      const rol = usuario?.role?.name;
      if (rol === "Admin") navigate("/panel-admin");
      else if (rol === "Coordinacion") navigate("/panel-coordinacion");
      else if (rol === "Alumno") navigate("/agendarcita");
    }
  }, [usuario, token, navigate]);

  return (
    <div className="container d-flex flex-column align-items-center mt-5">
      <h1 className="mb-5 text-center" style={{ color: "#003366" }}>Bienvenid@ al Portal CIADE</h1>

      <div className="d-flex flex-wrap justify-content-center gap-4">
        {/* Botón Inicio de Sesión */}
        <Link
          to="/login"
          aria-label="Ir a inicio de sesión"
          className="btn btn-light p-0 border rounded shadow text-decoration-none d-flex flex-column align-items-center justify-content-center overflow-hidden"
          style={{ width: "200px", height: "200px" }}
        >
          <div className="overflow-hidden w-100 h-100">
            <img
              src={IconoLogin}
              alt="Iniciar Sesión"
              className="w-100 h-100 object-fit-contain transform-hover"
            />
          </div>
          <div className="w-100 text-center bg-unab text-white py-1">
            Iniciar Sesión
          </div>
        </Link>

        {/* Botón Registro */}
        <Link
          to="/registro"
          aria-label="Ir a registro de usuario"
          className="btn btn-light p-0 border rounded shadow text-decoration-none d-flex flex-column align-items-center justify-content-center overflow-hidden"
          style={{ width: "200px", height: "200px" }}
        >
          <div className="overflow-hidden w-100 h-100">
            <img
              src={IconoRegistro}
              alt="Registrarse"
              className="w-100 h-100 object-fit-contain transform-hover"
            />
          </div>
          <div className="w-100 text-center bg-unab text-white py-1">
            Registrarse
          </div>
        </Link>
      </div>

      {/* Clases de utilidades Bootstrap para el zoom */}
      <style>
        {`
          .transform-hover {
            transition: transform 0.3s;
          }
          .transform-hover:hover {
            transform: scale(1.1);
          }
        `}
      </style>
    </div>
  );
}
