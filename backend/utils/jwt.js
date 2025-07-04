const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';


const generateAccessToken = (payload) => {
  try {
    const tokenPayload = {
      userId: payload.userId || payload.id,
      email: payload.email,
      name: payload.name,
      isVerified: payload.isVerified
    };
    
    return jwt.sign(tokenPayload, JWT_ACCESS_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRY,
      issuer: 'auth-service',
      audience: 'user'
    });
  } catch (error) {
    throw new Error(`Access token generation failed: ${error.message}`);
  }
};

const generateRefreshToken = (payload) => {
  try {
    const tokenPayload = {
      userId: payload.userId || payload.id,
      email: payload.email,
      // Add a random jti (JWT ID) for additional security
      jti: crypto.randomBytes(16).toString('hex')
    };
    
    return jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRY,
      issuer: 'auth-service',
      audience: 'user'
    });
  } catch (error) {
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
};


const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'auth-service',
      audience: 'user'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else {
      throw new Error(`Access token verification failed: ${error.message}`);
    }
  }
};


const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'auth-service',
      audience: 'user'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  }
};

// Generate token pair (access + refresh)
const generateTokenPair = (payload) => {
  try {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw new Error(`Token pair generation failed: ${error.message}`);
  }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new Error(`Token decoding failed: ${error.message}`);
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return Date.now() >= decoded.exp * 1000;
    }
    return true;
  } catch (error) {
    return true;
  }
};

// Extract token from authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// Set refresh token cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction, // Use secure in production
    sameSite: isProduction ? 'None' : 'Lax', // 'None' for cross-site, 'Lax' for same-site
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

// Clear refresh token cookie
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/'
  });
};

// Generate secure random token (for email verification, password reset, etc.)
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  extractTokenFromHeader,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  generateSecureToken
};
