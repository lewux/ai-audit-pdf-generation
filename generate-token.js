const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate a test JWT token
const payload = {
    userId: 'test-user',
    email: 'test@example.com',
    role: 'admin'
};

const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '24h'
});

console.log('Generated JWT Token:');
console.log(token);
console.log('\nUse this token in the Authorization header:');
console.log(`Authorization: Bearer ${token}`);





