const xlsx = require('xlsx');

// Dati di test per il primo foglio - Rock Italiano
const testData1 = [
  ['123456 Max Pezzali - Gli Anni (karaoke version).mp3'],
  ['234567 LIGABUE - Certe Notti (LIVE).cdg'],
  ['345678 Vasco Rossi - Albachiara [remastered].mp3'],
  ['456789 Max Pezzali - Hanno Ucciso L\'uomo Ragno (remix).kar'],
  ['567890 Ligabue - Urlando Contro Il Cielo (studio version).cdg'],
  ['678901 Vasco Rossi - Sally [audio ufficiale].mp4'],
  ['789012 883 - Come Mai (live).mp3'],
  ['890123 Vasco Rossi - Vita Spericolata [HD].cdg'],
  ['901234 Max Pezzali - 6/1/sfigato (remix).mp3'],
  ['012345 Litfiba - El Diablo (live).mp3'],
  ['111222 Vasco Rossi - Albachiara.mp3'], // Duplicato - NON deve essere aggiunto
  ['222333 Max Pezzali - Gli Anni.cdg'] // Duplicato - NON deve essere aggiunto
];

// Dati di test per il secondo foglio - Pop Italiano
const testData2 = [
  ['111111 Jovanotti - L\'ombelico Del Mondo [2023].mp3'],
  ['222222 Eros Ramazzotti - Più Bella Cosa (karaoke).cdg'],
  ['333333 Laura Pausini - La Solitudine.mp3'],
  ['444444 Tiziano Ferro - Perdono (live) [video ufficiale].mp3'],
  ['555555 Renato Zero - Il Cielo (original).cdg'],
  ['666666 Gianna Nannini - Bello E Impossibile [audio].mp3']
];

// Dati di test per il terzo foglio - Classici
const testData3 = [
  ['777777 Zucchero & Paul Young - Senza Una Donna.mp3'],              // & -> feat.
  ['888888 Lucio Dalla - Caruso.cdg'],
  ['999999 Fabrizio De André - La Canzone Di Marinella [special edition].mp3'],
  ['000000 Antonello Venditti - Roma Capoccia (live) [remastered 2020].mp3'],
  ['333444 Vasco Rossi - Albachiara (live).mp3'], // Versione LIVE - DEVE essere aggiunta!
  ['444555 Vasco Rossi - Albachiara (remix).cdg'], // Versione REMIX - DEVE essere aggiunta!
  ['555666 Zucchero ft. Paul Young - Senza Una Donna.mp3'],           // ft. -> DUPLICATO (stesso cantante)
  ['666777 ZUCCHERO Feat. Paul Young - Senza Una Donna.cdg'],         // Feat. -> DUPLICATO (stesso cantante)
  ['777888 Elton John and Kiki Dee - Don\'t Go Breaking My Heart.mp3'], // and -> feat.
  ['888999 Elton John AND Kiki Dee - Don\'t Go Breaking My Heart.cdg'], // AND -> DUPLICATO
  ['999000 max pezzali - Hanno Ucciso L\'uomo Ragno.mp3'],            // Case different - DUPLICATO (same as "Max Pezzali")
  ['111000 MAX PEZZALI - Come Mai.mp3']                                // UPPERCASE - aggiunto a "Max Pezzali"
];

// Crea un nuovo workbook
const wb = xlsx.utils.book_new();

// Crea i worksheet con i dati
const ws1 = xlsx.utils.aoa_to_sheet(testData1);
const ws2 = xlsx.utils.aoa_to_sheet(testData2);
const ws3 = xlsx.utils.aoa_to_sheet(testData3);

// Aggiungi i worksheet al workbook
xlsx.utils.book_append_sheet(wb, ws1, 'Rock Italiano');
xlsx.utils.book_append_sheet(wb, ws2, 'Pop Italiano');
xlsx.utils.book_append_sheet(wb, ws3, 'Classici');

// Salva il file nella directory principale
xlsx.writeFile(wb, '../test-karaoke.xlsx');

console.log('✅ File Excel di test creato: test-karaoke.xlsx');
console.log('📚 Fogli creati: 3');
console.log('📊 Righe totali:', testData1.length + testData2.length + testData3.length);
console.log('');
console.log('📖 Foglio 1 - Rock Italiano (' + testData1.length + ' canzoni):');
testData1.forEach((row, index) => {
  console.log(`  ${index + 1}. ${row[0]}`);
});
console.log('');
console.log('📖 Foglio 2 - Pop Italiano (' + testData2.length + ' canzoni):');
testData2.forEach((row, index) => {
  console.log(`  ${index + 1}. ${row[0]}`);
});
console.log('');
console.log('📖 Foglio 3 - Classici (' + testData3.length + ' canzoni):');
testData3.forEach((row, index) => {
  console.log(`  ${index + 1}. ${row[0]}`);
});
