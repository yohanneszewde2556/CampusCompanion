const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['university', 'department', 'event', 'emergency', 'general'],
    default: 'university'
  },
  priorityLevel: {
    type: String,
    enum: ['normal', 'high', 'critical'],
    default: 'normal'
  }
}, { timestamps: true });

// Index for fast sorting by newest or fetching by category/priority
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ priorityLevel: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;
