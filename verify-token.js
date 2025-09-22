const jwt = require('jsonwebtoken');
const fs = require('fs');

// Read the .env file to get the JWT_SECRET
const envContent = fs.readFileSync('.env', 'utf8');
const jwtSecretLine = envContent.split('\n').find(line => line.startsWith('JWT_SECRET='));
const jwtSecret = jwtSecretLine ? jwtSecretLine.split('=')[1] : null;

if (!jwtSecret) {
  console.error('JWT_SECRET not found in .env file');
  process.exit(1);
}

console.log('JWT_SECRET from .env:', jwtSecret);

// The token to verify
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMGJjZDM0MC04YTA2LTRhMmYtYmU4Ny1mY2U0ZmQ2YjMxOGMiLCJlbWFpbCI6ImRlc2Fycm9sbG9AbWlzeWJvdC5jb20iLCJuYW1lIjoiQWxlamFuZHJvIiwicm9sZSI6IlBSTyIsImlhdCI6MTc1ODQ3Mzg4MSwiZXhwIjoxNzU4NDc0NzgxfQ.Wu-mrWj0l_J27jnrckchW_DORoCT4ORLFbTQ4LsMpBg';

try {
  const decoded = jwt.verify(token, jwtSecret);
  console.log('Token is valid:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
}