// src/routes/RutaProtegida.jsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { redirectByRole } from "../utils/redirectByRole";

const ROLE_WAIT_MS = 6000; // tiempo máximo esperando rol antes de redirigir

export default function RutaProtegida({ children, rolPermitido }) {
  const { user, cargando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [esperandoRol, setEsperandoRol] = useState(true);
  const timeoutRef = useRef(null);
  const alertedRef = useRef(false); // evita alertar dos veces en dev/StrictMode

  // Redirección si no hay sesión + manejo de espera de rol
  useEffect(() => {
    // Limpia cualquier timeout previo al re-evaluar
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (cargando) return;

    // 1) Sin sesión -> (posible) mensaje + redirect a login con ?next=...
    if (!user) {
      const skip = sessionStorage.getItem("skipLoginAlertOnce");

      if (!skip && !alertedRef.current) {
        alert("Acceso restringido, primero debes iniciar sesión");
        alertedRef.current = true;
      }

      // consumir la bandera (solo vale una vez)
      sessionStorage.removeItem("skipLoginAlertOnce");

      // si venimos de un logout explícito → login limpio
      if (skip) {
        navigate("/login", { replace: true });
        return; // salimos del efecto
      }

      // si NO venimos de un logout → redirigir con ?next=...
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`, { replace: true });
      return;
    }

    // 2) Con sesión: si ya hay rol, listo
    if (user.role?.name) {
      setEsperandoRol(false);
      alertedRef.current = false; // reset por si luego falta sesión otra vez
      return;
    }

    // 3) Con sesión, pero sin rol aún -> espera unos segundos y si no llega, redirige
    setEsperandoRol(true);
    timeoutRef.current = setTimeout(() => {
      setEsperandoRol(false);
      if (!alertedRef.current) {
        alert("No pudimos verificar tu rol institucional. Vuelve a iniciar sesión.");
        alertedRef.current = true;
      }
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`, { replace: true });
    }, ROLE_WAIT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [cargando, user, navigate, location]);

  // Estado de carga inicial (auth todavía resolviéndose)
  if (cargando) {
    return (
      <div className="container my-5 text-center">
        <p>Cargando sesión, por favor espera...</p>
      </div>
    );
  }

  // Si no hay user aquí, ya se disparó la redirección
  if (!user) return null;

  // Si aún esperamos el rol, muestra un loader breve (pero con timeout anti-bucle)
  if (esperandoRol && !user.role?.name) {
    return (
      <div className="container my-5 text-center">
        <p>Verificando tu rol institucional...</p>
      </div>
    );
  }

  // Si llegamos aquí sin rol, el timeout debió redirigir. Evita pintar nada.
  if (!user.role?.name) return null;

  // Autorización por rol (tu lógica original)
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
