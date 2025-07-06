const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id; // Use _id from attached user document
    
    const user = await User.findById(userId).select('-password -refreshToken -emailVerificationToken -passwordResetToken -loginAttempts -lockUntil');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if profile is complete
    const isProfileComplete = user.isProfileComplete();
    
    res.status(200).json({
      success: true,
      user,
      isProfileComplete
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id; // Use _id from attached user document
    const { bio, skills, education, avatar, socialLinks } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Update profile fields
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (education !== undefined) user.education = education;
    if (avatar !== undefined) user.avatar = avatar;
    if (socialLinks !== undefined) {
      user.socialLinks = {
        ...user.socialLinks,
        ...socialLinks
      };
    }
    
    // Validate the updated user document
    const validationError = user.validateSync();
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationError.message
      });
    }
    
    // Check if profile is now complete
    const isProfileComplete = user.isProfileComplete();
    user.profileCompleted = isProfileComplete;
    
    await user.save();
    
    // Return updated user (excluding sensitive fields)
    const updatedUser = await User.findById(userId).select('-password -refreshToken -emailVerificationToken -passwordResetToken -loginAttempts -lockUntil');
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
      isProfileComplete
    });
  } catch (error) {
    next(error);
  }
};

// Check profile completeness
exports.checkProfileCompleteness = async (req, res, next) => {
  try {
    const user = req.user; // Use the user object attached by the middleware
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found.', code: 'USER_NOT_FOUND' });
    }
    const isProfileComplete = user.isProfileComplete();
    res.status(200).json({
      success: true,
      isProfileComplete,
      missingFields: isProfileComplete ? [] : getMissingFields(user)
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get missing fields
function getMissingFields(user) {
  const missingFields = [];
  
  if (!user.avatar) missingFields.push('avatar');
  
  // Check bio - must not be placeholder
  if (!user.bio || user.bio === 'Add your bio here') missingFields.push('bio');
  
  // Check skills - must not be placeholder
  if (!user.skills || user.skills.length === 0 || 
      user.skills.every(skill => skill === 'Add your skills here')) {
    missingFields.push('skills');
  }
  
  // Check education - must not be placeholder
  if (!user.education || user.education.length === 0 || 
      user.education.every(edu => 
        edu.institution === 'Add your institution' && 
        edu.degree === 'Add your degree' && 
        edu.fieldOfStudy === 'Add your field of study'
      )) {
    missingFields.push('education');
  }
  
  // Check education subfields (only if education exists and is not placeholder)
  if (user.education && user.education.length > 0 && 
      !user.education.every(edu => 
        edu.institution === 'Add your institution' && 
        edu.degree === 'Add your degree' && 
        edu.fieldOfStudy === 'Add your field of study'
      )) {
    user.education.forEach((edu, index) => {
      if (!edu.institution || edu.institution === 'Add your institution') {
        missingFields.push(`education[${index}].institution`);
      }
      if (!edu.degree || edu.degree === 'Add your degree') {
        missingFields.push(`education[${index}].degree`);
      }
      if (!edu.fieldOfStudy || edu.fieldOfStudy === 'Add your field of study') {
        missingFields.push(`education[${index}].fieldOfStudy`);
      }
      if (!edu.startYear) missingFields.push(`education[${index}].startYear`);
      if (!edu.endYear) missingFields.push(`education[${index}].endYear`);
    });
  }
  
  return missingFields;
}

// Get user profile by name (for public author modal)
exports.getProfileByName = async (req, res, next) => {
  try {
    const authorName = req.params.authorName;
    // Case-insensitive search for author name
    const user = await User.findOne({ name: new RegExp('^' + authorName + '$', 'i') })
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken -loginAttempts -lockUntil');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Get user profile by userId (for public author modal, robust)
exports.getProfileById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken -loginAttempts -lockUntil');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Get user's favorite projects (IDs)
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const user = await User.findById(userId).select('favorites');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

// Add a project to favorites
exports.addFavorite = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const projectId = req.params.projectId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    if (!user.favorites.map(fav => fav.toString()).includes(projectId)) {
      user.favorites.push(projectId);
      await user.save();
    }
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

// Remove a project from favorites
exports.removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const projectId = req.params.projectId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    user.favorites = user.favorites.filter(favId => favId.toString() !== projectId);
    await user.save();
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};