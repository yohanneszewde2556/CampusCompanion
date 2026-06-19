const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'LostAndFound',
  },
  claimerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  verificationNotes: {
    type: String,
    maxlength: 500,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

claimSchema.index({ itemId: 1, claimerId: 1 });
claimSchema.index({ status: 1 });

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;
