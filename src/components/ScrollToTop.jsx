import { useEffect, useState } from 'react';
import { ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-4 right-0 z-[150] flex items-center transition-transform duration-300" style={{ transform: collapsed ? 'translateX(100%)' : 'translateX(0)' }}>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-1.5 pl-3 pr-4 py-1.5 rounded-l-lg text-[10px] font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, #b8860b, #d4af37)',
            color: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          <ChevronUp className="w-3.5 h-3.5" strokeWidth={2.5} />
          Haut
        </button>
      </div>
      {/* Toggle show/hide */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="fixed bottom-4 z-[151] w-6 h-6 flex items-center justify-center rounded-l-md transition-all duration-300 hover:brightness-125"
        style={{
          right: collapsed ? 0 : '4.2rem',
          background: 'rgba(40,40,50,0.8)',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        {collapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </>
  );
}
