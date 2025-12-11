const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('FIX ENCODING 883');
console.log('='.repeat(70));
console.log('');

const songs883 = db.songs['883'];
const newSongs = [];

let fixedCount = 0;

for (const song of songs883) {
  let title = song.title;
  const originalTitle = title;

  // Sostituzioni manuali per problemi di encoding
  // Il carattere problematico è Ã' che dovrebbe essere Ò
  if (title.includes('IO CI SAR')) {
    title = title.replace('IO CI SAR', 'IO CI SARÒ');
  }
  if (title.includes('ME LA CAVER')) {
    title = title.replace('ME LA CAVER', 'ME LA CAVERÒ');
  }
  if (title.includes('TUTTO CI')) {
    title = title.replace('TUTTO CI', 'TUTTO CIÒ');
  }
  if (title.includes('PREGHER')) {
    title = title.replace('PREGHER', 'PREGHERÒ');
  }

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

// Aggiorna database
db.songs['883'] = newSongs;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

console.log('✓ Database aggiornato!');
