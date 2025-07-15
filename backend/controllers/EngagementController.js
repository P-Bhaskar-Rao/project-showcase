const Engagement = require('../models/Engagement');
const Project = require('../models/Project');
const User = require('../models/User');

// Create a new engagement
exports.createEngagement = async (req, res) => {
  try {
    const { toUser, project, type } = req.body;
    const fromUser = req.user._id;

    if (fromUser.toString() === toUser) {
      return res.status(400).json({ success: false, message: 'You cannot engage with yourself.' });
    }

    // Check project exists and belongs to toUser
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    if (proj.authorId.toString() !== toUser) {
      return res.status(400).json({ success: false, message: 'Project does not belong to the target user.' });
    }

    // Prevent duplicate engagement
    const existing = await Engagement.findOne({ fromUser, toUser, project });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already engaged with this user for this project.' });
    }

    const engagement = new Engagement({ fromUser, toUser, project, type });
    await engagement.save();
    res.status(201).json({ success: true, engagement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get users I engaged with (and for which project)
exports.getUsersIEngagedWith = async (req, res) => {
  try {
    const fromUser = req.user._id;
    const engagements = await Engagement.find({ fromUser })
      .populate('toUser', 'name email avatar')
      .populate('project', 'name');
    res.json({ success: true, engagements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get users who engaged with me (and for which project)
exports.getUsersWhoEngagedWithMe = async (req, res) => {
  try {
    const toUser = req.user._id;
    const engagements = await Engagement.find({ toUser })
      .populate('fromUser', 'name email avatar')
      .populate('project', 'name');
    res.json({ success: true, engagements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get dashboard stats for the current user
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('[getDashboardStats] Called for user:', req.user && req.user._id);
    const userId = req.user._id;
    const myProjectsCount = await Project.countDocuments({ authorId: userId });
    const engagedWithCount = await Engagement.countDocuments({ fromUser: userId });
    const engagedByCount = await Engagement.countDocuments({ toUser: userId });
    res.json({
      success: true,
      stats: {
        myProjectsCount,
        engagedWithCount,
        engagedByCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get engagement counts for a specific project
exports.getProjectEngagementCounts = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Count engagements by type for this project
    const engagementCounts = {};
    const types = ['internship', 'part-time', 'full-time', 'contract'];
    
    for (const type of types) {
      const count = await Engagement.countDocuments({ project: projectId, type });
      if (count > 0) {
        engagementCounts[type] = count;
      }
    }
    
    const total = await Engagement.countDocuments({ project: projectId });
    
    res.json({
      success: true,
      engagements: engagementCounts,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}; 