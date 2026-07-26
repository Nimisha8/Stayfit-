const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const verifyCronSecret = require('../middleware/verifyCronSecret');
const { applyDailyPenalties, getMyPenalties } = require('../controllers/penaltyController');

router.post('/apply-daily', verifyCronSecret, applyDailyPenalties);
router.get('/my-history', verifyToken, getMyPenalties);

module.exports = router;