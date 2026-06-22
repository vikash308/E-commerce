const express = require('express');
const {
  getUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Guard all user routes under protect and admin middlewares
router.use(protect);
router.use(admin);

router.route('/')
  .get(getUsers);

router.route('/:id/role')
  .put(updateUserRole);

router.route('/:id')
  .delete(deleteUser);

module.exports = router;
