const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('CORREZIONE FINALE: Canzoni unite + Encoding');
console.log('='.repeat(70));
console.log('');

let fixedEncoding = 0;
let splitMore = 0;
let totalSongs = 0;

const newDb = { songs: {}, lastUpdated: new Date().toISOString() };

// Fix encoding comuni
function fixEncoding(text) {
  const fixes = {
    'Ã€': 'À',
    'Ã‚': 'Â',
    'Ãˆ': 'È',
    'Ã‰': 'É',
    'ÃŠ': 'Ê',
    'ÃŒ': 'Ì',
    'Ã"': 'Ó',
    'Ã™': 'Ù',
    'Ãš': 'Ú',
    'Ã ': 'à',
    'Ã¨': 'è',
    'Ã©': 'é',
    'Ã²': 'ò',
    'Ã¹': 'ù',
    'Ã„': 'Ä',
    'PIÃ™': 'PIÙ',
    'SARÃ€': 'SARÀ',
    'PERCHÃˆ': 'PERCHÉ',
    'COSÃŒ': 'COSÌ'
  };

  let result = text;
  for (const [wrong, correct] of Object.entries(fixes)) {
    result = result.replace(new RegExp(wrong, 'g'), correct);
  }
  return result;
}

// Pattern più aggressivi per dividere canzoni
function advancedSplit(title) {
  let songs = [title];

  // 1. Dividi dopo ") " seguito da maiuscola
  songs = songs.flatMap(s => {
    const parts = s.split(/\)\s+(?=[A-Z0-9])/);
    if (parts.length > 1) {
      return parts.map((p, i) => i < parts.length - 1 ? p + ')' : p);
    }
    return [s];
  });

  // 2. Dividi per doppio spazio
  songs = songs.flatMap(s => s.split(/\s{2,}/));

  // 3. NUOVO: Dividi quando vedi pattern "PAROLA PAROLA A" dove A è una sola lettera maiuscola
  // Questo cattura casi come "NORD SUD OVEST EST" che è una canzone, ma "...EST QUALCOSA" sono due canzoni

  // 4. NUOVO: Dividi quando c'è una sequenza di parole brevi (<4 lettere) seguite da parola lunga
  // Es: "SEI UN MITO" è una canzone, ma "SEI UN MITO SENZA AVERTI" sono probabilmente 2 canzoni

  // Per ora usiamo un approccio più semplice:
  // Dividi ogni 3-5 parole se la lunghezza totale è >60 caratteri

  songs = songs.flatMap(s => {
    if (s.length > 60 && !s.includes('(') && !s.includes('MEDLEY')) {
      // Conta le parole
      const words = s.split(/\s+/);

      if (words.length >= 6) {
        // Prova a dividere a metà cercando un punto di divisione naturale
        const mid = Math.floor(words.length / 2);

        // Cerca la divisione migliore intorno al punto medio
        for (let offset = 0; offset <= 2; offset++) {
          const splitPoint = mid + offset;
          if (splitPoint < words.length) {
            const part1 = words.slice(0, splitPoint).join(' ');
            const part2 = words.slice(splitPoint).join(' ');

            // Dividi solo se entrambe le parti hanno senso (>10 caratteri)
            if (part1.length > 10 && part2.length > 10) {
              return [part1, part2];
            }
          }
        }
      }
    }
    return [s];
  });

  // Pulisci e filtra
  return songs
    .map(s => s.trim())
    .filter(s => s.length > 1);
}

// Processa ogni cantante
for (const [singer, songs] of Object.entries(db.songs)) {
  newDb.songs[singer] = [];

  for (const song of songs) {
    let title = song.title;

    // Fix encoding
    const originalTitle = title;
    title = fixEncoding(title);
    if (title !== originalTitle) {
      fixedEncoding++;
    }

    // Dividi se ancora lungo
    if (title.length > 50) {
      const splits = advancedSplit(title);

      if (splits.length > 1) {
        splitMore++;
        if (splitMore <= 30) { // Mostra solo primi 30
          console.log(`[${singer}]`);
          console.log(`  ORIGINALE: "${originalTitle}"`);
          console.log(`  DIVISA IN ${splits.length}:`);
          splits.forEach((s, i) => {
            console.log(`    ${i + 1}. "${s}"`);
          });
          console.log('');
        }

        splits.forEach(s => {
          newDb.songs[singer].push({
            title: s,
            authors: singer
          });
          totalSongs++;
        });
      } else {
        newDb.songs[singer].push({ title, authors: singer });
        totalSongs++;
      }
    } else {
      newDb.songs[singer].push({ title, authors: singer });
      totalSongs++;
    }
  }
}

console.log('='.repeat(70));
console.log('RISULTATI:');
console.log(`Encoding corretti: ${fixedEncoding}`);
console.log(`Canzoni ulteriormente divise: ${splitMore}`);
console.log(`Canzoni totali: ${totalSongs}`);
console.log('');

// Salva
fs.writeFileSync(DB_FILE, JSON.stringify(newDb, null, 2), 'utf8');
console.log('✓ Database salvato!');
console.log('✓ Catalogo aggiornato: http://192.168.1.6:5173/songlist');
