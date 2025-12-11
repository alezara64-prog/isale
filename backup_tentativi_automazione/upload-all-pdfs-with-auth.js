const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_URL = 'http://localhost:3001';
const PDF_FOLDER = 'C:/Users/armon/Downloads/ilovepdf_extracted-pages';

// Credenziali admin (usa quelle di default)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'karaoke2025';

// Lista dei PDF da caricare
const PDF_FILES = [
  'Lista basi Song Service Ottobre 2025-1.pdf',
  'Lista basi Song Service Ottobre 2025-2.pdf',
  'Lista basi Song Service Ottobre 2025-3.pdf',
  'Lista basi Song Service Ottobre 2025-4.pdf',
  'Lista basi Song Service Ottobre 2025-5.pdf',
  'Lista basi Song Service Ottobre 2025-6.pdf',
  'Lista basi Song Service Ottobre 2025-7.pdf',
  'Lista basi Song Service Ottobre 2025-8.pdf',
  'Lista basi Song Service Ottobre 2025-9.pdf',
  'Lista basi Song Service Ottobre 2025-10.pdf',
  'Lista basi Song Service Ottobre 2025-11.pdf',
  'Lista basi Song Service Ottobre 2025-12.pdf',
  'Lista basi Song Service Ottobre 2025-13.pdf',
  'Lista basi Song Service Ottobre 2025-14.pdf',
  'Lista basi Song Service Ottobre 2025-15.pdf',
  'Lista basi Song Service Ottobre 2025-16.pdf',
  'Lista basi Song Service Ottobre 2025-17.pdf',
  'Lista basi Song Service Ottobre 2025-18.pdf',
  'Lista basi Song Service Ottobre 2025-19.pdf',
  'Lista basi Song Service Ottobre 2025-20.pdf',
  'Lista basi Song Service Ottobre 2025-21.pdf',
  'Lista basi Song Service Ottobre 2025-22.pdf',
  'Lista basi Song Service Ottobre 2025-23.pdf',
  'Lista basi Song Service Ottobre 2025-24.pdf',
  'Lista basi Song Service Ottobre 2025-25.pdf',
  'Lista basi Song Service Ottobre 2025-26.pdf',
  'Lista basi Song Service Ottobre 2025-27.pdf',
  'Lista basi Song Service Ottobre 2025-28.pdf',
  'Lista basi Song Service Ottobre 2025-29.pdf',
  'Lista basi Song Service Ottobre 2025-30.pdf'
];

let adminToken = null;

// Login come admin
async function loginAdmin() {
  try {
    console.log('🔐 Login come admin...');
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });

    adminToken = response.data.data.token;
    console.log('✅ Login effettuato con successo!\n');
    return adminToken;
  } catch (error) {
    console.error('❌ Errore nel login:', error.response?.data?.error || error.message);
    throw error;
  }
}

// Carica un singolo PDF
async function uploadPDF(filename, numColumns = 6) {
  try {
    console.log(`📄 [${PDF_FILES.indexOf(filename) + 1}/${PDF_FILES.length}] Caricamento: ${filename}`);
    console.log(`   📊 Colonne: ${numColumns}`);

    const pdfPath = path.join(PDF_FOLDER, filename);

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`File non trovato: ${pdfPath}`);
    }

    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(pdfPath));
    formData.append('columns', numColumns.toString());

    const response = await axios.post(
      `${API_URL}/api/songlist/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${adminToken}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log(`   ✅ Successo!`);
    console.log(`   👨‍🎤 Cantanti: ${response.data.data.totalSingers}`);
    console.log(`   🎵 Canzoni: ${response.data.data.totalSongs}\n`);

    return response.data.data;
  } catch (error) {
    console.error(`   ❌ Errore:`, error.response?.data?.error || error.message);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 CARICAMENTO PDF CON AUTENTICAZIONE\n');
  console.log('📂 Cartella PDF:', PDF_FOLDER);
  console.log('🌐 API URL:', API_URL);
  console.log('📊 File da caricare:', PDF_FILES.length);
  console.log('='.repeat(70) + '\n');

  try {
    // Login
    await loginAdmin();

    // Reset database
    console.log('🗑️  Resetto il database delle canzoni...');
    await axios.post(
      `${API_URL}/api/songlist/reset`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    console.log('✅ Database resettato\n');
    console.log('='.repeat(70) + '\n');

    // Carica SOLO il primo PDF per test
    console.log('📋 FASE 1: TEST CON PRIMO PDF\n');
    const firstResult = await uploadPDF(PDF_FILES[0], 6);

    // Mostra anteprima
    console.log('='.repeat(70));
    console.log('📊 ANTEPRIMA RISULTATI PRIMO PDF');
    console.log('='.repeat(70));
    console.log(`✅ Cantanti totali: ${firstResult.totalSingers}`);
    console.log(`✅ Canzoni totali: ${firstResult.totalSongs}`);
    console.log('');

    // Leggi il database per mostrare un campione
    const dataFile = path.join(__dirname, '../data/songlist.json');
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const singers = Object.keys(data.singers).sort();

    console.log('🎤 PRIMI 15 CANTANTI (in ordine alfabetico):');
    console.log('-'.repeat(70));
    singers.slice(0, 15).forEach((singer, i) => {
      const songCount = data.singers[singer].length;
      console.log(`${(i + 1).toString().padStart(2, ' ')}. ${singer} (${songCount} canzoni)`);
      if (songCount > 0 && data.singers[singer][0]) {
        const firstSongs = data.singers[singer].slice(0, 2);
        firstSongs.forEach(song => {
          console.log(`    - ${song.title}`);
        });
        if (songCount > 2) {
          console.log(`    ... e altre ${songCount - 2} canzoni`);
        }
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log('⚠️  VERIFICA NECESSARIA!');
    console.log('='.repeat(70));
    console.log('Controlla i risultati sopra:');
    console.log('- I nomi dei cantanti sono corretti?');
    console.log('- Le canzoni appartengono ai cantanti giusti?');
    console.log('- Il numero di cantanti/canzoni sembra ragionevole?');
    console.log('');
    console.log('Se tutto sembra corretto, posso procedere con gli altri 29 PDF.');
    console.log('Altrimenti devo migliorare l\'algoritmo di parsing.');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n💥 Errore fatale:', error.message);
    process.exit(1);
  }
}

// Esegui
main();
