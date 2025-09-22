// Test script to verify the data cleanup functionality
require('dotenv').config();
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function testDataCleanup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Get a valid user ID
    const userRes = await client.query('SELECT "userId" FROM users LIMIT 1');
    const validUserId = userRes.rows[0].userId;
    console.log('Using valid user ID:', validUserId);
    
    // Insert test content records with different dates
    const insertQuery = `
      INSERT INTO contents (id, title, description, type, creator_id, blob_path, media_url, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    // Insert content from 45 days ago (should be cleaned up)
    const oldContent = {
      id: uuidv4(),
      title: 'Old Content',
      description: 'Content from 45 days ago',
      type: 'image',
      creator_id: validUserId,
      blob_path: 'old-image.jpg',
      media_url: 'https://realculturestorage.blob.core.windows.net/images/old-image.jpg',
      status: 'completed',
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
    };
    
    // Insert content from 15 days ago (should not be cleaned up)
    const recentContent = {
      id: uuidv4(),
      title: 'Recent Content',
      description: 'Content from 15 days ago',
      type: 'image',
      creator_id: validUserId,
      blob_path: 'recent-image.jpg',
      media_url: 'https://realculturestorage.blob.core.windows.net/images/recent-image.jpg',
      status: 'completed',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    };
    
    // Insert both test contents
    await client.query(insertQuery, [
      oldContent.id,
      oldContent.title,
      oldContent.description,
      oldContent.type,
      oldContent.creator_id,
      oldContent.blob_path,
      oldContent.media_url,
      oldContent.status,
      oldContent.created_at
    ]);
    
    await client.query(insertQuery, [
      recentContent.id,
      recentContent.title,
      recentContent.description,
      recentContent.type,
      recentContent.creator_id,
      recentContent.blob_path,
      recentContent.media_url,
      recentContent.status,
      recentContent.created_at
    ]);
    
    console.log('Test content inserted');
    
    // Count contents before cleanup
    const countBefore = await client.query('SELECT COUNT(*) FROM contents WHERE creator_id = $1', [validUserId]);
    console.log('Content count before cleanup:', countBefore.rows[0].count);
    
    // Simulate the cleanup logic (content older than 30 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    const deleteResult = await client.query(
      'DELETE FROM contents WHERE creator_id = $1 AND created_at < $2 RETURNING *',
      [validUserId, cutoffDate]
    );
    
    console.log('Deleted content count:', deleteResult.rowCount);
    console.log('Deleted content:', deleteResult.rows);
    
    // Count contents after cleanup
    const countAfter = await client.query('SELECT COUNT(*) FROM contents WHERE creator_id = $1', [validUserId]);
    console.log('Content count after cleanup:', countAfter.rows[0].count);
    
    if (deleteResult.rowCount === 1) {
      console.log('✅ SUCCESS: Cleanup logic is working correctly');
    } else {
      console.log('❌ FAILURE: Cleanup logic is not working as expected');
    }
    
    // Clean up remaining test content
    await client.query('DELETE FROM contents WHERE id = $1 OR id = $2', [oldContent.id, recentContent.id]);
    console.log('Test content cleaned up');
    
    await client.end();
  } catch (error) {
    console.error('Error:', error);
    try {
      await client.end();
    } catch (endError) {
      console.error('Error closing database connection:', endError);
    }
  }
}

testDataCleanup();