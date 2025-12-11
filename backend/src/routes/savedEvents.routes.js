const express = require('express');
const router = express.Router();
const savedEventsModel = require('../models/savedEvents.model');
const { authenticateAdmin } = require('../middleware/auth.middleware');

// GET /api/saved-events - Ottieni tutte le serate salvate (solo admin)
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const events = savedEventsModel.getAllSavedEvents();
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Errore nel recupero delle serate salvate:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero delle serate salvate'
    });
  }
});

// GET /api/saved-events/:id - Ottieni una serata specifica (solo admin)
router.get('/:id', authenticateAdmin, (req, res) => {
  try {
    const event = savedEventsModel.getSavedEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Serata non trovata'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Errore nel recupero della serata:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero della serata'
    });
  }
});

// POST /api/saved-events - Salva una nuova serata (solo admin)
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { eventDate, venueName, queue } = req.body;

    if (!eventDate || !venueName) {
      return res.status(400).json({
        success: false,
        error: 'Data evento e nome locale sono obbligatori'
      });
    }

    const savedEvent = savedEventsModel.saveEvent({
      eventDate,
      venueName,
      queue
    });

    res.status(201).json({
      success: true,
      message: 'Serata salvata con successo!',
      data: savedEvent
    });
  } catch (error) {
    console.error('Errore nel salvataggio della serata:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel salvataggio della serata'
    });
  }
});

// DELETE /api/saved-events/:id - Elimina una serata (solo admin)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const deleted = savedEventsModel.deleteSavedEvent(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Serata non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Serata eliminata con successo',
      data: deleted
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione della serata:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'eliminazione della serata'
    });
  }
});

// DELETE /api/saved-events - Elimina tutte le serate (solo admin)
router.delete('/', authenticateAdmin, (req, res) => {
  try {
    const count = savedEventsModel.deleteAllSavedEvents();

    res.json({
      success: true,
      message: `${count} serate eliminate con successo`,
      count
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione di tutte le serate:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'eliminazione delle serate'
    });
  }
});

module.exports = router;
