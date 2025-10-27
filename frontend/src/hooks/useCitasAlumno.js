// src/hooks/useCitasAlumno.js
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useCitasAlumno() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCitas([]);
        setCargando(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/alumno/citas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCitas(Array.isArray(data) ? data : data.citas || []);
      } catch (e) {
        console.error("[CitasAlumno] fetch error:", e);
      } finally {
        setCargando(false);
      }
    });
    return () => unsub();
  }, []);

  return { citas, cargando, setCitas };
}
