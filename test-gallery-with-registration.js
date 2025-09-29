const axios = require('axios');

async function testGalleryWithRegistration() {
  try {
    console.log('Testing gallery endpoint with user registration...');
    
    // Generate a unique email for this test
    const testEmail = `gallery-test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = 'Gallery Test User';
    
    console.log('Registering new test user:', testEmail);
    
    // Register a new user
    const registerResponse = await axios.post('http://localhost:3001/api/auth/register', {
      email: testEmail,
      password: testPassword,
      name: testName
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful');
    const token = registerResponse.data.token;  // Changed from access_token to token
    console.log('Token obtained:', token ? 'PRESENT' : 'MISSING');
    
    // Test gallery endpoint immediately after registration
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
    
    // Test that we get a proper 200 response
    if (response.status === 200) {
      console.log('\n✅ Gallery endpoint is working correctly!');
      console.log('✅ User can access their gallery');
      console.log('✅ No database errors occurred');
    } else {
      console.log('\n❌ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('Error testing gallery endpoint:');
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testGalleryWithRegistration();