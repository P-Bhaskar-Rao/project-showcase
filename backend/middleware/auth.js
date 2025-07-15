// middleware/auth.middleware.js
const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');
const mongoose = require('mongoose');


const authMiddleware = async (req, res, next) => {
  try {
    console.log('[authMiddleware] Called for', req.method, req.originalUrl);
    const authHeader = req.headers.authorization;
    const accessToken = extractTokenFromHeader(authHeader);
    console.log('[authMiddleware] Extracted token:', accessToken);

    if (!accessToken) {
      console.log('[authMiddleware] No access token provided');
      return res.status(401).json({ success: false, error: 'Unauthorized: No access token provided' });
    }

    // Verify the access token
    let decoded;
    try {
      decoded = verifyAccessToken(accessToken);
      console.log('[authMiddleware] Decoded token:', decoded);
    } catch (err) {
      console.log('[authMiddleware] Invalid token:', err.message);
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }

    // Find the user by ID from the decoded token
    let user;
    try {
      user = await User.findById(decoded.userId);
      if (!user && mongoose.isValidObjectId(decoded.userId)) {
        user = await User.findById(new mongoose.Types.ObjectId(decoded.userId));
      }
      console.log('[authMiddleware] User lookup result:', user ? user._id : 'not found');
    } catch (err) {
      console.log('[authMiddleware] Error during user lookup:', err.message);
    }

    if (!user) {
      console.log('[authMiddleware] User not found');
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found' });
    }

    // Attach user information to the request object
    req.user = user;
    req.user._id = user._id.toString(); // Always set as string
    console.log('[authMiddleware] User attached to req, calling next()');
    next();
  } catch (error) {
    console.log('[authMiddleware] General error:', error.message);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = authMiddleware;
