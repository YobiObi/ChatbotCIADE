import { useEffect } from 'react';

const DialogflowMessenger = () => {
  useEffect(() => {
    // Evitar carga duplicada
    if (document.getElementById('chatbot-ciade')) return;

    // Cargar script solo una vez
    if (!document.querySelector('script[src*="dialogflow-console"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
      script.async = true;
      document.body.appendChild(script);
    }

    // Crear el widget
    const dfMessenger = document.createElement('df-messenger');
    dfMessenger.setAttribute('intent', 'WELCOME');
    dfMessenger.setAttribute('chat-title', 'Chatbot CIADE');
    dfMessenger.setAttribute('agent-id', 'a6b5cbca-522c-4c20-9735-7e6eafa62cb0');
    dfMessenger.setAttribute('language-code', 'es');
    dfMessenger.setAttribute('id', 'chatbot-ciade');
    dfMessenger.style.display = 'none';
    document.body.appendChild(dfMessenger);

    // Cerrar al hacer clic fuera
    const handleClickOutside = (e) => {
      const bot = document.getElementById('chatbot-ciade');
      if (bot && bot.style.display === 'block') {
        const isInside = bot.contains(e.target);
        if (!isInside) {
          bot.style.display = 'none';
        }
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return null;
};

export default DialogflowMessenger;
