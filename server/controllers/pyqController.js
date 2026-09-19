const PYQ = require('../models/PYQ');
const Subject = require('../models/Subject');

// @desc    Get all PYQs with full search, multi-filters, and sorting
// @route   GET /api/pyqs
// @access  Public
exports.getPYQs = async (req, res, next) => {
  try {
    const {
      search,
      semester,
      subject,
      unit,
      year,
      marks,
      difficulty,
      important,
      frequent,
      sort = 'newest',
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    // Filter by Semester
    if (semester) {
      query.semester = Number(semester);
    }

    // Filter by Subject (ID or name/code)
    if (subject) {
      query.subject = subject;
    }

    // Filter by Unit
    if (unit) {
      query.unit = Number(unit);
    }

    // Filter by Year
    if (year) {
      query.year = Number(year);
    }

    // Filter by Marks
    if (marks) {
      query.marks = Number(marks);
    }

    // Filter by Difficulty
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Filter by Important
    if (important === 'true' || important === true) {
      query.important = true;
    }

    // Filter by Frequently Asked (frequency >= 2)
    if (frequent === 'true' || frequent === true) {
      query.frequency = { $gte: 2 };
    }

    // Text search in question, topic
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { year: 1, createdAt: 1 };
        break;
      case 'frequency':
        sortOptions = { frequency: -1, year: -1 };
        break;
      case 'difficulty':
        sortOptions = { difficulty: 1, year: -1 };
        break;
      case 'marks':
        sortOptions = { marks: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { year: -1, createdAt: -1 };
        break;
    }

    const total = await PYQ.countDocuments(query);
    const pyqs = await PYQ.find(query)
      .populate('subject', 'name code semester')
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: pyqs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: pyqs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single PYQ by ID
// @route   GET /api/pyqs/:id
// @access  Public
exports.getPYQById = async (req, res, next) => {
  try {
    const pyq = await PYQ.findById(req.params.id).populate('subject', 'name code semester credits');

    if (!pyq) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pyq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new PYQ (Admin)
// @route   POST /api/pyqs
// @access  Private/Admin
exports.createPYQ = async (req, res, next) => {
  try {
    const {
      question,
      subject,
      semester,
      unit,
      topic,
      year,
      marks,
      difficulty,
      frequency,
      important,
      solution,
    } = req.body;

    // Verify subject exists and get semester if not provided
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    const pyq = await PYQ.create({
      question,
      subject,
      semester: semester ? Number(semester) : subjectDoc.semester,
      unit: Number(unit),
      topic,
      year: Number(year),
      marks: marks ? Number(marks) : 10,
      difficulty: difficulty || 'Medium',
      frequency: frequency ? Number(frequency) : 1,
      important: Boolean(important),
      solution: solution || '',
    });

    const populated = await pyq.populate('subject', 'name code');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update PYQ (Admin)
// @route   PUT /api/pyqs/:id
// @access  Private/Admin
exports.updatePYQ = async (req, res, next) => {
  try {
    const fieldsToUpdate = { ...req.body };
    if (fieldsToUpdate.semester) fieldsToUpdate.semester = Number(fieldsToUpdate.semester);
    if (fieldsToUpdate.unit) fieldsToUpdate.unit = Number(fieldsToUpdate.unit);
    if (fieldsToUpdate.year) fieldsToUpdate.year = Number(fieldsToUpdate.year);
    if (fieldsToUpdate.marks) fieldsToUpdate.marks = Number(fieldsToUpdate.marks);
    if (fieldsToUpdate.frequency) fieldsToUpdate.frequency = Number(fieldsToUpdate.frequency);
    if (fieldsToUpdate.important !== undefined) fieldsToUpdate.important = Boolean(fieldsToUpdate.important);

    const pyq = await PYQ.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).populate('subject', 'name code');

    if (!pyq) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pyq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete PYQ (Admin)
// @route   DELETE /api/pyqs/:id
// @access  Private/Admin
exports.deletePYQ = async (req, res, next) => {
  try {
    const pyq = await PYQ.findById(req.params.id);

    if (!pyq) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    await pyq.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
