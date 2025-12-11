const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');

// Route admin only (senza autenticazione)
router.get('/all', ChatController.getAllChats);

// Route pubbliche (cantanti possono accedere)
router.get('/:queueId/unread', ChatController.countUnread);
router.get('/:queueId', ChatController.getMessages);
router.post('/:queueId', ChatController.sendMessage);
router.put('/:queueId/read', ChatController.markAsRead);
router.delete('/:queueId', ChatController.deleteChat);

module.exports = router;
