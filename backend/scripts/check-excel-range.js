const XLSX = require('xlsx');

const wb = XLSX.readFile('C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.xlsx', {cellStyles: true});
const ws = wb.Sheets[wb.SheetNames[0]];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('Sheet:', wb.SheetNames[0]);
console.log('Range celle:', ws['!ref']);
console.log('Ultima riga:', range.e.r + 1); // +1 perché è 0-indexed
console.log('Ultima colonna:', String.fromCharCode(65 + range.e.c));
console.log('');
console.log('Totale sheets nel file:', wb.SheetNames.length);
wb.SheetNames.forEach((name, i) => {
  console.log(`  ${i + 1}. ${name}`);
});
