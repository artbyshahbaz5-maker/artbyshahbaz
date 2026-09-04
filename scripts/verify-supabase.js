const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  console.log('Testing Supabase Service Role client...');

  // 1. Test database access
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) {
    console.error('❌ Database error:', catError.message);
  } else {
    console.log(`✅ Database connected! Found ${categories.length} categories.`);
  }

  // 2. Test Storage Bucket access
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.error('❌ Storage error:', bError.message);
  } else {
    console.log('✅ Storage connected! Buckets found:');
    buckets.forEach(b => console.log(`   - ${b.name} (${b.public ? 'Public' : 'Private'})`));
  }
}

testSupabase();
