const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('SPOSTAMENTO CANZONI DA 883 AD ALBANO');
console.log('='.repeat(70));
console.log('');

// Canzoni da spostare agli 883 → ALBANO
const songsToMove = [
  { title: 'FELICE NATALE (HAPPY XMAS)', targetArtist: 'ALBANO' },
  { title: 'IL PICCOLO TAMBURINO (LITTLE DRUMMER BOY)', targetArtist: 'ALBANO' },
  { title: 'CARO GESÙ', targetArtist: 'ALBANO' },
  { title: 'DI ROSE E DI SPINE È LA MIA VITA', targetArtist: 'ALBANO' },
  { title: 'NEL PERDONO NEL SOLE', targetArtist: 'ALBANO E ROMINA' },
  { title: 'NEL SOLE (VERSIONE BACHATA) OGGI SPOSI', targetArtist: 'ALBANO E ROMINA' },
  { title: 'VOLARE (NEL BLU DIPINTO DI BLU - REGGAE STYLE)', targetArtist: 'ALBANO' }
];

// Rimuovi dagli 883 e aggiungi agli artisti corretti
const songs883 = db.songs['883'];
const correctSongs883 = [];
let movedCount = 0;

console.log('Spostamento canzoni:');
console.log('-'.repeat(70));

for (const song of songs883) {
  const toMove = songsToMove.find(s => s.title === song.title);

  if (toMove) {
    console.log(`✓ "${song.title}"`);
    console.log(`  da: 883 → ${toMove.targetArtist}`);

    // Aggiungi alla lista del cantante corretto
    if (!db.songs[toMove.targetArtist]) {
      db.songs[toMove.targetArtist] = [];
    }

    // Verifica se la canzone esiste già
    const exists = db.songs[toMove.targetArtist].some(s => s.title === song.title);
    if (!exists) {
      db.songs[toMove.targetArtist].push({
        title: song.title,
        authors: toMove.targetArtist
      });
      movedCount++;
    } else {
      console.log(`  (già presente in ${toMove.targetArtist})`);
    }
    console.log('');
  } else {
    correctSongs883.push(song);
  }
}

console.log('='.repeat(70));
console.log('RISULTATI:');
console.log(`Canzoni spostate: ${movedCount}`);
console.log(`Canzoni 883 prima: ${songs883.length}`);
console.log(`Canzoni 883 dopo: ${correctSongs883.length}`);
console.log('');

// Aggiorna database
db.songs['883'] = correctSongs883;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

console.log('✓ Database aggiornato!');
console.log('');

// Mostra le canzoni aggiunte ad Albano
console.log('Canzoni aggiunte ad ALBANO:');
console.log('-'.repeat(70));
const albanoSongs = songsToMove.filter(s => s.targetArtist === 'ALBANO').map(s => s.title);
albanoSongs.forEach(title => {
  console.log(`  + ${title}`);
});

console.log('');
console.log('Canzoni aggiunte ad ALBANO E ROMINA:');
console.log('-'.repeat(70));
const albanoRominaSongs = songsToMove.filter(s => s.targetArtist === 'ALBANO E ROMINA').map(s => s.title);
albanoRominaSongs.forEach(title => {
  console.log(`  + ${title}`);
});
