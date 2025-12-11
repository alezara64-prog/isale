// Modello dati per la coda karaoke
// Usa persistenza su file JSON

const fs = require('fs');
const path = require('path');

// Path del file di persistenza
const DATA_FILE = path.join(__dirname, '../../data/settings.json');

// Funzione per ottenere la data odierna in formato YYYY-MM-DD (fuso orario locale)
function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

let queue = [];
let nextId = 1;
let history = []; // Cantanti che hanno già cantato
let eventDate = getTodayDate(); // Data evento in formato YYYY-MM-DD (sempre data odierna all'avvio)
let venueName = ''; // Nome del locale
let logoPath = ''; // Path del logo personalizzato
let socialLinks = {
  whatsapp: '',
  facebook: '',
  instagram: '',
  phone: ''
};
let socialIcons = {
  whatsapp: '',
  facebook: '',
  instagram: '',
  phone: ''
};
let scrollingText = ''; // Testo scorrevole per la pagina pubblica
let scrollingSpeed = 20; // Velocità di scorrimento in secondi (default: 20s)

// Funzione per salvare i dati su file
function saveData() {
  try {
    const data = {
      eventDate,
      venueName,
      logoPath,
      socialLinks,
      socialIcons,
      scrollingText,
      scrollingSpeed,
      lastUpdated: new Date().toISOString()
    };

    // Crea la directory data se non esiste
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Dati salvati su file');
  } catch (error) {
    console.error('❌ Errore nel salvataggio dei dati:', error);
  }
}

// Funzione per caricare i dati dal file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(fileContent);

      // La data evento viene sempre impostata alla data odierna all'avvio
      eventDate = getTodayDate();
      venueName = data.venueName || '';
      logoPath = data.logoPath || '';
      socialLinks = data.socialLinks || socialLinks;
      socialIcons = data.socialIcons || socialIcons;
      scrollingText = data.scrollingText || '';
      scrollingSpeed = data.scrollingSpeed || 20;

      console.log('✅ Dati caricati da file');
    } else {
      console.log('ℹ️ Nessun file di dati trovato, uso valori di default');
    }
  } catch (error) {
    console.error('❌ Errore nel caricamento dei dati:', error);
  }
}

// Carica i dati all'avvio
loadData();

class QueueModel {
  // Ottieni tutta la coda
  static getAll() {
    return queue.map(item => ({
      ...item,
      position: queue.indexOf(item) + 1
    }));
  }

  // Aggiungi un cantante alla coda
  static add(singerName, songTitle, artist, tonality = 0, comments = '', requestedBy = '') {
    const newEntry = {
      id: nextId++,
      singerName: singerName.trim(),
      songTitle: songTitle.trim(),
      artist: artist.trim(),
      tonality: parseInt(tonality),
      comments: comments.trim(),
      requestedBy: requestedBy.trim(), // Chi ha richiesto questa canzone
      addedAt: new Date().toISOString(),
      status: 'waiting' // waiting, singing, completed
    };

    // Trova l'indice della prima canzone completata
    const firstCompletedIndex = queue.findIndex(item => item.status === 'completed');

    // Se ci sono canzoni completate, inserisci prima di esse
    // Altrimenti aggiungi in fondo
    if (firstCompletedIndex !== -1) {
      queue.splice(firstCompletedIndex, 0, newEntry);
    } else {
      queue.push(newEntry);
    }

    return newEntry;
  }

  // Trova un cantante per ID
  static findById(id) {
    return queue.find(item => item.id === parseInt(id));
  }
  // Trova un cantante per nome (case-insensitive)
  static findBySingerName(singerName) {
    return queue.find(item =>
      item.singerName.toLowerCase() === singerName.toLowerCase()
    );
}

  // Aggiorna un cantante
  static update(id, updates) {
    const item = this.findById(id);
    if (!item) return null;

    if (updates.singerName) item.singerName = updates.singerName.trim();
    if (updates.songTitle) item.songTitle = updates.songTitle.trim();
    if (updates.artist) item.artist = updates.artist.trim();
    if (updates.tonality !== undefined) item.tonality = parseInt(updates.tonality);
    if (updates.comments !== undefined) item.comments = updates.comments.trim();

    return item;
  }

  // Rimuovi un cantante dalla coda
  static remove(id) {
    const index = queue.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      const removed = queue.splice(index, 1)[0];
      return removed;
    }
    return null;
  }

  // Segna come "sta cantando"
  static markAsSinging(id) {
    const item = this.findById(id);
    if (item) {
      item.status = 'singing';
      return item;
    }
    return null;
  }

  // Completa un cantante (sposta in fondo alla coda)
  static complete(id) {
    const index = queue.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      const item = queue[index];
      item.status = 'completed';
      item.completedAt = new Date().toISOString();

      // Aggiungi alla history per lo storico
      history.push({...item});

      // Rimuovi dalla posizione corrente e metti in fondo
      queue.splice(index, 1);
      queue.push(item);

      return item;
    }
    return null;
  }

  // Riordina la coda
  static reorder(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= queue.length ||
        toIndex < 0 || toIndex >= queue.length) {
      return false;
    }
    const [item] = queue.splice(fromIndex, 1);
    queue.splice(toIndex, 0, item);
    return true;
  }

  // Ottieni lo storico
  static getHistory() {
    return history;
  }

  // Reset completo della coda
  static reset() {
    queue = [];
    nextId = 1;
    return true;
  }

  // Reset anche dello storico
  static resetAll() {
    queue = [];
    history = [];
    nextId = 1;
    return true;
  }

  // Conta i cantanti in attesa prima di un ID specifico
  static getPositionById(id) {
    const index = queue.findIndex(item => item.id === parseInt(id));
    return index !== -1 ? index + 1 : null;
  }

  // Ottieni la data dell'evento
  static getEventDate() {
    return eventDate;
  }

  // Imposta la data dell'evento
  static setEventDate(date) {
    eventDate = date;
    saveData();
    return eventDate;
  }

  // Ottieni il nome del locale
  static getVenueName() {
    return venueName;
  }

  // Imposta il nome del locale
  static setVenueName(name) {
    venueName = name;
    saveData();
    return venueName;
  }

  // Ottieni il path del logo
  static getLogoPath() {
    return logoPath;
  }

  // Imposta il path del logo
  static setLogoPath(path) {
    logoPath = path;
    saveData();
    return logoPath;
  }

  // Ottieni i link social
  static getSocialLinks() {
    return socialLinks;
  }

  // Imposta i link social
  static setSocialLinks(links) {
    socialLinks = { ...socialLinks, ...links };
    saveData();
    return socialLinks;
  }

  // Ottieni le icone social
  static getSocialIcons() {
    return socialIcons;
  }

  // Imposta le icone social
  static setSocialIcons(icons) {
    socialIcons = { ...socialIcons, ...icons };
    saveData();
    return socialIcons;
  }

  // Imposta una singola icona social
  static setSocialIcon(platform, iconPath) {
    if (socialIcons.hasOwnProperty(platform)) {
      socialIcons[platform] = iconPath;
      saveData();
      return socialIcons;
    }
    return null;
  }

  // Ottieni il testo scorrevole
  static getScrollingText() {
    return scrollingText;
  }

  // Imposta il testo scorrevole
  static setScrollingText(text) {
    scrollingText = text || '';
    saveData();
    return scrollingText;
  }

  // Ottieni la velocità di scorrimento
  static getScrollingSpeed() {
    return scrollingSpeed;
  }

  // Imposta la velocità di scorrimento
  static setScrollingSpeed(speed) {
    scrollingSpeed = parseInt(speed) || 20;
    saveData();
    return scrollingSpeed;
  }
}

module.exports = QueueModel;
