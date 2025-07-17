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
      image,
      repoVisibility
    } = req.body;

    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!description) missingFields.push('description');
    if (!author) missingFields.push('author');
    if (!authorId) missingFields.push('authorId');
    if (!category) missingFields.push('category');
    if (!githubUrl) missingFields.push('githubUrl');
    if (!repoVisibility) missingFields.push('repoVisibility');
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
      image,
      repoVisibility
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
    // Ensure likes is always an array
    const projectObj = project.toObject();
    if (!Array.isArray(projectObj.likes)) projectObj.likes = [];
    res.status(200).json({ success: true, project: projectObj });
  } catch (error) {
    next(error);
  }
};

// Toggle like for a project
exports.toggleLike = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    const liked = project.likes.some(id => id.toString() === userId.toString());
    if (liked) {
      project.likes = project.likes.filter(id => id.toString() !== userId.toString());
    } else {
      project.likes.push(userId);
    }
    await project.save();
    res.status(200).json({ success: true, likes: project.likes.length, liked: !liked });
  } catch (error) {
    next(error);
  }
};

// Engage with a project
exports.engageProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user && (req.user._id || req.user.id);
    const { engageType } = req.body;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (!['internship', 'part-time', 'full-time', 'contract'].includes(engageType)) {
      return res.status(400).json({ success: false, error: 'Invalid engage type.' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    // Prevent duplicate engage for the same type by the same user
    const alreadyEngaged = project.engages.some(e => e.userId.toString() === userId.toString() && e.type === engageType);
    if (alreadyEngaged) {
      return res.status(400).json({ success: false, error: 'Already engaged for this type.' });
    }
    project.engages.push({ type: engageType, userId });
    await project.save();
    res.status(200).json({ success: true, engages: project.engages });
  } catch (error) {
    next(error);
  }
};

// Get engage counts/types for a project
exports.getEngages = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    // Count engages by type
    const engageCounts = {};
    for (const engage of project.engages) {
      engageCounts[engage.type] = (engageCounts[engage.type] || 0) + 1;
    }
    res.status(200).json({ success: true, engages: engageCounts, total: project.engages.length });
  } catch (error) {
    next(error);
  }
};

// Get projects for the logged-in user
exports.getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const total = await Project.countDocuments({ authorId: userId });
    const totalPages = Math.ceil(total / limit);
    const projects = await Project.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.status(200).json({ success: true, projects, total, page, totalPages });
  } catch (error) {
    next(error);
  }
};