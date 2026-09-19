const express = require('express');
const router = express.Router();
const {
  generatePractice,
  submitPracticeSession,
  getPracticeHistory,
} = require('../controllers/practiceController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generatePractice);
router.post('/submit', protect, submitPracticeSession);
router.get('/history', protect, getPracticeHistory);

module.exports = router;
