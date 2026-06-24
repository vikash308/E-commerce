const express = require('express');
const {
  placeOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  updateOrderStatus,
  payOrder,
  createStripeSession,
  confirmStripePayment,
  createRazorpayOrder,
  confirmRazorpayPayment,
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

router.route('/:id/pay')
  .put(payOrder);

router.route('/:id/stripe-session')
  .post(createStripeSession);

router.route('/:id/stripe-confirm')
  .post(confirmStripePayment);

router.route('/:id/razorpay-order')
  .post(createRazorpayOrder);

router.route('/:id/razorpay-confirm')
  .post(confirmRazorpayPayment);

router.route('/:id/cancel')
  .put(cancelOrder);

router.route('/:id/status')
  .put(authorize('admin', 'seller'), updateOrderStatus);

module.exports = router;
