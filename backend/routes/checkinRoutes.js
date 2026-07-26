const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  submitCheckin,
  getTodayCheckin,
  getCheckinHistory,
  getMyStreak
} = require('../controllers/checkinController');

router.post('/', verifyToken, submitCheckin);
router.get('/today', verifyToken, getTodayCheckin);
router.get('/history', verifyToken, getCheckinHistory);
router.get('/streak', verifyToken, getMyStreak);

module.exports = router;