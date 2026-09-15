const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT containing only the minimum claims needed:
 * userId and role. Never put sensitive data (like password) into a JWT.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
