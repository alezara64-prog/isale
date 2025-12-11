const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Path della cartella con i PDF
const PDF_FOLDER = 'C:/Users/armon/Downloads/ilovepdf_extracted-pages';
const DATA_FILE = path.join(__dirname, '../data/songlist.json');

// Lista di tutti i PDF da caricare (ordinati)
const PDF_FILES = [
  'Lista basi Song Service Ottobre 2025-1.pdf',
  'Lista basi Song Service Ottobre 2025-2.pdf',
  'Lista basi Song Service Ottobre 2025-3.pdf',
  'Lista basi Song Service Ottobre 2025-4.pdf',
  'Lista basi Song Service Ottobre 2025-5.pdf',
  'Lista basi Song Service Ottobre 2025-6.pdf',
  'Lista basi Song Service Ottobre 2025-7.pdf',
  'Lista basi Song Service Ottobre 2025-8.pdf',
  'Lista basi Song Service Ottobre 2025-9.pdf',
  'Lista basi Song Service Ottobre 2025-10.pdf',
  'Lista basi Song Service Ottobre 2025-11.pdf',
  'Lista basi Song Service Ottobre 2025-12.pdf',
  'Lista basi Song Service Ottobre 2025-13.pdf',
  'Lista basi Song Service Ottobre 2025-14.pdf',
  'Lista basi Song Service Ottobre 2025-15.pdf',
  'Lista basi Song Service Ottobre 2025-16.pdf',
  'Lista basi Song Service Ottobre 2025-17.pdf',
  'Lista basi Song Service Ottobre 2025-18.pdf',
  'Lista basi Song Service Ottobre 2025-19.pdf',
  'Lista basi Song Service Ottobre 2025-20.pdf',
  'Lista basi Song Service Ottobre 2025-21.pdf',
  'Lista basi Song Service Ottobre 2025-22.pdf',
  'Lista basi Song Service Ottobre 2025-23.pdf',
  'Lista basi Song Service Ottobre 2025-24.pdf',
  'Lista basi Song Service Ottobre 2025-25.pdf',
  'Lista basi Song Service Ottobre 2025-26.pdf',
  'Lista basi Song Service Ottobre 2025-27.pdf',
  'Lista basi Song Service Ottobre 2025-28.pdf',
  'Lista basi Song Service Ottobre 2025-29.pdf',
  'Lista basi Song Service Ottobre 2025-30.pdf'
];

// Database globale
let database = {};

// Parsing intelligente: distingue cantanti da canzoni
// Cantanti: righe corte, senza parentesi/trattini, tutto maiuscolo generalmente
// Canzoni: possono contenere parentesi, trattini, essere più lunghe
function parsePDFText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let localDatabase = {};
  let currentSinger = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Salta intestazioni e footer
    if (line.match(/^M-LIVE$/i)) continue;
    if (line.match(/^CATALOGO COMPLETO/i)) continue;
    if (line.match(/^pagina|page/i)) continue;
    if (/^\d{1,2}$/.test(line)) continue; // Salta numeri solitari

    // Euristica per distinguere CANTANTE da CANZONE:
    const hasParentheses = line.includes('(') || line.includes(')');
    const hasHyphen = line.includes(' - ');
    const isShort = line.length < 50;
    const hasNoSpecialChars = !line.match(/[()'\u00C0-\u00FF&\-]/); // Accenti, apostrofi, trattini

    // Parole chiave tipiche delle canzoni (non dei cantanti)
    const songIndicators = ['MEDLEY', 'VOL.', 'REMIX', 'LIVE', 'VERSION', 'MIX', 'FEAT', 'PARTE', 'SINGLE'];
    const containsSongIndicator = songIndicators.some(ind => line.toUpperCase().includes(ind));

    // Se la linea è corta, senza parentesi, senza trattini, e senza indicatori di canzone,
    // probabilmente è un CANTANTE
    const likelySinger = isShort && !hasParentheses && !hasHyphen && !containsSongIndicator;

    if (likelySinger) {
      // È un nuovo cantante
      currentSinger = line;
      if (!localDatabase[currentSinger]) {
        localDatabase[currentSinger] = [];
      }
    } else if (currentSinger) {
      // È una canzone del cantante corrente
      const exists = localDatabase[currentSinger].some(s => s.title === line);
      if (!exists) {
        localDatabase[currentSinger].push({
          title: line,
          authors: null
        });
      }
    }
  }

  return localDatabase;
}

// Merge database: aggiungi canzoni ai cantanti esistenti
function mergeDatabase(target, source) {
  for (const [singer, songs] of Object.entries(source)) {
    if (!target[singer]) {
      target[singer] = [];
    }

    // Aggiungi solo canzoni non duplicate
    for (const song of songs) {
      const exists = target[singer].some(s => s.title === song.title);
      if (!exists) {
        target[singer].push(song);
      }
    }
  }
}

// Salva il database
function saveDatabase() {
  const stats = {
    totalSingers: Object.keys(database).length,
    totalSongs: Object.values(database).reduce((acc, songs) => acc + songs.length, 0),
    lastUpdated: new Date().toISOString()
  };

  const data = {
    singers: database,
    stats: stats
  };

  // Crea la directory se non esiste
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`💾 Database salvato: ${stats.totalSingers} cantanti, ${stats.totalSongs} canzoni`);
}

// Processa un singolo PDF
async function processPDF(filename, index, total) {
  try {
    console.log(`\n📄 [${index + 1}/${total}] Caricamento: ${filename}`);

    const pdfPath = path.join(PDF_FOLDER, filename);
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    console.log(`   📝 Testo estratto: ${data.text.length} caratteri`);

    const parsed = parsePDFText(data.text);
    const singersCount = Object.keys(parsed).length;
    const songsCount = Object.values(parsed).reduce((acc, songs) => acc + songs.length, 0);

    console.log(`   ✅ Trovati: ${singersCount} cantanti, ${songsCount} canzoni`);

    // Merge nel database globale
    mergeDatabase(database, parsed);

    return true;
  } catch (error) {
    console.error(`   ❌ Errore nel caricamento di ${filename}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Inizio importazione PDF...\n');
  console.log(`📂 Cartella: ${PDF_FOLDER}`);
  console.log(`📊 File da processare: ${PDF_FILES.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < PDF_FILES.length; i++) {
    const success = await processPDF(PDF_FILES[i], i, PDF_FILES.length);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RIEPILOGO IMPORTAZIONE');
  console.log('='.repeat(60));
  console.log(`✅ PDF caricati con successo: ${successCount}`);
  console.log(`❌ PDF con errori: ${errorCount}`);
  console.log(`👨‍🎤 Cantanti totali: ${Object.keys(database).length}`);
  console.log(`🎵 Canzoni totali: ${Object.values(database).reduce((acc, songs) => acc + songs.length, 0)}`);
  console.log('='.repeat(60));

  // Salva il database finale
  saveDatabase();

  console.log('\n✨ Importazione completata!');
}

// Esegui
main().catch(err => {
  console.error('💥 Errore fatale:', err);
  process.exit(1);
});
