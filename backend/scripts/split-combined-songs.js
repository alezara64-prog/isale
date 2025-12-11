const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('DIVISIONE INTELLIGENTE CANZONI MULTIPLE');
console.log('='.repeat(70));
console.log('');

let totalSplit = 0;
let totalSongsAfter = 0;

const newDb = { songs: {}, lastUpdated: new Date().toISOString() };

// Pattern comuni che indicano l'inizio di una nuova canzone:
// - Dopo parentesi chiusa seguita da maiuscola: ") NUOVA"
// - Dopo numeri seguiti da maiuscola: "2024 NUOVA"
// - Pattern comuni: "VOL." seguito da numero e poi maiuscola

function smartSplit(longTitle) {
  const splits = [];

  // Pattern 1: Dividi dopo ") " se seguito da maiuscola
  let parts = longTitle.split(/\)\s+(?=[A-Z])/);

  if (parts.length > 1) {
    // Ricostruisci le parti mantenendo la parentesi
    for (let i = 0; i < parts.length; i++) {
      if (i < parts.length - 1) {
        splits.push(parts[i] + ')');
      } else {
        splits.push(parts[i]);
      }
    }
    return splits.filter(s => s.trim().length > 0);
  }

  // Pattern 2: Doppio spazio
  parts = longTitle.split(/\s{2,}/);
  if (parts.length > 1) {
    return parts.filter(s => s.trim().length > 0);
  }

  // Pattern 3: Cerca pattern "PAROLA PAROLA PAROLA NUOVAPAROLA"
  // dove NUOVAPAROLA è all caps e inizia una nuova frase
  // Questo è più complicato - per ora skip

  // Se non troviamo pattern chiari, cerchiamo almeno le canzoni
  // che finiscono con pattern comuni e iniziano la prossima

  // Pattern 4: Numeri seguiti da spazio e maiuscola
  parts = longTitle.split(/(\d{4})\s+(?=[A-Z])/);
  if (parts.length > 1) {
    // Ricostruisci
    const result = [];
    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i + 1]) {
        result.push(parts[i] + parts[i + 1]);
      } else {
        result.push(parts[i]);
      }
    }
    return result.filter(s => s.trim().length > 0);
  }

  // Nessun pattern trovato - lascia com'è
  return [longTitle];
}

// Processa ogni cantante
for (const [singer, songs] of Object.entries(db.songs)) {
  newDb.songs[singer] = [];

  for (const song of songs) {
    const title = song.title;

    // Se la canzone è lunga (>50 char), prova a dividerla
    if (title.length > 50) {
      const splits = smartSplit(title);

      if (splits.length > 1) {
        totalSplit++;
        console.log(`[${singer}]`);
        console.log(`  ORIGINALE: "${title}"`);
        console.log(`  DIVISA IN ${splits.length}:`);
        splits.forEach((s, i) => {
          console.log(`    ${i + 1}. "${s}"`);
          newDb.songs[singer].push({
            title: s.trim(),
            authors: singer
          });
          totalSongsAfter++;
        });
        console.log('');
      } else {
        // Non dividibile - lascia com'è
        newDb.songs[singer].push(song);
        totalSongsAfter++;
      }
    } else {
      // Canzone normale - copia così com'è
      newDb.songs[singer].push(song);
      totalSongsAfter++;
    }
  }
}

console.log('='.repeat(70));
console.log('RISULTATI:');
console.log(`Canzoni lunghe divise: ${totalSplit}`);
console.log(`Canzoni totali prima: ${Object.values(db.songs).reduce((sum, s) => sum + s.length, 0)}`);
console.log(`Canzoni totali dopo: ${totalSongsAfter}`);
console.log('');
console.log('Salvataggio database aggiornato...');

fs.writeFileSync(DB_FILE, JSON.stringify(newDb, null, 2), 'utf8');
console.log('✓ Database salvato!');
console.log('✓ Catalogo aggiornato disponibile su: http://192.168.1.6:5173/songlist');
