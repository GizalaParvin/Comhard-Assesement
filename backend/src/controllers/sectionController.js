const Section = require('../models/Section');
const Task = require('../models/Task');

// @desc    Get all sections for current user
// @route   GET /api/sections
// @access  Private
const getSections = async (req, res, next) => {
  try {
    const sections = await Section.find({ user: req.user._id }).sort({
      order: 1,
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new section
// @route   POST /api/sections
// @access  Private
const createSection = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Section name is required',
      });
    }

    const trimmedName = name.trim();

    // Check if section already exists for this user
    const existingSection = await Section.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: 'A section with this name already exists',
      });
    }

    const count = await Section.countDocuments({ user: req.user._id });

    const section = await Section.create({
      name: trimmedName,
      color: color || '#3b82f6',
      order: count,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rename a section and cascade to all its tasks
// @route   PUT /api/sections/:id
// @access  Private
const renameSection = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Section name cannot be empty',
      });
    }

    const trimmedName = name.trim();
    const section = await Section.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    const oldName = section.name;

    // Check conflict if renaming to another existing section
    if (oldName.toLowerCase() !== trimmedName.toLowerCase()) {
      const conflict = await Section.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Another section with this name already exists',
        });
      }
    }

    section.name = trimmedName;
    if (color) section.color = color;
    await section.save();

    // Cascade update to all tasks under this section
    if (oldName !== trimmedName) {
      await Task.updateMany(
        { user: req.user._id, section: oldName },
        { $set: { section: trimmedName } }
      );
    }

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete section and move tasks to 'General'
// @route   DELETE /api/sections/:id
// @access  Private
const deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    const sectionName = section.name;

    await Section.deleteOne({ _id: section._id });

    // Move associated tasks to 'General'
    await Task.updateMany(
      { user: req.user._id, section: sectionName },
      { $set: { section: 'General' } }
    );

    res.status(200).json({
      success: true,
      message: `Section "${sectionName}" deleted and tasks moved to General`,
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSections,
  createSection,
  renameSection,
  deleteSection,
};
