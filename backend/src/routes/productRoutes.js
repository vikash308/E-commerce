const express = require('express');
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductDetails,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:idOrSlug', getProductDetails);

// Protected routes (Admin and Seller access)
router.post('/', protect, authorize('admin', 'seller'), upload.array('images', 5), addProduct);
router.put('/:id', protect, authorize('admin', 'seller'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin', 'seller'), deleteProduct);

module.exports = router;
