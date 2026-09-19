const User = require('../models/User');
const PYQ = require('../models/PYQ');
const Resource = require('../models/Resource');

// @desc    Get user's bookmarks (Questions and Resources separated)
// @route   GET /api/bookmarks
// @access  Private
exports.getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const pyqIds = user.bookmarks
      .filter((b) => b.itemType === 'PYQ')
      .map((b) => b.itemId);

    const resourceIds = user.bookmarks
      .filter((b) => b.itemType === 'Resource')
      .map((b) => b.itemId);

    const questions = await PYQ.find({ _id: { $in: pyqIds } }).populate('subject', 'name code semester');
    const resources = await Resource.find({ _id: { $in: resourceIds } }).populate('subject', 'name code semester');

    const notes = resources.filter((r) => r.type === 'Notes');
    const otherResources = resources.filter((r) => r.type !== 'Notes');

    res.status(200).json({
      success: true,
      data: {
        questions,
        notes,
        resources: otherResources,
        allResources: resources,
        total: user.bookmarks.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark (add if not present, remove if present)
// @route   POST /api/bookmarks/toggle
// @access  Private
exports.toggleBookmark = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item type and ID are required',
      });
    }

    const user = await User.findById(req.user._id);
    const existingIndex = user.bookmarks.findIndex(
      (b) => b.itemType === itemType && b.itemId.toString() === itemId.toString()
    );

    let isBookmarked = false;

    if (existingIndex > -1) {
      // Remove bookmark
      user.bookmarks.splice(existingIndex, 1);
      isBookmarked = false;
    } else {
      // Add bookmark
      user.bookmarks.push({ itemType, itemId });
      isBookmarked = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      isBookmarked,
      bookmarksCount: user.bookmarks.length,
      message: isBookmarked ? 'Bookmark added' : 'Bookmark removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a bookmark by itemId
// @route   DELETE /api/bookmarks/:itemId
// @access  Private
exports.removeBookmark = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const user = await User.findById(req.user._id);
    user.bookmarks = user.bookmarks.filter((b) => b.itemId.toString() !== itemId.toString());
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully',
      bookmarksCount: user.bookmarks.length,
    });
  } catch (error) {
    next(error);
  }
};
