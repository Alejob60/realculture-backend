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

// Generate a new token for the same user
const payload = {
  sub: '20bcd340-8a06-4a2f-be87-fce4fd6b318c',
  email: 'desarrollo@misybot.com',
  name: 'Alejandro',
  role: 'PRO'
};

// Set expiration to 1 day from now
const newToken = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

console.log('New token:', newToken);