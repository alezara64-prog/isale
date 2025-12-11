const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('FIX ENCODING 883 - PROPER');
console.log('='.repeat(70));
console.log('');

const songs883 = db.songs['883'];
const newSongs = [];

let fixedCount = 0;

for (const song of songs883) {
  let title = song.title;
  const originalTitle = title;

  // Il problema: caratteri Ã (195) seguiti da ' (8217) che dovrebbero essere Ò
  // Ma ora abbiamo ÒÃ' quindi dobbiamo rimuovere Ã'

  // Rimuovi il pattern ÒÃ' lasciando solo Ò
  title = title.replace(/Ò[\u00C3][\u2019]/g, 'Ò');

  // Se ancora esiste il pattern Ã' senza la Ò davanti, sostituiscilo con Ò
  title = title.replace(/[\u00C3][\u2019]/g, 'Ò');

  if (title !== originalTitle) {
    console.log(`"${originalTitle}"`);
    console.log(`  → "${title}"`);
    console.log('');
    fixedCount++;
  }

  newSongs.push({
    title: title,
    authors: '883'
  });
}

console.log('='.repeat(70));
console.log(`Encoding corretti: ${fixedCount}`);
console.log('');

// Mostra tutte le canzoni corrette
console.log('Canzoni 883 con encoding corretto:');
console.log('-'.repeat(70));
newSongs.forEach((s, i) => {
  if (s.title.includes('SARÒ') || s.title.includes('CAVERÒ') ||
      s.title.includes('PREGHERÒ') || s.title.includes('CIÒ')) {
    console.log(`${(i+1).toString().padStart(2)}. ${s.title}`);
  }
});
console.log('');

// Aggiorna database
db.songs['883'] = newSongs;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

console.log('✓ Database aggiornato!');
