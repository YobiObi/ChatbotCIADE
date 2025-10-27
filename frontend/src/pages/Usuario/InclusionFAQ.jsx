import AccordionItem from "../../components/AcordionItem.jsx";

const faqsInclusion = [
  {
    question: "¿Qué es Coordinaciones Inclusión?",
    answer:
      "Es el equipo que apoya a estudiantes que requieren ajustes razonables y acompañamiento para su plena participación en la vida universitaria.",
  },
  {
    question: "¿Cómo solicito apoyos o ajustes razonables?",
    answer:
      "Agenda una cita con Coordinaciones Inclusión y describe tus necesidades. El equipo evaluará tu plan de apoyo y coordinará con tus docentes.",
  },
  {
    question: "¿Qué documentos debo presentar?",
    answer:
      "En caso de ser necesario, se solicitarán informes o certificados médicos/psicoeducativos vigentes que respalden tu requerimiento.",
  },
  {
    question: "¿Los apoyos aplican en todas mis asignaturas?",
    answer:
      "Sí. Se diseña un plan integral y se comunica a las cátedras pertinentes, pudiendo variar según la naturaleza de cada actividad.",
  },
  {
    question: "¿Cómo se resguardan mis datos personales y diagnósticos?",
    answer:
      "La información se maneja con estricta confidencialidad y se utiliza únicamente para gestionar apoyos educativos.",
  },
  {
    question: "¿Puedo pedir intérprete u otros recursos específicos?",
    answer:
      "Sí, según evaluación y disponibilidad institucional se pueden gestionar intérpretes, materiales accesibles u otras medidas.",
  },
];

export default function InclusionFAQ() {
  return (
    <section id="faq-inclusion" className="mb-5">
      <h3 className="mb-3" style={{ color: "#003366" }}>Coordinaciones Inclusión</h3>
      <div className="accordion">
        {faqsInclusion.map((faq, i) => (
          <AccordionItem
            key={i}
            question={faq.question}
            content={<p>{faq.answer}</p>}
          />
        ))}
      </div>
    </section>
  );
}
