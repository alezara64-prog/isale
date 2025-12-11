const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'karaoke-secret-key-change-in-production';

// Middleware per verificare il token JWT
const authenticateAdmin = (req, res, next) => {
  try {
    // Ottieni il token dall'header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token di autenticazione mancante'
      });
    }

    // Formato atteso: "Bearer TOKEN"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token non valido'
      });
    }

    // Verifica il token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Controlla che sia un admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accesso negato: permessi insufficienti'
      });
    }

    // Aggiungi i dati dell'utente alla request
    req.user = decoded;

    // Passa al prossimo middleware/controller
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token scaduto'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token non valido'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Errore di autenticazione'
    });
  }
};

module.exports = { authenticateAdmin };
