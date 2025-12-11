const XLSX = require('xlsx');

const EXCEL_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.xlsx';
const wb = XLSX.readFile(EXCEL_FILE);

console.log('Sheets nel file Excel:');
console.log('='.repeat(70));
wb.SheetNames.forEach((name, index) => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, {header: 1});
  console.log(`${index + 1}. "${name}": ${data.length} righe`);
});
