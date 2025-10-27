import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Banner from "../../components/BannerTitulo";
import { useAuth } from "../../context/AuthContext";

export default function RegistroUsuario() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    sede: "",
    campus: "",
    carrera: "",
    correo: "",
    contraseña: ""
  });

  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorRUT, setErrorRUT] = useState("");
  const [campusList, setCampusList] = useState([]);
  const [carreraList, setCarreraList] = useState([]);

  const sedes = ["Santiago", "Viña del Mar", "Concepción"];

  useEffect(() => {
  if (formData.sede) {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/institucional/campus?sede=${formData.sede}`)
      .then(res => res.json())
      .then(data => {
        setCampusList(data);
        setFormData(prev => ({ ...prev, campus: "", carrera: "" })); // limpia selección previa
      })
      .catch(err => console.error("Error al obtener campus:", err));
  }
}, [formData.sede]);


  useEffect(() => {
  if (formData.campus) {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/institucional/carreras?campus=${formData.campus}`)
      .then(res => res.json())
      .then(data => {
        setCarreraList(data);
        setFormData(prev => ({ ...prev, carrera: "" }));
      })
      .catch(err => console.error("Error al obtener carreras:", err));
  }
}, [formData.campus]);


  const validarRUT = (rutCompleto) => {
    const rut = rutCompleto.replace(/\./g, "").replace("-", "");
    if (!/^\d{7,8}[0-9kK]$/.test(rut)) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toLowerCase();
    let suma = 0, multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "k" : dvEsperado.toString();
    return dv === dvCalculado;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "correo") {
      const regex = /^[a-z]+\.[a-z]+@ksan\.edu$/i;
      setErrorCorreo(regex.test(value) ? "" : "Formato inválido: nombre.apellido@ksan.edu");
    }

    if (name === "rut") {
      setErrorRUT(validarRUT(value) ? "" : "RUT inválido");
    }
  };

  const facultadSeleccionada = carreraList.find(c => c.nombre === formData.carrera)?.facultad || "";


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errorCorreo || errorRUT) return;

    try {
      await register({
        correo: formData.correo,
        contraseña: formData.contraseña,
        firstName: formData.nombre,
        lastName: formData.apellido,
        rut: formData.rut,
        sede: formData.sede,
        campus: formData.campus,
        carrera: formData.carrera,
        facultad: facultadSeleccionada,
        role: "Alumno"
      });

      alert("Usuario registrado exitosamente");
      navigate("/login");
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      alert("Error al crear cuenta: " + error.message);
    }
  };

  return (
    <>
      <Banner title="Registro de Usuario" />
      <div className="container my-5" style={{ maxWidth: "600px" }}>
        <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light fw-semibold" style={{ color: "#003366" }}>
          <h2 className="mb-4 text-center">Formulario Registro de Usuario</h2>

          {/* RUT */}
          <div className="mb-3">
            <label className="form-label">RUT</label>
            <input
              type="text"
              name="rut"
              className={`form-control ${errorRUT ? "is-invalid" : ""}`}
              value={formData.rut}
              onChange={handleChange}
              placeholder="Ej: 12.345.678-5"
              required
            />
            {errorRUT && <div className="invalid-feedback">{errorRUT}</div>}
          </div>

          {/* Nombre */}
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="nombre"
              className="form-control"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          {/* Apellido */}
          <div className="mb-3">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              name="apellido"
              className="form-control"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>

          {/* Sede */}
          <div className="mb-3">
            <label className="form-label">Sede</label>
            <select
              name="sede"
              className="form-select"
              value={formData.sede}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona tu Sede</option>
              {sedes.map((sede) => (
                <option key={sede} value={sede}>{sede}</option>
              ))}
            </select>
          </div>

          {/* Campus */}
          <div className="mb-3">
            <label className="form-label">Campus</label>
            <select
              name="campus"
              className="form-select"
              value={formData.campus}
              onChange={handleChange}
              required
              disabled={!formData.sede}
            >
              <option value="">Selecciona tu campus</option>
              {campusList.map((campus) => (
                <option key={campus.id} value={campus.nombre}>{campus.nombre}</option>
              ))}
            </select>
            {formData.sede && campusList.length === 0 && (
              <p className="text-danger mt-2">No hay campus disponibles para esta sede.</p>
            )}
          </div>

          {/* Carrera */}
          <div className="mb-3">
            <label className="form-label">Carrera</label>
            <select
              name="carrera"
              className="form-select"
              value={formData.carrera}
              onChange={handleChange}
              required
              disabled={!formData.campus}
            >
              <option value="">Selecciona tu carrera</option>
              {carreraList.map((carrera) => (
                <option key={carrera.id} value={carrera.nombre}>{carrera.nombre}</option>
              ))}
            </select>
          </div>

          {/* Facultad */}
          {facultadSeleccionada && (
            <div className="mb-3">
              <label className="form-label">Facultad</label>
              <input
                type="text"
                className="form-control"
                value={facultadSeleccionada}
                disabled
              />
            </div>
          )}

          {/* Correo */}
          <div className="mb-3">
            <label className="form-label">Correo Institucional</label>
            <input
              type="email"
              name="correo"
              placeholder="nombre.apellido@ksan.edu"
              className={`form-control ${errorCorreo ? "is-invalid" : ""}`}
              value={formData.correo}
              onChange={handleChange}
              required
            />
            {errorCorreo && <div className="invalid-feedback">{errorCorreo}</div>}
          </div>

          {/* Contraseña */}
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="contraseña"
              className="form-control"
              value={formData.contraseña}
              onChange={handleChange}
              required
            />
          </div>

          {/* Botón */}
          <div className="text-center">
            <button type="submit" className="btn-institucional">Registrarse</button>
          </div>

          <div className="mt-3 text-center">
            <span>¿Ya estás registrad@? </span>
            <Link to="/login" className="text-primary text-decoration-underline">
              Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
