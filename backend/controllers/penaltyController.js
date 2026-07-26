const db = require('../config/db');

const PENALTY_POINTS = 10; // how many points to deduct for a missed day

// The actual penalty-checking logic, with no knowledge of HTTP at all.
// This is what makes it reusable by both the cron job and the manual endpoint.
async function runDailyPenaltyCheck() {
  const [users] = await db.execute('SELECT id FROM users');

  let penalizedCount = 0;

  for (const user of users) {
    const userId = user.id;

    // Did this user check in yesterday?
    const [yesterdayCheckin] = await db.execute(
      'SELECT * FROM checkins WHERE user_id = ? AND checkin_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)',
      [userId]
    );

    if (yesterdayCheckin.length > 0) {
      continue; // they checked in — no penalty, skip to next user
    }

    // Avoid double-penalizing: check if we already logged a penalty for yesterday
    const [existingPenalty] = await db.execute(
      `SELECT * FROM penalties 
       WHERE user_id = ? 
       AND DATE(applied_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`,
      [userId]
    );

    if (existingPenalty.length > 0) {
      continue; // already penalized for that day, skip
    }

    // Log the penalty
    await db.execute(
      `INSERT INTO penalties (user_id, reason, points_deducted) 
       VALUES (?, 'Missed daily check-in', ?)`,
      [userId, PENALTY_POINTS]
    );

    // Deduct points and reset their streak
    await db.execute(
      `UPDATE streaks 
       SET total_points = GREATEST(total_points - ?, 0), current_streak = 0 
       WHERE user_id = ?`,
      [PENALTY_POINTS, userId]
    );

    penalizedCount++;
  }

  return penalizedCount;
}

// HTTP handler for the manual/testing endpoint — just calls the shared logic above
async function applyDailyPenalties(req, res) {
  try {
    const penalizedCount = await runDailyPenaltyCheck();
    res.status(200).json({ 
      message: 'Daily penalties applied', 
      usersPenalized: penalizedCount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error applying penalties' });
  }
}

// Get the logged-in user's own penalty history
async function getMyPenalties(req, res) {
  const userId = req.user.userId;

  try {
    const [penalties] = await db.execute(
      'SELECT * FROM penalties WHERE user_id = ? ORDER BY applied_at DESC',
      [userId]
    );

    res.status(200).json({ penalties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching penalty history' });
  }
}

module.exports = { applyDailyPenalties, getMyPenalties, runDailyPenaltyCheck };