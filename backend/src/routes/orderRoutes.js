const express = require('express');
const {
  placeOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply protect middleware to all order routes
router.use(protect);

router.route('/')
  .post(placeOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrderDetails);

router.route('/:id/cancel')
  .put(cancelOrder);

router.route('/:id/status')
  .put(admin, updateOrderStatus);

module.exports = router;
