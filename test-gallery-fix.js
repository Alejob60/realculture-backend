// Test script to verify the gallery fix
require('dotenv').config();
const axios = require('axios');

async function testGallery() {
  try {
    // First, let's login to get a token
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const token = loginResponse.data.access_token;
    console.log('Login successful, token obtained');
    
    // Now let's call the gallery endpoint
    const galleryResponse = await axios.get('http://localhost:3001/gallery', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Gallery response:', JSON.stringify(galleryResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testGallery();