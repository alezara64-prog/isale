const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth.middleware');
const eventStatusModel = require('../models/eventStatus.model');

// GET /api/event-status - Ottieni lo stato corrente della serata (pubblico)
router.get('/', async (req, res) => {
  try {
    const status = await eventStatusModel.getEventStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dello stato della serata'
    });
  }
});

// POST /api/event-status/toggle - Toggle stato serata (solo admin)
router.post('/toggle', authenticateAdmin, async (req, res) => {
  try {
    const newStatus = await eventStatusModel.toggleEventStatus();
    res.json({
      success: true,
      data: newStatus,
      message: newStatus.isOpen ? 'Serata aperta!' : 'Serata chiusa!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nel cambio stato della serata'
    });
  }
});

// POST /api/event-status/open - Apri la serata (solo admin)
router.post('/open', authenticateAdmin, async (req, res) => {
  try {
    const newStatus = await eventStatusModel.openEvent();
    res.json({
      success: true,
      data: newStatus,
      message: 'Serata aperta!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nell\'apertura della serata'
    });
  }
});

// POST /api/event-status/close - Chiudi la serata (solo admin)
router.post('/close', authenticateAdmin, async (req, res) => {
  try {
    const newStatus = await eventStatusModel.closeEvent();
    res.json({
      success: true,
      data: newStatus,
      message: 'Serata chiusa!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nella chiusura della serata'
    });
  }
});

module.exports = router;
