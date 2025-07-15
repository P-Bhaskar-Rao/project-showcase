// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User'); // Adjusted path

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id); // Store user ID in session
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Ensure SERVER_URL is defined, provide a fallback if not
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOrCreateOAuthUser(profile, 'google');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // Ensure SERVER_URL is defined, provide a fallback if not
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/github/callback`,
    scope: ['user:email'] // Request email scope
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOrCreateOAuthUser(profile, 'github');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

module.exports = passport;
