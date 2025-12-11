import { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import './PublicChat.css';

function PublicChat({ senderName, isAdmin = false, onMessagesUpdate }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bannedUsers, setBannedUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  // Auto-scroll ai nuovi messaggi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carica messaggi
  const fetchMessages = async () => {
    try {
      const response = await api.get('/api/public-chat');
      setMessages(response.data.data);
      setError(null);

      // Notifica il parent component del conteggio messaggi
      if (onMessagesUpdate) {
        onMessagesUpdate(response.data.data.length);
      }
    } catch (err) {
      console.error('Errore nel caricamento messaggi pubblici:', err);
      setError('Errore nel caricamento della chat');
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
      await api.post('/api/public-chat', {
        senderName: senderName,
        senderType: isAdmin ? 'admin' : 'singer',
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

  // Cancella messaggio (solo admin)
  const deleteMessage = async (messageId) => {
    if (!isAdmin) return;

    if (!window.confirm('Vuoi cancellare questo messaggio?')) return;

    try {
      await api.delete(`/api/public-chat/${messageId}`);
      await fetchMessages();
    } catch (err) {
      console.error('Errore nella cancellazione del messaggio:', err);
      setError('Errore nella cancellazione del messaggio');
    }
  };

  // Carica lista utenti bannati (solo admin)
  const fetchBannedUsers = async () => {
    if (!isAdmin) return;

    try {
      const response = await api.get('/api/public-chat/banned');
      setBannedUsers(response.data.data);
    } catch (err) {
      console.error('Errore nel caricamento utenti bannati:', err);
    }
  };

  // Banna utente (solo admin)
  const banUser = async (userName) => {
    if (!isAdmin) return;

    if (!window.confirm(`Vuoi bannare ${userName} dalla chat pubblica?`)) return;

    try {
      await api.post('/api/public-chat/ban', { userName });
      await fetchBannedUsers();
      setError(null);
    } catch (err) {
      console.error('Errore nel bannare utente:', err);
      setError(err.response?.data?.error || 'Errore nel bannare utente');
    }
  };

  // Rimuovi ban utente (solo admin)
  const unbanUser = async (userName) => {
    if (!isAdmin) return;

    if (!window.confirm(`Vuoi rimuovere il ban da ${userName}?`)) return;

    try {
      await api.post('/api/public-chat/unban', { userName });
      await fetchBannedUsers();
      setError(null);
    } catch (err) {
      console.error('Errore nel rimuovere ban:', err);
      setError(err.response?.data?.error || 'Errore nel rimuovere ban');
    }
  };

  // Carica messaggi all'avvio e ogni 3 secondi
  useEffect(() => {
    fetchMessages();
    if (isAdmin) {
      fetchBannedUsers();
    }
    const interval = setInterval(() => {
      fetchMessages();
      if (isAdmin) {
        fetchBannedUsers();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Scroll automatico SOLO quando arrivano nuovi messaggi (non al caricamento iniziale)
  useEffect(() => {
    // Scrolla solo se ci sono più messaggi di prima (nuovo messaggio aggiunto)
    if (messages.length > prevMessagesLengthRef.current && prevMessagesLengthRef.current > 0) {
      scrollToBottom();
    }
    // Aggiorna il riferimento alla lunghezza precedente
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Formatta timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="public-chat-container">
      <div className="public-chat-header">
        <span className="public-chat-icon">💬</span>
        <h3>Chat Pubblica</h3>
        <span className="public-chat-subtitle">Tutti i cantanti e l'admin</span>
      </div>

      <div className="public-chat-messages">
        {messages.length === 0 && (
          <div className="public-chat-empty">
            Nessun messaggio ancora. Inizia la conversazione!
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`public-chat-message ${
              msg.senderType === 'admin' ? 'admin-message' : 'singer-message'
            }`}
          >
            <div className="message-header">
              <span className="message-sender">
                {msg.senderType === 'admin' ? '👑 ' : '🎤 '}
                {msg.senderName}
              </span>
              <div className="message-header-right">
                <span className="message-time">{formatTime(msg.timestamp)}</span>
                {isAdmin && msg.senderType !== 'admin' && (
                  <>
                    {bannedUsers.includes(msg.senderName.toLowerCase()) ? (
                      <button
                        onClick={() => unbanUser(msg.senderName)}
                        className="btn-unban-user"
                        title="Rimuovi ban"
                      >
                        ✅
                      </button>
                    ) : (
                      <button
                        onClick={() => banUser(msg.senderName)}
                        className="btn-ban-user"
                        title="Banna utente"
                      >
                        🚫
                      </button>
                    )}
                  </>
                )}
                {isAdmin && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="btn-delete-message"
                    title="Cancella messaggio"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            <div className="message-text">{msg.message}</div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="public-chat-form">
        {error && <div className="public-chat-error">{error}</div>}

        <div className="public-chat-input-group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            disabled={loading}
            maxLength="500"
            className="public-chat-input"
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="public-chat-send-btn"
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>

        <div className="public-chat-char-count">
          {newMessage.length}/500
        </div>
      </form>
    </div>
  );
}

export default PublicChat;
