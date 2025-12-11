const fs = require('fs');

const db = JSON.parse(fs.readFileSync('D:\\Karaoke Manager\\backend\\data\\songlist.json', 'utf8'));

const longSongs = [];

for (const [singer, songs] of Object.entries(db.songs)) {
  for (const song of songs) {
    if (song.title.length > 50) {
      longSongs.push({
        singer,
        title: song.title,
        len: song.title.length
      });
    }
  }
}

console.log(`Canzoni con titolo >50 caratteri: ${longSongs.length}\n`);
console.log('PRIME 30 CANZONI LUNGHE:');
console.log('='.repeat(70));

longSongs.slice(0, 30).forEach((s, i) => {
  console.log(`${(i + 1).toString().padStart(2)}. [${s.singer}] (${s.len} char)`);
  console.log(`    "${s.title}"`);
  console.log('');
});
