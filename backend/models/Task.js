const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  section: {
    type: String,
    default: 'General'
  },
  stage: {
    type: String,
    enum: ['Allocated', 'Working', 'Completed'],
    default: 'Allocated'
  },
  allocatedAt: {
    type: Date,
    default: Date.now
  },
  slaDeadline: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedSection: {
    type: String,
    default: null
  },
  stageHistory: [
    {
      stage: { type: String, required: true },
      enteredAt: { type: Date, default: Date.now }
    }
  ],
  sectionHistory: [
    {
      from: { type: String, required: true },
      to: { type: String, required: true },
      movedAt: { type: Date, default: Date.now }
    }
  ],
  completionHistory: [
    {
      completedAt: { type: Date, required: true },
      completedSection: { type: String, required: true },
      duration: { type: Number, required: true }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
