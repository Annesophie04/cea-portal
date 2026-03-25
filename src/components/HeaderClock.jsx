import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function HeaderClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2 rounded-xl shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(184,134,11,0.15))',
        border: '1px solid rgba(212,175,55,0.35)',
        boxShadow: '0 0 12px rgba(212,175,55,0.15)',
      }}
    >
      <Clock className="w-4 h-4 text-copper-light" />
      <div className="text-right leading-tight">
        <p className="text-[13px] font-bold tabular-nums text-copper-light">{time}</p>
        <p className="text-[10px] text-white/70 font-medium capitalize hidden sm:block">{date}</p>
      </div>
    </div>
  );
}
