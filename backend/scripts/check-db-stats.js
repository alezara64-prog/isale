const fs = require('fs');
const db = JSON.parse(fs.readFileSync('D:\\Karaoke Manager\\backend\\data\\songlist.json', 'utf8'));

const singers = Object.keys(db.songs).length;
const songs = Object.values(db.songs).reduce((sum, arr) => sum + arr.length, 0);

console.log('DATABASE AGGIORNATO:');
console.log('='.repeat(70));
console.log('Cantanti:', singers);
console.log('Canzoni totali:', songs);
console.log('');

// Verifica POST MALONE
if (db.songs['POST MALONE']) {
  console.log('POST MALONE:');
  db.songs['POST MALONE'].forEach((s, i) => {
    console.log(`  ${i+1}. ${s.title}`);
  });
}
