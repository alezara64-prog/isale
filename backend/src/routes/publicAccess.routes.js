const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth.middleware');
const publicAccessModel = require('../models/publicAccess.model');

// GET /api/public-access/password - Ottieni la password corrente (solo admin)
router.get('/password', authenticateAdmin, (req, res) => {
  try {
    const password = publicAccessModel.getCurrentPassword();
    res.json({
      success: true,
      password: password
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero della password'
    });
  }
});

// POST /api/public-access/generate - Genera una nuova password (solo admin)
router.post('/generate', authenticateAdmin, (req, res) => {
  try {
    const password = publicAccessModel.generatePassword();
    res.json({
      success: true,
      password: password
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nella generazione della password'
    });
  }
});

// POST /api/public-access/verify - Verifica la password
router.post('/verify', (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password richiesta'
      });
    }

    const isValid = publicAccessModel.verifyPassword(password);

    res.json({
      success: true,
      valid: isValid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nella verifica della password'
    });
  }
});

module.exports = router;
