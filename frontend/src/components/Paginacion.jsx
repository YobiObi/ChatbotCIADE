export default function Paginacion({ paginaActual, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;

  return (
    <nav className="d-flex justify-content-end mt-3">
      <ul className="pagination mb-0">
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <li key={num} className={`page-item ${num === paginaActual ? "active" : ""}`}>
            <button className="page-link" onClick={() => onCambiar(num)}>
              {num}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
