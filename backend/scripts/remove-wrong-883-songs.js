const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('RIMOZIONE CANZONI ERRATE DAGLI 883');
console.log('='.repeat(70));
console.log('');

const songs883 = db.songs['883'];
const correctSongs = [];
const removedSongs = [];

// Canzoni da rimuovere perché non degli 883
const wrongSongs = [
  'FELICE NATALE (HAPPY XMAS)',
  'IL PICCOLO TAMBURINO (LITTLE DRUMMER BOY)',
  'CARO GESÙ',
  'DI ROSE E DI SPINE È LA MIA VITA',
  'NEL PERDONO NEL SOLE',
  'NEL SOLE (VERSIONE BACHATA) OGGI SPOSI',
  'VOLARE (NEL BLU DIPINTO DI BLU - REGGAE STYLE)'
];

console.log('Canzoni da rimuovere (non degli 883):');
console.log('-'.repeat(70));

for (const song of songs883) {
  if (wrongSongs.includes(song.title)) {
    console.log(`✗ ${song.title}`);
    removedSongs.push(song.title);
  } else {
    correctSongs.push(song);
  }
}

console.log('');
console.log('='.repeat(70));
console.log('RISULTATI:');
console.log(`Canzoni rimosse: ${removedSongs.length}`);
console.log(`Canzoni prima: ${songs883.length}`);
console.log(`Canzoni dopo: ${correctSongs.length}`);
console.log('');

// Aggiorna database
db.songs['883'] = correctSongs;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

console.log('✓ Database aggiornato!');
console.log('');
console.log('LISTA FINALE 883 (solo canzoni corrette):');
console.log('-'.repeat(70));
correctSongs.forEach((s, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${s.title}`);
});
