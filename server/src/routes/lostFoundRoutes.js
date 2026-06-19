const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const {
  reportItem,
  getItems,
  getMyItems,
  getItemById,
  resolveItem,
  submitClaim,
  getClaims,
  reviewClaim,
  getCategories,
} = require('../controllers/lostFoundController');

router.get('/categories', getCategories);
router.get('/my-items', protect, getMyItems);
router.get('/claims', protect, restrictTo('moderator', 'admin'), getClaims);
router.put('/claims/:claimId', protect, restrictTo('moderator', 'admin'), reviewClaim);

router.route('/')
  .post(protect, reportItem)
  .get(getItems);

router.post('/:id/claim', protect, submitClaim);
router.put('/:id/resolve', protect, resolveItem);
router.get('/:id', getItemById);

module.exports = router;
