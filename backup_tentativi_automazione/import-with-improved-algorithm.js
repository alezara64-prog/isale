const fs = require('fs');
const path = require('path');

const EXTRACTED_TEXT = path.join(__dirname, '../data/extracted-text.txt');
const OUTPUT_MD = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

console.log('IMPORTAZIONE MIGLIORATA DA TESTO ESTRATTO');
console.log('='.repeat(70));
console.log('Input:', EXTRACTED_TEXT);
console.log('Output MD:', OUTPUT_MD);
console.log('Database:', DB_FILE);
console.log('');

// Leggi il testo estratto
const fullText = fs.readFileSync(EXTRACTED_TEXT, 'utf8');
const lines = fullText.split('\n');

const singers = {};
let currentSinger = null;
let totalSongs = 0;
let pendingSongLine = '';

console.log('PARSING TESTO CON ALGORITMO MIGLIORATO...');
console.log(`Righe totali: ${lines.length}\n`);

// Lista di parole comuni nelle canzoni che aiutano a identificarle
const songKeywords = ['LOVE', 'YOU', 'ME', 'MY', 'THE', 'IN', 'ON', 'AND', 'OR', 'OF', 'TO', 'WITH'];

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
      /^\d+$/.test(trimmed)) {
    pendingSongLine = '';
    continue;
  }

  // Identifica cantanti: tutte maiuscole, contiene almeno una lettera
  const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  const isSingleLetter = /^[A-Z]$/.test(trimmed);

  // Heuristics per distinguere cantanti da canzoni:
  // 1. Cantanti tendono ad essere più corti (meno di 40 caratteri)
  // 2. Cantanti non contengono molte parole comuni nelle canzoni
  // 3. Se una riga ALL CAPS contiene numeri o parentesi, probabilmente è una canzone

  const hasNumbers = /\d/.test(trimmed);
  const hasParentheses = /[\(\)]/.test(trimmed);
  const wordCount = trimmed.split(/\s+/).length;

  // Conta quante song keywords contiene
  const songKeywordCount = songKeywords.filter(kw => trimmed.includes(kw)).length;

  // Probabilità che sia un cantante
  const likelySinger = isAllCaps &&
                      !isSingleLetter &&
                      trimmed.length <= 50 &&
                      wordCount <= 5 &&
                      songKeywordCount <= 1 &&
                      !hasNumbers &&
                      !trimmed.includes('(') &&
                      !trimmed.includes(')') &&
                      !trimmed.includes('\'') &&
                      !trimmed.includes('"');

  if (likelySinger) {
    // Salva eventuale canzone pendente
    if (pendingSongLine && currentSinger) {
      const songTitle = pendingSongLine.trim();
      if (songTitle && !singers[currentSinger].some(s => s.title === songTitle)) {
        singers[currentSinger].push({ title: songTitle, authors: currentSinger });
        totalSongs++;
      }
    }
    pendingSongLine = '';

    // Nuovo cantante
    currentSinger = trimmed;

    if (!singers[currentSinger]) {
      singers[currentSinger] = [];
    }
  } else if (currentSinger && isAllCaps) {
    // È una canzone in ALL CAPS
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
          totalSongs++;
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
    totalSongs++;
  }
}

const totalSingers = Object.keys(singers).length;

console.log('\nRISULTATI PARSING:');
console.log('='.repeat(70));
console.log(`Cantanti trovati: ${totalSingers}`);
console.log(`Canzoni totali: ${totalSongs}`);
console.log('');

// Filtra i cantanti che hanno almeno 1 canzone
const validSingers = {};
let filteredSingers = 0;
let keptSingers = 0;

for (const [singer, songs] of Object.entries(singers)) {
  if (songs.length > 0) {
    validSingers[singer] = songs;
    keptSingers++;
  } else {
    filteredSingers++;
  }
}

console.log(`Cantanti con canzoni: ${keptSingers}`);
console.log(`Cantanti senza canzoni (rimossi): ${filteredSingers}`);
console.log('');

// Mostra anteprima primi 15 cantanti
console.log('PRIMI 15 CANTANTI:');
console.log('-'.repeat(70));
Object.keys(validSingers).slice(0, 15).forEach((singer, index) => {
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${singer} (${validSingers[singer].length} canzoni)`);
  validSingers[singer].slice(0, 3).forEach(song => {
    console.log(`    - ${song.title}`);
  });
  if (validSingers[singer].length > 3) {
    console.log(`    ... e altre ${validSingers[singer].length - 3} canzoni`);
  }
});

// Salva in formato MD
console.log('\n' + '='.repeat(70));
console.log('SALVATAGGIO FILE MD...');

let mdContent = '# CATALOGO COMPLETO KARAOKE\n\n';
mdContent += `**Aggiornamento:** ${new Date().toLocaleDateString('it-IT')}\n\n`;
mdContent += `**Cantanti:** ${keptSingers} | **Canzoni:** ${totalSongs}\n\n`;
mdContent += '---\n\n';

// Ordina cantanti alfabeticamente
const sortedSingers = Object.keys(validSingers).sort((a, b) =>
  a.localeCompare(b, 'it', { sensitivity: 'base' })
);

for (const singer of sortedSingers) {
  mdContent += `## ${singer}\n\n`;
  for (const song of validSingers[singer]) {
    mdContent += `- ${song.title}\n`;
  }
  mdContent += '\n';
}

fs.writeFileSync(OUTPUT_MD, mdContent, 'utf8');
console.log(`File MD salvato: ${OUTPUT_MD}`);

// Salva nel database JSON
console.log('');
console.log('SALVATAGGIO DATABASE...');

const database = {
  songs: validSingers,
  lastUpdated: new Date().toISOString()
};

// Assicurati che la cartella data esista
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf8');
console.log(`Database salvato: ${DB_FILE}`);

console.log('\n' + '='.repeat(70));
console.log('IMPORTAZIONE COMPLETATA!');
console.log('='.repeat(70));
console.log(`Cantanti: ${keptSingers}`);
console.log(`Canzoni: ${totalSongs}`);
console.log('');
console.log('Il catalogo e\' ora disponibile su:');
console.log('http://192.168.1.6:5173/songlist');
