const fs = require('fs');
const path = require('path');

// Percorsi
const MD_FILE = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

// Leggi il file MD
console.log('📖 Lettura file MD...');
const mdContent = fs.readFileSync(MD_FILE, 'utf8');

// Parsing del file MD
const lines = mdContent.split('\n');
const singers = {};
let currentSinger = null;

for (const line of lines) {
  const trimmedLine = line.trim();

  // Controlla se è un nome di cantante (## Nome)
  if (trimmedLine.startsWith('## ') && !trimmedLine.includes('Aggiornamento')) {
    currentSinger = trimmedLine.replace('## ', '').trim();
    if (!singers[currentSinger]) {
      singers[currentSinger] = [];
    }
  }
  // Controlla se è una canzone (- Titolo)
  else if (trimmedLine.startsWith('- ') && currentSinger) {
    const songTitle = trimmedLine.replace('- ', '').trim();
    if (songTitle && !songTitle.startsWith('**')) { // Ignora le note di progresso
      singers[currentSinger].push({
        title: songTitle,
        authors: currentSinger
      });
    }
  }
}

// Conta i risultati
const singerCount = Object.keys(singers).length;
const songCount = Object.values(singers).reduce((sum, songs) => sum + songs.length, 0);

console.log('\n📊 RISULTATI PARSING:');
console.log(`✅ Cantanti trovati: ${singerCount}`);
console.log(`✅ Canzoni totali: ${songCount}`);

// Mostra primi 10 cantanti come anteprima
console.log('\n🎤 PRIMI 10 CANTANTI:');
Object.keys(singers).slice(0, 10).forEach((singer, index) => {
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${singer} (${singers[singer].length} canzoni)`);
  // Mostra prime 3 canzoni
  singers[singer].slice(0, 3).forEach(song => {
    console.log(`    - ${song.title}`);
  });
  if (singers[singer].length > 3) {
    console.log(`    ... e altre ${singers[singer].length - 3} canzoni`);
  }
});

// Salva nel database
console.log('\n💾 Salvataggio nel database...');

// Assicurati che la cartella data esista
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Salva il database con la struttura corretta per il model
// Il model si aspetta: { songs: {...}, lastUpdated: "..." }
const database = {
  songs: singers,
  lastUpdated: new Date().toISOString()
};
fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf8');

console.log(`✅ Database salvato in: ${DB_FILE}`);
console.log('\n🎉 IMPORTAZIONE COMPLETATA!');
console.log(`   Cantanti: ${singerCount}`);
console.log(`   Canzoni: ${songCount}`);
