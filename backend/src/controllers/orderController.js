const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');


const placeOrder = async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;

  try {
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      const error = new Error('Please provide complete shipping address details');
      error.statusCode = 400;
      return next(error);
    }

    // Fetch user's cart and populate product details
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      const error = new Error('Your cart is empty');
      error.statusCode = 400;
      return next(error);
    }

    // Verify stock levels for all items in the cart
    for (const item of cart.items) {
      if (!item.product) {
        const error = new Error('One of the products in your cart is no longer available');
        error.statusCode = 404;
        return next(error);
      }
      if (item.product.quantity < item.quantity) {
        const error = new Error(`Insufficient stock for product: ${item.product.name}. Available: ${item.product.quantity}`);
        error.statusCode = 400;
        return next(error);
      }
    }

    // Create snapshots of items for the order
    const orderItems = cart.items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images && item.product.images.length > 0 ? item.product.images[0].url : '',
      product: item.product._id
    }));

    // Calculate prices
    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2)); // 15% tax rate
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create the Order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    // Decrement product inventory quantities
    for (const item of cart.items) {
      const product = item.product;
      product.quantity -= item.quantity;
      await product.save();
    }

    // Clear user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};


const getOrders = async (req, res, next) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      // Admin sees all orders
      orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    } else {
      // Customer sees only their own orders
      orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};


const getOrderDetails = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid order ID');
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    // Authorization check
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      const error = new Error('Not authorized to view this order');
      error.statusCode = 403;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid order ID');
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findById(id);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    // Authorization check
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      const error = new Error('Not authorized to cancel this order');
      error.statusCode = 403;
      return next(error);
    }

    // Verify cancellation is possible
    if (order.status !== 'Pending' && order.status !== 'Processing') {
      const error = new Error(`Cannot cancel order after it has been ${order.status.toLowerCase()}`);
      error.statusCode = 400;
      return next(error);
    }

    // Set status to Cancelled
    order.status = 'Cancelled';
    await order.save();

    // Restore product stock level quantities
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};


const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  try {
    if (!status || !validStatuses.includes(status)) {
      const error = new Error(`Please provide a valid status: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      return next(error);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid order ID');
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findById(id);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    // Block status updates if order is already delivered or cancelled
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      const error = new Error(`Cannot change status of a ${order.status.toLowerCase()} order`);
      error.statusCode = 400;
      return next(error);
    }

    const oldStatus = order.status;
    order.status = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    // If admin cancels the order, restore stock
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  updateOrderStatus
};
