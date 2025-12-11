const fs = require('fs');
const db = JSON.parse(fs.readFileSync('../data/songlist.json', 'utf8'));
const songs = db.songs['883'];

console.log('Canzoni 883 da verificare online (>40 caratteri):');
console.log('='.repeat(70));

songs.forEach((s, i) => {
  if (s.title.length > 40) {
    console.log(`${(i+1).toString().padStart(2)}. ${s.title} (${s.title.length} char)`);
  }
});
