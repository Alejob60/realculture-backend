const { DataSource } = require('typeorm');
const { Content } = require('./dist/domain/entities/content.entity');
const { GeneratedImageEntity } = require('./dist/domain/entities/generated-image.entity');
const { GeneratedVideoEntity } = require('./dist/domain/entities/generated-video.entity');
const { GeneratedAudioEntity } = require('./dist/domain/entities/generated-audio.entity');
const { GeneratedMusicEntity } = require('./dist/domain/entities/generated-music.entity');
const { UserEntity } = require('./dist/domain/entities/user.entity');
const { config } = require('dotenv');

// Load environment variables
config();

async function testGallery() {
  console.log('Testing gallery data retrieval...');
  
  // Create a DataSource instance
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
      Content,
      GeneratedImageEntity,
      GeneratedVideoEntity,
      GeneratedAudioEntity,
      GeneratedMusicEntity,
      UserEntity
    ],
    ssl: {
      rejectUnauthorized: false,
    },
    logging: false
  });

  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Test 1: Check if we can find any users
    const userRepository = dataSource.getRepository(UserEntity);
    const users = await userRepository.find({
      take: 5
    });
    
    console.log(`\n👥 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.userId}, Email: ${user.email}, Role: ${user.role}, Credits: ${user.credits}`);
    });

    if (users.length === 0) {
      console.log('⚠️  No users found in the database');
      return;
    }

    // Use the first user for testing
    const testUser = users[0];
    console.log(`\n🧪 Testing with user ID: ${testUser.userId}`);

    // Test 2: Check content in contents table
    const contentRepository = dataSource.getRepository(Content);
    const contents = await contentRepository.find({
      where: {
        userId: testUser.userId
      },
      order: {
        createdAt: 'DESC'
      },
      take: 10
    });
    
    console.log(`\n📄 Contents table - Found ${contents.length} items:`);
    contents.forEach(content => {
      console.log(`  - ID: ${content.id}, Type: ${content.type}, Created: ${content.createdAt}, Title: ${content.title}`);
    });

    // Test 3: Check content in generated_images table
    const imageRepository = dataSource.getRepository(GeneratedImageEntity);
    const images = await imageRepository.find({
      where: {
        user: {
          userId: testUser.userId
        }
      },
      order: {
        createdAt: 'DESC'
      },
      take: 10,
      relations: ['user']
    });
    
    console.log(`\n🖼️  Generated Images table - Found ${images.length} items:`);
    images.forEach(image => {
      console.log(`  - ID: ${image.id}, Prompt: ${image.prompt}, Created: ${image.createdAt}`);
    });

    // Test 4: Check content in generated_videos table
    const videoRepository = dataSource.getRepository(GeneratedVideoEntity);
    const videos = await videoRepository.find({
      where: {
        user: {
          userId: testUser.userId
        }
      },
      order: {
        createdAt: 'DESC'
      },
      take: 10,
      relations: ['user']
    });
    
    console.log(`\n🎬 Generated Videos table - Found ${videos.length} items:`);
    videos.forEach(video => {
      console.log(`  - ID: ${video.id}, Status: ${video.status}, Created: ${video.createdAt}`);
    });

    // Test 5: Check content in generated_audios table
    const audioRepository = dataSource.getRepository(GeneratedAudioEntity);
    const audios = await audioRepository.find({
      where: {
        user: {
          userId: testUser.userId
        }
      },
      order: {
        createdAt: 'DESC'
      },
      take: 10,
      relations: ['user']
    });
    
    console.log(`\n🎵 Generated Audios table - Found ${audios.length} items:`);
    audios.forEach(audio => {
      console.log(`  - ID: ${audio.userId}, Prompt: ${audio.prompt}, Created: ${audio.createdAt}`);
    });

    // Test 6: Check content in generated_music table
    const musicRepository = dataSource.getRepository(GeneratedMusicEntity);
    const musics = await musicRepository.find({
      where: {
        user: {
          userId: testUser.userId
        }
      },
      order: {
        createdAt: 'DESC'
      },
      take: 10,
      relations: ['user']
    });
    
    console.log(`\n🎶 Generated Music table - Found ${musics.length} items:`);
    musics.forEach(music => {
      console.log(`  - ID: ${music.userId}, Prompt: ${music.prompt}, Created: ${music.createdAt}`);
    });

    console.log('\n✅ Gallery data retrieval test completed');
    
  } catch (error) {
    console.error('❌ Error during gallery test:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the test
testGallery();