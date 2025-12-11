import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../config/api';
import './SongList.css';

function SongList({ isPublic = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera il nome del cantante passato dal form
  const currentSingerName = location.state?.currentSingerName || '';
  const [songData, setSongData] = useState({});
  const [filteredData, setFilteredData] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchSinger, setSearchSinger] = useState('');
  const [searchSong, setSearchSong] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [numColumns, setNumColumns] = useState(6);

  // Stati per la modifica
  const [editingSinger, setEditingSinger] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [newSingerName, setNewSingerName] = useState('');
  const [newSongTitle, setNewSongTitle] = useState('');

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    // Filtra i dati quando cambiano le query di ricerca
    if (searchSinger || searchSong) {
      searchSongs();
    } else {
      setFilteredData(songData);
    }
  }, [searchSinger, searchSong, songData]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/songlist');
      setSongData(response.data.data);
      setFilteredData(response.data.data);
      setStats(response.data.stats);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento della lista canzoni');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchSongs = async () => {
    try {
      const response = await api.get('/api/songlist/search', {
        params: {
          singer: searchSinger,
          song: searchSong
        }
      });
      setFilteredData(response.data.data);
    } catch (err) {
      console.error('Errore nella ricerca:', err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (!file) {
      setUploadError('Seleziona un file Excel');
      return;
    }

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isExcel) {
      setUploadError('Solo file Excel (.xlsx, .xls) sono ammessi');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadSuccess('');

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('adminToken');
      const response = await api.post('/api/songlist/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data.data;

      setUploadSuccess(
        `File Excel caricato con successo! ${data.totalSingers} cantanti, ${data.totalSongs} canzoni totali. ` +
        `Aggiunte: ${data.addedSongs} canzoni nuove, Saltate: ${data.skippedSongs} duplicati.`
      );

      // Ricarica la lista
      await fetchSongs();

      // Reset form
      fileInput.value = '';
      setShowUploadForm(false);

      // Nascondi il messaggio dopo 5 secondi
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Errore durante il caricamento del file Excel');
    } finally {
      setUploading(false);
    }
  };

  const clearSearch = () => {
    setSearchSinger('');
    setSearchSong('');
    setFilteredData(songData);
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('⚠️ Sei sicuro di voler cancellare TUTTA la lista canzoni? Questa azione è irreversibile!')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await api.post('/api/songlist/reset', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUploadSuccess('Lista canzoni cancellata con successo!');
      await fetchSongs();
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Errore durante la cancellazione della lista');
    }
  };

  // Funzioni per la modifica dei cantanti
  const startEditingSinger = (singerName) => {
    setEditingSinger(singerName);
    setNewSingerName(singerName);
  };

  const cancelEditingSinger = () => {
    setEditingSinger(null);
    setNewSingerName('');
  };

  const saveEditingSinger = async (oldName) => {
    if (!newSingerName || newSingerName.trim() === '') {
      setUploadError('Il nome del cantante non può essere vuoto');
      return;
    }

    if (newSingerName === oldName) {
      cancelEditingSinger();
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await api.put(`/api/songlist/singer/${encodeURIComponent(oldName)}/rename`,
        { newName: newSingerName },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setUploadSuccess(`Cantante rinominato: "${oldName}" → "${newSingerName}"`);
      await fetchSongs();
      cancelEditingSinger();
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Errore durante la rinomina del cantante');
    }
  };

  // Funzioni per la modifica delle canzoni
  const startEditingSong = (singerName, songTitle) => {
    setEditingSong({ singer: singerName, title: songTitle });
    setNewSongTitle(songTitle);
  };

  const cancelEditingSong = () => {
    setEditingSong(null);
    setNewSongTitle('');
  };

  const saveEditingSong = async (singerName, oldTitle) => {
    if (!newSongTitle || newSongTitle.trim() === '') {
      setUploadError('Il titolo della canzone non può essere vuoto');
      return;
    }

    if (newSongTitle === oldTitle) {
      cancelEditingSong();
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await api.put(
        `/api/songlist/singer/${encodeURIComponent(singerName)}/song/${encodeURIComponent(oldTitle)}/rename`,
        { newTitle: newSongTitle },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setUploadSuccess(`Canzone rinominata: "${oldTitle}" → "${newSongTitle}"`);
      await fetchSongs();
      cancelEditingSong();
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Errore durante la rinomina della canzone');
    }
  };

  // Stato per gestire l'accordion
  const [expandedSinger, setExpandedSinger] = useState(null);

  // Converti i dati filtrati in array ordinato
  const getSingersList = () => {
    return Object.keys(filteredData).sort((a, b) =>
      a.localeCompare(b, 'it', { sensitivity: 'base' })
    );
  };

  const toggleSinger = (singer) => {
    setExpandedSinger(expandedSinger === singer ? null : singer);
  };

  // Gestisce la selezione di una canzone in modalità pubblica
  const handleSongSelect = (singer, songTitle) => {
    if (!isPublic) return;

    navigate('/', {
      state: {
        selectedArtist: singer,
        selectedSong: songTitle,
        currentSingerName: currentSingerName // Passa indietro il nome del cantante
      }
    });
  };

  const singers = getSingersList();
  const hasSongs = singers.length > 0;

  return (
    <div className="songlist-container">
      <header className="songlist-header">
        {isPublic ? (
          <a href="/" className="btn-back-to-admin">
            ← Torna al Form
          </a>
        ) : (
          <a href="/admin/dashboard" className="btn-back-to-admin">
            ← Torna alla Dashboard
          </a>
        )}
        <h1>📚 {isPublic ? 'Cerca la tua Canzone' : 'Lista Canzoni Karaoke'}</h1>
        <div className="header-bottom">
          {stats.totalSingers > 0 && (
            <div className="stats-bar">
              <span>👨‍🎤 {stats.totalSingers} Cantanti</span>
              <span>🎵 {stats.totalSongs} Canzoni</span>
              {stats.lastUpdated && !isPublic && (
                <span className="last-updated">
                  Ultimo aggiornamento: {new Date(stats.lastUpdated).toLocaleDateString('it-IT')}
                </span>
              )}
            </div>
          )}
          {!isPublic && (
            <div className="header-buttons">
              <button
                className="btn-upload-toggle-header"
                onClick={() => setShowUploadForm(!showUploadForm)}
              >
                📄 Carica file Excel
              </button>
              <button
                className="btn-reset-database"
                onClick={handleResetDatabase}
                title="Cancella tutta la lista canzoni"
              >
                🗑️ Cancella Lista
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Barra di ricerca */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-field">
            <label htmlFor="search-singer">🎤 Cerca Cantante:</label>
            <input
              type="text"
              id="search-singer"
              value={searchSinger}
              onChange={(e) => setSearchSinger(e.target.value)}
              placeholder="Es: Modugno, Beatles..."
            />
          </div>

          <div className="search-field">
            <label htmlFor="search-song">🎵 Cerca Canzone:</label>
            <input
              type="text"
              id="search-song"
              value={searchSong}
              onChange={(e) => setSearchSong(e.target.value)}
              placeholder="Es: Volare, Yesterday..."
            />
          </div>

          {(searchSinger || searchSong) && (
            <button className="btn-clear-search" onClick={clearSearch}>
              ✕ Pulisci
            </button>
          )}
        </div>
      </section>

      {/* Form Upload PDF */}
      {!isPublic && (
        <section className="upload-section">
          {showUploadForm && (
            <div className="upload-form-container">
              <form onSubmit={handleFileUpload} className="upload-form">
                <h3>Carica Catalogo Excel</h3>

                <div className="form-group">
                  <label htmlFor="file-upload">Seleziona file Excel (.xlsx o .xls):</label>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".xlsx,.xls"
                    required
                  />
                </div>

                {uploadError && (
                  <div className="error-message">{uploadError}</div>
                )}

                <div className="form-buttons">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowUploadForm(false);
                      setUploadError('');
                    }}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={uploading}
                  >
                    {uploading ? 'Caricamento...' : 'Carica'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {uploadSuccess && (
            <div className="success-message">{uploadSuccess}</div>
          )}
        </section>
      )}

      {/* Lista Canzoni */}
      {loading && <p className="loading-message">Caricamento...</p>}

      {error && <div className="error-message">{error}</div>}

      {!loading && !hasSongs && (
        <div className="empty-message">
          <p>Nessuna canzone trovata.</p>
          <p>Carica un file PDF per popolare il catalogo.</p>
        </div>
      )}

      {!loading && hasSongs && (
        <section className="songs-accordion">
          {singers.map((singer) => (
            <div key={singer} className="accordion-item">
              <div
                className={`accordion-header ${expandedSinger === singer ? 'active' : ''}`}
              >
                {editingSinger === singer ? (
                  <div className="edit-singer-form">
                    <input
                      type="text"
                      className="edit-input"
                      value={newSingerName}
                      onChange={(e) => setNewSingerName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    <button
                      className="btn-save-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEditingSinger(singer);
                      }}
                    >
                      ✓
                    </button>
                    <button
                      className="btn-cancel-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEditingSinger();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="singer-name-container" onClick={() => toggleSinger(singer)}>
                      <h2 className="singer-name">{singer}</h2>
                      <span className="accordion-icon">
                        {expandedSinger === singer ? '▼' : '▶'}
                      </span>
                    </div>
                    {!isPublic && (
                      <button
                        className="btn-edit-singer"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingSinger(singer);
                        }}
                        title="Rinomina cantante"
                      >
                        ✏️
                      </button>
                    )}
                  </>
                )}
              </div>
              {expandedSinger === singer && (
                <ul className="song-list">
                  {filteredData[singer].map((song, index) => (
                    <li key={index} className="song-item">
                      {editingSong?.singer === singer && editingSong?.title === song.title ? (
                        <div className="edit-song-form">
                          <input
                            type="text"
                            className="edit-input"
                            value={newSongTitle}
                            onChange={(e) => setNewSongTitle(e.target.value)}
                            autoFocus
                          />
                          <button
                            className="btn-save-edit"
                            onClick={() => saveEditingSong(singer, song.title)}
                          >
                            ✓
                          </button>
                          <button
                            className="btn-cancel-edit"
                            onClick={cancelEditingSong}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`song-title ${isPublic ? 'selectable' : ''}`}
                            onClick={() => isPublic && handleSongSelect(singer, song.title)}
                            style={isPublic ? { cursor: 'pointer' } : {}}
                          >
                            {song.title}
                          </span>
                          {!isPublic && (
                            <button
                              className="btn-edit-song"
                              onClick={() => startEditingSong(singer, song.title)}
                              title="Rinomina canzone"
                            >
                              ✏️
                            </button>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default SongList;
