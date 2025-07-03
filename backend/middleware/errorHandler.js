// middleware/errorHandler.js

/**
 * Centralized error handling middleware.
 * Catches errors from routes and other middleware, formats them, and sends a consistent JSON response.
 * @param {Error} err - The error object.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error caught by errorHandler:', err); // Log the error for debugging
  
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let details = [];
  
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
      for (let field in err.errors) {
        details.push({
          field: err.errors[field].path,
          message: err.errors[field].message
        });
      }
    } 
    // Handle Mongoose duplicate key errors
    else if (err.code === 11000) {
      statusCode = 409; // Conflict
      message = 'Duplicate field value';
      // Extract the field name from the error message
      const field = Object.keys(err.keyValue)[0];
      details.push({
        field: field,
        message: `${field} '${err.keyValue[field]}' already exists.`
      });
    }
    // Handle JWT errors (already handled in jwt.js, but good to have a fallback)
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Unauthorized: Invalid or expired token';
    }
    // Handle Zod validation errors (should be caught by validateBody/validateQuery middleware first, but as a fallback)
    else if (err.errors && Array.isArray(err.errors) && err.errors[0] && err.errors[0].path) {
      statusCode = 400;
      message = 'Validation failed';
      details = err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
    }
  
    // Send the error response
    res.status(statusCode).json({
      success: false,
      error: message,
      details: details.length > 0 ? details : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Only send stack in development
    });
  };
  
  module.exports = errorHandler;
  