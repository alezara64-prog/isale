const express = require('express');
const router = express.Router();
const multer = require('multer');
const LogoController = require('../controllers/logo.controller');

// Configurazione multer per l'upload in memoria (per Supabase)
const storage = multer.memoryStorage();

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
    fileSize: 5 * 1024 * 1024
  }
});

router.get('/', LogoController.getLogo);
router.post('/upload', upload.single('logo'), LogoController.uploadLogo);
router.delete('/', LogoController.removeLogo);

module.exports = router;
