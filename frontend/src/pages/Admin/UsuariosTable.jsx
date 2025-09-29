import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import Paginacion from "../../components/Paginacion";

export default function UsuariosTable({ usuarios }) {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtro, setFiltro] = useState({ nombre: "", email: "", campus: "" });
  const [seleccionados, setSeleccionados] = useState([]);

  const usuariosPorPagina = 10;

  // Sincroniza listaUsuarios con usuarios externos, ordenando por fecha si existe
  useEffect(() => {
    const ordenados = [...usuarios].sort((a, b) => {
      const fechaA = new Date(a.createdAt || 0).getTime();
      const fechaB = new Date(b.createdAt || 0).getTime();
      return fechaB - fechaA;
    });
    setListaUsuarios(ordenados);
  }, [usuarios]);

  const filtrarUsuarios = listaUsuarios.filter((u) => {
    const nombre = `${u.firstName} ${u.lastName}`.toLowerCase();
    return (
      nombre.includes(filtro.nombre.toLowerCase()) &&
      u.email.toLowerCase().includes(filtro.email.toLowerCase()) &&
      u.campus.toLowerCase().includes(filtro.campus.toLowerCase())
    );
  });

  const totalPaginas = Math.ceil(filtrarUsuarios.length / usuariosPorPagina);
  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const usuariosPaginados = filtrarUsuarios.slice(indiceInicio, indiceInicio + usuariosPorPagina);

  const toggleSeleccion = (uid) => {
    setSeleccionados((prev) =>
      prev.includes(uid) ? prev.filter((i) => i !== uid) : [...prev, uid]
    );
  };

  const actualizarCampo = async (uid, campo, valor) => {
    const confirmar = window.confirm(`¿Estás seguro de cambiar el ${campo} a "${valor}"?`);
    if (!confirmar) return;

    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios/${uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ [campo]: valor }),
    });

    const data = await res.json();
    if (res.ok) {
      setListaUsuarios((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, [campo]: valor } : u))
      );
    } else {
      alert(data.error || `Error al actualizar ${campo}`);
    }
  };

  const eliminarSeleccionados = async () => {
    if (seleccionados.length === 0) {
      alert("No hay usuarios seleccionados");
      return;
    }

    const confirmar = window.confirm(`¿Deseas eliminar ${seleccionados.length} usuario(s)?`);
    if (!confirmar) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/usuarios`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uids: seleccionados }),
      });

      const data = await res.json();
      if (res.ok) {
        setListaUsuarios((prev) => prev.filter((u) => !seleccionados.includes(u.uid)));
        setSeleccionados([]);
        alert(data.message || "Usuarios eliminados correctamente");
      } else {
        alert(data.error || "Error al eliminar usuarios");
      }
    } catch (error) {
      console.error("Error al eliminar usuarios:", error);
      alert("Error interno");
    }
  };

  return (
    <>
      {/* Filtros */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filtrar por nombre"
            value={filtro.nombre}
            onChange={(e) => {
              setFiltro({ ...filtro, nombre: e.target.value });
              setPaginaActual(1);
            }}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filtrar por email"
            value={filtro.email}
            onChange={(e) => {
              setFiltro({ ...filtro, email: e.target.value });
              setPaginaActual(1);
            }}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filtrar por campus"
            value={filtro.campus}
            onChange={(e) => {
              setFiltro({ ...filtro, campus: e.target.value });
              setPaginaActual(1);
            }}
          />
        </div>
      </div>

      {/* Botón eliminar seleccionados */}
      {seleccionados.length > 0 && (
        <div className="mb-3">
          <button className="btn btn-danger btn-sm" onClick={eliminarSeleccionados}>
            Eliminar {seleccionados.length} seleccionada(s)
          </button>
        </div>
      )}

      {/* Tabla */}
      <table className="table table-bordered">
        <thead className="encabezado-citas">
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSeleccionados(e.target.checked ? usuariosPaginados.map((u) => u.uid) : [])
                }
                checked={
                  usuariosPaginados.every((u) => seleccionados.includes(u.uid)) &&
                  usuariosPaginados.length > 0
                }
              />
            </th>
            <th>RUT</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Campus</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuariosPaginados.map((u) => (
            <tr key={u.uid}>
              <td>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(u.uid)}
                  onChange={() => toggleSeleccion(u.uid)}
                />
              </td>
              <td>{u.rut ?? "—"}</td>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>
                <select
                  className="form-select form-select-sm"
                  value={u.campus}
                  onChange={(e) => actualizarCampo(u.uid, "campus", e.target.value)}
                >
                  <option value="Antonio Varas">Antonio Varas</option>
                  <option value="Los Leones">Los Leones</option>
                  <option value="Bellavista">Bellavista</option>
                  <option value="Creativo">Creativo</option>
                  <option value="República">República</option>
                  <option value="Casona">Casona</option>
                  <option value="Viña del Mar">Viña del Mar</option>
                  <option value="Concepción">Concepción</option>
                </select>
              </td>
              <td>
                <select
                  className="form-select form-select-sm"
                  value={u.role}
                  onChange={(e) => actualizarCampo(u.uid, "role", e.target.value)}
                >
                  <option value="ALUMNO">ALUMNO</option>
                  <option value="COORDINACION">COORDINACION</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambiar={setPaginaActual}
      />
    </>
  );
}
