const mongoose = require('mongoose');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');


const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name price images slug quantity'
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};


const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

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

    if (qty < 1) {
      const error = new Error('Quantity must be at least 1');
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    if (product.quantity <= 0) {
      const error = new Error('Product is out of stock');
      error.statusCode = 400;
      return next(error);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product already in cart, increment quantity
      const newQty = cart.items[itemIndex].quantity + qty;
      if (newQty > product.quantity) {
        const error = new Error(`Cannot add more than available stock (${product.quantity})`);
        error.statusCode = 400;
        return next(error);
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      // Product not in cart, add new item
      if (qty > product.quantity) {
        const error = new Error(`Cannot add more than available stock (${product.quantity})`);
        error.statusCode = 400;
        return next(error);
      }
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price images slug quantity');

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};


const updateQuantity = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity);

  try {
    if (!productId || quantity === undefined) {
      const error = new Error('Product ID and quantity are required');
      error.statusCode = 400;
      return next(error);
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      return next(error);
    }

    if (qty < 1) {
      const error = new Error('Quantity must be at least 1');
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    if (qty > product.quantity) {
      const error = new Error(`Cannot set quantity more than available stock (${product.quantity})`);
      error.statusCode = 400;
      return next(error);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      return next(error);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      const error = new Error('Product not found in cart');
      error.statusCode = 404;
      return next(error);
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price images slug quantity');

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};


const removeFromCart = async (req, res, next) => {
  const { productId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      return next(error);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      return next(error);
    }

    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      const error = new Error('Product not found in cart');
      error.statusCode = 404;
      return next(error);
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price images slug quantity');

    res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
};
