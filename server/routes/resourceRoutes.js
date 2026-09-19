const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getResources)
  .post(protect, adminOnly, createResource);

router.route('/:id')
  .get(getResourceById)
  .put(protect, adminOnly, updateResource)
  .delete(protect, adminOnly, deleteResource);

module.exports = router;
