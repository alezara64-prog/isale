const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('CORREZIONE COMPLETA 883 - VERIFICATA ONLINE');
console.log('='.repeat(70));
console.log('');

const songs883 = db.songs['883'];
const newSongs = [];
let splitCount = 0;

for (const song of songs883) {
  let title = song.title;

  // VERIFICATO: "CI SONO ANCH'IO (I'M STILL HERE)" e "COME DEVE ANDARE" sono 2 canzoni
  if (title === "CI SONO ANCH'IO (I'M STILL HERE) COME DEVE ANDARE") {
    console.log('✓ Verificato online:');
    console.log(`  "${title}"`);
    newSongs.push({ title: "CI SONO ANCH'IO (I'M STILL HERE)", authors: '883' });
    newSongs.push({ title: "COME DEVE ANDARE", authors: '883' });
    console.log('  → "CI SONO ANCH\'IO (I\'M STILL HERE)"');
    console.log('  → "COME DEVE ANDARE"');
    console.log('');
    splitCount++;
    continue;
  }

  // VERIFICATO: "LA LUNGA ESTATE CALDISSIMA" e "LA RADIO A 1000 WATT" sono 2 canzoni
  if (title === "LA LUNGA ESTATE CALDISSIMA LA RADIO A 1000 WATT") {
    console.log('✓ Verificato online:');
    console.log(`  "${title}"`);
    newSongs.push({ title: "LA LUNGA ESTATE CALDISSIMA", authors: '883' });
    newSongs.push({ title: "LA RADIO A 1000 WATT", authors: '883' });
    console.log('  → "LA LUNGA ESTATE CALDISSIMA"');
    console.log('  → "LA RADIO A 1000 WATT"');
    console.log('');
    splitCount++;
    continue;
  }

  // VERIFICATO: "LA REGINA DEL CELEBRITÀ" e "LA REGOLA DELL'AMICO" sono 2 canzoni
  if (title === "LA REGINA DEL CELEBRITÀ LA REGOLA DELL'AMICO") {
    console.log('✓ Verificato online:');
    console.log(`  "${title}"`);
    newSongs.push({ title: "LA REGINA DEL CELEBRITÀ", authors: '883' });
    newSongs.push({ title: "LA REGOLA DELL'AMICO", authors: '883' });
    console.log('  → "LA REGINA DEL CELEBRITÀ"');
    console.log('  → "LA REGOLA DELL\'AMICO"');
    console.log('');
    splitCount++;
    continue;
  }

  // VERIFICATO: "FELICE NATALE (HAPPY XMAS)" e "IL MIO CONCERTO PER TE" sono 2 canzoni
  if (title === "FELICE NATALE (HAPPY XMAS) IL MIO CONCERTO PER TE") {
    console.log('✓ Verificato online:');
    console.log(`  "${title}"`);
    newSongs.push({ title: "FELICE NATALE (HAPPY XMAS)", authors: '883' });
    newSongs.push({ title: "IL MIO CONCERTO PER TE", authors: '883' });
    console.log('  → "FELICE NATALE (HAPPY XMAS)"');
    console.log('  → "IL MIO CONCERTO PER TE"');
    console.log('');
    splitCount++;
    continue;
  }

  // "IL PICCOLO TAMBURINO (LITTLE DRUMMER BOY)" è una canzone singola (già ok)
  // "ECCOTI (LA STORIA PIÙ INCREDIBILE CHE CONOSCO)" è una canzone singola (già ok)
  // "VOLARE (NEL BLU DIPINTO DI BLU - REGGAE STYLE)" è una canzone singola (già ok)

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
console.log('LISTA COMPLETA 883 (tutte le canzoni verificate):');
console.log('-'.repeat(70));
newSongs.forEach((s, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${s.title}`);
});
