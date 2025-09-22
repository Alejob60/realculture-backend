require('dotenv').config();
const { Client } = require('pg');

async function checkContents() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const res = await client.query('SELECT id, title, type, blob_path, media_url FROM contents LIMIT 5');
    console.log('Contents:');
    console.log(res.rows);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkContents();