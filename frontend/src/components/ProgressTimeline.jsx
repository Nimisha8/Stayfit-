import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { displayWeight, unitLabel } from '../utils/units';

// Groups a DESC-ordered list of {log_date, weight, notes} into
// { "July 2026": [...], "June 2026": [...] } while keeping delta info per entry.
// Delta is always calculated from raw kg values — only the *display* of both
// the weight and the delta gets converted, so the math stays accurate no
// matter which unit the user has chosen to view.
function buildTimelineGroups(history) {
  const groups = [];
  let currentLabel = null;
  let currentGroup = null;

  history.forEach((entry, index) => {
    const date = new Date(entry.log_date);
    const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const olderEntry = history[index + 1];
    const delta = olderEntry ? parseFloat(entry.weight) - parseFloat(olderEntry.weight) : null;

    if (label !== currentLabel) {
      currentLabel = label;
      currentGroup = { label, entries: [] };
      groups.push(currentGroup);
    }

    currentGroup.entries.push({ ...entry, delta });
  });

  return groups;
}

function DeltaBadge({ delta, unit }) {
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
        <Minus size={12} /> First entry
      </span>
    );
  }

  if (Math.abs(delta) < 0.05) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
        <Minus size={12} /> No change
      </span>
    );
  }

  const displayedMagnitude = displayWeight(Math.abs(delta), unit);

  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
        <TrendingDown size={12} /> {displayedMagnitude} {unitLabel(unit)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
      <TrendingUp size={12} /> {displayedMagnitude} {unitLabel(unit)}
    </span>
  );
}

function ProgressTimeline({ history, unit = 'kg' }) {
  if (history.length === 0) {
    return <p className="text-center text-gray-500 py-12">No entries yet. Start logging!</p>;
  }

  const groups = buildTimelineGroups(history);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            {group.label}
          </h3>
          <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
            {group.entries.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                className="relative"
              >
                <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-100" />
                <div className="flex justify-between items-start bg-gray-50 rounded-2xl p-5">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(item.log_date).toLocaleDateString('en-IN', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                    </p>
                    {item.notes && <p className="text-sm text-gray-500 mt-1">{item.notes}</p>}
                    <div className="mt-2"><DeltaBadge delta={item.delta} unit={unit} /></div>
                  </div>
                  <p className="text-3xl font-bold text-indigo-600 whitespace-nowrap">
                    {displayWeight(item.weight, unit)} {unitLabel(unit)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProgressTimeline;