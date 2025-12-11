// Modello dati per la chat pubblica
// Chat condivisa tra tutti i cantanti e l'admin
// Per ora usiamo la memoria, poi migreremo a database

let messages = []; // Array di messaggi pubblici
let bannedUsers = new Set(); // Set di nomi utenti bannati (case-insensitive)

class PublicChatModel {
  // Ottieni tutti i messaggi della chat pubblica
  static getAllMessages() {
    return messages;
  }

  // Aggiungi un messaggio alla chat pubblica
  static addMessage(senderName, senderType, message) {
    const newMessage = {
      id: Date.now() + Math.random(), // ID univoco temporaneo
      senderName: senderName.trim(), // Nome del mittente
      senderType: senderType, // 'admin' o 'singer'
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);

    // Mantieni solo gli ultimi 100 messaggi per evitare sovraccarico memoria
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }

    return newMessage;
  }

  // Cancella un singolo messaggio
  static deleteMessage(messageId) {
    const initialLength = messages.length;
    messages = messages.filter(msg => msg.id !== messageId);
    return messages.length < initialLength; // Ritorna true se qualcosa è stato cancellato
  }

  // Reset completo della chat pubblica
  static resetAll() {
    messages = [];
    return true;
  }

  // Ottieni gli ultimi N messaggi
  static getRecentMessages(limit = 50) {
    return messages.slice(-limit);
  }

  // Banna un utente dalla chat pubblica
  static banUser(userName) {
    if (!userName) return false;
    bannedUsers.add(userName.toLowerCase().trim());
    return true;
  }

  // Rimuovi il ban da un utente
  static unbanUser(userName) {
    if (!userName) return false;
    return bannedUsers.delete(userName.toLowerCase().trim());
  }

  // Verifica se un utente è bannato
  static isUserBanned(userName) {
    if (!userName) return false;
    return bannedUsers.has(userName.toLowerCase().trim());
  }

  // Ottieni la lista di tutti gli utenti bannati
  static getBannedUsers() {
    return Array.from(bannedUsers);
  }

  // Reset anche dei ban
  static resetBans() {
    bannedUsers.clear();
    return true;
  }
}

module.exports = PublicChatModel;
