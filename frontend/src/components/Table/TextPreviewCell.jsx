// src/components/Table/TextPreviewCell.jsx
export default function TextPreviewCell({
  text = "",
  label = "Detalle",
  max = 120,      // truncado por caracteres (respaldo JS)
  onOpen
}) {
  const truncated = (() => {
    if (!text) return "—";
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
  })();

  const handleClick = () => {
    if (text && onOpen) onOpen(label, text);
  };

  return (
    <span
      className="truncate-1"
      style={{
        display: "block",
        width: "100%",       // <- toma el ancho del <td>
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: text ? "pointer" : "default",
      }}
      title={text ? "Haz clic para ver completo" : undefined}
      onClick={handleClick}
    >
      {truncated}
    </span>
  );
}
