const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const WORD_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.docx';
const OUTPUT_MD = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

async function parseOriginalWord() {
  console.log('PARSING FILE WORD ORIGINALE');
  console.log('='.repeat(70));
  console.log('File:', WORD_FILE);
  console.log('');

  try {
    // Estrai testo grezzo
    const result = await mammoth.extractRawText({ path: WORD_FILE });
    const text = result.value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    console.log(`Righe totali: ${lines.length}`);
    console.log('');

    const singers = {};
    let currentSinger = null;
    let totalSongs = 0;
    let expectingSinger = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip righe vuote già filtrate

      // Numero di colonna (1-6) o lettera alfabetica (A-Z)
      if (/^[1-6]$/.test(line) || /^[A-Z]$/.test(line)) {
        expectingSinger = true;
        continue;
      }

      // Se stiamo aspettando un cantante
      if (expectingSinger) {
        currentSinger = line;
        if (!singers[currentSinger]) {
          singers[currentSinger] = [];
        }
        expectingSinger = false;
        continue;
      }

      // Altrimenti è una canzone (o più canzoni sulla stessa riga)
      if (currentSinger) {
        // Alcune righe contengono multiple canzoni separate da spazi
        // Esempio: "OH LA LA LA ROCKSTAR" potrebbe essere 2 canzoni
        // Ma è difficile sapere dove dividere senza più context

        // Per ora trattiamo ogni riga come una canzone
        const songTitle = line;

        if (songTitle && songTitle.length > 1) {
          if (!singers[currentSinger].some(s => s.title === songTitle)) {
            singers[currentSinger].push({
              title: songTitle,
              authors: currentSinger
            });
            totalSongs++;
          }
        }
      }
    }

    const totalSingers = Object.keys(singers).length;

    console.log('RISULTATI PARSING:');
    console.log('='.repeat(70));
    console.log(`Cantanti trovati: ${totalSingers}`);
    console.log(`Canzoni totali: ${totalSongs}`);
    console.log('');

    // Filtra cantanti con almeno 1 canzone
    const validSingers = {};
    for (const [singer, songs] of Object.entries(singers)) {
      if (songs.length > 0) {
        validSingers[singer] = songs;
      }
    }

    // Mostra anteprima
    console.log('PRIMI 30 CANTANTI:');
    console.log('-'.repeat(70));
    Object.keys(validSingers).slice(0, 30).forEach((singer, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${singer} (${validSingers[singer].length} canzoni)`);
      validSingers[singer].slice(0, 3).forEach(song => {
        console.log(`    - ${song.title}`);
      });
      if (validSingers[singer].length > 3) {
        console.log(`    ... e altre ${validSingers[singer].length - 3} canzoni`);
      }
    });

    console.log('');
    console.log('='.repeat(70));
    console.log('Salvare nel database? (modifica lo script per continuare)');

  } catch (err) {
    console.error('ERRORE:', err.message);
    console.error(err.stack);
  }
}

parseOriginalWord();
