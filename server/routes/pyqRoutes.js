const express = require('express');
const router = express.Router();
const {
  getPYQs,
  getPYQById,
  createPYQ,
  updatePYQ,
  deletePYQ,
} = require('../controllers/pyqController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getPYQs)
  .post(protect, adminOnly, createPYQ);

router.route('/:id')
  .get(getPYQById)
  .put(protect, adminOnly, updatePYQ)
  .delete(protect, adminOnly, deletePYQ);

module.exports = router;
