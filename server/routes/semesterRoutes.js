const express = require('express');
const router = express.Router();
const {
  getSemesters,
  getSemesterByNumber,
  createSemester,
  updateSemester,
  deleteSemester,
} = require('../controllers/semesterController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getSemesters)
  .post(protect, adminOnly, createSemester);

router.route('/:number')
  .get(getSemesterByNumber);

router.route('/id/:id')
  .put(protect, adminOnly, updateSemester)
  .delete(protect, adminOnly, deleteSemester);

module.exports = router;
