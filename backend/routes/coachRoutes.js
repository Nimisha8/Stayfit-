const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { sendCoachMessage, getCoachHistory } = require('../controllers/coachController');

router.post('/message', verifyToken, sendCoachMessage);
router.get('/history', verifyToken, getCoachHistory);

module.exports = router;