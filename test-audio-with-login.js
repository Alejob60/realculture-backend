const axios = require('axios');

// Test the audio generation endpoint through the media controller
async function testAudioGeneration() {
  try {
    console.log('Testing login to get a valid token...');
    
    // First, let's login to get a valid token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'desarrollo@misybot.com',
      password: 'Alejob6005901@/'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful');
    const token = loginResponse.data.token;
    console.log('Token obtained:', token ? 'PRESENT' : 'MISSING');
    
    // Now test the audio generation endpoint
    console.log('Testing audio generation endpoint through media controller...');
    
    const response = await axios.post('http://localhost:3001/api/media/audio', {
      prompt: 'di: quiero comer sopara en el desayuno',
      duration: '20s',
      style: 'narrative'
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

testAudioGeneration();