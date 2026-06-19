const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { uploadImages } = require('../controllers/uploadController');

router.post('/', protect, upload.array('images', 5), uploadImages);

module.exports = router;
