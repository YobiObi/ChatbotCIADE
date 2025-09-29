import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Banner from "../../components/BannerTitulo";

const faqs = [
  {
    question: "¿Cómo puedo solicitar agendar una cita de atención en CIADE?",
    intro:
      ["Debes registrarte o acceder al portal con tus credenciales institucionales, seleccionar 'Agendar Cita' y completar el formulario de solicitud, es importante que agregues una descripción con el motivo de la cita y que elijas un miembro de la coordinación CIADE respectivo a tu campus.", 
      "Una vez que hayas solicitado la cita, la coordinación CIADE te contactará en un máximo de 3 días por medio de tu correo institucional para establecer un horario de atención. En caso de que no puedas asistir a la cita, notifícale a tu coordinador/a.",]
  },
  {
    question: "¿Qué hago si el chatbot no responde lo que pregunto?",
    answer:
      "Si el chatbot no logra resolver tu duda, te dará la opción de solicitar agendar una cita con la coordinación CIADE, para que puedas mandar tu asunto por correo y atenderte de forma virtual o presencial.",
  },
  {
    question: "¿Recibiré confirmación por correo electrónico?",
    answer:
      "Sí, recibirás un correo con los detalles de la cita y un recordatorio previo. En caso de que no te llegue un correo, puedes comunicarte directamente por correo con la coordinación CIADE de tu campus. O la atención presencial en las oficinas del CIADE.",
  },
  {
    question: "¿Cómo puedo participar de los programas que ofrece el CIADE?",
    answer:
      "Para participar de algunos de los programas del CIADE, como las tutorías, reforzamientos, mentoría, inclusión, apoyo vocacional y psicoeducativo, debes contactarte con la coordinación CIADE de tu campus para realizar la solicitud, ya sea por correo o de manera presencial (recuerda solicitar tu cita).",
  },
  {
    question: "¿Qué debo hacer para ser Tutor/a CIADE?",
    intro:
      "Para ser Tutor/a CIADE, debes contactarte directamente con tu coordinador/a CIADE o completar el formulario de postulación enviado por correo que se habilita en cada nuevo semestre.",
    listTitle: "Debes cumplir con los siguientes requisitos:",
    listItems: [
      "Ser estudiante regular de pregrado UNAB.",
      "Cursar entre el tercer y último semestre de carrera.",
      "Ser estudiante destacado en la asignatura que desea realizar en tutoría.",
      "Tener un promedio acumulado igual o superior a 5,0.",
      "Ser un estudiante responsable y comprometido.",
      "Presentar habilidades comunicativas y de liderazgo.",
      "Ser empático, motivador, respetuoso y tolerante.",
      "Deseable experiencia en ayudantías u otros apoyos académicos.",
    ],
  },
  {
    question: "¿Qué beneficios obtengo si soy mentor o tutor CIADE?",
    intro:
      ["Siendo Mentor/a o Tutor/a CIADE, obtendrás un certificado al final de semestre que acredita tu participación y desempeño en los programas, además de un incentivo económico semestral.",
      "Si deseas más detalles, puedes contactarte con la coordinación CIADE de tu campus."  ]   
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const renderAnswer = (faq) => {
    if (faq.listItems) {
      return (
        <>
          <p>{faq.intro}</p>
          <p><strong>{faq.listTitle}</strong></p>
          <ul>
            {faq.listItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      );
    }

    if (Array.isArray(faq.intro)) {
      return (
        <>
          <p>{faq.intro[0]}</p>
          <p><strong>{faq.intro[1]}</strong></p>
        </>
      );
    }

    return <p>{faq.answer}</p>;
  };

  return (
    <>
      <Banner title="Preguntas Frecuentes" />
      <main className="container my-5">
        <div className="mx-auto" style={{ maxWidth: "900px" }}>
          <div className="accordion" id="faqAccordion">
            {faqs.map((faq, index) => (
              <div className="card mb-3" key={index}>
                <div
                  className={`card-header ${openIndex === index ? "bg-primary text-white" : ""}`}
                >
                  <button
                    className={`btn btn-link d-flex justify-content-between align-items-center w-100 text-decoration-none ${
                      openIndex === index ? "text-white" : "text-dark"
                    }`}
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-${index}`}
                  >
                    <span className="fw-semibold">{faq.question}</span>
                    {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                <div id={`faq-${index}`} className={`collapse ${openIndex === index ? "show" : ""}`}>
                  <div className="card-body text-secondary">{renderAnswer(faq)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
