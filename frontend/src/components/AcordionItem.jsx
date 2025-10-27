import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function AccordionItem({ question, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card mb-3">
      <div className={`card-header ${open ? "bg-primary text-white" : ""}`}>
        <button
          className={`btn btn-link d-flex justify-content-between align-items-center w-100 text-decoration-none ${
            open ? "text-white" : "text-dark"
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="fw-semibold">{question}</span>
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className={`collapse ${open ? "show" : ""}`}>
        <div className="card-body text-secondary">{content}</div>
      </div>
    </div>
  );
}
