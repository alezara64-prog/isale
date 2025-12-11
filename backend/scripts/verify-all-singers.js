const fs = require('fs');

const DB_FILE = '../data/songlist.json';
const PROGRESS_FILE = './verification-progress.json';

const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const singers = Object.keys(db.songs).sort((a, b) =>
  a.localeCompare(b, 'it', {sensitivity: 'base'})
);

// Carica progresso se esiste
let progress = { currentIndex: 0, verified: [], errors: [] };
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
}

console.log('VERIFICA AUTOMATICA CANTANTI E CANZONI');
console.log('='.repeat(70));
console.log(`Totale cantanti: ${singers.length}`);
console.log(`Già verificati: ${progress.currentIndex}`);
console.log(`Da verificare: ${singers.length - progress.currentIndex}`);
console.log('');
console.log('NOTA: Questo script stampa le canzoni da verificare manualmente.');
console.log('Per ogni cantante, verificare online se le canzoni sono corrette.');
console.log('');
console.log('='.repeat(70));
console.log('');

// Mostra i prossimi 5 cantanti da verificare
const startIndex = progress.currentIndex;
const endIndex = Math.min(startIndex + 5, singers.length);

for (let i = startIndex; i < endIndex; i++) {
  const singer = singers[i];
  const songs = db.songs[singer];

  console.log(`[${i+1}/${singers.length}] ${singer} (${songs.length} canzoni)`);
  console.log('-'.repeat(70));

  // Mostra tutte le canzoni
  songs.forEach((s, idx) => {
    console.log(`  ${(idx+1).toString().padStart(2)}. ${s.title}`);
  });

  // Identifica canzoni sospette (lunghe >50 caratteri)
  const longSongs = songs.filter(s => s.title.length > 50);
  if (longSongs.length > 0) {
    console.log('');
    console.log(`  ⚠️  ATTENZIONE: ${longSongs.length} canzoni lunghe (potrebbero essere unite):`);
    longSongs.forEach(s => {
      console.log(`      "${s.title}" (${s.title.length} char)`);
    });
  }

  console.log('');
  console.log(`  🔍 Verifica online: "${singer} discografia canzoni"`);
  console.log('');
}

console.log('='.repeat(70));
console.log('');
console.log('ISTRUZIONI:');
console.log('1. Cerca online la discografia di ogni cantante');
console.log('2. Verifica se i titoli corrispondono');
console.log('3. Controlla le canzoni lunghe (potrebbero essere più canzoni unite)');
console.log('4. Crea script specifici per correggere eventuali errori');
console.log('');
console.log(`Cantanti mostrati: ${startIndex + 1} - ${endIndex}`);
