/**
 * Script to check database connection and current table structures
 * This helps verify the database is accessible and shows the current state
 */

const { Client } = require('pg');
const { spawn } = require('child_process');

// Database configuration from your data-source.ts (using default PostgreSQL port)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'), // Changed to default PostgreSQL port
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
};

async function checkDatabaseConnection() {
  console.log('Checking database connection with configuration:');
  console.log(JSON.stringify(dbConfig, null, 2));
  
  // Try to connect with node-postgres
  const client = new Client(dbConfig);
  
  try {
    console.log('\n--- Attempting to connect with node-postgres ---');
    await client.connect();
    console.log('✅ Connected successfully with node-postgres!');
    
    // Check users table structure
    console.log('\n--- Users table structure ---');
    const usersResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.table(usersResult.rows);
    
    // Check contents table structure
    console.log('\n--- Contents table structure ---');
    const contentsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'contents' 
      ORDER BY ordinal_position
    `);
    console.table(contentsResult.rows);
    
    // Check if updated_at column exists
    console.log('\n--- Checking for updated_at column ---');
    const updatedAtResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'contents' AND column_name = 'updated_at'
    `);
    
    if (updatedAtResult.rows.length > 0) {
      console.log('✅ updated_at column exists');
      console.table(updatedAtResult.rows);
    } else {
      console.log('❌ updated_at column does not exist - this is causing the error');
    }
    
    // Check sample data
    console.log('\n--- Sample contents data ---');
    const sampleResult = await client.query(`
      SELECT id, "creatorUserId", "media_url", "created_at", type
      FROM contents 
      LIMIT 5
    `);
    console.table(sampleResult.rows);
    
    await client.end();
  } catch (error) {
    console.log('❌ Failed to connect with node-postgres:', error.message);
    
    // Try to check if PostgreSQL is running with netstat
    console.log('\n--- Checking if PostgreSQL is running ---');
    const netstat = spawn('netstat', ['-an']);
    
    netstat.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('5432') || output.includes(dbConfig.port.toString())) {
        console.log('✅ PostgreSQL appears to be running');
      }
    });
    
    netstat.on('close', () => {
      console.log('ℹ️  If PostgreSQL is running but connection fails, check:');
      console.log('   1. Database credentials in data-source.ts');
      console.log('   2. Database server status');
      console.log('   3. Network/firewall settings');
      console.log('   4. Database user permissions');
    });
  }
}

// Run the check
checkDatabaseConnection();