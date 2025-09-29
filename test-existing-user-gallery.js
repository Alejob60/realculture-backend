const axios = require('axios');

async function testExistingUserGallery() {
  try {
    console.log('Testing gallery endpoint with existing CREATOR/PRO user...');
    
    // Try to login with an existing user that has CREATOR role
    console.log('Attempting to login with existing CREATOR user...');
    
    // Using one of the existing users from our database check
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-audio-1758711790615@example.com',  // This user exists and has CREATOR role
      password: 'TestPassword123!'  // Assuming this is the correct password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful');
    const token = loginResponse.data.token;
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
    console.log('Gallery response data length:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('Gallery response data (first 3 items):', JSON.stringify(response.data.slice(0, 3), null, 2));
      console.log('\n✅ Gallery endpoint is working correctly and returning data!');
      console.log(`✅ Found ${response.data.length} items in the gallery`);
    } else {
      console.log('\n⚠️  Gallery endpoint is working but returned empty array');
      console.log('This might be because the user has no content or filtering is too restrictive');
    }
    
  } catch (error) {
    console.error('Error testing gallery endpoint:');
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 403) {
        console.log('\n⚠️  User does not have permission to access gallery (not CREATOR/PRO role)');
      } else if (error.response.status === 401) {
        console.log('\n⚠️  Authentication failed - incorrect credentials');
      }
    } else {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testExistingUserGallery();