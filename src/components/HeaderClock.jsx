import { useEffect, useRef, memo } from 'react';
import { Clock } from 'lucide-react';

const TIME_OPTS = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
const DATE_OPTS = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };

export default memo(function HeaderClock() {
  const timeRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (timeRef.current) timeRef.current.textContent = now.toLocaleTimeString('fr-FR', TIME_OPTS);
      if (dateRef.current) dateRef.current.textContent = now.toLocaleDateString('fr-FR', DATE_OPTS);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="clock-premium flex items-center gap-2.5 px-4 py-2 rounded-xl shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(184,134,11,0.15))',
        border: '1px solid rgba(212,175,55,0.35)',
        boxShadow: '0 0 12px rgba(212,175,55,0.15)',
      }}
    >
      <Clock className="w-4 h-4 text-copper-light" />
      <div className="text-right leading-tight">
        <p ref={timeRef} className="text-[13px] font-bold tabular-nums text-copper-light" />
        <p ref={dateRef} className="text-[10px] text-text-muted dark:text-white/70 font-medium capitalize hidden sm:block" />
      </div>
    </div>
  );
});
