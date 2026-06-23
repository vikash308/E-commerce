const express = require('express');
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductDetails,
  createProductReview,
  updateProductReview,
  deleteProductReview,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { validateProduct } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:idOrSlug', getProductDetails);

// Protected routes (Customer, Admin, and Seller access)
router.post('/:id/reviews', protect, createProductReview);
router.put('/:id/reviews', protect, updateProductReview);
router.delete('/:id/reviews', protect, deleteProductReview);

// Protected routes (Admin and Seller access)
router.post('/', protect, authorize('admin', 'seller'), upload.array('images', 5), validateProduct, addProduct);
router.put('/:id', protect, authorize('admin', 'seller'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin', 'seller'), deleteProduct);

module.exports = router;
