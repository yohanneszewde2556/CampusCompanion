const LostAndFound = require('../models/LostAndFound');
const { generateEmbedding, calculateSimilarity } = require('../services/aiService');

// @desc    Report a new lost or found item
// @route   POST /api/lost-found
// @access  Private
const reportItem = async (req, res) => {
  try {
    const { type, title, description, locationDescription, coordinates, images } = req.body;

    const embedding = await generateEmbedding(`${title} ${description} ${locationDescription}`);

    const item = await LostAndFound.create({
      reporterId: req.user._id,
      type,
      title,
      description,
      locationDescription,
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0]
      },
      images,
      textEmbedding: embedding
    });

    const oppositeType = type === 'lost' ? 'found' : 'lost';
    const potentialMatches = await LostAndFound.find({ type: oppositeType, status: 'active' });

    let matchCount = 0;
    for (let match of potentialMatches) {
      if (match.textEmbedding && match.textEmbedding.length > 0) {
        const score = calculateSimilarity(embedding, match.textEmbedding);
        if (score > 0.8) {
          matchCount++;
          item.matchedItems.push({ itemId: match._id, confidenceScore: score });
        }
      }
    }
    
    if (matchCount > 0) {
      await item.save();
    }

    res.status(201).json(item);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items
// @route   GET /api/lost-found
// @access  Public
const getItems = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const items = await LostAndFound.find(filter).select('-textEmbedding').populate('reporterId', 'firstName lastName').sort({ createdAt: -1 });
    
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  reportItem,
  getItems
};
