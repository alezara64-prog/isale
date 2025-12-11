const mammoth = require('mammoth');
const fs = require('fs');

const WORD_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.docx';
const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';

console.log('IMPORTAZIONE DA FILE WORD CON CORREZIONE ENCODING');
console.log('='.repeat(70));
console.log('');

// Funzione per correggere encoding
function fixEncoding(text) {
  let result = text;

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
  result = result.replace(/Ã«/g, 'ë');
  result = result.replace(/Ã¬/g, 'ì');
  result = result.replace(/Ã­/g, 'í');
  result = result.replace(/Ã®/g, 'î');
  result = result.replace(/Ã¯/g, 'ï');
  result = result.replace(/Ã±/g, 'ñ');
  result = result.replace(/Ã²/g, 'ò');
  result = result.replace(/Ã³/g, 'ó');
  result = result.replace(/Ã´/g, 'ô');
  result = result.replace(/Ãµ/g, 'õ');
  result = result.replace(/Ã¶/g, 'ö');
  result = result.replace(/Ã¹/g, 'ù');
  result = result.replace(/Ãº/g, 'ú');
  result = result.replace(/Ã»/g, 'û');
  result = result.replace(/Ã¼/g, 'ü');
  result = result.replace(/Ã½/g, 'ý');

  return result;
}

mammoth.extractRawText({path: WORD_FILE})
  .then(result => {
    const text = result.value;
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log(`Righe totali: ${lines.length}`);
    console.log('');
    console.log('Parsing...');
    console.log('');

    const singers = {};
    let currentSinger = null;
    let currentSongs = [];
    let totalSongs = 0;
    let skippedLines = 0;

    for (let i = 0; i < lines.length; i++) {
      let line = fixEncoding(lines[i]);

      // Skip righe che sono solo numeri (indici)
      if (/^\d+$/.test(line)) {
        skippedLines++;
        continue;
      }

      // Skip righe vuote o molto corte
      if (line.length < 2) {
        continue;
      }

      // Struttura: canzone -> cantante -> numero -> più canzoni...
      // Il cantante è la riga dopo la prima canzone, seguita da un numero

      const nextLine = i + 1 < lines.length ? fixEncoding(lines[i + 1]) : '';
      const nextNextLine = i + 2 < lines.length ? fixEncoding(lines[i + 2]) : '';

      // Se la prossima riga è un numero, questa è probabilmente un cantante
      if (/^\d+$/.test(nextLine)) {
        // Salva il cantante precedente se esiste
        if (currentSinger && currentSongs.length > 0) {
          if (!singers[currentSinger]) {
            singers[currentSinger] = [];
          }
          singers[currentSinger].push(...currentSongs);
          totalSongs += currentSongs.length;
        }

        // Nuovo cantante
        currentSinger = line;
        currentSongs = [];
        i++; // Salta il numero
        skippedLines++;
      } else {
        // È una canzone
        // Potrebbe contenere più canzoni separate da doppi spazi
        const songs = line.split(/\s{2,}/).map(s => s.trim()).filter(s => s.length > 1);

        for (const songTitle of songs) {
          currentSongs.push({
            title: songTitle,
            authors: currentSinger || 'UNKNOWN'
          });
        }
      }
    }

    // Salva l'ultimo cantante
    if (currentSinger && currentSongs.length > 0) {
      if (!singers[currentSinger]) {
        singers[currentSinger] = [];
      }
      singers[currentSinger].push(...currentSongs);
      totalSongs += currentSongs.length;
    }

    const totalSingers = Object.keys(singers).length;

    console.log('RISULTATI:');
    console.log('='.repeat(70));
    console.log(`Cantanti trovati: ${totalSingers}`);
    console.log(`Canzoni totali: ${totalSongs}`);
    console.log(`Righe saltate (numeri): ${skippedLines}`);
    console.log('');

    // Filtra cantanti senza canzoni
    const validSingers = {};
    for (const [singer, songList] of Object.entries(singers)) {
      if (songList.length > 0) {
        validSingers[singer] = songList;
      }
    }

    const keptSingers = Object.keys(validSingers).length;
    console.log(`Cantanti con canzoni: ${keptSingers}`);
    console.log('');

    // Mostra anteprima
    console.log('PRIMI 10 CANTANTI:');
    console.log('-'.repeat(70));
    Object.keys(validSingers).slice(0, 10).forEach((singer, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${singer} (${validSingers[singer].length} canzoni)`);
      validSingers[singer].slice(0, 3).forEach(song => {
        console.log(`    - ${song.title}`);
      });
      if (validSingers[singer].length > 3) {
        console.log(`    ... e altre ${validSingers[singer].length - 3} canzoni`);
      }
    });

    console.log('');
    console.log('='.repeat(70));
    console.log('SALVATAGGIO DATABASE...');
    console.log('');

    // Salva database
    const database = {
      songs: validSingers,
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf8');
    console.log(`✓ Database salvato: ${DB_FILE}`);
    console.log('');
    console.log('='.repeat(70));
    console.log('IMPORTAZIONE COMPLETATA!');
    console.log('='.repeat(70));
    console.log(`Cantanti: ${keptSingers}`);
    console.log(`Canzoni: ${totalSongs}`);
    console.log('');
    console.log('Catalogo disponibile su: http://192.168.1.6:5173/songlist');
  })
  .catch(err => {
    console.error('Errore:', err);
  });
