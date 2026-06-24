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

    // Set status to Processing (confirmed) for COD, otherwise Pending
    const orderStatus = (paymentMethod === 'COD') ? 'Processing' : 'Pending';

    // Create the Order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: orderStatus
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
    } else if (req.user.role === 'seller') {
      // Seller sees orders containing their own products
      const myProducts = await Product.find({ user: req.user._id }).distinct('_id');
      orders = await Order.find({ 'orderItems.product': { $in: myProducts } })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
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
    let isSellerOwner = false;
    if (req.user.role === 'seller') {
      const myProducts = await Product.find({ user: req.user._id }).distinct('_id');
      const myProductIds = myProducts.map(p => p.toString());
      isSellerOwner = order.orderItems.some(item => myProductIds.includes(item.product.toString()));
    }

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString() && !isSellerOwner) {
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

    // Authorization check
    let isSellerOwner = false;
    if (req.user.role === 'seller') {
      const myProducts = await Product.find({ user: req.user._id }).distinct('_id');
      const myProductIds = myProducts.map(p => p.toString());
      isSellerOwner = order.orderItems.some(item => myProductIds.includes(item.product.toString()));
    }

    if (req.user.role !== 'admin' && !isSellerOwner) {
      const error = new Error('Not authorized to update status of this order');
      error.statusCode = 403;
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

// PUT /api/orders/:id/pay
const payOrder = async (req, res, next) => {
  const { id } = req.params;
  const { paymentDetails, paymentMethod } = req.body;

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

    // Ensure only the user who placed the order (or an admin) can pay
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      const error = new Error('Not authorized to pay for this order');
      error.statusCode = 403;
      return next(error);
    }

    if (order.isPaid) {
      const error = new Error('Order is already paid');
      error.statusCode = 400;
      return next(error);
    }

    if (paymentMethod === 'COD') {
      order.paymentMethod = 'COD';
      order.status = 'Processing';
      order.isPaid = false;
    } else {
      // Update order payment status
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';
      if (paymentMethod) {
        order.paymentMethod = paymentMethod;
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: paymentMethod === 'COD' ? 'COD Order confirmed successfully' : 'Order paid successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Dynamic Stripe Instance Getter
const getStripeInstance = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  try {
    return require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    return null;
  }
};

// POST /api/orders/:id/stripe-session
const createStripeSession = async (req, res, next) => {
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

    const stripeInstance = getStripeInstance();
    if (!stripeInstance) {
      return res.status(200).json({
        success: false,
        isMock: true,
        message: 'Stripe secret key not configured. Please use Card Simulator.'
      });
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: order.orderItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name
          },
          unit_amount: Math.round(item.price * 100) // cents
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/${order._id}`,
      metadata: { orderId: order._id.toString() }
    });

    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/:id/stripe-confirm
const confirmStripePayment = async (req, res, next) => {
  const { id } = req.params;
  const { sessionId } = req.body;

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

    const stripeInstance = getStripeInstance();
    if (!stripeInstance || !sessionId) {
      const error = new Error('Stripe is not configured or sessionId is missing');
      error.statusCode = 400;
      return next(error);
    }

    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';
      await order.save();

      res.status(200).json({
        success: true,
        message: 'Stripe payment confirmed successfully',
        data: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Stripe payment was not successful'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Dynamic Razorpay Instance Getter
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  try {
    return new (require('razorpay'))({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    return null;
  }
};

// POST /api/orders/:id/razorpay-order
const createRazorpayOrder = async (req, res, next) => {
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

    const razorpayInstance = getRazorpayInstance();
    if (!razorpayInstance) {
      return res.status(200).json({
        success: false,
        message: 'Razorpay integration is not configured on the backend. Please define RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in backend .env, and run "npm install razorpay".'
      });
    }

    // Razorpay amounts are in the smallest currency unit (e.g. paisa)
    const amount = Math.round(order.totalPrice * 100);

    const options = {
      amount, // amount in paisa
      currency: 'INR',
      receipt: `receipt_order_${order._id}`,
      notes: { orderId: order._id.toString() }
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/:id/razorpay-confirm
const confirmRazorpayPayment = async (req, res, next) => {
  const { id } = req.params;
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

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

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      const error = new Error('Missing Razorpay validation parameters');
      error.statusCode = 400;
      return next(error);
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      const error = new Error('Razorpay secret key is not configured');
      error.statusCode = 500;
      return next(error);
    }

    // Verify signature using HMac SHA256
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpaySignature) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';
      order.paymentMethod = 'Razorpay';
      await order.save();

      res.status(200).json({
        success: true,
        message: 'Razorpay payment verified successfully',
        data: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Razorpay signature verification failed'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  updateOrderStatus,
  payOrder,
  createStripeSession,
  confirmStripePayment,
  createRazorpayOrder,
  confirmRazorpayPayment
};
