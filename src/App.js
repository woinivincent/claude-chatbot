// Archivo: App.jsx
import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Efecto para hacer scroll automático al recibir nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Función para enviar mensaje a través del backend
  const sendMessage = async () => {
    if (input.trim() === '') return;
    
    // Añadir mensaje del usuario al chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Preparar el historial de mensajes para enviar
      const messageHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Llamada a nuestro servidor backend
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messageHistory
        })
      });
      
      const data = await response.json();
      
      // Añadir respuesta de Claude al chat
      if (data.content && data.content.length > 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content[0].text
        }]);
      }
    } catch (error) {
      console.error('Error al comunicarse con el servidor:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.'
      }]);
    }
    
    setIsLoading(false);
  };

  // Función para manejar la tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Chatbot con Claude</h1>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>¡Hola! Soy un chatbot impulsado por Claude. ¿En qué puedo ayudarte hoy?</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows="1"
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || input.trim() === ''}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default App;