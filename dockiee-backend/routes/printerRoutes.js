const express = require('express');
const printerController = require('../controllers/printerController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('printer', 'admin'));

router.patch('/toggle-status', printerController.toggleStatus);
router.get('/dashboard', printerController.getDashboard);
router.patch('/orders/:orderId/status', printerController.updateOrderStatus);

module.exports = router;
