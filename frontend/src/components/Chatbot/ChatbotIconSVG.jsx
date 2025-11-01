// ChatbotIconSVG.jsx
const ChatbotIconSVG = () => {
  const handleClick = () => {
    const bot = document.getElementById("chatbot-ciade");
    if (bot) {
      // toggle
      bot.style.display = bot.style.display === "none" ? "block" : "none";
    }
  };

  return (
    <div
      id="chatbot-toggle"
      className="position-fixed bottom-0 end-0 m-4 d-flex justify-content-center align-items-center shadow"
      style={{
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#003366",
        cursor: "pointer",
        zIndex: 1000,
      }}
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width="40"
        height="40"
      >
        <circle cx="50" cy="50" r="48" fill="#003366" />
        <rect x="30" y="30" width="40" height="30" rx="6" fill="#ffffff" />
        <circle cx="40" cy="45" r="4" fill="#003366" />
        <circle cx="60" cy="45" r="4" fill="#003366" />
        <line x1="38" y1="30" x2="35" y2="20" stroke="#ffffff" strokeWidth="3" />
        <line x1="62" y1="30" x2="65" y2="20" stroke="#ffffff" strokeWidth="3" />
        <circle cx="35" cy="20" r="3" fill="#ffffff" />
        <circle cx="65" cy="20" r="3" fill="#ffffff" />
      </svg>
    </div>
  );
};

export default ChatbotIconSVG;
