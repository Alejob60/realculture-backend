const axios = require('axios');

async function testGalleryComplete() {
  try {
    console.log('Testing gallery endpoint with comprehensive test...');
    
    // Login with the test user
    console.log('Logging in with the test user...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-audio-1758711790615@example.com',
      password: 'TestPassword123!'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful');
    const token = loginResponse.data.access_token;
    console.log('Token obtained:', token ? 'PRESENT' : 'MISSING');
    
    // Test gallery endpoint
    console.log('Testing gallery endpoint...');
    const response = await axios.get('http://localhost:3001/api/gallery', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Gallery response status:', response.status);
    console.log('Gallery response data:', JSON.stringify(response.data, null, 2));
    console.log('Gallery contains', response.data.length, 'items');
    
    // Test with different user to see if we get proper isolation
    console.log('\n--- Testing user isolation ---');
    
    // Try to register a new user
    try {
      console.log('Registering new test user...');
      const registerResponse = await axios.post('http://localhost:3001/api/auth/register', {
        email: 'gallery-test-' + Date.now() + '@example.com',
        password: 'TestPassword123!',
        name: 'Gallery Test User'
      }, {
        headers: {
          'Content-Type': 'application/json'
      }
      });
      
      console.log('Registration successful for new user');
      const newToken = registerResponse.data.access_token;
      
      // Test gallery for new user
      const newResponse = await axios.get('http://localhost:3001/api/gallery', {
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('New user gallery response status:', newResponse.status);
      console.log('New user gallery contains', newResponse.data.length, 'items');
    } catch (registerError) {
      console.log('Could not register new user, testing with existing user only');
    }
    
    console.log('\n✅ Gallery endpoint test completed successfully!');
    
  } catch (error) {
    console.error('Error testing gallery endpoint:');
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response headers:', JSON.stringify(error.response.headers, null, 2));
    } else {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testGalleryComplete();