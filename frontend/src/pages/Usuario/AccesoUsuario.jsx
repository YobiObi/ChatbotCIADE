import { Link } from "react-router-dom";
import IconoLogin from "../../images/iconoLogin.png";
import IconoRegistro from "../../images/iconoRegistro.png";

export default function AccesoUsuario() {
  return (
    <div className="container d-flex flex-column align-items-center mt-5">
      <h1 className="mb-5 text-center text-primary">Bienvenid@ al Portal CIADE</h1>

      <div className="d-flex flex-wrap justify-content-center gap-4">
        {/* Botón Inicio de Sesión */}
        <Link
          to="/login"
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
          <div className="w-100 text-center bg-primary text-white py-1">
            Iniciar Sesión
          </div>
        </Link>

        {/* Botón Registro */}
        <Link
          to="/registro"
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
          <div className="w-100 text-center bg-success text-white py-1">
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
