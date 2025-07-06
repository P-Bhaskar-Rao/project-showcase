// middleware/auth.middleware.js
const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');
const mongoose = require('mongoose');

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
    let decoded;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }

    // Find the user by ID from the decoded token
    let user;
    try {
      user = await User.findById(decoded.userId);
      if (!user && mongoose.isValidObjectId(decoded.userId)) {
        // Try with ObjectId conversion if not found
        user = await User.findById(new mongoose.Types.ObjectId(decoded.userId));
      }
    } catch (err) {
      // Error handling for user lookup
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found' });
    }

    // Attach user information to the request object
    req.user = user;
    req.user._id = user._id.toString(); // Always set as string
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = authMiddleware;
