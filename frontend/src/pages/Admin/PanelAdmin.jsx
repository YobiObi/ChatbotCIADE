// src/pages/Admin/PanelAdmin.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Banner from "../../components/BannerTitulo";
import UsuariosTable from "./UsuariosTable";
import CitasTable from "./CitasTable";
import ModalCrearUsuario from "../../components/Modals/Usuarios/ModalCrearUsuario";
import ModalActualizarUsuario from "../../components/Modals/Usuarios/ModalActualizarUsuario";

export default function PanelAdmin() {
  const { user, cargando } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [citas, setCitas] = useState([]);

  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(true);
  
  const [vistaActiva, setVistaActiva] = useState("usuarios");
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalActualizar, setMostrarModalActualizar] = useState(false);

  const rol = user?.role?.name;

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user?.token || rol !== "Admin") return;
      setLoadingUsuarios(true);
      setLoadingCitas(true);

      try {
        const [resUsuarios, resCitas] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/citas`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        if (resUsuarios.ok) setUsuarios(await resUsuarios.json());
        if (resCitas.ok) setCitas(await resCitas.json());
      } catch (error) {
        console.error("Error al cargar datos del panel:", error);
      } finally {
        setLoadingUsuarios(false);
        setLoadingCitas(false);
      }
    };

    cargarDatos();
  }, [user, rol]);

  const refetchUsuarios = async () => {
    try {
      const resUsuarios = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (resUsuarios.ok) {
        const listaActualizada = await resUsuarios.json();
        setUsuarios(listaActualizada);
      }
    } catch (error) {
      console.error("Error al actualizar usuarios:", error);
    }
  };

  const handleUsuarioCreado = async () => {
    try {
      setLoadingUsuarios(true);
      const resUsuarios = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${user.token}` },
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
      setLoadingUsuarios(false);
      setMostrarModalCrear(false);
    }
  };

  const handleUsuarioActualizado = async () => {
    await refetchUsuarios();
    setMostrarModalActualizar(false);
  };

  if (cargando)
    return <div className="p-5 text-center">Cargando panel administrativo...</div>;

  if (rol !== "Admin") {
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
        <div className="mb-4">
          <div className="alert alert-info d-flex justify-content-between">
            <span><strong>Usuarios registrados:</strong> {usuarios.length}</span>
            <span><strong>Citas totales:</strong> {citas.length}</span>
          </div>
        </div>

        {vistaActiva === "usuarios" && usuarios.length === 0 && (
          <div className="text-center text-muted">No hay usuarios registrados.</div>
        )}

        {vistaActiva === "citas" && citas.length === 0 && (
          <div className="text-center text-muted">No hay citas registradas.</div>
        )}

        {/* Selector de vista */}
        <div className="d-flex gap-3 mb-4">
          <button
            className={`btn-institucional ${vistaActiva === "usuarios" ? "btn-institucional-lg" : "btn-institucional-outline"}`}
            onClick={() => setVistaActiva("usuarios")}
          >
            Gestionar usuarios
          </button>
          <button
            className={`btn-institucional ${vistaActiva === "citas" ? "btn-institucional-lg" : "btn-institucional-outline"}`}
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
              <div className="d-flex gap-2">
                <button
                  className="btn-institucional-sm"
                  onClick={() => setMostrarModalActualizar(true)}
                >
                  Actualizar usuario
                </button>
                <button
                  className="btn-institucional-sm"
                  onClick={() => setMostrarModalCrear(true)}
                >
                  + Crear usuario
                </button>
              </div>
            </div>
            {loadingUsuarios ? (
            <div className="text-center text-muted my-4">Cargando usuarios...</div>
          ) : null}

            <UsuariosTable usuarios={usuarios}  loading={loadingUsuarios}/>
          </div>
        )}

        {/* Vista Citas */}
        {vistaActiva === "citas" && (
          <div className="mt-4">
            <h4 style={{ color: "#003366" }}>Gestión de citas</h4>
            {loadingCitas ? (
            <div className="text-center text-muted my-4">Cargando citas...</div>
          ) : null}
            <CitasTable citas={citas}  loading={loadingCitas}/>
          </div>
        )}

        {/* Modal Crear Usuario */}
        <ModalCrearUsuario
          visible={mostrarModalCrear}
          onClose={() => setMostrarModalCrear(false)}
          onUsuarioCreado={handleUsuarioCreado}
        />

        {/* Modal Actualizar Usuario */}
        <ModalActualizarUsuario
          visible={mostrarModalActualizar}
          onClose={() => setMostrarModalActualizar(false)}
          onUpdated={handleUsuarioActualizado}
        />
      </div>
    </>
  );
}
