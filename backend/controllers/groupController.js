const db = require('../config/db'); // adjust path/name to match your existing db connection file

// Create a new group — creator is automatically added as first member
async function createGroup(req, res) {
  const { name } = req.body;
  const userId = req.user.userId;

  if (!name) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  try {
    // Step 1: Insert the group
    const [groupResult] = await db.execute(
      'INSERT INTO user_groups (name, created_by) VALUES (?, ?)',
      [name, userId]
    );
    const groupId = groupResult.insertId;

    // Step 2: Add the creator as the first member
    await db.execute(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, userId]
    );

    res.status(201).json({
      message: 'Group created successfully',
      group: { id: groupId, name, created_by: userId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating group' });
  }
}

// Join an existing group by ID
async function joinGroup(req, res) {
  const { groupId } = req.params;
  const userId = req.user.userId;

  try {
    // Check the group actually exists
    const [groups] = await db.execute('SELECT * FROM user_groups WHERE id = ?', [groupId]);
    if (groups.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check user isn't already a member
    const [existing] = await db.execute(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    await db.execute(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, userId]
    );

    res.status(200).json({ message: 'Joined group successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error joining group' });
  }
}

// List all members of a specific group
async function getGroupMembers(req, res) {
  const { groupId } = req.params;

  try {
    const [members] = await db.execute(
      `SELECT users.id, users.name, users.email, group_members.joined_at
       FROM group_members
       JOIN users ON group_members.user_id = users.id
       WHERE group_members.group_id = ?`,
      [groupId]
    );

    res.status(200).json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching members' });
  }
}

// List all groups the logged-in user belongs to
async function getMyGroups(req, res) {
  const userId = req.user.userId;

  try {
    const [groups] = await db.execute(
      `SELECT user_groups.id, user_groups.name, user_groups.created_by, user_groups.created_at
       FROM group_members
       JOIN user_groups ON group_members.group_id = user_groups.id
       WHERE group_members.user_id = ?`,
      [userId]
    );

    res.status(200).json({ groups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching your groups' });
  }
}
// Get the leaderboard for a specific group
async function getGroupLeaderboard(req, res) {
  const { groupId } = req.params;

  try {
    // Confirm the group actually exists
    const [groups] = await db.execute(
      'SELECT * FROM user_groups WHERE id = ?',
      [groupId]
    );

    if (groups.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Join group_members -> users -> streaks, sorted by points
    const [leaderboard] = await db.execute(
      `SELECT 
         u.id AS user_id,
         u.name,
         COALESCE(s.current_streak, 0) AS current_streak,
         COALESCE(s.longest_streak, 0) AS longest_streak,
         COALESCE(s.total_points, 0) AS total_points
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       LEFT JOIN streaks s ON s.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY total_points DESC, current_streak DESC`,
      [groupId]
    );

    // Add a rank number to each entry (1st, 2nd, 3rd...)
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    res.status(200).json({ leaderboard: ranked });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
}
// Leave a group
async function leaveGroup(req, res) {
  const { groupId } = req.params;
  const userId = req.user.userId;

  try {
    const [result] = await db.execute(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'You are not a member of this group' });
    }

    res.status(200).json({ message: 'Left group successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error leaving group' });
  }
}

// Shared helper: confirms the given user is actually a member of the given group.
// Used by both send and get, so someone can't read or post into a group they haven't joined.
async function isGroupMember(groupId, userId) {
  const [rows] = await db.execute(
    'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId]
  );
  return rows.length > 0;
}

// Send a message to a group's chat
async function sendGroupMessage(req, res) {
  const { groupId } = req.params;
  const userId = req.user.userId;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  try {
    const isMember = await isGroupMember(groupId, userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    await db.execute(
      'INSERT INTO group_messages (group_id, user_id, message) VALUES (?, ?, ?)',
      [groupId, userId, message.trim()]
    );

    res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error sending message' });
  }
}

// Get all messages for a group, newest last, with sender names attached
async function getGroupMessages(req, res) {
  const { groupId } = req.params;
  const userId = req.user.userId;

  try {
    const isMember = await isGroupMember(groupId, userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const [messages] = await db.execute(
      `SELECT group_messages.id, group_messages.message, group_messages.created_at,
              users.id AS user_id, users.name AS sender_name
       FROM group_messages
       JOIN users ON group_messages.user_id = users.id
       WHERE group_messages.group_id = ?
       ORDER BY group_messages.created_at ASC`,
      [groupId]
    );

    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
}

module.exports = { createGroup, joinGroup, getGroupMembers, getMyGroups, getGroupLeaderboard, leaveGroup, sendGroupMessage, getGroupMessages };