const db = require('../config/db');

// Submit today's check-in
async function submitCheckin(req, res) {
  const userId = req.user.userId;
  const { workout_done, diet_followed, water_intake_done, steps_goal_done } = req.body;

  try {
    // Ask MySQL what "today" is, in local server time — not JS/UTC
    const [[{ today }]] = await db.execute(
      "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today"
    );

    // Check if already checked in today
    const [existing] = await db.execute(
      'SELECT * FROM checkins WHERE user_id = ? AND checkin_date = CURDATE()',
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already checked in today' });
    }

    await db.execute(
      `INSERT INTO checkins (user_id, checkin_date, workout_done, diet_followed, water_intake_done, steps_goal_done)
       VALUES (?, CURDATE(), ?, ?, ?, ?)`,
      [
        userId,
        !!workout_done,
        !!diet_followed,
        !!water_intake_done,
        !!steps_goal_done
      ]
    );

    await updateStreak(userId, {
      workout_done: !!workout_done,
      diet_followed: !!diet_followed,
      water_intake_done: !!water_intake_done,
      steps_goal_done: !!steps_goal_done
    });

    res.status(201).json({ message: 'Check-in recorded successfully', date: today });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error submitting check-in' });
  }
}

// Get today's check-in status
async function getTodayCheckin(req, res) {
  const userId = req.user.userId;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM checkins WHERE user_id = ? AND checkin_date = CURDATE()',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({ checkedIn: false });
    }

    res.status(200).json({ checkedIn: true, checkin: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching today\'s check-in' });
  }
}

// Get check-in history for the logged-in user
async function getCheckinHistory(req, res) {
  const userId = req.user.userId;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC',
      [userId]
    );

    res.status(200).json({ history: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching check-in history' });
  }
}

// Updates streak + points after a successful check-in
async function updateStreak(userId, checkin) {
  // Check if user has a streak row yet
  const [existingStreak] = await db.execute(
    'SELECT * FROM streaks WHERE user_id = ?',
    [userId]
  );

  // Calculate points earned for this check-in
  let pointsEarned = 10; // base points for checking in at all
  if (checkin.workout_done) pointsEarned += 5;
  if (checkin.diet_followed) pointsEarned += 5;
  if (checkin.water_intake_done) pointsEarned += 5;
  if (checkin.steps_goal_done) pointsEarned += 5;

  if (existingStreak.length === 0) {
    // First-ever check-in for this user — create their streak row
    await db.execute(
      `INSERT INTO streaks (user_id, current_streak, longest_streak, total_points)
       VALUES (?, 1, 1, ?)`,
      [userId, pointsEarned]
    );
    return;
  }

  const streak = existingStreak[0];

  // Did they check in yesterday? Let MySQL compute "yesterday", not JS.
  const [yesterdayCheckin] = await db.execute(
    'SELECT * FROM checkins WHERE user_id = ? AND checkin_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)',
    [userId]
  );

  let newCurrentStreak;
  if (yesterdayCheckin.length > 0) {
    // Checked in yesterday too — streak continues
    newCurrentStreak = streak.current_streak + 1;
  } else {
    // Gap in days — streak resets, today is day 1
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);
  const newTotalPoints = streak.total_points + pointsEarned;

  await db.execute(
    `UPDATE streaks
     SET current_streak = ?, longest_streak = ?, total_points = ?
     WHERE user_id = ?`,
    [newCurrentStreak, newLongestStreak, newTotalPoints, userId]
  );
}

async function getMyStreak(req, res) {
  const userId = req.user.userId;

  try {
    const [rows] = await db.execute('SELECT * FROM streaks WHERE user_id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(200).json({
        current_streak: 0,
        longest_streak: 0,
        total_points: 0
      });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching streak' });
  }
}

module.exports = { submitCheckin, getTodayCheckin, getCheckinHistory, getMyStreak };