const mongoose = require('mongoose');

const pyqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    unit: {
      type: Number,
      required: [true, 'Unit number is required'],
      min: 1,
      max: 10,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Exam year is required'],
    },
    marks: {
      type: Number,
      default: 10,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    frequency: {
      type: Number,
      default: 1,
      min: 1,
    },
    important: {
      type: Boolean,
      default: false,
    },
    solution: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast searching and filtering
pyqSchema.index({ question: 'text', topic: 'text' });
pyqSchema.index({ subject: 1, unit: 1, year: 1, difficulty: 1 });

module.exports = mongoose.model('PYQ', pyqSchema);
