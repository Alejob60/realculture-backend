const axios = require('axios');

async function loginAndTestAudio() {
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
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.token;
    console.log('Token obtained:', token ? 'PRESENT' : 'MISSING');
    
    // Now test the audio generation endpoint
    console.log('Testing audio generation endpoint through media controller...');
    
    const response = await axios.post('http://localhost:3001/api/media/audio', {
      prompt: 'di: me gustaría escuchar una historia sobre aventuras en la selva',
      duration: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Full response data:', JSON.stringify(response.data, null, 2));
    
    // Check if we have an audio URL in the result
    if (response.data && response.data.result) {
      console.log('Result object:', JSON.stringify(response.data.result, null, 2));
      
      // Check if there's an audioUrl property
      if (response.data.result.audioUrl) {
        console.log('Audio URL found:', response.data.result.audioUrl);
        if (response.data.result.audioUrl.includes('?')) {
          console.log('✅ Audio URL contains SAS token');
        } else {
          console.log('❌ Audio URL does not contain SAS token');
        }
      } else {
        console.log('❌ No audioUrl found in result');
      }
    }
    
    // Check credits
    if (response.data && response.data.credits !== undefined) {
      console.log('Remaining credits:', response.data.credits);
    } else {
      console.log('❌ Credits not found in response');
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

loginAndTestAudio();