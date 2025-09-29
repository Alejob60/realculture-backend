const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMGJjZDM0MC04YTA2LTRhMmYtYmU4Ny1mY2U0ZmQ2YjMxOGMiLCJlbWFpbCI6ImRlc2Fycm9sbG9AbWlzeWJvdC5jb20iLCJuYW1lIjoiQWxlamFuZHJvIiwicm9sZSI6IlBSTyIsImlhdCI6MTc1ODQ3Mzg4MSwiZXhwIjoxNzU4NDc0NzgxfQ.Wu-mrWj0l_J27jnrckchW_DORoCT4ORLFbTQ4LsMpBg';

async function testFluxEndpoint() {
  try {
    console.log('Testing FLUX image generation endpoint...');
    
    const response = await axios.post('http://localhost:3001/api/flux-image', {
      prompt: 'A beautiful sunset over the mountains',
      plan: 'PRO'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

async function testPromoImageEndpoint() {
  try {
    console.log('Testing Promo image generation endpoint...');
    
    const response = await axios.post('http://localhost:3001/api/promo-image', {
      prompt: 'A beautiful sunset over the mountains',
      useFlux: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

async function testDualImageMode() {
  try {
    console.log('Testing Dual image mode...');
    
    const response = await axios.post('http://localhost:3001/api/promo-image', {
      prompt: 'A beautiful sunset over the mountains',
      dualImageMode: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Run tests
testFluxEndpoint();
// testPromoImageEndpoint();
// testDualImageMode();