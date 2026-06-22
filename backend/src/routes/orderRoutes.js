const express = require('express');
const {
  placeOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin, authorize } = require('../middlewares/authMiddleware');
const { validateOrder } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Apply protect middleware to all order routes
router.use(protect);

router.route('/')
  .post(validateOrder, placeOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrderDetails);

router.route('/:id/cancel')
  .put(cancelOrder);

router.route('/:id/status')
  .put(authorize('admin', 'seller'), updateOrderStatus);

module.exports = router;
