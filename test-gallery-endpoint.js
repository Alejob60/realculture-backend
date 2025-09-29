const axios = require('axios');

async function testGalleryEndpoint() {
  try {
    console.log('Logging in with the test user...');
    
    // Login with the test user
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-audio-1758711790615@example.com',
      password: 'TestPassword123!'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful');
    const token = loginResponse.data.token;
    console.log('Token obtained:', token ? 'PRESENT' : 'MISSING');
    
    // Now test the gallery endpoint
    console.log('Testing gallery endpoint...');
    
    const response = await axios.get('http://localhost:3001/api/gallery', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Gallery response status:', response.status);
    console.log('Gallery response data:', JSON.stringify(response.data, null, 2));
    
    // Check if we have items in the gallery
    if (response.data && Array.isArray(response.data)) {
      console.log(`Gallery contains ${response.data.length} items`);
      
      if (response.data.length > 0) {
        console.log('First item:', JSON.stringify(response.data[0], null, 2));
      }
    } else {
      console.log('❌ Unexpected response format from gallery endpoint');
    }
    
  } catch (error) {
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.log('Error response headers:', JSON.stringify(error.response.headers, null, 2));
    } else {
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
    }
  }
}

testGalleryEndpoint();