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

async function checkUserContent() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // First, find the user ID for test-audio-1758711790615@example.com
    console.log('\n--- Finding user ID ---');
    const userResult = await client.query(`
      SELECT "userId", email, role
      FROM users
      WHERE email = 'test-audio-1758711790615@example.com'
    `);
    
    if (userResult.rows.length === 0) {
      console.log('User not found');
      await client.end();
      return;
    }
    
    const userId = userResult.rows[0].userId;
    console.log(`User ID: ${userId}`);
    console.log(`User role: ${userResult.rows[0].role}`);
    
    // Check content in contents table
    console.log('\n--- Content in contents table ---');
    const contentResult = await client.query(`
      SELECT id, "creatorUserId", "media_url", "created_at", type, title, description
      FROM contents
      WHERE "creatorUserId" = $1
      ORDER BY "created_at" DESC
      LIMIT 10
    `, [userId]);
    
    console.log(`Found ${contentResult.rows.length} content items:`);
    contentResult.rows.forEach((content, index) => {
      console.log(`  ${index + 1}. ${content.type} - ${content.title || 'No title'} (${content.created_at})`);
    });
    
    // Check content in generated_images table
    console.log('\n--- Content in generated_images table ---');
    const imageResult = await client.query(`
      SELECT id, "user_id", "imageUrl", "createdAt", prompt
      FROM generated_images
      WHERE "user_id" = $1
      ORDER BY "createdAt" DESC
      LIMIT 10
    `, [userId]);
    
    console.log(`Found ${imageResult.rows.length} image items:`);
    imageResult.rows.forEach((image, index) => {
      console.log(`  ${index + 1}. Image - ${image.prompt || 'No prompt'} (${image.createdAt})`);
    });
    
    // Check content in generated_videos table
    console.log('\n--- Content in generated_videos table ---');
    const videoResult = await client.query(`
      SELECT id, "user_id", "videoUrl", "createdAt", status
      FROM generated_videos
      WHERE "user_id" = $1
      ORDER BY "createdAt" DESC
      LIMIT 10
    `, [userId]);
    
    console.log(`Found ${videoResult.rows.length} video items:`);
    videoResult.rows.forEach((video, index) => {
      console.log(`  ${index + 1}. Video - Status: ${video.status} (${video.createdAt})`);
    });
    
    // Check content in generated_audios table
    console.log('\n--- Content in generated_audios table ---');
    const audioResult = await client.query(`
      SELECT id, "userId", "audioUrl", "createdAt", prompt
      FROM generated_audios
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 10
    `, [userId]);
    
    console.log(`Found ${audioResult.rows.length} audio items:`);
    audioResult.rows.forEach((audio, index) => {
      console.log(`  ${index + 1}. Audio - ${audio.prompt || 'No prompt'} (${audio.createdAt})`);
    });
    
    // Check all content across all tables (most permissive query)
    // Note: We need to be careful with type mismatches between tables
    console.log('\n--- All content for user (separate queries) ---');
    
    // Get recent content from each table separately to avoid type mismatches
    const recentContents = await client.query(`
      SELECT 'contents' as source, id, "created_at" as created_at, type, "media_url" as url
      FROM contents
      WHERE "creatorUserId" = $1
      ORDER BY "created_at" DESC
      LIMIT 5
    `, [userId]);
    
    const recentImages = await client.query(`
      SELECT 'generated_images' as source, id, "createdAt" as created_at, 'image' as type, "imageUrl" as url
      FROM generated_images
      WHERE "user_id" = $1
      ORDER BY "createdAt" DESC
      LIMIT 5
    `, [userId]);
    
    const recentVideos = await client.query(`
      SELECT 'generated_videos' as source, id, "createdAt" as created_at, 'video' as type, "videoUrl" as url
      FROM generated_videos
      WHERE "user_id" = $1
      ORDER BY "createdAt" DESC
      LIMIT 5
    `, [userId]);
    
    const recentAudios = await client.query(`
      SELECT 'generated_audios' as source, id, "createdAt" as created_at, 'audio' as type, "audioUrl" as url
      FROM generated_audios
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 5
    `, [userId]);
    
    // Combine all results
    const allItems = [
      ...recentContents.rows,
      ...recentImages.rows,
      ...recentVideos.rows,
      ...recentAudios.rows
    ];
    
    // Sort by created_at (newest first)
    allItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log(`Found ${allItems.length} total items across all tables:`);
    allItems.slice(0, 20).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.source} - ${item.type} (${item.created_at})`);
    });
    
    await client.end();
  } catch (error) {
    console.error('Error checking user content:', error);
  }
}

checkUserContent();