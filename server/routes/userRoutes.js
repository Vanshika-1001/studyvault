const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.get('/', getAllUsers);
router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
