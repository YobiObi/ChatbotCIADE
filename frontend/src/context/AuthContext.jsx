// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import * as authService from "../services/auth.service.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cargandoFirebase, setCargandoFirebase] = useState(true);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);

  // Flag para “pausar” onAuthStateChanged durante el flujo de registro
  const isRegisteringRef = useRef(false);

  // Helper para detectar 404 “Usuario no registrado” sin romper si no viene status
  const isNotRegisteredError = (err) => {
    const msg = (err?.message || "").toLowerCase();
    return err?.status === 404 || msg.includes("no registrado") || msg.includes("404");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCargandoFirebase(true);
      setCargandoUsuario(true);

      if (firebaseUser) {
        try {
          // Si estamos en pleno registro, no dispares /auth/me aquí.
          if (isRegisteringRef.current) {
            setCargandoFirebase(false);
            setCargandoUsuario(false);
            return;
          }

          const token = await firebaseUser.getIdToken();

          // Retry suave si backend aún no tiene el registro (404)
          let data = null;
          let intentos = 0;
          const MAX_INTENTOS = 5;
          const WAIT_MS = 500;

          while (intentos < MAX_INTENTOS && !data) {
            try {
              data = await authService.getUsuarioInfo(token);
            } catch (err) {
              if (!isNotRegisteredError(err)) throw err; // si no es 404, aborta retry
              intentos++;
              await new Promise((r) => setTimeout(r, WAIT_MS));
            }
          }

          if (!data) throw new Error("Usuario no registrado");

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            token,
            ...data,
          });
        } catch (error) {
          console.error("Error al validar usuario:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setCargandoFirebase(false);
      setCargandoUsuario(false);
    });

    return () => unsubscribe();
  }, []);

  // Renovación periódica del token + refresco de /auth/me
  useEffect(() => {
    const renovarToken = async () => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      try {
        const nuevoToken = await firebaseUser.getIdToken(true); // fuerza refresh
        const data = await authService.getUsuarioInfo(nuevoToken);
        setUser((prev) => ({
          ...prev,
          token: nuevoToken,
          ...data,
        }));
      } catch (error) {
        console.warn("⚠️ Token expirado o inválido. Se requiere nueva autenticación.", error);
        alert(
          "Tu sesión ha expirado por seguridad institucional. Por favor, vuelve a iniciar sesión para continuar."
        );
        setUser(null);
      }
    };

    const intervalo = setInterval(renovarToken, 50 * 60 * 1000); // cada 50 minutos
    return () => clearInterval(intervalo);
  }, []);

  // 🔑 Login con Firebase
  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  // 🔑 Registro institucional (con sincronización robusta)
  const register = async ({
    correo,
    contraseña,
    firstName,
    lastName,
    rut,
    sede,
    campus,
    carrera,
    facultad,
    role,
  }) => {
    isRegisteringRef.current = true;
    try {
      // 1) Crear cuenta en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, correo, contraseña);
      const firebaseUser = userCredential.user;

      // 2) Asegurar token fresco
      let token = await firebaseUser.getIdToken(true);

      // 3) Registrar en el backend (Prisma) con los datos institucionales
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: firebaseUser.uid, // no es estrictamente necesario si backend lo saca del token
          email: correo,
          firstName,
          lastName,
          rut,
          role,
          sede,
          campus,
          carrera,
          facultad,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al registrar usuario en backend");
      }

      // 4) Sincronización con /auth/me (retry mientras el registro “aparece”)
      const MAX_INTENTOS = 5;
      const WAIT_MS = 500;
      let usuarioSincronizado = null;

      for (let i = 0; i < MAX_INTENTOS && !usuarioSincronizado; i++) {
        await new Promise((r) => setTimeout(r, WAIT_MS));
        try {
          token = await firebaseUser.getIdToken(true);
          usuarioSincronizado = await authService.getUsuarioInfo(token);
        } catch (err) {
          if (!isNotRegisteredError(err)) throw err; // error real → abortar
        }
      }

      if (!usuarioSincronizado) {
        throw new Error("No se pudo sincronizar el usuario con la base de datos.");
      }

      // 5) Opcional: setear el user aquí para evitar salto de pantalla
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        token,
        ...usuarioSincronizado,
      });

      return usuarioSincronizado;
    } catch (err) {
      console.error("Error en register:", err);
      throw err;
    } finally {
      isRegisteringRef.current = false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        cargando: cargandoFirebase || cargandoUsuario,
        login,
        register,
        token: user?.token || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
