const fs = require('fs');
const path = require('path');
const SongListModel = require('../src/models/songlist.model');
const pdf = require('pdf-parse');

const PDF_FOLDER = 'C:/Users/armon/Downloads/ilovepdf_extracted-pages';

// Funzione di parsing PDF (copia dall'algoritmo del controller)
function parsePDFText(text, numColumns = 6) {
  const database = {};
  const lines = text.split('\n');

  let currentSinger = null;

  for (let line of lines) {
    line = line.trim();

    // Salta righe vuote
    if (!line) continue;

    // Salta intestazioni e footer comuni
    if (line.match(/pagina|page|\d+\/\d+/i)) continue;
    if (line.match(/^M-LIVE$/i)) continue;
    if (line.match(/^CATALOGO COMPLETO/i)) continue;

    // Euristica: se la riga è tutta maiuscolo o inizia con maiuscola
    // e non contiene caratteri speciali tipici delle canzoni, è probabilmente un cantante
    // Altrimenti è una canzone

    // Pattern per identificare un cantante:
    // - Spesso in maiuscolo
    // - Non contiene parentesi o trattini all'inizio
    // - Più corto in generale

    const isLikelySinger = (
      line === line.toUpperCase() ||
      (line.length < 50 && !line.match(/^[\(\-\d]/))
    );

    if (isLikelySinger && !line.match(/^\d/)) {
      // Nuovo cantante
      currentSinger = line;
      if (!database[currentSinger]) {
        database[currentSinger] = [];
      }
    } else if (currentSinger) {
      // È una canzone
      // Pulisci la linea da eventuali numeri iniziali o caratteri speciali
      const cleanSong = line.replace(/^\d+[\.\-\s]*/, '').trim();

      if (cleanSong && cleanSong.length > 0) {
        database[currentSinger].push({
          title: cleanSong,
          authors: null
        });
      }
    }
  }

  console.log(`   📊 Cantanti trovati: ${Object.keys(database).length}`);
  console.log(`   🎵 Canzoni totali: ${Object.values(database).reduce((acc, songs) => acc + songs.length, 0)}`);

  return database;
}

// Funzione per caricare un singolo PDF
async function uploadPDF(filename, numColumns = 6) {
  try {
    console.log(`\n📄 Caricamento: ${filename}`);
    console.log(`   📊 Colonne: ${numColumns}`);

    const pdfPath = path.join(PDF_FOLDER, filename);

    // Verifica che il file esista
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`File non trovato: ${pdfPath}`);
    }

    // Leggi e parsa il PDF
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    console.log(`   📝 Testo estratto: ${text.length} caratteri`);

    // Parsing del testo
    const parsedData = parsePDFText(text, numColumns);

    // Aggiorna il database
    const result = SongListModel.updateDatabase(parsedData);

    console.log(`   ✅ Successo!`);
    console.log(`   👨‍🎤 Cantanti DB: ${result.totalSingers}`);
    console.log(`   🎵 Canzoni DB: ${result.totalSongs}`);

    return result;
  } catch (error) {
    console.error(`   ❌ Errore:`, error.message);
    throw error;
  }
}

// Test con il primo PDF
async function testFirstPDF() {
  console.log('🚀 TEST CARICAMENTO PRIMO PDF\n');
  console.log('📂 Cartella PDF:', PDF_FOLDER);
  console.log('='.repeat(60));

  try {
    // Prima resettiamo il database
    console.log('\n🗑️  Resetto il database...');
    const dataFile = path.join(__dirname, '../data/songlist.json');
    const emptyData = {
      singers: {},
      stats: {
        totalSingers: 0,
        totalSongs: 0,
        lastUpdated: new Date().toISOString()
      }
    };
    fs.writeFileSync(dataFile, JSON.stringify(emptyData, null, 2));
    console.log('✅ Database resettato');

    // Carica il primo PDF con 6 colonne
    const result = await uploadPDF('Lista basi Song Service Ottobre 2025-1.pdf', 6);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RISULTATO TEST');
    console.log('='.repeat(60));
    console.log('✅ Upload completato con successo!');
    console.log(`👨‍🎤 Cantanti totali: ${result.data.totalSingers}`);
    console.log(`🎵 Canzoni totali: ${result.data.totalSongs}`);

    // Mostra alcuni esempi di cantanti
    console.log('\n📋 Controllo database...');
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const singers = Object.keys(data.singers).sort();

    console.log(`\n🎤 PRIMI 10 CANTANTI (in ordine alfabetico):`);
    singers.slice(0, 10).forEach((singer, i) => {
      const songCount = data.singers[singer].length;
      console.log(`${(i + 1).toString().padStart(2, ' ')}. ${singer} (${songCount} canzoni)`);
      if (songCount > 0) {
        console.log(`    - ${data.singers[singer][0].title}`);
      }
    });

    console.log('\n✨ Test completato! Controlla i risultati sopra.');
    console.log('Se i cantanti e le canzoni sembrano corretti, posso procedere con tutti i 30 PDF.');

  } catch (error) {
    console.error('\n💥 Errore durante il test:', error.message);
    process.exit(1);
  }
}

// Esegui il test
testFirstPDF();
