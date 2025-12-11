const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Modifica questo path con il nome del file Excel che scaricherai
const EXCEL_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.xlsx';
const OUTPUT_MD = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

console.log('PARSING FILE EXCEL');
console.log('='.repeat(70));
console.log('File:', EXCEL_FILE);
console.log('');

try {
  // Verifica se il file esiste
  if (!fs.existsSync(EXCEL_FILE)) {
    console.error('ERRORE: File Excel non trovato!');
    console.log('');
    console.log('ISTRUZIONI:');
    console.log('1. Vai su https://www.ilovepdf.com/pdf_to_excel');
    console.log('2. Carica il PDF o file Word');
    console.log('3. Converti in Excel');
    console.log('4. Scarica il file nella cartella Downloads');
    console.log('5. Rinomina il file in "Lista basi Song Service Ottobre 2025.xlsx"');
    console.log('6. Esegui di nuovo questo script');
    process.exit(1);
  }

  // Leggi il file Excel
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0]; // Prima sheet
  const worksheet = workbook.Sheets[sheetName];

  console.log(`Sheet trovato: ${sheetName}`);
  console.log('');

  // Converti in JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  console.log(`Righe totali: ${data.length}`);
  console.log(`Colonne per riga: ${data[0] ? data[0].length : 0}`);
  console.log('');

  // Mostra prime 30 righe per capire la struttura
  console.log('PRIME 30 RIGHE (con indici colonna):');
  console.log('-'.repeat(70));
  data.slice(0, 30).forEach((row, index) => {
    const rowStr = row.map((cell, colIndex) => {
      const cellStr = String(cell || '').trim();
      return cellStr ? `[${colIndex}]${cellStr}` : '';
    }).filter(s => s).join(' | ');

    if (rowStr) {
      console.log(`${(index).toString().padStart(3, ' ')}: ${rowStr}`);
    }
  });

  console.log('');
  console.log('='.repeat(70));
  console.log('ANALIZZA LA STRUTTURA:');
  console.log('- Le colonne sono separate correttamente?');
  console.log('- I cantanti sono in grassetto o in colonne specifiche?');
  console.log('- Come possiamo distinguere cantanti da canzoni?');
  console.log('');
  console.log('Una volta capito il pattern, modificheremo lo script per');
  console.log('estrarre automaticamente cantanti e canzoni.');

} catch (err) {
  console.error('ERRORE:', err.message);
  console.error(err.stack);
}
