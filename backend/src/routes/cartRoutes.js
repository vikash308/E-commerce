const express = require('express');
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply protect middleware to all cart routes
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .put(updateQuantity);

router.route('/:productId')
  .delete(removeFromCart);

module.exports = router;
