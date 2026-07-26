import { Calendar, Flame, AlertTriangle } from 'lucide-react';

const METRIC_LABELS = {
  workout_done: 'Workout',
  diet_followed: 'Diet',
  water_intake_done: 'Water',
  steps_goal_done: 'Steps',
};

function buildMonthlyStats(history, penalties) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const daysElapsed = now.getDate(); // e.g. 21 if today is the 21st

  const thisMonthCheckins = history.filter((row) => {
    const d = new Date(row.checkin_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const daysCheckedIn = thisMonthCheckins.length;
  const completionRate = daysElapsed > 0
    ? Math.round((daysCheckedIn / daysElapsed) * 100)
    : 0;

  // Tally how many times each metric was true, to find the strongest habit
  const metricCounts = { workout_done: 0, diet_followed: 0, water_intake_done: 0, steps_goal_done: 0 };
  thisMonthCheckins.forEach((row) => {
    Object.keys(metricCounts).forEach((key) => {
      if (row[key]) metricCounts[key] += 1;
    });
  });

  let bestHabit = null;
  let bestCount = 0;
  Object.entries(metricCounts).forEach(([key, count]) => {
    if (count > bestCount) {
      bestCount = count;
      bestHabit = key;
    }
  });

  const thisMonthPenalties = penalties.filter((p) => {
    const d = new Date(p.applied_at);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  return {
    daysCheckedIn,
    daysElapsed,
    completionRate,
    bestHabitLabel: bestHabit ? METRIC_LABELS[bestHabit] : null,
    bestCount,
    penaltyCount: thisMonthPenalties.length,
    monthName: now.toLocaleDateString('en-IN', { month: 'long' }),
  };
}

function MonthlySummary({ history, penalties }) {
  const stats = buildMonthlyStats(history, penalties);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">{stats.monthName} Summary</h2>
      <p className="text-gray-500 text-sm mb-5">How this month is going so far.</p>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50">
          <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
            <Calendar size={18} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.completionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats.daysCheckedIn} of {stats.daysElapsed} days</p>
        </div>

        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50">
          <div className="bg-emerald-50 text-emerald-600 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
            <Flame size={18} />
          </div>
          <p className="text-lg font-extrabold text-gray-900">
            {stats.bestHabitLabel || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.bestHabitLabel ? `Best habit (${stats.bestCount} days)` : 'Log a check-in to see this'}
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50">
          <div className="bg-red-50 text-red-600 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
            <AlertTriangle size={18} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.penaltyCount}</p>
          <p className="text-xs text-gray-500 mt-1">Penalties this month</p>
        </div>
      </div>
    </div>
  );
}

export default MonthlySummary;