const express = require('express');
const router = express.Router();
const {
  getSections,
  createSection,
  renameSection,
  deleteSection,
} = require('../controllers/sectionController');
const { protect } = require('../middleware/authMiddleware');

// All section routes are protected
router.use(protect);

router.route('/').get(getSections).post(createSection);
router.route('/:id').put(renameSection).delete(deleteSection);

module.exports = router;
