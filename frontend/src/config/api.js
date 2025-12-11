import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Interceptor per aggiungere il token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire errori globali e token scaduto
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    // Se il token è scaduto o non valido, reindirizza al login
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data?.error || '';

      if (errorMessage.includes('Token scaduto') ||
          errorMessage.includes('Token non valido') ||
          errorMessage.includes('Token di autenticazione mancante')) {

        // Rimuovi il token scaduto
        localStorage.removeItem('adminToken');

        // Reindirizza al login solo se siamo nella dashboard admin
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/admin/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
