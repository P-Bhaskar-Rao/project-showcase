// routes/project.routes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/ProjectController');
const authMiddleware = require('../middleware/auth');

// Get all projects
router.get('/', projectController.getAllProjects);
// Create a new project (auth required)
router.post('/', authMiddleware, projectController.createProject);
// Update a project by ID (auth required)
router.patch('/:id', authMiddleware, projectController.updateProject);
// Delete a project by ID (auth required)
router.delete('/:id', authMiddleware, projectController.deleteProject);
// Get projects for the logged-in user
router.get('/my-projects', authMiddleware, projectController.getUserProjects);
// Get a single project by ID
router.get('/:id', projectController.getProjectById);
// Toggle like for a project (auth required)
router.post('/:id/like', authMiddleware, projectController.toggleLike);
// Engage with a project (auth required)
router.post('/:id/engage', authMiddleware, projectController.engageProject);
// Get engage counts/types for a project
router.get('/:id/engages', projectController.getEngages);

module.exports = router;
