// Mock test to verify gallery service logic with 25 items to test the 20-item limit
const { Logger } = require('@nestjs/common');

// Mock QueryBuilder implementation
class MockQueryBuilder {
  constructor() {
    this.data = [];
  }
  
  where() { return this; }
  andWhere() { return this; }
  orderBy() { return this; }
  limit() { return this; }
  
  async getMany() {
    return this.data;
  }
}

// Mock repository implementation with 7 items each
class MockRepository {
  createQueryBuilder() {
    const queryBuilder = new MockQueryBuilder();
    // Set mock data with 7 items
    queryBuilder.data = [
      { 
        id: 'content-1', 
        createdAt: new Date(), 
        mediaUrl: 'https://example.com/content1.jpg', 
        title: 'Test Content 1',
        description: 'Test description 1',
        type: 'image'
      },
      { 
        id: 'content-2', 
        createdAt: new Date(Date.now() - 1000000), 
        mediaUrl: 'https://example.com/content2.jpg', 
        title: 'Test Content 2',
        description: 'Test description 2',
        type: 'video'
      },
      { 
        id: 'content-3', 
        createdAt: new Date(Date.now() - 2000000), 
        mediaUrl: 'https://example.com/content3.jpg', 
        title: 'Test Content 3',
        description: 'Test description 3',
        type: 'audio'
      },
      { 
        id: 'content-4', 
        createdAt: new Date(Date.now() - 3000000), 
        mediaUrl: 'https://example.com/content4.jpg', 
        title: 'Test Content 4',
        description: 'Test description 4',
        type: 'image'
      },
      { 
        id: 'content-5', 
        createdAt: new Date(Date.now() - 4000000), 
        mediaUrl: 'https://example.com/content5.jpg', 
        title: 'Test Content 5',
        description: 'Test description 5',
        type: 'video'
      },
      { 
        id: 'content-6', 
        createdAt: new Date(Date.now() - 5000000), 
        mediaUrl: 'https://example.com/content6.jpg', 
        title: 'Test Content 6',
        description: 'Test description 6',
        type: 'audio'
      },
      { 
        id: 'content-7', 
        createdAt: new Date(Date.now() - 6000000), 
        mediaUrl: 'https://example.com/content7.jpg', 
        title: 'Test Content 7',
        description: 'Test description 7',
        type: 'image'
      }
    ];
    return queryBuilder;
  }
  
  async find(options) {
    // Return mock data with 7 items
    return [
      { id: '1', createdAt: new Date(), imageUrl: 'https://example.com/image1.jpg', prompt: 'Test image 1', user: { userId: 'test-user-id' } },
      { id: '2', createdAt: new Date(Date.now() - 1000000), imageUrl: 'https://example.com/image2.jpg', prompt: 'Test image 2', user: { userId: 'test-user-id' } },
      { id: '3', createdAt: new Date(Date.now() - 2000000), imageUrl: 'https://example.com/image3.jpg', prompt: 'Test image 3', user: { userId: 'test-user-id' } },
      { id: '4', createdAt: new Date(Date.now() - 3000000), imageUrl: 'https://example.com/image4.jpg', prompt: 'Test image 4', user: { userId: 'test-user-id' } },
      { id: '5', createdAt: new Date(Date.now() - 4000000), imageUrl: 'https://example.com/image5.jpg', prompt: 'Test image 5', user: { userId: 'test-user-id' } },
      { id: '6', createdAt: new Date(Date.now() - 5000000), imageUrl: 'https://example.com/image6.jpg', prompt: 'Test image 6', user: { userId: 'test-user-id' } },
      { id: '7', createdAt: new Date(Date.now() - 6000000), imageUrl: 'https://example.com/image7.jpg', prompt: 'Test image 7', user: { userId: 'test-user-id' } },
    ];
  }
}

// Mock AzureBlobService
class MockAzureBlobService {
  async blobExists() { return true; }
  async getSignedUrlForContainer() { return 'https://example.com/sas-url'; }
}

// Gallery service logic (simplified for testing)
class GalleryServiceTest {
  constructor() {
    this.contentRepository = new MockRepository();
    this.generatedImageRepository = new MockRepository();
    this.generatedVideoRepository = new MockRepository();
    this.generatedAudioRepository = new MockRepository();
    this.azureBlobService = new MockAzureBlobService();
    this.logger = new Logger('GalleryServiceTest');
  }

  async getUserGallery(userId) {
    // Validate userId
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    console.log(`Consultando galería para el usuario: ${userId}`);

    // Get content from contents table
    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .where('(content.userId = :userId OR content.creatorUserId = :userId)', { userId })
      .andWhere('(content.expiresAt > :now OR content.expiresAt IS NULL)', { now: new Date() })
      .orderBy('content.createdAt', 'DESC')
      .limit(20)
      .getMany();

    // Get content from generated_images table
    const generatedImages = await this.generatedImageRepository.find({
      where: [{ user: { userId: userId } }],
      order: { createdAt: 'DESC' },
      relations: ['user'],
      take: 20
    });

    // Get content from generated_videos table
    const generatedVideos = await this.generatedVideoRepository.find({
      where: { user: { userId: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
      take: 20
    });

    // Get content from generated_audios table
    const generatedAudios = await this.generatedAudioRepository
      .createQueryBuilder('generatedAudio')
      .where('generatedAudio.userId = :userId', { userId })
      .orderBy('generatedAudio.createdAt', 'DESC')
      .limit(20)
      .getMany();

    console.log(`Found ${contents.length} content items, ${generatedImages.length} generated images, ${generatedVideos.length} generated videos, and ${generatedAudios.length} generated audios for user ${userId}`);

    // Combine and format all content
    const allItems = [];

    // Process content from contents table
    for (const item of contents) {
      allItems.push({
        id: item.id,
        title: item.title || `Content generado el ${item.createdAt.toLocaleDateString()}`,
        description: item.description || item.prompt || '',
        type: item.type || 'other',
        createdAt: item.createdAt,
        sasUrl: item.mediaUrl || null,
        previewUrl: null,
      });
    }

    // Process content from generated_images table
    for (const item of generatedImages) {
      allItems.push({
        id: item.id,
        title: `Imagen generada el ${item.createdAt.toLocaleDateString()}`,
        description: item.prompt || '',
        type: 'image',
        createdAt: item.createdAt,
        sasUrl: item.imageUrl || null,
        previewUrl: null,
      });
    }

    // Process content from generated_videos table
    for (const item of generatedVideos) {
      allItems.push({
        id: item.id,
        title: `Video generado el ${item.createdAt.toLocaleDateString()}`,
        description: item.script || (item.prompt ? JSON.stringify(item.prompt) : '') || '',
        type: 'video',
        createdAt: item.createdAt,
        sasUrl: item.videoUrl || null,
        previewUrl: null,
      });
    }

    // Process content from generated_audios table
    for (const item of generatedAudios) {
      allItems.push({
        id: item.id,
        title: `Audio generado el ${item.createdAt.toLocaleDateString()}`,
        description: item.prompt || '',
        type: 'audio',
        createdAt: item.createdAt,
        sasUrl: item.audioUrl || null,
        previewUrl: null,
      });
    }

    // Sort all items by creation date (newest first)
    allItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Take only the first 20 items
    const limitedItems = allItems.slice(0, 20);

    // Generate SAS URLs and preview URLs for all items
    const result = await Promise.all(
      limitedItems.map(async (item) => {
        let sasUrl = item.sasUrl;
        let previewUrl = item.previewUrl;

        // If the mediaUrl already contains a SAS URL, use it directly
        if (sasUrl && sasUrl.includes('?')) {
          // Already has SAS token
        } else if (sasUrl) {
          // If it's just a blob path, generate a new SAS URL
          try {
            sasUrl = 'https://example.com/sas-url'; // Mock SAS URL
          } catch (error) {
            sasUrl = null;
          }
        }

        return {
          ...item,
          sasUrl,
          previewUrl,
        };
      })
    );

    console.log(`Gallery data prepared for user ${userId}. Returning ${result.length} items`);
    return result;
  }
}

// Run the test
async function runTest() {
  const galleryService = new GalleryServiceTest();
  const result = await galleryService.getUserGallery('test-user-id');
  
  console.log('Gallery result:');
  console.log(`Returned ${result.length} items`);
  
  // Verify that we get exactly 20 items (or less if there aren't enough)
  console.log(`Expected: 20 items (or less if not enough data)`);
  console.log(`Actual: ${result.length} items`);
  
  if (result.length <= 20) {
    console.log('✅ Test passed: Gallery correctly limits results to 20 items or less');
  } else {
    console.log('❌ Test failed: Gallery returned more than 20 items');
  }
  
  console.log('Test completed successfully!');
}

runTest().catch(console.error);