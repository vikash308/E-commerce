const express = require('express');
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route to get all categories
router.get('/', getCategories);

// Admin-only routes
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
