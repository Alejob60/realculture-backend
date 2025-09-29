const axios = require('axios');

// Test the audio generation endpoint through the media controller
async function testAudioGeneration() {
  try {
    console.log('Testing audio generation endpoint through media controller...');
    
    // Replace with a valid JWT token from your application
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMGJjZDM0MC04YTA2LTRhMmYtYmU4Ny1mY2U0ZmQ2YjMxOGMiLCJlbWFpbCI6ImRlc2Fycm9sbG9AbWlzeWJvdC5jb20iLCJuYW1lIjoiQWxlamFuZHJvIiwicm9sZSI6IlBSTyIsImlhdCI6MTc1ODcxMDM0NCwiZXhwIjoxNzU4NzExMjQ0fQ.hMq9Sml1lZAJjxgY82kA4BQuwQbFDI_xdH9vWt2rNzM';
    
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