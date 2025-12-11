const XLSX = require('xlsx');

const EXCEL_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.xlsx';

console.log('VERIFICA STILI EXCEL');
console.log('='.repeat(70));

// Leggi con cellStyles per vedere formattazione
const workbook = XLSX.readFile(EXCEL_FILE, {
  cellStyles: true,
  cellHTML: false,
  cellNF: true
});

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log(`Sheet: ${sheetName}\n`);

// Controlla le prime 30 celle della colonna A
console.log('PRIME 30 CELLE COLONNA A (con info stile):');
console.log('-'.repeat(70));

for (let row = 1; row <= 30; row++) {
  const cellAddress = `A${row}`;
  const cell = worksheet[cellAddress];

  if (cell) {
    const value = cell.v || '';
    const hasStyle = cell.s ? 'SI' : 'NO';

    console.log(`${cellAddress.padEnd(4)}: [Stile: ${hasStyle}] "${String(value).substring(0, 40)}"`);

    // Se ha stile, mostra dettagli
    if (cell.s) {
      console.log(`       Stile dettagli:`, JSON.stringify(cell.s, null, 2));
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('CONCLUSIONE:');
console.log('Se vedi oggetti "s" con "fgColor" o "bgColor" → Excel mantiene colori!');
console.log('Se "s" è sempre uguale o assente → Excel ha perso formattazione');
