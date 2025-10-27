// src/pages/CoordinacionesCIADE.jsx
import Paula from "../images/Rostros/PaLo.png"
import Maria from "../images/Rostros/MaPi.jpg"
import Natalia from "../images/Rostros/NaVa.png"
import Rosse from "../images/Rostros/RoEs.png"
import Marcela from "../images/Rostros/MaHo.png"
import MariaFer from "../images/Rostros/FeSa.png"
import Carmen from "../images/Rostros/CaDo.png"
import Felipe from "../images/Rostros/FeCa.jpg"
import Laura from "../images/Rostros/LaSa.png"
import Alejandra from "../images/Rostros/AlAl.png"
import Ignacia from "../images/Rostros/IgSa.jpg"

const DATA_CAMPUS = [
  {
    titulo: "ANTONIO VARAS - LOS LEONES",
    personas: [
      {
        nombre: "Paula López Torres",
        email: "paula.lopez@unab.cl",
        foto: Paula,
      },
    ],
  },
  {
    titulo: "BELLAVISTA - CREATIVO - ADVANCE",
    personas: [
      {
        nombre: "María Pilar Mir Jouannet",
        email: "maria.mir@unab.cl",
        foto: Maria,
      },
    ],
  },
  {
    titulo: "CASONA",
    personas: [
      {
        nombre: "Natalia Vargas Fontirroig",
        email: "natalia.vargas@unab.cl",
        foto: Natalia,
      },
      {
        nombre: "Rosse Marie Espinoza Aburto",
        email: "rosse.espinoza@unab.cl",
        foto: Rosse,
      },
    ],
  },
  {
    titulo: "CONCEPCIÓN",
    personas: [
      {
        nombre: "Marcela Hormazábal Faúndez",
        email: "marcela.hormazabal@unab.cl",
        foto: Marcela,
      },
      {
        nombre: "Caterin Colpihueque Hidalgo",
        email: "caterin.colpihueque@unab.cl",
        foto: "https://i.pravatar.cc/96?img=67",
      },
    ],
  },
  {
    titulo: "REPÚBLICA",
    personas: [
      {
        nombre: "Carmen Dorn Cofré",
        email: "cdorn@unab.cl",
        foto: Carmen,
      },
      {
        nombre: "Felipe Campos Sepúlveda",
        email: "felipe.campos@unab.cl",
        foto: Felipe,
      },
    ],
  },
  {
    titulo: "VIÑA DEL MAR",
    personas: [
      {
        nombre: "Laura Sáez Bravo",
        email: "laura.saez@unab.cl",
        foto: Laura,
      },
      {
        nombre: "Alejandra Alday Tapia",
        email: "alejandra.alday@unab.cl",
        foto: Alejandra,
      },
    ],
  },
];

const DATA_INCLUSION = [
  {
    nombre: "María Fernanda Santander",
    cargo: "Concepción",
    email: "maria.santander@unab.cl",
    foto: MariaFer,
  },
  {
    nombre: "Ignacia Sauvalle",
    cargo: "Santiago",
    email: "i.sauvalle@unab.cl",
    foto: Ignacia,
  },
  {
    nombre: "Nombre 3",
    cargo: "Viña del Mar",
    email: "persona3@unab.cl",
    foto: "https://i.pravatar.cc/96?img=67",
  },
];

function PersonaItem({ nombre, email, foto, cargo }) {
  return (
    <div className="d-flex align-items-start gap-3 py-2">
      <img
        src={foto}
        alt={`Foto de ${nombre}`}
        width={72}
        height={72}
        className="rounded-circle flex-shrink-0"
        style={{ objectFit: "cover" }}
      />
      <div>
        <div className="fw-semibold">{nombre}</div>
        {cargo && <div className="small text-muted">{cargo}</div>}
        <a href={`mailto:${email}`} style={{ color: "#be0909ff"}}>{email}</a>
      </div>
    </div>
  );
}

function CampusCard({ titulo, personas }) {
  return (
    <div className="p-3 border rounded-3 h-100">
      <div className="d-flex align-items-center gap-2 mb-2">
        <h6 className="m-0 text-uppercase">{titulo}</h6>
      </div>
      <hr className="my-2" />
      {personas.map((p, i) => (
        <PersonaItem key={i} {...p} />
      ))}
    </div>
  );
}

export default function CoordinacionesCIADE() {
  return (
    <div className="container my-5">
      <header className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: "#003366", letterSpacing: "0.5px" }}>
          COORDINACIONES CAMPUS
        </h2>
      </header>

      {/* Grid de campus (2 columnas en md+, 1 en mobile) */}
      <div className="row g-4">
        {DATA_CAMPUS.map((c, idx) => (
          <div key={idx} className="col-12 col-md-4">
            <CampusCard {...c} />
          </div>
        ))}
      </div>

      {/* Sección Inclusión */}
      <section className="mt-5">
        <h3 className="text-center fw-bold mb-3" style={{ color: "#003366" }}>
          COORDINACIONES INCLUSIÓN
        </h3>
        <div className="row g-4">
          {DATA_INCLUSION.map((p, idx) => (
            <div key={idx} className="col-12 col-md-4">
              <div className="p-3 border rounded-3 h-100">
                <PersonaItem {...p} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
