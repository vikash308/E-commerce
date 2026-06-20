const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        const error = new Error('Not authorized, user not found');
        error.statusCode = 401;
        return next(error);
      }

      next();
    } catch (err) {
      console.error(err);
      const error = new Error('Not authorized, token failed');
      error.statusCode = 401;
      next(error);
    }
  }

  if (!token) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    next(error);
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const error = new Error('Not authorized as an admin');
    error.statusCode = 403;
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error(`Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource`);
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

module.exports = { protect, admin, authorize };


