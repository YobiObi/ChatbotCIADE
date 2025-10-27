export default function FiltrosInstitucionales({ filtros, setFiltros, campos }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    const filtrosLimpiados = {};
    campos.forEach((campo) => filtrosLimpiados[campo] = "");
    setFiltros(filtrosLimpiados);
  };

  return (
    <div className="d-flex flex-wrap gap-3 align-items-end mb-4">
        {campos.includes("rut") && (
            <div style={{ minWidth: "180px" }}>
            <label className="form-label fw-bold">RUT</label>
            <input 
            type="text" 
            name="rut" 
            className="form-control" 
            placeholder="Ej: 12.345.678-9" 
            value={filtros.rut || ""} 
            onChange={handleChange} 
            />
            </div>
        )}

        {campos.includes("nombre") && (
            <div style={{ minWidth: "220px" }}>
            <label className="form-label fw-bold">Nombre</label>
            <input 
            type="text" 
            name="nombre" 
            className="form-control" 
            placeholder="Buscar por nombre" 
            value={filtros.nombre || ""} 
            onChange={handleChange} 
            />
            </div>
        )}      

        {campos.includes("alumno") && (
            <div style={{ minWidth: "220px" }}>
            <label className="form-label fw-bold">Nombre del alumno</label>
            <input
            type="text"
            name="alumno"
            className="form-control"
            placeholder="Buscar por alumno"
            value={filtros.alumno || ""}
            onChange={handleChange}
            />
            </div>
        )}

        {campos.includes("coordinador") && (
            <div style={{ minWidth: "220px" }}>
            <label className="form-label fw-bold">Nombre del coordinador</label>
            <input
            type="text"
            name="coordinador"
            className="form-control"
            placeholder="Buscar por coordinador"
            value={filtros.coordinador || ""}
            onChange={handleChange}
            />
            </div>
        )}        

        {campos.includes("email") && (
            <div style={{ minWidth: "220px" }}>
            <label className="form-label fw-bold">Email</label>
            <input
            type="text"
            name="email"
            className="form-control"
            placeholder="Buscar por email"
            value={filtros.email || ""}
            onChange={handleChange}
            />
            </div>
        )}

        {campos.includes("fechaInicio") && campos.includes("fechaFin") && (
            <div style={{ minWidth: "280px" }}>
            <label className="form-label fw-bold">Rango de fechas</label>
            <div className="d-flex gap-2">
                <input 
                type="date" 
                name="fechaInicio" 
                className="form-control" 
                value={filtros.fechaInicio || ""} 
                onChange={handleChange} 
                />
                <input 
                type="date" 
                name="fechaFin" 
                className="form-control" 
                value={filtros.fechaFin || ""} 
                onChange={handleChange} 
                />
            </div>
            </div>
        )}

        {campos.includes("estado") && (
            <div style={{ minWidth: "180px" }}>
            <label className="form-label fw-bold">Estado</label>
            <select name="estado" className="form-select" value={filtros.estado || ""} onChange={handleChange}>
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="aceptada">Aceptada</option>
                <option value="rechazada">Rechazada</option>
            </select>
            </div>
        )}
        
        {campos.includes("campus") && (
            <div style={{ minWidth: "220px" }}>
            <label className="form-label fw-bold">Campus</label>
            <input
            type="text"
            name="campus"
            className="form-control"
            placeholder="Buscar por campus"
            value={filtros.campus || ""}
            onChange={handleChange}
            />
            </div>
        )}

        {campos.includes("rol") && (
            <div style={{ minWidth: "180px" }}>
            <label className="form-label fw-bold">Rol</label>
            <select
                name="rol"
                className="form-select"
                value={filtros.rol || ""}
                onChange={handleChange}
            >
                <option value="">Todos</option>
                <option value="Alumno">Alumno</option>
                <option value="Coordinacion">Coordinación</option>
                <option value="Admin">Admin</option>
            </select>
            </div>
        )}

        {campos.includes("modalidad") && (
            <div style={{ minWidth: "180px" }}>
            <label className="form-label fw-bold">Modalidad</label>
            <select
                name="modalidad"
                className="form-select"
                value={filtros.modalidad || ""}
                onChange={handleChange}
            >
                <option value="">Todas</option>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
            </select>
            </div>
        )}

      <div>
        <button className="btn btn-outline-secondary mt-4" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
