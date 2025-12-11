const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const LogoController = require('../controllers/logo.controller');

// Configurazione multer per l'upload dei file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logos/');
  },
  filename: (req, file, cb) => {
    // Genera un nome univoco per il file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro per accettare solo immagini
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo di file non supportato. Usa JPG, PNG, GIF o WebP.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite di 5MB
  }
});

// GET /api/logo - Ottieni il logo corrente (pubblico)
router.get('/', LogoController.getLogo);

// POST /api/logo/upload - Upload logo (senza autenticazione)
router.post('/upload', upload.single('logo'), LogoController.uploadLogo);

// DELETE /api/logo - Rimuovi logo (senza autenticazione)
router.delete('/', LogoController.removeLogo);

module.exports = router;
