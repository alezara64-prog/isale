const fs = require('fs');
const mammoth = require('mammoth');

const WORD_FILE = 'C:\\Users\\armon\\Downloads\\Lista basi Song Service Ottobre 2025.docx';

async function readWord() {
  console.log('LETTURA FILE WORD...');
  console.log('File:', WORD_FILE);
  console.log('='.repeat(70));
  console.log('');

  try {
    const result = await mammoth.extractRawText({ path: WORD_FILE });
    const text = result.value;

    console.log('Testo estratto con successo!');
    console.log('Lunghezza:', text.length, 'caratteri');
    console.log('');
    console.log('PRIME 150 RIGHE:');
    console.log('='.repeat(70));

    const lines = text.split('\n');
    lines.slice(0, 150).forEach((line, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}: ${line}`);
    });

    console.log('');
    console.log('='.repeat(70));
    console.log(`Totale righe: ${lines.length}`);

  } catch (err) {
    console.error('ERRORE:', err.message);
  }
}

readWord();
