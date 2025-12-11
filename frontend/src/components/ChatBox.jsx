import { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import './ChatBox.css';

function ChatBox({ queueId, queueEntry, userType = 'singer', isAdmin = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Auto-scroll ai nuovi messaggi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carica messaggi e conta i non letti
  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/chat/${queueId}`);
      setMessages(response.data.data.messages);

      // Conta messaggi non letti
      const unread = response.data.data.messages.filter(
        msg => msg.sender !== userType && !msg.read
      ).length;
      setUnreadCount(unread);

      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento messaggi:', err);
      if (err.response?.status !== 404) {
        setError('Errore nel caricamento della chat');
      }
    }
  };

  // Segna messaggi come letti quando si apre la chat
  const markAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await api.put(`/api/chat/${queueId}/read`, { sender: userType });
      setUnreadCount(0);
    } catch (err) {
      console.error('Errore nel segnare messaggi come letti:', err);
    }
  };

  // Invia messaggio
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    if (newMessage.length > 500) {
      setError('Il messaggio non può superare i 500 caratteri');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/api/chat/${queueId}`, {
        sender: userType,
        message: newMessage.trim()
      });

      setNewMessage('');
      await fetchMessages();
      scrollToBottom();
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nell\'invio del messaggio');
    } finally {
      setLoading(false);
    }
  };

  // Toggle apertura chat
  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      markAsRead();
      setTimeout(scrollToBottom, 100);
    }
  };

  // Polling messaggi - più frequente quando aperto
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000); // 2 secondi quando aperto
      return () => clearInterval(interval);
    } else {
      // Anche quando chiuso, controlla i messaggi non letti
      const interval = setInterval(fetchMessages, 5000); // 5 secondi quando chiuso
      return () => clearInterval(interval);
    }
  }, [queueId, isOpen]);

  // Scroll automatico quando arrivano nuovi messaggi
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div className="chatbox-container" ref={chatBoxRef}>
      {/* Toggle button */}
      <button
        className={`chat-toggle-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={toggleChat}
        title={isAdmin ? `Chat con ${queueEntry?.singerName}` : 'Chat privata'}
      >
        💬{!isAdmin && ` Chat`}
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <strong>💬 Chat</strong>
              {queueEntry && (
                <small>{queueEntry.singerName} - {queueEntry.songTitle}</small>
              )}
            </div>
            <button className="close-btn" onClick={toggleChat}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                <p>Nessun messaggio ancora.</p>
                <p><small>Scrivi qualcosa per iniziare!</small></p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender === userType ? 'own-message' : 'other-message'}`}
              >
                <div className="message-sender">
                  {msg.sender === 'admin' ? '🔒 Admin' : '🎤 Cantante'}
                </div>
                <div className="message-text">{msg.message}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="chat-error">{error}</div>
          )}

          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              maxLength="500"
              disabled={loading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="send-btn"
            >
              {loading ? '...' : '➤'}
            </button>
          </form>
          <div className="char-counter">
            {newMessage.length}/500
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
