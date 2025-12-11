const fs = require('fs');
const db = JSON.parse(fs.readFileSync('../data/songlist.json', 'utf8'));
const songs = db.songs['883'];

console.log('Canzoni sospette (probabilmente non degli 883):');
console.log('='.repeat(70));

songs.forEach((s, i) => {
  // Canzoni natalizie generiche e cover
  if (s.title.includes('FELICE NATALE') ||
      s.title.includes('PICCOLO TAMBURINO') ||
      s.title.includes('CARO GESÙ') ||
      s.title.includes('DI ROSE E DI SPINE') ||
      s.title.includes('VOLARE') ||
      s.title.includes('NEL PERDONO') ||
      s.title.includes('NEL SOLE') ||
      s.title.includes('OGGI SPOSI')) {
    console.log(`${(i+1).toString().padStart(2)}. ${s.title}`);
  }
});
