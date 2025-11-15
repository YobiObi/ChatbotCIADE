// ChatbotIconSVG.jsx
const ChatbotIconSVG = () => {
  const handleClick = (e) => {
    // Evita que este click se considere "click afuera"
    e.stopPropagation();

    const bot = document.getElementById("chatbot-ciade");
    if (!bot) return;

    const isHidden = bot.style.display === "none" || bot.style.display === "";
    bot.style.display = isHidden ? "block" : "none";
  };

  return (
    <div
      id="chatbot-toggle"
      className="position-fixed bottom-0 end-0 m-4 d-flex justify-content-center align-items-center"
      style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        cursor: "pointer",
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
        backgroundColor: "transparent",
      }}
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        width="72"
        height="72"
        // Para que todos los clicks caigan en el div padre
        style={{ pointerEvents: "none" }}
      >
        {/* Círculo exterior (borde suave) */}
        <circle cx="60" cy="60" r="58" fill="#f2f4f7" />

        {/* Círculo interior azul */}
        <circle cx="60" cy="60" r="45" fill="#003366" />

        {/* Cuerpo de robot */}
        <rect x="35" y="48" width="50" height="35" rx="10" fill="#ffffff" />
        <circle cx="50" cy="66" r="5" fill="#003366" />
        <circle cx="70" cy="66" r="5" fill="#003366" />

        {/* Antenas */}
        <line
          x1="47"
          y1="48"
          x2="42"
          y2="32"
          stroke="#ffffff"
          strokeWidth="4"
        />
        <line
          x1="73"
          y1="48"
          x2="78"
          y2="32"
          stroke="#ffffff"
          strokeWidth="4"
        />
        <circle cx="42" cy="32" r="5" fill="#ffffff" />
        <circle cx="78" cy="32" r="5" fill="#ffffff" />
      </svg>
    </div>
  );
};

export default ChatbotIconSVG;
