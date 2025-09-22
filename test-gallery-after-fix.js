/**
 * Test script to verify gallery endpoint works after database schema fix
 * Run this after applying the database schema fix
 */

const fetch = require('node-fetch');

// Replace with a valid JWT token from your application
const JWT_TOKEN = 'YOUR_VALID_JWT_TOKEN_HERE';

// Replace with your backend URL
const BACKEND_URL = 'http://localhost:3000';

async function testGalleryEndpoint() {
  try {
    console.log('Testing gallery endpoint...');
    
    const response = await fetch(`${BACKEND_URL}/gallery`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
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
      const errorText = await response.text();
      console.error(`❌ Error: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testGalleryEndpoint();