// Test script to verify JWT token user ID extraction
const jwt = require('jsonwebtoken');

// Create a test token with the same structure as your JWT tokens
const secret = 'your-jwt-secret'; // This should match your JWT_SECRET in .env
const payload = {
  sub: '20bcd340-8a06-4a2f-be87-fce4fd6b318c',
  email: 'test@example.com',
  name: 'Test User',
  role: 'PRO',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
};

const token = jwt.sign(payload, secret);
console.log('Generated test token:', token);

// Decode the token to verify its structure
const decoded = jwt.decode(token);
console.log('Decoded token payload:', decoded);

// Verify that the 'sub' field exists and contains the user ID
if (decoded && decoded.sub) {
  console.log('✅ User ID (sub) found in token:', decoded.sub);
} else {
  console.log('❌ User ID (sub) not found in token');
}

// Test the structure that our JwtStrategy returns
const userObjectFromStrategy = {
  id: decoded.sub, // This is what JwtStrategy returns
  email: decoded.email,
  name: decoded.name,
  role: decoded.role
};

console.log('User object from JwtStrategy:', userObjectFromStrategy);

// Verify that we can extract the user ID correctly
const userId = userObjectFromStrategy.id;
if (userId) {
  console.log('✅ User ID correctly extracted:', userId);
} else {
  console.log('❌ Failed to extract user ID');
}