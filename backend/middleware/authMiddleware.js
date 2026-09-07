const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * protect: verifies the JWT from the Authorization header, loads the
 * corresponding user from the database, and attaches it to req.user.
 *
 * This is the ONLY source of truth for "who is making this request" -
 * the frontend can never spoof req.user by sending a body field.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. No token provided.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authorized. Invalid or expired token.');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new ApiError(401, 'Not authorized. User for this token no longer exists.');
  }

  req.user = user; // full Mongoose user document (password excluded by schema)
  next();
});

/**
 * optionalAuth: if a valid token is present, attaches req.user.
 * Does NOT reject the request if the token is missing/invalid - used for
 * routes that are public but behave slightly differently for logged-in users
 * (e.g. the public complaint feed marking which complaints the viewer upvoted).
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) req.user = user;
    } catch (err) {
      // Invalid token on an optional route: proceed as anonymous.
    }
  }
  next();
});

module.exports = { protect, optionalAuth };
