// routes/project.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Adjusted path


router.get('/', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: `Welcome to the protected projects area, ${req.user.name}!`,
    userId: req.user._id,
    userEmail: req.user.email,
    projects: [
      { id: 'proj1', name: 'My First Project', owner: req.user.name },
      { id: 'proj2', name: 'Another Project', owner: req.user.name }
    ]
  });
});



module.exports = router;
