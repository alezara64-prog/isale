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

async function setupDatabase() {
  console.log('🚀 Inizializzazione database Supabase...\n');

  try {
    // Leggi il file SQL
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251211_initial_schema.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Esecuzione migration SQL...');

    // Esegui la migration (Supabase non supporta direttamente SQL via JS client)
    // Dobbiamo usare l'API REST
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sqlContent })
    });

    if (!response.ok) {
      // Se exec_sql non esiste, eseguiamo le query una per una
      console.log('⚠️ Esecuzione manuale delle query...');

      // Per ora, stampiamo le istruzioni
      console.log('\n📋 ISTRUZIONI MANUALI:');
      console.log('1. Vai su: https://supabase.com/dashboard/project/sofwdtfumkhedzgustmx/editor');
      console.log('2. Clicca su "SQL Editor"');
      console.log('3. Copia e incolla il contenuto di:');
      console.log('   backend/supabase/migrations/20251211_initial_schema.sql');
      console.log('4. Clicca "Run" per eseguire\n');

      return;
    }

    console.log('✅ Schema database creato con successo!\n');

    // Test connessione
    const { data, error } = await supabase.from('singers').select('count');

    if (error) {
      console.error('❌ Errore nel test della connessione:', error.message);
    } else {
      console.log('✅ Connessione al database funzionante!');
      console.log('✅ Setup completato!\n');
    }

  } catch (error) {
    console.error('❌ Errore durante il setup:', error.message);
    console.log('\n📋 ISTRUZIONI MANUALI:');
    console.log('1. Vai su: https://supabase.com/dashboard/project/sofwdtfumkhedzgustmx/editor');
    console.log('2. Clicca su "SQL Editor"');
    console.log('3. Copia e incolla il contenuto di:');
    console.log('   backend/supabase/migrations/20251211_initial_schema.sql');
    console.log('4. Clicca "Run" per eseguire\n');
  }
}

setupDatabase();
