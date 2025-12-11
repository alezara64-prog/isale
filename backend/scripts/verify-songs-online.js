const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('VERIFICA CANZONI ONLINE');
console.log('='.repeat(70));
console.log('');

// Per ora facciamo un test con gli 883
const artist = '883';
const songs = db.songs[artist];

console.log(`Cantante: ${artist}`);
console.log(`Canzoni nel database: ${songs.length}`);
console.log('');

// Mostra le canzoni che potrebbero avere problemi (lunghe >50 caratteri)
console.log('Canzoni da verificare (>50 caratteri):');
console.log('-'.repeat(70));

const longSongs = songs.filter(s => s.title.length > 50);
longSongs.forEach((s, i) => {
  console.log(`${i+1}. "${s.title}" (${s.title.length} char)`);
});

console.log('');
console.log(`Totale canzoni da verificare: ${longSongs.length}`);
console.log('');
console.log('NOTA: Per verificare online, Claude Code può usare WebSearch');
console.log('per cercare "883 discografia" e confrontare con la lista.');
