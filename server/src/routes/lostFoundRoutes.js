const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { reportItem, getItems } = require('../controllers/lostFoundController');

router.route('/')
  .post(protect, reportItem)
  .get(getItems);

module.exports = router;
