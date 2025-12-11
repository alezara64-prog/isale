const bcrypt = require('bcryptjs');

// Per ora un solo admin hardcoded
// In futuro: database con gestione utenti multipli

class AdminModel {
  constructor() {
    // Username e password di default
    // TODO: Spostare in database e permettere cambio password
    this.username = 'admin';
    // Password di default: "karaoke2025"
    // Hash generato con bcrypt
    this.passwordHash = '$2b$10$Yfko6uFQ2CJ2nT/KUAYISO/.0lRDCZ9FMdRL0WP1MBtih1JTXcA42';
  }

  // Verifica credenziali admin
  async verifyCredentials(username, password) {
    if (username !== this.username) {
      return false;
    }

    // Confronta password con hash
    const isValid = await bcrypt.compare(password, this.passwordHash);
    return isValid;
  }

  // Cambia password admin (da implementare in futuro)
  async changePassword(oldPassword, newPassword) {
    const isValid = await bcrypt.compare(oldPassword, this.passwordHash);
    if (!isValid) {
      throw new Error('Password attuale errata');
    }

    // Hash della nuova password
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(newPassword, salt);

    // TODO: Salvare nel database
    return true;
  }

  // Ottieni info admin (senza password)
  getAdminInfo() {
    return {
      username: this.username,
      role: 'admin'
    };
  }
}

// Singleton instance
const adminInstance = new AdminModel();

module.exports = adminInstance;
