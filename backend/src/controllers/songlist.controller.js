const SongListModel = require('../models/songlist.model');
const MusicInfoService = require('../services/musicInfo.service');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

class SongListController {
  // GET /api/songlist - Ottieni tutte le canzoni
  static getAllSongs(req, res) {
    try {
      console.log('📋 Chiamata GET /api/songlist');
      const data = SongListModel.getSingersAlphabetically();
      console.log('📊 Dati ottenuti:', Object.keys(data).length, 'cantanti');
      const stats = SongListModel.getStats();
      console.log('📈 Stats:', stats);

      res.json({
        success: true,
        data: data,
        stats: stats
      });
    } catch (error) {
      console.error('❌ Errore in getAllSongs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/songlist/search - Cerca canzoni
  static searchSongs(req, res) {
    try {
      const { singer, song } = req.query;

      let results;
      if (singer || song) {
        results = SongListModel.searchBoth(singer || '', song || '');
      } else {
        results = SongListModel.getSingersAlphabetically();
      }

      res.json({
        success: true,
        data: results,
        query: { singer: singer || '', song: song || '' }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/songlist/stats - Ottieni statistiche
  static getStats(req, res) {
    try {
      const stats = SongListModel.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/songlist/upload - Upload e parsing di file Excel
  static async uploadPDF(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nessun file caricato'
        });
      }

      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      console.log('📄 File Excel caricato:', req.file.originalname);
      console.log('📊 Parsing file Excel...');

      // Parsing Excel
      const parsedData = SongListController.parseExcelData(req.file.path);

      // Salva nel database (merge con esistenti)
      const result = SongListModel.updateDatabase(parsedData);

      // Rimuovi il file temporaneo
      fs.unlinkSync(req.file.path);

      console.log('✅ Database aggiornato:', result);

      res.json({
        success: true,
        message: 'File Excel caricato e processato con successo',
        data: result
      });
    } catch (error) {
      console.error('❌ Errore nel caricamento file Excel:', error);

      // Rimuovi il file temporaneo in caso di errore
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Funzione helper per il parsing di file Excel
  static parseExcelData(filePath) {
    const database = {};

    // Leggi il file Excel
    const workbook = xlsx.readFile(filePath);

    console.log(`📚 Fogli trovati nel file Excel: ${workbook.SheetNames.length}`);
    console.log(`📄 Nomi dei fogli: ${workbook.SheetNames.join(', ')}`);

    let totalRows = 0;

    // Itera su tutti i fogli del workbook
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n📖 Elaborazione foglio: "${sheetName}"`);

      const sheet = workbook.Sheets[sheetName];

      // Converti il foglio in array di righe
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      console.log(`📊 Righe nel foglio "${sheetName}": ${rows.length}`);
      totalRows += rows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Leggi solo la colonna A (indice 0)
      let rawText = row[0];

      // Salta righe vuote
      if (!rawText || rawText.toString().trim() === '') continue;

      rawText = rawText.toString().trim();

      // NUOVO: Rimuovi codice iniziale per file .cdg
      // Esempi: "SF025-12 - ", "SF356-12-05 - ", "XY001-5 - "
      // Formato: codice alfanumerico seguito da uno o più gruppi "-numero" fino al primo " - " (spazio-trattino-spazio)
      rawText = rawText.replace(/^[A-Z0-9]+(-\d+)+\s*-\s*/i, '').trim();

      // NUOVO: Rimuovi numero iniziale (a 5 cifre) seguito da " - " (es: "25698 - ")
      rawText = rawText.replace(/^\d{5}\s*-\s*/, '').trim();

      // NUOVO: Rimuovi estensioni .mkf, .dbk e .cdg alla fine della riga
      rawText = rawText.replace(/\.(mkf|dbk|cdg)$/i, '').trim();

      // Cerca il separatore " - "
      const parts = rawText.split(' - ');

      if (parts.length < 2) {
        // Non ci sono abbastanza parti, salta la riga
        console.log(`⚠️ Riga ${i + 1} ignorata (formato non valido): ${rawText}`);
        continue;
      }

      // MODIFICATO: Gestisci formato multiplo
      // Determina se è un file .cdg o .mkf/.dbk dall'input originale
      const isCdgFormat = row[0].toString().toLowerCase().includes('.cdg');
      let singerPart, songPart;

      if (isCdgFormat) {
        // Formato .cdg: "Cantante - Canzone" (ordine standard)
        singerPart = parts[0].trim();
        songPart = parts[1].trim();
      } else {
        // Formato .mkf/.dbk: "Canzone - Cantante" (ordine invertito)
        songPart = parts[0].trim();
        singerPart = parts[1].trim();
      }
      // Ignoriamo eventuali parti successive (parts[2], parts[3], ecc.)

      // 1. Rimuovi numero a 6 cifre all'inizio del cantante
      singerPart = singerPart.replace(/^\d{6}\s*/, '').trim();

      // 1b. Normalizza featuring/collaborazioni nel nome del cantante
      // Converti ft., feat., Feat., FT., &, and in un formato standard (feat.)
      singerPart = singerPart
        .replace(/\s+and\s+/gi, ' feat. ')         // and -> feat.
        .replace(/\s+&\s+/gi, ' feat. ')           // & -> feat.
        .replace(/\s+ft\.?\s+/gi, ' feat. ')       // ft. o ft -> feat.
        .replace(/\s+feat\.?\s+/gi, ' feat. ');    // Feat. o FEAT. -> feat.

      // 2. Pulisci la parte della canzone
      // Rimuovi estensioni dei file (.mp3, .cdg, ecc.)
      songPart = songPart.replace(/\.(mp3|cdg|kar|mid|midi|avi|mp4|mkv)$/i, '').trim();

      // Rimuovi sigla MFG (case-insensitive)
      songPart = songPart.replace(/\bMFG\b/gi, '').trim();

      // 3. Gestisci le parentesi tonde () e quadre []
      // Mantieni solo (live) e (remix), rimuovi tutto il resto
      // Prima salva (live) e (remix) se presenti
      const hasLive = /\(live\)/i.test(songPart);
      const hasRemix = /\(remix\)/i.test(songPart);

      // Rimuovi tutte le parentesi tonde () con il loro contenuto
      songPart = songPart.replace(/\([^)]*\)/g, '').trim();

      // Rimuovi tutte le parentesi quadre [] con il loro contenuto
      songPart = songPart.replace(/\[[^\]]*\]/g, '').trim();

      // Riaggiiungi (live) e (remix) se erano presenti (normalizzati in minuscolo)
      if (hasLive) {
        songPart = songPart + ' (live)';
      }
      if (hasRemix) {
        songPart = songPart + ' (remix)';
      }

      // 4. Pulisci spazi multipli
      singerPart = singerPart.replace(/\s+/g, ' ').trim();
      songPart = songPart.replace(/\s+/g, ' ').trim();

      // Verifica che entrambi siano validi
      if (!singerPart || !songPart) {
        console.log(`⚠️ Riga ${i + 1} ignorata (dati mancanti): "${rawText}"`);
        continue;
      }

      // Aggiungi al database
      // Trova il cantante nel database in modo case-insensitive
      let actualSingerKey = null;
      for (const existingSinger in database) {
        if (existingSinger.toLowerCase() === singerPart.toLowerCase()) {
          actualSingerKey = existingSinger;
          break;
        }
      }

      // Se non esiste, usa il nome normalizzato
      if (!actualSingerKey) {
        actualSingerKey = singerPart;
        database[actualSingerKey] = [];
      }

      // Verifica se la canzone esiste già per questo cantante
      // Confronto case-insensitive, considerando (live) e (remix) come versioni diverse
      const isDuplicate = database[actualSingerKey].some(existingSong =>
        existingSong.title.toLowerCase() === songPart.toLowerCase()
      );

      if (!isDuplicate) {
        database[actualSingerKey].push({
          title: songPart,
          authors: null
        });
      } else {
        console.log(`⚠️ Riga ${i + 1} duplicato ignorato: "${actualSingerKey} - ${songPart}"`);
      }
    }
    } // Fine loop sui fogli

    console.log('\n📊 RIEPILOGO FINALE:');
    console.log(`📚 Fogli elaborati: ${workbook.SheetNames.length}`);
    console.log(`📄 Righe totali elaborate: ${totalRows}`);
    console.log(`👨‍🎤 Cantanti trovati: ${Object.keys(database).length}`);
    console.log(`🎵 Canzoni totali: ${Object.values(database).reduce((acc, songs) => acc + songs.length, 0)}`);

    return database;
  }

  // POST /api/songlist/singer - Aggiungi un cantante (solo admin)
  static addSinger(req, res) {
    try {
      const { singerName, songs } = req.body;

      if (!singerName || !songs) {
        return res.status(400).json({
          success: false,
          error: 'Nome cantante e canzoni richiesti'
        });
      }

      const result = SongListModel.addSinger(singerName, songs);

      res.status(201).json({
        success: true,
        message: 'Cantante aggiunto',
        data: result
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE /api/songlist/singer/:name - Rimuovi un cantante (solo admin)
  static removeSinger(req, res) {
    try {
      const { name } = req.params;
      const removed = SongListModel.removeSinger(decodeURIComponent(name));

      if (!removed) {
        return res.status(404).json({
          success: false,
          error: 'Cantante non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Cantante rimosso'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/songlist/reset - Reset database (solo admin)
  static resetDatabase(req, res) {
    try {
      SongListModel.reset();
      res.json({
        success: true,
        message: 'Database canzoni resettato'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/songlist/singer/:oldName/rename - Rinomina un cantante (solo admin)
  static renameSinger(req, res) {
    try {
      const { oldName } = req.params;
      const { newName } = req.body;

      if (!newName || newName.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Il nuovo nome è richiesto'
        });
      }

      const result = SongListModel.renameSinger(decodeURIComponent(oldName), newName.trim());

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/songlist/singer/:singerName/song/:oldTitle/rename - Rinomina una canzone (solo admin)
  static renameSong(req, res) {
    try {
      const { singerName, oldTitle } = req.params;
      const { newTitle } = req.body;

      if (!newTitle || newTitle.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Il nuovo titolo è richiesto'
        });
      }

      const result = SongListModel.renameSong(
        decodeURIComponent(singerName),
        decodeURIComponent(oldTitle),
        newTitle.trim()
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/songlist/find-authors - Cerca autori per una canzone
  static async findAuthors(req, res) {
    try {
      const { songTitle, artistName } = req.query;

      if (!songTitle || !artistName) {
        return res.status(400).json({
          success: false,
          error: 'songTitle e artistName richiesti'
        });
      }

      console.log(`🔍 Ricerca autori per: "${songTitle}" di ${artistName}`);

      const authors = await MusicInfoService.findSongAuthorsSimple(songTitle, artistName);

      res.json({
        success: true,
        data: {
          songTitle,
          artistName,
          authors
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = SongListController;
