const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a section name'],
      trim: true,
      maxlength: [40, 'Section name cannot exceed 40 characters'],
    },
    color: {
      type: String,
      default: '#3b82f6', // Tailwind blue-500
    },
    order: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique section name per user
sectionSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
