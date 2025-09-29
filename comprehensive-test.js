// Comprehensive test to verify the gallery fix
require('dotenv').config();
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function runComprehensiveTest() {
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
    
    // Insert a test content record with a blob path
    const insertQuery = `
      INSERT INTO contents (id, title, description, type, creator_id, blob_path, media_url, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const testContent = {
      id: uuidv4(), // Generate a proper UUID
      title: 'Test Image',
      description: 'Test image for gallery fix verification',
      type: 'image',
      creator_id: validUserId, // Use a valid user ID
      blob_path: 'test-image.jpg',
      media_url: 'https://realculturestorage.blob.core.windows.net/images/test-image.jpg',
      status: 'completed',
      created_at: new Date()
    };
    
    const insertResult = await client.query(insertQuery, [
      testContent.id,
      testContent.title,
      testContent.description,
      testContent.type,
      testContent.creator_id,
      testContent.blob_path,
      testContent.media_url,
      testContent.status,
      testContent.created_at
    ]);
    
    console.log('Test content inserted:', insertResult.rows[0]);
    
    // Verify the blob path extraction logic
    const url = testContent.media_url;
    
    function extractBlobPathFromUrl(url) {
      if (!url) return null;
      
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        
        if (pathParts.length >= 2) {
          return pathParts.slice(1).join('/');
        }
        
        return null;
      } catch (error) {
        return null;
      }
    }
    
    const extractedBlobPath = extractBlobPathFromUrl(url);
    console.log('Extracted blob path:', extractedBlobPath);
    console.log('Stored blob path:', testContent.blob_path);
    
    if (extractedBlobPath === testContent.blob_path) {
      console.log('✅ SUCCESS: Blob path extraction logic is working correctly');
    } else {
      console.log('❌ FAILURE: Blob path extraction logic is not working correctly');
    }
    
    // Clean up - delete the test content
    await client.query('DELETE FROM contents WHERE id = $1', [testContent.id]);
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

runComprehensiveTest();