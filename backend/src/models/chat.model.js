// Modello dati per la chat tra admin e cantante
// Ogni entrata in coda ha una chat privata associata
// Per ora usiamo la memoria, poi migreremo a database

let chats = {}; // Struttura: { queueId: [messages] }

class ChatModel {
  // Ottieni tutti i messaggi di una chat specifica (per una canzone in coda)
  static getMessagesByQueueId(queueId) {
    return chats[queueId] || [];
  }

  // Aggiungi un messaggio alla chat
  static addMessage(queueId, sender, message) {
    if (!chats[queueId]) {
      chats[queueId] = [];
    }

    const newMessage = {
      id: Date.now() + Math.random(), // ID univoco temporaneo
      queueId: parseInt(queueId),
      sender: sender, // 'admin' o 'singer'
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false // per future notifiche
    };

    chats[queueId].push(newMessage);
    return newMessage;
  }

  // Segna tutti i messaggi come letti (utile per notifiche)
  static markAsRead(queueId, sender) {
    if (!chats[queueId]) return [];

    const updated = chats[queueId].map(msg => {
      // Segna come letto solo i messaggi NON inviati dal sender
      if (msg.sender !== sender && !msg.read) {
        msg.read = true;
      }
      return msg;
    });

    return updated;
  }

  // Conta messaggi non letti per un cantante o admin
  static countUnread(queueId, forSender) {
    if (!chats[queueId]) return 0;

    return chats[queueId].filter(msg =>
      msg.sender !== forSender && !msg.read
    ).length;
  }

  // Elimina una chat quando una canzone viene completata/rimossa
  static deleteChat(queueId) {
    if (chats[queueId]) {
      delete chats[queueId];
      return true;
    }
    return false;
  }

  // Reset completo di tutte le chat
  static resetAll() {
    chats = {};
    return true;
  }

  // Ottieni tutte le chat con il conteggio dei messaggi non letti (per admin)
  static getAllChatsWithUnread() {
    const result = {};
    for (const queueId in chats) {
      result[queueId] = {
        messages: chats[queueId],
        unreadCount: this.countUnread(queueId, 'admin')
      };
    }
    return result;
  }

  // Verifica se esiste una chat per un queueId
  static chatExists(queueId) {
    return chats.hasOwnProperty(queueId);
  }
}

module.exports = ChatModel;
