const axios = require('axios');

// Test the audio generation endpoint
async function testAudioGeneration() {
  try {
    console.log('Testing audio generation endpoint...');
    
    // Replace with a valid JWT token from your application
    const token = 'YOUR_VALID_JWT_TOKEN_HERE';
    
    const response = await axios.post('http://localhost:3001/api/media/audio', {
      prompt: 'Create a relaxing ambient music track',
      duration: '30s',
      style: 'ambient'
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
    } else {
      console.log('Error message:', error.message);
    }
  }
}

testAudioGeneration();