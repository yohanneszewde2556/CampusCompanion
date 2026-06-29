const express = require('express');
const router = express.Router();
const studyGroupController = require('../controllers/studyGroupController');

const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, studyGroupController.createGroup)
  .get(studyGroupController.getGroups);

router.route('/:id')
  .get(studyGroupController.getGroupById);

router.post('/:id/join', protect, studyGroupController.joinGroup);
router.post('/:id/leave', protect, studyGroupController.leaveGroup);
router.post('/:id/messages', protect, studyGroupController.postMessage);

module.exports = router;
