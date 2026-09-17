const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

// NOTE: the frontend's User type (src/types.ts) reads `user.id`, not
// `user._id` - this mapping is required for login/session state to work.
function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new CITIZEN account. Public users can never register
 *          as officers through this endpoint - role is hardcoded here,
 *          never trusted from the request body.
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body || {};

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required.');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters.');
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Password and confirm password do not match.');
  }

  const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // role is intentionally NOT read from req.body - always 'citizen' here.
  const user = await User.create({
    name: name.trim(),
    email: String(email).toLowerCase().trim(),
    password,
    role: 'citizen',
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: sanitizeUser(user),
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user (citizen or officer) and issue a JWT.
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    token,
    user: sanitizeUser(user),
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Return the currently authenticated user (used by the frontend
 *          to restore session state on page refresh).
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: sanitizeUser(req.user) });
});

module.exports = { signup, login, getMe };
