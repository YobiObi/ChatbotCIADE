import Banner from "../../components/BannerTitulo";
import GeneralFAQ from "./GeneralFAQ";
import InclusionFAQ from "./InclusionFAQ";

export default function FAQ() {
  return (
    <>
      <Banner title="Preguntas Frecuentes" />
      <main className="container my-5">
        <div className="mx-auto" style={{ maxWidth: "900px" }}>
          {/* Índice rápido (opcional) */}
          <div className="d-flex gap-2 mb-4">
            <a className="btn-institucional" href="#faq-generales">Ir a Generales</a>
            <a className="btn-institucional" href="#faq-inclusion">Ir a Inclusión</a>
          </div>

          <GeneralFAQ />
          <InclusionFAQ />
        </div>
      </main>
    </>
  );
}
