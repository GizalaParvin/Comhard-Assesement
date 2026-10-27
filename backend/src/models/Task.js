const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'To Do',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true,
    },
    section: {
      type: String,
      default: 'General',
      trim: true,
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a due date / SLA deadline'],
    },
    deadline: {
      type: Date,
    },
    completedAt: {
      type: Date,
      default: null,
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

// Ensure deadline is synced with dueDate if not explicitly provided
taskSchema.pre('save', function (next) {
  if (!this.deadline) {
    this.deadline = this.dueDate;
  }
  // Automatically track completedAt timestamp
  if (this.status === 'Done' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'Done') {
    this.completedAt = null;
  }
  next();
});

// Composite index for fast filtering by user and status/priority/section
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, section: 1 });
taskSchema.index({ user: 1, priority: 1 });

module.exports = mongoose.model('Task', taskSchema);
