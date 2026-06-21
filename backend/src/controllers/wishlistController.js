const mongoose = require('mongoose');
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');


const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'products',
      'name price images slug quantity'
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      const error = new Error('Product ID is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const isAlreadyAdded = wishlist.products.includes(productId);

    if (!isAlreadyAdded) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    // Populate product details for response
    await wishlist.populate('products', 'name price images slug quantity');

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};


const removeFromWishlist = async (req, res, next) => {
  const { productId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      return next(error);
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      const error = new Error('Wishlist not found');
      error.statusCode = 404;
      return next(error);
    }

    const itemExists = wishlist.products.includes(productId);

    if (!itemExists) {
      const error = new Error('Product not found in wishlist');
      error.statusCode = 404;
      return next(error);
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    // Populate product details for response
    await wishlist.populate('products', 'name price images slug quantity');

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist successfully',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
