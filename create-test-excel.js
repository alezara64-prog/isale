const xlsx = require('xlsx');

// Dati di test nel formato richiesto
const testData = [
  ['123456 Max Pezzali - Gli Anni (karaoke version).mp3'],
  ['234567 LIGABUE - Certe Notti (LIVE).cdg'],
  ['345678 Vasco Rossi - Albachiara.mp3'],
  ['456789 Max Pezzali - Hanno Ucciso L\'uomo Ragno (remix).kar'],
  ['567890 Ligabue - Urlando Contro Il Cielo (studio version).cdg'],
  ['678901 Vasco Rossi - Sally.mp4'],
  ['789012 883 - Come Mai (live).mp3'],
  ['890123 Vasco Rossi - Vita Spericolata.cdg'],
  ['901234 Max Pezzali - 6/1/sfigato (remix).mp3'],
  ['012345 Litfiba - El Diablo (live).mp3'],
  ['111111 Jovanotti - L\'ombelico Del Mondo.mp3'],
  ['222222 Eros Ramazzotti - Più Bella Cosa (karaoke).cdg'],
  ['333333 Laura Pausini - La Solitudine.mp3'],
  ['444444 Tiziano Ferro - Perdono (live).mp3'],
  ['555555 Renato Zero - Il Cielo (original).cdg'],
  ['666666 Gianna Nannini - Bello E Impossibile.mp3'],
  ['777777 Zucchero - Senza Una Donna (feat. Paul Young).mp3'],
  ['888888 Lucio Dalla - Caruso.cdg'],
  ['999999 Fabrizio De André - La Canzone Di Marinella.mp3'],
  ['000000 Antonello Venditti - Roma Capoccia (live).mp3']
];

// Crea un nuovo workbook
const wb = xlsx.utils.book_new();

// Crea un worksheet con i dati
const ws = xlsx.utils.aoa_to_sheet(testData);

// Aggiungi il worksheet al workbook
xlsx.utils.book_append_sheet(wb, ws, 'Canzoni Karaoke');

// Salva il file
xlsx.writeFile(wb, 'test-karaoke.xlsx');

console.log('✅ File Excel di test creato: test-karaoke.xlsx');
console.log('📊 Righe totali:', testData.length);
console.log('');
console.log('Contenuto del file:');
testData.forEach((row, index) => {
  console.log(`${index + 1}. ${row[0]}`);
});
