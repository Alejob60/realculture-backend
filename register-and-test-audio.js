const axios = require('axios');

async function registerAndTestAudio() {
  try {
    console.log('Registering a new test user...');
    
    // Register a new user with a unique email
    const timestamp = Date.now();
    const registerResponse = await axios.post('http://localhost:3001/api/auth/register', {
      email: `test-audio-${timestamp}@example.com`,
      password: 'TestPassword123!',
      name: 'Test Audio User'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful');
    console.log('Register response:', JSON.stringify(registerResponse.data, null, 2));
    
    const token = registerResponse.data.token;
    console.log('Token obtained:', token ? 'PRESENT' : 'MISSING');
    
    // Now test the audio generation endpoint
    console.log('Testing audio generation endpoint through media controller...');
    
    const response = await axios.post('http://localhost:3001/api/media/audio', {
      prompt: 'di: quiero comer sopara en el desayuno',
      duration: 20 // Changed to number as per validation error
      // Removed style property as it's not allowed
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
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

registerAndTestAudio();