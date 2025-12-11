const fs = require('fs');

const db = JSON.parse(fs.readFileSync('../data/songlist.json', 'utf8'));
const songs883 = db.songs['883'];

console.log('Canzoni 883 con problemi:');
console.log('='.repeat(70));

songs883.forEach((s, i) => {
  // Cerca canzoni incomplete (troppo corte) o con caratteri strani
  if (s.title.length < 15 ||
      s.title.includes('Ò') ||
      s.title.match(/^(NON TI|PASSA|DI NUOVO)$/)) {
    console.log(`${i+1}. "${s.title}"`);
  }
});

console.log('');
console.log('Tutte le canzoni 883:');
console.log('='.repeat(70));
songs883.forEach((s, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${s.title}`);
});
