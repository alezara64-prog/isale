const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://sofwdtfumkhedzgustmx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZndkdGZ1bWtoZWR6Z3VzdG14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3NjM0MSwiZXhwIjoyMDgxMDUyMzQxfQ.qiNGQzFRhQdv87P-5nlXkop3QZS0e5PaZ7mZTlK3gx8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadImages() {
  console.log('🚀 Upload immagini a Supabase Storage...\n');

  const uploadsDir = path.join(__dirname, '../uploads');

  // Upload logos
  console.log('📤 Upload logos...');
  const logosDir = path.join(uploadsDir, 'logos');

  if (fs.existsSync(logosDir)) {
    const logoFiles = fs.readdirSync(logosDir).filter(f => /\.(png|jpg|jpeg|gif|svg)$/i.test(f));

    for (const file of logoFiles) {
      const filePath = path.join(logosDir, file);
      const fileBuffer = fs.readFileSync(filePath);

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(file, fileBuffer, {
          contentType: `image/${path.extname(file).slice(1)}`,
          upsert: true
        });

      if (error) {
        console.log(`  ❌ ${file}: ${error.message}`);
      } else {
        console.log(`  ✅ ${file}`);
      }
    }
    console.log(`✅ ${logoFiles.length} logos caricati\n`);
  }

  // Upload social icons
  console.log('📤 Upload icone social...');
  const iconsDir = path.join(uploadsDir, 'social-icons');

  if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir).filter(f => /\.(png|jpg|jpeg|gif|svg)$/i.test(f));

    for (const file of iconFiles) {
      const filePath = path.join(iconsDir, file);
      const fileBuffer = fs.readFileSync(filePath);

      const { data, error } = await supabase.storage
        .from('social-icons')
        .upload(file, fileBuffer, {
          contentType: `image/${path.extname(file).slice(1)}`,
          upsert: true
        });

      if (error) {
        console.log(`  ❌ ${file}: ${error.message}`);
      } else {
        console.log(`  ✅ ${file}`);
      }
    }
    console.log(`✅ ${iconFiles.length} icone social caricate\n`);
  }

  console.log('✅ Upload completato!');
}

uploadImages();
