// DialogflowMessenger.jsx
import { useEffect } from "react";

const DialogflowMessenger = () => {
  useEffect(() => {
    // si ya existe, no lo vuelvas a crear
    if (document.getElementById("chatbot-ciade")) return;

    // cargar script solo una vez
    if (!document.querySelector('script[src*="dialogflow-console"]')) {
      const script = document.createElement("script");
      script.src =
        "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
      script.async = true;
      document.body.appendChild(script);
    }

    // crear el widget
    const dfMessenger = document.createElement("df-messenger");
    dfMessenger.setAttribute("intent", "WELCOME");
    dfMessenger.setAttribute("chat-title", "Chatbot CIADE");
    dfMessenger.setAttribute("agent-id", "a6b5cbca-522c-4c20-9735-7e6eafa62cb0");
    dfMessenger.setAttribute("language-code", "es");
    dfMessenger.setAttribute("id", "chatbot-ciade");

    // que se muestre ya expandido cuando esté visible
    dfMessenger.setAttribute("expand", "true");

    dfMessenger.style.display = "none";
    dfMessenger.style.zIndex = "999";
    document.body.appendChild(dfMessenger);

    // 👇 NUEVO: ocultar el launcher/burbuja por defecto de Dialogflow
    const hideDefaultLauncher = () => {
      try {
        const df = document.querySelector("df-messenger");
        if (!df || !df.shadowRoot) return;

        // En la mayoría de implementaciones el botón tiene id="widgetIcon"
        const dfIcon = df.shadowRoot.querySelector("#widgetIcon");
        if (dfIcon) {
          dfIcon.style.display = "none";         // lo ocultamos
          // alternativamente:
          // dfIcon.style.pointerEvents = "none"; // solo desactivar clics
        }
      } catch (err) {
        console.error("No se pudo ocultar el launcher de Dialogflow:", err);
      }
    };

    // cuando el messenger termine de cargar, escondemos el icono original
    dfMessenger.addEventListener("df-messenger-loaded", hideDefaultLauncher);

    // cerrar al hacer clic fuera, pero NO cuando hago clic en el botón o en el bot
    const handleClickOutside = (e) => {
      const bot = document.getElementById("chatbot-ciade");
      const toggle = document.getElementById("chatbot-toggle");

      if (!bot) return;

      const isBot = bot.contains(e.target);
      const isToggle = toggle && toggle.contains(e.target);

      // si hice clic en el bot o en el botón -> no cierres
      if (isBot || isToggle) return;

      // si está abierto y hago clic afuera -> cierra
      if (bot.style.display === "block") {
        bot.style.display = "none";
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      dfMessenger.removeEventListener("df-messenger-loaded", hideDefaultLauncher);
    };
  }, []);

  return null;
};

export default DialogflowMessenger;
