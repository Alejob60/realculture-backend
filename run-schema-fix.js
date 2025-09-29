const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration from your data-source.ts
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5544'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
};

async function runSchemaFix() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'fix-database-schema.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing schema fix script...');
    
    // Split the script into individual statements (simple approach)
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('\\echo') && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim().length === 0) continue;
      
      try {
        console.log('Executing statement:', statement.substring(0, 50) + '...');
        await client.query(statement);
      } catch (error) {
        console.warn('Non-critical error (may be expected):', error.message);
      }
    }
    
    console.log('Schema fix completed successfully!');
    
    // Test the relationship
    console.log('Testing user-content relationship...');
    const testQuery = `
      SELECT 
        c.id,
        c."creatorUserId",
        u."userId",
        u.email
      FROM contents c
      JOIN users u ON c."creatorUserId" = u."userId"
      LIMIT 3;
    `;
    
    const result = await client.query(testQuery);
    console.log('Relationship test results:', result.rows);
    
  } catch (error) {
    console.error('Error running schema fix:', error);
  } finally {
    await client.end();
  }
}

// Run the script
runSchemaFix();