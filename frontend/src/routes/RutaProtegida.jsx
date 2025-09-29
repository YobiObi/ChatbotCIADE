// src/routes/RutaProtegida.jsx
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ children, rolPermitido }) {
  const { user, rol, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="container my-5 text-center">
        <p>Cargando, por favor espera...</p>
      </div>
    );
  }

  if (!user || rol !== rolPermitido) {
    return (
      <div className="container my-5 text-center">
        <h4 className="text-danger">Acceso denegado</h4>
        <p>
          Tu rol actual es <strong>{rol || "desconocido"}</strong>, y esta sección
          está reservada para <strong>{rolPermitido}</strong>.
        </p>
        <p>Si crees que esto es un error, por favor contacta a CIADE.</p>
      </div>
    );
  }

  return children;
}
