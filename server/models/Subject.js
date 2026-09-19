const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unitNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  topics: [
    {
      type: String,
      trim: true,
    },
  ],
});

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    branch: {
      type: String,
      default: 'CSE',
      trim: true,
    },
    credits: {
      type: Number,
      default: 4,
      min: 1,
      max: 6,
    },
    description: {
      type: String,
      trim: true,
    },
    units: [unitSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for PYQs count
subjectSchema.virtual('pyqs', {
  ref: 'PYQ',
  localField: '_id',
  foreignField: 'subject',
});

// Virtual for resources count
subjectSchema.virtual('resources', {
  ref: 'Resource',
  localField: '_id',
  foreignField: 'subject',
});

module.exports = mongoose.model('Subject', subjectSchema);
