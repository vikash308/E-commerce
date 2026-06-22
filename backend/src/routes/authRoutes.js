const express = require('express');
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/securityMiddleware');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} = require('../middlewares/validationMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', authLimiter, resetPassword);

// Protected routes (to verify authentication works)
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = router;
