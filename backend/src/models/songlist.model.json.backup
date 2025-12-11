// Modello per la lista canzoni karaoke
// Gestisce il catalogo completo di canzoni disponibili
const fs = require('fs');
const path = require('path');

// Path del file di persistenza
const DATA_FILE = path.join(__dirname, '../../data/songlist.json');

// Struttura dati: { singerName: [song1, song2, ...] }
let songDatabase = {};
let lastUpdated = null;

// Funzione per salvare i dati su file
function saveData() {
  try {
    const data = {
      songs: songDatabase,
      lastUpdated: new Date().toISOString()
    };

    // Crea la directory data se non esiste
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Lista canzoni salvata su file');
  } catch (error) {
    console.error('❌ Errore nel salvataggio della lista canzoni:', error);
  }
}

// Funzione per caricare i dati dal file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(fileContent);

      songDatabase = data.songs || {};
      lastUpdated = data.lastUpdated || null;

      console.log('✅ Lista canzoni caricata da file');
      console.log(`📊 Cantanti nel database: ${Object.keys(songDatabase).length}`);
    } else {
      console.log('ℹ️ Nessuna lista canzoni trovata, database vuoto');
    }
  } catch (error) {
    console.error('❌ Errore nel caricamento della lista canzoni:', error);
  }
}

// Carica i dati all'avvio
loadData();

class SongListModel {
  // Ottieni tutti i cantanti e le loro canzoni
  static getAll() {
    return {
      singers: songDatabase,
      lastUpdated: lastUpdated,
      totalSingers: Object.keys(songDatabase).length,
      totalSongs: Object.values(songDatabase).reduce((acc, songs) => acc + songs.length, 0)
    };
  }

  // Ottieni i cantanti in ordine alfabetico
  static getSingersAlphabetically() {
    const singers = Object.keys(songDatabase).sort((a, b) =>
      a.localeCompare(b, 'it', { sensitivity: 'base' })
    );

    const result = {};
    singers.forEach(singer => {
      // Ordina anche le canzoni alfabeticamente
      result[singer] = songDatabase[singer].sort((a, b) =>
        a.title.localeCompare(b.title, 'it', { sensitivity: 'base' })
      );
    });

    return result;
  }

  // Cerca cantanti per nome (case-insensitive, parziale)
  static searchSingers(query) {
    if (!query || query.trim() === '') return {};

    const lowerQuery = query.toLowerCase();
    const result = {};

    Object.keys(songDatabase).forEach(singer => {
      if (singer.toLowerCase().includes(lowerQuery)) {
        result[singer] = songDatabase[singer];
      }
    });

    return result;
  }

  // Cerca canzoni per titolo (case-insensitive, parziale)
  static searchSongs(query) {
    if (!query || query.trim() === '') return {};

    const lowerQuery = query.toLowerCase();
    const result = {};

    Object.keys(songDatabase).forEach(singer => {
      const matchingSongs = songDatabase[singer].filter(song =>
        song.title.toLowerCase().includes(lowerQuery)
      );

      if (matchingSongs.length > 0) {
        result[singer] = matchingSongs;
      }
    });

    return result;
  }

  // Cerca per cantante E canzone
  static searchBoth(singerQuery, songQuery) {
    if ((!singerQuery || singerQuery.trim() === '') &&
        (!songQuery || songQuery.trim() === '')) {
      return this.getSingersAlphabetically();
    }

    let result = {};

    // Se c'è solo la query del cantante
    if (singerQuery && singerQuery.trim() !== '' && (!songQuery || songQuery.trim() === '')) {
      return this.searchSingers(singerQuery);
    }

    // Se c'è solo la query della canzone
    if (songQuery && songQuery.trim() !== '' && (!singerQuery || singerQuery.trim() === '')) {
      return this.searchSongs(songQuery);
    }

    // Se ci sono entrambe le query
    const lowerSingerQuery = singerQuery.toLowerCase();
    const lowerSongQuery = songQuery.toLowerCase();

    Object.keys(songDatabase).forEach(singer => {
      if (singer.toLowerCase().includes(lowerSingerQuery)) {
        const matchingSongs = songDatabase[singer].filter(song =>
          song.title.toLowerCase().includes(lowerSongQuery)
        );

        if (matchingSongs.length > 0) {
          result[singer] = matchingSongs;
        }
      }
    });

    return result;
  }

  // Aggiungi/aggiorna l'intero database (da PDF parsing)
  // Ora fa un merge evitando duplicati invece di sovrascrivere
  static updateDatabase(newDatabase) {
    let addedSongs = 0;
    let skippedSongs = 0;

    // Per ogni cantante nel nuovo database
    for (const [singerName, newSongs] of Object.entries(newDatabase)) {
      if (!songDatabase[singerName]) {
        // Se il cantante non esiste, aggiungi tutto
        songDatabase[singerName] = newSongs;
        addedSongs += newSongs.length;
      } else {
        // Se il cantante esiste già, aggiungi solo le canzoni non duplicate
        const existingSongs = songDatabase[singerName];

        for (const newSong of newSongs) {
          const isDuplicate = existingSongs.some(existingSong =>
            existingSong.title.toLowerCase().trim() === newSong.title.toLowerCase().trim()
          );

          if (!isDuplicate) {
            existingSongs.push(newSong);
            addedSongs++;
          } else {
            skippedSongs++;
          }
        }
      }
    }

    lastUpdated = new Date().toISOString();
    saveData();

    return {
      success: true,
      totalSingers: Object.keys(songDatabase).length,
      totalSongs: Object.values(songDatabase).reduce((acc, songs) => acc + songs.length, 0),
      addedSongs: addedSongs,
      skippedSongs: skippedSongs,
      lastUpdated: lastUpdated
    };
  }

  // Aggiungi un singolo cantante con le sue canzoni
  static addSinger(singerName, songs) {
    if (!singerName || !songs || !Array.isArray(songs)) {
      throw new Error('Nome cantante e array di canzoni richiesti');
    }

    songDatabase[singerName] = songs.map(song => ({
      title: song.title || song,
      authors: song.authors || null
    }));

    saveData();
    return songDatabase[singerName];
  }

  // Aggiungi una canzone a un cantante esistente
  static addSongToSinger(singerName, songTitle, authors = null) {
    if (!songDatabase[singerName]) {
      songDatabase[singerName] = [];
    }

    // Verifica se la canzone esiste già
    const exists = songDatabase[singerName].some(
      song => song.title.toLowerCase() === songTitle.toLowerCase()
    );

    if (!exists) {
      songDatabase[singerName].push({
        title: songTitle,
        authors: authors
      });
      saveData();
    }

    return songDatabase[singerName];
  }

  // Rimuovi un cantante
  static removeSinger(singerName) {
    if (songDatabase[singerName]) {
      delete songDatabase[singerName];
      saveData();
      return true;
    }
    return false;
  }

  // Rimuovi una canzone da un cantante
  static removeSong(singerName, songTitle) {
    if (songDatabase[singerName]) {
      songDatabase[singerName] = songDatabase[singerName].filter(
        song => song.title.toLowerCase() !== songTitle.toLowerCase()
      );

      // Se il cantante non ha più canzoni, rimuovilo
      if (songDatabase[singerName].length === 0) {
        delete songDatabase[singerName];
      }

      saveData();
      return true;
    }
    return false;
  }

  // Rinomina un cantante
  static renameSinger(oldName, newName) {
    if (!songDatabase[oldName]) {
      return { success: false, error: 'Cantante non trovato' };
    }

    // Se il nuovo nome esiste già, fai il merge delle canzoni
    if (songDatabase[newName]) {
      const oldSongs = songDatabase[oldName];
      const existingSongs = songDatabase[newName];

      let addedCount = 0;
      let skippedCount = 0;

      // Aggiungi le canzoni del vecchio cantante al nuovo, evitando duplicati
      for (const oldSong of oldSongs) {
        const isDuplicate = existingSongs.some(existingSong =>
          existingSong.title.toLowerCase().trim() === oldSong.title.toLowerCase().trim()
        );

        if (!isDuplicate) {
          existingSongs.push(oldSong);
          addedCount++;
        } else {
          skippedCount++;
        }
      }

      // Rimuovi il vecchio cantante
      delete songDatabase[oldName];

      lastUpdated = new Date().toISOString();
      saveData();

      return {
        success: true,
        message: `Cantante "${oldName}" unito a "${newName}". Aggiunte ${addedCount} canzoni, saltate ${skippedCount} duplicate.`,
        merged: true,
        addedCount,
        skippedCount
      };
    }

    // Se il nuovo nome non esiste, rinomina semplicemente
    songDatabase[newName] = songDatabase[oldName];
    delete songDatabase[oldName];

    lastUpdated = new Date().toISOString();
    saveData();

    return { success: true, message: 'Cantante rinominato con successo' };
  }

  // Rinomina una canzone
  static renameSong(singerName, oldTitle, newTitle) {
    if (!songDatabase[singerName]) {
      return { success: false, error: 'Cantante non trovato' };
    }

    const songIndex = songDatabase[singerName].findIndex(
      s => s.title.toLowerCase() === oldTitle.toLowerCase()
    );

    if (songIndex === -1) {
      return { success: false, error: 'Canzone non trovata' };
    }

    // Verifica se il nuovo titolo esiste già
    const existingIndex = songDatabase[singerName].findIndex(
      s => s.title.toLowerCase() === newTitle.toLowerCase()
    );

    if (existingIndex !== -1 && existingIndex !== songIndex) {
      // Se esiste già una canzone con lo stesso titolo, elimina quella vecchia (duplicato)
      songDatabase[singerName].splice(songIndex, 1);

      lastUpdated = new Date().toISOString();
      saveData();

      return {
        success: true,
        message: `Canzone duplicata rimossa. Mantenuta solo "${newTitle}".`,
        merged: true
      };
    }

    // Se non esiste, rinomina normalmente
    songDatabase[singerName][songIndex].title = newTitle;

    lastUpdated = new Date().toISOString();
    saveData();

    return { success: true, message: 'Canzone rinominata con successo' };
  }

  // Reset completo del database
  static reset() {
    songDatabase = {};
    lastUpdated = null;
    saveData();
  }

  // Statistiche
  static getStats() {
    const singers = Object.keys(songDatabase);
    const totalSongs = Object.values(songDatabase).reduce((acc, songs) => acc + songs.length, 0);
    const songsWithAuthors = Object.values(songDatabase).reduce((acc, songs) =>
      acc + songs.filter(song => song.authors).length, 0
    );

    return {
      totalSingers: singers.length,
      totalSongs: totalSongs,
      songsWithAuthors: songsWithAuthors,
      lastUpdated: lastUpdated
    };
  }
}

module.exports = SongListModel;
