import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import CountUp from '../components/CountUp';
import WeeklyConsistency from '../components/WeeklyConsistency';
import MonthlySummary from '../components/MonthlySummary';
import {
  Dumbbell,
  Apple,
  Droplet,
  Footprints,
  CheckCircle2,
  Trophy,
  Star,
  Flame,
  Check,
} from 'lucide-react';

function Dashboard() {
  const [streak, setStreak] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [penalties, setPenalties] = useState([]);
const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [workoutDone, setWorkoutDone] = useState(false);
  const [dietFollowed, setDietFollowed] = useState(false);
  const [waterDone, setWaterDone] = useState(false);
  const [stepsDone, setStepsDone] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [streakRes, todayRes, historyRes, penaltiesRes] = await Promise.all([
        api.get('/checkins/streak'),
        api.get('/checkins/today'),
        api.get('/checkins/history'),
        api.get('/penalties/my-history'),
      ]);
      setStreak(streakRes.data);
      setTodayCheckin(todayRes.data);
      setCheckinHistory(historyRes.data.history || []);
      setPenalties(penaltiesRes.data.penalties || []);
      setLoadError(false);
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckinSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/checkins', {
        workout_done: workoutDone,
        diet_followed: dietFollowed,
        water_intake_done: waterDone,
        steps_goal_done: stepsDone,
      });
      await loadDashboardData();

      // Celebration moment — fired only on a successful submit, using the
      // same green-family palette as the stat cards so it feels "on brand"
      // rather than a generic confetti effect.
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B6D11', '#0F6E56', '#085041', '#97C459', '#5DCAA5'],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const checkinItems = [
    { key: 'workout', label: 'Workout', sub: 'Completed today\'s session', icon: Dumbbell, checked: workoutDone, set: setWorkoutDone, color: 'text-orange-600 bg-orange-50' },
    { key: 'diet', label: 'Diet', sub: 'Followed your meal plan', icon: Apple, checked: dietFollowed, set: setDietFollowed, color: 'text-red-600 bg-red-50' },
    { key: 'water', label: 'Water Intake', sub: 'Hit your hydration goal', icon: Droplet, checked: waterDone, set: setWaterDone, color: 'text-blue-600 bg-blue-50' },
    { key: 'steps', label: 'Steps', sub: 'Reached your step goal', icon: Footprints, checked: stepsDone, set: setStepsDone, color: 'text-emerald-600 bg-emerald-50' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-9 bg-gray-200 rounded-lg w-64 mb-8"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl h-28"></div>
            <div className="bg-white rounded-2xl h-28"></div>
            <div className="bg-white rounded-2xl h-28"></div>
          </div>
          <div className="bg-white rounded-2xl h-64 mb-6"></div>
          <div className="bg-white rounded-2xl h-64"></div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-lg font-bold text-gray-900 mb-2">Couldn't load your dashboard</p>
          <p className="text-gray-500 text-sm mb-6">Check your connection and try again.</p>
          <button
            onClick={() => { setLoading(true); loadDashboardData(); }}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1">Here's your progress at a glance.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#3B6D11' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Flame size={14} style={{ color: '#C0DD97' }} />
              <p className="text-xs font-medium tracking-wide" style={{ color: '#C0DD97' }}>Current Streak</p>
            </div>
            <p className="text-3xl font-extrabold text-white">
              <CountUp value={streak.current_streak} />
              <span className="text-base font-medium ml-1" style={{ color: '#97C459' }}>days</span>
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#0F6E56' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Trophy size={14} style={{ color: '#9FE1CB' }} />
              <p className="text-xs font-medium tracking-wide" style={{ color: '#9FE1CB' }}>Longest Streak</p>
            </div>
            <p className="text-3xl font-extrabold text-white">
              <CountUp value={streak.longest_streak} />
              <span className="text-base font-medium ml-1" style={{ color: '#5DCAA5' }}>days</span>
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#085041' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Star size={14} style={{ color: '#9FE1CB' }} />
              <p className="text-xs font-medium tracking-wide" style={{ color: '#9FE1CB' }}>Total Points</p>
            </div>
            <p className="text-3xl font-extrabold text-white">
              <CountUp value={streak.total_points} />
            </p>
          </motion.div>
        </div>

        {/* Check-in card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          {todayCheckin.checkedIn ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center py-8"
            >
              <div className="bg-emerald-50 text-emerald-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">You're checked in for today</h2>
              <p className="text-gray-500 text-sm mt-1">Come back tomorrow to keep your streak alive.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleCheckinSubmit}>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Today's Check-in</h2>
              <p className="text-gray-500 text-sm mb-5">Mark what you completed today.</p>

              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {checkinItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.label
                      key={item.key}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        item.checked ? 'border-emerald-500 bg-emerald-50/60' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.set(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.sub}</p>
                      </div>

                      {item.checked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute top-2.5 right-2.5 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <Check size={12} strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.label>
                  );
                })}
              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Check-in'}
              </motion.button>
            </form>
          )}
        </div>

        {/* Weekly consistency chart */}
        <WeeklyConsistency history={checkinHistory} />

        <div className="mt-6">
          <MonthlySummary history={checkinHistory} penalties={penalties} />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;