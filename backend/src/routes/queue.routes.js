const express = require('express');
const router = express.Router();
const QueueController = require('../controllers/queue.controller');

// Route pubbliche (accessibili a tutti i cantanti)
router.get('/', QueueController.getQueue);
router.post('/', QueueController.addToQueue);

// Route admin (senza autenticazione)
router.put('/event-date', QueueController.setEventDate);
router.put('/venue-name', QueueController.setVenueName);
router.put('/social-links', QueueController.setSocialLinks);
router.put('/scrolling-text', QueueController.setScrollingText);
router.put('/scrolling-speed', QueueController.setScrollingSpeed);
router.put('/reorder', QueueController.reorderQueue);
router.delete('/:id', QueueController.removeFromQueue);
router.put('/:id', QueueController.updateQueue);
router.put('/:id/complete', QueueController.completeSinger);
router.put('/:id/singing', QueueController.markAsSinging);
router.get('/history', QueueController.getHistory);
router.post('/reset', QueueController.resetQueue);
router.post('/reset-all', QueueController.resetAll);

module.exports = router;
