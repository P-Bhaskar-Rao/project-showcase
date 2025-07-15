const mongoose = require('mongoose');

const engagementSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  type: { type: String, enum: ['internship', 'part-time', 'full-time', 'contract'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Engagement', engagementSchema); 