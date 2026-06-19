const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { registerUser, loginUser, logoutUser, refreshToken, getCurrentUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.get('/me', protect, getCurrentUser);

module.exports = router;
