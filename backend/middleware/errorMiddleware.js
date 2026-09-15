const ApiError = require('../utils/ApiError');

/**
 * Catches requests to routes that don't exist and turns them into a
 * standard 404 ApiError, which then flows into errorHandler below.
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Centralized error handler. Every thrown error (ApiError or otherwise)
 * ends up here via asyncHandler / Express's default error propagation.
 * Never leaks stack traces or internals in production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation errors -> 400 with readable messages
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose bad ObjectId -> 400 (treated as "not found" from the client's view)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found for id: ${err.value}`;
  }

  // Mongo duplicate key error (e.g. duplicate email) -> 409 Conflict
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${field} already exists.`;
  }

  // JWT errors (defense-in-depth; authMiddleware also handles these)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized. Invalid or expired token.';
  }

  if (statusCode === 500) {
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
