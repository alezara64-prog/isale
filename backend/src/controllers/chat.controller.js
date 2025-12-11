const ChatModel = require('../models/chat.model');
const QueueModel = require('../models/queue.model');

class ChatController {
  // GET /api/chat/:queueId - Ottieni tutti i messaggi di una chat
  static getMessages(req, res) {
    try {
      const { queueId } = req.params;

      // Verifica che l'entry in coda esista
      const queueEntry = QueueModel.findById(queueId);
      if (!queueEntry) {
        return res.status(404).json({
          success: false,
          error: 'Canzone non trovata in coda'
        });
      }

      const messages = ChatModel.getMessagesByQueueId(queueId);

      res.json({
        success: true,
        data: {
          queueId: parseInt(queueId),
          queueEntry,
          messages
        }
      });
    } catch (error) {
      console.error('Errore nel recupero messaggi:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nel recupero dei messaggi'
      });
    }
  }

  // POST /api/chat/:queueId - Invia un nuovo messaggio
  static sendMessage(req, res) {
    try {
      const { queueId } = req.params;
      const { sender, message } = req.body;

      // Validazione
      if (!sender || !message) {
        return res.status(400).json({
          success: false,
          error: 'Sender e message sono obbligatori'
        });
      }

      if (!['admin', 'singer'].includes(sender)) {
        return res.status(400).json({
          success: false,
          error: 'Sender deve essere "admin" o "singer"'
        });
      }

      if (message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Il messaggio non può essere vuoto'
        });
      }

      if (message.length > 500) {
        return res.status(400).json({
          success: false,
          error: 'Il messaggio non può superare i 500 caratteri'
        });
      }

      // Verifica che l'entry in coda esista
      const queueEntry = QueueModel.findById(queueId);
      if (!queueEntry) {
        return res.status(404).json({
          success: false,
          error: 'Canzone non trovata in coda'
        });
      }

      const newMessage = ChatModel.addMessage(queueId, sender, message);

      res.status(201).json({
        success: true,
        message: 'Messaggio inviato',
        data: newMessage
      });
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nell\'invio del messaggio'
      });
    }
  }

  // PUT /api/chat/:queueId/read - Segna messaggi come letti
  static markAsRead(req, res) {
    try {
      const { queueId } = req.params;
      const { sender } = req.body; // 'admin' o 'singer'

      if (!sender || !['admin', 'singer'].includes(sender)) {
        return res.status(400).json({
          success: false,
          error: 'Sender deve essere "admin" o "singer"'
        });
      }

      const messages = ChatModel.markAsRead(queueId, sender);

      res.json({
        success: true,
        message: 'Messaggi segnati come letti',
        data: messages
      });
    } catch (error) {
      console.error('Errore nel segnare messaggi come letti:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nel segnare messaggi come letti'
      });
    }
  }

  // GET /api/chat/:queueId/unread - Conta messaggi non letti
  static countUnread(req, res) {
    try {
      const { queueId } = req.params;
      const { forSender } = req.query; // 'admin' o 'singer'

      if (!forSender || !['admin', 'singer'].includes(forSender)) {
        return res.status(400).json({
          success: false,
          error: 'forSender query param deve essere "admin" o "singer"'
        });
      }

      const count = ChatModel.countUnread(queueId, forSender);

      res.json({
        success: true,
        data: {
          queueId: parseInt(queueId),
          unreadCount: count
        }
      });
    } catch (error) {
      console.error('Errore nel conteggio messaggi non letti:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nel conteggio messaggi non letti'
      });
    }
  }

  // GET /api/chat/all (admin only) - Ottieni tutte le chat con conteggio non letti
  static getAllChats(req, res) {
    try {
      const chats = ChatModel.getAllChatsWithUnread();

      res.json({
        success: true,
        data: chats
      });
    } catch (error) {
      console.error('Errore nel recupero di tutte le chat:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nel recupero delle chat'
      });
    }
  }

  // DELETE /api/chat/:queueId (admin only) - Elimina una chat
  static deleteChat(req, res) {
    try {
      const { queueId } = req.params;

      const deleted = ChatModel.deleteChat(queueId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Chat non trovata'
        });
      }

      res.json({
        success: true,
        message: 'Chat eliminata'
      });
    } catch (error) {
      console.error('Errore nell\'eliminazione della chat:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nell\'eliminazione della chat'
      });
    }
  }
}

module.exports = ChatController;
