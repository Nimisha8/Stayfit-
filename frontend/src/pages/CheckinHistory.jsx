import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Dumbbell, Apple, Droplet, Footprints, CalendarX } from 'lucide-react';

function CheckinHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [penalties, setPenalties] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await api.get('/checkins/history');
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  const goals = [
    { key: 'workout_done', icon: Dumbbell, label: 'Workout' },
    { key: 'diet_followed', icon: Apple, label: 'Diet' },
    { key: 'water_intake_done', icon: Droplet, label: 'Water' },
    { key: 'steps_goal_done', icon: Footprints, label: 'Steps' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Check-in History</h1>
          <p className="text-gray-500 mt-1">Every day you've shown up.</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <CalendarX className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-gray-500 text-sm">No check-ins yet. Get started on the Dashboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="font-semibold text-gray-900 text-sm mb-3">{formatDate(entry.checkin_date)}</p>
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

      </div>
    </div>
  );
}

export default CheckinHistory;