const mongoose = require('mongoose');

const practiceSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    unit: {
      type: Number,
      default: 0, // 0 means all units
    },
    difficulty: {
      type: String,
      default: 'All',
    },
    questions: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'PYQ',
          required: true,
        },
        userStatus: {
          type: String,
          enum: ['correct', 'incorrect', 'revision', 'skipped'],
          default: 'correct',
        },
        markedForRevision: {
          type: Boolean,
          default: false,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0, // Percentage
    },
    timeTaken: {
      type: Number,
      default: 0, // Duration in seconds
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PracticeSession', practiceSessionSchema);
