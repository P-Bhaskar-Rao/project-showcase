// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthControllers');
const { validateBody, validateQuery, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, resendVerificationEmailSchema, emailVerificationQuerySchema, passwordResetQuerySchema } = require('../utils/zodSchemas');
const authMiddleware = require('../middleware/auth');
const passport = require('passport');

// Public Routes
router.post('/signup', validateBody(signupSchema), authController.signup);
router.get('/verify-email', validateQuery(emailVerificationQuerySchema), authController.verifyEmail);
router.post('/resend-verification', validateBody(resendVerificationEmailSchema), authController.resendVerificationEmail);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);

// NEW ROUTE: Check Password Reset Token Validity
router.get('/check-reset-token', validateQuery(passwordResetQuerySchema), authController.checkResetTokenValidity);

router.post('/reset-password', validateBody(resetPasswordSchema), validateQuery(passwordResetQuerySchema), authController.resetPassword);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// OAuth Routes
router.get('/google', passport.authenticate('google'));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/auth-error` }),
  authController.oauthCallbackSuccess
);

router.get('/github', passport.authenticate('github'));
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/auth-error` }),
  authController.oauthCallbackSuccess
);

// Protected Routes (require accessToken)
router.post('/logout-all', authMiddleware, authController.logoutAllDevices);

module.exports = router;
