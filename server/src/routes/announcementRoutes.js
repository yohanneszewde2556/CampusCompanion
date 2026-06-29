const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, announcementController.getAnnouncements)
  // Only admins or moderators can post university wide announcements
  .post(protect, restrictTo('admin', 'moderator'), announcementController.createAnnouncement);

router.route('/:id')
  .delete(protect, restrictTo('admin', 'moderator'), announcementController.deleteAnnouncement);

module.exports = router;
