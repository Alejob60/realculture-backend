// Test script to verify the gallery filtering by current month
require('dotenv').config();
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function testGalleryFiltering() {
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
    
    // Calculate date ranges
    const now = new Date();
    
    // First day of current month
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Last day of current month
    const lastDayCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // First day of previous month
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Last day of previous month
    const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    console.log('Current month range:', firstDayCurrentMonth.toISOString(), 'to', lastDayCurrentMonth.toISOString());
    console.log('Previous month range:', firstDayPreviousMonth.toISOString(), 'to', lastDayPreviousMonth.toISOString());
    
    // Insert content from previous month (should NOT appear in gallery)
    const previousMonthContent = {
      id: uuidv4(),
      title: 'Previous Month Content',
      description: 'Content from previous month',
      type: 'image',
      creator_id: validUserId,
      blob_path: 'previous-month-image.jpg',
      media_url: 'https://realculturestorage.blob.core.windows.net/images/previous-month-image.jpg',
      status: 'completed',
      created_at: new Date(lastDayPreviousMonth.getTime() - 24 * 60 * 60 * 1000) // A day before current month
    };
    
    // Insert content from current month (should appear in gallery)
    const currentMonthContent = {
      id: uuidv4(),
      title: 'Current Month Content',
      description: 'Content from current month',
      type: 'image',
      creator_id: validUserId,
      blob_path: 'current-month-image.jpg',
      media_url: 'https://realculturestorage.blob.core.windows.net/images/current-month-image.jpg',
      status: 'completed',
      created_at: new Date(firstDayCurrentMonth.getTime() + 24 * 60 * 60 * 1000) // A day after first day of current month
    };
    
    // Insert both test contents
    await client.query(insertQuery, [
      previousMonthContent.id,
      previousMonthContent.title,
      previousMonthContent.description,
      previousMonthContent.type,
      previousMonthContent.creator_id,
      previousMonthContent.blob_path,
      previousMonthContent.media_url,
      previousMonthContent.status,
      previousMonthContent.created_at
    ]);
    
    await client.query(insertQuery, [
      currentMonthContent.id,
      currentMonthContent.title,
      currentMonthContent.description,
      currentMonthContent.type,
      currentMonthContent.creator_id,
      currentMonthContent.blob_path,
      currentMonthContent.media_url,
      currentMonthContent.status,
      currentMonthContent.created_at
    ]);
    
    console.log('Test content inserted');
    
    // Test the gallery filtering logic (content from current month only)
    const firstDay = new Date();
    firstDay.setDate(1);
    firstDay.setHours(0, 0, 0, 0);

    const lastDay = new Date();
    lastDay.setMonth(lastDay.getMonth() + 1);
    lastDay.setDate(0);
    lastDay.setHours(23, 59, 59, 999);
    
    console.log('Gallery filter range:', firstDay.toISOString(), 'to', lastDay.toISOString());
    
    const galleryQuery = `
      SELECT * FROM contents 
      WHERE creator_id = $1 
      AND created_at >= $2 
      AND created_at <= $3
      ORDER BY created_at DESC
    `;
    
    const galleryResult = await client.query(galleryQuery, [validUserId, firstDay, lastDay]);
    
    console.log('Gallery content count:', galleryResult.rowCount);
    console.log('Gallery content:', galleryResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      created_at: row.created_at
    })));
    
    // Check if only current month content appears
    const currentMonthContentInGallery = galleryResult.rows.some(row => row.id === currentMonthContent.id);
    const previousMonthContentInGallery = galleryResult.rows.some(row => row.id === previousMonthContent.id);
    
    if (currentMonthContentInGallery && !previousMonthContentInGallery) {
      console.log('✅ SUCCESS: Gallery filtering logic is working correctly');
    } else {
      console.log('❌ FAILURE: Gallery filtering logic is not working as expected');
      console.log('Current month content in gallery:', currentMonthContentInGallery);
      console.log('Previous month content in gallery:', previousMonthContentInGallery);
    }
    
    // Clean up test content
    await client.query('DELETE FROM contents WHERE id = $1 OR id = $2', [previousMonthContent.id, currentMonthContent.id]);
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

testGalleryFiltering();