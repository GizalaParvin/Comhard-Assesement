const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

// Get all tasks for current user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed sample tasks for current user
router.post('/seed', async (req, res) => {
  try {
    const { seedTasksForUser } = require('../seedData');
    await seedTasksForUser(req.user._id);
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ message: 'Sample tasks loaded successfully', tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, section, slaDeadline } = req.body;

    if (!title || !slaDeadline) {
      return res.status(400).json({ message: 'Title and SLA deadline are required' });
    }

    const now = new Date();
    const task = new Task({
      title,
      description: description || '',
      priority: priority || 'Medium',
      section: section || 'General',
      stage: 'Allocated',
      allocatedAt: now,
      slaDeadline: new Date(slaDeadline),
      stageHistory: [{ stage: 'Allocated', enteredAt: now }],
      sectionHistory: [],
      completionHistory: [],
      user: req.user._id
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task (details, stage, or section)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, priority, section, stage, slaDeadline } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (slaDeadline !== undefined) task.slaDeadline = new Date(slaDeadline);

    const now = new Date();

    // Check section move
    if (section && section !== task.section) {
      task.sectionHistory.push({
        from: task.section,
        to: section,
        movedAt: now
      });
      task.section = section;
      // If task is completed and moved, update completedSection to match
      if (task.stage === 'Completed') {
        task.completedSection = section;
      }
    }

    // Check stage change
    if (stage && stage !== task.stage) {
      const prevStage = task.stage;
      task.stage = stage;
      task.stageHistory.push({
        stage,
        enteredAt: now
      });

      // Moving to Completed
      if (stage === 'Completed') {
        task.completedAt = now;
        task.completedSection = task.section;
      }

      // Reopening from Completed to Allocated or Working
      if (prevStage === 'Completed' && stage !== 'Completed') {
        const duration = task.completedAt
          ? new Date(task.completedAt).getTime() - new Date(task.allocatedAt).getTime()
          : now.getTime() - new Date(task.allocatedAt).getTime();

        task.completionHistory.push({
          completedAt: task.completedAt || now,
          completedSection: task.completedSection || task.section,
          duration: Math.max(0, duration)
        });

        task.completedAt = null;
        task.completedSection = null;
      }
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
