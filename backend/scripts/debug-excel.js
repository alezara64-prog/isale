const XLSX = require('xlsx');

const EXCEL_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.xlsx';

const workbook = XLSX.readFile(EXCEL_FILE);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log('DEBUG - ANALISI COLONNA 0 (prime 40 righe)');
console.log('='.repeat(70));

for (let i = 0; i < Math.min(40, data.length); i++) {
  const cell = String(data[i][0] || '').trim();
  if (cell) {
    const len = cell.length;
    const hasNewline = cell.includes('\n');
    const numLines = cell.split('\n').length;

    console.log(`Riga ${i.toString().padStart(2, ' ')}: [len=${len.toString().padStart(4, ' ')}, lines=${numLines}]`);
    console.log(`  "${cell.substring(0, 80)}${cell.length > 80 ? '...' : ''}"`);
    console.log('');
  }
}
