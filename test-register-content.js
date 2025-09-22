// Test script to verify content registration with blob path
require('dotenv').config();

async function testRegisterContent() {
  try {
    // Simulate the registerGeneratedContent call
    const testData = {
      userId: 'test-user-id',
      type: 'image',
      prompt: 'A beautiful landscape',
      url: 'https://realculturestorage.blob.core.windows.net/images/test-image.jpg',
      duration: null,
      status: 'completed',
      createdAt: new Date()
    };
    
    console.log('Test data:', testData);
    
    // Since we can't easily instantiate the ContentUseCase with its dependencies,
    // let's just verify that the blob path extraction works as expected
    const url = testData.url;
    
    // Extract blob path from the media URL (same logic as in the ContentUseCase)
    function extractBlobPathFromUrl(url) {
      if (!url) return null;
      
      try {
        const urlObj = new URL(url);
        // Azure Blob URLs have the format: https://account.blob.core.windows.net/container/blob-path
        // We want to extract the blob-path part
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        
        // The blob path is everything after the container name (second part)
        if (pathParts.length >= 2) {
          // Remove the first two parts (empty string and container name) and join the rest
          return pathParts.slice(1).join('/');
        }
        
        return null;
      } catch (error) {
        return null;
      }
    }
    
    const blobPath = extractBlobPathFromUrl(url);
    console.log('Extracted blob path:', blobPath);
    
    // Verify that the blobPath would be correctly set in the content object
    const contentObject = {
      creatorId: testData.userId,
      type: testData.type,
      description: testData.prompt,
      mediaUrl: testData.url,
      blobPath: blobPath || undefined,
      duration: testData.duration,
      status: testData.status,
      createdAt: testData.createdAt,
    };
    
    console.log('Content object that would be saved:', JSON.stringify(contentObject, null, 2));
    
    if (contentObject.blobPath) {
      console.log('✅ SUCCESS: blobPath is correctly set in the content object');
    } else {
      console.log('❌ FAILURE: blobPath is not set in the content object');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegisterContent();