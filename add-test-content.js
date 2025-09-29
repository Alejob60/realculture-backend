const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database connection configuration
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'misybot',
  password: 'postgres',
  port: 5432,
});

async function addTestContent() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database');

    // Get the test user ID
    const userResult = await client.query(`
      SELECT "userId" FROM users WHERE email = 'test@example.com'
    `);
    
    if (userResult.rows.length === 0) {
      console.log('Test user not found');
      return;
    }
    
    const userId = userResult.rows[0].userId;
    console.log(`User ID: ${userId}`);

    // Add test content to contents table
    for (let i = 0; i < 5; i++) {
      const contentId = uuidv4();
      const createdAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000); // Different days
      
      await client.query(`
        INSERT INTO contents (
          id, "userId", "creatorUserId", title, description, prompt, type, 
          "mediaUrl", "previewUrl", duration, "audioUrl", "audioDuration", 
          "audioVoice", "expiresAt", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14
        )
      `, [
        contentId,
        userId,
        `Test Content ${i + 1}`,
        `Description for test content ${i + 1}`,
        `Prompt for test content ${i + 1}`,
        'image',
        `https://example.com/content${i + 1}.jpg`,
        `https://example.com/preview${i + 1}.jpg`,
        i * 10 + 30, // duration
        `https://example.com/audio${i + 1}.mp3`,
        i * 5 + 15, // audio duration
        'test-voice',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // expires in 30 days
        createdAt
      ]);
      
      console.log(`Added content item ${i + 1}`);
    }

    // Add test content to generated_images table
    for (let i = 0; i < 5; i++) {
      const imageId = uuidv4();
      const createdAt = new Date(Date.now() - (i + 5) * 24 * 60 * 60 * 1000); // Different days
      
      await client.query(`
        INSERT INTO generated_images (
          id, "userId", prompt, "imageUrl", "previewUrl", "expiresAt", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $7
        )
      `, [
        imageId,
        userId,
        `Prompt for generated image ${i + 1}`,
        `https://example.com/image${i + 1}.jpg`,
        `https://example.com/image-preview${i + 1}.jpg`,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // expires in 30 days
        createdAt
      ]);
      
      console.log(`Added generated image ${i + 1}`);
    }

    // Add test content to generated_videos table
    for (let i = 0; i < 5; i++) {
      const videoId = uuidv4();
      const createdAt = new Date(Date.now() - (i + 10) * 24 * 60 * 60 * 1000); // Different days
      
      await client.query(`
        INSERT INTO generated_videos (
          id, "userId", prompt, script, "videoUrl", status, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $7
        )
      `, [
        videoId,
        userId,
        JSON.stringify({ prompt: `Prompt for generated video ${i + 1}` }),
        `Script for generated video ${i + 1}`,
        `https://example.com/video${i + 1}.mp4`,
        'COMPLETED',
        createdAt
      ]);
      
      console.log(`Added generated video ${i + 1}`);
    }

    // Add test content to generated_audios table
    for (let i = 0; i < 5; i++) {
      const audioId = uuidv4();
      const createdAt = new Date(Date.now() - (i + 15) * 24 * 60 * 60 * 1000); // Different days
      
      await client.query(`
        INSERT INTO generated_audios (
          id, "userId", prompt, "audioUrl", voice, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $6
        )
      `, [
        audioId,
        userId,
        `Prompt for generated audio ${i + 1}`,
        `https://example.com/audio${i + 1}.mp3`,
        'test-voice',
        createdAt
      ]);
      
      console.log(`Added generated audio ${i + 1}`);
    }

    console.log('Test content added successfully!');
  } catch (err) {
    console.error('Error adding test content:', err);
  } finally {
    await client.end();
  }
}

addTestContent();