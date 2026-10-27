const Task = require('../models/Task');

// @desc    Get all tasks for logged in user (with search and filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, section, search, sortBy, sortOrder } = req.query;

    const query = { user: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (section && section !== 'all') {
      query.section = section;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sortOptions = { [sortBy]: order };
    }

    const tasks = await Task.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      section,
      dueDate,
      startTime,
      deadline,
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task title and due date/deadline',
      });
    }

    const taskData = {
      title,
      description: description || '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      section: section || 'General',
      dueDate,
      startTime: startTime || new Date(),
      deadline: deadline || dueDate,
      user: req.user._id,
    };

    if (taskData.status === 'Done') {
      taskData.completedAt = new Date();
    }

    const task = await Task.create(taskData);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized',
      });
    }

    const {
      title,
      description,
      status,
      priority,
      section,
      dueDate,
      startTime,
      deadline,
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (section !== undefined) task.section = section;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (startTime !== undefined) task.startTime = startTime;
    if (deadline !== undefined) task.deadline = deadline;

    if (status !== undefined) {
      if (status === 'Done' && task.status !== 'Done') {
        task.completedAt = new Date();
      } else if (status !== 'Done') {
        task.completedAt = null;
      }
      task.status = status;
    }

    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick update status (useful for Kanban drag-and-drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['To Do', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be To Do, In Progress, or Done.',
      });
    }

    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized',
      });
    }

    task.status = status;
    if (status === 'Done') {
      task.completedAt = task.completedAt || new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task removed successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
