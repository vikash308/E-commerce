const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper to run validations and return formatted errors
const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Authentication Validations
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['customer', 'seller', 'admin']).withMessage('Role must be customer, seller, or admin'),
  validateResult
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validateResult
];

const validateUpdateProfile = [
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validateResult
];

// Product Validations
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Product description is required'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .notEmpty().withMessage('Category ID is required')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid Category ID format'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),
  validateResult
];

// Category Validations
const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
  validateResult
];

// Cart Validations
const validateCart = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid Product ID format'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validateResult
];

// Order Validations
const validateOrder = [
  body('shippingAddress.address')
    .trim()
    .notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty().withMessage('Shipping postal code is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty().withMessage('Shipping country is required'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['COD', 'Card', 'UPI']).withMessage('Payment method must be COD, Card, or UPI'),
  validateResult
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateProduct,
  validateCategory,
  validateCart,
  validateOrder,
};
