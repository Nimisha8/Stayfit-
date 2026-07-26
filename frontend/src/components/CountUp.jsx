import { useState, useEffect, useRef } from 'react';

// Animates a number counting up from 0 to its target value whenever it mounts/changes.
// `decimals` lets callers show e.g. BMI (23.4) instead of always rounding to a whole number.
function CountUp({ value, duration = 900, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString());

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration, decimals]);

  return <>{display}</>;
}

export default CountUp;