const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateAdmin } = require('../middleware/auth.middleware');

// POST /api/auth/login - Login admin
router.post('/login', AuthController.login);

// GET /api/auth/verify - Verifica token (protetta)
router.get('/verify', authenticateAdmin, AuthController.verifyToken);

// POST /api/auth/logout - Logout
router.post('/logout', AuthController.logout);

module.exports = router;
