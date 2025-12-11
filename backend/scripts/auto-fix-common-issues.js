const fs = require('fs');

const DB_FILE = '../data/songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('RICERCA PROBLEMI COMUNI NEL DATABASE');
console.log('='.repeat(70));
console.log('');

const issues = {
  splitSongs: [], // Canzoni che finiscono con parentesi aperta o parole incomplete
  longSongs: [], // Canzoni >60 caratteri (probabilmente unite)
  shortSongs: [], // Canzoni <5 caratteri (probabilmente spezzate)
  encodingIssues: [] // Problemi di encoding
};

const singers = Object.keys(db.songs);

for (const singer of singers) {
  const songs = db.songs[singer];

  for (const song of songs) {
    const title = song.title;

    // Problema 1: Canzone che finisce con parentesi aperta o parola spezzata
    if (title.match(/\($/) || title.match(/\s(OF|AND|THE|DI|E|LA|IL|DEL|DELLA)$/i)) {
      issues.splitSongs.push({ singer, title });
    }

    // Problema 2: Canzone che inizia con parentesi chiusa o parola di continuazione
    if (title.match(/^\)/) || title.match(/^(SILENCE|LOVE|TIME|WORLD)/)) {
      issues.splitSongs.push({ singer, title });
    }

    // Problema 3: Canzoni molto lunghe
    if (title.length > 60 && !title.includes('MEDLEY') && !title.includes('VOL.')) {
      issues.longSongs.push({ singer, title, length: title.length });
    }

    // Problema 4: Canzoni molto corte
    if (title.length < 5 && !title.match(/^[A-Z0-9]$/)) {
      issues.shortSongs.push({ singer, title });
    }

    // Problema 5: Encoding
    if (title.includes('Ã') || title.includes('â€')) {
      issues.encodingIssues.push({ singer, title });
    }
  }
}

console.log('PROBLEMI TROVATI:');
console.log('='.repeat(70));
console.log('');

console.log(`1. CANZONI SPEZZATE: ${issues.splitSongs.length}`);
if (issues.splitSongs.length > 0) {
  console.log('   Prime 20:');
  issues.splitSongs.slice(0, 20).forEach(item => {
    console.log(`   - [${item.singer}] "${item.title}"`);
  });
  console.log('');
}

console.log(`2. CANZONI LUNGHE (>60 char): ${issues.longSongs.length}`);
if (issues.longSongs.length > 0) {
  console.log('   Prime 20:');
  issues.longSongs.slice(0, 20).forEach(item => {
    console.log(`   - [${item.singer}] "${item.title}" (${item.length} char)`);
  });
  console.log('');
}

console.log(`3. CANZONI CORTE (<5 char): ${issues.shortSongs.length}`);
if (issues.shortSongs.length > 0) {
  console.log('   Prime 20:');
  issues.shortSongs.slice(0, 20).forEach(item => {
    console.log(`   - [${item.singer}] "${item.title}"`);
  });
  console.log('');
}

console.log(`4. PROBLEMI ENCODING: ${issues.encodingIssues.length}`);
if (issues.encodingIssues.length > 0) {
  console.log('   Prime 20:');
  issues.encodingIssues.slice(0, 20).forEach(item => {
    console.log(`   - [${item.singer}] "${item.title}"`);
  });
  console.log('');
}

console.log('='.repeat(70));
console.log('RIEPILOGO:');
console.log(`Totale problemi trovati: ${
  issues.splitSongs.length +
  issues.longSongs.length +
  issues.shortSongs.length +
  issues.encodingIssues.length
}`);

// Salva report
const report = {
  timestamp: new Date().toISOString(),
  totalSingers: singers.length,
  issues: issues
};

fs.writeFileSync('./issues-report.json', JSON.stringify(report, null, 2), 'utf8');
console.log('');
console.log('✓ Report salvato in: issues-report.json');
