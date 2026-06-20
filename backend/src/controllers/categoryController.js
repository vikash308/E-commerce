const mongoose = require('mongoose');
const Category = require('../models/categoryModel');


const createCategory = async (req, res, next) => {
  const { name, description, parent } = req.body;

  try {
    if (!name) {
      const error = new Error('Please provide a category name');
      error.statusCode = 400;
      return next(error);
    }

    const categoryExists = await Category.findOne({ name: name.trim() });
    if (categoryExists) {
      const error = new Error('Category name already exists');
      error.statusCode = 400;
      return next(error);
    }

    let parentId = null;
    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        const error = new Error('Invalid parent category ID');
        error.statusCode = 400;
        return next(error);
      }
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        const error = new Error('Parent category not found');
        error.statusCode = 404;
        return next(error);
      }
      parentId = parent;
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      parent: parentId,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, parent } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid category ID');
      error.statusCode = 400;
      return next(error);
    }

    const category = await Category.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    if (name && name.trim() !== category.name) {
      const categoryExists = await Category.findOne({ name: name.trim() });
      if (categoryExists) {
        const error = new Error('Category name already exists');
        error.statusCode = 400;
        return next(error);
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (parent !== undefined) {
      if (parent === null || parent === '') {
        category.parent = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(parent)) {
          const error = new Error('Invalid parent category ID');
          error.statusCode = 400;
          return next(error);
        }
        if (parent === id) {
          const error = new Error('A category cannot be its own parent');
          error.statusCode = 400;
          return next(error);
        }
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          const error = new Error('Parent category not found');
          error.statusCode = 404;
          return next(error);
        }
        category.parent = parent;
      }
    }

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid category ID');
      error.statusCode = 400;
      return next(error);
    }

    const category = await Category.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    // Set parent to null for any subcategories
    await Category.updateMany({ parent: id }, { parent: null });

    // Delete the category
    await Category.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};


const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({})
      .populate('parent', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
};
