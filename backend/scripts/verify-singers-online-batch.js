const fs = require('fs');

const DB_FILE = '../data/songlist.json';
const PROGRESS_FILE = './verification-progress.json';
const CORRECTIONS_FILE = './corrections-needed.json';

const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const singers = Object.keys(db.songs).sort((a, b) =>
  a.localeCompare(b, 'it', {sensitivity: 'base'})
);

// Carica o inizializza il progresso
let progress = {
  currentIndex: 0,
  totalSingers: singers.length,
  verified: [],
  corrections: []
};

if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
}

console.log('VERIFICA CANTANTI ONLINE - BATCH MODE');
console.log('='.repeat(70));
console.log(`Totale cantanti: ${singers.length}`);
console.log(`Già verificati: ${progress.currentIndex}`);
console.log(`Da verificare: ${singers.length - progress.currentIndex}`);
console.log('');
console.log('Questo script mostrerà 10 cantanti alla volta per verifica manuale online.');
console.log('');
console.log('='.repeat(70));
console.log('');

// Mostra i prossimi 10 cantanti
const batchSize = 10;
const startIndex = progress.currentIndex;
const endIndex = Math.min(startIndex + batchSize, singers.length);

const batch = [];

for (let i = startIndex; i < endIndex; i++) {
  const singer = singers[i];
  const songs = db.songs[singer];

  const info = {
    index: i + 1,
    singer: singer,
    songCount: songs.length,
    songs: songs.map(s => s.title),
    issues: []
  };

  // Identifica problemi
  const longSongs = songs.filter(s => s.title.length > 60);
  const shortSongs = songs.filter(s => s.title.length < 5);
  const splitSongs = songs.filter(s =>
    s.title.match(/\($/) ||
    s.title.match(/^\)/) ||
    s.title.match(/\s(OF|AND|THE|DI|E|LA|IL)$/i)
  );
  const encodingIssues = songs.filter(s => s.title.includes('Ã'));

  if (longSongs.length > 0) info.issues.push(`${longSongs.length} canzoni lunghe`);
  if (shortSongs.length > 0) info.issues.push(`${shortSongs.length} canzoni corte`);
  if (splitSongs.length > 0) info.issues.push(`${splitSongs.length} canzoni spezzate`);
  if (encodingIssues.length > 0) info.issues.push(`${encodingIssues.length} encoding`);

  batch.push(info);
}

// Stampa il batch corrente
batch.forEach((info, idx) => {
  console.log(`[${info.index}/${singers.length}] ${info.singer}`);
  console.log('-'.repeat(70));
  console.log(`Canzoni: ${info.songCount}`);

  if (info.issues.length > 0) {
    console.log(`⚠️  PROBLEMI: ${info.issues.join(', ')}`);
  }

  console.log('');
  console.log('Titoli:');
  info.songs.forEach((title, i) => {
    const marker = title.length > 60 ? ' ⚠️ LUNGA' :
                   title.length < 5 ? ' ⚠️ CORTA' :
                   title.includes('Ã') ? ' ⚠️ ENCODING' :
                   title.match(/\($|^\)/) ? ' ⚠️ SPEZZATA' : '';
    console.log(`  ${(i+1).toString().padStart(2)}. ${title}${marker}`);
  });

  console.log('');
  console.log(`🔍 CERCA ONLINE: "${info.singer} discography songs"`);
  console.log('');
  console.log('');
});

console.log('='.repeat(70));
console.log('');
console.log('PROSSIMI PASSI:');
console.log('1. Per ogni cantante, cerca online la discografia');
console.log('2. Verifica che i titoli corrispondano');
console.log('3. Annota le correzioni necessarie');
console.log('');
console.log(`Batch mostrato: cantanti ${startIndex + 1} - ${endIndex} di ${singers.length}`);
console.log('');
console.log('Per continuare con i prossimi 10 cantanti, aggiorna currentIndex in verification-progress.json');

// Salva il batch corrente per riferimento
fs.writeFileSync('./current-batch.json', JSON.stringify(batch, null, 2), 'utf8');
console.log('✓ Batch corrente salvato in: current-batch.json');
