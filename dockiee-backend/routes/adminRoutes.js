const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Project all routes
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/analytics', adminController.getAnalytics);
router.patch('/users/:userId/suspend', adminController.suspendUser);
router.post('/disputes/:disputeId/resolve', adminController.resolveDispute);

module.exports = router;
