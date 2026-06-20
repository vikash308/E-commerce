const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

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

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
