// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "../firebase";
import * as authService from "../services/auth.service.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();

        // Esperar 500ms para dar tiempo al backend
        await new Promise((resolve) => setTimeout(resolve, 500));

        const data = await authService.getUsuarioInfo(token);
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, token, ...data });
        setRol(data.role);
      } catch (error) {
        console.error("Error al validar rol:", error);
        setUser(null);
        setRol("");
      }
    } else {
      setUser(null);
      setRol("");
    }
    setCargando(false);
  });

    return () => unsubscribe();
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

  // 🔑 Registro: ahora acepta payload completo
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
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, correo, contraseña);
    const firebaseUser = userCredential.user;
    const token = await firebaseUser.getIdToken();
    const uid = firebaseUser.uid;

    // Enviar datos al backend
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid,
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
      const errorData = await res.json();
      throw new Error(errorData.error || "Error al registrar usuario en backend");
    }

    // 🔄 Esperar confirmación de sincronización
    let intentos = 0;
    let usuarioSincronizado = null;
    while (intentos < 5 && !usuarioSincronizado) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        usuarioSincronizado = await authService.getUsuarioInfo(token);
      } catch {
        intentos++;
      }
    }

    if (!usuarioSincronizado) {
      throw new Error("No se pudo sincronizar el usuario con la base de datos.");
    }

    return usuarioSincronizado;
  } catch (err) {
    console.error("Error en register:", err);
    throw err;
  }
};

  return (
    <AuthContext.Provider value={{ user, rol, cargando, login, register, token: user ? user.token : null }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
