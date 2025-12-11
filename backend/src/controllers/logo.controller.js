const QueueModel = require('../models/queue.model');
const path = require('path');
const fs = require('fs');

class LogoController {
  // POST /api/logo/upload - Upload logo (solo admin)
  static uploadLogo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nessun file caricato'
        });
      }

      // Salva il path relativo del file
      const logoPath = `/uploads/logos/${req.file.filename}`;
      QueueModel.setLogoPath(logoPath);

      res.json({
        success: true,
        message: 'Logo caricato con successo',
        data: { logoPath }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE /api/logo - Rimuovi logo (solo admin)
  static removeLogo(req, res) {
    try {
      const currentLogoPath = QueueModel.getLogoPath();

      if (currentLogoPath) {
        // Rimuovi il file fisico se esiste
        const fullPath = path.join(__dirname, '../../', currentLogoPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      QueueModel.setLogoPath('');

      res.json({
        success: true,
        message: 'Logo rimosso con successo'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/logo - Ottieni il path del logo corrente
  static getLogo(req, res) {
    try {
      const logoPath = QueueModel.getLogoPath();
      res.json({
        success: true,
        data: { logoPath }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = LogoController;
