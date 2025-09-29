require('dotenv').config();
const { Client } = require('pg');

async function checkUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const res = await client.query('SELECT "userId", email FROM users LIMIT 5');
    console.log('Users:');
    console.log(res.rows);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();