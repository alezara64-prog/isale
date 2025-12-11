const fs = require('fs');

const DB_FILE = 'D:\\Karaoke Manager\\backend\\data\\songlist.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('APPLICAZIONE CORREZIONI - BATCH 1 (primi 5 cantanti)');
console.log('='.repeat(70));
console.log('');

let corrections = 0;

// CORREZIONE 1: 21 SAVAGE - Spostare "ROCKSTAR" a POST MALONE
console.log('1. CORREZIONE: 21 SAVAGE → POST MALONE');
console.log('-'.repeat(70));

if (db.songs['21 SAVAGE']) {
  const savage = db.songs['21 SAVAGE'];
  const rockstarIndex = savage.findIndex(s => s.title === 'ROCKSTAR');

  if (rockstarIndex !== -1) {
    // Rimuovi da 21 SAVAGE
    savage.splice(rockstarIndex, 1);
    console.log('✓ Rimosso "ROCKSTAR" da 21 SAVAGE');

    // Aggiungi a POST MALONE (se esiste)
    if (!db.songs['POST MALONE']) {
      db.songs['POST MALONE'] = [];
    }

    // Verifica se esiste già
    const exists = db.songs['POST MALONE'].some(s => s.title.includes('ROCKSTAR'));
    if (!exists) {
      db.songs['POST MALONE'].push({
        title: 'ROCKSTAR (FEAT. 21 SAVAGE)',
        authors: 'POST MALONE'
      });
      console.log('✓ Aggiunto "ROCKSTAR (FEAT. 21 SAVAGE)" a POST MALONE');
      corrections++;
    } else {
      console.log('- "ROCKSTAR" già presente in POST MALONE');
    }

    // Se 21 SAVAGE rimane senza canzoni, rimuovi l'artista
    if (savage.length === 0) {
      delete db.songs['21 SAVAGE'];
      console.log('✓ Rimosso "21 SAVAGE" (nessuna canzone rimanente)');
    }
  }
}
console.log('');

// CORREZIONE 2: 24KGOLDN - Dividere "IN MY HEAD MOOD"
console.log('2. CORREZIONE: 24KGOLDN - Dividere canzoni unite');
console.log('-'.repeat(70));

if (db.songs['24KGOLDN']) {
  const goldn = db.songs['24KGOLDN'];
  const combinedIndex = goldn.findIndex(s => s.title === 'IN MY HEAD MOOD');

  if (combinedIndex !== -1) {
    // Rimuovi la canzone combinata
    goldn.splice(combinedIndex, 1);
    console.log('✓ Rimosso "IN MY HEAD MOOD"');

    // Aggiungi le canzoni separate (se non esistono già)
    if (!goldn.some(s => s.title === 'IN MY HEAD')) {
      goldn.push({
        title: 'IN MY HEAD',
        authors: '24KGOLDN'
      });
      console.log('✓ Aggiunto "IN MY HEAD"');
    }

    if (!goldn.some(s => s.title === 'MOOD')) {
      goldn.push({
        title: 'MOOD',
        authors: '24KGOLDN'
      });
      console.log('✓ Aggiunto "MOOD"');
    }

    corrections++;
  }
}
console.log('');

// CORREZIONE 3: 2UE - Unire canzoni spezzate
console.log('3. CORREZIONE: 2UE - Unire canzoni spezzate');
console.log('-'.repeat(70));

if (db.songs['2UE']) {
  const due = db.songs['2UE'];
  const part1Index = due.findIndex(s => s.title === 'LA TUA IMMAGINE (SOUND OF');
  const part2Index = due.findIndex(s => s.title === 'SILENCE)');

  if (part1Index !== -1 && part2Index !== -1) {
    // Rimuovi entrambe le parti
    const removed = [];
    if (part1Index > part2Index) {
      removed.push(due.splice(part1Index, 1)[0]);
      removed.push(due.splice(part2Index, 1)[0]);
    } else {
      removed.push(due.splice(part2Index, 1)[0]);
      removed.push(due.splice(part1Index, 1)[0]);
    }

    console.log('✓ Rimosso "LA TUA IMMAGINE (SOUND OF"');
    console.log('✓ Rimosso "SILENCE)"');

    // Aggiungi la canzone completa
    due.push({
      title: 'LA TUA IMMAGINE (SOUND OF SILENCE)',
      authors: '2UE'
    });
    console.log('✓ Aggiunto "LA TUA IMMAGINE (SOUND OF SILENCE)"');
    corrections++;
  }
}
console.log('');

console.log('='.repeat(70));
console.log('RIEPILOGO CORREZIONI:');
console.log(`Correzioni applicate: ${corrections}`);
console.log('');

// Salva database
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✓ Database aggiornato!');
console.log('');

// Mostra lo stato finale
console.log('STATO FINALE:');
console.log('-'.repeat(70));
if (db.songs['21 SAVAGE']) {
  console.log(`21 SAVAGE: ${db.songs['21 SAVAGE'].length} canzoni`);
} else {
  console.log('21 SAVAGE: rimosso (nessuna canzone)');
}
console.log(`24KGOLDN: ${db.songs['24KGOLDN'].length} canzoni`);
db.songs['24KGOLDN'].forEach((s, i) => {
  console.log(`  ${i+1}. ${s.title}`);
});
console.log(`2UE: ${db.songs['2UE'].length} canzoni`);
db.songs['2UE'].forEach((s, i) => {
  console.log(`  ${i+1}. ${s.title}`);
});
if (db.songs['POST MALONE']) {
  const rockstar = db.songs['POST MALONE'].find(s => s.title.includes('ROCKSTAR'));
  if (rockstar) {
    console.log(`POST MALONE: include "${rockstar.title}"`);
  }
}
