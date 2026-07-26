const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  updateProfile,
  changePassword,
  getMe,
  updateHeight,
  updateUnitPreference,
  updateGoals,
  updateHealthInfo,
  getAccountOverview,
  deleteAccount
} = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);

router.get('/profile', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
router.put('/height', verifyToken, updateHeight);
router.put('/unit-preference', verifyToken, updateUnitPreference);
router.put('/goals', verifyToken, updateGoals);
router.put('/health-info', verifyToken, updateHealthInfo);
router.get('/account-overview', verifyToken, getAccountOverview);
router.delete('/account', verifyToken, deleteAccount);

module.exports = router;