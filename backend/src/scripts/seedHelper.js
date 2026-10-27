const User = require('../models/User');
const Task = require('../models/Task');
const Section = require('../models/Section');

const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already contains records. Skipping auto-seed.');
      return;
    }

    console.log('[Seed] Auto-seeding initial demo user, sections, and SLA tasks...');

    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: 'demo@example.com',
      password: 'password123',
    });

    await Section.insertMany([
      { name: 'Work', color: '#3b82f6', order: 0, user: demoUser._id },
      { name: 'Personal', color: '#10b981', order: 1, user: demoUser._id },
      { name: 'Study', color: '#8b5cf6', order: 2, user: demoUser._id },
      { name: 'Urgent', color: '#f43f5e', order: 3, user: demoUser._id },
    ]);

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    const tasks = [
      {
        title: 'Implement JWT Authentication & User Sessions',
        description: 'Set up token validation, secure password hashing, and persistent login sessions across app reloads.',
        status: 'In Progress',
        priority: 'High',
        section: 'Work',
        startTime: new Date(now - 1 * oneHour), // started 1h ago
        dueDate: new Date(now + 7 * oneHour),   // due in 7h (<50% elapsed -> GREEN)
        deadline: new Date(now + 7 * oneHour),
        user: demoUser._id,
      },
      {
        title: 'Refactor Database Schema & Composite Indexes',
        description: 'Add composite indexes on user and status fields to speed up task filtering queries.',
        status: 'To Do',
        priority: 'Medium',
        section: 'Work',
        startTime: new Date(now - 4 * oneHour), // started 4h ago
        dueDate: new Date(now + 2 * oneHour),   // due in 2h (50-80% elapsed -> YELLOW)
        deadline: new Date(now + 2 * oneHour),
        user: demoUser._id,
      },
      {
        title: 'Prepare System Architecture Presentation',
        description: 'Create visual architecture diagram for distributed cache and microservices integration.',
        status: 'In Progress',
        priority: 'High',
        section: 'Study',
        startTime: new Date(now - 9 * oneHour), // started 9h ago
        dueDate: new Date(now + 1 * oneHour),   // due in 1h (80-100% elapsed -> ORANGE At Risk)
        deadline: new Date(now + 1 * oneHour),
        user: demoUser._id,
      },
      {
        title: 'Fix Production Memory Leak in Webhook Handler',
        description: 'Investigate unclosed database cursors and circular references causing memory spikes.',
        status: 'To Do',
        priority: 'High',
        section: 'Urgent',
        startTime: new Date(now - 24 * oneHour), // started 24h ago
        dueDate: new Date(now - 3 * oneHour),    // deadline was 3h ago (>100% -> RED Breached)
        deadline: new Date(now - 3 * oneHour),
        user: demoUser._id,
      },
      {
        title: 'Renew Health Insurance Policy',
        description: 'Reviewed policy documentation, selected plan tier, and submitted payment confirmation.',
        status: 'Done',
        priority: 'Medium',
        section: 'Personal',
        startTime: new Date(now - 12 * oneHour),
        dueDate: new Date(now + 6 * oneHour),
        deadline: new Date(now + 6 * oneHour),
        completedAt: new Date(now - 2 * oneHour), // completed before deadline -> Completed within SLA!
        user: demoUser._id,
      },
      {
        title: 'File Quarterly Utility Bills & Expenses',
        description: 'Organized receipts, calculated tax deductions, and archived invoices for record keeping.',
        status: 'Done',
        priority: 'Low',
        section: 'Personal',
        startTime: new Date(now - 72 * oneHour),
        dueDate: new Date(now - 24 * oneHour),
        deadline: new Date(now - 24 * oneHour),
        completedAt: new Date(now - 2 * oneHour), // completed after deadline -> Completed after SLA!
        user: demoUser._id,
      },
      {
        title: 'Read React 19 Compiler Whitepaper',
        description: 'Explore automatic memoization and performance optimizations in the new React architecture.',
        status: 'To Do',
        priority: 'Low',
        section: 'Study',
        startTime: new Date(now - 0.5 * oneHour),
        dueDate: new Date(now + 48 * oneHour),
        deadline: new Date(now + 48 * oneHour),
        user: demoUser._id,
      },
    ];

    await Task.insertMany(tasks);
    console.log('[Seed] Auto-seed finished! Ready to login with demo@example.com / password123');
  } catch (err) {
    console.error('[Seed Error] Auto-seeding failed:', err.message);
  }
};

module.exports = { seedDemoData };
