const axios = require('axios');

async function testGalleryWithData() {
  try {
    console.log('Testing gallery endpoint with existing user data...');
    
    // Try to login with an existing user from the database
    // Based on the database query results, let's try one of the existing users
    console.log('Attempting to login with existing user...');
    
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'alejob6001@gmail.com',  // This user exists based on database query
        password: '12345678'  // You'll need to use the correct password
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
      console.log('Gallery response data (first 3 items):', JSON.stringify(response.data.slice(0, 3), null, 2));
      
      if (response.data.length > 0) {
        console.log('\n✅ Gallery endpoint is working correctly and returning data!');
        console.log(`✅ Found ${response.data.length} items in the gallery`);
      } else {
        console.log('\n⚠️  Gallery endpoint is working but returned empty array');
        console.log('This might be because the user has no content or filtering is too restrictive');
      }
      
    } catch (loginError) {
      console.log('Could not login with existing user, trying registration...');
      
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
      const token = registerResponse.data.token;
      
      // Test gallery endpoint immediately after registration
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
        console.log('\n✅ Gallery endpoint is working correctly and returning data!');
        console.log(`✅ Found ${response.data.length} items in the gallery`);
      } else {
        console.log('\n⚠️  Gallery endpoint is working but returned empty array');
        console.log('This is expected for a new user with no content');
      }
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

testGalleryWithData();