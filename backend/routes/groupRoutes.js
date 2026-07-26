const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  createGroup,
  joinGroup,
  getGroupMembers,
  getMyGroups,
  getGroupLeaderboard,
  leaveGroup,
  sendGroupMessage,
  getGroupMessages
} = require('../controllers/groupController');

router.post('/', verifyToken, createGroup);
router.post('/:groupId/join', verifyToken, joinGroup);
router.get('/:groupId/members', verifyToken, getGroupMembers);
router.get('/my-groups', verifyToken, getMyGroups);
router.get('/:groupId/leaderboard', verifyToken, getGroupLeaderboard);
router.delete('/:groupId/leave', verifyToken, leaveGroup);
router.post('/:groupId/messages', verifyToken, sendGroupMessage);
router.get('/:groupId/messages', verifyToken, getGroupMessages);


module.exports = router;