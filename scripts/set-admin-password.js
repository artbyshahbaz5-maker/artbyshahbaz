const { createClient } = require('@supabase/supabase-js');

async function updatePassword() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!url || !serviceKey || !anonKey || !adminEmail || !adminPassword) {
    console.error('Missing one of: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD.');
    process.exit(1);
  }

  const supabaseAdmin = createClient(url, serviceKey);

  console.log(`Finding user ${adminEmail}...`);
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const user = users.find(u => u.email === adminEmail);

  if (!user) {
    console.error('User not found.');
    return;
  }

  console.log('Updating password for user ID:', user.id);
  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: adminPassword,
    email_confirm: true
  });

  if (updateErr) {
    console.error('❌ Failed to update password:', updateErr.message);
    return;
  }

  console.log('✅ Password successfully updated.');

  // Test sign in directly
  console.log('Testing sign in with new credentials...');
  const supabaseClient = createClient(url, anonKey);
  const { data: signData, error: signErr } = await supabaseClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword
  });

  if (signErr) {
    console.error('❌ Sign in test failed:', signErr.message);
  } else {
    console.log('🎉 Successfully authenticated! Session token generated for:', signData.user.email);
  }
}

updatePassword();
