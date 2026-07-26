import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import {
  Plus, Activity, Dumbbell, Apple, Droplet, Footprints,
  CalendarX, AlertTriangle, PartyPopper
} from 'lucide-react';
import ProgressTimeline from '../components/ProgressTimeline';
import ProgressPhotos from '../components/ProgressPhotos';
import CountUp from '../components/CountUp';
import { displayWeight, toStorageKg, unitLabel } from '../utils/units';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const bmiSolidStyles = {
  blue:   { bg: '#185FA5', tint: '#B5D4F4' },
  green:  { bg: '#0F6E56', tint: '#9FE1CB' },
  orange: { bg: '#B45309', tint: '#FDE7CC' },
  red:    { bg: '#B91C1C', tint: '#FCD9D9' },
  gray:   { bg: '#4B5563', tint: '#E5E7EB' },
};

const goals = [
  { key: 'workout_done', icon: Dumbbell, label: 'Workout' },
  { key: 'diet_followed', icon: Apple, label: 'Diet' },
  { key: 'water_intake_done', icon: Droplet, label: 'Water' },
  { key: 'steps_goal_done', icon: Footprints, label: 'Steps' },
];

const TABS = [
  { key: 'weight', label: 'Weight & BMI' },
  { key: 'checkins', label: 'Check-in History' },
  { key: 'penalties', label: 'Penalties' },
];

function formatCheckinDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

// 'applied_at' is when the penalty was logged (the day AFTER the miss),
// not the day that was actually missed. This converts it back so the
// UI shows the day the user actually skipped.
function formatMissedDate(appliedAtString) {
  const appliedDate = new Date(appliedAtString);
  const missedDate = new Date(appliedDate);
  missedDate.setDate(appliedDate.getDate() - 1);

  return missedDate.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function Progress() {
  const [activeTab, setActiveTab] = useState('weight');

  // Weight & BMI tab
  const [history, setHistory] = useState([]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [bmi, setBmi] = useState(null);
  const [unit, setUnit] = useState('kg');

  // Check-in History tab
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [checkinLoading, setCheckinLoading] = useState(true);

  // Penalties tab
  const [penalties, setPenalties] = useState([]);
  const [penaltiesLoading, setPenaltiesLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      await Promise.all([loadHistory(), loadBMI(), loadUnitPreference()]);
      setInitialLoading(false);
    }
    loadInitial();
    loadCheckinHistory();
    loadPenalties();
  }, []);

  async function loadUnitPreference() {
    try {
      const res = await api.get('/auth/profile');
      setUnit(res.data.user?.unit_preference || 'kg');
    } catch (err) {
      console.error("Error loading unit preference:", err);
    }
  }

  async function loadHistory() {
    try {
      const res = await api.get('/progress/history');
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }

  async function loadBMI() {
    try {
      const res = await api.get('/progress/bmi');
      setBmi(res.data);
    } catch (err) {
      console.error("Error loading BMI:", err);
    }
  }

  async function loadCheckinHistory() {
    setCheckinLoading(true);
    try {
      const res = await api.get('/checkins/history');
      setCheckinHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckinLoading(false);
    }
  }

  async function loadPenalties() {
    setPenaltiesLoading(true);
    try {
      const res = await api.get('/penalties/my-history');
      setPenalties(res.data.penalties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPenaltiesLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!weight) return alert("Please enter weight");

    setLoading(true);
    try {
      await api.post('/progress/log-weight', {
        weight: toStorageKg(weight, unit),
        notes
      });
      setWeight('');
      setNotes('');
      loadHistory();
      loadBMI();
      alert('Weight logged successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save weight');
    } finally {
      setLoading(false);
    }
  }

  const chartData = [...history]
    .reverse()
    .map(item => ({
      date: new Date(item.log_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      weight: displayWeight(item.weight, unit)
    }));

  const bmiStyle = bmiSolidStyles[bmi?.color] || bmiSolidStyles.gray;
  const totalDeducted = penalties.reduce((sum, p) => sum + p.points_deducted, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracker</h1>
          <p className="text-gray-500">Weight trend, check-ins, and penalties — all in one place.</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== Weight & BMI tab ===== */}
        {activeTab === 'weight' && initialLoading && (
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-200 rounded-2xl h-28"></div>
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 bg-gray-200 rounded-3xl h-72"></div>
              <div className="lg:col-span-3 bg-gray-200 rounded-3xl h-72"></div>
            </div>
          </div>
        )}

        {activeTab === 'weight' && !initialLoading && (
          <motion.div key="weight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>

            {/* BMI Card */}
            <div className="mb-8">
              {bmi && !bmi.hasHeight && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 flex items-center gap-3">
                  <Activity size={20} />
                  <p className="text-sm font-medium">{bmi.message} — head to your Profile page to add it.</p>
                </div>
              )}
              {bmi && bmi.hasHeight && !bmi.hasWeight && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 flex items-center gap-3">
                  <Activity size={20} />
                  <p className="text-sm font-medium">{bmi.message}</p>
                </div>
              )}
              {bmi && bmi.hasHeight && bmi.hasWeight && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl p-6 flex items-center justify-between"
                  style={{ backgroundColor: bmiStyle.bg }}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Activity size={14} style={{ color: bmiStyle.tint }} />
                      <p className="text-xs font-medium tracking-wide" style={{ color: bmiStyle.tint }}>Your BMI</p>
                    </div>
                    <p className="text-4xl font-extrabold text-white">
                      <CountUp value={bmi.bmi} decimals={1} />
                    </p>
                    <p className="text-sm font-semibold mt-1" style={{ color: bmiStyle.tint }}>{bmi.category}</p>
                  </div>
                  <div className="text-right text-sm" style={{ color: bmiStyle.tint }}>
                    <p>Based on {displayWeight(bmi.weight, unit)} {unitLabel(unit)}</p>
                    <p>at {bmi.height_cm} cm</p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 border">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Plus size={26} /> Log Weight
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Weight ({unitLabel(unit)})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full border rounded-2xl px-5 py-4 text-lg"
                      placeholder={unit === 'lbs' ? '160' : '72.5'}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border rounded-2xl px-5 py-4 h-28"
                      placeholder="Optional notes..."
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold hover:bg-indigo-700"
                  >
                    {loading ? 'Saving...' : 'Save Weight'}
                  </motion.button>
                </form>
              </div>

              <div className="lg:col-span-3 bg-white rounded-3xl p-8 border h-fit">
                <h2 className="text-2xl font-semibold mb-6">Weight Trend</h2>
                {chartData.length > 1 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F6E56" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#0F6E56" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area
                          type="natural"
                          dataKey="weight"
                          stroke="#0F6E56"
                          strokeWidth={3}
                          fill="url(#weightGradient)"
                          dot={{ fill: '#0F6E56', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-400 border border-dashed rounded-2xl">
                    Log at least 2 weights to see your trend chart
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 bg-white rounded-3xl p-8 border">
              <h2 className="text-2xl font-semibold mb-6">All Entries</h2>
              <ProgressTimeline history={history} unit={unit} />
            </div>

            <ProgressPhotos />
          </motion.div>
        )}

        {/* ===== Check-in History tab ===== */}
        {activeTab === 'checkins' && (
          <motion.div key="checkins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            {checkinLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : checkinHistory.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <CalendarX className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-gray-500 text-sm">No check-ins yet. Get started on the Dashboard!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkinHistory.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900 text-sm mb-3">{formatCheckinDate(entry.checkin_date)}</p>
                    <div className="flex gap-2 flex-wrap">
                      {goals.map((goal) => {
                        const Icon = goal.icon;
                        const done = entry[goal.key];
                        return (
                          <div
                            key={goal.key}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                              done ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'
                            }`}
                          >
                            <Icon size={13} />
                            {goal.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ===== Penalties tab ===== */}
        {activeTab === 'penalties' && (
          <motion.div key="penalties" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            {penaltiesLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : penalties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <PartyPopper className="mx-auto text-emerald-400 mb-3" size={32} />
                <p className="font-semibold text-gray-900">No penalties yet!</p>
                <p className="text-gray-500 text-sm mt-1">Keep checking in daily to stay penalty-free.</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total points lost</p>
                    <p className="text-3xl font-extrabold text-red-600">-{totalDeducted}</p>
                  </div>
                  <div className="bg-red-50 text-red-500 w-12 h-12 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={22} />
                  </div>
                </div>

                <div className="space-y-2">
                  {penalties.map((penalty) => (
                    <div
                      key={penalty.id}
                      className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{penalty.reason}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatMissedDate(penalty.applied_at)}</p>
                      </div>
                      <span className="font-bold text-red-600 text-sm">-{penalty.points_deducted}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default Progress;