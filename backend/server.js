const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const penaltyRoutes = require('./routes/penaltyRoutes');
const cron = require('node-cron');
const { runDailyPenaltyCheck } = require('./controllers/penaltyController');
// Runs automatically every day at 12:05 AM server time.
// The 5-minute buffer after midnight avoids any edge-case timing
// issues with "yesterday" calculations right at the stroke of midnight.
cron.schedule('5 0 * * *', async () => {
  console.log('Running scheduled daily penalty check...');
  try {
    const count = await runDailyPenaltyCheck();
    console.log(`Scheduled penalty check complete. ${count} user(s) penalized.`);
  } catch (err) {
    console.error('Scheduled penalty check failed:', err);
  }
});
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/penalties', penaltyRoutes);

app.get('/', (req, res) => {
  res.send('Backend is alive! 🎉');
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Database connected!', result: rows[0].result });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// Plug in our auth routes, all starting with /api/auth
app.use('/api/auth', authRoutes);
const groupRoutes = require('./routes/groupRoutes');
app.use('/api/groups', groupRoutes);
const checkinRoutes = require('./routes/checkinRoutes');
app.use('/api/checkins', checkinRoutes);
// New Progress Routes
const progressRoutes = require('./routes/progressRoutes');
app.use('/api/progress', progressRoutes);
const coachRoutes = require('./routes/coachRoutes');
app.use('/api/coach', coachRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});