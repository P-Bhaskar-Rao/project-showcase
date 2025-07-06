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

module.exports = router;
