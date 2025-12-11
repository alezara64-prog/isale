const jwt = require('jsonwebtoken');
const adminModel = require('../models/admin.model');

const JWT_SECRET = process.env.JWT_SECRET || 'karaoke-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

class AuthController {
  // POST /api/auth/login - Login admin
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validazione input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username e password sono obbligatori'
        });
      }

      // Verifica credenziali
      const isValid = await adminModel.verifyCredentials(username, password);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Credenziali non valide'
        });
      }

      // Genera JWT token
      const token = jwt.sign(
        {
          username: adminModel.username,
          role: 'admin'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        message: 'Login effettuato con successo',
        data: {
          token,
          user: adminModel.getAdminInfo()
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Errore durante il login'
      });
    }
  }

  // GET /api/auth/verify - Verifica token
  static async verifyToken(req, res) {
    try {
      // Il token è già stato verificato dal middleware
      // req.user contiene i dati decodificati
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Errore durante la verifica'
      });
    }
  }

  // POST /api/auth/logout - Logout (invalida token lato client)
  static logout(req, res) {
    // Con JWT il logout è gestito lato client
    // (rimuovendo il token dallo storage)
    res.json({
      success: true,
      message: 'Logout effettuato'
    });
  }
}

module.exports = AuthController;
