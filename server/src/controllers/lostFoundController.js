const LostAndFound = require('../models/LostAndFound');
const Claim = require('../models/Claim');
const { generateEmbedding, getMatchScore, MATCH_THRESHOLD } = require('../services/aiService');

const buildItemText = (item) =>
  `${item.title} ${item.description} ${item.locationDescription} ${item.category || ''}`;

const populateItem = (query) =>
  query
    .select('-textEmbedding')
    .populate('reporterId', 'firstName lastName email')
    .populate({
      path: 'matchedItems.itemId',
      select: '-textEmbedding',
      populate: { path: 'reporterId', select: 'firstName lastName' },
    });

const notifyMatch = (io, userId, payload) => {
  if (io && userId) {
    io.to(userId.toString()).emit('lostFound:match', payload);
  }
};

const runMatching = async (item, io) => {
  const itemText = buildItemText(item);
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';
  const potentialMatches = await LostAndFound.find({ type: oppositeType, status: 'active' });

  const matches = [];

  for (const match of potentialMatches) {
    const matchText = buildItemText(match);
    const score = getMatchScore(itemText, matchText, item.textEmbedding, match.textEmbedding);

    if (score >= MATCH_THRESHOLD) {
      matches.push({ item: match, score });
    }
  }

  if (matches.length === 0) return [];

  item.status = 'matched';
  for (const { item: match, score } of matches) {
    item.matchedItems.push({ itemId: match._id, confidenceScore: score });

    const alreadyLinked = match.matchedItems.some((m) => m.itemId?.equals(item._id));
    if (!alreadyLinked) {
      match.matchedItems.push({ itemId: item._id, confidenceScore: score });
      if (match.status === 'active') match.status = 'matched';
      await match.save();

      notifyMatch(io, match.reporterId, {
        itemId: item._id,
        title: item.title,
        type: item.type,
        confidenceScore: score,
        message: `Potential match found for your ${match.type} item "${match.title}"`,
      });
    }
  }

  await item.save();

  notifyMatch(io, item.reporterId, {
    itemId: item._id,
    title: item.title,
    type: item.type,
    matchCount: matches.length,
    message: `We found ${matches.length} potential match(es) for "${item.title}"`,
  });

  return matches;
};

// @desc    Report a new lost or found item
// @route   POST /api/lost-found
// @access  Private
const reportItem = async (req, res) => {
  try {
    const { type, category, title, description, locationDescription, coordinates, images } = req.body;

    const textForEmbedding = `${title} ${description} ${locationDescription} ${category}`;
    const embedding = await generateEmbedding(textForEmbedding);

    const item = await LostAndFound.create({
      reporterId: req.user._id,
      type,
      category,
      title,
      description,
      locationDescription,
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0],
      },
      images: images || [],
      textEmbedding: embedding || undefined,
    });

    const io = req.app.get('io');
    await runMatching(item, io);

    const populated = await populateItem(LostAndFound.findById(item._id));
    res.status(201).json(await populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items
// @route   GET /api/lost-found
// @access  Public
const getItems = async (req, res) => {
  try {
    const { type, status, category } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const items = await populateItem(
      LostAndFound.find(filter).sort({ createdAt: -1 })
    );

    res.status(200).json(await items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's reported items
// @route   GET /api/lost-found/my-items
// @access  Private
const getMyItems = async (req, res) => {
  try {
    const { type, status, category } = req.query;
    const filter = { reporterId: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const items = await populateItem(
      LostAndFound.find(filter).sort({ createdAt: -1 })
    );
    res.status(200).json(await items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single item
// @route   GET /api/lost-found/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await populateItem(LostAndFound.findById(req.params.id));

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const claims = await Claim.find({ itemId: item._id })
      .populate('claimerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ item: await item, claims });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark item as resolved
// @route   PUT /api/lost-found/:id/resolve
// @access  Private
const resolveItem = async (req, res) => {
  try {
    const item = await LostAndFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const isOwner = item.reporterId.equals(req.user._id);
    const isModerator = ['moderator', 'admin'].includes(req.user.role);

    if (!isOwner && !isModerator) {
      return res.status(403).json({ message: 'Not authorized to resolve this item' });
    }

    item.status = 'resolved';
    await item.save();

    const populated = await populateItem(LostAndFound.findById(item._id));
    res.status(200).json(await populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a claim for an item
// @route   POST /api/lost-found/:id/claim
// @access  Private
const submitClaim = async (req, res) => {
  try {
    const { message } = req.body;
    const item = await LostAndFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status === 'resolved') {
      return res.status(400).json({ message: 'This item has already been resolved' });
    }

    if (item.reporterId.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot claim your own item' });
    }

    const existingClaim = await Claim.findOne({
      itemId: item._id,
      claimerId: req.user._id,
      status: 'pending',
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You already have a pending claim for this item' });
    }

    const claim = await Claim.create({
      itemId: item._id,
      claimerId: req.user._id,
      message,
    });

    const populated = await Claim.findById(claim._id)
      .populate('claimerId', 'firstName lastName email');

    const io = req.app.get('io');
    notifyMatch(io, item.reporterId, {
      type: 'claim',
      itemId: item._id,
      title: item.title,
      message: `Someone submitted a claim for "${item.title}"`,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending claims (moderator)
// @route   GET /api/lost-found/claims
// @access  Private (moderator/admin)
const getClaims = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const claims = await Claim.find(filter)
      .populate('claimerId', 'firstName lastName email')
      .populate({
        path: 'itemId',
        select: 'title type status category',
        populate: { path: 'reporterId', select: 'firstName lastName' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Review a claim (moderator)
// @route   PUT /api/lost-found/claims/:claimId
// @access  Private (moderator/admin)
const reviewClaim = async (req, res) => {
  try {
    const { status, verificationNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const claim = await Claim.findById(req.params.claimId);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({ message: 'Claim has already been reviewed' });
    }

    claim.status = status;
    claim.verificationNotes = verificationNotes;
    claim.reviewedBy = req.user._id;
    await claim.save();

    const item = await LostAndFound.findById(claim.itemId);
    const io = req.app.get('io');

    if (status === 'approved' && item) {
      item.status = 'resolved';
      await item.save();
    }

    notifyMatch(io, claim.claimerId, {
      type: 'claim_review',
      itemId: claim.itemId,
      status,
      message:
        status === 'approved'
          ? 'Your claim was approved! Contact the reporter to arrange pickup.'
          : 'Your claim was not approved.',
    });

    const populated = await Claim.findById(claim._id)
      .populate('claimerId', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName');

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get item categories
// @route   GET /api/lost-found/categories
// @access  Public
const getCategories = (_req, res) => {
  const { ITEM_CATEGORIES } = require('../constants/categories');
  res.status(200).json(ITEM_CATEGORIES);
};

module.exports = {
  reportItem,
  getItems,
  getMyItems,
  getItemById,
  resolveItem,
  submitClaim,
  getClaims,
  reviewClaim,
  getCategories,
};
