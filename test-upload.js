const SongListController = require('./backend/src/controllers/songlist.controller');
const SongListModel = require('./backend/src/models/songlist.model');
const path = require('path');

console.log('🧪 Test upload file Excel con nuovi filtri\n');

// Reset database
SongListModel.reset();
console.log('✅ Database resettato\n');

// Parse il file
const filePath = path.join(__dirname, 'basi Karabox per app.xlsx');
console.log(`📄 Parsing file: ${filePath}\n`);

const parsedData = SongListController.parseExcelData(filePath);

// Aggiorna database
const result = SongListModel.updateDatabase(parsedData);

console.log('\n✅ Risultato finale:', result);

// Mostra primi 20 cantanti
console.log('\n📋 Primi 20 cantanti nel database:');
const singers = Object.keys(SongListModel.getSingersAlphabetically()).slice(0, 20);
singers.forEach((singer, index) => {
  const songs = SongListModel.getSingersAlphabetically()[singer];
  console.log(`${index + 1}. ${singer} => ${songs[0].title}`);
});
