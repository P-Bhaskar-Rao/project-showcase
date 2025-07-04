const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if not using OAuth
      return !this.oauthId;
    },
    minlength: [8, 'Password must be at least 8 characters long']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationTokenExpires: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetTokenExpires: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    default: null,
    unique: true,
    sparse: true // Allows multiple null values
  },
  oauthId: {
    type: String,
    default: null,
    unique: true,
    sparse: true // Allows multiple null values
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'github'],
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshToken;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationTokenExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetTokenExpires;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});


userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Generate verification token
userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  this.passwordResetTokenExpires = Date.now() + 60 * 60 * 1000;
  return token;
};

// Clear verification token
userSchema.methods.clearVerificationToken = function() {
  this.emailVerificationToken = null;
  this.emailVerificationTokenExpires = null;
};

// Clear password reset token
userSchema.methods.clearPasswordResetToken = function() {
  this.passwordResetToken = null;
  this.passwordResetTokenExpires = null;
};

// Static: Find user by email and verification token
userSchema.statics.findByVerificationToken = function(email, token) {
  return this.findOne({
    email,
    emailVerificationToken: token,
    emailVerificationTokenExpires: { $gt: Date.now() }
  });
};

// Static: Find user by email and password reset token
userSchema.statics.findByPasswordResetToken = function(email, token) {
  return this.findOne({
    email,
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() }
  });
};

// Static: Find user by refresh token
userSchema.statics.findByRefreshToken = function(refreshToken) {
  return this.findOne({ refreshToken });
};

// Static: OAuth find or create
userSchema.statics.findOrCreateOAuthUser = async function(profile, provider) {
  try {
    let user = await this.findOne({
      oauthId: profile.id,
      oauthProvider: provider
    });

    if (user) return user;

    if (profile.emails && profile.emails.length > 0 && profile.emails[0].value) {
      user = await this.findOne({ email: profile.emails[0].value });
    }

    if (user) {
      user.oauthId = profile.id;
      user.oauthProvider = provider;
      user.isVerified = true;
      if (profile.photos && profile.photos.length > 0) {
        user.avatar = profile.photos[0].value;
      }
      await user.save();
      return user;
    }

    if (!profile.emails || profile.emails.length === 0 || !profile.emails[0].value) {
      throw new Error('OAuth profile does not contain an email address.');
    }

    user = new this({
      name: profile.displayName || profile.username || profile.emails[0].value.split('@')[0],
      email: profile.emails[0].value,
      oauthId: profile.id,
      oauthProvider: provider,
      isVerified: true,
      avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
    });

    await user.save();
    return user;
  } catch (error) {
    console.error(`Error in findOrCreateOAuthUser for ${provider}:`, error);
    throw new Error(`OAuth user creation failed: ${error.message}`);
  }
};

module.exports = mongoose.model('User', userSchema);
