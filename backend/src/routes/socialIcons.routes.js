const express = require('express');
const router = express.Router();
const multer = require('multer');
const QueueModel = require('../models/queue.model');
const { authenticateAdmin } = require('../middleware/auth.middleware');
const supabase = require('../config/supabase');

// Configurazione multer per upload in memoria
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
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
    fileSize: 2 * 1024 * 1024
  }
});

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

router.post('/upload', authenticateAdmin, upload.single('icon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    const platform = req.body.platform;
    if (!platform || !['whatsapp', 'facebook', 'instagram', 'phone'].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Piattaforma non valida. Usa: whatsapp, facebook, instagram, phone'
      });
    }

    const fileName = platform + '-' + Date.now() + '-' + req.file.originalname;
    const filePath = 'social-icons/' + fileName;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('karaoke-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Errore upload Supabase:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Errore durante il caricamento dell\'icona'
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from('karaoke-images')
      .getPublicUrl(filePath);

    const iconUrl = publicUrlData.publicUrl;

    const currentIcons = QueueModel.getSocialIcons();
    if (currentIcons[platform] && currentIcons[platform].includes('supabase')) {
      const urlParts = currentIcons[platform].split('/karaoke-images/');
      if (urlParts.length > 1) {
        const oldFilePath = urlParts[1];
        await supabase.storage
          .from('karaoke-images')
          .remove([oldFilePath])
          .catch(() => {});
      }
    }

    QueueModel.setSocialIcon(platform, iconUrl);

    res.json({
      success: true,
      message: 'Icona ' + platform + ' caricata con successo',
      data: {
        platform,
        iconPath: iconUrl
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

router.delete('/:platform', authenticateAdmin, async (req, res) => {
  try {
    const { platform } = req.params;

    if (!['whatsapp', 'facebook', 'instagram', 'phone'].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Piattaforma non valida'
      });
    }

    const currentIcons = QueueModel.getSocialIcons();

    if (currentIcons[platform] && currentIcons[platform].includes('supabase')) {
      const urlParts = currentIcons[platform].split('/karaoke-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        const { error } = await supabase.storage
          .from('karaoke-images')
          .remove([filePath]);

        if (error) {
          console.error('Errore rimozione da Supabase:', error);
        }
      }

      QueueModel.setSocialIcon(platform, '');
    }

    res.json({
      success: true,
      message: 'Icona ' + platform + ' eliminata con successo'
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
