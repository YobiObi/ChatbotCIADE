// src/routes/BloquearSiAutenticado.jsx
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getPathByRole } from "../utils/redirectByRole";

export default function BloquearSiAutenticado({ children }) {
  const { user, cargando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Rutas donde NO tiene sentido estar si ya hay sesión
  const rutasBloqueadas = ["/login", "/registro", "/acceso-usuario"];
  const debeBloquear = rutasBloqueadas.includes(location.pathname);

  useEffect(() => {
    if (!cargando && user && debeBloquear) {
      const destino = getPathByRole(user.role?.name);
      if (destino && location.pathname !== destino) {
        navigate(destino, { replace: true }); // redirección inmediata
      }
    }
  }, [user, cargando, debeBloquear, location.pathname, navigate]);

  if (cargando) {
    return (
      <div className="container my-5 text-center">
        <p>Cargando sesión, por favor espera...</p>
      </div>
    );
  }

  // Si hay usuario y está en /login o /registro, no mostramos nada: lo estamos redirigiendo
  if (user && debeBloquear) {
    return null;
  }

  return children;
}
