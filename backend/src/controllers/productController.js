const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const cloudinary = require('../config/cloudinary');

// Helper to upload file buffer directly to Cloudinary
const uploadFromBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ecom/products' },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(file.buffer);
  });
};


// @desc    Add Product
// @route   POST /api/products
// @access  Private/Admin
const addProduct = async (req, res, next) => {
  const { name, description, price, category, quantity, ratings } = req.body;

  try {
    if (!name || !description || price === undefined || !category || quantity === undefined) {
      const error = new Error('Please fill in all required fields (name, description, price, category, quantity)');
      error.statusCode = 400;
      return next(error);
    }

    if (price < 0) {
      const error = new Error('Price cannot be negative');
      error.statusCode = 400;
      return next(error);
    }

    if (quantity < 0) {
      const error = new Error('Quantity cannot be negative');
      error.statusCode = 400;
      return next(error);
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      const error = new Error('Invalid category ID');
      error.statusCode = 400;
      return next(error);
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    // Process and upload images to Cloudinary from memory buffer
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadFromBuffer(file);
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price,
      category,
      quantity,
      images,
      ratings: ratings || 0,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, category, quantity, ratings, deleteImages } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    // Ownership check for sellers (Admins bypass this)
    if (req.user.role === 'seller' && product.user.toString() !== req.user._id.toString()) {
      const error = new Error('Not authorized to update this product');
      error.statusCode = 403;
      return next(error);
    }

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    
    if (price !== undefined) {
      if (price < 0) {
        const error = new Error('Price cannot be negative');
        error.statusCode = 400;
        return next(error);
      }
      product.price = price;
    }

    if (quantity !== undefined) {
      if (quantity < 0) {
        const error = new Error('Quantity cannot be negative');
        error.statusCode = 400;
        return next(error);
      }
      product.quantity = quantity;
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        const error = new Error('Invalid category ID');
        error.statusCode = 400;
        return next(error);
      }
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        return next(error);
      }
      product.category = category;
    }

    if (ratings !== undefined) product.ratings = ratings;

    // Handle deletion of specific images if requested
    if (deleteImages) {
      let deleteList = deleteImages;
      if (typeof deleteImages === 'string') {
        try {
          deleteList = JSON.parse(deleteImages);
        } catch (e) {
          // split by comma if not JSON array
          deleteList = deleteImages.split(',').map(s => s.trim());
        }
      }
      if (Array.isArray(deleteList) && deleteList.length > 0) {
        for (const publicId of deleteList) {
          await cloudinary.uploader.destroy(publicId);
          product.images = product.images.filter(img => img.publicId !== publicId);
        }
      }
    }

    // Handle upload of new images if provided (from memory buffer)
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadFromBuffer(file);
        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
      product.images = [...product.images, ...newImages];
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    // Ownership check for sellers (Admins bypass this)
    if (req.user.role === 'seller' && product.user.toString() !== req.user._id.toString()) {
      const error = new Error('Not authorized to delete this product');
      error.statusCode = 403;
      return next(error);
    }

    // Delete all associated images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    await Product.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Product and its images deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Products (Public, Search, Filter, Sort, Paginate)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const keywordQuery = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    let categoryQuery = {};
    if (req.query.category) {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        const categories = await Category.find({
          $or: [
            { _id: req.query.category },
            { parent: req.query.category }
          ]
        });
        const categoryIds = categories.map(c => c._id);
        categoryQuery = { category: { $in: categoryIds } };
      }
    }

    const priceQuery = {};
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      priceQuery.price = {};
      if (req.query.minPrice !== undefined && req.query.minPrice !== '') {
        priceQuery.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
        priceQuery.price.$lte = Number(req.query.maxPrice);
      }
    }

    const ratingsQuery = req.query.ratings ? { ratings: { $gte: Number(req.query.ratings) } } : {};

    let sellerQuery = {};
    if (req.query.seller) {
      if (mongoose.Types.ObjectId.isValid(req.query.seller)) {
        sellerQuery = { user: req.query.seller };
      }
    }

    const filterQuery = {
      ...keywordQuery,
      ...categoryQuery,
      ...priceQuery,
      ...ratingsQuery,
      ...sellerQuery,
    };

    let sortBy = '-createdAt';
    if (req.query.sort) {
      sortBy = req.query.sort.split(',').join(' ');
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments(filterQuery);
    const products = await Product.find(filterQuery)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      page,
      pages: Math.ceil(totalProducts / limit),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Product Details (Public, by ID or Slug)
// @route   GET /api/products/:idOrSlug
// @access  Public
const getProductDetails = async (req, res, next) => {
  const { idOrSlug } = req.params;

  try {
    let product;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug).populate('category', 'name slug').populate('user', 'name email');
    } else {
      product = await Product.findOne({ slug: idOrSlug }).populate('category', 'name slug').populate('user', 'name email');
    }

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};


const createProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  const { id } = req.params;

  try {
    if (rating === undefined || !comment) {
      const error = new Error('Please provide rating and comment');
      error.statusCode = 400;
      return next(error);
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      const error = new Error('Rating must be a number between 1 and 5');
      error.statusCode = 400;
      return next(error);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      const error = new Error('You have already reviewed this product');
      error.statusCode = 400;
      return next(error);
    }

    const review = {
      name: req.user.name,
      rating: numRating,
      comment: comment.trim(),
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    // Populate category and user (seller) info before returning
    await product.populate('category', 'name slug');
    await product.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Product Review
// @route   PUT /api/products/:id/reviews
// @access  Private
const updateProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  const { id } = req.params;

  try {
    if (rating === undefined || !comment) {
      const error = new Error('Please provide rating and comment');
      error.statusCode = 400;
      return next(error);
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      const error = new Error('Rating must be a number between 1 and 5');
      error.statusCode = 400;
      return next(error);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    const review = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      return next(error);
    }

    review.rating = numRating;
    review.comment = comment.trim();

    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    await product.populate('category', 'name slug');
    await product.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Product Review
// @route   DELETE /api/products/:id/reviews
// @access  Private
const deleteProductReview = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    const reviewIndex = product.reviews.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (reviewIndex === -1) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      return next(error);
    }

    product.reviews.splice(reviewIndex, 1);
    product.numReviews = product.reviews.length;

    if (product.reviews.length > 0) {
      product.ratings =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
    } else {
      product.ratings = 0;
    }

    await product.save();

    await product.populate('category', 'name slug');
    await product.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductDetails,
  createProductReview,
  updateProductReview,
  deleteProductReview,
};
