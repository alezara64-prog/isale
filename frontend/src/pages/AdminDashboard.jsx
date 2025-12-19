import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import ChatBox from '../components/ChatBox';
import PublicChat from '../components/PublicChat';
import SocialIconsManager from '../components/SocialIconsManager';
import './AdminDashboard.css';

function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [eventDate, setEventDate] = useState('');
  const [venueName, setVenueName] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [socialIcons, setSocialIcons] = useState({});
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
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [phoneLink, setPhoneLink] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editFacebook, setEditFacebook] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [scrollingText, setScrollingText] = useState('');
  const [editScrollingText, setEditScrollingText] = useState('');
  const [scrollingSpeed, setScrollingSpeed] = useState(20);
  const [publicMessagesCount, setPublicMessagesCount] = useState(0);
  const [lastReadMessagesCount, setLastReadMessagesCount] = useState(0);
  const [publicPassword, setPublicPassword] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [showPasswordChangePrompt, setShowPasswordChangePrompt] = useState(false);
  const [eventStatus, setEventStatus] = useState({ isOpen: false });
  const [showSidebar, setShowSidebar] = useState(false);

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

  // Carica la coda e la password all'avvio
  useEffect(() => {
    fetchQueue();
    fetchPublicPassword();
    fetchEventStatus();
    // Mostra il prompt per cambiare password solo al primo accesso
    const hasSeenPasswordPrompt = localStorage.getItem('hasSeenPasswordPrompt');
    if (!hasSeenPasswordPrompt) {
      setShowPasswordChangePrompt(true);
      localStorage.setItem('hasSeenPasswordPrompt', 'true');
    }
    // Aggiorna ogni 5 secondi
    const interval = setInterval(() => {
      fetchQueue();
      fetchEventStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Funzioni di spostamento (definite prima dell'useEffect che le usa)
  const moveUp = useCallback(async (displayIndex) => {
    if (displayIndex === 0) return;

    // Trova l'elemento waiting nella posizione displayIndex
    const waitingQueue = queue.filter(item => item.status === 'waiting');
    if (displayIndex >= waitingQueue.length) return;

    // Trova gli indici reali nella coda completa
    const item = waitingQueue[displayIndex];
    const realIndex = queue.findIndex(q => q.id === item.id);

    if (realIndex <= 0) return;

    try {
      await api.put('/api/queue/reorder', {
        fromIndex: realIndex,
        toIndex: realIndex - 1
      });
      await fetchQueue();
      // Aggiorna l'indice selezionato
      setSelectedIndex(displayIndex - 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nello spostamento');
    }
  }, [queue]);

  const moveDown = useCallback(async (displayIndex) => {
    const waitingQueue = queue.filter(item => item.status === 'waiting');
    if (displayIndex >= waitingQueue.length - 1) return;

    // Trova l'elemento waiting nella posizione displayIndex
    const item = waitingQueue[displayIndex];
    const realIndex = queue.findIndex(q => q.id === item.id);

    if (realIndex < 0 || realIndex >= queue.length - 1) return;

    try {
      await api.put('/api/queue/reorder', {
        fromIndex: realIndex,
        toIndex: realIndex + 1
      });
      await fetchQueue();
      // Aggiorna l'indice selezionato
      setSelectedIndex(displayIndex + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nello spostamento');
    }
  }, [queue]);

  // Gestione tastiera per spostamento canzoni
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignora se stiamo digitando in un input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      const waitingQueue = queue.filter(item => item.status === 'waiting');

      if (selectedIndex === null || selectedIndex < 0) return;

      if (e.key === 'ArrowUp' && selectedIndex > 0) {
        e.preventDefault();
        moveUp(selectedIndex);
      } else if (e.key === 'ArrowDown' && selectedIndex < waitingQueue.length - 1) {
        e.preventDefault();
        moveDown(selectedIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, queue, moveUp, moveDown]);

  const fetchQueue = async () => {
    try {
      const response = await api.get('/api/queue');
      setQueue(response.data.data);
      // Se non c'è una data evento salvata, usa la data odierna (fuso orario locale)
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setEventDate(response.data.eventDate || today);
      setVenueName(response.data.venueName || '');
      setLogoPath(response.data.logoPath || '');
      const social = response.data.socialLinks || {};
      setWhatsappLink(social.whatsapp || '');
      setFacebookLink(social.facebook || '');
      setInstagramLink(social.instagram || '');
      setPhoneLink(social.phone || '');
      setSocialIcons(response.data.socialIcons || {});
      setScrollingText(response.data.scrollingText || '');
      setScrollingSpeed(response.data.scrollingSpeed || 20);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento della coda');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicPassword = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/public-access/password', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPublicPassword(response.data.password);
    } catch (err) {
      console.error('Errore nel recupero della password pubblica:', err);
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

  const toggleEventStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/api/event-status/toggle', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEventStatus(response.data.data);
      setSuccessMessage(response.data.message);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Errore nel cambio stato della serata');
    }
  };

  const handleSaveEvent = async () => {
    try {
      const token = localStorage.getItem('token');

      // Salva i dati della serata
      await api.post('/api/saved-events', {
        eventDate,
        venueName,
        queue: queue
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Chiudi la serata se è aperta
      if (eventStatus.isOpen) {
        const response = await api.post('/api/event-status/close', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEventStatus(response.data.data);
      }

      setSuccessMessage('Serata salvata e chiusa con successo!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Errore nel salvataggio della serata');
      console.error('Errore salvataggio:', err);
    }
  };

  const generateNewPassword = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/api/public-access/generate', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPublicPassword(response.data.password);
      setSuccessMessage('Nuova password generata!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Errore nella generazione della password');
    }
  };

  const handlePasswordChangeResponse = async (changePassword) => {
    setShowPasswordChangePrompt(false);
    if (changePassword) {
      await generateNewPassword();
    }
  };


  const copyPasswordToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicPassword);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Errore nella copia della password');
      console.error('Errore copia:', err);
    }
  };

  const updateEventDate = async (newDate) => {
    try {
      await api.put('/api/queue/event-date', { date: newDate });
      setEventDate(newDate);
      setSuccessMessage('Data evento aggiornata!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nell\'aggiornamento della data');
    }
  };

  const updateVenueName = async (newName) => {
    try {
      await api.put('/api/queue/venue-name', { name: newName });
      setVenueName(newName);
      setSuccessMessage('Nome locale aggiornato!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nell\'aggiornamento del nome locale');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verifica tipo file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo di file non supportato. Usa JPG, PNG, GIF o WebP.');
      return;
    }

    // Verifica dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Il file è troppo grande. Dimensione massima: 5MB.');
      return;
    }

    setUploadingLogo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/api/logo/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setLogoPath(response.data.data.logoPath);
      setSuccessMessage('Logo caricato con successo!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel caricamento del logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!confirm('Sei sicuro di voler rimuovere il logo?')) {
      return;
    }

    try {
      await api.delete('/api/logo');

      setLogoPath('');
      setSuccessMessage('Logo rimosso con successo!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nella rimozione del logo');
    }
  };

  const markAsSinging = async (id) => {
    try {
      await api.put(`/api/queue/${id}/singing`);
      await fetchQueue();
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nell aggiornamento');
    }
  };

  const openSettings = () => {
    // Inizializza gli stati di editing con i valori correnti
    setEditWhatsapp(whatsappLink);
    setEditFacebook(facebookLink);
    setEditInstagram(instagramLink);
    setEditPhone(phoneLink);
    setEditScrollingText(scrollingText);
    setShowSettings(true);
  };

  const saveSettings = async () => {
    try {
      await api.put('/api/queue/social-links', {
        whatsapp: editWhatsapp,
        facebook: editFacebook,
        instagram: editInstagram,
        phone: editPhone
      });

      setSuccessMessage('Impostazioni salvate con successo!');
      setShowSettings(false);
      // Ricarica i dati per aggiornare gli stati principali
      await fetchQueue();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel salvataggio delle impostazioni');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
  };

  const markAsCompleted = async (id) => {
    try {
      await api.put(`/api/queue/${id}/complete`);
      await fetchQueue();
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nell aggiornamento');
    }
  };

  const removeFromQueue = async (id) => {
    if (!confirm('Sei sicuro di voler rimuovere questo cantante dalla coda?')) {
      console.log('❌ Rimozione annullata dall\'utente');
      return;
    }

    console.log('🗑️ Tentativo di rimozione ID:', id);
    try {
      const response = await api.delete(`/api/queue/${id}`);
      console.log('✅ Risposta rimozione:', response.data);
      await fetchQueue();
    } catch (err) {
      console.error('❌ Errore rimozione:', err);
      setError(err.response?.data?.error || 'Errore nella rimozione');
    }
  };

  const resetAllQueue = async () => {
    if (!confirm('⚠️ ATTENZIONE: Vuoi cancellare TUTTE le canzoni dalla coda (sia quelle da cantare che quelle già eseguite)?')) {
      return;
    }

    try {
      await api.post('/api/queue/reset-all');
      await fetchQueue();
      setSuccessMessage('Coda completamente svuotata!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel reset della coda');
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      singerName: item.singerName,
      songTitle: item.songTitle,
      artist: item.artist,
      tonality: item.tonality,
      comments: item.comments || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/api/queue/${id}`, editForm);
      setEditingId(null);
      setEditForm({});
      await fetchQueue();
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nella modifica');
    }
  };



  
  const handleAddSong = async (e) => {
    e.preventDefault();

    // Validazione
    if (!singerName.trim() || !songTitle.trim() || !artist.trim()) {
      setError('Tutti i campi sono obbligatori (tranne commenti)');
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
        comments: comments.trim()
      });

      setSuccessMessage(`${singerName} aggiunto in posizione ${response.data.data.position}!`);
      setSingerName('');
      setSongTitle('');
      setArtist('');
      setTonality(0);
      setComments('');

      // Chiudi il form
      setShowForm(false);

      // Ricarica la coda
      await fetchQueue();

      // Nascondi messaggio dopo 3 secondi
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Errore durante l'aggiunta");
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentSinger = () => {
    return queue.find(item => item.status === 'singing');
  };

  const getWaitingQueue = () => {
    return queue.filter(item => item.status === 'waiting');
  };

  const getAllActiveQueue = () => {
    return queue.filter(item => item.status === 'waiting' || item.status === 'singing');
  };

  const getAllQueue = () => {
    return queue; // Mostra tutti: waiting, singing, completed
  };

  const currentSinger = getCurrentSinger();
  const waitingQueue = getWaitingQueue();
  const allActiveQueue = getAllActiveQueue();
  const fullQueue = getAllQueue();

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar Menu */}
      <div className={`sidebar ${showSidebar ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h2>📋 Menu</h2>
          <button onClick={() => setShowSidebar(false)} className="btn-close-sidebar">✕</button>
        </div>
        <nav className="sidebar-nav">
          <button onClick={openSettings} className="sidebar-link">⚙️ Impostazioni</button>
          <a href="/admin/songlist" className="sidebar-link">📚 Lista Canzoni</a>
          <a href="/admin/serate" className="sidebar-link">📅 Serate</a>
          <a href="/" className="sidebar-link">🎤 Schermata Pubblica</a>
          <button onClick={handleLogout} className="sidebar-link logout">🚪 Logout</button>
        </nav>
      </div>

      {/* Overlay */}
      {showSidebar && <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}></div>}

      {/* Header visuale con logo e icone social */}
      <div className="visual-header">
        <div className="visual-header-content">
          {/* Icone social a sinistra */}
          <div className="social-icons-left">
            {whatsappLink && (
              <a href={`https://wa.me/${whatsappLink}`} target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp">
                {socialIcons.whatsapp ? (
                  <img src={getImageUrl(socialIcons.whatsapp)} alt="WhatsApp" className="social-icon-img" />
                ) : (
                  '📱'
                )}
              </a>
            )}
            {facebookLink && (
              <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook">
                {socialIcons.facebook ? (
                  <img src={getImageUrl(socialIcons.facebook)} alt="Facebook" className="social-icon-img" />
                ) : (
                  '📘'
                )}
              </a>
            )}
          </div>

          {/* Logo al centro */}
          {logoPath && (
            <div className="header-logo-admin">
              <img src={getImageUrl(logoPath)} alt="Logo" />
            </div>
          )}

          {/* Icone social a destra */}
          <div className="social-icons-right">
            {instagramLink && (
              <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">
                {socialIcons.instagram ? (
                  <img src={getImageUrl(socialIcons.instagram)} alt="Instagram" className="social-icon-img" />
                ) : (
                  '📷'
                )}
              </a>
            )}
            {phoneLink && (
              <a href={`tel:${phoneLink}`} className="social-icon" title="Telefono">
                {socialIcons.phone ? (
                  <img src={getImageUrl(socialIcons.phone)} alt="Telefono" className="social-icon-img" />
                ) : (
                  '☎️'
                )}
              </a>
            )}
          </div>
        </div>

        {/* Testo sotto: nome locale e data */}
        <div className="visual-header-text">
          <h2 className="venue-name-admin">{venueName || 'Locale non specificato'}</h2>
          <p className="event-date-admin">{eventDate || 'Data non impostata'}</p>
        </div>
      </div>

      <header className="admin-header">
        <div className="header-left">
          <button onClick={() => setShowSidebar(true)} className="btn-hamburger" title="Apri menu">
            ☰
          </button>
        </div>
        <div className="header-title">
          <a href="/" className="mic-icon-link" title="Vai alla Schermata Pubblica">
            🎤
          </a>
          <h1>Admin Dashboard - Karaoke Manager</h1>
        </div>
        <div className="header-buttons">
        </div>
      </header>



      {/* Sezione Data Evento e Reset */}
      <div className="reset-section">
        <div className="event-date-picker">
          <label htmlFor="eventDate">📅 Data Evento:</label>
          <input
            type="date"
            id="eventDate"
            value={eventDate}
            onChange={(e) => updateEventDate(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="venue-name-input">
          <label htmlFor="venueName">🏠 Nome Locale:</label>
          <input
            type="text"
            id="venueName"
            value={venueName}
            onChange={(e) => updateVenueName(e.target.value)}
            placeholder="Es: Karaoke Club"
            maxLength="100"
            className="venue-input"
          />
        </div>

        <div className="password-left-group">
          <label className="password-label-inline">🔐 Password Pubblica:</label>
          <div className="password-section">
            <div className="password-controls">
              <input
                type="text"
                value={publicPassword}
                readOnly
                className="password-display-input"
              />
              <button onClick={generateNewPassword} className="btn-refresh-password-inline" title="Genera nuova password">
                🔄
              </button>
              <button onClick={copyPasswordToClipboard} className="btn-copy-password-inline" title="Copia password">
                📋
              </button>
            </div>
            {showCopyAlert && (
              <div className="copy-alert-inline">
                ✅ Password copiata!
              </div>
            )}
          </div>
        </div>

        <button
          onClick={toggleEventStatus}
          className={`btn-toggle-event ${eventStatus.isOpen ? 'open' : 'closed'}`}
          title={eventStatus.isOpen ? 'Chiudi serata' : 'Apri serata'}
        >
          {eventStatus.isOpen ? '🟢 Serata Aperta' : '🔴 Serata Chiusa'}
        </button>

        <button onClick={handleSaveEvent} className="btn-save-event" title="Salva serata">
          💾 Salva serata
        </button>
      </div>

      {/* Sezione Testo Scorrevole */}
      <div className="password-row">
        <div className="scrolling-text-input-group">
          <label htmlFor="scrollingTextAdmin">📜 Testo Scorrevole:</label>
          <div className="scrolling-text-controls">
            <input
              type="text"
              id="scrollingTextAdmin"
              value={scrollingText}
              onChange={async (e) => {
                const newText = e.target.value;
                setScrollingText(newText);
                try {
                  await api.put('/api/queue/scrolling-text', { text: newText });
                } catch (err) {
                  console.error('Errore aggiornamento testo:', err);
                }
              }}
              placeholder="Benvenuti alla serata!"
              maxLength="200"
              className="scrolling-input"
            />
            {scrollingText && (
              <button
                onClick={async () => {
                  setScrollingText('');
                  try {
                    await api.put('/api/queue/scrolling-text', { text: '' });
                    setSuccessMessage('Testo cancellato!');
                    setTimeout(() => setSuccessMessage(''), 2000);
                  } catch (err) {
                    setError('Errore nella cancellazione');
                  }
                }}
                className="btn-clear-text"
                title="Cancella testo"
              >
                🗑️
              </button>
            )}
            <div className="speed-selector">
              <label htmlFor="scrollingSpeed" title="Velocità di scorrimento">⚡</label>
              <input
                type="range"
                id="scrollingSpeed"
                min="1"
                max="60"
                value={scrollingSpeed}
                onChange={async (e) => {
                  const newSpeed = parseInt(e.target.value);
                  setScrollingSpeed(newSpeed);
                  try {
                    await api.put('/api/queue/scrolling-speed', { speed: newSpeed });
                  } catch (err) {
                    console.error('Errore aggiornamento velocità:', err);
                  }
                }}
                className="speed-range"
              />
              <span className="speed-value">{scrollingSpeed}s</span>
            </div>
          </div>
        </div>

        <button
          onClick={resetAllQueue}
          className="btn-reset-all"
          title="Cancella tutte le canzoni dalla coda"
        >
          🗑️ Cancella Tutta la Coda
        </button>
      </div>

      {/* Popup Aggiunta Cantante */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content add-song-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎵 Aggiungi Canzone per Ospite</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSong} className="add-form">
          <div className="form-group">
            <label htmlFor="admin-singerName">Il tuo nome:</label>
            <input
              type="text"
              id="admin-singerName"
              value={singerName}
              onChange={(e) => setSingerName(e.target.value)}
              placeholder="Es: Mario Rossi"
              maxLength="50"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-songTitle">Titolo canzone:</label>
            <input
              type="text"
              id="admin-songTitle"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="Es: Volare"
              maxLength="100"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-artist">Interprete:</label>
            <input
              type="text"
              id="admin-artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Es: Domenico Modugno"
              maxLength="50"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-tonality">
              Tonalità: <strong>{tonality > 0 ? `+${tonality}` : tonality}</strong>
            </label>
            <select
              id="admin-tonality"
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
            <label htmlFor="admin-comments">Commenti <span style={{fontStyle: "italic", fontSize: "0.85rem", fontWeight: "normal"}}>(facoltativo)</span>:</label>
            <textarea
              id="admin-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Es: Note particolari, richieste speciali..."
              maxLength="200"
              disabled={submitting}
              rows="3"
            />
          </div>

          <div className="modal-footer">
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
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">{error}</div>
      )}

      {/* Modale Prompt Cambio Password */}
      {showPasswordChangePrompt && (
        <div className="modal-overlay">
          <div className="modal-content password-prompt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔐 Cambio Password</h2>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '1.1rem', textAlign: 'center', margin: '20px 0' }}>
                Vuoi cambiare la password di accesso pubblico?
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => handlePasswordChangeResponse(false)}
              >
                No
              </button>
              <button
                className="btn-save"
                onClick={() => handlePasswordChangeResponse(true)}
              >
                Sì
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Modifica */}
      {editingId && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Modifica Cantante</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveEdit(editingId); }} className="edit-form">
              <div className="form-group">
                <label htmlFor="edit-singerName">Nome Cantante:</label>
                <input
                  type="text"
                  id="edit-singerName"
                  value={editForm.singerName || ''}
                  onChange={(e) => setEditForm({...editForm, singerName: e.target.value})}
                  maxLength="50"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-songTitle">Titolo Canzone:</label>
                <input
                  type="text"
                  id="edit-songTitle"
                  value={editForm.songTitle || ''}
                  onChange={(e) => setEditForm({...editForm, songTitle: e.target.value})}
                  maxLength="100"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-artist">Interprete:</label>
                <input
                  type="text"
                  id="edit-artist"
                  value={editForm.artist || ''}
                  onChange={(e) => setEditForm({...editForm, artist: e.target.value})}
                  maxLength="50"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-tonality">
                  Tonalità: <strong>{editForm.tonality > 0 ? `+${editForm.tonality}` : editForm.tonality}</strong>
                </label>
                <select
                  id="edit-tonality"
                  value={editForm.tonality || 0}
                  onChange={(e) => setEditForm({...editForm, tonality: parseInt(e.target.value)})}
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
              </div>
              <div className="form-group">
                <label htmlFor="edit-comments">Commenti:</label>
                <textarea
                  id="edit-comments"
                  value={editForm.comments || ''}
                  onChange={(e) => setEditForm({...editForm, comments: e.target.value})}
                  maxLength="200"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-save-edit">💾 Salva Modifiche</button>
                <button type="button" onClick={cancelEdit} className="btn-cancel-edit">❌ Annulla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nuovo layout: Pulsante + Coda a sinistra | Chat Pubblica a destra */}
      <div className="main-content-layout">
        {/* Colonna sinistra: Pulsante e Lista */}
        <div className="left-column">
          <button
            onClick={() => setShowForm(true)}
            className="btn-add-guest-song"
            title="Aggiungi una canzone per un ospite"
          >
            🎵 Aggiungi canzone
          </button>

          {/* Lista cantanti sotto il pulsante */}
          <section className="queue-section-admin">
          <h2>Coda ({fullQueue.length})</h2>

          {loading && <p>Caricamento...</p>}

          {!loading && fullQueue.length === 0 && (
            <p className="empty-message">Nessun cantante in coda.</p>
          )}

          {!loading && fullQueue.length > 0 && (
            <div className="admin-queue-list">
            {fullQueue.map((item, index) => {
              // Calcola l'indice nella waiting queue
              const waitingIndex = item.status === 'waiting' ? waitingQueue.findIndex(w => w.id === item.id) : -1;

              // Calcola la posizione separata per ogni stato
              let displayPosition;
              if (item.status === 'waiting') {
                displayPosition = waitingQueue.findIndex(w => w.id === item.id) + 1;
              } else if (item.status === 'completed') {
                const completedQueue = fullQueue.filter(i => i.status === 'completed');
                displayPosition = completedQueue.findIndex(c => c.id === item.id) + 1;
              } else {
                displayPosition = '🎤';
              }

              return (
                <div
                  key={item.id}
                  className={`admin-card ${item.status === 'singing' ? 'current' : ''} ${item.status === 'completed' ? 'completed' : ''} ${selectedIndex === waitingIndex && item.status === 'waiting' ? 'selected' : ''}`}
                  onClick={() => item.status === 'waiting' ? setSelectedIndex(waitingIndex) : null}
                  style={item.status === 'waiting' ? { cursor: 'pointer' } : {}}
                >
                <div className="card-position-container">
                  <div className="card-position">{displayPosition}</div>
                  <div className="card-chat">
                    <ChatBox
                      queueId={item.id}
                      queueEntry={item}
                      userType="admin"
                      isAdmin={true}
                    />
                  </div>
                </div>
                <div className="card-info">
                  <div className="song-line">
                    <span className="singer-name">{item.singerName}</span>
                    <span className="separator"> canta </span>
                    <span className="song-title">{item.songTitle}</span>
                    <span className="separator"> di </span>
                    <span className="artist-name">{item.artist}</span>
                    <span className="separator"> - Tonalità: </span>
                    <span className={`tonality-value ${item.tonality !== 0 ? 'blink' : ''}`}>
                      {item.tonality > 0 ? `+${item.tonality}` : item.tonality}
                    </span>
                    {item.status === 'singing' && (
                      <span className="status-badge in-corso"> 🎤 IN CORSO</span>
                    )}
                    {item.status === 'completed' && (
                      <span className="status-badge eseguita"> ✅ ESEGUITA</span>
                    )}
                  </div>
                  {item.requestedBy && item.requestedBy !== item.singerName && (
                    <div className="requested-by-line">📝 Richiesta da {item.requestedBy}</div>
                  )}
                  {item.comments && (
                    <div className="comments-line">💬 {item.comments}</div>
                  )}
                </div>
                <div className="card-actions">
                  {item.status === 'completed' ? null : item.status === 'singing' ? (
                    <button
                      className="btn-complete"
                      onClick={() => markAsCompleted(item.id)}
                      title="Termina esibizione"
                    >
                      ✅ Termina
                    </button>
                  ) : index === 0 ? (
                    <button
                      className="btn-singing"
                      onClick={() => markAsSinging(item.id)}
                      title="Inizia esibizione"
                    >
                      🎤 Inizia
                    </button>
                  ) : null}
                  {item.status === 'waiting' && (
                    <>
                      <button
                        className="btn-move"
                        onClick={() => moveUp(waitingIndex)}
                        disabled={waitingIndex === 0}
                        title="Sposta su"
                      >
                        ↑
                      </button>
                      <button
                        className="btn-move"
                        onClick={() => moveDown(waitingIndex)}
                        disabled={waitingIndex >= waitingQueue.length - 1}
                        title="Sposta giù"
                      >
                        ↓
                      </button>
                    </>
                  )}
                  {item.status !== 'completed' && (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(item)}
                        title="Modifica"
                        disabled={item.status === 'singing'}
                      >
                        ✏️ Modifica
                      </button>
                      <button
                        className="btn-remove"
                        onClick={() => removeFromQueue(item.id)}
                        title="Rimuovi"
                        disabled={item.status === 'singing'}
                      >
                        🗑️ Rimuovi
                      </button>
                    </>
                  )}
                </div>
              </div>
              )
            })}
            </div>
          )}
        </section>
        </div>

        {/* Chat Pubblica */}
        <aside
          className="public-chat-sidebar"
          onClick={() => {
            // Quando l'admin clicca sulla chat, segna i messaggi come letti
            if (publicMessagesCount > lastReadMessagesCount) {
              setLastReadMessagesCount(publicMessagesCount);
            }
          }}
        >
          {publicMessagesCount > lastReadMessagesCount && (
            <div className="new-messages-badge">
              {publicMessagesCount - lastReadMessagesCount} {publicMessagesCount - lastReadMessagesCount === 1 ? 'nuovo messaggio' : 'nuovi messaggi'}
            </div>
          )}
          <PublicChat
            senderName="Admin"
            isAdmin={true}
            onMessagesUpdate={(count) => {
              setPublicMessagesCount(count);
              // Inizializza lastRead al primo caricamento
              if (lastReadMessagesCount === 0) {
                setLastReadMessagesCount(count);
              }
            }}
          />
        </aside>
      </div>

      {/* Modale Impostazioni */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Impostazioni</h2>
              <button className="modal-close" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="settings-section">
                <h3>Logo</h3>
                <div className="logo-section">
                  {logoPath && (
                    <div className="logo-preview-settings">
                      <img src={getImageUrl(logoPath)} alt="Logo" />
                    </div>
                  )}
                  <div className="logo-actions">
                    <input
                      type="file"
                      id="logoUploadSettings"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="logoUploadSettings" className="btn-upload-logo">
                      {uploadingLogo ? '⏳ Caricamento...' : (logoPath ? '🔄 Cambia Logo' : '📤 Carica Logo')}
                    </label>
                    {logoPath && (
                      <button
                        onClick={handleLogoRemove}
                        className="btn-remove-logo"
                        disabled={uploadingLogo}
                      >
                        🗑️ Rimuovi
                      </button>
                    )}
                  </div>
                  <small className="helper-text">Formati supportati: JPG, PNG, GIF, WebP (max 5MB)</small>
                </div>
              </div>

              <div className="settings-section">
                <h3>Social Media - Link</h3>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Inserisci numero WhatsApp (es. +393331234567)"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Facebook</label>
                  <input
                    type="text"
                    placeholder="Inserisci URL Facebook"
                    value={editFacebook}
                    onChange={(e) => setEditFacebook(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="text"
                    placeholder="Inserisci URL Instagram"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Telefono</label>
                  <input
                    type="text"
                    placeholder="Inserisci numero telefono (es. +393331234567)"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
              </div>

              <SocialIconsManager />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowSettings(false)}>
                Annulla
              </button>
              <button className="btn-save" onClick={saveSettings}>
                Salva Impostazioni
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

