const fetch = require('node-fetch');

// Replace with a valid JWT token from your application
// You can get this by logging in through the /api/auth/login endpoint
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIwYmNkMzQwLThhMDYtNGEyZi1iZTg3LWZjZTRmZDZiMzE4YyIsInJvbGUiOiJQUk8iLCJpYXQiOjE2OTQ2MjM0NjUsImV4cCI6MTY5NDcwOTg2NX0.5FkxKQJQ8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8';

async function testGalleryEndpoint() {
  try {
    console.log('Testing gallery endpoint...');
    
    const response = await fetch('http://localhost:3001/api/gallery', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Gallery data retrieved successfully:');
      console.log(JSON.stringify(data, null, 2));
      
      // Check if SAS URLs are being generated
      if (data.length > 0) {
        const itemsWithSasUrls = data.filter(item => item.sasUrl !== null);
        console.log(`Items with SAS URLs: ${itemsWithSasUrls.length}/${data.length}`);
        
        if (itemsWithSasUrls.length > 0) {
          console.log('✅ Gallery endpoint is working correctly with SAS URLs');
        } else {
          console.log('⚠️  Gallery endpoint is working but SAS URLs are still null');
        }
      } else {
        console.log('ℹ️  No content found in gallery');
      }
    } else {
      console.error(`❌ Error: ${response.status} - ${text}`);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testGalleryEndpoint();