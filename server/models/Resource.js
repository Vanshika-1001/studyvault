const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['Notes', 'PYQ', 'Syllabus', 'Reference', 'Video', 'Practice'],
      default: 'Notes',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    unit: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    url: {
      type: String,
      required: [true, 'Resource link or URL is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
