const axios = require('axios');

// Test the prompt-json endpoint
async function testPromptJson() {
  try {
    console.log('Testing prompt-json endpoint...');
    
    const response = await axios.post('http://localhost:3001/api/prompt-json', {
      prompt: 'Generate a JSON for a product catalog'
    }, {
      headers: {
        'Authorization': 'Bearer fake-token-for-testing', // This will cause unauthorized error
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

testPromptJson();