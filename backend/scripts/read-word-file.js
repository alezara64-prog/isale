const mammoth = require('mammoth');
const fs = require('fs');

const WORD_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.docx';

console.log('LETTURA FILE WORD');
console.log('='.repeat(70));
console.log('File:', WORD_FILE);
console.log('');

mammoth.extractRawText({path: WORD_FILE})
  .then(result => {
    const text = result.value;
    const messages = result.messages;

    console.log('Lunghezza testo estratto:', text.length, 'caratteri');
    console.log('');

    // Mostra le prime 100 righe per capire la struttura
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    console.log('Totale righe (non vuote):', lines.length);
    console.log('');
    console.log('PRIME 50 RIGHE:');
    console.log('-'.repeat(70));

    lines.slice(0, 50).forEach((line, i) => {
      console.log(`${(i+1).toString().padStart(3)}. ${line}`);
    });

    console.log('');
    console.log('...');
    console.log('');
    console.log('ULTIME 10 RIGHE:');
    console.log('-'.repeat(70));

    lines.slice(-10).forEach((line, i) => {
      console.log(`${(lines.length - 10 + i + 1).toString().padStart(3)}. ${line}`);
    });

    if (messages.length > 0) {
      console.log('');
      console.log('Messaggi/warning:');
      messages.forEach(m => console.log('-', m.message));
    }

    // Salva il testo completo per analisi
    fs.writeFileSync('./word-extracted-text.txt', text, 'utf8');
    console.log('');
    console.log('✓ Testo completo salvato in: word-extracted-text.txt');
  })
  .catch(err => {
    console.error('Errore:', err);
  });
