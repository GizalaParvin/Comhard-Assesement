const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/stats/sections
// MongoDB aggregation for average completion time per section
router.get('/sections', async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $match: {
          user: req.user._id,
          stage: 'Completed',
          completedAt: { $ne: null },
          completedSection: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$completedSection',
          avgDurationMs: {
            $avg: { $subtract: ['$completedAt', '$allocatedAt'] }
          },
          taskCount: { $sum: 1 }
        }
      }
    ]);

    const result = stats.map((item) => ({
      section: item._id,
      avgDurationMs: item.avgDurationMs,
      taskCount: item.taskCount
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/stats/overall
// Overall SLA stats for completed tasks only
router.get('/overall', async (req, res) => {
  try {
    const completedTasks = await Task.find({
      user: req.user._id,
      stage: 'Completed',
      completedAt: { $ne: null }
    });

    if (completedTasks.length === 0) {
      return res.json({
        totalCompleted: 0,
        avgCompletionTimeMs: null,
        avgSlaTimeGivenMs: null,
        avgSlaUsedPercent: null,
        onTimePercent: null,
        fastestCompletionMs: null,
        slowestCompletionMs: null
      });
    }

    let totalDuration = 0;
    let totalSlaGiven = 0;
    let onTimeCount = 0;
    const durations = [];

    completedTasks.forEach((task) => {
      const duration = new Date(task.completedAt).getTime() - new Date(task.allocatedAt).getTime();
      const slaGiven = new Date(task.slaDeadline).getTime() - new Date(task.allocatedAt).getTime();

      totalDuration += duration;
      totalSlaGiven += slaGiven;
      durations.push(duration);

      if (new Date(task.completedAt) <= new Date(task.slaDeadline)) {
        onTimeCount++;
      }
    });

    const count = completedTasks.length;
    // Ratio of total time taken to total SLA given (matches hand calculation)
    const ratioSlaUsed = totalSlaGiven > 0 ? (totalDuration / totalSlaGiven) * 100 : 0;

    res.json({
      totalCompleted: count,
      avgCompletionTimeMs: totalDuration / count,
      avgSlaTimeGivenMs: totalSlaGiven / count,
      avgSlaUsedPercent: ratioSlaUsed,
      onTimePercent: (onTimeCount / count) * 100,
      fastestCompletionMs: Math.min(...durations),
      slowestCompletionMs: Math.max(...durations)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
