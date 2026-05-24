// =============================================================
// Global Error Handler Middleware
// Catches all errors and returns consistent JSON responses
// =============================================================

/**
 * Global error handling middleware
 * Must have 4 parameters for Express to recognize it as error handler
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ---------------------
  // Mongoose Errors
  // ---------------------

  // Duplicate key error (e.g., email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists`;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('. ');
  }

  // Cast error (invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found - invalid ID format';
  }

  // ---------------------
  // JWT Errors
  // ---------------------
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again';
  }

  // ---------------------
  // Send Error Response
  // ---------------------
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
