const http = require('http');

// Test promo-image endpoint with dualImageMode
const postData = JSON.stringify({
  prompt: 'A beautiful sunset over the mountains',
  dualImageMode: true
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/promo-image',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMGJjZDM0MC04YTA2LTRhMmYtYmU4Ny1mY2U0ZmQ2YjMxOGMiLCJlbWFpbCI6ImRlc2Fycm9sbG9AbWlzeWJvdC5jb20iLCJuYW1lIjoiQWxlamFuZHJvIiwicm9sZSI6IlBSTyIsImlhdCI6MTc1ODQ3NDk3NSwiZXhwIjoxNzU4NTYxMzc1fQ.jzx1r0LjgMB8sB6ZSNLAbmB7ojn95l_w-XS1YEUzwGE',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Response Body: ${data}`);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(postData);
req.end();