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

async function checkUsersWithRoles() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check users with their roles
    console.log('\n--- Users with roles ---');
    const usersResult = await client.query(`
      SELECT "userId", email, name, role, credits, "createdAt"
      FROM users
      ORDER BY "createdAt" DESC
      LIMIT 20
    `);
    
    console.log('Users:');
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.credits} credits`);
    });
    
    // Check user role distribution
    console.log('\n--- User role distribution ---');
    const roleDistributionResult = await client.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);
    
    console.log('Role distribution:');
    roleDistributionResult.rows.forEach(role => {
      console.log(`  ${role.role}: ${role.count} users`);
    });
    
    // Check if there are any CREATOR or PRO users
    console.log('\n--- CREATOR/PRO users ---');
    const creatorProUsersResult = await client.query(`
      SELECT "userId", email, name, role, credits, "createdAt"
      FROM users
      WHERE role IN ('CREATOR', 'PRO')
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);
    
    if (creatorProUsersResult.rows.length > 0) {
      console.log('CREATOR/PRO users:');
      creatorProUsersResult.rows.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.role}) - ${user.credits} credits`);
      });
    } else {
      console.log('No CREATOR or PRO users found');
    }
    
    await client.end();
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsersWithRoles();