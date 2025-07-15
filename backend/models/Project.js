const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true, trim: true },
  githubUrl: { type: String, required: true, trim: true },
  repoVisibility: { type: String, enum: ['public', 'private'], default: 'public', required: true },
  liveUrl: { type: String, trim: true },
  projectType: { type: String, enum: ['personal', 'internship'], default: 'personal' },
  companyName: { type: String, trim: true },
  internshipStartDate: { type: String, trim: true },
  internshipEndDate: { type: String, trim: true },
  projectStartDate: { type: String, trim: true },
  projectEndDate: { type: String, trim: true },
  internshipPeriod: { type: String, trim: true },
  architectureDiagram: { type: String, trim: true },
  techStack: { type: [String], required: true },
  image: { type: String, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  engages: [{
    type: { type: String, enum: ['internship', 'part-time', 'full-time', 'contract'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
