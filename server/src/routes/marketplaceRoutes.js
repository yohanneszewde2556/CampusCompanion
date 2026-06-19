const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
// Assume protect middleware imports here in a scalable app. 
// For now, since Phase 1 auth is custom built locally by user previously, we use a mock protect layer if user hasn't supplied one, or we inject a standard mock structure. 
// In previous steps, auth logic was assumed functional. I will provide standard endpoints unblocked strictly by local router middleware to allow the user's frontend to work out of box, while passing a fake user if missing during dev.

// Dev middleware to inject fake user if no auth middleware runs globally yet.
const devProtectMock = (req, res, next) => {
  if(!req.user) {
    req.user = { _id: "666666666666666666666666" }; // dummy object ID
  }
  next();
};

router.route('/')
  .post(devProtectMock, marketplaceController.createItem)
  .get(marketplaceController.getItems);

router.route('/:id')
  .get(marketplaceController.getItemById)
  .delete(devProtectMock, marketplaceController.deleteItem);

router.put('/:id/status', devProtectMock, marketplaceController.updateItemStatus);

module.exports = router;
