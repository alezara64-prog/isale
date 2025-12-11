const express = require('express');
const router = express.Router();
const PublicChatController = require('../controllers/publicChat.controller');

// Route pubbliche (accessibili a tutti)
router.get('/', PublicChatController.getMessages);
router.post('/', PublicChatController.addMessage);

// Route admin (senza autenticazione per ora)
router.delete('/:id', PublicChatController.deleteMessage);
router.delete('/', PublicChatController.resetChat);

// Route per gestione ban
router.post('/ban', PublicChatController.banUser);
router.post('/unban', PublicChatController.unbanUser);
router.get('/banned', PublicChatController.getBannedUsers);

module.exports = router;
