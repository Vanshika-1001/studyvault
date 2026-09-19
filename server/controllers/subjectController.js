const Subject = require('../models/Subject');
const PYQ = require('../models/PYQ');
const Resource = require('../models/Resource');

// @desc    Get all subjects with optional filtering
// @route   GET /api/subjects
// @access  Public
exports.getSubjects = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.semester) {
      query.semester = Number(req.query.semester);
    }
    if (req.query.branch) {
      query.branch = req.query.branch;
    }
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(query).sort({ semester: 1, name: 1 });

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
      count: subjectsWithCounts.length,
      data: subjectsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject by ID
// @route   GET /api/subjects/:id
// @access  Public
exports.getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    const pyqs = await PYQ.find({ subject: subject._id }).sort({ year: -1, unit: 1 });
    const resources = await Resource.find({ subject: subject._id }).sort({ unit: 1, type: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...subject.toObject(),
        pyqs,
        resources,
        pyqCount: pyqs.length,
        resourceCount: resources.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subject (Admin)
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, semester, branch, credits, description, units } = req.body;

    const existing = await Subject.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Subject with code ${code} already exists`,
      });
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      semester: Number(semester),
      branch: branch || 'CSE',
      credits: credits ? Number(credits) : 4,
      description: description || '',
      units: units || [],
    });

    res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject (Admin)
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res, next) => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }
    if (req.body.semester) {
      req.body.semester = Number(req.body.semester);
    }
    if (req.body.credits) {
      req.body.credits = Number(req.body.credits);
    }

    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject (Admin)
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Cascade delete associated PYQs and resources
    await PYQ.deleteMany({ subject: subject._id });
    await Resource.deleteMany({ subject: subject._id });
    await subject.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Subject and associated PYQs/resources deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
