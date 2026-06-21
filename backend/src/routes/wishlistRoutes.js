const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply protect middleware to all wishlist routes
router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.route('/:productId')
  .delete(removeFromWishlist);

module.exports = router;
