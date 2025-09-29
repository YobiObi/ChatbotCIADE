const carrerasData = [
  {
    facultad: "Arquitectura, Arte, Diseño y Comunicaciones",
    carrera: "Arquitectura",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Viña del Mar", "Concepción", "Creativo"]
  },
  {
    facultad: "Arquitectura, Arte, Diseño y Comunicaciones",
    carrera: "Artes Visuales",
    sede: ["Santiago"],
    campus: ["Creativo"]
  },
  {
    facultad: "Arquitectura, Arte, Diseño y Comunicaciones",
    carrera: "Diseño de Videojuegos Digitales",
    sede: ["Concepción", "Santiago"],
    campus: ["Concepción", "Creativo"]
  },
  {
    facultad: "Arquitectura, Arte, Diseño y Comunicaciones",
    carrera: "Diseño de Vestuario y Textil",
    sede: ["Santiago"],
    campus: ["Creativo"]
  },
  {
    facultad: "Arquitectura, Arte, Diseño y Comunicaciones",
    carrera: "Diseño Gráfico",
    sede: ["Santiago"],
    campus: ["Creativo"]
  },
  {
    facultad: "Arquitectura, Arte, Diseño y Comunicaciones",
    carrera: "Periodismo",
    sede: ["Santiago"],
    campus: ["Creativo"]
  },
  {
    facultad: "Arquitectura, Arte, Diseño y Comunicaciones",
    carrera: "Publicidad",
    sede: ["Concepción", "Santiago"],
    campus: ["Concepción", "Creativo"]
  },
  {
    facultad: "Ciencias de la Rehabilitación",
    carrera: "Fonoaudiología",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona"]
  },
  {
    facultad: "Ciencias de la Rehabilitación",
    carrera: "Kinesiología",
    sede: ["Concepción", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar"]
  },
  {
    facultad: "Ciencias de la Rehabilitación",
    carrera: "Terapia Ocupacional",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona"]
  },
  {
    facultad: "Ciencias de La Vida",
    carrera: "Administración en Ecoturismo",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Ciencias de La Vida",
    carrera: "Bachillerato en Ciencias de la Salud",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona", "República"]
  },
  {
    facultad: "Ciencias de La Vida",
    carrera: "Biología",
    sede: ["Santiago"],
    campus: ["República"]
  },
  {
    facultad: "Ciencias de La Vida",
    carrera: "Biología Marina",
    sede: ["Santiago"],
    campus: ["República"]
  },
  {
    facultad: "Ciencias de La Vida",
    carrera: "Bioquímica",
    sede: ["Santiago"],
    campus: ["República"]
  },
  {
    facultad: "Ciencias de La Vida",
    carrera: "Ingeniería Ambiental",
    sede: ["Santiago"],
    campus: ["República"]
  },
  {
    facultad: "Ciencias de La Vida",
    carrera: "Ingeniería en Biotecnología",
    sede: ["Santiago", "Viña del Mar"],
    campus: ["Viña del Mar", "República"]
  },
  {
    facultad: "Ciencias de La Vida",
    carrera: "Medicina Veterinaria",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Ciencias Exactas",
    carrera: "Ingeniería Física",
    sede: ["Santiago"],
    campus: ["República"]
  },
  {
    facultad: "Ciencias Exactas",
    carrera: "Licenciatura en Astronomía",
    sede: ["Concepción", "Santiago"],
    campus: ["Concepción", "República"]
  },
  {
    facultad: "Ciencias Exactas",
    carrera: "Licenciatura en Física",
    sede: ["Santiago"],
    campus: ["República"]
  },
  {
    facultad: "Derecho",
    carrera: "Derecho",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona", "Bellavista"]
  },
  {
    facultad: "Economía y Negocios",
    carrera: "Contador Auditor",
    sede: ["Santiago", "Viña del Mar"],
    campus: ["Viña del Mar", "Los Leones"]
  },
  {
    facultad: "Economía y Negocios",
    carrera: "Ingeniería Comercial",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona", "Bellavisa"]
  },
  {
    facultad: "Economía y Negocios",
    carrera: "Ingeniería en Administración de Empresas",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Los Leones"]
  },
  {
    facultad: "Economía y Negocios",
    carrera: "Ingeniería en Administración Hotelera Internacional",
    sede: ["Santiago"],
    campus: ["Casona"]
  },
  {
    facultad: "Economía y Negocios",
    carrera: "Ingeniería en Negocios Internacionales",
    sede: ["Santiago"],
    campus: ["Casona"]
  },
  {
    facultad: "Economía y Negocios",
    carrera: "Ingeniería en Turismo y Hotelería",
    sede: ["Santiago", "Viña del Mar"],
    campus: ["Viña del Mar", "Casona"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Educación Parvularia",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona", "República"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Entrenador Deportivo",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Licenciatura en Historia",
    sede: ["Viña del Mar", "Santiago"],
    campus: ["Viña del Mar", "República"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Licenciatura en Letras",
    sede: ["Santiago"],
    campus: ["República"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Pedagogía en Educación Física",
    sede: ["Santiago", "Viña del Mar"],
    campus: ["Viña del Mar", "Casona"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Pedagogía en Inglés para la Enseñanza Básica y Media",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Psicología",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona", "República"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Psicopedagogía",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Educación General Básica",
    sede: ["Viña del Mar"],
    campus: ["Viña del Mar"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Sociología",
    sede: ["Santiago"],
    campus: ["República"]
  },
  {
    facultad: "Educación y Ciencias Sociales",
    carrera: "Trabajo Social",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Enfermería",
    carrera: "Enfermería",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona", "República"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Geología",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería Civil",
    sede: ["Santiago"],
    campus: ["Antonio Varas"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería Civil Eléctrica",
    sede: ["Santiago"],
    campus: ["Antonio Varas"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería Civil en Minas",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería Civil Industrial",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona", "Antonio Varas"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería Civil Informática",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "Casona", "Antonio Varas"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería en Computación e Informática",
    sede: ["Santiago", "Viña del Mar"],
    campus: ["Viña del Mar", "Antonio Varas"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería en Automatización y Robótica",
    sede: ["Concepción", "Santiago"],
    campus: ["Concepción", "Antonio Varas"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería en Construcción",
    sede: ["Santiago"],
    campus: ["Antonio Varas"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería en Marina Mercante",
    sede: ["Concepción", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar"]
  },
  {
    facultad: "Ingeniería",
    carrera: "Ingeniería Industrial",
    sede: ["Viña del Mar", "Santiago"],
    campus: ["Viña del Mar", "Antonio Varas"]
  },
    {
    facultad: "Ingeniería",
    carrera: "Ingeniería en Logística y Transporte",
    sede: ["Santiago"],
    campus: ["Antonio Varas"]
  },
    {
    facultad: "Ingeniería",
    carrera: "Ingeniería en Seguridad y Prevención de Riesgos",
    sede: ["Santiago"],
    campus: ["Antonio Varas"]
  },
    {
    facultad: "Ingeniería",
    carrera: "Ingeniería en Telecomunicaciones",
    sede: ["Santiago"],
    campus: ["Antonio Varas"]
  },
  {
    facultad: "Medicina",
    carrera: "Medicina",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Medicina",
    carrera: "Nutrición y Dietética",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Medicina",
    carrera: "Obstetricia",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Medicina",
    carrera: "Química y Farmacia",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Medicina",
    carrera: "Tecnología Médica",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  },
  {
    facultad: "Odontología",
    carrera: "Odontología",
    sede: ["Concepción", "Santiago", "Viña del Mar"],
    campus: ["Concepción", "Viña del Mar", "República"]
  }
];

export default carrerasData;