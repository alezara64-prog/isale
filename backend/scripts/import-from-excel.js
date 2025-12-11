const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const EXCEL_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.xlsx';
const OUTPUT_MD = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

console.log('IMPORTAZIONE DA FILE EXCEL');
console.log('='.repeat(70));
console.log('File:', EXCEL_FILE);
console.log('');

try {
  // Leggi il file Excel
  const workbook = XLSX.readFile(EXCEL_FILE);
  const totalSheets = workbook.SheetNames.length;

  console.log(`Sheets trovati: ${totalSheets}`);
  console.log('');

  const singers = {};
  let totalSongs = 0;

  // Le colonne pari (0, 2, 4, 6, 8, 10) contengono i cantanti
  // Le righe successive contengono le canzoni
  const singerColumns = [0, 2, 4, 6, 8, 10];

  console.log('PARSING TUTTI GLI SHEETS...');

  // Processa ogni sheet (ogni pagina del PDF)
  for (let sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
    const sheetName = workbook.SheetNames[sheetIndex];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    console.log(`\n[${sheetIndex + 1}/${totalSheets}] Processing "${sheetName}" (${data.length} righe)...`);

      for (const colIndex of singerColumns) {
        let currentSinger = null;

        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
          const cell = String(data[rowIndex][colIndex] || '').trim();

          if (!cell) continue;

          // Skip numeri di colonna (1-6) e lettere alfabetiche singole
          if (/^[1-6]$/.test(cell) || /^[A-Z]$/.test(cell)) {
            continue;
          }

          // Pattern chiaro dal debug:
          // - Celle con newline o molto lunghe (>100 char) = CANZONI
          // - Celle corte senza newline = CANTANTI

          const hasSongs = cell.includes('\n') || cell.length > 100;

          if (!hasSongs) {
            // Nuovo cantante
            currentSinger = cell;
            if (!singers[currentSinger]) {
              singers[currentSinger] = [];
            }
          } else if (currentSinger) {
            // È una cella con canzoni - potrebbero essere multiple canzoni
            // Dividiamo le canzoni - possono essere separate da newline o spazi doppi

            let songs = [];

            // Prima proviamo a dividere per newline
            if (cell.includes('\n')) {
              songs = cell.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            } else {
              // Altrimenti è una singola "riga" che potrebbe contenere multiple canzoni
              // Questo è più complicato - per ora trattiamola come una lista di canzoni
              // separate da pattern comuni

              // Pattern: titoli di canzoni sono spesso separati da 2+ spazi o maiuscole consecutive
              // Per ora, dividiamo ogni 2+ spazi
              songs = cell.split(/\s{2,}/).map(s => s.trim()).filter(s => s.length > 0);
            }

            // Aggiungi le canzoni
            for (const songTitle of songs) {
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
        }
      }
    }
  }

  const totalSingers = Object.keys(singers).length;

  console.log('\n');
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

  const keptSingers = Object.keys(validSingers).length;

  console.log(`Cantanti con canzoni: ${keptSingers}`);
  console.log('');

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

  console.log('\n' + '='.repeat(70));
  console.log('SALVATAGGIO...');

  // Salva in formato MD
  let mdContent = '# CATALOGO COMPLETO KARAOKE\n\n';
  mdContent += `**Aggiornamento:** ${new Date().toLocaleDateString('it-IT')}\n\n`;
  mdContent += `**Cantanti:** ${keptSingers} | **Canzoni:** ${totalSongs}\n\n`;
  mdContent += '---\n\n';

  // Ordina cantanti alfabeticamente
  const sortedSingers = Object.keys(validSingers).sort((a, b) =>
    a.localeCompare(b, 'it', { sensitivity: 'base' })
  );

  for (const singer of sortedSingers) {
    mdContent += `## ${singer}\n\n`;
    for (const song of validSingers[singer]) {
      mdContent += `- ${song.title}\n`;
    }
    mdContent += '\n';
  }

  fs.writeFileSync(OUTPUT_MD, mdContent, 'utf8');
  console.log(`File MD salvato: ${OUTPUT_MD}`);

  // Salva nel database JSON
  const database = {
    songs: validSingers,
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf8');
  console.log(`Database salvato: ${DB_FILE}`);

  console.log('\n' + '='.repeat(70));
  console.log('IMPORTAZIONE COMPLETATA!');
  console.log('='.repeat(70));
  console.log(`Cantanti: ${keptSingers}`);
  console.log(`Canzoni: ${totalSongs}`);
  console.log('');
  console.log('Il catalogo e\' ora disponibile su:');
  console.log('http://192.168.1.6:5173/songlist');

} catch (err) {
  console.error('ERRORE:', err.message);
  console.error(err.stack);
}
