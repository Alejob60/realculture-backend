const { Client } = require('pg');

// Database configuration from .env
const dbConfig = {
  host: 'realculture-db.postgres.database.azure.com',
  port: 5432,
  user: 'adminrealculture',
  password: 'Alejob6005901@/',
  database: 'postgres',
  ssl: true,
};

async function checkColumnTypes() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check generated_audios table structure
    console.log('\n--- Generated Audios table structure ---');
    const audioResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'generated_audios' 
      ORDER BY ordinal_position
    `);
    console.table(audioResult.rows);
    
    // Check users table structure
    console.log('\n--- Users table structure ---');
    const usersResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.table(usersResult.rows);
    
    // Specifically check the userId column types
    console.log('\n--- Specific column types ---');
    const userIdTypeResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE (table_name = 'generated_audios' AND column_name = 'userId') 
         OR (table_name = 'users' AND column_name = 'userId')
    `);
    console.table(userIdTypeResult.rows);
    
    await client.end();
  } catch (error) {
    console.error('Error checking column types:', error);
  }
}

checkColumnTypes();