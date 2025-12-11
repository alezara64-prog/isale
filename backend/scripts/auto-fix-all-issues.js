const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('CORREZIONE AUTOMATICA DI TUTTI I PROBLEMI');
console.log('='.repeat(70));
console.log('');

let stats = {
  merged: 0,
  encodingFixed: 0,
  split: 0,
  errors: []
};

function fixEncoding(text) {
  let result = text;

  // Fix comuni encoding UTF-8
  result = result.replace(/Ã€/g, 'À');
  result = result.replace(/Ã‚/g, 'Â');
  result = result.replace(/Ã„/g, 'Ä');
  result = result.replace(/Ã‡/g, 'Ç');
  result = result.replace(/Ãˆ/g, 'È');
  result = result.replace(/Ã‰/g, 'É');
  result = result.replace(/ÃŠ/g, 'Ê');
  result = result.replace(/Ã‹/g, 'Ë');
  result = result.replace(/ÃŒ/g, 'Ì');
  result = result.replace(/ÃŽ/g, 'Î');
  result = result.replace(/Ã"/g, 'Ó');
  result = result.replace(/Ã–/g, 'Ö');
  result = result.replace(/Ã™/g, 'Ù');
  result = result.replace(/Ãš/g, 'Ú');
  result = result.replace(/Ã›/g, 'Û');
  result = result.replace(/Ãœ/g, 'Ü');
  result = result.replace(/Ã /g, 'à');
  result = result.replace(/Ã¡/g, 'á');
  result = result.replace(/Ã¢/g, 'â');
  result = result.replace(/Ã¤/g, 'ä');
  result = result.replace(/Ã§/g, 'ç');
  result = result.replace(/Ã¨/g, 'è');
  result = result.replace(/Ã©/g, 'é');
  result = result.replace(/Ãª/g, 'ê');
  result = result.replace(/Ã¬/g, 'ì');
  result = result.replace(/Ã­/g, 'í');
  result = result.replace(/Ã±/g, 'ñ');
  result = result.replace(/Ã²/g, 'ò');
  result = result.replace(/Ã³/g, 'ó');
  result = result.replace(/Ã¶/g, 'ö');
  result = result.replace(/Ã¹/g, 'ù');
  result = result.replace(/Ãº/g, 'ú');
  result = result.replace(/Ã¼/g, 'ü');

  return result;
}

console.log('FASE 1: Correzione encoding...');
console.log('-'.repeat(70));

const singers = Object.keys(db.songs);
const newDb = { songs: {}, lastUpdated: new Date().toISOString() };

for (const singer of singers) {
  const songs = db.songs[singer];
  const processedSongs = [];

  for (let i = 0; i < songs.length; i++) {
    let title = songs[i].title;
    const originalTitle = title;

    // Fix encoding
    title = fixEncoding(title);
    if (title !== originalTitle) {
      stats.encodingFixed++;
      if (stats.encodingFixed <= 10) {
        console.log(`✓ [${singer}] "${originalTitle}" → "${title}"`);
      }
    }

    // Cerca se la canzone successiva è la continuazione di questa
    let merged = false;
    if (i < songs.length - 1) {
      const nextTitle = songs[i + 1].title;

      // Pattern di canzoni spezzate
      const endsWithOpen = title.match(/\($/) || title.match(/\s(OF|AND|THE|DI|E|LA|IL|DEL|DELLA)$/i);
      const nextStartsWithClose = nextTitle.match(/^\)/) || nextTitle.match(/^[a-z]/);

      if (endsWithOpen || nextStartsWithClose) {
        // Unisci le canzoni
        const mergedTitle = `${title} ${nextTitle}`;
        processedSongs.push({
          title: fixEncoding(mergedTitle.trim()),
          authors: singer
        });

        stats.merged++;
        if (stats.merged <= 10) {
          console.log(`🔗 [${singer}] Unito: "${title}" + "${nextTitle}" → "${mergedTitle}"`);
        }

        i++; // Salta la prossima canzone perché l'abbiamo già unita
        merged = true;
      }
    }

    if (!merged) {
      processedSongs.push({
        title: title,
        authors: singer
      });
    }
  }

  newDb.songs[singer] = processedSongs;
}

console.log('');
console.log(`✓ Encoding corretti: ${stats.encodingFixed}`);
console.log(`✓ Canzoni unite: ${stats.merged}`);
console.log('');

console.log('FASE 2: Divisione canzoni lunghe...');
console.log('-'.repeat(70));

// Pattern comuni per dividere canzoni
function smartSplit(title) {
  // Non dividere medley o versioni
  if (title.includes('MEDLEY') || title.includes('VOL.') || title.length < 60) {
    return [title];
  }

  // Dividi dopo ") " + maiuscola
  let parts = title.split(/\)\s+(?=[A-Z0-9])/);
  if (parts.length > 1) {
    return parts.map((p, i) => i < parts.length - 1 ? p + ')' : p).map(s => s.trim());
  }

  // Dividi su doppi spazi
  parts = title.split(/\s{2,}/);
  if (parts.length > 1) {
    return parts.map(s => s.trim()).filter(s => s.length > 1);
  }

  return [title];
}

const finalDb = { songs: {}, lastUpdated: new Date().toISOString() };

for (const singer of Object.keys(newDb.songs)) {
  const songs = newDb.songs[singer];
  const splitSongs = [];

  for (const song of songs) {
    const splits = smartSplit(song.title);

    if (splits.length > 1) {
      stats.split++;
      if (stats.split <= 10) {
        console.log(`✂️  [${singer}] "${song.title}" → ${splits.length} canzoni`);
      }

      splits.forEach(s => {
        splitSongs.push({
          title: s,
          authors: singer
        });
      });
    } else {
      splitSongs.push(song);
    }
  }

  finalDb.songs[singer] = splitSongs;
}

console.log('');
console.log(`✓ Canzoni divise: ${stats.split}`);
console.log('');

console.log('='.repeat(70));
console.log('RIEPILOGO FINALE:');
console.log(`Encoding corretti: ${stats.encodingFixed}`);
console.log(`Canzoni unite (spezzate): ${stats.merged}`);
console.log(`Canzoni divise (lunghe): ${stats.split}`);
console.log('');

const totalSingers = Object.keys(finalDb.songs).length;
const totalSongs = Object.values(finalDb.songs).reduce((sum, arr) => sum + arr.length, 0);

console.log(`Cantanti: ${totalSingers}`);
console.log(`Canzoni totali: ${totalSongs}`);
console.log('');

// Salva database
fs.writeFileSync(DB_FILE, JSON.stringify(finalDb, null, 2), 'utf8');
console.log('✓ Database salvato!');
