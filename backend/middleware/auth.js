// middleware/auth.middleware.js
const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware to protect routes by verifying JWT access token.
 * Attaches the decoded user payload to req.user if valid.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = extractTokenFromHeader(authHeader);

    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No access token provided' });
    }

    // Verify the access token
    const decoded = verifyAccessToken(accessToken);

    // Find the user by ID from the decoded token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found' });
    }

    // Attach user information to the request object
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.message === 'Access token has expired') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Access token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.message === 'Invalid access token') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid access token', code: 'INVALID_TOKEN' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed', details: error.message });
  }
};

module.exports = authMiddleware;
