const fs = require('fs');
const path = require('path');

const EXTRACTED_TEXT = path.join(__dirname, '../data/extracted-text.txt');
const OUTPUT_MD = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

console.log('IMPORTAZIONE CON STRUTTURA A COLONNE');
console.log('='.repeat(70));
console.log('Input:', EXTRACTED_TEXT);
console.log('Output MD:', OUTPUT_MD);
console.log('Database:', DB_FILE);
console.log('');

// Leggi il testo estratto
const fullText = fs.readFileSync(EXTRACTED_TEXT, 'utf8');
const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const singers = {};
let currentSinger = null;
let totalSongs = 0;
let currentColumn = 0;
let singerForThisColumn = false;

console.log('PARSING CON STRUTTURA A COLONNE (1-6)...');
console.log(`Righe totali: ${lines.length}\n`);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Skip headers/footers
  if (line.includes('M-LIVE') ||
      line.includes('CATALOGO COMPLETO') ||
      line.includes('www.m-live.com') ||
      line.includes('Pagina') ||
      line.includes('Copyright') ||
      line.includes('M-Live S.r.l.')) {
    continue;
  }

  // Rileva numero di colonna
  if (/^[1-6]$/.test(line)) {
    currentColumn = parseInt(line);
    singerForThisColumn = true;
    continue;
  }

  // Rileva lettera alfabetica (sezione)
  if (/^[A-Z]$/.test(line)) {
    // Prossima riga sarà un cantante
    singerForThisColumn = true;
    continue;
  }

  // Se stiamo aspettando un cantante per questa colonna/sezione
  if (singerForThisColumn) {
    currentSinger = line;
    if (!singers[currentSinger]) {
      singers[currentSinger] = [];
    }
    singerForThisColumn = false;
    continue;
  }

  // Se abbiamo un cantante, questa è una canzone
  if (currentSinger) {
    let songTitle = line;

    // Gestisci canzoni su più righe
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1];

      // Se la prossima riga inizia con minuscola, parentesi chiusa o apostrofo, è continuazione
      if (nextLine && (
        nextLine[0] === nextLine[0].toLowerCase() ||
        nextLine.startsWith(')') ||
        nextLine.startsWith('...')
      )) {
        songTitle += ' ' + nextLine;
        i++; // Salta la prossima riga
      }
    }

    // Aggiungi la canzone se non è un duplicato
    if (songTitle && songTitle.length > 1 && !songTitle.match(/^[\d]+$/)) {
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

// Mostra anteprima primi 25 cantanti
console.log('PRIMI 25 CANTANTI:');
console.log('-'.repeat(70));
Object.keys(validSingers).slice(0, 25).forEach((singer, index) => {
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
