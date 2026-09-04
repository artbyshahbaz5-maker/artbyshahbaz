const fs = require('fs');
const path = require('path');

async function testConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.');
    process.exit(1);
  }

  console.log('Testing connection to:', url);
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log('REST Endpoint Status:', res.status, res.statusText);
  } catch (e) {
    console.error('Connection error:', e.message);
  }
}

testConnection();
