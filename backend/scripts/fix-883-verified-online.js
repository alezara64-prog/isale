const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('CORREZIONE 883 - VERIFICATA ONLINE');
console.log('='.repeat(70));
console.log('');
console.log('Fonte: Ricerca web su discografia 883');
console.log('');

const songs883 = db.songs['883'];
const newSongs = [];

let splitCount = 0;

for (const song of songs883) {
  let title = song.title;

  // VERIFICATO ONLINE: "IO CI SARÒ JOLLY BLUE" sono 2 canzoni separate
  if (title === "IO CI SARÒ JOLLY BLUE") {
    console.log('Divisione verificata online:');
    console.log(`  "${title}"`);
    newSongs.push({ title: "IO CI SARÒ", authors: '883' });
    newSongs.push({ title: "JOLLY BLUE", authors: '883' });
    console.log('  → "IO CI SARÒ"');
    console.log('  → "JOLLY BLUE"');
    console.log('');
    splitCount++;
    continue;
  }

  // VERIFICATO ONLINE: "TORNO SUBITO" "TUTTO CIÒ CHE HO" "UN GIORNO COSÌ" sono 3 canzoni separate
  if (title === "TORNO SUBITO TUTTO CIÒ CHE HO UN GIORNO COSÌ") {
    console.log('Divisione verificata online:');
    console.log(`  "${title}"`);
    newSongs.push({ title: "TORNO SUBITO", authors: '883' });
    newSongs.push({ title: "TUTTO CIÒ CHE HO", authors: '883' });
    newSongs.push({ title: "UN GIORNO COSÌ", authors: '883' });
    console.log('  → "TORNO SUBITO"');
    console.log('  → "TUTTO CIÒ CHE HO"');
    console.log('  → "UN GIORNO COSÌ"');
    console.log('');
    splitCount++;
    continue;
  }

  // Altre canzoni lunghe da verificare
  if (title.length > 50 && title.indexOf(' ') > 0) {
    console.log(`Da verificare manualmente: "${title}"`);
  }

  newSongs.push({ title, authors: '883' });
}

console.log('='.repeat(70));
console.log('RISULTATI:');
console.log(`Canzoni divise (verificate online): ${splitCount}`);
console.log(`Canzoni prima: ${songs883.length}`);
console.log(`Canzoni dopo: ${newSongs.length}`);
console.log('');

// Aggiorna database
db.songs['883'] = newSongs;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

console.log('✓ Database aggiornato!');
console.log('');

// Mostra tutte le canzoni 883 dopo la correzione
console.log('Lista completa 883 (dopo correzione):');
console.log('-'.repeat(70));
newSongs.forEach((s, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${s.title}`);
});
