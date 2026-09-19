const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const PYQ = require('../models/PYQ');
const Resource = require('../models/Resource');

// @desc    Get all semesters with their subjects and counts
// @route   GET /api/semesters
// @access  Public
exports.getSemesters = async (req, res, next) => {
  try {
    const semesters = await Semester.find().sort({ number: 1 });

    // Enhance semesters with subject counts, pyq counts, and resource counts
    const enhancedSemesters = await Promise.all(
      semesters.map(async (sem) => {
        const subjects = await Subject.find({ semester: sem.number }).select('name code credits units');
        const subjectIds = subjects.map((s) => s._id);

        const pyqCount = await PYQ.countDocuments({ subject: { $in: subjectIds } });
        const resourceCount = await Resource.countDocuments({ subject: { $in: subjectIds } });

        return {
          ...sem.toObject(),
          subjects,
          subjectCount: subjects.length,
          pyqCount,
          resourceCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedSemesters.length,
      data: enhancedSemesters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single semester by number
// @route   GET /api/semesters/:number
// @access  Public
exports.getSemesterByNumber = async (req, res, next) => {
  try {
    const number = Number(req.params.number);
    const semester = await Semester.findOne({ number });

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: `Semester ${number} not found`,
      });
    }

    const subjects = await Subject.find({ semester: number });
    
    // Add counts to each subject
    const subjectsWithCounts = await Promise.all(
      subjects.map(async (subj) => {
        const pyqCount = await PYQ.countDocuments({ subject: subj._id });
        const resourceCount = await Resource.countDocuments({ subject: subj._id });
        return {
          ...subj.toObject(),
          pyqCount,
          resourceCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        ...semester.toObject(),
        subjects: subjectsWithCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create semester (Admin)
// @route   POST /api/semesters
// @access  Private/Admin
exports.createSemester = async (req, res, next) => {
  try {
    const { number, name, branch } = req.body;

    const existing = await Semester.findOne({ number: Number(number) });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Semester ${number} already exists`,
      });
    }

    const semester = await Semester.create({
      number: Number(number),
      name: name || `Semester ${number}`,
      branch: branch || 'CSE',
    });

    res.status(201).json({
      success: true,
      data: semester,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update semester (Admin)
// @route   PUT /api/semesters/:id
// @access  Private/Admin
exports.updateSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found',
      });
    }

    res.status(200).json({
      success: true,
      data: semester,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete semester (Admin)
// @route   DELETE /api/semesters/:id
// @access  Private/Admin
exports.deleteSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found',
      });
    }

    await semester.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Semester deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
