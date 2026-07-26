const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// This function handles new user signup
async function signup(req, res) {
  try {
    const { name, email, password, goals } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, goals) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, goals || null]
    );

    await pool.query(
      'INSERT INTO streaks (user_id, current_streak, longest_streak, total_points) VALUES (?, 0, 0, 0)',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Account created successfully!',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

// This function handles user login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}

// Update the logged-in user's name
async function updateProfile(req, res) {
  const userId = req.user.userId;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Name cannot be empty' });
  }

  try {
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    res.status(200).json({ message: 'Profile updated successfully', name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
}

// Change the logged-in user's password
async function changePassword(req, res) {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide both current and new password' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    res.status(200).json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error changing password' });
  }
}

// Get the logged-in user's full profile (used to prefill the Profile page)
async function getMe(req, res) {
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, height_cm, unit_preference, goals, health_conditions FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
}

// Update the logged-in user's height (needed for BMI calculation)
async function updateHeight(req, res) {
  const userId = req.user.userId;
  const { height_cm } = req.body;

  if (!height_cm || height_cm <= 0 || height_cm > 300) {
    return res.status(400).json({ message: 'Please enter a valid height in cm (e.g. 170)' });
  }

  try {
    await pool.query('UPDATE users SET height_cm = ? WHERE id = ?', [height_cm, userId]);
    res.status(200).json({ message: 'Height updated successfully', height_cm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating height' });
  }
}

// Update the logged-in user's weight-unit display preference (kg or lbs)
async function updateUnitPreference(req, res) {
  const userId = req.user.userId;
  const { unit_preference } = req.body;

  if (!['kg', 'lbs'].includes(unit_preference)) {
    return res.status(400).json({ message: 'Unit preference must be "kg" or "lbs"' });
  }

  try {
    await pool.query('UPDATE users SET unit_preference = ? WHERE id = ?', [unit_preference, userId]);
    res.status(200).json({ message: 'Unit preference updated', unit_preference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating unit preference' });
  }
}

// Update the logged-in user's goals/notes, shown on their Profile page.
// Optional and clearable — no minimum content required, just a sane upper
// length limit so someone can't paste in something absurdly large.
async function updateGoals(req, res) {
  const userId = req.user.userId;
  const { goals } = req.body;

  if (goals && goals.length > 2000) {
    return res.status(400).json({ message: 'Please keep this under 2000 characters' });
  }

  try {
    await pool.query('UPDATE users SET goals = ? WHERE id = ?', [goals || null, userId]);
    res.status(200).json({ message: 'Goals updated successfully', goals: goals || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating goals' });
  }
}
// Update the logged-in user's self-disclosed health conditions.
// Display-only: nothing else in the app reads or acts on this data — it's
// shown back to the user on their own Profile page, not used to drive any
// automatic recommendations, since that would cross into medical advice
// territory this app isn't qualified to give.
async function updateHealthInfo(req, res) {
  const userId = req.user.userId;
  const { health_conditions } = req.body;

  if (health_conditions && health_conditions.length > 1000) {
    return res.status(400).json({ message: 'Please keep this under 1000 characters' });
  }

  try {
    await pool.query('UPDATE users SET health_conditions = ? WHERE id = ?', [health_conditions || null, userId]);
    res.status(200).json({ message: 'Health information updated', health_conditions: health_conditions || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating health information' });
  }
}
// Returns signup date + lifetime stats, for the Profile page's Account Overview card
async function getAccountOverview(req, res) {
  const userId = req.user.userId;

  try {
    const [userRows] = await pool.query(
      'SELECT created_at FROM users WHERE id = ?',
      [userId]
    );

    const [checkinCountRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM checkins WHERE user_id = ?',
      [userId]
    );

    const [streakRows] = await pool.query(
      'SELECT longest_streak FROM streaks WHERE user_id = ?',
      [userId]
    );

    const [groupCountRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM group_members WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      memberSince: userRows[0]?.created_at || null,
      totalCheckins: checkinCountRows[0]?.total || 0,
      longestStreak: streakRows[0]?.longest_streak || 0,
      groupsJoined: groupCountRows[0]?.total || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching account overview' });
  }
}

// Permanently deletes the logged-in user's account and all associated data.
// Requires the current password as confirmation, since this is irreversible.
async function deleteAccount(req, res) {
  const userId = req.user.userId;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Please enter your password to confirm' });
  }

  const connection = await pool.getConnection();

  try {
    const [userRows] = await connection.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(password, userRows[0].password_hash);
    if (!passwordMatches) {
      connection.release();
      return res.status(401).json({ message: 'Incorrect password' });
    }

    await connection.beginTransaction();

    const [ownedGroups] = await connection.query('SELECT id FROM user_groups WHERE created_by = ?', [userId]);
    for (const group of ownedGroups) {
      await connection.query('DELETE FROM group_members WHERE group_id = ?', [group.id]);
      await connection.query('DELETE FROM user_groups WHERE id = ?', [group.id]);
    }

    await connection.query('DELETE FROM coach_messages WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM progress_photos WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM progress_logs WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM penalties WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM group_members WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM streaks WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM checkins WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    await connection.commit();
    connection.release();

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ message: 'Server error deleting account' });
  }
}

module.exports = {
  signup,
  login,
  updateProfile,
  changePassword,
  getMe,
  updateHeight,
  updateUnitPreference,
  updateGoals,
  getAccountOverview,
  deleteAccount , updateHealthInfo
};