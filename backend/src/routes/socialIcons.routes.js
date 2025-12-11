const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QueueModel = require('../models/queue.model');
const { authenticateAdmin } = require('../middleware/auth.middleware');

// Assicurati che la cartella uploads/social-icons esista
const uploadsDir = path.join(__dirname, '../../uploads/social-icons');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurazione multer per upload delle icone
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const platform = req.body.platform || 'icon';
    const ext = path.extname(file.originalname);
    cb(null, `${platform}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accetta solo immagini
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo file immagine sono ammessi (PNG, JPG, JPEG, GIF)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // Max 2MB
  }
});

// GET /api/social-icons - Ottieni tutte le icone social
router.get('/', (req, res) => {
  try {
    const icons = QueueModel.getSocialIcons();
    res.json({
      success: true,
      data: icons
    });
  } catch (error) {
    console.error('Errore nel recupero delle icone:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero delle icone social'
    });
  }
});

// POST /api/social-icons/upload - Upload di un'icona social (solo admin)
router.post('/upload', authenticateAdmin, upload.single('icon'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    const platform = req.body.platform;
    if (!platform || !['whatsapp', 'facebook', 'instagram', 'phone'].includes(platform)) {
      // Elimina il file caricato se la piattaforma non è valida
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Piattaforma non valida. Usa: whatsapp, facebook, instagram, phone'
      });
    }

    // Ottieni le icone attuali
    const currentIcons = QueueModel.getSocialIcons();

    // Se esiste già un'icona per questa piattaforma, elimina il vecchio file
    if (currentIcons[platform]) {
      const oldFilePath = path.join(__dirname, '../..', currentIcons[platform]);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Salva il path relativo nel model
    const iconPath = `/uploads/social-icons/${req.file.filename}`;
    QueueModel.setSocialIcon(platform, iconPath);

    res.json({
      success: true,
      message: `Icona ${platform} caricata con successo`,
      data: {
        platform,
        iconPath
      }
    });
  } catch (error) {
    console.error('Errore nel caricamento dell\'icona:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore nel caricamento dell\'icona'
    });
  }
});

// DELETE /api/social-icons/:platform - Elimina un'icona social (solo admin)
router.delete('/:platform', authenticateAdmin, (req, res) => {
  try {
    const { platform } = req.params;

    if (!['whatsapp', 'facebook', 'instagram', 'phone'].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Piattaforma non valida'
      });
    }

    const currentIcons = QueueModel.getSocialIcons();

    if (currentIcons[platform]) {
      // Elimina il file
      const filePath = path.join(__dirname, '../..', currentIcons[platform]);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Rimuovi dal model
      QueueModel.setSocialIcon(platform, '');
    }

    res.json({
      success: true,
      message: `Icona ${platform} eliminata con successo`
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'icona:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'eliminazione dell\'icona'
    });
  }
});

module.exports = router;
