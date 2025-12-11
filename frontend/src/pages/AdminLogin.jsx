import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './AdminLogin.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username e password sono obbligatori');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        username,
        password
      });

      // Salva il token in localStorage
      localStorage.setItem('adminToken', response.data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.data.user));

      // Resetta il flag del prompt password per mostrarlo ad ogni login
      localStorage.removeItem('hasSeenPasswordPrompt');

      // Configura axios per usare il token in tutte le richieste future
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;

      // Redirect alla dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Errore durante il login. Verifica le credenziali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🔐 Area Admin</h1>
          <p>Accedi per gestire la coda karaoke</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Inserisci username"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/" className="back-link">← Torna alla schermata pubblica</a>
        </div>
      </div>

      <div className="login-info">
        <p>💡 Credenziali di default:</p>
        <p><strong>Username:</strong> admin</p>
        <p><strong>Password:</strong> karaoke2025</p>
      </div>
    </div>
  );
}

export default AdminLogin;
