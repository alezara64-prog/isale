const fs = require('fs');
const path = require('path');
const parseDocx = require('docx-parser');

const WORD_FILE = path.join(__dirname, '../../CATALOG_COMPLETE.docx');
const OUTPUT_MD = path.join(__dirname, '../../CATALOG_COMPLETE.md');
const DB_FILE = path.join(__dirname, '../data/songlist.json');

async function parseWordDocument() {
  console.log('PARSING FILE WORD...');
  console.log('='.repeat(70));
  console.log('File Word:', WORD_FILE);
  console.log('Output MD:', OUTPUT_MD);
  console.log('Database:', DB_FILE);
  console.log('');

  try {
    // Leggi il file Word
    const docxBuffer = fs.readFileSync(WORD_FILE);
    const docxText = await parseDocx.parseDocx(docxBuffer);

    console.log('File Word letto, lunghezza testo:', docxText.length);
    console.log('');

    // Salva il testo grezzo per debug
    const debugFile = path.join(__dirname, '../data/extracted-word-text.txt');
    fs.writeFileSync(debugFile, docxText, 'utf8');
    console.log(`Testo grezzo salvato in: ${debugFile}`);
    console.log('');

    // Parse text per estrarre cantanti e canzoni
    const singers = {};
    let currentSinger = null;
    let totalSongs = 0;

    // Estrai le righe
    const lines = docxText.split('\n');

    console.log('ANALISI CONTENUTO...\n');
    console.log(`Totale righe da processare: ${lines.length}\n`);

    let pendingSongLine = '';

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      // Skip righe vuote o troppo corte
      if (!trimmed || trimmed.length < 2) {
        pendingSongLine = '';
        continue;
      }

      // Skip header/footer e numeri di colonna
      if (trimmed.includes('M-LIVE') ||
          trimmed.includes('CATALOGO COMPLETO') ||
          trimmed.includes('www.m-live.com') ||
          trimmed.includes('Pagina') ||
          trimmed.includes('Copyright') ||
          trimmed.includes('M-Live S.r.l.') ||
          /^\d+$/.test(trimmed)) {
        pendingSongLine = '';
        continue;
      }

      // Identifica cantanti: tutte maiuscole, contiene almeno una lettera
      const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
      const isSingleLetter = /^[A-Z]$/.test(trimmed);

      if (isAllCaps && !isSingleLetter && trimmed.length > 2) {
        // Salva eventuale canzone pendente
        if (pendingSongLine && currentSinger) {
          const songTitle = pendingSongLine.trim();
          if (songTitle && !singers[currentSinger].some(s => s.title === songTitle)) {
            singers[currentSinger].push({ title: songTitle, authors: currentSinger });
            totalSongs++;
          }
        }
        pendingSongLine = '';

        // Nuovo cantante
        currentSinger = trimmed;

        if (!singers[currentSinger]) {
          singers[currentSinger] = [];
        }
      } else if (currentSinger) {
        // È una canzone (o parte di una canzone su più righe)
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        const nextIsLowerCase = nextLine && nextLine[0] && nextLine[0] === nextLine[0].toLowerCase();

        if (nextIsLowerCase && !nextLine.includes('M-LIVE')) {
          // Continua sulla prossima riga
          pendingSongLine += (pendingSongLine ? ' ' : '') + trimmed;
        } else {
          // Fine della canzone
          const songTitle = (pendingSongLine + ' ' + trimmed).trim();
          pendingSongLine = '';

          // Pulizia finale
          if (songTitle && songTitle.length > 1 && !songTitle.match(/^[\d\s]+$/)) {
            // Non aggiungere duplicati
            if (!singers[currentSinger].some(s => s.title === songTitle)) {
              singers[currentSinger].push({ title: songTitle, authors: currentSinger });
              totalSongs++;
            }
          }
        }
      }
    }

    // Salva eventuale ultima canzone pendente
    if (pendingSongLine && currentSinger) {
      const songTitle = pendingSongLine.trim();
      if (songTitle && !singers[currentSinger].some(s => s.title === songTitle)) {
        singers[currentSinger].push({ title: songTitle, authors: currentSinger });
        totalSongs++;
      }
    }

    const totalSingers = Object.keys(singers).length;

    console.log('RISULTATI PARSING:');
    console.log('='.repeat(70));
    console.log(`Cantanti trovati: ${totalSingers}`);
    console.log(`Canzoni totali: ${totalSongs}`);
    console.log('');

    // Mostra anteprima primi 10 cantanti
    console.log('PRIMI 10 CANTANTI:');
    console.log('-'.repeat(70));
    Object.keys(singers).slice(0, 10).forEach((singer, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${singer} (${singers[singer].length} canzoni)`);
      singers[singer].slice(0, 3).forEach(song => {
        console.log(`    - ${song.title}`);
      });
      if (singers[singer].length > 3) {
        console.log(`    ... e altre ${singers[singer].length - 3} canzoni`);
      }
    });

    // Salva in formato MD
    console.log('\n' + '='.repeat(70));
    console.log('SALVATAGGIO FILE MD...');

    let mdContent = '# CATALOGO COMPLETO KARAOKE\n\n';
    mdContent += `**Aggiornamento:** ${new Date().toLocaleDateString('it-IT')}\n\n`;
    mdContent += `**Cantanti:** ${totalSingers} | **Canzoni:** ${totalSongs}\n\n`;
    mdContent += '---\n\n';

    // Ordina cantanti alfabeticamente
    const sortedSingers = Object.keys(singers).sort((a, b) =>
      a.localeCompare(b, 'it', { sensitivity: 'base' })
    );

    for (const singer of sortedSingers) {
      mdContent += `## ${singer}\n\n`;
      for (const song of singers[singer]) {
        mdContent += `- ${song.title}\n`;
      }
      mdContent += '\n';
    }

    fs.writeFileSync(OUTPUT_MD, mdContent, 'utf8');
    console.log(`File MD salvato: ${OUTPUT_MD}`);

    // Salva nel database JSON
    console.log('');
    console.log('SALVATAGGIO DATABASE...');

    const database = {
      songs: singers,
      lastUpdated: new Date().toISOString()
    };

    // Assicurati che la cartella data esista
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf8');
    console.log(`Database salvato: ${DB_FILE}`);

    console.log('\n' + '='.repeat(70));
    console.log('IMPORTAZIONE COMPLETATA!');
    console.log('='.repeat(70));
    console.log(`Cantanti: ${totalSingers}`);
    console.log(`Canzoni: ${totalSongs}`);
    console.log('');
    console.log('Il catalogo e\' ora disponibile su:');
    console.log('http://192.168.1.6:5173/songlist');

  } catch (err) {
    console.error('\nERRORE:', err);
    process.exit(1);
  }
}

// Esegui
parseWordDocument();
