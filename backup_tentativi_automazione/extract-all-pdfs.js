const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const PDF_FOLDER = 'C:/Users/armon/Downloads/ilovepdf_extracted-pages';
const OUTPUT_FILE = path.join(__dirname, '../../CATALOG_COMPLETE.md');

// Leggi il file MD esistente per vedere dove siamo arrivati
let existingContent = '';
let existingSingers = new Set();
try {
  existingContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
  // Estrai i cantanti già presenti
  const singerMatches = existingContent.matchAll(/^## (.+)$/gm);
  for (const match of singerMatches) {
    existingSingers.add(match[1].trim());
  }
  console.log(`📖 Trovati ${existingSingers.size} cantanti già nel database`);
} catch (err) {
  console.log('📄 Nessun file esistente trovato, creo nuovo catalogo');
}

async function extractPDF(filename) {
  const pdfPath = path.join(PDF_FOLDER, filename);
  const dataBuffer = fs.readFileSync(pdfPath);

  try {
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (err) {
    console.error(`❌ Errore nella lettura di ${filename}:`, err.message);
    return '';
  }
}

async function processAllPDFs() {
  console.log('🚀 ESTRAZIONE AUTOMATICA DA TUTTI I PDF\n');
  console.log('📂 Cartella:', PDF_FOLDER);
  console.log('📄 File di output:', OUTPUT_FILE);
  console.log('='.repeat(70) + '\n');

  const allText = [];

  // Processa tutti i 30 PDF
  for (let i = 1; i <= 30; i++) {
    const filename = `Lista basi Song Service Ottobre 2025-${i}.pdf`;
    console.log(`📄 [${i}/30] Estrazione: ${filename}`);

    const text = await extractPDF(filename);
    if (text) {
      allText.push(text);
      console.log(`   ✅ OK - ${text.length} caratteri estratti`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 ANALISI TESTO ESTRATTO');
  console.log('='.repeat(70));

  const fullText = allText.join('\n\n');
  console.log(`✅ Testo totale estratto: ${fullText.length} caratteri`);

  // Salva il testo grezzo per debug
  const debugFile = path.join(__dirname, '../data/extracted-text.txt');
  fs.writeFileSync(debugFile, fullText, 'utf8');
  console.log(`✅ Testo grezzo salvato in: ${debugFile}`);

  // Ora dobbiamo parsare il testo per estrarre cantanti e canzoni
  console.log('\n🔍 PARSING CANTANTI E CANZONI...\n');

  const lines = fullText.split('\n');
  const singers = {};
  let currentSinger = null;
  let newSingersCount = 0;
  let newSongsCount = 0;
  let pendingSongLine = ''; // Per gestire canzoni su più righe

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Skip righe vuote o troppo corte
    if (!trimmed || trimmed.length < 2) {
      pendingSongLine = '';
      continue;
    }

    // Skip header/footer e numeri di colonna
    if (trimmed.includes('M-LIVE') ||
        trimmed.includes('CATALOGO COMPLETO') ||
        trimmed.includes('www.m-live.com') ||
        trimmed.includes('Pagina') ||
        trimmed.includes('Copyright') ||
        trimmed.includes('M-Live S.r.l.') ||
        /^\d+$/.test(trimmed)) { // Solo numeri = numero di colonna
      pendingSongLine = '';
      continue;
    }

    // Identifica cantanti: tutte maiuscole, contiene almeno una lettera
    const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);

    // Caratteri speciali comuni nei nomi di cantanti
    const hasSpecialChars = /[&\(\)\.]/.test(trimmed);

    // Non deve essere una singola lettera (es: "A" per sezione alfabetica)
    const isSingleLetter = /^[A-Z]$/.test(trimmed);

    if (isAllCaps && !isSingleLetter) {
      // Salva eventuale canzone pendente
      if (pendingSongLine && currentSinger) {
        const songTitle = pendingSongLine.trim();
        if (songTitle && !singers[currentSinger].some(s => s.title === songTitle)) {
          singers[currentSinger].push({ title: songTitle, authors: currentSinger });
          newSongsCount++;
        }
      }
      pendingSongLine = '';

      // Nuovo cantante
      currentSinger = trimmed;

      if (!singers[currentSinger]) {
        singers[currentSinger] = [];
        if (!existingSingers.has(currentSinger)) {
          newSingersCount++;
        }
      }
    } else if (currentSinger) {
      // È una canzone (o parte di una canzone su più righe)

      // Se la riga successiva esiste ed è minuscola/mixed case, probabilmente continua
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const nextIsLowerCase = nextLine && nextLine[0] && nextLine[0] === nextLine[0].toLowerCase();

      if (nextIsLowerCase && !nextLine.includes('M-LIVE')) {
        // Continua sulla prossima riga
        pendingSongLine += (pendingSongLine ? ' ' : '') + trimmed;
      } else {
        // Fine della canzone
        const songTitle = (pendingSongLine + ' ' + trimmed).trim();
        pendingSongLine = '';

        // Pulizia finale
        if (songTitle && songTitle.length > 1 && !songTitle.match(/^[\d\s]+$/)) {
          // Non aggiungere duplicati
          if (!singers[currentSinger].some(s => s.title === songTitle)) {
            singers[currentSinger].push({ title: songTitle, authors: currentSinger });
            newSongsCount++;
          }
        }
      }
    }
  }

  // Salva eventuale ultima canzone pendente
  if (pendingSongLine && currentSinger) {
    const songTitle = pendingSongLine.trim();
    if (songTitle && !singers[currentSinger].some(s => s.title === songTitle)) {
      singers[currentSinger].push({ title: songTitle, authors: currentSinger });
      newSongsCount++;
    }
  }

  console.log(`✅ Cantanti trovati: ${Object.keys(singers).length}`);
  console.log(`✅ Nuovi cantanti: ${newSingersCount}`);
  console.log(`✅ Canzoni totali: ${newSongsCount}`);

  // Mostra anteprima
  console.log('\n🎤 PRIMI 10 CANTANTI ESTRATTI:');
  console.log('-'.repeat(70));
  Object.keys(singers).sort().slice(0, 10).forEach((singer, i) => {
    console.log(`${(i + 1).toString().padStart(2, ' ')}. ${singer} (${singers[singer].length} canzoni)`);
    singers[singer].slice(0, 2).forEach(song => {
      console.log(`    - ${song.title}`);
    });
    if (singers[singer].length > 2) {
      console.log(`    ... e altre ${singers[singer].length - 2} canzoni`);
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('❓ VUOI PROCEDERE CON IL MERGE NEL FILE MD?');
  console.log('='.repeat(70));
  console.log('I dati sono stati estratti e analizzati.');
  console.log('Esegui lo script import-from-extracted.js per completare l\'importazione.');

  // Salva i dati estratti in formato JSON per il successivo import
  const extractedData = {
    singers: singers,
    metadata: {
      totalSingers: Object.keys(singers).length,
      totalSongs: newSongsCount,
      newSingers: newSingersCount,
      extractedAt: new Date().toISOString()
    }
  };

  const dataFile = path.join(__dirname, '../data/extracted-data.json');
  fs.writeFileSync(dataFile, JSON.stringify(extractedData, null, 2), 'utf8');
  console.log(`\n✅ Dati estratti salvati in: ${dataFile}`);
}

// Esegui
processAllPDFs().catch(err => {
  console.error('\n💥 Errore fatale:', err);
  process.exit(1);
});
