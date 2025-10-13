import { useState } from 'react';
import './ChatBot.css';

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickReplies = [
    '¿Qué cursos ofrecen?',
    '¿Cómo puedo pagar?',
    'Información de contacto',
    'Ayuda con mi cuenta',
  ];

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes('curso') || message.includes('ofrecen')) {
      return 'Ofrecemos cursos en Programación, Diseño, Negocios, Marketing y Desarrollo Personal. Todos nuestros cursos incluyen acceso de por vida, certificados y soporte personalizado.';
    }

    if (message.includes('pagar') || message.includes('pago') || message.includes('precio')) {
      return 'Aceptamos múltiples métodos de pago: Tigo Money (+591 76082372), transferencia bancaria, código QR y tarjeta de crédito/débito. Una vez realizado el pago, envía el comprobante a josemanuelloayzavaca7@gmail.com';
    }

    if (message.includes('contacto') || message.includes('soporte') || message.includes('ayuda')) {
      return 'Puedes contactarnos por:\n- WhatsApp: +591 76082372\n- Email: josemanuelloayzavaca7@gmail.com\n- Teléfono: +591 76082372\n\nEstamos disponibles para ayudarte.';
    }

    if (message.includes('cuenta') || message.includes('login') || message.includes('registr')) {
      return 'Para crear una cuenta, haz clic en "Iniciar Sesión" en la parte superior. Puedes registrarte con tu correo electrónico y comenzar a explorar nuestros cursos inmediatamente.';
    }

    if (message.includes('certificado')) {
      return 'Sí, todos nuestros cursos incluyen un certificado de finalización que puedes descargar y compartir en LinkedIn una vez completes el curso.';
    }

    if (message.includes('gracias') || message.includes('thank')) {
      return 'De nada. Estoy aquí para ayudarte en lo que necesites.';
    }

    if (message.includes('hola') || message.includes('hi') || message.includes('hello')) {
      return 'Hola, bienvenido a Academia Online. ¿En qué puedo ayudarte?';
    }

    return 'Gracias por tu pregunta. Para asistencia personalizada, puedes contactarnos directamente:\n- WhatsApp: +591 76082372\n- Email: josemanuelloayzavaca7@gmail.com';
  };

  const handleSendMessage = (messageText = inputValue) => {
    if (!messageText.trim()) return;

    setMessages([...messages, { type: 'user', text: messageText }]);
    setInputValue('');

    setTimeout(() => {
      const botResponse = getBotResponse(messageText);
      setMessages((prev) => [...prev, { type: 'bot', text: botResponse }]);
    }, 500);
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  return (
    <>
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Asistente Virtual</h3>
            <span className="chatbot-status">En línea</span>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.type === 'bot' && <div className="avatar">🤖</div>}
                <div className="message-bubble">{message.text}</div>
                {message.type === 'user' && <div className="avatar">👤</div>}
              </div>
            ))}
          </div>

          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe tu mensaje..."
            />
            <button onClick={() => handleSendMessage()}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
