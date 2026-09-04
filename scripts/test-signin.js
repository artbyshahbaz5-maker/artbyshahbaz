const { createClient } = require('@supabase/supabase-js');

async function testSignIn() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.');
    process.exit(1);
  }

  const supabase = createClient(url, anonKey);

  console.log('Testing anon signInWithPassword...');
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL || 'test@example.com',
    password: 'wrongpasswordtest'
  });

  console.log('Error message received:', error ? error.message : 'No error');
  console.log('Error status:', error ? error.status : 200);
}

testSignIn();
