const Announcement = require('../models/Announcement');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, category, priorityLevel } = req.body;
    
    // Auth middleware secures this, enforcing user role
    const announcement = await Announcement.create({
      title,
      body,
      category,
      priorityLevel,
      authorId: req.user._id
    });

    // Populate data for immediate return reflection
    await announcement.populate('authorId', 'firstName lastName role avatar');

    res.status(201).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create announcement' });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { category, priority } = req.query;
    let query = {};
    
    if (category && category !== 'all') query.category = category;
    if (priority) query.priorityLevel = priority;

    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .populate('authorId', 'firstName lastName role avatar')
      .limit(50);

    res.status(200).json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    // Ensure only admins/moderators can delete (enforced by route middleware, double checking here)
    if (!['admin', 'moderator'].includes(req.user.role)) {
       return res.status(403).json({ message: 'Not authorized to delete' });
    }

    await announcement.deleteOne();
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
};
