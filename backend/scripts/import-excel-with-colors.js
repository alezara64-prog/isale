const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const EXCEL_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.xlsx';
const OUTPUT_MD = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

console.log('IMPORTAZIONE DA EXCEL CON RICONOSCIMENTO COLORI');
console.log('='.repeat(70));
console.log('File:', EXCEL_FILE);
console.log('');

const workbook = XLSX.readFile(EXCEL_FILE, {cellStyles: true});
const totalSheets = workbook.SheetNames.length;

console.log(`Sheets trovati: ${totalSheets}`);
console.log('');

const singers = {};
let totalSongs = 0;

// Genera automaticamente tutte le colonne (A-ZZ)
const columns = [];
for (let i = 0; i < 80; i++) {
  if (i < 26) {
    columns.push(String.fromCharCode(65 + i)); // A-Z
  } else {
    const first = String.fromCharCode(65 + Math.floor((i - 26) / 26));
    const second = String.fromCharCode(65 + ((i - 26) % 26));
    columns.push(first + second); // AA-ZZ
  }
}

console.log('PARSING CON RICONOSCIMENTO COLORI...\n');

// Processa ogni sheet
for (let sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
  const sheetName = workbook.SheetNames[sheetIndex];
  const worksheet = workbook.Sheets[sheetName];

  console.log(`[${sheetIndex + 1}/${totalSheets}] ${sheetName}...`);

  // Per ogni colonna
  for (const col of columns) {
    let currentSinger = null;
    let maxRow = 6000; // Processiamo tutte le 5442+ righe

    for (let row = 1; row <= maxRow; row++) {
      const cellAddress = `${col}${row}`;
      const cell = worksheet[cellAddress];

      if (!cell || !cell.v) continue;

      const value = String(cell.v).trim();
      if (!value) continue;

      // Controlla il colore di sfondo
      const isGray = cell.s?.fgColor?.rgb === 'D5D5D5';
      const isOrange = cell.s?.fgColor?.rgb === 'FF7800';
      const isWhite = cell.s?.patternType === 'none';

      // Skip numeri di colonna (arancione)
      if (isOrange) continue;

      // Skip lettere alfabetiche singole
      if (/^[A-Z]$/.test(value)) continue;

      // Se ha sfondo grigio → È UN CANTANTE
      if (isGray) {
        currentSinger = value;
        if (!singers[currentSinger]) {
          singers[currentSinger] = [];
        }
      }
      // Se ha sfondo bianco e abbiamo un cantante → È UNA CANZONE
      else if (isWhite && currentSinger) {
        // Potrebbero essere multiple canzoni separate da newline
        const songs = value.split('\n').map(s => s.trim()).filter(s => s.length > 0);

        for (const songTitle of songs) {
          if (songTitle && songTitle.length > 1) {
            // Evita duplicati
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

const totalSingers = Object.keys(singers).length;

console.log('\n');
console.log('RISULTATI:');
console.log('='.repeat(70));
console.log(`Cantanti trovati: ${totalSingers}`);
console.log(`Canzoni totali: ${totalSongs}`);
console.log('');

// Filtra cantanti senza canzoni
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
console.log('PRIMI 20 CANTANTI:');
console.log('-'.repeat(70));
Object.keys(validSingers).slice(0, 20).forEach((singer, index) => {
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

// Ordina alfabeticamente
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
console.log(`MD salvato: ${OUTPUT_MD}`);

// Salva database
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
console.log('Catalogo disponibile su: http://192.168.1.6:5173/songlist');
