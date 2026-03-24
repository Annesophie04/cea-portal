import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const AUTO_MS = 6500;

/**
 * Carrousel lecture seule : les images viennent de welcomeGallery.js (code),
 * pas d’une API ni d’un formulaire.
 */
export default function WelcomeGalleryCarousel({ images }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const len = images.length;
  const go = useCallback(
    (delta) => {
      if (len <= 1) return;
      setIndex((i) => (i + delta + len) % len);
    },
    [len]
  );

  useEffect(() => {
    if (len <= 1 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % len), AUTO_MS);
    return () => clearInterval(t);
  }, [len, paused]);

  if (!len) return null;

  return (
    <div
      className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border bg-card/40 shadow-xl shadow-black/10 dark:shadow-black/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[min(52vh,420px)] bg-surface-alt dark:bg-black/40">
        {images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            draggable={false}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[900ms] ease-out ${
              i === index ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/45 via-transparent to-black/15 pointer-events-none" aria-hidden />

        {len > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === index ? 'w-7 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="absolute top-3 right-3 z-[3] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/55 backdrop-blur-sm border border-white/15 text-white text-[11px] font-semibold uppercase tracking-wide cursor-pointer"
              aria-pressed={paused}
              aria-label={paused ? 'Reprendre le défilement' : 'Mettre en pause'}
            >
              {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{paused ? 'Lecture' : 'Pause'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
