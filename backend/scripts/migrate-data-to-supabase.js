const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credenziali Supabase
const supabaseUrl = 'https://sofwdtfumkhedzgustmx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZndkdGZ1bWtoZWR6Z3VzdG14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3NjM0MSwiZXhwIjoyMDgxMDUyMzQxfQ.qiNGQzFRhQdv87P-5nlXkop3QZS0e5PaZ7mZTlK3gx8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateData() {
  console.log('🚀 Migrazione dati da JSON a Supabase...\n');

  try {
    // Leggi il file JSON
    const dataPath = path.join(__dirname, '../data/songlist.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const songs = jsonData.songs || {};
    const singerNames = Object.keys(songs);

    console.log(`📊 Trovati ${singerNames.length} cantanti/gruppi`);
    console.log(`📊 Preparazione migrazione...\n`);

    let totalSongs = 0;
    let migratedSingers = 0;
    let migratedSongs = 0;
    let errors = 0;

    // Calcola totale canzoni
    for (const singerName of singerNames) {
      totalSongs += songs[singerName].length;
    }

    console.log(`📊 Totale canzoni da migrare: ${totalSongs}\n`);
    console.log('⏳ Inizio migrazione...\n');

    // Migra ogni cantante e le sue canzoni
    for (const singerName of singerNames) {
      try {
        // 1. Inserisci o trova il cantante
        const { data: existingSinger, error: findError } = await supabase
          .from('singers')
          .select('id')
          .eq('name', singerName)
          .single();

        let singerId;

        if (existingSinger) {
          singerId = existingSinger.id;
          console.log(`  ✓ Cantante già esistente: ${singerName} (ID: ${singerId})`);
        } else {
          const { data: newSinger, error: insertError } = await supabase
            .from('singers')
            .insert({ name: singerName })
            .select('id')
            .single();

          if (insertError) {
            console.error(`  ❌ Errore inserimento cantante ${singerName}:`, insertError.message);
            errors++;
            continue;
          }

          singerId = newSinger.id;
          migratedSingers++;
          console.log(`  ✓ Cantante inserito: ${singerName} (ID: ${singerId})`);
        }

        // 2. Inserisci le canzoni del cantante
        const songsToInsert = songs[singerName].map(song => ({
          singer_id: singerId,
          title: song.title,
          tonality: song.tonality || null,
          song_format: song.format || null
        }));

        if (songsToInsert.length > 0) {
          const { data, error: songsError } = await supabase
            .from('songs')
            .insert(songsToInsert)
            .select();

          if (songsError) {
            console.error(`  ❌ Errore inserimento canzoni per ${singerName}:`, songsError.message);
            errors++;
          } else {
            migratedSongs += songsToInsert.length;
            console.log(`    → ${songsToInsert.length} canzoni migrate`);
          }
        }

        // Piccola pausa per non sovraccaricare l'API
        if (migratedSingers % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`  ❌ Errore con ${singerName}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ MIGRAZIONE COMPLETATA!\n');
    console.log(`📊 Riepilogo:`);
    console.log(`   - Cantanti migrati: ${migratedSingers}`);
    console.log(`   - Canzoni migrate: ${migratedSongs}`);
    console.log(`   - Errori: ${errors}`);
    console.log('='.repeat(50) + '\n');

    // Verifica finale
    const { count: singersCount } = await supabase
      .from('singers')
      .select('*', { count: 'exact', head: true });

    const { count: songsCount } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Verifica database:`);
    console.log(`   - Cantanti nel database: ${singersCount}`);
    console.log(`   - Canzoni nel database: ${songsCount}\n`);

  } catch (error) {
    console.error('❌ Errore fatale durante la migrazione:', error);
  }
}

migrateData();
