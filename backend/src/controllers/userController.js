const User = require('../models/userModel');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['customer', 'seller', 'admin'];

  try {
    if (!role || !validRoles.includes(role)) {
      const error = new Error(`Please provide a valid role: ${validRoles.join(', ')}`);
      error.statusCode = 400;
      return next(error);
    }

    if (req.user._id.toString() === id) {
      const error = new Error('You cannot change your own role');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    user.role = role;
    if (role === 'customer') {
      user.sellerRequestStatus = 'none';
    }
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.user._id.toString() === id) {
      const error = new Error('You cannot delete your own account');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    await User.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const processSellerRequest = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['approved', 'rejected'];

  try {
    if (!status || !validStatuses.includes(status)) {
      const error = new Error(`Please provide a valid status: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (status === 'approved') {
      user.role = 'seller';
      user.sellerRequestStatus = 'approved';
    } else {
      user.sellerRequestStatus = 'rejected';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Seller request ${status} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  processSellerRequest,
};
