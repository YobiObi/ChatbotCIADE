export default function Paginacion({ paginaActual, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;

  const go = (n) => onCambiar(Math.min(Math.max(1, n), totalPaginas));

  return (
    <nav className="d-flex justify-content-end mt-3">
      <ul className="pagination mb-0">
        <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(paginaActual - 1)}>
            «
          </button>
        </li>

        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <li key={num} className={`page-item ${num === paginaActual ? "active" : ""}`}>
            <button className="page-link" onClick={() => onCambiar(num)}>
              {num}
            </button>
          </li>
        ))}

        <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(paginaActual + 1)}>
            »
          </button>
        </li>
      </ul>
    </nav>
  );
}
