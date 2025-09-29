const coordinadoresPorCampus = [
  { uid:"EkuzfsNQGiM5W8ZxLluRDci2PFM2", 
    nombre: "Paula López Torres", 
    campus: ["Antonio Varas", "Los Leones"],
    facultad: ["Ingeniería", "Economía y Negocios"],
    carreras: ["Ingeniería Industrial", "Ingeniería Civil Industrial", "Ingeniería en Automatización y Robótica", "Ingeniería en Computación e Informática", "Ingeniería Civil Informática", "Ingeniería en Construcción", "Ingeniería Civil", "Ingeniería Civil Eléctrica", "Ingeniería en Logística y Transporte", "Ingeniería en Seguridad y Prevención de Riesgos", "Ingeniería en Telecomunicaciones", "Contador Auditor", "Ingeniería en Administración de Empresas"]
  },
  { uid:"zUIrIAMtoXMpTqXroyRHSg4aKvG2", 
    nombre: "María Pilar Mir Jouannet", 
    campus: ["Bellavista", "Creativo"],
    facultad: ["Derecho", "Economía y Negocios", "Arquitectura, Arte, Diseño y Comunicaciones"],
    carreras: ["Derecho", "Ingeniería Comercial", "Arquitectura", "Artes Visuales", "Diseño de Vestuario y Textil", "Diseño de Videojuegos Digitales", "Diseño Gráfico", "Publicidad", "Periodismo"]
  },
  { uid:"0bx0xaDrIBhZuDOsJ4FzXDElvsP2", 
    nombre: "Natalia Vargas Fontirroig", 
    campus: ["Casona"],
    facultad: ["Ciencias de la Vida", "Ciencias de la Rehabilitación", "Derecho", "Ingeniería"],
    carreras: ["Bachillerato en Ciencias", "Fonoaudiología", "Terapia Ocupacional", "Derecho", "Ingeniería Civil Industrial", "Ingeniería Civil Informática"]
  },
  { uid:"BUTU30k8aIZAEndzFrHPAQMUwst2", 
    nombre: "Rosse Marie Espinoza Aburto", 
    campus: ["Casona"],
    facultad: ["Economía y Negocios", "Educación y Ciencias Sociales", "Enfermería"],
    carreras: ["Ingeniería Comercial", "Ingeniería en Turismo y Hotelería", "Ingeniería en Administración Hotelera Internacional", "Ingeniería en Negocios Internacionales", "Psicología", "Pedagogía en Educación Física", "Entrenador Deportivo", "Psicopedagogía", "Educación Parvularia", "Pedagogía en Inglés para la Enseñanza Básica y Media", "Enfermería"]
  },
  { uid:"AFps0cmxjXaf4hTPWgmGFxsj0VG2", 
    nombre: "Marcela Hormazábal Faúndez", 
    campus: ["Concepción"],
    facultad: ["Medicina", "Odontología", "Ingeniería", "Economía y Negocios", "Ciencias de la Rehabilitación", "Ciencias Exactas"],
    carreras: ["Medicina", "Nutrición y Dietética", "Tecnología Médica", "Química y Farmacia", "Obstetricia", "Odontología", "Ingeniería Civil Industrial", "Ingeniería Civil Informática", "Ingeniería Civil en Minas", "Geología", "Ingeniería en Automatización y Robótica", "Ingeniería en Marina Mercante", "Ingeniería Comercial", "Ingeniería en Administración de Empresas", "Fonoaudiología", "Kinesiología", "Terapia Ocupacional", "Licenciatura en Astronomía"]
  },
  { uid:"gMyabKTwo8Y3e1INucEpuJLrdjw2", 
    nombre: "María Fernanda Santander", 
    campus: ["Concepción"],
    facultad: ["Ciencias de la Vida", "Derecho", "Enfermería", "Educación y Ciencias Sociales", "Arquitectura, Arte, Diseño y Comunicaciones"],
    carreras: ["Administración en Ecoturismo", "Bachillerato en Ciencias", "Medicina Veterinaria", "Derecho", "Enfermería", "Psicología", "Entrenador Deportivo", "Pedagogía en Inglés para la Enseñanza Básica y Media", "Educación Parvularia", "Psicopedagogía", "Trabajo Social", "Arquitectura", "Diseño de Videojuegos Digitales", "Publicidad"] 
  },
  { uid:"FQtsI9rtWebw9WNvZ2VnbXOtKWF2", 
    nombre: "Carmen Dorn Cofré", 
    campus: ["República"], 
    facultad: ["Ciencias de la Vida", "Odontología", "Ingeniería"],
    carreras: ["Biología", "Bioquímica", "Ingeniería en Biotecnología", "Biología Marina", "Administración de Ecoturismo", "Bachillerato en Ciencias", "Medicina Veterinaria", "Ingeniería Ambiental", "Odontología", "Geología", "Ingeniería Civil en Minas"]
  },
  { uid:"kybrOzkqyNSii0AMs2fgEuCciuf1", 
    nombre: "Felipe Campos Sepúlveda", 
    campus: ["República"],
    facultad: ["Medicina", "Enfermería", "Ciencias Exactas", "Educación y Ciencias Sociales"],
    carreras: ["Medicina", "Nutrición y Dietética", "Tecnología Médica", "Química y Farmacia", "Obstetricia", "Enfermería", "Astronomía", "Ingeniería Física", "Licenciatura en Física", "Psicología", "Educación Parvularia", "Sociología", "Trabajo Social", "Licenciatura en Historia", "Licenciatura en Letras"]
  },
  { uid:"erGZGZfOcGU1jv50waWJ9vKt5UJ2", 
    nombre: "Laura Sáez Bravo", 
    campus: ["Viña del Mar"], 
    facultad: ["Ciencias de la Rehabilitación", "Economía y Negocios", "Enfermería", "Odontología", "Medicina"],
    carreras: ["Kinesiología", "Fonoaudiología", "Terapia Ocupacional", "Contador Auditor", "Ingeniería Comercial", "Ingeniería en Turismo y Hotelería", "Ingeniería en Administración de Empresas", "Enfermería", "Odontología", "Medicina", "Obstetricia", "Química y Farmacia", "Tecnología Médica", "Nutrición y Dietética"]
  },
  { uid:"S8YLoRzCJ9XByrVGgbuyz667K183", 
    nombre: "Alejandra Alday Tapia", 
    campus: ["Viña del Mar"], 
    facultad: ["Arquitectura, Arte, Diseño y Comunicaciones", "Ciencias de la Vida", "Derecho", "Educación y Ciencias Sociales", "Ingeniería"],
    carreras: ["Arquitectura", "Bachillerato en Ciencias", "Ingeniería en Biotecnología", "Medicina Veterinaria", "Administración en Ecoturismo", "Derecho", "Pedagogía en Educación Física", "Entrenador Deportivo", "Psicopedagogía", "Educación Parvularia", "Pedagogía en Inglés", "Educación General Básica", "Trabajo Social", "Licenciatura en Historia", "Psicología", "Geología", "Ingeniería Civil Industrial", "Ingeniería Civil Informática", "Ingeniería en Computación e Informática", "Ingeniería en Marina Mercante", "Ingeniería Industrial", "Ingeniería en Minas"]
  },
];

export default coordinadoresPorCampus;