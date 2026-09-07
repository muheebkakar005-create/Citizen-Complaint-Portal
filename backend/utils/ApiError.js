/**
 * Standardized error class carrying an HTTP status code.
 * Thrown anywhere in the app and caught by the global error middleware.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
