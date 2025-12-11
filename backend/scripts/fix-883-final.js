const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('CORREZIONE FINALE 883');
console.log('='.repeat(70));
console.log('');

// Fix encoding per caratteri speciali
function fixEncoding(text) {
  let result = text;

  // Fix singoli caratteri
  result = result.replace(/Ã'/g, 'Ò');

  // Fix parole intere
  result = result.replace(/SARÃ'/g, 'SARÒ');
  result = result.replace(/CAVERÃ'/g, 'CAVERÒ');
  result = result.replace(/CIÃ'/g, 'CIÒ');
  result = result.replace(/PREGHERÃ'/g, 'PREGHERÒ');

  return result;
}

const songs883 = db.songs['883'];
const newSongs = [];

for (let i = 0; i < songs883.length; i++) {
  let song = songs883[i];
  let title = song.title;

  // Fix encoding
  const originalTitle = title;
  title = fixEncoding(title);

  if (title !== originalTitle) {
    console.log(`Encoding fixed: "${originalTitle}" → "${title}"`);
  }

  // Caso speciale: "NON TI" deve essere unito con la canzone successiva
  if (title === "NON TI" && i + 1 < songs883.length) {
    const nextTitle = songs883[i + 1].title;
    // La prossima canzone è "PASSA PIÙ NORD SUD OVEST EST QUALCOSA"
    // Dobbiamo creare "NON TI PASSA PIÙ" e dividere il resto

    console.log('Unione e divisione speciale:');
    console.log(`  "${title}" + "${nextTitle}"`);

    newSongs.push({
      title: "NON TI PASSA PIÙ",
      authors: '883'
    });
    newSongs.push({
      title: "NORD SUD OVEST EST",
      authors: '883'
    });
    newSongs.push({
      title: "QUALCOSA",
      authors: '883'
    });

    console.log('  → "NON TI PASSA PIÙ"');
    console.log('  → "NORD SUD OVEST EST"');
    console.log('  → "QUALCOSA"');
    console.log('');

    // Salta la prossima canzone perché l'abbiamo già processata
    i++;
    continue;
  }

  // Caso speciale: "PASSA PIÙ NORD SUD OVEST EST QUALCOSA" già processato sopra
  if (title === "PASSA PIÙ NORD SUD OVEST EST QUALCOSA" &&
      i > 0 && songs883[i - 1].title === "NON TI") {
    // Già processato, skip
    continue;
  }

  // Dividi altre canzoni ancora unite
  if (title === "ROTTA PER CASA DI DIO SE TORNERAI") {
    console.log('Divisione:');
    console.log(`  "${title}"`);
    newSongs.push({ title: "ROTTA PER CASA DI DIO", authors: '883' });
    newSongs.push({ title: "SE TORNERAI", authors: '883' });
    console.log('  → "ROTTA PER CASA DI DIO"');
    console.log('  → "SE TORNERAI"');
    console.log('');
    continue;
  }

  // Aggiungi normalmente
  newSongs.push({
    title: title,
    authors: '883'
  });
}

console.log('='.repeat(70));
console.log('RISULTATI:');
console.log(`Canzoni prima: ${songs883.length}`);
console.log(`Canzoni dopo: ${newSongs.length}`);
console.log('');

// Aggiorna database
db.songs['883'] = newSongs;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

console.log('✓ Database aggiornato!');
console.log('');
console.log('Elenco finale 883:');
console.log('-'.repeat(70));
newSongs.forEach((s, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${s.title}`);
});
