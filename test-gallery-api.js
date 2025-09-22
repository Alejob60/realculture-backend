const axios = require('axios');
const { config } = require('dotenv');

// Load environment variables
config();

// Test the gallery API endpoint
async function testGalleryAPI() {
  console.log('Testing gallery API endpoint...');
  
  // You'll need to provide a valid JWT token for a user with CREATOR or PRO role
  // For this test, we'll need to first login to get a token
  try {
    console.log('🔐 Attempting to login to get authentication token...');
    
    // First, let's try to login (you'll need to provide valid credentials)
    const loginResponse = await axios.post(
      `${process.env.PUBLIC_BACKEND_URL}/auth/login`,
      {
        email: 'alejob6001@gmail.com', // Use an existing user email
        password: 'your-password-here' // You'll need to provide the actual password
      }
    );
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, got token');
    
    // Now test the gallery endpoint
    console.log('\n🖼️  Testing gallery endpoint...');
    const galleryResponse = await axios.get(
      `${process.env.PUBLIC_BACKEND_URL}/gallery`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`✅ Gallery API returned ${galleryResponse.data.length} items`);
    console.log('Gallery data:', JSON.stringify(galleryResponse.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ API Error - Status: ${error.response.status}`);
      console.log('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

// Alternative test - if you have a token, you can test directly
async function testGalleryWithToken(token) {
  console.log('Testing gallery API endpoint with provided token...');
  
  try {
    // Test the gallery endpoint
    console.log('\n🖼️  Testing gallery endpoint...');
    const galleryResponse = await axios.get(
      `${process.env.PUBLIC_BACKEND_URL}/gallery`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`✅ Gallery API returned ${galleryResponse.data.length} items`);
    console.log('Gallery data:', JSON.stringify(galleryResponse.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ API Error - Status: ${error.response.status}`);
      console.log('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

// Run the test
// testGalleryAPI(); // Uncomment this if you want to test with login

// Or provide a token directly:
// testGalleryWithToken('your-jwt-token-here');

console.log('To test the gallery API:');
console.log('1. Uncomment one of the test functions above');
console.log('2. Provide valid credentials or a JWT token');
console.log('3. Run: node test-gallery-api.js');