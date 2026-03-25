import { useEffect, useRef, useState } from 'react';

const GRADIENTS = [
  'from-[#1c1c2b] to-[#2a2a3d]',
  'from-copper to-gold-light',
  'from-[#2d7a4f] to-[#3d9963]',
  'from-[#4a3f5c] to-[#6b5d85]',
];

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf;
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(start + diff * eased);
      setValue(current);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        prev.current = target;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export default function StatCard({ title, value, icon: Icon, index = 0 }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0);
  const displayValue = typeof value === 'number' ? animatedValue : value;

  return (
    <div className="relative bg-card rounded-xl sm:rounded-2xl border border-border p-3 sm:p-5 max-lg:landscape:p-2.5 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden card-hover stat-card-glow stat-icon-float">
      <div className={`absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r ${gradient} opacity-80`} />
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold text-text-light uppercase tracking-wider truncate">{title}</p>
          <p className="text-xl sm:text-3xl max-lg:landscape:text-lg font-extrabold mt-0.5 sm:mt-1.5 text-primary tabular-nums stat-value-glow">{displayValue}</p>
        </div>
        <div className={`stat-icon-target w-9 h-9 sm:w-12 sm:h-12 max-lg:landscape:w-8 max-lg:landscape:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
        </div>
      </div>
    </div>
  );
}
