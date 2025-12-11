const fs = require('fs');
const db = JSON.parse(fs.readFileSync('../data/songlist.json', 'utf8'));

const singers = Object.keys(db.songs).sort((a, b) =>
  a.localeCompare(b, 'it', {sensitivity: 'base'})
);

console.log('PRIMI 20 CANTANTI IN ORDINE ALFABETICO:');
console.log('='.repeat(70));

singers.slice(0, 20).forEach((s, i) => {
  const count = db.songs[s].length;
  console.log(`${(i+1).toString().padStart(2)}. ${s} (${count} canzoni)`);
});

console.log('');
console.log(`Totale cantanti: ${singers.length}`);
