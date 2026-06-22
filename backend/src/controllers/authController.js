const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password) {
      const error = new Error('Please fill in all fields');
      error.statusCode = 400;
      return next(error);
    }

    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.statusCode = 400;
      return next(error);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('User already exists');
      error.statusCode = 400;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role && role === 'admin') {
      const error = new Error('Cannot register as an administrator');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerRequestStatus: user.sellerRequestStatus || 'none',
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    }

    user.refreshToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 400;
      return next(error);
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      return next(error);
    }

    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      const error = new Error('Invalid session or user not found');
      error.statusCode = 401;
      return next(error);
    }

    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      tokens: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      const error = new Error('Please provide an email');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('There is no user with that email');
      error.statusCode = 404;
      return next(error);
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${req.protocol}://localhost:5173/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link below, or copy/paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({
        success: true,
        message: 'Email sent successfully. Please check the backend terminal for the reset link.',
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      const error = new Error('Email could not be sent');
      error.statusCode = 500;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password) {
      const error = new Error('Please provide a new password');
      error.statusCode = 400;
      return next(error);
    }

    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.statusCode = 400;
      return next(error);
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error('Invalid or expired password reset token');
      error.statusCode = 400;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const { name, email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        const error = new Error('Email is already taken');
        error.statusCode = 400;
        return next(error);
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (newPassword) {
      if (!currentPassword) {
        const error = new Error('Please provide current password to change password');
        error.statusCode = 400;
        return next(error);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        const error = new Error('Incorrect current password');
        error.statusCode = 400;
        return next(error);
      }

      if (newPassword.length < 6) {
        const error = new Error('New password must be at least 6 characters');
        error.statusCode = 400;
        return next(error);
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerRequestStatus: user.sellerRequestStatus || 'none',
      },
    });
  } catch (error) {
    next(error);
  }
};

const requestSeller = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (user.role === 'seller' || user.role === 'admin') {
      const error = new Error('User is already a seller or admin');
      error.statusCode = 400;
      return next(error);
    }

    if (user.sellerRequestStatus === 'pending') {
      const error = new Error('Seller request is already pending');
      error.statusCode = 400;
      return next(error);
    }

    user.sellerRequestStatus = 'pending';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Seller request submitted successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerRequestStatus: user.sellerRequestStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  updateProfile,
  requestSeller,
};
