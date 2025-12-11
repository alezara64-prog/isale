const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sofwdtfumkhedzgustmx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZndkdGZ1bWtoZWR6Z3VzdG14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3NjM0MSwiZXhwIjoyMDgxMDUyMzQxfQ.qiNGQzFRhQdv87P-5nlXkop3QZS0e5PaZ7mZTlK3gx8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  const { count: singersCount } = await supabase.from('singers').select('*', { count: 'exact', head: true });
  const { count: songsCount } = await supabase.from('songs').select('*', { count: 'exact', head: true });

  console.log(`✅ Cantanti: ${singersCount}`);
  console.log(`✅ Canzoni: ${songsCount}`);
}

checkData();
