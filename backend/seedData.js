const Section = require('./models/Section');
const Task = require('./models/Task');

async function seedTasksForUser(userId) {
  // Ensure default sections exist for this user
  const sectionNames = ['Work', 'Study', 'Personal'];
  for (const name of sectionNames) {
    const exists = await Section.findOne({ user: userId, name });
    if (!exists) {
      await Section.create({ name, user: userId });
    }
  }

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  const sampleTasks = [
    {
      title: 'Setup JWT Authentication & Protected Middleware',
      description: 'Implement token issuance, bcrypt password hashing, and user isolation middleware.',
      priority: 'High',
      section: 'Work',
      stage: 'Completed',
      allocatedAt: new Date(now - 6 * oneHour),
      slaDeadline: new Date(now + 1 * oneHour),
      completedAt: new Date(now - 2 * oneHour),
      completedSection: 'Work',
      stageHistory: [
        { stage: 'Allocated', enteredAt: new Date(now - 6 * oneHour) },
        { stage: 'Working', enteredAt: new Date(now - 5 * oneHour) },
        { stage: 'Completed', enteredAt: new Date(now - 2 * oneHour) }
      ],
      sectionHistory: [],
      completionHistory: [],
      user: userId
    },
    {
      title: 'Design MongoDB Aggregation for Section Averages',
      description: 'Aggregate completed tasks, match user and section, and compute unrounded average duration.',
      priority: 'High',
      section: 'Study',
      stage: 'Completed',
      allocatedAt: new Date(now - 10 * oneHour),
      slaDeadline: new Date(now - 2 * oneHour), // Completed 2 hours after deadline -> after SLA!
      completedAt: new Date(now - 4 * oneHour),
      completedSection: 'Study',
      stageHistory: [
        { stage: 'Allocated', enteredAt: new Date(now - 10 * oneHour) },
        { stage: 'Working', enteredAt: new Date(now - 8 * oneHour) },
        { stage: 'Completed', enteredAt: new Date(now - 4 * oneHour) }
      ],
      sectionHistory: [],
      completionHistory: [],
      user: userId
    },
    {
      title: 'Implement Kanban Drag and Drop with HTML5 API',
      description: 'Support dragging cards across Allocated, Working, and Completed with instant database sync.',
      priority: 'Medium',
      section: 'Work',
      stage: 'Working',
      allocatedAt: new Date(now - 1 * oneHour),
      slaDeadline: new Date(now + 7 * oneHour), // 12.5% elapsed -> Green
      stageHistory: [
        { stage: 'Allocated', enteredAt: new Date(now - 1 * oneHour) },
        { stage: 'Working', enteredAt: new Date(now - 30 * 60 * 1000) }
      ],
      sectionHistory: [],
      completionHistory: [],
      user: userId
    },
    {
      title: 'Refactor Section Reopen Rule and Audit History',
      description: 'Verify completionHistory records duration when moving back to Working or Allocated.',
      priority: 'Medium',
      section: 'Work',
      stage: 'Allocated',
      allocatedAt: new Date(now - 4 * oneHour),
      slaDeadline: new Date(now + 2 * oneHour), // 66.7% elapsed -> Yellow
      stageHistory: [
        { stage: 'Allocated', enteredAt: new Date(now - 4 * oneHour) }
      ],
      sectionHistory: [],
      completionHistory: [],
      user: userId
    },
    {
      title: 'Review Final Practical Exam Rubric & Testing',
      description: 'Validate SLA progress bars live updates and edge case handling.',
      priority: 'High',
      section: 'Study',
      stage: 'Working',
      allocatedAt: new Date(now - 9 * oneHour),
      slaDeadline: new Date(now + 1 * oneHour), // 90% elapsed -> Orange At Risk
      stageHistory: [
        { stage: 'Allocated', enteredAt: new Date(now - 9 * oneHour) },
        { stage: 'Working', enteredAt: new Date(now - 5 * oneHour) }
      ],
      sectionHistory: [],
      completionHistory: [],
      user: userId
    },
    {
      title: 'Fix Critical Production Database Memory Spike',
      description: 'Close unmanaged cursors and optimize document streaming.',
      priority: 'High',
      section: 'Work',
      stage: 'Allocated',
      allocatedAt: new Date(now - 24 * oneHour),
      slaDeadline: new Date(now - 3 * oneHour), // Breached by 3 hours -> Red Breached!
      stageHistory: [
        { stage: 'Allocated', enteredAt: new Date(now - 24 * oneHour) }
      ],
      sectionHistory: [],
      completionHistory: [],
      user: userId
    },
    {
      title: 'Renew Student Health Insurance Plan',
      description: 'Submit proof of enrollment and complete premium payment receipt.',
      priority: 'Low',
      section: 'Personal',
      stage: 'Completed',
      allocatedAt: new Date(now - 5 * oneHour),
      slaDeadline: new Date(now - 1 * oneHour),
      completedAt: new Date(now - 3 * oneHour), // Completed 2 hours before deadline -> within SLA!
      completedSection: 'Personal',
      stageHistory: [
        { stage: 'Allocated', enteredAt: new Date(now - 5 * oneHour) },
        { stage: 'Completed', enteredAt: new Date(now - 3 * oneHour) }
      ],
      sectionHistory: [],
      completionHistory: [],
      user: userId
    }
  ];

  await Task.insertMany(sampleTasks);
}

module.exports = { seedTasksForUser };
