import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Banner from "../../components/BannerTitulo";
import UsuariosTable from "./UsuariosTable";
import CitasTable from "./CitasTable";
import ModalCrearUsuario from "../../components/Modals/ModalCrearUsuario";

export default function PanelAdmin() {
  const [admin, setAdmin] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vistaActiva, setVistaActiva] = useState("usuarios");
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdmin(null);
        setCargando(false);
        return;
      }

      try {
        const token = await user.getIdToken();

        const resUsuario = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataUsuario = await resUsuario.json();

        if (resUsuario.ok && dataUsuario.role === "ADMIN") {
          setAdmin(dataUsuario);

          const [resUsuarios, resCitas] = await Promise.all([
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/citas`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          if (resUsuarios.ok) setUsuarios(await resUsuarios.json());
          if (resCitas.ok) setCitas(await resCitas.json());
        } else {
          setAdmin(null);
        }
      } catch (error) {
        console.error("Error al cargar datos del panel:", error);
        setAdmin(null);
      } finally {
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Evita duplicación y agrega el usuario arriba
  const handleUsuarioCreado = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const resUsuarios = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resUsuarios.ok) {
        const listaActualizada = await resUsuarios.json();
        setUsuarios(listaActualizada);
        alert("Usuario creado correctamente");
      } else {
        alert("Error al actualizar la lista de usuarios");
      }
    } catch (error) {
      console.error("Error al actualizar usuarios:", error);
      alert("Error interno");
    } finally {
      setMostrarModalCrear(false);
    }
  };

  if (cargando)
    return <div className="p-5 text-center">Cargando panel administrativo...</div>;

  if (!admin) {
    return (
      <div className="p-5 text-center text-danger">
        <h4>Acceso restringido</h4>
        <p>Este panel es exclusivo para usuarios con rol <strong>ADMIN</strong>.</p>
      </div>
    );
  }

  return (
    <>
      <Banner title="Panel Administrativo" />
      <div className="container my-5">
        {/* Selector de vista */}
        <div className="d-flex gap-3 mb-4">
          <button
            className={`btn ${vistaActiva === "usuarios" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setVistaActiva("usuarios")}
          >
            Gestionar usuarios
          </button>
          <button
            className={`btn ${vistaActiva === "citas" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setVistaActiva("citas")}
          >
            Gestionar citas
          </button>
        </div>

        {/* Vista Usuarios */}
        {vistaActiva === "usuarios" && (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ color: "#003366" }}>Gestión de usuarios</h4>
              <button
                className="btn btn-success"
                onClick={() => setMostrarModalCrear(true)}
              >
                + Crear usuario
              </button>
            </div>
            <UsuariosTable usuarios={usuarios} />
          </div>
        )}

        {/* Vista Citas */}
        {vistaActiva === "citas" && (
          <div className="mt-4">
            <h4 style={{ color: "#003366" }}>Gestión de citas</h4>
            <CitasTable citas={citas} />
          </div>
        )}

        {/* Modal Crear Usuario */}
        <ModalCrearUsuario
          visible={mostrarModalCrear}
          onClose={() => setMostrarModalCrear(false)}
          onUsuarioCreado={handleUsuarioCreado}
        />
      </div>
    </>
  );
}
