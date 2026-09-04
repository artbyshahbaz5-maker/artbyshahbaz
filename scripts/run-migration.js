const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function testPooler() {
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!projectRef || !dbPassword) {
    console.error('Missing SUPABASE_PROJECT_REF or SUPABASE_DB_PASSWORD env vars.');
    process.exit(1);
  }

  const password = encodeURIComponent(dbPassword);

  // Connection options to test
  const regions = [
    'ap-southeast-1',
    'eu-central-1',
    'us-east-1',
    'us-west-1',
    'ap-south-1',
  ];
  const hosts = regions.map(
    (r) => `postgresql://postgres.${projectRef}:${password}@aws-0-${r}.pooler.supabase.com:5432/postgres`
  );

  for (const conn of hosts) {
    const hostName = conn.split('@')[1].split(':')[0];
    console.log(`Trying ${hostName}...`);
    const client = new Client({
      connectionString: conn,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log(`✅ Connected successfully via ${hostName}!`);
      
      const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');

      console.log('Executing schema.sql...');
      await client.query(sql);
      console.log('🎉 Schema migration executed successfully!');

      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);

      console.log('\nVerified Public Tables in Database:');
      res.rows.forEach(r => console.log(' - ' + r.table_name));
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed on ${hostName}:`, err.message);
      await client.end().catch(() => {});
    }
  }
}

testPooler();
