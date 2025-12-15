const QueueModel = require('../models/queue.model');
const supabase = require('../config/supabase');

class LogoController {
  // POST /api/logo/upload - Upload logo (solo admin)
  static async uploadLogo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nessun file caricato'
        });
      }

      const fileName = 'logo-' + Date.now() + '-' + req.file.originalname;
      const filePath = 'logos/' + fileName;

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
          error: 'Errore durante il caricamento del logo'
        });
      }

      const { data: publicUrlData } = supabase.storage
        .from('karaoke-images')
        .getPublicUrl(filePath);

      const logoUrl = publicUrlData.publicUrl;

      const oldLogoPath = QueueModel.getLogoPath();
      if (oldLogoPath && oldLogoPath.includes('supabase')) {
        const urlParts = oldLogoPath.split('/karaoke-images/');
        if (urlParts.length > 1) {
          const oldFilePath = urlParts[1];
          await supabase.storage
            .from('karaoke-images')
            .remove([oldFilePath])
            .catch(() => {});
        }
      }

      QueueModel.setLogoPath(logoUrl);

      res.json({
        success: true,
        message: 'Logo caricato con successo',
        data: { logoPath: logoUrl }
      });
    } catch (error) {
      console.error('Errore in uploadLogo:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async removeLogo(req, res) {
    try {
      const currentLogoPath = QueueModel.getLogoPath();

      if (currentLogoPath && currentLogoPath.includes('supabase')) {
        const urlParts = currentLogoPath.split('/karaoke-images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { error } = await supabase.storage
            .from('karaoke-images')
            .remove([filePath]);

          if (error) {
            console.error('Errore rimozione da Supabase:', error);
          }
        }
      }

      QueueModel.setLogoPath('');

      res.json({
        success: true,
        message: 'Logo rimosso con successo'
      });
    } catch (error) {
      console.error('Errore in removeLogo:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

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
