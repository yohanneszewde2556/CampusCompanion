const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['books', 'electronics', 'furniture', 'clothing', 'other']
  },
  status: {
    type: String,
    default: 'available',
    enum: ['available', 'reserved', 'sold']
  },
  images: [{
    type: String // URLs uploaded potentially by Cloudinary mapped route
  }],
}, { timestamps: true });

// Optimize indexing for common feed queries and textual search
marketplaceItemSchema.index({ category: 1, status: 1 });
marketplaceItemSchema.index({ title: 'text', description: 'text' });

const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceItemSchema);
module.exports = MarketplaceItem;
