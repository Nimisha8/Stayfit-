const db = require('../config/db');
const { calculateBMI, getBMICategory } = require('./progressController');

const COACH_MODEL = 'gemini-flash-latest'; // always points to Google's current fast model, avoids future deprecation breaks
const MAX_HISTORY_MESSAGES = 10; // how many past turns to feed back in, to keep API costs predictable

// Gathers a snapshot of the user's real stats to ground the coach's reply in actual data
async function getUserContext(userId) {
  const [streakRows] = await db.execute(
    'SELECT current_streak, longest_streak, total_points FROM streaks WHERE user_id = ?',
    [userId]
  );
  const streak = streakRows[0] || { current_streak: 0, longest_streak: 0, total_points: 0 };

  const [todayRows] = await db.execute(
    'SELECT * FROM checkins WHERE user_id = ? AND checkin_date = CURDATE()',
    [userId]
  );
  const checkedInToday = todayRows.length > 0;

  const [last7Rows] = await db.execute(
    'SELECT * FROM checkins WHERE user_id = ? AND checkin_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
    [userId]
  );

  const [userRows] = await db.execute(
    'SELECT height_cm FROM users WHERE id = ?',
    [userId]
  );
  const heightCm = userRows[0]?.height_cm || null;

  const [weightRows] = await db.execute(
    'SELECT weight FROM progress_logs WHERE user_id = ? ORDER BY log_date DESC, id DESC LIMIT 1',
    [userId]
  );
  const latestWeight = weightRows[0]?.weight || null;

  let bmiSummary = 'not available (no height/weight logged yet)';
  if (heightCm && latestWeight) {
    const bmi = calculateBMI(parseFloat(latestWeight), heightCm);
    const { category } = getBMICategory(bmi);
    bmiSummary = `${bmi} (${category})`;
  }

  const [penaltyRows] = await db.execute(
    `SELECT * FROM penalties WHERE user_id = ? AND applied_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
    [userId]
  );

  return {
    currentStreak: streak.current_streak,
    longestStreak: streak.longest_streak,
    totalPoints: streak.total_points,
    checkedInToday,
    daysActiveLast7: last7Rows.length,
    bmiSummary,
    penaltiesLast30Days: penaltyRows.length,
  };
}

function buildSystemPrompt(context) {
  return `You are the built-in coach for StayFit, a weight-loss accountability app. You're warm and encouraging, but always grounded in the user's real data — never generic motivational fluff. Reference their actual numbers naturally in your replies. Keep responses conversational and fairly short (2-4 sentences typically, longer only if they ask for a detailed plan). Never give specific medical, diet, or exercise prescriptions (calorie targets, workout plans, medication advice) — you're an accountability coach, not a doctor; if asked for that kind of specific guidance, gently suggest a professional and pivot back to consistency/motivation.

Here is the user's current data:
- Current streak: ${context.currentStreak} days
- Longest streak ever: ${context.longestStreak} days
- Total points: ${context.totalPoints}
- Checked in today: ${context.checkedInToday ? 'Yes' : 'Not yet'}
- Active days in the last 7: ${context.daysActiveLast7} out of 7
- Current BMI: ${context.bmiSummary}
- Penalties in the last 30 days: ${context.penaltiesLast30Days}

Use this data to make your responses feel personal and specific, not generic.`;
}

async function sendCoachMessage(req, res) {
  const userId = req.user.userId;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Please enter a message' });
  }

  try {
    await db.execute(
      'INSERT INTO coach_messages (user_id, role, content) VALUES (?, ?, ?)',
      [userId, 'user', message]
    );

    const [historyRows] = await db.query(
      'SELECT role, content FROM coach_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, MAX_HISTORY_MESSAGES]
    );

    const conversationHistory = historyRows.reverse().map(row => ({
      role: row.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: row.content }],
    }));

    const context = await getUserContext(userId);
    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${COACH_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: conversationHistory,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, JSON.stringify(errorBody));
      return res.status(502).json({ message: 'Coach is temporarily unavailable. Please try again.' });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't generate a response that time.";

    await db.execute(
      'INSERT INTO coach_messages (user_id, role, content) VALUES (?, ?, ?)',
      [userId, 'assistant', replyText]
    );

    res.status(200).json({ reply: replyText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error talking to coach' });
  }
}

async function getCoachHistory(req, res) {
  const userId = req.user.userId;

  try {
    const [rows] = await db.execute(
      'SELECT id, role, content, created_at FROM coach_messages WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );
    res.status(200).json({ messages: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching coach history' });
  }
}

module.exports = { sendCoachMessage, getCoachHistory };