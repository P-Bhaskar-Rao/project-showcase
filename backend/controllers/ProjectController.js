const Project = require('../models/Project');

// Get all projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

// Create a new project
exports.createProject = async (req, res, next) => {
  try {
    // You can add more robust validation here if needed
    const {
      name,
      description,
      author,
      authorId,
      category,
      githubUrl,
      liveUrl,
      projectType,
      companyName,
      internshipStartDate,
      internshipEndDate,
      projectStartDate,
      projectEndDate,
      internshipPeriod,
      architectureDiagram,
      techStack,
      image
    } = req.body;

    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!description) missingFields.push('description');
    if (!author) missingFields.push('author');
    if (!authorId) missingFields.push('authorId');
    if (!category) missingFields.push('category');
    if (!githubUrl) missingFields.push('githubUrl');
    if (!techStack || !Array.isArray(techStack) || techStack.length === 0) missingFields.push('techStack');
    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields.', missingFields });
    }

    const newProject = new Project({
      name,
      description,
      author,
      authorId,
      category,
      githubUrl,
      liveUrl,
      projectType,
      companyName,
      internshipStartDate,
      internshipEndDate,
      projectStartDate,
      projectEndDate,
      internshipPeriod,
      architectureDiagram,
      techStack,
      image
    });

    await newProject.save();
    res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    next(error);
  }
};

// Update a project by ID
exports.updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user && (req.user._id || req.user.id);
    const updateFields = req.body;

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    // Check ownership
    if (String(project.authorId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this project.' });
    }
    // Update fields
    Object.keys(updateFields).forEach((key) => {
      if (key !== 'authorId' && key !== '_id' && key !== 'createdAt') {
        project[key] = updateFields[key];
      }
    });
    await project.save();
    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// Delete a project by ID
exports.deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user && (req.user._id || req.user.id);
    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    // Check ownership
    if (String(project.authorId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this project.' });
    }
    await project.deleteOne();
    res.status(200).json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    next(error);
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};