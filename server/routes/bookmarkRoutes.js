const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  toggleBookmark,
  removeBookmark,
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBookmarks);
router.post('/toggle', toggleBookmark);
router.delete('/:itemId', removeBookmark);

module.exports = router;
