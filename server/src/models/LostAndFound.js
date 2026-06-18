const mongoose = require('mongoose');

const lostAndFoundSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found']
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'matched', 'resolved']
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  locationDescription: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  images: [String],
  textEmbedding: [Number],
  matchedItems: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostAndFound'
    },
    confidenceScore: Number
  }]
}, { timestamps: true });

// Geo and text indexing
lostAndFoundSchema.index({ location: '2dsphere' });
lostAndFoundSchema.index({ title: 'text', description: 'text' });
lostAndFoundSchema.index({ type: 1, status: 1 });

const LostAndFound = mongoose.model('LostAndFound', lostAndFoundSchema);
module.exports = LostAndFound;
