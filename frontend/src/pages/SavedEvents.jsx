import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './SavedEvents.css';

function SavedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  const fetchSavedEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/saved-events', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEvents(response.data.data);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento delle serate salvate');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questa serata?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/saved-events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccessMessage('Serata eliminata con successo!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchSavedEvents();
    } catch (err) {
      setError('Errore nell\'eliminazione della serata');
      console.error(err);
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="saved-events-container">
      <header className="saved-events-header">
        <button onClick={() => navigate('/admin')} className="btn-back">
          ← Torna alla Dashboard
        </button>
        <h1>📚 Serate Salvate</h1>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      {loading && <p className="loading-message">Caricamento...</p>}

      {!loading && events.length === 0 && (
        <div className="empty-state">
          <p>📭 Nessuna serata salvata</p>
          <p className="empty-subtitle">Le serate salvate appariranno qui</p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <div className="event-date-badge">
                  📅 {formatDate(event.eventDate)}
                </div>
                <div className="event-id">ID: {event.id}</div>
              </div>
              <div className="event-card-body">
                <h3 className="event-venue">🏠 {event.venueName}</h3>
                <div className="event-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🎵</span>
                    <span className="stat-value">{event.totalSongs}</span>
                    <span className="stat-label">canzoni</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">💾</span>
                    <span className="stat-value">{formatDateTime(event.savedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="event-card-actions">
                <button
                  onClick={() => handleViewDetails(event)}
                  className="btn-view-details"
                  title="Visualizza dettagli"
                >
                  👁️ Dettagli
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="btn-delete-event"
                  title="Elimina serata"
                >
                  🗑️ Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dettagli Serata */}
      {showDetailModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content event-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Dettagli Serata</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Informazioni Generali</h3>
                <div className="detail-row">
                  <span className="detail-label">📅 Data Evento:</span>
                  <span className="detail-value">{formatDate(selectedEvent.eventDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🏠 Nome Locale:</span>
                  <span className="detail-value">{selectedEvent.venueName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">💾 Salvata il:</span>
                  <span className="detail-value">{formatDateTime(selectedEvent.savedAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🎵 Totale Canzoni:</span>
                  <span className="detail-value">{selectedEvent.totalSongs}</span>
                </div>
              </div>

              {selectedEvent.queue && selectedEvent.queue.length > 0 && (
                <div className="detail-section">
                  <h3>Canzoni Eseguite</h3>
                  <div className="songs-list">
                    {selectedEvent.queue.map((song, index) => (
                      <div key={song.id || index} className="song-item">
                        <div className="song-number">{index + 1}</div>
                        <div className="song-info">
                          <div className="song-title">
                            <span className="singer-name">{song.singerName}</span>
                            <span className="separator"> - </span>
                            <span className="song-name">{song.songTitle}</span>
                          </div>
                          <div className="song-artist">
                            🎤 {song.artist} | Tonalità: {song.tonality > 0 ? `+${song.tonality}` : song.tonality}
                          </div>
                          {song.comments && (
                            <div className="song-comments">💬 {song.comments}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={() => setShowDetailModal(false)}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedEvents;
