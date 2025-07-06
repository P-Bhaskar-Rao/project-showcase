const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateTokenPair, setRefreshTokenCookie, clearRefreshTokenCookie, verifyRefreshToken } = require('../utils/jwt');
const { sendEmail, emailTemplates, FRONTEND_URL } = require('../utils/email');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';


exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }

    const user = new User({ name, email, password });
    
    // Generate email verification token
    const verificationToken = user.generateVerificationToken();
    
    await user.save();

    // Send verification email
    const verificationLink = `${SERVER_URL}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: user.email,
      subject: emailTemplates.verification.subject,
      html: emailTemplates.verification.getHtml(verificationLink, user.name),
      text: emailTemplates.verification.getText(verificationLink, user.name)
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token, email } = req.query;

    const user = await User.findByVerificationToken(email, token);

    if (!user) {
      // Redirect to frontend with an error status or message
      return res.redirect(`${FRONTEND_URL}/verify-email?status=expired&email=${encodeURIComponent(email)}`);
    }

    user.isVerified = true;
    user.clearVerificationToken(); // Clear token after successful verification
    await user.save();

    // Redirect to frontend with success status
    res.redirect(`${FRONTEND_URL}/verify-email?status=success&email=${encodeURIComponent(email)}`);
  } catch (error) {
    res.redirect(`${FRONTEND_URL}/verify-email?status=error&email=${encodeURIComponent(req.query.email || '')}`);
  }
};

exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    // Generate a new verification token
    const newVerificationToken = user.generateVerificationToken();
    await user.save();

    // Send new verification email
    const verificationLink = `${SERVER_URL}/api/auth/verify-email?token=${newVerificationToken}&email=${encodeURIComponent(user.email)}`;
    await sendEmail({
      to: user.email,
      subject: emailTemplates.verification.subject,
      html: emailTemplates.verification.getHtml(verificationLink, user.name),
      text: emailTemplates.verification.getText(verificationLink, user.name)
    });

    res.status(200).json({
      success: true,
      message: 'New verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(403).json({ success: false, error: 'Account locked. Please try again later.' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ success: false, error: 'Email not verified. Please verify your email to log in.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts and potentially lock account
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user._id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified
    });

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        avatar: user.avatar,
        oauthProvider: user.oauthProvider
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.oauthCallbackSuccess = (req, res) => {
  // Passport.js attaches the user to req.user
  const user = req.user;

  if (!user) {
    // This should ideally not happen if Passport.js is configured correctly
    return res.redirect(`${FRONTEND_URL}/auth-error?message=OAuth authentication failed.`);
  }

  try {
    // Generate tokens for the OAuth user
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user._id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified
    });

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.save(); // Don't await here to avoid blocking redirect

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Redirect to frontend with access token in query parameter (or hash fragment for better security)
    // Using query parameter for simplicity as per prompt, but hash fragment is often preferred.
    res.redirect(`${FRONTEND_URL}/auth-success?token=${accessToken}`);
  } catch (error) {
    res.redirect(`${FRONTEND_URL}/auth-error?message=Failed to process OAuth login.`);
  }
};


exports.oauthCallbackFailure = (req, res) => {
  res.redirect(`${FRONTEND_URL}/auth-error?message=OAuth authentication failed.`);
};


exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No refresh token provided.' });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      // If refresh token is invalid or expired, clear cookie and return error
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, error: `Unauthorized: ${error.message}`, code: 'REFRESH_TOKEN_INVALID' });
    }

    // Find user by the refresh token stored in DB
    const user = await User.findByRefreshToken(refreshToken);

    if (!user) {
      // If refresh token is not found in DB (e.g., already used or revoked), clear cookie
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, error: 'Unauthorized: Session expired or revoked.', code: 'SESSION_REVOKED' });
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      userId: user._id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified
    });

    // Update refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token as httpOnly cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Access token refreshed.',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        avatar: user.avatar,
        oauthProvider: user.oauthProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Find user by refresh token and clear it
      const user = await User.findByRefreshToken(refreshToken);
      if (user) {
        // Use $unset to remove refreshToken instead of setting to null
        await User.updateOne({ _id: user._id }, { $unset: { refreshToken: "" } });
      }
    }

    // Clear refresh token cookie from client
    clearRefreshTokenCookie(res);

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};


exports.logoutAllDevices = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Invalidate all refresh tokens by updating the user document
    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Logged out from all devices successfully.' });
  } catch (error) {
    next(error);
  }
};

// Check if email is verified (for polling after signup)
exports.checkEmailVerificationStatus = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(200).json({ success: true, isVerified: !!user.isVerified });
  } catch (error) {
    next(error);
  }
};

// Check if password reset token is valid (for reset password page)
exports.checkResetTokenValidity = async (req, res, next) => {
  try {
    const { email, token } = req.query;
    if (!email || !token) {
      return res.status(400).json({ success: false, error: 'Email and token are required.' });
    }
    const user = await User.findByPasswordResetToken(email, token);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Reset password using email and token
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, token } = req.query;
    const { password, confirmPassword } = req.body;
    if (!email || !token) {
      return res.status(400).json({ success: false, error: 'Email and token are required.' });
    }
    if (!password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Password and confirmPassword are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }
    const user = await User.findByPasswordResetToken(email, token);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
    }
    user.password = password;
    user.clearPasswordResetToken();
    await user.save();
    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// Forgot password: send reset link
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      // For security, do not reveal if user does not exist
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }
    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    // Send reset email
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: user.email,
      subject: emailTemplates.passwordReset.subject,
      html: emailTemplates.passwordReset.getHtml(resetLink, user.name),
      text: emailTemplates.passwordReset.getText(resetLink, user.name)
    });
    res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};
