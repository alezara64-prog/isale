const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('AGGIUNTA CANZONI AD ALBANO');
console.log('='.repeat(70));
console.log('');

// Canzoni da aggiungere ad ALBANO
const albanoSongsToAdd = [
  'FELICE NATALE (HAPPY XMAS)',
  'IL PICCOLO TAMBURINO (LITTLE DRUMMER BOY)',
  'CARO GESÙ',
  'DI ROSE E DI SPINE È LA MIA VITA',
  'VOLARE (NEL BLU DIPINTO DI BLU - REGGAE STYLE)'
];

// Canzoni da aggiungere ad ALBANO E ROMINA
const albanoRominaSongsToAdd = [
  'NEL PERDONO',
  'NEL SOLE',
  'NEL SOLE (VERSIONE BACHATA)',
  'OGGI SPOSI'
];

// Aggiungi ad ALBANO
console.log('Aggiunta canzoni ad ALBANO:');
console.log('-'.repeat(70));
let addedToAlbano = 0;

for (const title of albanoSongsToAdd) {
  const exists = db.songs['ALBANO'].some(s => s.title === title);
  if (!exists) {
    db.songs['ALBANO'].push({
      title: title,
      authors: 'ALBANO'
    });
    console.log(`✓ ${title}`);
    addedToAlbano++;
  } else {
    console.log(`- ${title} (già presente)`);
  }
}

console.log('');
console.log('Aggiunta canzoni ad ALBANO E ROMINA:');
console.log('-'.repeat(70));
let addedToAlbanoRomina = 0;

for (const title of albanoRominaSongsToAdd) {
  const exists = db.songs['ALBANO E ROMINA'].some(s => s.title === title);
  if (!exists) {
    db.songs['ALBANO E ROMINA'].push({
      title: title,
      authors: 'ALBANO E ROMINA'
    });
    console.log(`✓ ${title}`);
    addedToAlbanoRomina++;
  } else {
    console.log(`- ${title} (già presente)`);
  }
}

console.log('');
console.log('='.repeat(70));
console.log('RISULTATI:');
console.log(`Canzoni aggiunte ad ALBANO: ${addedToAlbano}`);
console.log(`Canzoni aggiunte ad ALBANO E ROMINA: ${addedToAlbanoRomina}`);
console.log(`Totale ALBANO: ${db.songs['ALBANO'].length} canzoni`);
console.log(`Totale ALBANO E ROMINA: ${db.songs['ALBANO E ROMINA'].length} canzoni`);
console.log('');

// Salva database
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

console.log('✓ Database aggiornato!');
