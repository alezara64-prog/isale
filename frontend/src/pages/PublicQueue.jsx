import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../config/api';
import ChatBox from '../components/ChatBox';
import PublicChat from '../components/PublicChat';
import './PublicQueue.css';

function PublicQueue() {
  const navigate = useNavigate();
  const location = useLocation();
  const [queue, setQueue] = useState([]);
  const [eventDate, setEventDate] = useState('');
  const [venueName, setVenueName] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [socialLinks, setSocialLinks] = useState({});
  const [socialIcons, setSocialIcons] = useState({});
  const [scrollingText, setScrollingText] = useState('');
  const [scrollingSpeed, setScrollingSpeed] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [singerName, setSingerName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tonality, setTonality] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [chatSingerName, setChatSingerName] = useState('');
  const [publicMessages, setPublicMessages] = useState([]);
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [eventStatus, setEventStatus] = useState({ isOpen: false });
  const [mainSingerName, setMainSingerName] = useState(''); // Nome del cantante principale
  const [showNameRegistration, setShowNameRegistration] = useState(false); // Mostra registrazione nome
  const [showSingerChoice, setShowSingerChoice] = useState(false); // Mostra scelta "Per me" / "Per..."
  const [otherSingerName, setOtherSingerName] = useState(''); // Nome per "Per..."
  const [selectedSongFromList, setSelectedSongFromList] = useState(null); // Canzone selezionata da SongList

  // Helper per ottenere l'URL corretto delle immagini
  const getImageUrl = (path) => {
    if (!path) return '';
    // Se è già un URL completo (Supabase), usalo direttamente
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Altrimenti usa l'API URL (dinamico, funziona sia in locale che in produzione)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return apiUrl + path;
  };

  // Carica il nome del cantante principale da localStorage all'avvio
  // MA solo se la coda non è vuota (altrimenti cancella i dati locali)
  useEffect(() => {
    const savedMainSinger = localStorage.getItem('mainSingerName');
    if (savedMainSinger) {
      // Controlla lo stato della coda prima di ripristinare il nome
      api.get('/api/queue').then(response => {
        const currentQueue = response.data.data;
        if (currentQueue.length === 0) {
          // Coda vuota = reset completo
          console.log('Coda vuota al caricamento - cancello mainSingerName da localStorage');
          localStorage.removeItem('mainSingerName');
          // Non impostiamo mainSingerName e chatSingerName
        } else {
          // Coda con elementi = ripristina il nome salvato
          setMainSingerName(savedMainSinger);
          setChatSingerName(savedMainSinger);
        }
      }).catch(err => {
        console.error('Errore nel controllo coda iniziale:', err);
        // In caso di errore, usa comunque il nome salvato
        setMainSingerName(savedMainSinger);
        setChatSingerName(savedMainSinger);
      });
    }
  }, []);

  // Pre-compila i campi se arrivano dati dalla SongList
  useEffect(() => {
    const { selectedArtist, selectedSong, currentSingerName } = location.state || {};

    if (!selectedArtist || !selectedSong) return;

    // Salva i dati della canzone selezionata
    setSelectedSongFromList({ artist: selectedArtist, song: selectedSong });

    // Imposta i campi artista e canzone
    setArtist(selectedArtist);
    setSongTitle(selectedSong);

    // Pulisci lo state per evitare ri-render
    navigate('/', { replace: true });

    // Leggi il mainSingerName da localStorage e sincronizza con lo stato React
    const savedMainSinger = localStorage.getItem('mainSingerName');
    if (savedMainSinger && !mainSingerName) {
      setMainSingerName(savedMainSinger);
      setChatSingerName(savedMainSinger);
    }

    // Reset di tutti i form
    setShowNameRegistration(false);
    setShowSingerChoice(false);
    setShowForm(false);

    // Quando si torna dalla SongList con una canzone selezionata:
    // - Se non c'è nome registrato → mostra registrazione nome
    // - Se c'è nome registrato → vai direttamente al form canzone
    if (!savedMainSinger) {
      // Mostra registrazione nome, i dati canzone sono già salvati in selectedSongFromList
      setShowNameRegistration(true);
    } else {
      // Usa il nome del cantante che era nel form (currentSingerName passato dalla SongList)
      // Se esiste e non è vuoto, usalo; altrimenti usa il nome principale
      const singerToUse = currentSingerName && currentSingerName.trim() !== '' ? currentSingerName : savedMainSinger;
      setSingerName(singerToUse);
      setShowForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Carica la coda all'avvio
  useEffect(() => {
    fetchQueue();
    fetchPublicMessages();
    fetchEventStatus();
    // Aggiorna ogni 5 secondi
    const interval = setInterval(() => {
      fetchQueue();
      fetchPublicMessages();
      fetchEventStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await api.get('/api/queue');
      const newQueue = response.data.data;

      // Se la coda viene svuotata completamente, cancella i dati locali e resetta tutto
      if (newQueue.length === 0 && queue.length > 0) {
        console.log('🗑️ Coda svuotata - resetto tutto alla schermata iniziale');
        localStorage.removeItem('mainSingerName');
        setMainSingerName('');
        setChatSingerName('');
        setShowSingerChoice(false);
        setShowForm(false);
        setOtherSingerName('');
      }

      setQueue(newQueue);
      setEventDate(response.data.eventDate || '');
      setVenueName(response.data.venueName || '');
      setLogoPath(response.data.logoPath || '');
      setSocialLinks(response.data.socialLinks || {});
      setSocialIcons(response.data.socialIcons || {});
      setScrollingText(response.data.scrollingText || '');
      setScrollingSpeed(response.data.scrollingSpeed || 20);
    } catch (err) {
      setError('Errore nel caricamento della coda');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicMessages = async () => {
    try {
      const response = await api.get('/api/public-chat');
      setPublicMessages(response.data.data);
    } catch (err) {
      console.error('Errore nel caricamento messaggi pubblici:', err);
    }
  };

  const fetchEventStatus = async () => {
    try {
      const response = await api.get('/api/event-status');
      setEventStatus(response.data.data);
    } catch (err) {
      console.error('Errore nel recupero dello stato della serata:', err);
    }
  };

  const openChatPopup = () => {
    setShowChatPopup(true);
    // Segna i messaggi come letti
    setLastReadMessageCount(publicMessages.length);
  };

  const closeChatPopup = () => {
    setShowChatPopup(false);
  };

  // Calcola se ci sono nuovi messaggi
  const hasNewMessages = publicMessages.length > lastReadMessageCount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validazione - TUTTI i campi obbligatori
    if (!singerName.trim() || !songTitle.trim() || !artist.trim()) {
      setError('Tutti i campi sono obbligatori');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post('/api/queue', {
        singerName: singerName.trim(),
        songTitle: songTitle.trim(),
        artist: artist.trim(),
        tonality: parseInt(tonality),
        comments: comments.trim(),
        requestedBy: mainSingerName // Aggiungi chi ha richiesto la canzone
      });

      const addedSingerName = singerName.trim();

      setSuccessMessage(`${addedSingerName}, sei in posizione ${response.data.data.position}!`);

      // Se non è ancora identificato per la chat, identificalo automaticamente
      if (!chatSingerName) {
        setChatSingerName(addedSingerName);
      }

      setSingerName('');
      setSongTitle('');
      setArtist('');
      setTonality(0);
      setComments('');
      setOtherSingerName('');

      // Chiudi il form e la scelta cantante
      setShowForm(false);
      setShowSingerChoice(false);

      // Ricarica la coda
      await fetchQueue();

      // Scrolla in alto alla pagina dopo un breve ritardo per dare tempo al rendering
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 300);

      // Nascondi il messaggio dopo 5 secondi
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante l\'aggiunta alla coda');
    } finally {
      setSubmitting(false);
    }
  };

  // Gestisce la registrazione del nome del cantante principale
  const handleMainSingerRegistration = () => {
    const trimmedName = singerName.trim();
    if (!trimmedName) {
      setError('Inserisci il tuo nome');
      return;
    }

    // Salva il nome del cantante principale
    setMainSingerName(trimmedName);
    setChatSingerName(trimmedName);
    localStorage.setItem('mainSingerName', trimmedName);

    // Chiudi la registrazione
    setShowNameRegistration(false);
    setError(null);

    // Se ci sono già dati canzone selezionata da SongList, vai direttamente al form
    if (selectedSongFromList) {
      setArtist(selectedSongFromList.artist);
      setSongTitle(selectedSongFromList.song);
      setSelectedSongFromList(null); // Reset dopo l'uso
      setSingerName(trimmedName);
      setShowForm(true);
    } else {
      // Altrimenti mostra la scelta cantante
      setSingerName(''); // Reset per usarlo nel form
      setShowSingerChoice(true);
    }
  };

  // Gestisce la scelta "Per me"
  const handleForMe = () => {
    // Verifica se il cantante principale ha già una canzone in coda
    const mainSingerInQueue = queue.find(
      item => item.singerName.toLowerCase() === mainSingerName.toLowerCase() && item.status !== 'completed'
    );

    if (mainSingerInQueue) {
      setError(`${mainSingerName} ha già una canzone in coda! Attendi il tuo turno prima di aggiungerne un'altra.`);
      return;
    }

    // Imposta il nome del cantante e mostra il form
    setSingerName(mainSingerName);
    setShowSingerChoice(false);
    setShowForm(true);
    setError(null);
  };

  // Gestisce la scelta "Per..."
  const handleForOther = () => {
    const trimmedOtherName = otherSingerName.trim();
    if (!trimmedOtherName) {
      setError('Inserisci il nome del cantante');
      return;
    }

    // Verifica se il cantante è già in coda
    const singerInQueue = queue.find(
      item => item.singerName.toLowerCase() === trimmedOtherName.toLowerCase() && item.status !== 'completed'
    );

    if (singerInQueue) {
      setError(`${trimmedOtherName} ha già una canzone in coda! Attendi il suo turno prima di aggiungerne un'altra.`);
      return;
    }

    // Imposta il nome del cantante e mostra il form
    setSingerName(trimmedOtherName);
    setShowSingerChoice(false);
    setShowForm(true);
    setOtherSingerName('');
    setError(null);
  };

  // Gestisce il click sul pulsante "Aggiungi la tua canzone"
  const handleAddSongClick = () => {
    if (!eventStatus.isOpen) return;

    // Se non ha ancora registrato il nome, mostra la registrazione
    if (!mainSingerName) {
      setShowNameRegistration(true);
    } else {
      // Altrimenti mostra la scelta cantante
      setShowSingerChoice(true);
    }
  };

  const getCurrentSinger = () => {
    return queue.find(item => item.status === 'singing');
  };

  const getWaitingQueue = () => {
    return queue.filter(item => item.status === 'waiting');
  };

  const getCompletedQueue = () => {
    return queue.filter(item => item.status === 'completed');
  };

  // Ottieni tutti i nomi del cantante corrente nella coda
  const getUserSingerNames = () => {
    if (!chatSingerName) return [];

    // Trova tutti i nomi unici dell'utente nella coda
    const userNames = new Set();
    queue.forEach(item => {
      if (item.singerName.toLowerCase() === chatSingerName.toLowerCase()) {
        userNames.add(item.singerName);
      }
    });

    return Array.from(userNames);
  };

  const currentSinger = getCurrentSinger();
  const waitingQueue = getWaitingQueue();
  const completedQueue = getCompletedQueue();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('it-IT', options);
  };

  return (
    <div className="public-queue-container">
      <header className="header">
        <div className="header-content">
          {logoPath && (
            <div className="header-logo">
              <img src={getImageUrl(logoPath)} alt="Logo" />
            </div>
          )}
          <div className="header-text">
            <div className="social-icons">
              {socialLinks.whatsapp && (
                <a href={`https://wa.me/${socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp">
                  {socialIcons.whatsapp ? (
                    <img src={getImageUrl(socialIcons.whatsapp)} alt="WhatsApp" className="social-icon-img" />
                  ) : (
                    '📱'
                  )}
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook">
                  {socialIcons.facebook ? (
                    <img src={getImageUrl(socialIcons.facebook)} alt="Facebook" className="social-icon-img" />
                  ) : (
                    '📘'
                  )}
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">
                  {socialIcons.instagram ? (
                    <img src={getImageUrl(socialIcons.instagram)} alt="Instagram" className="social-icon-img" />
                  ) : (
                    '📷'
                  )}
                </a>
              )}
              {socialLinks.phone && (
                <a href={`tel:${socialLinks.phone}`} className="social-icon" title="Telefono">
                  {socialIcons.phone ? (
                    <img src={getImageUrl(socialIcons.phone)} alt="Telefono" className="social-icon-img" />
                  ) : (
                    '☎️'
                  )}
                </a>
              )}
            </div>
            <h1>
              <a href="/admin/dashboard" className="admin-icon-link" title="Area Admin">🎤</a>
              {' '}Serata Karaoke
            </h1>
            <h1 className="venue-name">{venueName || 'Locale non specificato'}</h1>
            <p className="event-date">{eventDate ? formatDate(eventDate) : 'Data non impostata'}</p>
          </div>
        </div>
      </header>

      {/* Barra testo scorrevole */}
      {scrollingText && (
        <div className="scrolling-text-container">
          <div
            className="scrolling-text"
            style={{ animationDuration: `${scrollingSpeed}s` }}
          >
            <span>{scrollingText}</span>
            <span>{scrollingText}</span>
            <span>{scrollingText}</span>
          </div>
        </div>
      )}

      {/* Pulsanti per aprire il form e andare alla chat */}
      {!showForm && !showNameRegistration && !showSingerChoice && (
        <div className="add-song-button-container">
          <button
            onClick={handleAddSongClick}
            className={`btn-add-song ${!eventStatus.isOpen ? 'disabled' : ''}`}
            disabled={!eventStatus.isOpen}
          >
            {eventStatus.isOpen ? '🎵 Aggiungi la tua canzone' : '⏸️ Attendi Inizio Serata'}
          </button>
        </div>
      )}

      {/* Registrazione Nome Cantante Principale - Solo al primo accesso */}
      {showNameRegistration && (
        <section className="add-section">
          <div className="name-registration-box">
            <h3>Inserisci il tuo nome</h3>
            <p>Questo nome verrà usato per la chat pubblica e per richiedere canzoni.</p>
            <div className="form-group">
              <input
                type="text"
                value={singerName}
                onChange={(e) => setSingerName(e.target.value)}
                placeholder="Il tuo nome"
                maxLength="50"
                onKeyPress={(e) => e.key === 'Enter' && handleMainSingerRegistration()}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowNameRegistration(false);
                  setSingerName('');
                  setError(null);
                }}
              >
                Annulla
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={handleMainSingerRegistration}
              >
                Conferma
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Scelta "Per me" o "Per..." */}
      {showSingerChoice && (
        <section className="add-section">
          <div className="singer-choice-box">
            <h3>Per chi vuoi richiedere la canzone?</h3>
            <div className="choice-buttons">
              <button
                type="button"
                className="btn-for-me"
                onClick={handleForMe}
              >
                {mainSingerName}
              </button>
              <span className="or-label">o per:</span>
              <input
                type="text"
                value={otherSingerName}
                onChange={(e) => setOtherSingerName(e.target.value)}
                placeholder="Nome cantante"
                maxLength="50"
                className="for-other-input"
                onKeyPress={(e) => e.key === 'Enter' && handleForOther()}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="action-buttons">
              <button
                type="button"
                className="btn-for-other"
                onClick={handleForOther}
              >
                Conferma
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowSingerChoice(false);
                  setOtherSingerName('');
                  setError(null);
                }}
              >
                Annulla
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Pulsante Chat Pubblica */}
      {!showForm && !showNameRegistration && !showSingerChoice && (
        <div className="chat-button-container">
          <button
            onClick={openChatPopup}
            className={`btn-goto-chat ${hasNewMessages ? 'has-new-messages' : ''}`}
          >
            {hasNewMessages
              ? `💬 Nuovi messaggi (${publicMessages.length - lastReadMessageCount})`
              : '💬 Chat Pubblica'
            }
          </button>
        </div>
      )}

      {/* Form per aggiungersi alla coda */}
      {showForm && (
        <section className="add-section">
        <form onSubmit={handleSubmit} className="add-form">
          <div className="form-group">
            <label htmlFor="singerName">Il tuo nome:</label>
            <input
              type="text"
              id="singerName"
              value={singerName}
              onChange={(e) => setSingerName(e.target.value)}
              placeholder="Es: Mario Rossi"
              maxLength="50"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="artist">Interprete:</label>
            <input
              type="text"
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Es: Domenico Modugno"
              maxLength="50"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="songTitle">Titolo canzone:</label>
            <input
              type="text"
              id="songTitle"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="Es: Volare"
              maxLength="100"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group search-button-container">
            <button
              type="button"
              className="btn-search-song"
              onClick={() => {
                // Passa il nome del cantante corrente alla SongList tramite state
                navigate('/canzoni', { state: { currentSingerName: singerName } });
              }}
              disabled={submitting}
            >
              🔍 Cerca Interprete o Titolo canzone
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="tonality">
              Tonalità: <strong>{tonality > 0 ? `+${tonality}` : tonality}</strong>
            </label>
            <select
              id="tonality"
              value={tonality}
              onChange={(e) => setTonality(parseInt(e.target.value))}
              disabled={submitting}
              required
            >
              <option value="-6">-6 (molto più basso)</option>
              <option value="-5">-5</option>
              <option value="-4">-4</option>
              <option value="-3">-3</option>
              <option value="-2">-2</option>
              <option value="-1">-1</option>
              <option value="0">0 (originale)</option>
              <option value="1">+1</option>
              <option value="2">+2</option>
              <option value="3">+3</option>
              <option value="4">+4</option>
              <option value="5">+5</option>
              <option value="6">+6 (molto più alto)</option>
            </select>
            <small className="helper-text">0 = tonalità originale, - più basso, + più alto</small>
          </div>


          <div className="form-group">
            <label htmlFor="comments">Commenti (facoltativo):</label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Es: Note particolari, richieste speciali..."
              maxLength="200"
              disabled={submitting}
              rows="3"
            />
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setShowForm(false);
                setSingerName('');
                setSongTitle('');
                setArtist('');
                setTonality(0);
                setComments('');
                setOtherSingerName('');
                setError(null);
              }}
            >
              Annulla
            </button>
            <button type="submit" disabled={submitting} className="btn-submit">
              {submitting ? 'Aggiunta in corso...' : 'Aggiungi alla Coda'}
            </button>
          </div>
        </form>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}
      </section>
      )}

      {/* Cantante attuale */}
      {currentSinger && (
        <section className="current-singer">
          <h2>🎵 Sta cantando ora:</h2>
          <div className="singer-card current">
            <div className="song-line-current">
              <span className="singer-name-current">{currentSinger.singerName}</span>
              <span className="separator"> canta </span>
              <span className="song-title-current">{currentSinger.songTitle}</span>
              <span className="separator"> di </span>
              <span className="artist-name">{currentSinger.artist}</span>
            </div>
          </div>
        </section>
      )}

      {/* Coda */}
      <section className="queue-section">
        <h2>📋 Prossimi in Coda ({waitingQueue.length})</h2>

        {loading && <p>Caricamento...</p>}

        {!loading && waitingQueue.length === 0 && (
          <p className="empty-message">La coda è vuota! Sii il primo ad aggiungerti!</p>
        )}

        {!loading && waitingQueue.length > 0 && (
          <div className="queue-list">
            {waitingQueue.map((item, index) => (
              <div key={item.id} className="queue-item">
                <div className="position">{index + 1}</div>
                <div className="info">
                  <div className="song-line">
                    <span className="singer-name">{item.singerName}</span>
                    <span className="separator"> canta </span>
                    <span className="song-title">{item.songTitle}</span>
                    <span className="separator"> di </span>
                    <span className="artist-name">{item.artist}</span>
                  </div>
                </div>
                <div className="chat-container">
                  <ChatBox
                    queueId={item.id}
                    queueEntry={item}
                    userType="singer"
                    isAdmin={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Canzoni Completate */}
      {!loading && completedQueue.length > 0 && (
        <section className="queue-section completed-section">
          <h2>✅ Canzoni Eseguite ({completedQueue.length})</h2>
          <div className="queue-list">
            {completedQueue.map((item, index) => (
              <div key={item.id} className="queue-item completed-item">
                <div className="position completed-position">{index + 1}</div>
                <div className="info">
                  <div className="song-line">
                    <span className="singer-name">{item.singerName}</span>
                    <span className="separator"> canta </span>
                    <span className="song-title">{item.songTitle}</span>
                    <span className="separator"> di </span>
                    <span className="artist-name">{item.artist}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chat Pubblica - Modal Popup */}
      {showChatPopup && (
        <div className="chat-modal-overlay" onClick={closeChatPopup}>
          <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h2>💬 Chat Pubblica</h2>
              <button className="chat-modal-close" onClick={closeChatPopup}>✕</button>
            </div>

            {!mainSingerName && (
              <div className="chat-identification">
                <p>Aggiungi prima una canzone alla coda per accedere alla chat pubblica!</p>
              </div>
            )}

            {mainSingerName && (
              <>
                <div className="chat-user-info">
                  <div>
                    Stai chattando come: <strong>{mainSingerName}</strong>
                  </div>
                </div>
                <PublicChat
                  senderName={mainSingerName}
                  isAdmin={false}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicQueue;

