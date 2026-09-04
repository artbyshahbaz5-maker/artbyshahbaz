const { createClient } = require('@supabase/supabase-js');

async function testAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  console.log('Listing users in Supabase Auth...');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error.message);
    return;
  }

  console.log(`Found ${users.length} registered user(s):`);
  users.forEach(u => console.log(` - Email: ${u.email} | Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'} | ID: ${u.id}`));
}

testAuth();
