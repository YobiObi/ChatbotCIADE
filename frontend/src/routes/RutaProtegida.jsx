// src/routes/RutaProtegida.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { redirectByRole } from "../utils/redirectByRole";

export default function RutaProtegida({ children, rolPermitido }) {
  const { user, cargando } = useAuth();
  const navigate = useNavigate();

  if (cargando) {
    return (
      <div className="container my-5 text-center">
        <p>Cargando sesión, por favor espera...</p>
      </div>
    );
  }

  if (!user || !user.role?.name) {
    return (
      <div className="container my-5 text-center">
        <p>Verificando tu rol institucional...</p>
      </div>
    );
  }

  const rolUser = user.role.name;
  const accesoPermitido = Array.isArray(rolPermitido)
    ? rolPermitido.includes(rolUser)
    : rolUser === rolPermitido;

  if (!accesoPermitido) {
    return (
      <div className="container my-5 text-center">
        <h4 className="text-danger">Acceso denegado</h4>
        <p>
          Tu rol actual es <strong>{rolUser}</strong>, y esta sección está reservada para{" "}
          <strong>{Array.isArray(rolPermitido) ? rolPermitido.join(", ") : rolPermitido}</strong>.
        </p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => redirectByRole(rolUser, navigate)}
        >
          Ir a mi panel
        </button>
      </div>
    );
  }

  return children;
}
