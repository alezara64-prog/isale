const PublicChatModel = require('../models/publicChat.model');

class PublicChatController {
  // GET /api/public-chat - Ottieni tutti i messaggi della chat pubblica
  static getMessages(req, res) {
    try {
      const messages = PublicChatModel.getAllMessages();
      res.json({
        success: true,
        data: messages,
        total: messages.length
      });
    } catch (error) {
      console.error('Errore nel recupero messaggi chat pubblica:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nel recupero dei messaggi'
      });
    }
  }

  // POST /api/public-chat - Aggiungi un messaggio alla chat pubblica
  static addMessage(req, res) {
    try {
      const { senderName, senderType, message } = req.body;

      // Validazione
      if (!senderName || !senderType || !message) {
        return res.status(400).json({
          success: false,
          error: 'Nome mittente, tipo e messaggio sono obbligatori'
        });
      }

      if (!['admin', 'singer'].includes(senderType)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo mittente non valido'
        });
      }

      // Verifica se l'utente è bannato (solo per i cantanti, non per admin)
      if (senderType === 'singer' && PublicChatModel.isUserBanned(senderName)) {
        return res.status(403).json({
          success: false,
          error: 'Non hai il permesso di inviare messaggi nella chat pubblica'
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
          error: 'Il messaggio è troppo lungo (max 500 caratteri)'
        });
      }

      const newMessage = PublicChatModel.addMessage(
        senderName,
        senderType,
        message
      );

      console.log('✅ Nuovo messaggio pubblico da:', senderName);

      res.status(201).json({
        success: true,
        data: newMessage
      });
    } catch (error) {
      console.error('Errore nell\'aggiunta messaggio pubblico:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nell\'invio del messaggio'
      });
    }
  }

  // DELETE /api/public-chat/:id - Cancella un singolo messaggio (solo admin)
  static deleteMessage(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID messaggio richiesto'
        });
      }

      const deleted = PublicChatModel.deleteMessage(parseFloat(id));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Messaggio non trovato'
        });
      }

      console.log('🗑️ Messaggio pubblico cancellato:', id);

      res.json({
        success: true,
        message: 'Messaggio cancellato'
      });
    } catch (error) {
      console.error('Errore nella cancellazione del messaggio:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nella cancellazione del messaggio'
      });
    }
  }

  // DELETE /api/public-chat - Reset della chat pubblica (solo admin)
  static resetChat(req, res) {
    try {
      PublicChatModel.resetAll();
      console.log('🗑️ Chat pubblica resettata');

      res.json({
        success: true,
        message: 'Chat pubblica resettata'
      });
    } catch (error) {
      console.error('Errore nel reset della chat pubblica:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nel reset della chat'
      });
    }
  }

  // POST /api/public-chat/ban - Banna un utente dalla chat pubblica (solo admin)
  static banUser(req, res) {
    try {
      const { userName } = req.body;

      if (!userName || !userName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Nome utente richiesto'
        });
      }

      const banned = PublicChatModel.banUser(userName);

      if (!banned) {
        return res.status(400).json({
          success: false,
          error: 'Errore nel bannare l\'utente'
        });
      }

      console.log('🚫 Utente bannato dalla chat pubblica:', userName);

      res.json({
        success: true,
        message: `${userName} è stato bannato dalla chat pubblica`
      });
    } catch (error) {
      console.error('Errore nel bannare utente:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nel bannare l\'utente'
      });
    }
  }

  // POST /api/public-chat/unban - Rimuovi il ban da un utente (solo admin)
  static unbanUser(req, res) {
    try {
      const { userName } = req.body;

      if (!userName || !userName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Nome utente richiesto'
        });
      }

      const unbanned = PublicChatModel.unbanUser(userName);

      if (!unbanned) {
        return res.status(404).json({
          success: false,
          error: 'Utente non trovato nella lista ban'
        });
      }

      console.log('✅ Ban rimosso per utente:', userName);

      res.json({
        success: true,
        message: `${userName} può ora scrivere nella chat pubblica`
      });
    } catch (error) {
      console.error('Errore nel rimuovere ban:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nel rimuovere il ban'
      });
    }
  }

  // GET /api/public-chat/banned - Ottieni lista utenti bannati (solo admin)
  static getBannedUsers(req, res) {
    try {
      const bannedUsers = PublicChatModel.getBannedUsers();
      res.json({
        success: true,
        data: bannedUsers,
        total: bannedUsers.length
      });
    } catch (error) {
      console.error('Errore nel recupero utenti bannati:', error);
      res.status(500).json({
        success: false,
        error: 'Errore nel recupero utenti bannati'
      });
    }
  }
}

module.exports = PublicChatController;
