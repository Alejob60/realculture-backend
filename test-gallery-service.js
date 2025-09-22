// Test the gallery service logic directly
const { DataSource } = require('typeorm');
const { Content } = require('./dist/domain/entities/content.entity');
const { GeneratedImageEntity } = require('./dist/domain/entities/generated-image.entity');
const { GeneratedVideoEntity } = require('./dist/domain/entities/generated-video.entity');
const { GeneratedAudioEntity } = require('./dist/domain/entities/generated-audio.entity');
const { UserEntity } = require('./dist/domain/entities/user.entity');
const { MoreThan, IsNull, Between } = require('typeorm');
const { config } = require('dotenv');

// Load environment variables
config();

async function testGalleryServiceLogic() {
  console.log('Testing gallery service logic...');
  
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

    // Find a user to test with
    const userRepository = dataSource.getRepository(UserEntity);
    const users = await userRepository.find({
      take: 1
    });
    
    if (users.length === 0) {
      console.log('⚠️  No users found in the database');
      return;
    }

    const userId = users[0].userId;
    console.log(`\n🧪 Testing gallery logic for user ID: ${userId}`);

    // Replicate the gallery service queries
    const contentRepository = dataSource.getRepository(Content);
    const generatedImageRepository = dataSource.getRepository(GeneratedImageEntity);
    const generatedVideoRepository = dataSource.getRepository(GeneratedVideoEntity);
    const generatedAudioRepository = dataSource.getRepository(GeneratedAudioEntity);

    // Get the first day of the current month
    const dateFrom = new Date();
    dateFrom.setDate(1);
    dateFrom.setHours(0, 0, 0, 0);

    // Get the current date
    const dateTo = new Date();
    dateTo.setHours(23, 59, 59, 999);

    console.log(`\n📅 Date range: ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);

    // Test all content without date restrictions (debug query)
    const allContents = await contentRepository.find({
      where: [
        {
          userId: userId,
          expiresAt: MoreThan(new Date()),
        },
        {
          userId: userId,
          expiresAt: IsNull(),
        }
      ],
      order: { createdAt: 'DESC' },
    });
    
    console.log(`\n📄 All contents (no date filter) - Found ${allContents.length} items`);

    const allGeneratedImages = await generatedImageRepository.find({
      where: [
        {
          user: { userId: userId },
          expiresAt: MoreThan(new Date()),
        },
        {
          user: { userId: userId },
          expiresAt: IsNull(),
        }
      ],
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    
    console.log(`\n🖼️  All generated images (no date filter) - Found ${allGeneratedImages.length} items`);

    const allGeneratedVideos = await generatedVideoRepository.find({
      where: {
        user: { userId: userId },
        status: 'COMPLETED',
      },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    
    console.log(`\n🎬 All generated videos (no date filter) - Found ${allGeneratedVideos.length} items`);

    const allGeneratedAudios = await generatedAudioRepository.find({
      where: {
        user: { userId: userId },
      },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    
    console.log(`\n🎵 All generated audios (no date filter) - Found ${allGeneratedAudios.length} items`);

    // Test with date restrictions (actual gallery query)
    const contents = await contentRepository.find({
      where: [
        {
          userId: userId,
          createdAt: Between(dateFrom, dateTo),
          expiresAt: MoreThan(new Date()),
        },
        {
          userId: userId,
          createdAt: Between(dateFrom, dateTo),
          expiresAt: IsNull(),
        },
        {
          userId: userId,
          createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          expiresAt: MoreThan(new Date()),
        },
        {
          userId: userId,
          createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          expiresAt: IsNull(),
        }
      ],
      order: { createdAt: 'DESC' },
    });
    
    console.log(`\n📄 Contents with date filter - Found ${contents.length} items`);

    const generatedImages = await generatedImageRepository.find({
      where: [
        {
          user: { userId: userId },
          createdAt: Between(dateFrom, dateTo),
          expiresAt: MoreThan(new Date()),
        },
        {
          user: { userId: userId },
          createdAt: Between(dateFrom, dateTo),
          expiresAt: IsNull(),
        },
        {
          user: { userId: userId },
          createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          expiresAt: MoreThan(new Date()),
        },
        {
          user: { userId: userId },
          createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          expiresAt: IsNull(),
        }
      ],
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    
    console.log(`\n🖼️  Generated images with date filter - Found ${generatedImages.length} items`);

    const generatedVideos = await generatedVideoRepository.find({
      where: [
        {
          user: { userId: userId },
          createdAt: Between(dateFrom, dateTo),
          status: 'COMPLETED',
        },
        {
          user: { userId: userId },
          createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          status: 'COMPLETED',
        }
      ],
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    
    console.log(`\n🎬 Generated videos with date filter - Found ${generatedVideos.length} items`);

    const generatedAudios = await generatedAudioRepository.find({
      where: [
        {
          user: { userId: userId },
          createdAt: Between(dateFrom, dateTo),
        },
        {
          user: { userId: userId },
          createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        }
      ],
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    
    console.log(`\n🎵 Generated audios with date filter - Found ${generatedAudios.length} items`);

    // Summary
    const totalItems = contents.length + generatedImages.length + generatedVideos.length + generatedAudios.length;
    console.log(`\n📊 Summary: Found ${totalItems} total items across all tables for user ${userId}`);
    
    if (totalItems > 0) {
      console.log('✅ Gallery service should return data');
    } else {
      console.log('⚠️  Gallery service would return empty results');
    }

  } catch (error) {
    console.error('❌ Error during gallery service logic test:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the test
testGalleryServiceLogic();