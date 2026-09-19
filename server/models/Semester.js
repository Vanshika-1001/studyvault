const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: [true, 'Semester number is required'],
      unique: true,
      min: [1, 'Semester number must be at least 1'],
      max: [8, 'Semester number cannot exceed 8'],
    },
    name: {
      type: String,
      required: [true, 'Semester name is required'],
      trim: true,
    },
    branch: {
      type: String,
      default: 'CSE',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subjects in this semester
semesterSchema.virtual('subjects', {
  ref: 'Subject',
  localField: 'number',
  foreignField: 'semester',
});

module.exports = mongoose.model('Semester', semesterSchema);
