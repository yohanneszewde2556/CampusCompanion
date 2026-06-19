const MarketplaceItem = require('../models/MarketplaceItem');

exports.createItem = async (req, res) => {
  try {
    const { title, description, price, category, images } = req.body;
    // Assume req.user is set via auth middleware
    const item = await MarketplaceItem.create({
      sellerId: req.user._id,
      title,
      description,
      price,
      category,
      images,
      status: 'available'
    });
    // Populate seller info so frontend can display
    await item.populate('sellerId', 'firstName lastName avatar email');
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create marketplace item' });
  }
};

exports.getItems = async (req, res) => {
  try {
    const { category, search, sort = '-createdAt', status = 'available' } = req.query;
    
    let query = { status };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const items = await MarketplaceItem.find(query)
      .sort(sort)
      .populate('sellerId', 'firstName lastName avatar')
      .limit(50); // Hard limit for optimization, can paginate later
      
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id)
      .populate('sellerId', 'firstName lastName avatar email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch item' });
  }
};

exports.updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const item = await MarketplaceItem.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user._id }, // only seller can update
      { status },
      { new: true }
    ).populate('sellerId', 'firstName lastName avatar email');

    if (!item) return res.status(404).json({ message: 'Item not found or unauthorized' });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update item status' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findOneAndDelete({ _id: req.params.id, sellerId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Item not found or unauthorized' });
    res.status(200).json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
};
