const express = require('express');
const router = express.Router();
const {
  getPYQAnalytics,
  getPlatformStats,
} = require('../controllers/analyticsController');

router.get('/pyq', getPYQAnalytics);
router.get('/platform', getPlatformStats);

module.exports = router;
