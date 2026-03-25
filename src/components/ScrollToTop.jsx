import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-[150] group"
      aria-label="Remonter en haut"
    >
      {/* Halo animé */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-copper/40 to-gold/30 blur-md group-hover:blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500 scale-110 group-hover:scale-125" />

      {/* Cercle principal */}
      <span
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 group-active:scale-95 overflow-hidden"
        style={{
          background: 'conic-gradient(from 45deg, #b8860b, #d4af37, #e8d48b, #d4af37, #b8860b)',
          boxShadow: '0 6px 24px rgba(184,134,11,0.4), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 2px rgba(212,175,55,0.2)',
        }}
      >
        {/* Inner circle */}
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0c1520] dark:bg-[#0a0a14] shadow-inner">
          <ArrowUp className="w-5 h-5 text-gold-light group-hover:text-white transition-colors" strokeWidth={2.5} />
        </span>
      </span>
    </button>
  );
}
