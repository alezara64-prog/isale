const fs = require('fs');
const path = require('path');

const EXTRACTED_TEXT = path.join(__dirname, '../data/extracted-text.txt');
const OUTPUT_MD = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

console.log('IMPORTAZIONE FINALE CON PATTERN MATCHING');
console.log('='.repeat(70));
console.log('Input:', EXTRACTED_TEXT);
console.log('Output MD:', OUTPUT_MD);
console.log('Database:', DB_FILE);
console.log('');

// Leggi il testo estratto
const fullText = fs.readFileSync(EXTRACTED_TEXT, 'utf8');
const lines = fullText.split('\n').map(l => l.trim());

const singers = {};
let currentSinger = null;
let totalSongs = 0;
let expectingSinger = false;

console.log('PARSING CON PATTERN: numero_colonna -> cantante -> canzoni...');
console.log(`Righe totali: ${lines.length}\n`);

// Pattern noti per cantanti (nomi brevi, nomi di band famose)
const knownArtistPatterns = [
  /^\d{3,4}$/,  // Anni (es: 883, 1984)
  /^[A-Z]\s[A-Z]/,  // Iniziali (es: "A B C")
  /^[A-Z0-9]+$/,  // Lettere e numeri (es: "U2", "AC/DC")
];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (!line || line.length === 0) continue;

  // Skip headers/footers
  if (line.includes('M-LIVE') ||
      line.includes('CATALOGO COMPLETO') ||
      line.includes('www.m-live.com') ||
      line.includes('Pagina') ||
      line.includes('Copyright') ||
      line.includes('M-Live S.r.l.')) {
    continue;
  }

  // Verifica se è un numero di colonna (1-6)
  if (/^[1-6]$/.test(line)) {
    expectingSinger = true;
    continue;
  }

  // Verifica se è una lettera dell'alfabeto singola (sezione)
  if (/^[A-Z]$/.test(line)) {
    expectingSinger = true;
    continue;
  }

  // Se stiamo aspettando un cantante
  if (expectingSinger) {
    currentSinger = line;
    if (!singers[currentSinger]) {
      singers[currentSinger] = [];
    }
    expectingSinger = false;
    continue;
  }

  // Se abbiamo un cantante corrente, questa è una canzone
  if (currentSinger) {
    // Gestisci canzoni su più righe (se la prossima riga inizia con minuscola)
    let songTitle = line;

    // Guarda la prossima riga
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1];

      // Se la prossima riga inizia con minuscola o con ), è continuazione
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
