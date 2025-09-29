import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function BloquearSiAutenticado({ children }) {
  const [logueado, setLogueado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [segundosRestantes, setSegundosRestantes] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLogueado(!!user);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (logueado) {
      const countdown = setInterval(() => {
        setSegundosRestantes((prev) => prev - 1);
      }, 1000);

      const redireccion = setTimeout(() => {
        navigate("/");
      }, 5000);

      return () => {
        clearInterval(countdown);
        clearTimeout(redireccion);
      };
    }
  }, [logueado, navigate]);

  if (cargando) return null;

  const rutasBloqueadas = ["/login", "/registro", "/acceso-usuario"];
  const debeBloquear = rutasBloqueadas.includes(location.pathname);

  if (logueado && debeBloquear) {
    return (
      <div className="container my-5 text-center">
        <h4 className="text-danger">Ya tienes una sesión activa</h4>
        <p>Serás redirigid@ a la página principal en <strong>{segundosRestantes}</strong> segundos...</p>
        <button
          className="btn btn-outline-primary mt-3"
          onClick={() => navigate("/")}
        >
          Volver
        </button>
      </div>
    );
  }

  return children;
}
