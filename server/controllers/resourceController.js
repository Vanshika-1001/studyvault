const Resource = require('../models/Resource');
const Subject = require('../models/Subject');

// @desc    Get all resources with optional filtering
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res, next) => {
  try {
    const { subject, unit, type, search } = req.query;
    const query = {};

    if (subject) {
      query.subject = subject;
    }
    if (unit) {
      query.unit = Number(unit);
    }
    if (type && type !== 'All') {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(query)
      .populate('subject', 'name code semester')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
exports.getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('subject', 'name code semester');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create resource (Admin)
// @route   POST /api/resources
// @access  Private/Admin
exports.createResource = async (req, res, next) => {
  try {
    const { title, description, type, subject, unit, url } = req.body;

    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    const resource = await Resource.create({
      title,
      description: description || '',
      type: type || 'Notes',
      subject,
      unit: unit ? Number(unit) : 1,
      url,
    });

    const populated = await resource.populate('subject', 'name code semester');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource (Admin)
// @route   PUT /api/resources/:id
// @access  Private/Admin
exports.updateResource = async (req, res, next) => {
  try {
    if (req.body.unit) {
      req.body.unit = Number(req.body.unit);
    }

    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('subject', 'name code semester');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource (Admin)
// @route   DELETE /api/resources/:id
// @access  Private/Admin
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
