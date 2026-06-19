const express = require('express');
const router = express.Router();
const studyGroupController = require('../controllers/studyGroupController');

// Dev middleware to inject mock user if authorization header missing
const devProtectMock = (req, res, next) => {
  if(!req.user) {
    req.user = { _id: "666666666666666666666666", firstName: "Dev", lastName: "Mock" }; // dummy object properties for UI rendering
  }
  next();
};

router.route('/')
  .post(devProtectMock, studyGroupController.createGroup)
  .get(studyGroupController.getGroups);

router.route('/:id')
  .get(studyGroupController.getGroupById);

router.post('/:id/join', devProtectMock, studyGroupController.joinGroup);
router.post('/:id/leave', devProtectMock, studyGroupController.leaveGroup);
router.post('/:id/messages', devProtectMock, studyGroupController.postMessage);

module.exports = router;
