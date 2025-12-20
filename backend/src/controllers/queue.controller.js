const QueueModel = require('../models/queue.model');

class QueueController {
  // GET /api/queue - Ottieni la coda (pubblico)
  static async getQueue(req, res) {
    try {
      // Assicura che i settings siano caricati (ricarica da Supabase se vuoti)
      await QueueModel.ensureSettingsLoaded();

      const queue = QueueModel.getAll();
      const eventDate = QueueModel.getEventDate();
      const venueName = QueueModel.getVenueName();
      const logoPath = QueueModel.getLogoPath();
      const socialLinks = QueueModel.getSocialLinks();
      const socialIcons = QueueModel.getSocialIcons();
      const scrollingText = QueueModel.getScrollingText();
      const scrollingSpeed = QueueModel.getScrollingSpeed();
      res.json({
        success: true,
        data: queue,
        eventDate: eventDate,
        venueName: venueName,
        logoPath: logoPath,
        socialLinks: socialLinks,
        socialIcons: socialIcons,
        scrollingText: scrollingText,
        scrollingSpeed: scrollingSpeed,
        total: queue.length
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/queue - Aggiungi un cantante alla coda (pubblico)
  static addToQueue(req, res) {
    try {
      const { singerName, songTitle, artist, tonality, comments, requestedBy } = req.body;

      // Validazione - TUTTI i campi obbligatori
      if (!singerName || !songTitle || !artist || tonality === undefined || tonality === null) {
        return res.status(400).json({
          success: false,
          error: 'Tutti i campi sono obbligatori (nome, canzone, artista, tonalità)'
        });
      }

      // Validazione lunghezze
      if (singerName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Il nome deve essere almeno 2 caratteri'
        });
      }

      if (songTitle.trim().length < 1) {
        return res.status(400).json({
          success: false,
          error: 'Il titolo della canzone è obbligatorio'
        });
      }

      if (artist.trim().length < 1) {
        return res.status(400).json({
          success: false,
          error: 'L\'interprete originale è obbligatorio'
        });
      }

      // Validazione tonalità
      const tonalityNum = parseInt(tonality);
      if (isNaN(tonalityNum) || tonalityNum < -6 || tonalityNum > 6) {
        return res.status(400).json({
          success: false,
          error: 'La tonalità deve essere un numero tra -6 e +6'
        });
      }

      // Verifica se il cantante ha gia una canzone in coda
      const existingSinger = QueueModel.findBySingerName(singerName.trim());
      if (existingSinger) {
        return res.status(400).json({
          success: false,
          error: `${singerName} ha gia una canzone in coda! Attendi il tuo turno prima di aggiungerne un altra.`
        });
      }

      const newEntry = QueueModel.add(singerName, songTitle, artist, tonalityNum, comments || '', requestedBy || '');
      const position = QueueModel.getPositionById(newEntry.id);

      res.status(201).json({
        success: true,
        message: 'Aggiunto alla coda!',
        data: { ...newEntry, position }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE /api/queue/:id - Rimuovi dalla coda (solo admin)
  static removeFromQueue(req, res) {
    try {
      const { id } = req.params;
      console.log('🗑️ Richiesta DELETE per ID:', id);
      const removed = QueueModel.remove(id);

      if (!removed) {
        console.log('❌ Cantante non trovato con ID:', id);
        return res.status(404).json({
          success: false,
          error: 'Cantante non trovato'
        });
      }

      console.log('✅ Cantante rimosso:', removed);
      res.json({
        success: true,
        message: 'Rimosso dalla coda',
        data: removed
      });
    } catch (error) {
      console.error('❌ Errore nella rimozione:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/queue/:id/complete - Segna come completato (solo admin)
  static completeSinger(req, res) {
    try {
      const { id } = req.params;
      console.log('✅ Richiesta COMPLETE per ID:', id);
      const completed = QueueModel.complete(id);

      if (!completed) {
        console.log('❌ Cantante non trovato con ID:', id);
        return res.status(404).json({
          success: false,
          error: 'Cantante non trovato'
        });
      }

      console.log('✅ Cantante completato:', completed);
      console.log('📋 Coda aggiornata:', QueueModel.getAll());

      res.json({
        success: true,
        message: 'Cantante completato',
        data: completed
      });
    } catch (error) {
      console.error('❌ Errore nel completamento:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/queue/:id/singing - Segna come "sta cantando" (solo admin)
  static markAsSinging(req, res) {
    try {
      const { id } = req.params;
      const updated = QueueModel.markAsSinging(id);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Cantante non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Cantante in corso',
        data: updated
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/queue/reorder - Riordina la coda (solo admin)
  static reorderQueue(req, res) {
    try {
      const { fromIndex, toIndex } = req.body;

      if (fromIndex === undefined || toIndex === undefined) {
        return res.status(400).json({
          success: false,
          error: 'fromIndex e toIndex sono obbligatori'
        });
      }

      const success = QueueModel.reorder(fromIndex, toIndex);

      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Indici non validi'
        });
      }

      res.json({
        success: true,
        message: 'Coda riordinata',
        data: QueueModel.getAll()
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/queue/history - Ottieni lo storico (solo admin)
  static getHistory(req, res) {
    try {
      const history = QueueModel.getHistory();
      res.json({
        success: true,
        data: history,
        total: history.length
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/queue/reset - Reset della coda (solo admin)
  static resetQueue(req, res) {
    try {
      QueueModel.reset();
      res.json({
        success: true,
        message: 'Coda resettata'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/queue/reset-all - Reset completo (solo admin)
  static resetAll(req, res) {
    try {
      QueueModel.resetAll();
      res.json({
        success: true,
        message: 'Tutto resettato (coda + storico)'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/queue/event-date - Aggiorna la data dell'evento (solo admin)
  static setEventDate(req, res) {
    try {
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Data richiesta'
        });
      }

      const updatedDate = QueueModel.setEventDate(date);
      res.json({
        success: true,
        message: 'Data evento aggiornata',
        data: { eventDate: updatedDate }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/queue/venue-name - Aggiorna il nome del locale (solo admin)
  static setVenueName(req, res) {
    try {
      const { name } = req.body;

      const updatedName = QueueModel.setVenueName(name || '');
      res.json({
        success: true,
        message: 'Nome locale aggiornato',
        data: { venueName: updatedName }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/queue/:id - Aggiorna un cantante (solo admin)
  static updateQueue(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = QueueModel.update(id, updates);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Cantante non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Cantante aggiornato',
        data: updated
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/queue/social-links - Aggiorna i link social (solo admin)
  static setSocialLinks(req, res) {
    try {
      const { whatsapp, facebook, instagram, phone } = req.body;

      const links = {};
      if (whatsapp !== undefined) links.whatsapp = whatsapp;
      if (facebook !== undefined) links.facebook = facebook;
      if (instagram !== undefined) links.instagram = instagram;
      if (phone !== undefined) links.phone = phone;

      const updated = QueueModel.setSocialLinks(links);

      res.json({
        success: true,
        message: 'Link social aggiornati',
        data: updated
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/queue/scrolling-speed - Aggiorna la velocità di scorrimento (solo admin)
  static setScrollingSpeed(req, res) {
    try {
      const { speed } = req.body;

      const updatedSpeed = QueueModel.setScrollingSpeed(speed);
      res.json({
        success: true,
        message: 'Velocità di scorrimento aggiornata',
        data: { scrollingSpeed: updatedSpeed }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/queue/scrolling-text - Aggiorna il testo scorrevole (solo admin)
  static setScrollingText(req, res) {
    try {
      const { text } = req.body;
      const updated = QueueModel.setScrollingText(text || '');

      res.json({
        success: true,
        message: 'Testo scorrevole aggiornato',
        data: { scrollingText: updated }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = QueueController;
