const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

// Get sections
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create section
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Section name is required' });
    }

    const trimmed = name.trim();
    const exists = await Section.findOne({ user: req.user._id, name: trimmed });
    if (exists) {
      return res.status(400).json({ message: 'Section already exists' });
    }

    const section = await Section.create({
      name: trimmed,
      user: req.user._id
    });

    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rename section
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Section name cannot be empty' });
    }

    const trimmed = name.trim();
    const section = await Section.findOne({ _id: req.params.id, user: req.user._id });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const oldName = section.name;
    section.name = trimmed;
    await section.save();

    // Update tasks in that section
    if (oldName !== trimmed) {
      await Task.updateMany(
        { user: req.user._id, section: oldName },
        {
          $set: { section: trimmed },
          $push: {
            sectionHistory: { from: oldName, to: trimmed, movedAt: new Date() }
          }
        }
      );
      // Also update completedSection for completed tasks in that section
      await Task.updateMany(
        { user: req.user._id, completedSection: oldName },
        { $set: { completedSection: trimmed } }
      );
    }

    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete section
router.delete('/:id', async (req, res) => {
  try {
    const section = await Section.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const oldName = section.name;

    // Move tasks to 'General'
    await Task.updateMany(
      { user: req.user._id, section: oldName },
      {
        $set: { section: 'General' },
        $push: {
          sectionHistory: { from: oldName, to: 'General', movedAt: new Date() }
        }
      }
    );
    await Task.updateMany(
      { user: req.user._id, completedSection: oldName },
      { $set: { completedSection: 'General' } }
    );

    res.json({ message: 'Section deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
