const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('CORREZIONE SOLO 883');
console.log('='.repeat(70));
console.log('');

// Fix encoding
function fixEncoding(text) {
  const fixes = {
    'À': 'À',
    'Â': 'Â',
    'È': 'È',
    'É': 'É',
    'Ê': 'Ê',
    'Ì': 'Ì',
    'Ó': 'Ó',
    'Ù': 'Ù',
    'Ú': 'Ú',
    'à': 'à',
    'è': 'è',
    'é': 'é',
    'ò': 'ò',
    'ù': 'ù',
    'Ä': 'Ä',
    'PIÙ': 'PIÙ',
    'SARÀ': 'SARÀ',
    'PERCHÉ': 'PERCHÉ',
    'COSÌ': 'COSÌ'
  };

  let result = text;
  for (const [wrong, correct] of Object.entries(fixes)) {
    result = result.replace(new RegExp(wrong, 'g'), correct);
  }
  return result;
}

// Lista manuale delle canzoni degli 883 (le più famose)
const known883Songs = [
  "NELLA NOTTE",
  "NESSUN RIMPIANTO",
  "NIENT'ALTRO CHE NOI",
  "NON TI PASSA PIÙ",
  "NORD SUD OVEST EST",
  "QUALCOSA DI NUOVO",
  "QUELLO CHE CAPITA",
  "RAGAZZO INADEGUATO",
  "ROTTA PER CASA DI DIO",
  "SE TORNERAI",
  "SEI FANTASTICA",
  "SEI UN MITO",
  "SENZA AVERTI QUI",
  "SOPRAVVIVERAI",
  "HANNO UCCISO L'UOMO RAGNO",
  "CON UN DECA",
  "COME MAI",
  "6/1/SFIGATO",
  "LA DURA LEGGE DEL GOL",
  "GLI ANNI",
  "JOLLY BLUE",
  "GRAZIE MIO DIO",
  "TI SENTO VIVERE",
  "CUMULI",
  "UNA CANZONE D'AMORE",
  "VIAGGIO AL CENTRO DEL MONDO",
  "TAPPETO DI FRAGOLE",
  "BALLA PER ME",
  "L'AMORE È SEMPRE AMORE",
  "LASCIATI AMARE",
  "SCANDALO AL SOLE"
];

// Funzione per dividere in base ai titoli noti
function smartSplit883(longTitle) {
  const songs = [];
  let remaining = longTitle;

  // Cerca tutti i titoli noti nella stringa
  for (const knownSong of known883Songs) {
    const index = remaining.indexOf(knownSong);
    if (index !== -1) {
      // Se c'è testo prima del titolo noto, potrebbe essere un'altra canzone
      if (index > 0) {
        const before = remaining.substring(0, index).trim();
        if (before.length > 3) {
          songs.push(before);
        }
      }
      songs.push(knownSong);
      remaining = remaining.substring(index + knownSong.length).trim();
    }
  }

  // Se c'è ancora testo rimanente
  if (remaining.length > 3) {
    songs.push(remaining);
  }

  // Se non abbiamo trovato nessuna divisione, usa pattern generici
  if (songs.length === 0) {
    // Pattern 1: Dividi dopo ") " + maiuscola
    let parts = longTitle.split(/\)\s+(?=[A-Z0-9])/);
    if (parts.length > 1) {
      return parts.map((p, i) => i < parts.length - 1 ? p + ')' : p).map(s => s.trim());
    }

    // Pattern 2: Doppi spazi
    parts = longTitle.split(/\s{2,}/);
    if (parts.length > 1) {
      return parts.map(s => s.trim()).filter(s => s.length > 1);
    }

    // Pattern 3: Dividi stringhe molto lunghe
    if (longTitle.length > 60) {
      const words = longTitle.split(/\s+/);
      if (words.length >= 6) {
        const mid = Math.floor(words.length / 2);
        const part1 = words.slice(0, mid).join(' ');
        const part2 = words.slice(mid).join(' ');
        if (part1.length > 10 && part2.length > 10) {
          return [part1, part2];
        }
      }
    }

    return [longTitle];
  }

  return songs.filter(s => s.length > 1);
}

// Trova le canzoni degli 883
const songs883 = db.songs['883'] || [];

console.log(`Canzoni attuali degli 883: ${songs883.length}`);
console.log('');

const newSongs = [];
let splitCount = 0;
let fixedEncodingCount = 0;

for (const song of songs883) {
  let title = song.title;

  // Fix encoding
  const originalTitle = title;
  title = fixEncoding(title);
  if (title !== originalTitle) {
    fixedEncodingCount++;
  }

  // Prova a dividere se lungo
  if (title.length > 40) {
    const splits = smartSplit883(title);

    if (splits.length > 1) {
      splitCount++;
      console.log(`ORIGINALE: "${originalTitle}"`);
      console.log(`DIVISA IN ${splits.length}:`);
      splits.forEach((s, i) => {
        console.log(`  ${i + 1}. "${s}"`);
        newSongs.push({
          title: s,
          authors: '883'
        });
      });
      console.log('');
    } else {
      newSongs.push({ title, authors: '883' });
    }
  } else {
    newSongs.push({ title, authors: '883' });
  }
}

console.log('='.repeat(70));
console.log('RISULTATI:');
console.log(`Encoding corretti: ${fixedEncodingCount}`);
console.log(`Canzoni divise: ${splitCount}`);
console.log(`Canzoni prima: ${songs883.length}`);
console.log(`Canzoni dopo: ${newSongs.length}`);
console.log('');

// Aggiorna database
db.songs['883'] = newSongs;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

console.log('✓ Database aggiornato!');
console.log('✓ Verifica su: http://192.168.1.6:5173/songlist');
