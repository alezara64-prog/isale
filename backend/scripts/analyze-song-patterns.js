const XLSX = require('xlsx');

const EXCEL_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.xlsx';
const workbook = XLSX.readFile(EXCEL_FILE, {cellStyles: true});
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

console.log('ANALISI PATTERN CANZONI MULTIPLE\n');
console.log('='.repeat(70));

// Cerca celle bianche (canzoni) molto lunghe che potrebbero contenere multiple canzoni
const longSongs = [];

for (let row = 1; row <= 200; row++) {
  for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
    const cellAddress = `${col}${row}`;
    const cell = worksheet[cellAddress];

    if (!cell || !cell.v) continue;

    const value = String(cell.v).trim();
    const isWhite = cell.s?.patternType === 'none';

    // Se è bianca (canzone) e molto lunga (>40 caratteri)
    if (isWhite && value.length > 40 && !value.includes('\n')) {
      longSongs.push({
        cell: cellAddress,
        length: value.length,
        value: value
      });
    }
  }
}

console.log(`Trovate ${longSongs.length} celle "canzone" lunghe (>40 char):\n`);

// Mostra prime 30
longSongs.slice(0, 30).forEach((item, index) => {
  console.log(`${(index + 1).toString().padStart(2)}. [${item.cell}] (${item.length} char)`);
  console.log(`    "${item.value}"`);

  // Prova a identificare pattern di separazione
  const hasDoubleSpace = item.value.includes('  ');
  const numSpaces = (item.value.match(/\s{2,}/g) || []).length;
  const numParens = (item.value.match(/\)/g) || []).length;

  console.log(`    Pattern: doppioSpazio=${hasDoubleSpace}, numSpaziDoppi=${numSpaces}, parentesi=${numParens}`);
  console.log('');
});

console.log('='.repeat(70));
console.log('SUGGERIMENTI:');
console.log('- Se vedi doppi spazi tra canzoni → usa .split(/\\s{2,}/)');
console.log('- Se le canzoni sono sempre ~20-30 char → dividi per lunghezza fissa');
console.log('- Se finiscono con ) o altro pattern → usa regex specifica');
