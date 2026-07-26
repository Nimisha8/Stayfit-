import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import MonthlySummary from '../components/MonthlySummary';

const METRIC_CONFIG = [
  { key: 'workout_done', label: 'Workout', color: '#ea580c' },
  { key: 'diet_followed', label: 'Diet', color: '#dc2626' },
  { key: 'water_intake_done', label: 'Water', color: '#2563eb' },
  { key: 'steps_goal_done', label: 'Steps', color: '#059669' },
];

// Local (browser) date, formatted as YYYY-MM-DD — deliberately NOT using
// toISOString() here, so "today" matches the user's own calendar day
// rather than shifting based on UTC.
function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildLast7DaysData(history) {
  // checkin_date arrives from the API as an ISO string like "2026-07-21T00:00:00.000Z".
  // MySQL DATE columns have no time component, so the first 10 characters are always
  // the correct calendar date — slicing is safer here than re-parsing with `new Date()`.
  const byDate = {};
  history.forEach((row) => {
    const key = String(row.checkin_date).slice(0, 10);
    byDate[key] = row;
  });

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    const row = byDate[key];

    const entry = { dayLabel: d.toLocaleDateString('en-IN', { weekday: 'short' }) };
    METRIC_CONFIG.forEach(({ key: metricKey }) => {
      entry[metricKey] = row ? (row[metricKey] ? 1 : 0) : 0;
    });
    days.push(entry);
  }
  return days;
}

function WeeklyConsistency({ history }) {
  const data = buildLast7DaysData(history);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">This Week</h2>
      <p className="text-gray-500 text-sm mb-5">What you completed over the last 7 days.</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} domain={[0, 4]} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value, name) => [value ? 'Done' : 'Missed', name]} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="workout_done" name="Workout" stackId="a" fill="#ea580c" />
            <Bar dataKey="diet_followed" name="Diet" stackId="a" fill="#dc2626" />
            <Bar dataKey="water_intake_done" name="Water" stackId="a" fill="#2563eb" />
            <Bar dataKey="steps_goal_done" name="Steps" stackId="a" fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default WeeklyConsistency;