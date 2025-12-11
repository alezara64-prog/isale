import { useState, useEffect } from 'react';
import api from '../config/api';
import './SocialIconsManager.css';

function SocialIconsManager() {
  const [socialIcons, setSocialIcons] = useState({
    whatsapp: '',
    facebook: '',
    instagram: '',
    phone: ''
  });
  const [uploading, setUploading] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSocialIcons();
  }, []);

  const fetchSocialIcons = async () => {
    try {
      const response = await api.get('/api/social-icons');
      setSocialIcons(response.data.data);
    } catch (err) {
      console.error('Errore nel caricamento delle icone:', err);
    }
  };

  const handleFileChange = async (e, platform) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validazione tipo file
    if (!file.type.startsWith('image/')) {
      setError('Per favore, seleziona un file immagine (PNG, JPG, JPEG, GIF)');
      return;
    }

    // Validazione dimensione (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Il file deve essere inferiore a 2MB');
      return;
    }

    setUploading({ ...uploading, [platform]: true });
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('icon', file);
    formData.append('platform', platform);

    try {
      const response = await api.post('/api/social-icons/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(`Icona ${platform} caricata con successo!`);
      await fetchSocialIcons();

      // Pulisci il messaggio dopo 3 secondi
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel caricamento dell\'icona');
    } finally {
      setUploading({ ...uploading, [platform]: false });
      // Reset input file
      e.target.value = '';
    }
  };

  const handleDelete = async (platform) => {
    if (!window.confirm(`Vuoi eliminare l'icona di ${platform}?`)) {
      return;
    }

    try {
      await api.delete(`/api/social-icons/${platform}`);

      setMessage(`Icona ${platform} eliminata con successo!`);
      await fetchSocialIcons();

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nell\'eliminazione dell\'icona');
    }
  };

  const platformLabels = {
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    instagram: 'Instagram',
    phone: 'Telefono'
  };

  const defaultEmojis = {
    whatsapp: '📱',
    facebook: '📘',
    instagram: '📷',
    phone: '☎️'
  };

  return (
    <div className="social-icons-manager">
      <h3>Gestione Icone Social</h3>
      <p className="helper-text">Carica icone personalizzate (PNG, JPG max 2MB) o usa gli emoji predefiniti</p>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="icons-grid">
        {Object.keys(socialIcons).map((platform) => (
          <div key={platform} className="icon-item">
            <div className="icon-header">
              <h4>{platformLabels[platform]}</h4>
              {socialIcons[platform] && (
                <button
                  onClick={() => handleDelete(platform)}
                  className="btn-delete-icon"
                  title="Elimina icona"
                >
                  🗑️
                </button>
              )}
            </div>

            <div className="icon-preview">
              {socialIcons[platform] ? (
                <img
                  src={`http://localhost:3001${socialIcons[platform]}`}
                  alt={platformLabels[platform]}
                  className="preview-image"
                />
              ) : (
                <span className="preview-emoji">{defaultEmojis[platform]}</span>
              )}
            </div>

            <div className="icon-upload">
              <input
                type="file"
                id={`upload-${platform}`}
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={(e) => handleFileChange(e, platform)}
                disabled={uploading[platform]}
                className="file-input"
              />
              <label htmlFor={`upload-${platform}`} className="btn-upload">
                {uploading[platform] ? 'Caricamento...' : 'Carica Icona'}
              </label>
            </div>

            <small className="icon-status">
              {socialIcons[platform] ? 'Icona personalizzata' : 'Emoji predefinito'}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialIconsManager;
