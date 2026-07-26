import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { AlertTriangle, PartyPopper } from 'lucide-react';

function PenaltyHistory() {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPenalties();
  }, []);

  async function loadPenalties() {
    setLoading(true);
    try {
      const res = await api.get('/penalties/my-history');
      setPenalties(res.data.penalties);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // 'applied_at' is when the penalty was logged (the day AFTER the miss),
  // not the day that was actually missed. This converts it back so the
  // UI shows the day the user actually skipped, avoiding the confusing
  // "but I checked in today!" read of the raw applied_at date.
  function formatMissedDate(appliedAtString) {
    const appliedDate = new Date(appliedAtString);
    const missedDate = new Date(appliedDate);
    missedDate.setDate(appliedDate.getDate() - 1);

    return missedDate.toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  const totalDeducted = penalties.reduce((sum, p) => sum + p.points_deducted, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Penalty History</h1>
          <p className="text-gray-500 mt-1">Missed days and their impact on your points.</p>
        </div>

        {loading ? (
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

      </div>
    </div>
  );
}

export default PenaltyHistory;