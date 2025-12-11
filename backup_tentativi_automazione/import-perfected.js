const fs = require('fs');
const path = require('path');

const EXTRACTED_TEXT = path.join(__dirname, '../data/extracted-text.txt');
const OUTPUT_MD = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

console.log('IMPORTAZIONE CON ALGORITMO PERFEZIONATO');
console.log('='.repeat(70));
console.log('Input:', EXTRACTED_TEXT);
console.log('Output MD:', OUTPUT_MD);
console.log('Database:', DB_FILE);
console.log('');

// Leggi il testo estratto
const fullText = fs.readFileSync(EXTRACTED_TEXT, 'utf8');
const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

// Parole comuni nei TITOLI di canzoni (non nei nomi di cantanti)
const songTitleKeywords = [
  'MEDLEY', 'VOL.', 'VERSION', 'REMIX', 'LIVE', 'PIANO', 'SOLO', 'GUITAR',
  'ACOUSTIC', 'UNPLUGGED', 'REMASTERED', 'RADIO', 'EDIT', 'MIX', 'DUET',
  'IL', 'LA', 'LO', 'LE', 'GLI', 'UN', 'UNA', 'CHE', 'COSA', 'COME',
  'QUANDO', 'DOVE', 'TUTTO', 'TUTTA', 'TUTTI', 'TUTTE', 'OGNI', 'QUESTA',
  'QUESTO', 'QUELLO', 'QUELLA', 'AMORE', 'CUORE', 'VITA', 'NOTTE', 'GIORNO',
  'TEMPO', 'MONDO', 'ANNI', 'ESTATE'
];

// Determina se una riga è probabilmente un CANTANTE
function isProbablySinger(line) {
  // Skip headers/footers
  if (line.includes('M-LIVE') ||
      line.includes('CATALOGO COMPLETO') ||
      line.includes('www.m-live.com') ||
      line.includes('Pagina') ||
      line.includes('Copyright') ||
      line.includes('M-Live S.r.l.')) {
    return false;
  }

  // Skip numeri di colonna e lettere alfabetiche singole
  if (/^[1-6A-Z]$/.test(line)) {
    return false;
  }

  // Nome cantante tendono ad essere corti (< 35 caratteri)
  if (line.length > 35) {
    return false;
  }

  // Se contiene parentesi con descrizioni tipiche di canzoni, è una canzone
  if (/\((MALE|FEMALE|MEDLEY|VOL|REMIX|LIVE|VERSION|TON\.|ITALIANO|ENGLISH|SPANISH|RADIO|EDIT|MIX|DUET|PIANO|GUITAR|ACOUSTIC|UNPLUGGED|DANCE|ROCK|POP|JAZZ|SALSA|INSTRUMENTAL)/.test(line)) {
    return false;
  }

  // Se inizia con articoli italiani comuni in titoli di canzoni
  const startsWithArticle = /^(IL |LA |LO |LE |GLI |UN |UNA |CHE |COSA |COME |QUANDO |DOVE |TUTTO |TUTTA |TUTTI |TUTTE |OGNI |QUESTA |QUESTO |QUELLO |QUELLA )/.test(line);
  if (startsWithArticle) {
    return false;
  }

  // Se contiene molte parole comuni nei titoli di canzoni
  const songKeywordMatches = songTitleKeywords.filter(kw => line.includes(' ' + kw + ' ') || line.startsWith(kw + ' ') || line.endsWith(' ' + kw)).length;
  if (songKeywordMatches >= 2) {
    return false;
  }

  // Probabilmente è un cantante
  return true;
}

const singers = {};
let currentSinger = null;
let totalSongs = 0;

console.log('PARSING TESTO...');
console.log(`Righe totali: ${lines.length}\n`);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Skip righe header/footer
  if (line.includes('M-LIVE') ||
      line.includes('CATALOGO COMPLETO') ||
      line.includes('www.m-live.com') ||
      line.includes('Pagina') ||
      line.includes('Copyright') ||
      line.includes('M-Live S.r.l.')) {
    continue;
  }

  // Skip lettere alfabetiche e numeri di colonna
  if (/^[1-6A-Z]$/.test(line)) {
    continue;
  }

  // Determina se questa riga è un cantante
  if (isProbablySinger(line)) {
    // Nuovo cantante
    currentSinger = line;
    if (!singers[currentSinger]) {
      singers[currentSinger] = [];
    }
  } else if (currentSinger) {
    // È una canzone
    let songTitle = line;

    // Gestisci canzoni su più righe
    // Se la prossima riga inizia con minuscola o ), è continuazione
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      if (nextLine && (nextLine[0] === nextLine[0].toLowerCase() || nextLine.startsWith(')'))) {
        songTitle += ' ' + nextLine;
        i++; // Salta la prossima riga
      }
    }

    // Aggiungi la canzone se non è un duplicato
    if (songTitle && songTitle.length > 1) {
      if (!singers[currentSinger].some(s => s.title === songTitle)) {
        singers[currentSinger].push({
          title: songTitle,
          authors: currentSinger
        });
        totalSongs++;
      }
    }
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

// Mostra anteprima primi 20 cantanti
console.log('PRIMI 20 CANTANTI:');
console.log('-'.repeat(70));
Object.keys(validSingers).slice(0, 20).forEach((singer, index) => {
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
