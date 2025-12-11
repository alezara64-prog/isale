const { createClient } = require('@supabase/supabase-js');

// Credenziali Supabase
const supabaseUrl = 'https://sofwdtfumkhedzgustmx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZndkdGZ1bWtoZWR6Z3VzdG14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3NjM0MSwiZXhwIjoyMDgxMDUyMzQxfQ.qiNGQzFRhQdv87P-5nlXkop3QZS0e5PaZ7mZTlK3gx8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🚀 Setup Supabase Storage...\n');

  try {
    // 1. Crea bucket per loghi
    console.log('📦 Creazione bucket "logos"...');
    const { data: logoBucket, error: logoError } = await supabase.storage
      .createBucket('logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
      });

    if (logoError && !logoError.message.includes('already exists')) {
      console.error('  ❌ Errore creazione bucket logos:', logoError.message);
    } else {
      console.log('  ✅ Bucket "logos" creato (o già esistente)');
    }

    // 2. Crea bucket per icone social
    console.log('📦 Creazione bucket "social-icons"...');
    const { data: socialBucket, error: socialError } = await supabase.storage
      .createBucket('social-icons', {
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
      });

    if (socialError && !socialError.message.includes('already exists')) {
      console.error('  ❌ Errore creazione bucket social-icons:', socialError.message);
    } else {
      console.log('  ✅ Bucket "social-icons" creato (o già esistente)');
    }

    // 3. Crea bucket per uploads generici
    console.log('📦 Creazione bucket "uploads"...');
    const { data: uploadsBucket, error: uploadsError } = await supabase.storage
      .createBucket('uploads', {
        public: false, // Privato per file Excel e documenti
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });

    if (uploadsError && !uploadsError.message.includes('already exists')) {
      console.error('  ❌ Errore creazione bucket uploads:', uploadsError.message);
    } else {
      console.log('  ✅ Bucket "uploads" creato (o già esistente)');
    }

    console.log('\n✅ Storage setup completato!\n');

    // Verifica buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (!listError) {
      console.log('📊 Buckets disponibili:');
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'pubblico' : 'privato'})`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Errore durante il setup dello storage:', error.message);
  }
}

setupStorage();
