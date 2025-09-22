const { Client } = require('pg');
const { config } = require('dotenv');

// Load environment variables
config();

async function testDatabaseConnection() {
  console.log('Testing direct database connection...');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('✅ Database connection established');

    // Test 1: Check if we can find any users
    console.log('\n--- Testing Users Table ---');
    const userResult = await client.query('SELECT "userId", email, role, credits FROM users LIMIT 5');
    console.log(`👥 Found ${userResult.rowCount} users:`);
    userResult.rows.forEach(user => {
      console.log(`  - ID: ${user.userId}, Email: ${user.email}, Role: ${user.role}, Credits: ${user.credits}`);
    });

    if (userResult.rowCount === 0) {
      console.log('⚠️  No users found in the database');
      return;
    }

    // Use the first user for testing
    const testUserId = userResult.rows[0].userId;
    console.log(`\n🧪 Testing with user ID: ${testUserId}`);

    // Test 2: Check content in contents table
    console.log('\n--- Testing Contents Table ---');
    const contentResult = await client.query(
      'SELECT id, title, description, type, "createdAt", "mediaUrl" FROM contents WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
      [testUserId]
    );
    console.log(`📄 Contents table - Found ${contentResult.rowCount} items:`);
    contentResult.rows.forEach(content => {
      console.log(`  - ID: ${content.id}, Type: ${content.type}, Created: ${content.createdAt}, Title: ${content.title}`);
    });

    // Test 3: Check content in generated_images table
    console.log('\n--- Testing Generated Images Table ---');
    const imageResult = await client.query(
      'SELECT id, prompt, "createdAt", "imageUrl" FROM generated_images WHERE "user_id" = $1 ORDER BY "createdAt" DESC LIMIT 10',
      [testUserId]
    );
    console.log(`🖼️  Generated Images table - Found ${imageResult.rowCount} items:`);
    imageResult.rows.forEach(image => {
      console.log(`  - ID: ${image.id}, Prompt: ${image.prompt}, Created: ${image.createdAt}`);
    });

    // Test 4: Check content in generated_videos table
    console.log('\n--- Testing Generated Videos Table ---');
    const videoResult = await client.query(
      'SELECT id, script, "createdAt", "videoUrl", status FROM generated_videos WHERE "user_id" = $1 ORDER BY "createdAt" DESC LIMIT 10',
      [testUserId]
    );
    console.log(`🎬 Generated Videos table - Found ${videoResult.rowCount} items:`);
    videoResult.rows.forEach(video => {
      console.log(`  - ID: ${video.id}, Status: ${video.status}, Created: ${video.createdAt}`);
    });

    // Test 5: Check content in generated_audios table
    console.log('\n--- Testing Generated Audios Table ---');
    const audioResult = await client.query(
      'SELECT "userId", prompt, "createdAt", "audioUrl" FROM generated_audios WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
      [testUserId]
    );
    console.log(`🎵 Generated Audios table - Found ${audioResult.rowCount} items:`);
    audioResult.rows.forEach(audio => {
      console.log(`  - ID: ${audio.userId}, Prompt: ${audio.prompt}, Created: ${audio.createdAt}`);
    });

    // Test 6: Check content in generated_music table
    console.log('\n--- Testing Generated Music Table ---');
    const musicResult = await client.query(
      'SELECT "userId", prompt, "createdAt", "musicUrl" FROM generated_music WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
      [testUserId]
    );
    console.log(`🎶 Generated Music table - Found ${musicResult.rowCount} items:`);
    musicResult.rows.forEach(music => {
      console.log(`  - ID: ${music.userId}, Prompt: ${music.prompt}, Created: ${music.createdAt}`);
    });

    // Summary
    const totalItems = contentResult.rowCount + imageResult.rowCount + videoResult.rowCount + audioResult.rowCount + musicResult.rowCount;
    console.log(`\n📊 Summary: Found ${totalItems} total items across all tables for user ${testUserId}`);
    
    if (totalItems > 0) {
      console.log('✅ Database has content that should appear in the gallery');
    } else {
      console.log('⚠️  Database appears to be empty or the user has no generated content');
    }

  } catch (error) {
    console.error('❌ Error during database test:', error);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed');
  }
}

// Run the test
testDatabaseConnection();