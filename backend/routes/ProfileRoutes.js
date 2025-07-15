const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileController');
const EngagementController = require('../controllers/EngagementController');
const { validateBody, profileUpdateSchema } = require('../utils/zodSchemas');
const authMiddleware = require('../middleware/auth');

// Profile Management Routes (require accessToken)
router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, validateBody(profileUpdateSchema), profileController.updateProfile);
router.get('/completeness', authMiddleware, profileController.checkProfileCompleteness);

// Get public profile by userId (robust)
router.get('/id/:userId', profileController.getProfileById);

// Engagement routes
router.post('/engagement', authMiddleware, EngagementController.createEngagement);
router.get('/engagements/mine', authMiddleware, EngagementController.getUsersIEngagedWith);
router.get('/engagements/with-me', authMiddleware, EngagementController.getUsersWhoEngagedWithMe);
router.get('/dashboard-stats', authMiddleware, EngagementController.getDashboardStats);
router.get('/project/:projectId/engagement-counts', EngagementController.getProjectEngagementCounts);

// Favorites management
router.get('/favorites', authMiddleware, profileController.getFavorites);
router.post('/favorites/:projectId', authMiddleware, profileController.addFavorite);
router.delete('/favorites/:projectId', authMiddleware, profileController.removeFavorite);

// Get public profile by author name
router.get('/:authorName', profileController.getProfileByName);

module.exports = router; 